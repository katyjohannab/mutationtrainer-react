import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { saveCardPatch } from "./adminApi.js";
import { contentPaths, restoreSourceRevision } from "./contentRepository.js";
import { createAppServer } from "./httpServer.js";
import { revisionOf } from "./validateContent.js";
import { requireValidSource } from "../src/services/cardFormat.js";
import { ALL_RUNTIME_DATA_FILES } from "../src/data/csvSources.js";

const roots = [], servers = [];
async function fixture() {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "treiglap-phase1-"));
  roots.push(rootDir);
  for (const source of ALL_RUNTIME_DATA_FILES) {
    const destination = path.join(rootDir, "public/data", source);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.copyFile(new URL(`../public/data/${source}`, import.meta.url), destination);
  }
  const source = "cards.tsv";
  const file = path.join(rootDir, "public/data", source);
  const raw = await fs.readFile(file, "utf8");
  return { rootDir, source, file, raw, rowIndex: 0, expectedCardId: requireValidSource(raw, source).cards[0].cardId, expectedSourceRevision: revisionOf(raw) };
}
async function listen(options) {
  const server = await createAppServer(options);
  servers.push(server);
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  return { server, url: `http://127.0.0.1:${server.address().port}${options.base}` };
}
async function close(server) { if (server.listening) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
afterEach(async () => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  for (const server of servers.splice(0)) await close(server);
  for (const root of roots.splice(0)) {
    if (!path.resolve(root).startsWith(path.join(os.tmpdir(), "treiglap-phase1-"))) throw new Error("Unsafe fixture cleanup.");
    await fs.rm(root, { recursive: true, force: true });
  }
});

describe("safe real-content editing", () => {
  it("changes just one intended cell, preserves literal quotes, and restores its verified backup", async () => {
    const f = await fixture();
    const saved = await saveCardPatch({ ...f, rawPatch: { translate: '"Cymru", ŵ — edited' } });
    const old = requireValidSource(f.raw, f.source);
    const next = requireValidSource(await fs.readFile(f.file, "utf8"), f.source);
    let differences = 0;
    next.rows.forEach((row, i) => old.headers.forEach(header => { if (row[header] !== old.rows[i][header]) differences++; }));
    expect(differences).toBe(1);
    expect(saved.updatedRow.translate).toBe('"Cymru", ŵ — edited');
    expect(saved.updatedRow.__sourceRevision).toBe(saved.sourceRevision);
    const restored = await restoreSourceRevision({ ...f, expectedSourceRevision: saved.sourceRevision, revision: f.expectedSourceRevision });
    expect(restored.sourceRevision).toBe(f.expectedSourceRevision);
    expect(await fs.readFile(f.file, "utf8")).toBe(f.raw);
    // Restoring itself has a backup, so the restoration can be undone.
    const { historyRoot } = contentPaths(f);
    expect(revisionOf(await fs.readFile(path.join(historyRoot, f.source, `${saved.sourceRevision}.source`), "utf8"))).toBe(saved.sourceRevision);
  });

  it("preserves source bytes on unchanged forms", async () => {
    const f = await fixture();
    const row = requireValidSource(f.raw, f.source).cards[0];
    const saved = await saveCardPatch({ ...f, rawPatch: { before: row.before, after: row.after, answer: row.answer, outcome: row.outcome, why: row.why } });
    expect(saved.changed).toBe(false);
    expect(await fs.readFile(f.file, "utf8")).toBe(f.raw);
  });

  it.each([{ answer: "" }, { outcome: "gath" }, { translate: "a\tb" }, { translate: "a\nb" }])("rejects invalid proposed content %j without writing", async rawPatch => {
    const f = await fixture();
    await expect(saveCardPatch({ ...f, rawPatch })).rejects.toMatchObject({ statusCode: 422 });
    expect(await fs.readFile(f.file, "utf8")).toBe(f.raw);
  });

  it("requires a revision and rejects stale and simultaneous saves", async () => {
    const f = await fixture();
    await expect(saveCardPatch({ ...f, expectedSourceRevision: undefined, rawPatch: { translate: "test" } })).rejects.toMatchObject({ statusCode: 428 });
    const results = await Promise.allSettled(["first", "second"].map(translate => saveCardPatch({ ...f, rawPatch: { translate } })));
    expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
    expect(results.find(result => result.status === "rejected").reason.statusCode).toBe(409);
    await expect(saveCardPatch({ ...f, rawPatch: { translate: "stale" } })).rejects.toMatchObject({ statusCode: 409 });
  });

  it.each(["backup", "rename"])("preserves the old source after %s failure and permits a later retry", async stage => {
    const f = await fixture();
    if (stage === "rename") vi.spyOn(fs, "rename").mockRejectedValueOnce(Object.assign(new Error("simulated rename failure"), { code: "EACCES" }));
    else vi.spyOn(fs, "writeFile").mockRejectedValueOnce(Object.assign(new Error("simulated backup failure"), { code: "ENOSPC" }));
    await expect(saveCardPatch({ ...f, rawPatch: { translate: "changed" } })).rejects.toMatchObject({ statusCode: 500 });
    expect(await fs.readFile(f.file, "utf8")).toBe(f.raw);
    vi.restoreAllMocks();
    expect((await saveCardPatch({ ...f, rawPatch: { translate: "retry" } })).changed).toBe(true);
  });

  it("rejects backups in publicly served directories", () => {
    expect(() => contentPaths({ rootDir: "/example", revisionDir: "/example/public/backups" })).toThrow(/outside/);
  });
});

describe("supported Node runtime", () => {
  it.each(["/", "/mutationtrainer-react/"])("serves canonical edits after save and restart at %s", async base => {
    const f = await fixture();
    // Exercise a persistent data location separate from the checkout and the built copy.
    const dataDir = path.join(f.rootDir, "persistent-data");
    await fs.rename(path.join(f.rootDir, "public/data"), dataDir);
    await fs.mkdir(path.join(f.rootDir, "dist/data"), { recursive: true });
    await fs.writeFile(path.join(f.rootDir, "dist/index.html"), "<!doctype html><title>Fixture</title>");
    await fs.writeFile(path.join(f.rootDir, "dist/data/cards.tsv"), "stale built copy");
    vi.stubEnv("WM_ADMIN_PASSWORD", "isolated-fixture-password");
    const options = { rootDir: f.rootDir, dataDir, base };
    const { server, url } = await listen(options);
    expect((await fetch(url)).status).toBe(200);
    expect((await fetch(`${url}data/unknown.csv`)).status).toBe(404);
    expect((await fetch(`${url}.content-revisions/cards.tsv/anything`)).status).toBe(404);
    const before = await fetch(`${url}data/cards.tsv`);
    expect(await before.text()).toBe(f.raw);
    expect(before.headers.get("cache-control")).toBe("no-store");
    const login = await fetch(`${url}api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: "isolated-fixture-password" }) });
    expect(login.status).toBe(200);
    const cookie = login.headers.get("set-cookie").split(";")[0];
    const save = await fetch(`${url}api/admin/save-card`, { method: "POST", headers: { "Content-Type": "application/json", cookie }, body: JSON.stringify({ source: f.source, rowIndex: f.rowIndex, expectedCardId: f.expectedCardId, expectedSourceRevision: f.expectedSourceRevision, patch: { translate: "persisted Welsh ŵ" } }) });
    const saved = await save.json();
    expect(save.status, JSON.stringify(saved)).toBe(200);
    const fresh = await fetch(`${url}data/cards.tsv`); // no admin cookie
    expect(requireValidSource(await fresh.text(), f.source).cards[0].translate).toBe("persisted Welsh ŵ");
    expect(fresh.headers.get("etag")).toBe(`"${saved.sourceRevision}"`);
    await close(server);
    const restarted = await listen(options);
    expect(requireValidSource(await (await fetch(`${restarted.url}data/cards.tsv`)).text(), f.source).cards[0].translate).toBe("persisted Welsh ŵ");
  });
});

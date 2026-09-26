import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { ALL_RUNTIME_DATA_FILES } from "../src/data/csvSources.js";
import { requireValidSource } from "../src/services/cardFormat.js";
import { revisionOf } from "./validateContent.js";

export function contentPaths({ rootDir = process.cwd(), dataDir, revisionDir } = {}) {
  const dataRoot = path.resolve(dataDir || process.env.WM_DATA_DIR || path.join(rootDir, "public/data"));
  const historyRoot = path.resolve(revisionDir || process.env.WM_REVISION_DIR || path.join(rootDir, ".content-revisions"));
  // Revision history must never be part of the public data tree or built assets.
  for (const publicRoot of [dataRoot, path.resolve(rootDir, "public"), path.resolve(rootDir, "dist")]) {
    const relative = path.relative(publicRoot, historyRoot);
    if (!relative || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))) {
      throw new Error("WM_REVISION_DIR must be outside public/, dist/ and WM_DATA_DIR.");
    }
  }
  return { dataRoot, historyRoot };
}

export function requireRegisteredSource(source) {
  if (!ALL_RUNTIME_DATA_FILES.includes(source)) throw Object.assign(new Error("Unsupported source file."), { statusCode: 400 });
  return source;
}

// A per-source filesystem lock covers multiple Node processes sharing the volume.
// Readers see either the old complete file or the new complete file.
export async function updateSource(options, transform) {
  const { source, expectedSourceRevision } = options;
  requireRegisteredSource(source);
  const { dataRoot, historyRoot } = contentPaths(options);
  const sourcePath = path.join(dataRoot, source);
  // Read once before creating a lock so missing sources produce a useful 404.
  await fs.access(sourcePath);
  if (!/^[a-f0-9]{64}$/.test(expectedSourceRevision || "")) throw Object.assign(new Error("Source revision is required. Reload before saving."), { statusCode: 428 });
  const history = path.join(historyRoot, source);
  await fs.mkdir(history, { recursive: true });
  const lockPath = path.join(history, "write.lock");
  let lock;
  try { lock = await fs.open(lockPath, "wx"); }
  catch (error) {
    if (error.code === "EEXIST") throw Object.assign(new Error("Another save is in progress. Reload and try again."), { statusCode: 409 });
    throw error;
  }
  const temporary = `${sourcePath}.${crypto.randomUUID()}.tmp`;
  try {
    const raw = await fs.readFile(sourcePath, "utf8");
    const previousRevision = revisionOf(raw);
    if (previousRevision !== expectedSourceRevision) throw Object.assign(new Error("This source has changed since it was loaded. Reload before saving; your changes were not written."), { statusCode: 409 });
    const parsed = requireValidSource(raw, source);
    const output = await transform({ raw, parsed });
    const proposed = requireValidSource(output, source);
    // Editing and restoring must preserve identities and the source's card set.
    const oldIds = parsed.cards.map(card => card.cardId).sort();
    const newIds = proposed.cards.map(card => card.cardId).sort();
    if (JSON.stringify(oldIds) !== JSON.stringify(newIds)) throw Object.assign(new Error("Editing or restoring cannot add, remove or rename cards. Use the validated source-control workflow for identity changes."), { statusCode: 422 });
    const sourceRevision = revisionOf(output);
    if (sourceRevision === previousRevision) return { parsed: proposed, sourceRevision, previousRevision, changed: false };
    // Backups are immutable, content-addressed copies. Verify existing ones too.
    const backup = path.join(history, `${previousRevision}.source`);
    try { await fs.writeFile(backup, raw, { encoding: "utf8", flag: "wx" }); }
    catch (error) { if (error.code !== "EEXIST") throw error; }
    if (revisionOf(await fs.readFile(backup, "utf8")) !== previousRevision) throw new Error("Revision backup failed verification; source was not changed.");
    const mode = (await fs.stat(sourcePath)).mode;
    const staged = await fs.open(temporary, "wx", mode);
    try { await staged.writeFile(output, "utf8"); await staged.sync(); }
    finally { await staged.close(); }
    if (revisionOf(await fs.readFile(sourcePath, "utf8")) !== previousRevision) throw Object.assign(new Error("Source changed during save. Reload before trying again."), { statusCode: 409 });
    await fs.rename(temporary, sourcePath);
    return { parsed: proposed, sourceRevision, previousRevision, changed: true };
  } finally {
    await fs.rm(temporary, { force: true });
    await lock.close();
    await fs.rm(lockPath, { force: true });
  }
}

export async function restoreSourceRevision(options) {
  requireRegisteredSource(options.source);
  if (!/^[a-f0-9]{64}$/.test(options.revision || "")) throw new Error("A SHA-256 backup revision is required.");
  const { historyRoot } = contentPaths(options);
  const raw = await fs.readFile(path.join(historyRoot, options.source, `${options.revision}.source`), "utf8");
  if (revisionOf(raw) !== options.revision) throw new Error("Backup hash mismatch; refusing restore.");
  return updateSource(options, () => raw);
}

import { afterEach, describe, expect, it, vi } from "vitest";
import { loadCsvFromPublicData, loadManyCsvFiles, sourceRevision } from "./loadCsv.js";

const header = "Card ID,Base,Answer,Outcome,Sentence With Gap";
const valid = `${header}\ncard-1,cath,gath,SM,Mae [] yma.`;
function respond(text, ok = true, status = 200) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok, status, text: async () => text }));
}
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe("validated runtime loader", () => {
  it("normalizes authored answers and includes a stable source revision", async () => {
    respond(valid);
    expect(await loadCsvFromPublicData("sample.csv")).toEqual([expect.objectContaining({ cardId: "card-1", base: "cath", answer: "gath", outcome: "soft", before: "Mae", after: "yma.", __sourceRevision: await sourceRevision(valid) })]);
    expect(fetch).toHaveBeenCalledWith("/data/sample.csv", { cache: "no-store" });
  });
  it("parses literal TSV quotes and case-insensitive aliases", async () => {
    respond('card_seq\tbase\tTarget Word\tOutcomes (SM/NM/AM/NONE)\tSentence With Gap\ncard-2\tpen\tmhen\tNm\t"Fy [ ] i"');
    const rows = await loadCsvFromPublicData("sample.TSV");
    expect(rows[0]).toMatchObject({ cardId: "card-2", answer: "mhen", outcome: "nasal", before: '"Fy', after: 'i"' });
  });
  it("supports gap marker spacing and template prompts", async () => {
    respond(`${header}\ncard-1,cath,gath,sm,Mae [ ] yma.\ncard-2,cath,gath,sm,Mae [  ] yna.`);
    expect((await loadCsvFromPublicData("sample.csv")).map(row => row.before)).toEqual(["Mae", "Mae"]);
    respond("CardId,Base,Answer,Outcome,Template\nc1,pen,ben,sm,Dyma {answer} heddiw.");
    expect((await loadCsvFromPublicData("sample.csv"))[0]).toMatchObject({ before: "Dyma", after: "heddiw." });
  });
  it("does not turn broken or missing data into a valid empty deck", async () => {
    respond(valid, false, 404);
    await expect(loadCsvFromPublicData("missing.csv")).rejects.toThrow(/missing.csv.*404/);
    respond(valid.replace(",gath,", ",,"));
    await expect(loadCsvFromPublicData("bad.csv")).rejects.toThrow(/Missing answer/);
    respond(`${header}\ncard-1,cath,gath,sm,No marker`);
    await expect(loadCsvFromPublicData("bad.csv")).rejects.toThrow(/gap/);
  });
  it("fails the whole load when any source fails or IDs collide", async () => {
    respond(valid);
    await expect(loadManyCsvFiles(["one.csv", "two.csv"])).rejects.toThrow(/Duplicate ID/);
    vi.stubGlobal("fetch", vi.fn(async url => ({ ok: url.includes("one.csv"), status: 404, text: async () => valid })));
    await expect(loadManyCsvFiles(["one.csv", "two.csv"])).rejects.toThrow(/two.csv/);
  });
  it("hashes the original UTF-8 BOM bytes for editing", async () => {
    const withBom = `\uFEFF${valid}`;
    vi.stubGlobal("fetch", vi.fn(async () => new Response(withBom)));
    expect((await loadCsvFromPublicData("sample.csv"))[0].__sourceRevision).toBe(await sourceRevision(withBom));
  });
});

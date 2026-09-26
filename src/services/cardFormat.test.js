import fs from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { parseCardSource, requireValidSource, serializeCardSource, duplicateIdDiagnostics } from "./cardFormat.js";
import { ALL_RUNTIME_DATA_FILES } from "../data/csvSources.js";

const csv = "CardId,Base,Answer,Outcome,Before,After\nc1,cath,gath,SM,Dyma,heddiw.";
describe("canonical content contract", () => {
  it.each([
    ["field shift", csv.replace("Dyma", "Dyma,extra"), "parse"],
    ["unknown outcome", csv.replace(",SM,", ",unknown,"), "outcome"],
    ["missing answer", csv.replace(",gath,", ",,"), "required"],
    ["missing ID", csv.replace("c1,", ","), "required"],
    ["no prompt", csv.replace("Dyma,heddiw.", ","), "prompt"],
    ["unknown column", csv.replace("After", "Unexpected"), "header"],
    ["empty file", "", "empty"],
  ])("rejects %s with source and actionable diagnostics", (_, text, code) => {
    expect(parseCardSource(text, "sample.csv").errors).toEqual(expect.arrayContaining([expect.objectContaining({ source: "sample.csv", code })]));
    expect(() => requireValidSource(text, "sample.csv")).toThrow();
  });

  it("detects duplicates across sources, case insensitively", () => {
    const first = requireValidSource(csv, "one.csv").cards;
    const second = requireValidSource(csv.replace("c1,", "C1,"), "two.csv").cards;
    expect(duplicateIdDiagnostics([...first, ...second])[0]).toMatchObject({ source: "two.csv", cardId: "C1", code: "duplicate" });
  });

  it("round trips CSV multiline/quotes and literal TSV quotes without changing cell values", () => {
    const quoted = csv.replace("Dyma,heddiw.", '"Dyma, ""Cymru""\nŵ",heddiw.');
    expect(serializeCardSource(requireValidSource(quoted, "sample.csv"), "sample.csv", quoted)).toBe(quoted);
    const tsv = '\uFEFFCardId\tBase\tAnswer\tOutcome\tBefore\tAfter\r\nc1\tcath\tgath\tSM\t"Dyma, Cymru ŵ"\theddiw.\r\n';
    expect(serializeCardSource(requireValidSource(tsv, "sample.tsv"), "sample.tsv", tsv)).toBe(tsv);
    const parsed = requireValidSource(tsv, "sample.tsv");
    parsed.rows[0].Before = "contains\ttab";
    expect(() => serializeCardSource(parsed, "sample.tsv", tsv)).toThrow(/cannot contain tabs/);
  });

  it("retains all live cards and round trips every cell in each source", async () => {
    const cards = [];
    for (const source of ALL_RUNTIME_DATA_FILES) {
      const raw = await fs.readFile(new URL(`../../public/data/${source}`, import.meta.url), "utf8");
      const parsed = requireValidSource(raw, source);
      const reread = requireValidSource(serializeCardSource(parsed, source, raw), source);
      expect(reread.rows).toEqual(parsed.rows);
      cards.push(...parsed.cards);
    }
    expect(cards).toHaveLength(3499);
    expect(duplicateIdDiagnostics(cards)).toEqual([]);
    expect(cards.find(card => card.cardId === "U110064")).toMatchObject({ before: "Yn ôl y tystion, mae’r corff newydd yn", answer: "annibynnol", outcome: "none" });
  });
});

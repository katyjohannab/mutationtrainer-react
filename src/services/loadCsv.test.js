import { afterEach, describe, expect, it, vi } from "vitest";
import { loadCsvFromPublicData } from "./loadCsv";

describe("loadCsvFromPublicData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses CSV files with existing behavior", async () => {
    const csvText = [
      "Card ID,Base,Outcome",
      "card-1,cath,sm",
    ].join("\n");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(csvText),
      })
    );

    const rows = await loadCsvFromPublicData("cards.csv");

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      cardId: "card-1",
      base: "cath",
      outcome: "soft",
      answer: "gath",
      __source: "cards.csv",
    });
  });

  it("parses TSV files into multiple fields", async () => {
    const tsvText = [
      "Card ID\tBase\tOutcome",
      "card-2\tpen\tnm",
    ].join("\n");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(tsvText),
      })
    );

    const rows = await loadCsvFromPublicData("unit-data.TSV");

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      cardId: "card-2",
      base: "pen",
      outcome: "nasal",
      answer: "mhen",
      __source: "unit-data.TSV",
    });
    expect(rows[0]).not.toHaveProperty("cardid\tbase\toutcome");
  });

  it("keeps fallback cardId behavior", async () => {
    const csvText = [
      "Base,Outcome",
      "bara,sm",
    ].join("\n");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(csvText),
      })
    );

    const rows = await loadCsvFromPublicData("fallback.csv");

    expect(rows).toHaveLength(1);
    expect(rows[0].cardId).toBe("fallback-csv-r2");
    expect(rows[0]).toMatchObject({
      base: "bara",
      outcome: "soft",
      answer: "fara",
    });
  });

  it("normalizes canonicalized TSV headers and outcome shortcodes case-insensitively", async () => {
    const tsvText = [
      "Sentence With Gap\tSentence Eng\tTarget Word\tRule Cat\tWhy Eng\tOutcomes (SM/NM/AM/NONE)\tQA Status (SM/NM/AM/NONE)",
      "Dw i'n _____ nawr\tI am _____ now\tcath\tSubjectBoundary\tTriggers soft mutation\tAm\tNM",
    ].join("\n");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(tsvText),
      })
    );

    const rows = await loadCsvFromPublicData("canonicalized-headers.tsv");

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      sentenceWithGap: "Dw i'n _____ nawr",
      translateSent: "I am _____ now",
      answer: "cath",
      category: "SubjectBoundary",
      why: "Triggers soft mutation",
      outcome: "aspirate",
      qaStatus: "NM",
      __source: "canonicalized-headers.tsv",
    });
  });

  it("maps NONE outcome shortcode case-insensitively", async () => {
    const tsvText = [
      "Base\tOutcomes (SM/NM/AM/NONE)",
      "cath\tNoNe",
    ].join("\n");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(tsvText),
      })
    );

    const rows = await loadCsvFromPublicData("none-outcome.tsv");

    expect(rows).toHaveLength(1);
    expect(rows[0].outcome).toBe("none");
    expect(rows[0].answer).toBe("cath");
  });
});

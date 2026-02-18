import { describe, expect, it } from "vitest";
import { ALL_CSV_FILES, CSV_SOURCE_META, PROTECTED_MANUAL_CSV_FILES } from "./csvSources";

describe("csv runtime source lock", () => {
  it("keeps protected manual csv files present", () => {
    expect(PROTECTED_MANUAL_CSV_FILES).toEqual(["cards.csv", "prep.csv", "article-sylfaen.csv"]);
  });

  it("includes registered unit csv files", () => {
    expect(ALL_CSV_FILES).toContain("Uwch1/unit1.csv");
    expect(ALL_CSV_FILES).toContain("Uwch1/unit2.csv");
  });

  it("provides source metadata for registered unit csv files", () => {
    expect(CSV_SOURCE_META["Uwch1/unit1.csv"]).toMatchObject({
      sourceType: "dysgu-unit",
      course: "uwch",
      dialect: "south",
      unit: "1",
    });
  });
});

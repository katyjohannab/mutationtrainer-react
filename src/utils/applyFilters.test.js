import { describe, expect, it } from "vitest";
import { applyFilters } from "./applyFilters";

const rows = [
  {
    cardId: "1",
    __source: "cards.csv",
    course: "mynediad",
    level: "mynediad",
    dialect: "south",
    unit: "1",
    ruleId: "soft-prep-i",
    outcome: "soft",
    focus: "mutation",
    category: "Preposition",
    trigger: "i",
  },
  {
    cardId: "2",
    __source: "cards.csv",
    course: "mynediad",
    level: "mynediad",
    dialect: "north",
    unit: "1",
    ruleId: "none",
    outcome: "none",
    focus: "contrast-none",
    category: "Phrase",
    trigger: "Dw i'n",
  },
  {
    cardId: "3",
    __source: "prep.csv",
    category: "Article",
    outcome: "soft",
    trigger: "y",
    unit: "1",
  },
  {
    cardId: "4",
    __source: "Uwch1/unit1.csv",
    course: "uwch",
    level: "uwch",
    dialect: "south",
    unit: "1",
    category: "Preposition",
    outcome: "soft",
    trigger: "i",
  },
];

describe("applyFilters preset extensions", () => {
  it("filters by level and dialect", () => {
    const output = applyFilters(rows, {
      preset: { level: "mynediad", dialect: "south" },
      filters: { families: new Set(), categories: new Set() },
    });
    expect(output.map((x) => x.cardId)).toEqual(["1"]);
  });

  it("filters by ruleIds", () => {
    const output = applyFilters(rows, {
      preset: { ruleIds: ["soft-prep-i"] },
      filters: { families: new Set(), categories: new Set() },
    });
    expect(output.map((x) => x.cardId)).toEqual(["1"]);
  });

  it("filters by mutationFamilies", () => {
    const output = applyFilters(rows, {
      preset: { mutationFamilies: ["none"] },
      filters: { families: new Set(), categories: new Set() },
    });
    expect(output.map((x) => x.cardId)).toEqual(["2"]);
  });

  it("filters by focus", () => {
    const output = applyFilters(rows, {
      preset: { focus: ["contrast-none"] },
      filters: { families: new Set(), categories: new Set() },
    });
    expect(output.map((x) => x.cardId)).toEqual(["2"]);
  });

  it("filters a single dysgu unit via course preset criteria", () => {
    const output = applyFilters(rows, {
      preset: { course: "uwch", level: "uwch", dialect: "south", unit: 1 },
      filters: { families: new Set(), categories: new Set() },
    });
    expect(output.map((x) => x.cardId)).toEqual(["4"]);
  });

  it("filters by manual level badges", () => {
    const output = applyFilters(rows, {
      preset: null,
      filters: { families: new Set(), categories: new Set(), levels: new Set(["uwch"]) },
    });
    expect(output.map((x) => x.cardId)).toEqual(["4"]);
  });

  it("keeps general pool available when no preset is active", () => {
    const output = applyFilters(rows, {
      preset: null,
      filters: { families: new Set(), categories: new Set() },
    });
    expect(output.map((x) => x.cardId)).toEqual(["1", "2", "3", "4"]);
  });
});

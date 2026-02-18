import { describe, expect, it } from "vitest";
import { compileUnit, summarizeRules } from "./compile-lib.js";

function buildFixture() {
  const vocab = [
    {
      id: "mynediad-south-u1-v001",
      base: "car",
      en: "car",
      unit: 1,
      level: "mynediad",
      dialect: "south",
      type: "noun",
      evidenceRefs: [{ sourceId: "mynediad-de-v2-2023", page: 12, boxLabel: "unit-1-vocab-box" }],
    },
    {
      id: "mynediad-south-u1-v002",
      base: "pont",
      en: "bridge",
      unit: 1,
      level: "mynediad",
      dialect: "south",
      type: "noun",
      evidenceRefs: [{ sourceId: "mynediad-de-v2-2023", page: 12, boxLabel: "unit-1-vocab-box" }],
    },
  ];

  const patterns = [
    {
      id: "pat-u1-soft-i",
      course: "mynediad",
      unit: 1,
      name: "i + noun",
      focus: "mutation",
      templates: [{ cy: "i {noun}", en: "to {noun}", slot: "noun" }],
      mutation: "soft",
      ruleId: "soft-prep-i",
      constraints: { noun: { type: "noun" } },
      evidenceRefs: [{ sourceId: "mynediad-de-v2-2023", page: 13, boxLabel: "unit-1-pattern-box" }],
    },
    {
      id: "pat-u1-contrast",
      course: "mynediad",
      unit: 1,
      name: "contrastive none",
      focus: "contrast-none",
      templates: [{ cy: "gyda {noun}", en: "with {noun}", slot: "noun" }],
      mutation: "none",
      ruleId: "none",
      constraints: { noun: { type: "noun" } },
      evidenceRefs: [{ sourceId: "mynediad-de-v2-2023", page: 13, boxLabel: "unit-1-pattern-box" }],
      explanationOverride: {
        en: "Override EN",
        cy: "Override CY",
      },
    },
  ];

  return { vocab, patterns };
}

describe("compile-lib", () => {
  it("is deterministic for same input", () => {
    const fixture = buildFixture();
    const first = compileUnit({
      level: "mynediad",
      dialect: "south",
      unit: 1,
      vocab: fixture.vocab,
      patterns: fixture.patterns,
    });
    const second = compileUnit({
      level: "mynediad",
      dialect: "south",
      unit: 1,
      vocab: fixture.vocab,
      patterns: fixture.patterns,
    });

    expect(JSON.stringify(first.cards)).toBe(JSON.stringify(second.cards));
    expect(first.failures).toEqual([]);
    expect(second.failures).toEqual([]);
  });

  it("applies mutation correctly for mutation-focused pattern", () => {
    const fixture = buildFixture();
    const result = compileUnit({
      level: "mynediad",
      dialect: "south",
      unit: 1,
      vocab: fixture.vocab,
      patterns: fixture.patterns,
    });
    const card = result.cards.find((x) => x.patternId === "pat-u1-soft-i" && x.base === "car");
    expect(card.answer).toBe("gar");
    expect(card.mutation).toBe("soft");
    expect(card.why).toContain("Soft Mutation");
  });

  it("keeps base unchanged for contrast-none cards", () => {
    const fixture = buildFixture();
    const result = compileUnit({
      level: "mynediad",
      dialect: "south",
      unit: 1,
      vocab: fixture.vocab,
      patterns: fixture.patterns,
    });
    const card = result.cards.find((x) => x.patternId === "pat-u1-contrast" && x.base === "car");
    expect(card.answer).toBe("car");
    expect(card.mutation).toBe("none");
    expect(card.why).toBe("Override EN");
    expect(card.whyCym).toBe("Override CY");
  });

  it("fails when no vocab matches constraints", () => {
    const fixture = buildFixture();
    fixture.patterns[0].constraints = { noun: { type: "verbnoun" } };
    const result = compileUnit({
      level: "mynediad",
      dialect: "south",
      unit: 1,
      vocab: fixture.vocab,
      patterns: fixture.patterns,
    });
    expect(result.failures.join("\n")).toContain("has no vocab candidates");
  });

  it("ensures source refs are present on compiled cards", () => {
    const fixture = buildFixture();
    const result = compileUnit({
      level: "mynediad",
      dialect: "south",
      unit: 1,
      vocab: fixture.vocab,
      patterns: fixture.patterns,
    });
    expect(result.cards.every((card) => Array.isArray(card.sourceRefs) && card.sourceRefs.length > 0)).toBe(
      true
    );
  });

  it("sets qaStatus based on approval record", () => {
    const fixture = buildFixture();
    const seed = compileUnit({
      level: "mynediad",
      dialect: "south",
      unit: 1,
      vocab: fixture.vocab,
      patterns: fixture.patterns,
    });
    const targetId = seed.cards[0].cardId;
    const result = compileUnit({
      level: "mynediad",
      dialect: "south",
      unit: 1,
      vocab: fixture.vocab,
      patterns: fixture.patterns,
      approvalRecord: {
        status: "pending",
        approvedCardIds: [targetId],
        rejectedCardIds: [],
      },
    });
    const approvedCard = result.cards.find((card) => card.cardId === targetId);
    expect(approvedCard.qaStatus).toBe("approved");
  });

  it("contracts i/o + article boundaries at render frame level", () => {
    const vocab = [
      {
        id: "mynediad-south-u1-v101",
        base: "yr Eidal",
        en: "Italy",
        unit: 1,
        level: "mynediad",
        dialect: "south",
        type: "place",
        evidenceRefs: [{ sourceId: "mynediad-de-v2-2023", page: 12, boxLabel: "unit-1-vocab-box" }],
      },
    ];
    const patterns = [
      {
        id: "pat-u1-contract",
        course: "mynediad",
        unit: 1,
        name: "to the place",
        focus: "contrast-none",
        templates: [{ cy: "Rydw i'n mynd i {place}.", en: "I am going to {place}.", slot: "place" }],
        mutation: "none",
        ruleId: "none",
        constraints: { place: { type: "place" } },
        evidenceRefs: [{ sourceId: "mynediad-de-v2-2023", page: 13, boxLabel: "unit-1-pattern-box" }],
        explanationOverride: { en: "None", cy: "Dim" },
      },
    ];
    const result = compileUnit({
      level: "mynediad",
      dialect: "south",
      unit: 1,
      vocab,
      patterns,
    });
    const card = result.cards[0];
    expect(card.before).toContain("i'r ");
    expect(card.answer).toBe("Eidal");
  });

  it("derives a learner-facing fallback explanation for none-rule patterns without override", () => {
    const vocab = [
      {
        id: "mynediad-south-u1-v201",
        base: "da",
        en: "good",
        unit: 1,
        level: "mynediad",
        dialect: "south",
        type: "adj",
        evidenceRefs: [{ sourceId: "mynediad-de-v2-2023", page: 12, boxLabel: "unit-1-vocab-box" }],
      },
    ];
    const patterns = [
      {
        id: "pat-u1-none-fallback",
        course: "mynediad",
        unit: 1,
        name: "dw i'n + adj fallback",
        focus: "contrast-none",
        templates: [{ cy: "Dw i'n {adj}.", en: "I am {adj}.", slot: "adj" }],
        mutation: "none",
        ruleId: "none",
        constraints: { adj: { type: "adj" } },
        evidenceRefs: [{ sourceId: "mynediad-de-v2-2023", page: 13, boxLabel: "unit-1-pattern-box" }],
      },
    ];

    const result = compileUnit({
      level: "mynediad",
      dialect: "south",
      unit: 1,
      vocab,
      patterns,
    });

    expect(result.cards[0].why).toContain("adjective does not mutate");
  });

  it("summarizes rule usage for compiled cards", () => {
    const fixture = buildFixture();
    const result = compileUnit({
      level: "mynediad",
      dialect: "south",
      unit: 1,
      vocab: fixture.vocab,
      patterns: fixture.patterns,
    });

    const summary = summarizeRules(result.cards);
    const softRule = summary.find((row) => row.ruleId === "soft-prep-i");
    expect(softRule).toBeTruthy();
    expect(softRule.cardCount).toBeGreaterThan(0);
  });
});

import { describe, expect, it } from "vitest";
import {
  inferUnitMetaFromPath,
  validateUnitModuleExports,
} from "./content-schema.js";

const FILE_PATH = "src/content-gen/unit-data/mynediad/south/unit1.js";

function makeValidModule() {
  return {
    u1_vocab: [
      {
        id: "mynediad-south-u1-v001",
        base: "car",
        en: "car",
        unit: 1,
        level: "mynediad",
        dialect: "south",
        type: "noun",
        gender: "m",
        semanticClass: "object-transport",
        evidenceRefs: [
          { sourceId: "mynediad-de-v2-2023", page: 12, boxLabel: "unit-1-vocab-box" },
        ],
      },
    ],
    u1_patterns: [
      {
        id: "pat-u1-soft-i",
        course: "mynediad",
        unit: 1,
        name: "i + noun",
        focus: "mutation",
        templates: [{ cy: "i {noun}", en: "to {noun}", slot: "noun" }],
        mutation: "soft",
        ruleId: "soft-prep-i",
        constraints: {
          noun: { type: "noun" },
        },
        evidenceRefs: [
          { sourceId: "mynediad-de-v2-2023", page: 13, boxLabel: "unit-1-pattern-box" },
        ],
      },
    ],
  };
}

describe("content-schema", () => {
  it("infers unit metadata from file path", () => {
    expect(inferUnitMetaFromPath(FILE_PATH)).toEqual({
      level: "mynediad",
      dialect: "south",
      unit: 1,
    });
  });

  it("accepts valid module exports", () => {
    const result = validateUnitModuleExports(makeValidModule(), FILE_PATH);
    expect(result.errors).toEqual([]);
  });

  it("rejects missing required vocab fields", () => {
    const module = makeValidModule();
    delete module.u1_vocab[0].id;
    const result = validateUnitModuleExports(module, FILE_PATH);
    expect(result.errors.join("\n")).toContain("vocab[0].id");
  });

  it("rejects invalid pattern focus values", () => {
    const module = makeValidModule();
    module.u1_patterns[0].focus = "other";
    const result = validateUnitModuleExports(module, FILE_PATH);
    expect(result.errors.join("\n")).toContain("focus 'other' is invalid");
  });

  it("rejects contrast-none with mutation other than none", () => {
    const module = makeValidModule();
    module.u1_patterns[0].focus = "contrast-none";
    const result = validateUnitModuleExports(module, FILE_PATH);
    expect(result.errors.join("\n")).toContain("requires mutation 'none'");
  });

  it("requires provisional metadata for unknown semantic class", () => {
    const module = makeValidModule();
    module.u1_vocab[0].semanticClass = "culture.music";
    const result = validateUnitModuleExports(module, FILE_PATH);
    const text = result.errors.join("\n");
    expect(text).toContain("semanticClassStatus");
    expect(text).toContain("semanticClassNotes");
  });

  it("accepts unknown semantic class when marked provisional with notes", () => {
    const module = makeValidModule();
    module.u1_vocab[0].semanticClass = "culture.music";
    module.u1_vocab[0].semanticClassStatus = "provisional";
    module.u1_vocab[0].semanticClassNotes = "Needed for songs/chants in this unit.";
    const result = validateUnitModuleExports(module, FILE_PATH);
    expect(result.errors).toEqual([]);
  });

  it("accepts optional rule proposal export with valid schema", () => {
    const module = makeValidModule();
    module.u1_ruleProposals = [
      {
        id: "rule-prop-u1-01",
        proposedRuleId: "soft-prep-example",
        course: "mynediad",
        unit: 1,
        mutation: "soft",
        triggerContext: "Example trigger",
        en: "Example explanation",
        cy: "Esboniad enghreifftiol",
        rationale: "No existing rule id matched exactly.",
        evidenceRefs: [
          { sourceId: "mynediad-de-v2-2023", page: 13, boxLabel: "unit-1-pattern-box" },
        ],
        status: "proposed",
      },
    ];
    const result = validateUnitModuleExports(module, FILE_PATH);
    expect(result.errors).toEqual([]);
  });

  it("rejects uncontracted preposition+article forms in templates", () => {
    const module = makeValidModule();
    module.u1_patterns[0].templates[0].cy = "Rydw i'n mynd i yr {noun}.";
    const result = validateUnitModuleExports(module, FILE_PATH);
    expect(result.errors.join("\n")).toContain("uncontracted phrase");
  });

  it("rejects patterns whose slot constraints match no vocab in the same unit file", () => {
    const module = makeValidModule();
    module.u1_patterns[0].templates[0].slot = "person";
    module.u1_patterns[0].cy = "{person} dw i.";
    module.u1_patterns[0].constraints = {
      person: { type: "person", semanticClass: "person.name" },
    };
    const result = validateUnitModuleExports(module, FILE_PATH);
    expect(result.errors.join("\n")).toContain("zero matching vocab candidates");
  });

  it("requires explanationOverride when mutation is none and ruleId is none", () => {
    const module = makeValidModule();
    module.u1_patterns[0].focus = "contrast-none";
    module.u1_patterns[0].mutation = "none";
    module.u1_patterns[0].ruleId = "none";
    const result = validateUnitModuleExports(module, FILE_PATH);
    expect(result.errors.join("\n")).toContain("requires explanationOverride");
  });

  it("accepts none-* ruleId for none mutation without explanationOverride", () => {
    const module = makeValidModule();
    module.u1_patterns[0].focus = "contrast-none";
    module.u1_patterns[0].mutation = "none";
    module.u1_patterns[0].ruleId = "none-general-yn";
    const result = validateUnitModuleExports(module, FILE_PATH);
    expect(result.errors).toEqual([]);
  });
});

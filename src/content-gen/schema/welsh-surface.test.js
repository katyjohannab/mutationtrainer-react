import { describe, expect, it } from "vitest";
import { applyBoundaryContractions, findUncontractedPrepositionArticle } from "./welsh-surface.js";

describe("welsh-surface helpers", () => {
  it("detects uncontracted i y/yr and o y/yr forms", () => {
    const issues = findUncontractedPrepositionArticle("Rydw i'n mynd i yr Eidal ac o y dre.");
    expect(issues.length).toBe(2);
    expect(issues[0].phrase.toLowerCase()).toBe("i yr");
    expect(issues[1].phrase.toLowerCase()).toBe("o y");
  });

  it("applies i/o + article boundary contractions", () => {
    expect(applyBoundaryContractions("Rydw i'n mynd i ", "yr Eidal")).toEqual({
      before: "Rydw i'n mynd i'r ",
      answer: "Eidal",
    });
    expect(applyBoundaryContractions("Mae hi'n dod o ", "y dre")).toEqual({
      before: "Mae hi'n dod o'r ",
      answer: "dre",
    });
  });
});

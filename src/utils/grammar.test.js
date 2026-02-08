import { describe, it, expect } from "vitest";
import {
  mutateWord,
  applyMutation,
  applyCase,
  makeChoices,
  applyMutationSequence,
} from "./grammar";

describe("grammar.js utils", () => {
  describe("mutateWord", () => {
    it("handles soft mutation (SM)", () => {
      expect(mutateWord("cath", "soft")).toBe("gath");
      expect(mutateWord("tadol", "soft")).toBe("dadol");
      expect(mutateWord("potel", "soft")).toBe("botel");
      expect(mutateWord("bwrdd", "soft")).toBe("fwrdd");
      expect(mutateWord("desg", "soft")).toBe("ddesg");
      expect(mutateWord("gwlad", "soft")).toBe("wlad");
      expect(mutateWord("mam", "soft")).toBe("fam");
      expect(mutateWord("llaw", "soft")).toBe("law");
      expect(mutateWord("rhag", "soft")).toBe("rag");
    });

    it("handles nasal mutation (NM)", () => {
      expect(mutateWord("cath", "nasal")).toBe("nghath");
      expect(mutateWord("tadol", "nasal")).toBe("nhadol");
      expect(mutateWord("potel", "nasal")).toBe("mhotel");
      expect(mutateWord("bwrdd", "nasal")).toBe("mwrdd");
      expect(mutateWord("desg", "nasal")).toBe("nesg");
      expect(mutateWord("gwlad", "nasal")).toBe("ngwlad");
    });

    it("handles aspirate mutation (AM)", () => {
      expect(mutateWord("cath", "aspirate")).toBe("chath");
      expect(mutateWord("tadol", "aspirate")).toBe("thadol");
      expect(mutateWord("potel", "aspirate")).toBe("photel");
    });

    it("handles 'none' mutation", () => {
      expect(mutateWord("cath", "none")).toBe("cath");
    });

    it("leaves unmutatable words alone", () => {
      expect(mutateWord("afal", "soft")).toBe("afal");
      expect(mutateWord("zebra", "nasal")).toBe("zebra");
    });

    it("preserves capitalization (simple)", () => {
      expect(mutateWord("Cath", "soft")).toBe("Gath");
      expect(mutateWord("Pontypridd", "nasal")).toBe("Mhontypridd");
    });

    it("handles LL and RH capitalization edge cases in soft mutation", () => {
      expect(mutateWord("Llanelli", "soft")).toBe("Lanelli");
      expect(mutateWord("Rhyl", "soft")).toBe("Ryl");
    });
  });

  describe("applyMutation (phrase support)", () => {
    it("mutates only the first word", () => {
      expect(applyMutation("ci mawr", "soft")).toBe("gi mawr");
      expect(applyMutation("tŷ bach", "nasal")).toBe("nhŷ bach");
    });

    it("handles single words", () => {
      expect(applyMutation("ci", "soft")).toBe("gi");
    });

    it("handles capitalization in phrases", () => {
      expect(applyMutation("Caerdydd", "nasal")).toBe("Nghaerdydd");
    });
  });

  describe("applyMutationSequence", () => {
    it("applies multiple mutations in order", () => {
      // e.g. soft then nasal: p -> b -> m
      // pipeline: potel (soft)-> botel (nasal)-> motel
      // Wait, let's check code logic.
      // soft: p->b
      // nasal of b -> m
      // potel -> botel -> motel
      expect(applyMutationSequence("potel", ["soft", "nasal"])).toBe("motel");
    });
  });

  describe("applyCase", () => {
    it("matches casing", () => {
      expect(applyCase("Cat", "gat")).toBe("Gat");
      expect(applyCase("cat", "Gat")).toBe("Gat"); // implementation only checks original[0] upper
      expect(applyCase("CAT", "gat")).toBe("Gat"); // implementation only checks original[0]
      // Actually code says: if (original[0] === original[0].toUpperCase()) -> title case first letter.
    });
  });

  describe("makeChoices (Distractor Generation)", () => {
    const mockDeck = [
      { base: "ci", answer: "gi", id: "1" },
      { base: "ci", answer: "nghi", id: "2" }, // Real variant
      { base: "cath", answer: "gath", id: "3" },
    ];

    it("includes the correct answer", () => {
      const row = { base: "ci", answer: "gi" };
      const choices = makeChoices(row, [], { base: "ci" });
      expect(choices).toContain("gi");
    });

    it("uses real alternatives from the deck if available", () => {
      const row = { base: "ci", answer: "gi" };
      const choices = makeChoices(row, mockDeck, { base: "ci" });
      
      // Should find "nghi" from row #2
      expect(choices).toContain("nghi");
      expect(choices).toContain("gi");
      
      // Should NOT find "gath" (different base)
      expect(choices).not.toContain("gath");
    });

    it("generates artificial mutants if no real alternatives exist", () => {
      // "potel" isn't in deck. Should generate mutations like botel, mhotel, photel...
      const row = { base: "potel", answer: "potel" }; // none
      const choices = makeChoices(row, mockDeck, { base: "potel" });

      expect(choices.length).toBeGreaterThanOrEqual(2);
      // Soft of potel -> botel
      // Aspirate -> photel
      // Nasal -> mhotel
      
      const combined = choices.join(" ");
      expect(combined).toMatch(/botel|photel|mhotel/);
    });

    it("deduplicates choices", () => {
      const row = { base: "ci", answer: "gi" };
      const choices = makeChoices(row, [], { base: "ci" });
      const unique = new Set(choices);
      expect(unique.size).toBe(choices.length);
    });

    it("always returns 3 choices if possible", () => {
        // We guarantee logic attempts to fill up to 3 (correct + 2 distractors)
        const row = { base: "bwrdd", answer: "fwrdd" };
        const choices = makeChoices(row, [], { base: "bwrdd" });
        // fwrdd (correct)
        // mwrdd (nasal)
        // bwrdd (none/hard)
        // The generator fallback tries sequences.
        expect(choices.length).toBe(3);
    });
  });
});

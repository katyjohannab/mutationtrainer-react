import { describe, expect, it } from "vitest";
import { PRESET_DEFS, STARTER_PACK_ORDER } from "./presets";

describe("starter pack curation", () => {
  it("keeps starter pack order curated and excludes all-verified pack", () => {
    expect(STARTER_PACK_ORDER).not.toContain("starter-all-verified");
    expect(STARTER_PACK_ORDER.length).toBeGreaterThan(0);
  });

  it("contains only valid preset ids", () => {
    expect(
      STARTER_PACK_ORDER.every((id) => Object.prototype.hasOwnProperty.call(PRESET_DEFS, id))
    ).toBe(true);
  });
});

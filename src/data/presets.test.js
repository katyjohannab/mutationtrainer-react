import { describe, expect, it } from "vitest";
import { PACK_REGISTRY, PACK_REGISTRY_BY_ID } from "./packRegistry.js";
import {
  DYSGU_PACKS_BY_LEVEL,
  PRESET_DEFS,
  STARTER_PACK_GROUPS,
  STARTER_PACK_ORDER,
} from "./presets";

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

  it("keeps starter groups aligned with the pack registry", () => {
    const groupedStarterIds = STARTER_PACK_GROUPS.flatMap((group) => group.presetIds);

    expect(groupedStarterIds).toEqual(STARTER_PACK_ORDER);
    expect(new Set(groupedStarterIds).size).toBe(groupedStarterIds.length);
    expect(
      groupedStarterIds.every((id) => Object.prototype.hasOwnProperty.call(PACK_REGISTRY_BY_ID, id))
    ).toBe(true);
  });

  it("includes Mynediad place-name pack in starter packs and groups", () => {
    expect(STARTER_PACK_ORDER).toContain("mynediad-place-names-pack-01");
    const mynediadGroup = STARTER_PACK_GROUPS.find((group) => group.id === "mynediad");
    expect(mynediadGroup?.presetIds).toContain("mynediad-place-names-pack-01");
  });
});

describe("pack registry integration", () => {
  it("creates presets for every registered pack", () => {
    expect(
      PACK_REGISTRY.every((pack) => Object.prototype.hasOwnProperty.call(PRESET_DEFS, pack.id))
    ).toBe(true);
  });

  it("keeps level pack lists aligned with the registry", () => {
    const levelPackIds = Object.values(DYSGU_PACKS_BY_LEVEL).flat();

    expect(
      levelPackIds.every((id) => Object.prototype.hasOwnProperty.call(PACK_REGISTRY_BY_ID, id))
    ).toBe(true);
  });
});

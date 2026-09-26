import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadLeitnerMap, saveLeitnerMap, updateLeitner } from "./leitner.js";
import { getCardKey } from "./pickNext.js";

let items;
beforeEach(() => {
  items = new Map();
  vi.stubGlobal("localStorage", { getItem: key => items.get(key) ?? null, setItem: (key, value) => items.set(key, value) });
});
afterEach(() => vi.unstubAllGlobals());
describe("versioned learning history", () => {
  it("preserves attributable history and backs up ambiguous v1 history untouched", () => {
    const legacy = JSON.stringify({ stable: { box: 3, dueAt: 100 }, U110055: { box: 5, dueAt: 200 } });
    items.set("wm_leitner_v1", legacy);
    expect(loadLeitnerMap()).toEqual({ stable: { box: 3, dueAt: 100 } });
    expect(items.get("wm_leitner_v1")).toBe(legacy);
    const next = updateLeitner(loadLeitnerMap(), "U110055", "correct", { reviewedAt: 200 });
    expect(loadLeitnerMap()).toEqual(next); // migration must not reset new reviews
    expect(loadLeitnerMap()["UWCH-S-U2-0055"]).toBeUndefined();
  });
  it.each([null, [], "bad", { broken: { box: 99, dueAt: 5 } }, { broken: { box: 1, dueAt: "yesterday" } }])("handles malformed legacy values %j", value => {
    items.set("wm_leitner_v1", JSON.stringify(value));
    expect(loadLeitnerMap()).toEqual({});
  });
  it("ignores invalid JSON and invalid v2 shapes", () => {
    items.set("wm_leitner_v1", "{");
    expect(loadLeitnerMap()).toEqual({});
    items.set("wm_leitner_v2", JSON.stringify({ schemaVersion: 2, cards: [] }));
    expect(loadLeitnerMap()).toEqual({});
  });
  it("keeps identity independent of source revisions and list positions", () => {
    const row = { cardId: "stable", __sourceRevision: "old" };
    saveLeitnerMap({ stable: { box: 2, dueAt: 50 } });
    expect(getCardKey({ ...row, __sourceRevision: "new" }, 99)).toBe(getCardKey(row, 0));
    expect(loadLeitnerMap().stable.box).toBe(2);
  });
});

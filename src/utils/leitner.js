// src/utils/leitner.js
import { loadLS, saveLS } from "./storage";

// Key in localStorage
const LS_KEY = "wm_leitner_v2";
const LEGACY_KEY = "wm_leitner_v1";
const AMBIGUOUS_LEGACY_IDS = new Set(["U110055", "U110056", "U110057", "U110058", "U110059"]);

// Minutes between reviews per box (tweak later)
const BOX_MINUTES = [0, 10, 60, 24 * 60, 3 * 24 * 60, 7 * 24 * 60];

export function loadLeitnerMap() {
  const stored = loadLS(LS_KEY, null);
  if (stored !== null) return stored.schemaVersion === 2 ? validMap(stored.cards) : {};
  const legacy = validMap(loadLS(LEGACY_KEY, {}));
  // Each of these IDs described two different cards. Attribution is impossible;
  // reset both cards, preserving the untouched v1 store for recovery.
  for (const key of Object.keys(legacy)) if (AMBIGUOUS_LEGACY_IDS.has(key.toUpperCase())) delete legacy[key];
  saveLeitnerMap(legacy);
  return legacy;
}

export function saveLeitnerMap(map) {
  saveLS(LS_KEY, { schemaVersion: 2, cards: validMap(map) });
}

function validMap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, state]) =>
    key && !["__proto__", "constructor", "prototype"].includes(key) &&
    state && typeof state === "object" && !Array.isArray(state) &&
    Number.isInteger(state.box) && state.box >= 0 && state.box < BOX_MINUTES.length &&
    Number.isFinite(state.dueAt) && state.dueAt >= 0
  ));
}

// Decide how to update a card based on result
export function updateLeitner(map, cardKey, result, options = {}) {
  const now = options.reviewedAt ?? Date.now();
  const current = map[cardKey] ?? { box: 0, dueAt: now };

  let nextBox = current.box;

  let baseResult = options.baseResult ?? result;
  if (options.ease === "again") {
    baseResult = "wrong";
  }

  if (baseResult === "correct") {
    nextBox = Math.min(current.box + 1, BOX_MINUTES.length - 1);
  } else {
    // wrong, revealed, skipped => reset
    nextBox = 0;
  }

  if (options.ease === "easy" && baseResult === "correct") {
    nextBox = Math.min(nextBox + 1, BOX_MINUTES.length - 1);
  }

  const minutes = BOX_MINUTES[nextBox] ?? 0;
  const dueAt = result === "again" ? now : now + minutes * 60 * 1000;

  const next = {
    box: nextBox,
    dueAt,
    lastReviewedAt: now,
    lastResult: baseResult,
    lastEase: options.ease ?? null,
    lastReviewId: options.reviewId ?? null,
  };
  const out = { ...map, [cardKey]: next };
  saveLeitnerMap(out);
  return out;
}

// True if a card is due now (or overdue)
export function isDue(map, cardKey) {
  const s = map[cardKey];
  if (!s) return true; // unseen counts as due
  return (s.dueAt ?? 0) <= Date.now();
}

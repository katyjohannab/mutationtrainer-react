// src/utils/leitner.js
import { loadLS, saveLS } from "./storage";

// Key in localStorage
const LS_KEY = "wm_leitner_v1";

// Minutes between reviews per box (tweak later)
const BOX_MINUTES = [0, 10, 60, 24 * 60, 3 * 24 * 60, 7 * 24 * 60];

export function loadLeitnerMap() {
  return loadLS(LS_KEY, {}); // { [cardKey]: { box: number, dueAt: number } }
}

export function saveLeitnerMap(map) {
  saveLS(LS_KEY, map);
}

// Decide how to update a card based on result
export function updateLeitner(map, cardKey, result, options = {}) {
  const now = options.reviewedAt ?? Date.now();
  const current = map[cardKey] ?? { box: 0, dueAt: now };

  const maxBox = BOX_MINUTES.length - 1;
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

// src/utils/pickNext.js
import { isDue } from "./leitner";

// Stable key for a card
export function getCardKey(row, idx) {
  return row?.cardId || row?.CardId || row?.id || `${row?.category}:${row?.trigger}:${row?.base}:${idx}`;
}

// Random pick with “avoid immediate repeats”
export function pickRandomIndex(rows, recentKeys, maxTries = 40) {
  if (!rows.length) return -1;

  for (let i = 0; i < maxTries; i++) {
    const idx = Math.floor(Math.random() * rows.length);
    const k = getCardKey(rows[idx], idx);
    if (!recentKeys.has(k)) return idx;
  }
  // give up and return any
  return Math.floor(Math.random() * rows.length);
}

// Smart pick = prefer due cards, otherwise nearest dueAt
export function pickSmartIndex(rows, leitnerMap) {
  if (!rows.length) return -1;

  // 1) due now
  const due = [];
  for (let i = 0; i < rows.length; i++) {
    const k = getCardKey(rows[i], i);
    if (isDue(leitnerMap, k)) due.push(i);
  }
  if (due.length) return due[Math.floor(Math.random() * due.length)];

  // 2) none due: pick the one with the earliest dueAt
  let bestIdx = 0;
  let bestDueAt = Infinity;

  for (let i = 0; i < rows.length; i++) {
    const k = getCardKey(rows[i], i);
    const s = leitnerMap[k];
    const dueAt = s?.dueAt ?? 0;
    if (dueAt < bestDueAt) {
      bestDueAt = dueAt;
      bestIdx = i;
    }
  }
  return bestIdx;
}

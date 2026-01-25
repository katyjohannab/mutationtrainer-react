// src/services/loadCsv.js
import Papa from "papaparse";

// Map your CSV headers -> canonical keys used in the React app
const KEY_MAP = {
  CardId: "cardId",
  RuleFamily: "family",
  RuleCategory: "category",
  Trigger: "trigger",
  Base: "base",
  Translate: "translate",
  WordCategory: "wordCategory",
  Before: "before",
  After: "after",
  Answer: "answer",
  Outcome: "outcome",
  TranslateSent: "translateSent",
  Why: "why",
  "Why-Cym": "whyCym",
};

// Normalise for comparisons: lowercase and remove non-alphanumerics
function canon(s) {
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ""); // "Place names" -> "placenames"
}

// Split cells that may contain multiple tokens: un|dwy, un, dwy, un/dwy etc
function tokens(s) {
  const raw = (s ?? "").toString().trim();
  if (!raw) return [];
  return raw
    .split(/[\s,;|/]+/g)
    .map(canon)
    .filter(Boolean);
}

function matchesToken(cellValue, allowedSet) {
  // allowedSet contains canonical tokens (e.g. "un", "dwy")
  const t = tokens(cellValue);
  return t.some((x) => allowedSet.has(x));
}

function matchesCategory(cellValue, presetCategory) {
  const c = canon(cellValue);

  // Allow a couple of common variants/synonyms
  const preset = canon(presetCategory);

  // e.g. preset "PlaceName" should also match "placenames", "place-names", "place names"
  if (preset === "placename") {
    return c === "placename" || c === "placenames" || c === "placenamecards";
  }
  if (preset === "article") {
    return c === "article" || c === "articles";
  }

  return c === preset;
}

export function applyFilters(rows, state) {
  let out = [...rows];
  const preset = state.preset;

  // 1) Preset sourceScope (restrict to certain CSV files)
  if (preset?.sourceScope?.length) {
    const allowed = new Set(preset.sourceScope.map(canon));
    out = out.filter((r) => allowed.has(canon(r.__source)));
  }

  // 2) Preset category
  if (preset?.category) {
    out = out.filter((r) => matchesCategory(r.category, preset.category));
  }

  // 3) Preset triggers
  if (preset?.triggers?.length) {
    const allowedTriggers = new Set(preset.triggers.map(canon));
    out = out.filter((r) => matchesToken(r.trigger, allowedTriggers));
  }

  // (User filters can be added back in later)

  return out;
}
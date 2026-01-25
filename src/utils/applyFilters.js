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

function normaliseRow(row, filename) {
  const out = { __source: filename };

  for (const [k, v] of Object.entries(row)) {
    const cleanVal = typeof v === "string" ? v.trim() : v;

    // Keep the original key (optional but handy for debugging)
    out[k] = cleanVal;

    // Also write the canonical key if we have a mapping
    const mapped = KEY_MAP[k];
    if (mapped) out[mapped] = cleanVal;
  }

  return out;
}

export async function loadCsvFromPublicData(filename) {
  const url = `/data/${filename}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);

  const csvText = await res.text();

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors?.length) {
    console.warn(`CSV parse warnings for ${filename}`, parsed.errors);
  }

  return parsed.data.map((row) => normaliseRow(row, filename));
}

export async function loadManyCsvFiles(filenames) {
  const chunks = await Promise.all(filenames.map(loadCsvFromPublicData));
  return chunks.flat();
}

// src/utils/applyFilters.js

function norm(s) {
  return (s ?? "").toString().trim().toLowerCase();
}

export function applyFilters(rows, state) {
  let out = [...rows];
  const preset = state.preset;

  if (preset?.sourceScope?.length) {
    const allowed = new Set(preset.sourceScope.map(norm));
    out = out.filter((r) => allowed.has(norm(r.__source)));
  }

  if (preset?.category) {
    const c = norm(preset.category);
    out = out.filter((r) => norm(r.category) === c);
  }

  if (preset?.triggers?.length) {
    const allowed = new Set(preset.triggers.map(norm));
    out = out.filter((r) => allowed.has(norm(r.trigger)));
  }

  return out;
}

// src/services/loadCsv.js
import Papa from "papaparse";

// Canonicalise header keys so we can match even if the CSV has BOM, spaces, casing differences, etc.
function canonKey(k) {
  return (k ?? "")
    .toString()
    .replace(/^\uFEFF/, "") // strip BOM if present
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ""); // remove spaces/punctuation
}

// Map canonicalised CSV headers -> canonical row fields used by the React app
const KEY_MAP_CANON = {
  cardid: "cardId",
  rulefamily: "family",
  rulecategory: "category",
  trigger: "trigger",
  base: "base",
  translate: "translate",
  wordcategory: "wordCategory",
  before: "before",
  after: "after",
  answer: "answer",
  outcome: "outcome",
  translatesent: "translateSent",
  why: "why",
  whycym: "whyCym", // handles "Why-Cym" or "Why Cym"
};

function normaliseRow(row, filename) {
  const out = { __source: filename };

  for (const [rawKey, rawVal] of Object.entries(row)) {
    const cleanVal = typeof rawVal === "string" ? rawVal.trim() : rawVal;

    // Keep original key (useful for debugging)
    out[rawKey] = cleanVal;

    // Also map to canonical key
    const mapped = KEY_MAP_CANON[canonKey(rawKey)];
    if (mapped) out[mapped] = cleanVal;
  }

  return out;
}

export async function loadCsvFromPublicData(filename) {
  const base = import.meta.env.BASE_URL || "/";
  const url = `${base}data/${filename}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);

  const csvText = await res.text();
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

  if (parsed.errors?.length) console.warn(`CSV parse warnings for ${filename}`, parsed.errors);

  const rows = (parsed.data || []).filter((r) =>
    r && Object.values(r).some((v) => (v ?? "").toString().trim() !== "")
  );

  return rows.map((row) => normaliseRow(row, filename));
}


export async function loadManyCsvFiles(filenames) {
  const chunks = await Promise.all(filenames.map(loadCsvFromPublicData));
  return chunks.flat();
}

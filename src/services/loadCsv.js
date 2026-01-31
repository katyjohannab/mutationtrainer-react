// src/services/loadCsv.js
import Papa from "papaparse";

// Map normalized lower-case alpha-only headers to internal keys
const CANON_MAP = {
  "cardid": "cardId",
  "id": "cardId",
  
  "rulefamily": "family",
  "family": "family",
  
  "rulecategory": "category",
  "category": "category",
  
  "trigger": "trigger",
  "base": "base",
  "word": "base",
  
  "translate": "translate",
  "translation": "translate",
  
  "wordcategory": "wordCategory",
  "pos": "wordCategory",
  
  "before": "before",
  "after": "after",
  "answer": "answer",
  "outcome": "outcome",
  
  "translatesent": "translateSent",
  "sentencesmeaning": "translateSent",
  
  "why": "why",
  "whycym": "whyCym",
  "whycymraeg": "whyCym"
};

function normaliseRow(row, filename) {
  const out = { __source: filename };
  
  for (const [rawKey, val] of Object.entries(row)) {
    const cleanVal = typeof val === "string" ? val.trim() : val;
    
    // Normalize key: remove non-alphanumeric, lowercase
    const keyCanon = rawKey.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // Check map with canonical key
    const mapped = CANON_MAP[keyCanon];
    if (mapped && cleanVal) {
      out[mapped] = cleanVal;
    }
    
    // Keep original too
    out[rawKey] = cleanVal;
  }
  
  // CRITICAL: Hard fallbacks if map failed - check ALL possible variants
  if (!out.family || out.family === "") {
     out.family = out.rulefamily || row.RuleFamily || row.rulefamily || row.Family || "";
  }
  if (!out.category || out.category === "") {
     out.category = out.rulecategory || row.RuleCategory || row.rulecategory || row.Category || "";
  }

  // Safety Defaults
  if (!out.cardId) out.cardId = `gen-${Math.random().toString(36).slice(2)}`;
  
  return out;
}

export async function loadCsvFromPublicData(filename) {
  const base = import.meta.env.BASE_URL || "/";
  // Remove leading slash if base has one and filename has one to avoid //data
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const url = `${cleanBase}data/${filename}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);

    const csvText = await res.text();
    
    const parsed = Papa.parse(csvText, { 
      header: true, 
      skipEmptyLines: true,
      // transforming header is useful but we double-check in normaliseRow
      transformHeader: (h) => {
        return h.trim().toLowerCase().replace(/[^a-z0-9]/g, ""); 
      }
    });

    if (parsed.errors?.length) {
       console.warn(`CSV parse warnings for ${filename}`, parsed.errors);
    }

    const rows = (parsed.data || []).filter((r) =>
      r && Object.values(r).some((v) => (v ?? "").toString().trim() !== "")
    );

    return rows.map((row) => normaliseRow(row, filename));
    
  } catch (err) {
    console.error("Error loading CSV:", filename, err);
    return [];
  }
}

export async function loadManyCsvFiles(filenames) {
  const chunks = await Promise.all(filenames.map(loadCsvFromPublicData));
  return chunks.flat();
}

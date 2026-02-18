// src/services/loadCsv.js
import Papa from "papaparse";
import { GRAMMAR_RULES } from "../data/rules";
import { CSV_SOURCE_META } from "../data/csvSources";
import { mutateWord } from "../utils/grammar";

// Map normalized lower-case alpha-only headers to internal keys
const CANON_MAP = {
  "cardid": "cardId",
  "id": "cardId",
  "ruleid": "ruleId",
  "course": "course",
  "level": "level",
  "dialect": "dialect",
  "patternid": "patternId",
  "focus": "focus",
  "qastatus": "qaStatus",
  
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

  "unit": "unit",
  
  "before": "before",
  "after": "after",
  "answer": "answer",
  "outcome": "outcome",
  "mutation": "outcome",
  
  "translatesent": "translateSent",
  "sentencesmeaning": "translateSent",
  
  "why": "why",
  "whycym": "whyCym",
  "whycymraeg": "whyCym",
  
  "explanationen": "why",
  "explanationcy": "whyCym"
};

function applySourceMetadata(row, filename) {
  const sourceMeta = CSV_SOURCE_META[filename];
  if (!sourceMeta) return row;

  const out = { ...row };
  if (!out.course && sourceMeta.course) out.course = sourceMeta.course;
  if (!out.level && sourceMeta.level) out.level = sourceMeta.level;
  if (!out.dialect && sourceMeta.dialect) out.dialect = sourceMeta.dialect;
  if (!out.unit && sourceMeta.unit) out.unit = sourceMeta.unit;

  return out;
}

function fallbackCardId(filename, rowIndex) {
  const sourceKey = String(filename)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // +2 because rowIndex is zero-based and the CSV header is line 1.
  return `${sourceKey || "csv"}-r${rowIndex + 2}`;
}

function normaliseRow(row, filename, rowIndex) {
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

  // Handle outcome shortcodes
  if (out.outcome) {
    const raw = out.outcome.trim().toLowerCase();
    if (raw === "sm") out.outcome = "soft";
    else if (raw === "nm") out.outcome = "nasal";
    else if (raw === "am") out.outcome = "aspirate";
  }

  // Lazy generation: answer
  if (!out.answer && out.base && out.outcome) {
    out.answer = mutateWord(out.base, out.outcome);
  }

  // Lazy generation: sentences from template
  if (out.template && (!out.before || !out.after)) {
    let t = out.template;
    if (out.trigger) {
      // Create a regex to replace trigger case-insensitively
      const triggerRegex = new RegExp(`{trigger}`, "gi");
      t = t.replace(triggerRegex, out.trigger);
    }
    
    // Split by {answer} case-insensitively using regex split with capturing group to be safe
    // but simplified: split by the literal token we expect the user to write
    const parts = t.split(/\{answer\}/i);
    
    // e.g. "Dw i'n {answer} rwan" -> before="Dw i'n ", after=" rwan"
    if (parts.length >= 1) out.before = parts[0].trim();
    if (parts.length >= 2) out.after = parts[1].trim();
  }

  // Safety default must remain deterministic for stable review/debug.
  if (!out.cardId) out.cardId = fallbackCardId(filename, rowIndex);
  
  // Normalise specific categories based on rules
  if (out.category && out.category.trim().toLowerCase() === "verb") {
      // "Verb" is too generic. Refine based on rule ID if possible.
      const rid = (out.ruleId || "").toLowerCase();
      if (rid.includes("interrog")) {
          out.category = "Interrogative";
      } else {
          // Default fallback for "Verb" in Mynediad (Gwnes i...) is Subject Boundary
          out.category = "SubjectBoundary";
      }
  }

  if (out.ruleId) {
    const rid = out.ruleId.trim();
    const rule = GRAMMAR_RULES[rid] || GRAMMAR_RULES[rid.toLowerCase()];
    if (rule) {
      if (!out.why && rule.en) out.why = rule.en;
      if (!out.whyCym && rule.cy) out.whyCym = rule.cy;
    }
  }

  
  return applySourceMetadata(out, filename);
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

    return rows.map((row, rowIndex) => normaliseRow(row, filename, rowIndex));
    
  } catch (err) {
    console.error("Error loading CSV:", filename, err);
    return [];
  }
}

export async function loadManyCsvFiles(filenames) {
  const chunks = await Promise.all(filenames.map(loadCsvFromPublicData));
  return chunks.flat();
}

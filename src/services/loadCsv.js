// src/services/loadCsv.js
import Papa from "papaparse";
import { GRAMMAR_RULES } from "../data/rules";
import { CSV_SOURCE_META } from "../data/csvSources";
import { mutateWord } from "../utils/grammar";
import { getMappedKeyFromHeader, normalizeOutcomeValue } from "./csvFieldMap";

function applySourceMetadata(row, filename) {
  const sourceMeta = CSV_SOURCE_META[filename];
  if (!sourceMeta) return row;

  const out = { ...row };
  if (!out.course && sourceMeta.course) out.course = sourceMeta.course;
  if (!out.level && sourceMeta.level) out.level = sourceMeta.level;
  if (!out.dialect && sourceMeta.dialect) out.dialect = sourceMeta.dialect;
  if (!out.unit && sourceMeta.unit) out.unit = sourceMeta.unit;
  if (!out.pack && sourceMeta.pack) out.pack = sourceMeta.pack;

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
  const out = {
    __source: filename,
    __rowIndex: rowIndex,
    __fileType: filename.toLowerCase().endsWith(".tsv") ? "tsv" : "csv",
  };

  for (const [rawKey, val] of Object.entries(row)) {
    const cleanVal = typeof val === "string" ? val.trim() : val;

    const mapped = getMappedKeyFromHeader(rawKey);
    if (mapped && cleanVal !== "") {
      out[mapped] = cleanVal;
    }

    // Keep original key as parsed (already header-canonicalized by Papa config).
    out[rawKey] = cleanVal;
  }

  // CRITICAL: Hard fallbacks if map failed - check ALL possible variants.
  if (!out.family || out.family === "") {
    out.family = out.rulefamily || row.RuleFamily || row.rulefamily || row.Family || "";
  }
  if (!out.category || out.category === "") {
    out.category = out.rulecategory || row.RuleCategory || row.rulecategory || row.Category || "";
  }

  // Handle outcome shortcodes.
  if (out.outcome) {
    out.outcome = normalizeOutcomeValue(out.outcome);
  }

  // Lazy generation: answer.
  if (!out.answer && out.base && out.outcome) {
    out.answer = mutateWord(out.base, out.outcome);
  }

  // Lazy generation: sentences from template.
  if (out.template && (!out.before || !out.after)) {
    let template = out.template;
    if (out.trigger) {
      const triggerRegex = new RegExp(`{trigger}`, "gi");
      template = template.replace(triggerRegex, out.trigger);
    }

    const parts = template.split(/\{answer\}/i);
    if (parts.length >= 1) out.before = parts[0].trim();
    if (parts.length >= 2) out.after = parts[1].trim();
  }

  // Lazy generation: sentences from sentenceWithGap marker.
  if (out.sentenceWithGap && !out.before && !out.after) {
    const markerRegex = /\[\s*\]/;
    const sentence = out.sentenceWithGap;
    const markerMatch = sentence.match(markerRegex);

    if (markerMatch) {
      const markerIndex = markerMatch.index || 0;
      const markerText = markerMatch[0];
      const beforePart = sentence.slice(0, markerIndex);
      const afterPart = sentence.slice(markerIndex + markerText.length);

      out.before = beforePart.replace(/\s+$/, "");
      out.after = afterPart.replace(/^\s+/, "");
      out.sentenceWithGap = `${out.before}${out.after ? ` ${out.after}` : ""}`;
    } else {
      out.before = sentence.trim();
      out.after = "";
      out.sentenceWithGap = out.before;
    }
  }

  // Parse pipe-delimited tags into an array.
  if (typeof out.tags === "string" && out.tags.trim()) {
    out.tags = out.tags
      .split("|")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  } else if (!Array.isArray(out.tags)) {
    out.tags = [];
  }

  // Safety default must remain deterministic for stable review/debug.
  if (!out.cardId) out.cardId = fallbackCardId(filename, rowIndex);

  // Normalise specific categories based on rules.
  if (out.category && out.category.trim().toLowerCase() === "verb") {
    const rid = (out.ruleId || "").toLowerCase();
    if (rid.includes("interrog")) {
      out.category = "Interrogative";
    } else {
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
  const isTsv = filename.toLowerCase().endsWith(".tsv");
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const url = `${cleanBase}data/${filename}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);

    const csvText = await res.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      ...(isTsv ? { delimiter: "\t", quoteChar: "\0" } : {}),
      transformHeader: (h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ""),
    });

    if (parsed.errors?.length) {
      console.warn(`CSV parse warnings for ${filename}`, parsed.errors);
    }

    const rows = [];
    (parsed.data || []).forEach((row, sourceRowIndex) => {
      if (!row) return;
      const hasValues = Object.values(row).some((v) => (v ?? "").toString().trim() !== "");
      if (!hasValues) return;
      rows.push(normaliseRow(row, filename, sourceRowIndex));
    });

    return rows;
  } catch (err) {
    console.error("Error loading CSV:", filename, err);
    return [];
  }
}

export async function loadManyCsvFiles(filenames) {
  const chunks = await Promise.all(filenames.map(loadCsvFromPublicData));
  return chunks.flat();
}

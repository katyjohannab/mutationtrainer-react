import Papa from "papaparse";
import { GRAMMAR_RULES } from "../data/rules.js";
import { CSV_SOURCE_META } from "../data/csvSources.js";
import { canonicalizeHeader, getMappedKeyFromHeader, normalizeOutcomeValue } from "./csvFieldMap.js";

export class ContentValidationError extends Error {
  constructor(diagnostics) {
    super(diagnostics.map(d => `${d.source}${d.record ? ` record ${d.record}` : ""}${d.cardId ? ` (${d.cardId})` : ""}: ${d.message}`).join("\n"));
    this.name = "ContentValidationError";
    this.diagnostics = diagnostics;
    this.statusCode = 422;
  }
}

// Existing TSVs use literal quotes. Tabs/newlines cannot occur inside a TSV cell.
// CSVs use standard CSV quoting, including multiline fields.
export function parseCardSource(text, source) {
  const isTsv = source.toLowerCase().endsWith(".tsv");
  const parsed = Papa.parse(text, {
    header: true, skipEmptyLines: true, delimiter: isTsv ? "\t" : ",",
    ...(isTsv ? { quoteChar: "\0" } : {}),
  });
  const headers = parsed.meta.fields || [];
  const errors = parsed.errors.map(e => ({ source, record: Number.isInteger(e.row) ? e.row + 1 : undefined, code: "parse", message: e.message }));
  const warnings = [];
  const seenHeaders = new Set();
  for (const header of headers) {
    const key = canonicalizeHeader(header);
    if (!getMappedKeyFromHeader(header)) errors.push({ source, code: "header", message: `Unknown column: ${header || "(empty)"}` });
    if (seenHeaders.has(key)) errors.push({ source, code: "header", message: `Duplicate column: ${header}` });
    seenHeaders.add(key);
  }
  if (!parsed.data.length) errors.push({ source, code: "empty", message: "Source has no cards." });
  const cards = parsed.data.map((row, index) => {
    const card = normaliseRow(row, source, index);
    const at = { source, record: index + 1, cardId: card.cardId };
    for (const key of ["cardId", "base", "answer", "outcome"]) {
      if (!card[key]) errors.push({ ...at, code: "required", message: `Missing ${key}; authored values are required.` });
    }
    if (card.cardId && Array.from(card.cardId).some(char => /\s/.test(char) || char.charCodeAt(0) < 32)) errors.push({ ...at, code: "identity", message: "Card ID must not contain whitespace or control characters." });
    if (card.outcome && !["soft", "nasal", "aspirate", "none"].includes(card.outcome)) errors.push({ ...at, code: "outcome", message: `Unknown outcome: ${card.outcome}` });
    const values = new Map();
    for (const [header, value] of Object.entries(row)) {
      const key = getMappedKeyFromHeader(header);
      const clean = String(value ?? "").trim();
      if (!key || !clean) continue;
      if (values.has(key) && values.get(key) !== clean) errors.push({ ...at, code: "alias", message: `Conflicting columns for ${key}.` });
      values.set(key, clean);
    }
    const gap = values.get("sentenceWithGap");
    const template = values.get("template");
    const hasFragments = Boolean(values.get("before") || values.get("after"));
    if (!hasFragments && !(gap && (gap.match(/\[\s*\]/g) || []).length === 1) && !(template && (template.match(/\{answer\}/gi) || []).length === 1)) errors.push({ ...at, code: "prompt", message: "Supply before/after fragments or exactly one [] / {answer} gap." });
    if (card.answer && card.answer.split("|").some(v => !v.trim())) errors.push({ ...at, code: "answer", message: "Accepted answers contain an empty variant." });
    for (const field of ["category", "level", "dialect", "translateSent", "why", "whyCym", "ruleId"]) {
      if (!card[field]) warnings.push({ ...at, code: "editorial", field, message: `Missing ${field}; editorial review remains outstanding.` });
    }
    return card;
  });
  errors.push(...duplicateIdDiagnostics(cards));
  return { headers, rows: parsed.data, cards, errors, warnings };
}

export function duplicateIdDiagnostics(cards) {
  const seen = new Map();
  const errors = [];
  for (const card of cards) {
    if (!card.cardId) continue;
    const key = card.cardId.toLowerCase();
    const first = seen.get(key);
    if (first) errors.push({ source: card.__source, record: card.__rowIndex + 1, cardId: card.cardId, code: "duplicate", message: `Duplicate ID; first used in ${first.__source} record ${first.__rowIndex + 1}.` });
    else seen.set(key, card);
  }
  return errors;
}

export function requireValidSource(text, source) {
  const parsed = parseCardSource(text, source);
  if (parsed.errors.length) throw new ContentValidationError(parsed.errors);
  return parsed;
}

export function serializeCardSource({ headers, rows }, source, original = "") {
  const newline = original.includes("\r\n") ? "\r\n" : "\n";
  let output;
  if (source.toLowerCase().endsWith(".tsv")) {
    const records = [headers, ...rows.map(row => headers.map(header => String(row[header] ?? "")))];
    if (records.some(record => record.some(value => /[\t\r\n\0]/.test(value)))) throw new ContentValidationError([{ source, code: "tsv-cell", message: "TSV cells cannot contain tabs, line breaks or NUL. Quotes and commas are literal text." }]);
    output = records.map(record => record.join("\t")).join(newline);
  } else output = Papa.unparse({ fields: headers, data: rows }, { delimiter: ",", newline });
  if (original.startsWith("\uFEFF")) output = `\uFEFF${output}`;
  if (/\r?\n$/.test(original)) output += newline;
  const reread = requireValidSource(output, source);
  if (JSON.stringify(reread.rows) !== JSON.stringify(rows)) throw new ContentValidationError([{ source, code: "roundtrip", message: "Serialization changed cell values." }]);
  return output;
}

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

export function normaliseRow(row, filename, rowIndex) {
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
    out[canonicalizeHeader(rawKey)] = cleanVal;
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

// Shared CSV/TSV header canonicalization + key mapping used by runtime load and admin save.

export const CANON_MAP = {
  cardid: "cardId",
  cardseq: "cardId",
  id: "cardId",
  ruleid: "ruleId",
  course: "course",
  level: "level",
  dialect: "dialect",
  patternid: "patternId",
  focus: "focus",
  qastatus: "qaStatus",
  qastatusmnmamnone: "qaStatus",

  rulefamily: "family",
  family: "family",

  rulecategory: "category",
  category: "category",
  rulecat: "category",

  trigger: "trigger",
  base: "base",
  word: "base",

  translate: "translate",
  translation: "translate",

  wordcategory: "wordCategory",
  pos: "wordCategory",

  unit: "unit",
  packid: "pack",
  pack: "pack",

  before: "before",
  after: "after",
  answer: "answer",
  targetword: "answer",
  outcome: "outcome",
  outcomesmnmamnone: "outcome",
  outcomessmnmamnone: "outcome",
  mutation: "outcome",

  translatesent: "translateSent",
  sentenceeng: "translateSent",
  sentencesmeaning: "translateSent",
  translatesentcym: "translateSentCym",
  translatesentcy: "translateSentCym",
  sentencecym: "translateSentCym",
  sentencewelsh: "translateSentCym",
  sentencewithgap: "sentenceWithGap",

  why: "why",
  whyeng: "why",
  whycym: "whyCym",
  whycymraeg: "whyCym",

  explanationen: "why",
  explanationcy: "whyCym",
};

export const ADMIN_EDITABLE_FIELDS = [
  "before",
  "base",
  "after",
  "answer",
  "outcome",
  "trigger",
  "category",
  "translate",
  "translateSent",
  "why",
  "whyCym",
];

export function canonicalizeHeader(rawKey) {
  return String(rawKey ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function getMappedKeyFromHeader(rawKey) {
  const canonical = canonicalizeHeader(rawKey);
  return CANON_MAP[canonical] || (canonical.startsWith("qastatus") ? "qaStatus" : undefined);
}

export function buildCanonicalHeaderMap(headers) {
  const map = new Map();
  for (const header of headers || []) {
    const mappedKey = getMappedKeyFromHeader(header);
    if (mappedKey && !map.has(mappedKey)) map.set(mappedKey, header);
  }
  return map;
}

export function normalizeOutcomeValue(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "sm" || raw === "soft") return "soft";
  if (raw === "nm" || raw === "nasal") return "nasal";
  if (raw === "am" || raw === "aspirate") return "aspirate";
  if (raw === "none") return "none";
  return raw || "";
}

export function toOutcomeCode(value) {
  const normalized = normalizeOutcomeValue(value);
  if (normalized === "soft") return "SM";
  if (normalized === "nasal") return "NM";
  if (normalized === "aspirate") return "AM";
  if (normalized === "none") return "NONE";
  return String(value ?? "").trim();
}

// =======================
// Mynediad-De - Unit 1
// Target A: VOCAB (u1_vocab)
// Target B: PATTERNS (u1_patterns)
// =======================

const LEVEL = "mynediad";
const DIALECT = "south";
const UNIT = 1;

const VOCAB_EVIDENCE = [
  {
    sourceId: "mynediad-de-v2-2023",
    page: 12,
    boxLabel: "unit-1-vocab-box",
    note: "Vocabulary box at start of unit.",
  },
];

const PATTERN_EVIDENCE = [
  {
    sourceId: "mynediad-de-v2-2023",
    page: 13,
    boxLabel: "unit-1-pattern-box",
    note: "Sentence patterns introduced in Unit 1.",
  },
];

const rawVocab = [
  {
    base: "Abertawe",
    en: "Swansea",
    type: "place",
    gender: "null",
    semanticClass: "place-town",
    countability: "proper",
    articleBehaviour: "bare",
    placePrep: { yn: "yn-bare", i: "i-bare" },
  },

  { base: "nos", en: "night", type: "noun", gender: "f", semanticClass: "time-period", countability: "count", articleBehaviour: "either" },
  { base: "noswaith", en: "evening", type: "noun", gender: "f", semanticClass: "time-period", countability: "count", articleBehaviour: "either" },
  { base: "paned", en: "cuppa", type: "noun", gender: "f", semanticClass: "drink", countability: "count", articleBehaviour: "either" },
  { base: "problem", en: "problem", type: "noun", gender: "f", semanticClass: "abstract-issue", countability: "count", articleBehaviour: "either", plural: "problemau" },
  { base: "rhaglen", en: "programme", type: "noun", gender: "f", semanticClass: "media", countability: "count", articleBehaviour: "either", plural: "rhaglenni" },
  { base: "uned", en: "unit", type: "noun", gender: "f", semanticClass: "object-document", countability: "count", articleBehaviour: "either", plural: "unedau" },

  { base: "bore", en: "morning", type: "noun", gender: "m", semanticClass: "time-period", countability: "count", articleBehaviour: "either", plural: "boreau" },
  { base: "car", en: "car", type: "noun", gender: "m", semanticClass: "object-transport", countability: "count", articleBehaviour: "either", plural: "ceir" },
  { base: "croeso", en: "welcome", type: "other", gender: "null", semanticClass: "polite", tags: ["set-expression"] },
  { base: "dosbarth", en: "class", type: "noun", gender: "m", semanticClass: "event", countability: "count", articleBehaviour: "definite", plural: "dosbarthiadau" },
  { base: "enw", en: "name", type: "noun", gender: "m", semanticClass: "abstract-issue", countability: "count", articleBehaviour: "either", plural: "enwau" },
  { base: "heddlu", en: "police", type: "noun", gender: "m", semanticClass: "person-group", countability: "collective", articleBehaviour: "either" },
  { base: "prynhawn", en: "afternoon", type: "noun", gender: "m", semanticClass: "time-period", countability: "count", articleBehaviour: "either", plural: "prynhawniau" },
  { base: "rhif", en: "number", type: "noun", gender: "m", semanticClass: "abstract-issue", countability: "count", articleBehaviour: "either", plural: "rhifau" },

  { base: "byw", en: "to live", type: "verbnoun", gender: "null" },
  { base: "darllen", en: "to read", type: "verbnoun", gender: "null" },
  { base: "dysgu", en: "to learn, to teach", type: "verbnoun", gender: "null" },
  { base: "gwylio", en: "to watch", type: "verbnoun", gender: "null" },
  { base: "gyrru", en: "to drive", type: "verbnoun", gender: "null" },
  { base: "stopio", en: "to stop", type: "verbnoun", gender: "null" },

  { base: "da", en: "good", type: "adj", gender: "null" },
  { base: "ofnadwy", en: "terrible", type: "adj", gender: "null" },
  { base: "pinc", en: "pink", type: "adj", gender: "null" },
  { base: "wedi blino", en: "tired", type: "adj", gender: "null", tags: ["set-expression"] },

  { base: "gyda", en: "with", type: "preposition", gender: "null", semanticClass: "discourse" },
  { base: "i", en: "to, for", type: "preposition", gender: "null", semanticClass: "discourse" },
  { base: "yn", en: "in", type: "preposition", gender: "null", semanticClass: "discourse" },

  { base: "a", en: "and", type: "other", gender: "null", semanticClass: "connector" },
  { base: "ble", en: "where?", type: "other", gender: "null", semanticClass: "question-word" },
  { base: "chi", en: "you", type: "other", gender: "null", semanticClass: "discourse" },
  { base: "diolch", en: "thanks", type: "other", gender: "null", semanticClass: "polite", tags: ["set-expression"] },
  { base: "dyna pam", en: "that's why", type: "other", gender: "null", semanticClass: "discourse", tags: ["set-expression"] },
  { base: "eto", en: "again", type: "other", gender: "null", semanticClass: "discourse" },
  { base: "fi", en: "me", type: "other", gender: "null", semanticClass: "discourse" },
  { base: "heddiw", en: "today", type: "other", gender: "null", semanticClass: "time-point" },
  { base: "hwyl", en: "bye!", type: "other", gender: "null", semanticClass: "polite", tags: ["set-expression"] },
  { base: "iawn", en: "ok, very", type: "other", gender: "null", semanticClass: "intensifier" },
  { base: "nawr", en: "now", type: "other", gender: "null", semanticClass: "time-point" },
  { base: "ond", en: "but", type: "other", gender: "null", semanticClass: "discourse" },
  { base: "pawb", en: "everybody", type: "other", gender: "null", semanticClass: "person-group" },
  { base: "pwy", en: "who?", type: "other", gender: "null", semanticClass: "question-word" },
  { base: "sut", en: "how?", type: "other", gender: "null", semanticClass: "question-word" },
  { base: "ti", en: "you", type: "other", gender: "null", semanticClass: "discourse" },
  { base: "yma", en: "here", type: "other", gender: "null", semanticClass: "place-deictic" },
];

export const u1_vocab = rawVocab.map((item, index) => ({
  id: `${LEVEL}-${DIALECT}-u${UNIT}-v${String(index + 1).padStart(3, "0")}`,
  unit: UNIT,
  level: LEVEL,
  dialect: DIALECT,
  evidenceRefs: item.evidenceRefs || VOCAB_EVIDENCE,
  ...item,
}));

const rawPatterns = [
  {
    id: "pat-u1-dw-in-verbnoun",
    course: LEVEL,
    unit: UNIT,
    name: "Present: Dw i'n + verbnoun",
    focus: "contrast-none",
    templates: [{ cy: "Dw i'n {verbnoun}.", en: "I {verbnoun}.", slot: "verbnoun" }],
    mutation: "none",
    ruleId: "none-bod-yn-verbnoun",
    constraints: {
      verbnoun: { type: "verbnoun" },
    },
  },
  {
    id: "pat-u1-dw-in-adj",
    course: LEVEL,
    unit: UNIT,
    name: "State: Dw i'n + adjective",
    focus: "mutation",
    templates: [{ cy: "Dw i'n {adj}.", en: "I am {adj}.", slot: "adj" }],
    mutation: "soft",
    ruleId: "soft-bod-yn-adj",
    constraints: {
      adj: { type: "adj" },
    },
  },
  {
    id: "pat-u1-dw-in-byw-yn-place",
    course: LEVEL,
    unit: UNIT,
    name: "Living in: Dw i'n byw yn + place",
    focus: "contrast-none",
    templates: [{ cy: "Dw i'n byw yn {place}.", en: "I live in {place}.", slot: "place" }],
    mutation: "none",
    ruleId: "none-misc-general",
    constraints: {
      place: { type: "place", semanticClass: "place-town" },
    },
    explanationOverride: {
      en: "In this starter frame, use the place name as listed in vocab; no mutation is being drilled here.",
      cy: "Yn y ffram gychwynnol hon, defnyddiwch enw'r lle fel yn y eirfa; nid yw treiglad yn cael ei ddrilio yma.",
    },
  },
];

export const u1_patterns = rawPatterns.map((pattern) => ({
  evidenceRefs: pattern.evidenceRefs || PATTERN_EVIDENCE,
  ...pattern,
}));

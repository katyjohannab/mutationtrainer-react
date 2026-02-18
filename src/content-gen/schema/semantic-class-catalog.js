// Canonical semantic classes.
// Keep this list expandable; unknown classes may be marked provisional in unit data.
export const KNOWN_SEMANTIC_CLASSES = new Set([
  // Legacy labels (supported for backward compatibility).
  "place-town",
  "time-period",
  "time-point",
  "person-group",
  "object-document",
  "object-transport",
  "abstract-issue",
  "drink",
  "media",
  "event",
  "discourse",
  "connector",
  "question-word",
  "polite",
  "intensifier",
  "place-deictic",

  // Canonical dot taxonomy.
  "place.town",
  "place.city",
  "place.village",
  "place.region",
  "place.country",
  "place.deictic",
  "time.period",
  "time.point",
  "time.frequency",
  "person.group",
  "person.role",
  "person.name",
  "object.transport",
  "object.document",
  "object.household",
  "object.clothing",
  "object.food",
  "object.drink",
  "media",
  "event",
  "abstract.issue",
  "abstract.quantity",
  "quality.evaluative",
  "quality.color",
  "quality.state",
  "discourse",
  "connector",
  "question.word",
  "polite",
  "intensifier",
  "number.cardinal",
  "number.ordinal",
  "grammar.preposition",
  "grammar.article",
  "grammar.pronoun",
  "grammar.verbnoun",
  "grammar.adjective",
  "grammar.noun",
  "expression.idiom",
  "expression.routine",
]);

export const ALLOWED_SEMANTIC_STATUS = new Set(["known", "provisional"]);

export function isCanonicalSemanticClass(value) {
  return /^[a-z0-9]+([.-][a-z0-9]+)*$/.test(String(value || ""));
}

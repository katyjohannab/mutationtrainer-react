# External AI One-Shot Prompt (Pass B: Patterns and Mutation Rules)

Generated: 2026-02-14T22:07:42.269Z

Copy this whole file into your external AI in one message.

## Unit Metadata
- level: mynediad
- dialect: south
- unit: 1
- sourceId: mynediad-de-v2-2023
- sourceTitle: Mynediad y De - Fersiwn 2 (argraffiad 2023)

## Attach These Source Pages
- All grammar/pattern pages for this unit.
- Unit goals and model lines used for guided drilling.

## Execution Directive
- Execute Pass B only from the canonical prompt below.
- Generate mutation-testable `u<N>_patterns` with evidence refs.
- Return `INSUFFICIENT_PATTERN_EVIDENCE` if required pattern pages are missing.

## Locked Pass A Unit Module Context
- `u<N>_vocab` could not be isolated automatically, so the full module is inlined.
- Reuse accepted vocab unless you include an explicit correction list.

```js
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
```

## Existing Evidence Manifest Context
```json
{
  "sourceId": "mynediad-de-v2-2023",
  "sourceTitle": "Mynediad y De - Fersiwn 2 (argraffiad 2023)",
  "level": "mynediad",
  "dialect": "south",
  "unit": 1,
  "notes": "Store citation metadata only; no long textbook extracts.",
  "refs": [
    {
      "page": 12,
      "boxLabel": "unit-1-vocab-box",
      "note": "Vocabulary box at the start of Unit 1."
    },
    {
      "page": 13,
      "boxLabel": "unit-1-pattern-box",
      "note": "Sentence patterns and principles taught in Unit 1."
    }
  ]
}
```

## Canonical Prompt
# Coursebook Extraction Prompt (Canonical, External AI Safe)

Last updated: 2026-02-14

Use this with an external AI that has no repo access.

## Critical Context
- The external AI cannot read local files, scripts, or source code.
- You must paste all required context into the same chat.
- Default workflow is one full-unit extraction prompt.
- Two-pass extraction is optional fallback only when full-unit extraction fails.

## Preferred: One-Shot Prompt Build (No Manual Catalog Copy-Paste)
Generate a single prompt file that already inlines required catalogs:
```bash
npm run build:external-prompt -- --level mynediad --dialect south --unit 1 --source-id mynediad-de-v2-2023 --source-title "Mynediad y De - Fersiwn 2 (argraffiad 2023)" --pass full
```

Output file:
- `generated/external-agent/prompts/<level>-<dialect>-u<N>-full.md`

Copy the generated file once into external AI and attach whole-unit pages.

## Full-Unit Model (Default)
One run should extract both:
1. vocabulary from chapter-opening color-coded box
2. patterns from the whole unit

Do not produce runtime CSV.

## Pattern Source Scope (Strict)
Pattern extraction must scan the whole unit, including:
- grammar/pattern boxes
- model dialogues
- guided drill lines inside exercises
- unit review/consolidation tasks
- unit reference sections that teach the same sentence frames

Do not restrict pattern extraction to one page only.

## Coverage Proof Requirement (Strict)
Response must include a section:
```txt
PATTERN_COVERAGE_REPORT:
- section/page: ...
  extracted patterns: ...
  skipped items and reason: ...
```

If a unit section was scanned but yielded no reusable pattern, state why.

## Fallback Two-Pass Mode (Optional)
Use only when full-unit extraction fails or context limits require separation:
1. Pass A vocab-only.
2. Pass B pattern-only reusing Pass A vocab.

## Full-Unit Required Input Bundle
1. Whole unit pages (not only opening pages).
2. Level, dialect, unit number.
3. Source metadata: `sourceId`, `sourceTitle`.
4. This prompt content.

## Full-Unit Required Output
Return:
1. `u<N>_vocab`
2. `u<N>_patterns`
3. optional `u<N>_ruleProposals`
4. `unit<N>.evidence.json`
5. `PATTERN_COVERAGE_REPORT`

## Pass A Prompt (Vocab-Only)
Use this when you have the chapter-opening vocab page.

### Pass A Required Input Bundle
1. Chapter-opening color-coded vocab page(s) for one unit.
2. Level, dialect, and unit number.
3. Source metadata: `sourceId`, `sourceTitle`.
4. This prompt content.

If using generated one-shot prompt (`generated/external-agent/prompts/...-passA.md`), no extra catalog copy-paste is needed.

### Pass A Output
Return:
1. `u<N>_vocab`
2. `u<N>_patterns = []` (intentional placeholder)
3. optional `u<N>_ruleProposals = []`
4. `unit<N>.evidence.json` with vocab refs

Pass A is valid and should be saved even if patterns are not available yet.

### Vocabulary Source Rule (Strict)
Vocabulary must come from the chapter-opening color-coded vocab box only.

Color coding map:
- red = `enwau benywaidd` (feminine nouns)
- blue = `enwau gwrywaidd` (masculine nouns)
- black = `berfau` (verbs/verbnouns)
- green = `ansoddeiriau` (adjectives)
- purple = `arall` (other; often idioms/phrases)

Do not add vocab from dialogues, exercises, or running text unless it is also in that opening vocab box.

## Pass B Prompt (Patterns and Mutation Rules)
Use this only when you also have pattern/grammar evidence pages for the same unit.

### Pass B Required Input Bundle
1. Pass A output (`u<N>_vocab` and evidence manifest).
2. All pages/sections that teach drillable sentence patterns for the unit:
   - grammar boxes
   - unit goals with sentence frames
   - guided model lines used for drilling
3. This prompt content.

If using generated one-shot prompt (`generated/external-agent/prompts/...-passB.md`), no extra catalog copy-paste is needed.

### Pass B Output
Return updated:
1. `u<N>_patterns` (mutation-testable templates)
2. optional `u<N>_ruleProposals`
3. updated `unit<N>.evidence.json` including pattern refs

Do not rewrite accepted Pass A vocab unless you provide an explicit correction list.

### Pattern Coverage Requirement (Strict)
Extract reusable templates from all drillable pattern teaching points evidenced in the provided material.

Do not include one-off examples unless they are clearly reusable as a drill frame.

If evidence is partial, return:
```txt
INSUFFICIENT_PATTERN_EVIDENCE:
- missing pages/sections: ...
- currently extractable pattern count: ...
```
and do not fabricate extra patterns.

## Shared Strict Rules (Both Passes)
- Use only evidence from provided unit material.
- Do not invent vocab, mutation contexts, or grammar claims.
- Scan all provided unit sections for reusable patterns; do not ignore exercises/review/reference content.
- Every vocab and pattern item must include non-empty `evidenceRefs`.
- Prefer semantic classes from the supplied semantic catalog.
- For a new semantic class:
  - set `semanticClassStatus: "provisional"`
  - add `semanticClassNotes`.
- One template = exactly one slot in Welsh and one slot in English.
- Every pattern slot constraint must match at least one vocab item in the same unit file.
- `ruleId` must be:
  - one value from the supplied Rule ID catalog.
- For `mutation: "none"` prefer a specific `none-*` rule ID (for learner-facing explanation quality).
- Use `ruleId: "none"` only as a fallback when no catalog rule fits, and then include `explanationOverride`.
- For `bod + yn` patterns:
  - adjective slot -> use `soft-bod-yn-adj`
  - verbnoun slot -> use `none-bod-yn-verbnoun`
- If no existing `ruleId` fits a mutation context, add an item to `u<N>_ruleProposals`.
- For non-mutation contrast cards use:
  - `focus: "contrast-none"`
  - `mutation: "none"`
  - `ruleId: "none-*"` from catalog when possible
- Include `PATTERN_COVERAGE_REPORT` in the response.

## Contractions and Surface Forms (Strict)
Welsh templates must be final surface form.

Mandatory contractions:
- `i + y/yr -> i'r`
- `o + y/yr -> o'r`

Do not output templates containing:
- `i y`
- `i yr`
- `o y`
- `o yr`

Example:
- reject: `Rydw i'n mynd i yr Eidal.`
- accept: `Rydw i'n mynd i'r Eidal.`

## Output Files
1. JS module:
   `src/content-gen/unit-data/<level>/<dialect>/unit<N>.js`
2. Evidence manifest:
   `src/content-gen/unit-data/<level>/<dialect>/unit<N>.evidence.json`

The JS file must export:
- `u<N>_vocab`
- `u<N>_patterns`

Optional export:
- `u<N>_ruleProposals`

## Vocab Schema
```js
{
  id: "mynediad-south-u1-v001",
  base: "...",
  en: "...",
  unit: 1,
  level: "mynediad|sylfaen|canolradd|uwch",
  dialect: "north|south",
  type: "noun|place|person|verbnoun|adj|number|preposition|other",
  gender: "m|f|null",
  semanticClass: "...",
  semanticClassStatus: "known|provisional", // optional; required if class is new
  semanticClassNotes: "...", // required when semanticClassStatus is provisional
  countability: "count|mass|collective|proper", // optional
  articleBehaviour: "bare|definite|either|fixed", // optional
  placePrep: { yn: "yn-bare|yn-article", i: "i-bare|i-article" }, // places only
  plural: "...", // optional
  tags: ["set-expression"], // optional
  evidenceRefs: [
    { sourceId: "...", page: 12, boxLabel: "unit-1-vocab-box", note: "optional" }
  ]
}
```

## Pattern Schema
```js
{
  id: "pat-u1-...",
  course: "mynediad|sylfaen|canolradd|uwch",
  unit: 1,
  name: "...",
  focus: "mutation|contrast-none",
  templates: [
    { cy: "... {slot} ...", en: "... {slot} ...", slot: "slot" }
  ],
  mutation: "none|soft|nasal|aspirate",
  ruleId: "<from supplied Rule ID catalog>", // use none-* IDs for non-mutation patterns where possible
  constraints: {
    slot: {
      type: "...",
      semanticClass: "..."
    }
  },
  semanticClass: "...", // optional for pattern-level semantics
  semanticClassStatus: "known|provisional", // optional
  semanticClassNotes: "...", // required when provisional
  explanationOverride: { en: "...", cy: "..." }, // optional
  evidenceRefs: [
    { sourceId: "...", page: 13, boxLabel: "unit-1-pattern-box", note: "optional" }
  ]
}
```

## Optional Rule Proposal Schema (`u<N>_ruleProposals`)
```js
{
  id: "rule-prop-u1-01",
  proposedRuleId: "soft-prep-newcontext",
  course: "mynediad|sylfaen|canolradd|uwch",
  unit: 1,
  mutation: "soft|nasal|aspirate",
  triggerContext: "...",
  en: "...",
  cy: "...",
  rationale: "...",
  evidenceRefs: [
    { sourceId: "...", page: 13, boxLabel: "unit-1-grammar-box", note: "optional" }
  ],
  status: "proposed|approved|rejected"
}
```

## Evidence Manifest Schema (`unit<N>.evidence.json`)
```json
{
  "sourceId": "mynediad-de-v2-2023",
  "sourceTitle": "Mynediad y De - Fersiwn 2 (argraffiad 2023)",
  "level": "mynediad",
  "dialect": "south",
  "unit": 1,
  "notes": "Citations only; no long textbook text.",
  "refs": [
    { "page": 12, "boxLabel": "unit-1-vocab-box", "note": "Vocabulary box" },
    { "page": 13, "boxLabel": "unit-1-pattern-box", "note": "Pattern box" }
  ]
}
```

## QA Checklist Before Saving
- Pass A vocab entries come only from the chapter-opening color-coded vocab box.
- Color-coded vocab classes are mapped to correct `type` and `gender`.
- All slots in templates exist in `constraints`.
- Exactly one slot token in `cy` and one in `en`.
- No duplicate `id` values within vocab or patterns.
- Every vocab item has `id`, `base`, `en`, `unit`, `level`, `dialect`, `type`, `evidenceRefs`.
- Provisional semantic classes include `semanticClassStatus` and `semanticClassNotes`.
- Every pattern has `focus` and `evidenceRefs`.
- Every mutation pattern uses a `ruleId` from the supplied Rule ID catalog.
- Every non-mutation pattern uses a specific `none-*` ruleId where possible; if `ruleId: "none"` is used, include `explanationOverride`.
- Missing mutation rules are captured in `u<N>_ruleProposals`.
- Welsh templates use contracted surface forms (`i'r`, `o'r`) where required.
- Every pattern slot has at least one matching vocab candidate in the same unit file.
- If pattern evidence is incomplete, include `INSUFFICIENT_PATTERN_EVIDENCE` instead of guessed templates.
- `PATTERN_COVERAGE_REPORT` lists all scanned unit sections (including exercises/review/reference) and extraction outcome per section.

## Validation and Compile Commands (Local)
```bash
npm run validate:unit-data
npm run compile:unit-data -- --level mynediad --dialect south --unit 1
```

## Canonical Example
`src/content-gen/unit-data/mynediad/south/unit1.js`

## Inlined Rule ID Catalog
# Rule ID Catalog (External AI Safe)

Last updated: 2026-02-14

Use only these `ruleId` values in extracted pattern output.
If none fit, create a proposal via `docs/RULE_PROPOSAL_WORKFLOW.md`.

## Prepositions
- `soft-prep-general`
- `soft-prep-i`
- `soft-prep-o`
- `nasal-prep-general`
- `nasal-prep-yn`
- `none-prep-contract`
- `none-prep-contract-vowel`
- `none-prep-contract-i`

## Possessives
- `soft-poss-dy`
- `soft-poss-general`
- `nasal-poss-fy`
- `aspirate-poss-ei`

## Feminine / Article
- `soft-adj-fem`
- `soft-art-fem`
- `none-art-masc`
- `none-art-vowel`
- `none-art-plural`

## Numbers
- `soft-num-dwy`
- `soft-num-general`
- `aspirate-num-general`

## Verbal / Questions / Negatives
- `soft-quest-direct`
- `soft-verb-short-subj`
- `soft-verb-quest-word`
- `soft-verb-neg`
- `aspirate-verb-neg-cmd`
- `mixed-mutation-neg`
- `none-verb-eisiau`

## Particles / Conjunctions
- `soft-part-yn`
- `soft-bod-yn-adj`
- `none-bod-yn-verbnoun`
- `aspirate-conj-neu`
- `none-general-yn`

## Prefixes
- `soft-pref-cyn`
- `soft-pref-uwch`
- `soft-pref-is`
- `soft-pref-dirprwy`
- `soft-pref-af`
- `soft-pref-go`
- `soft-pref-gor`
- `soft-prefix-af`
- `soft-prefix-di`
- `nasal-prefix-an`

## Misc / Recognition / Exceptions
- `nasal-misc-recog`
- `none-misc-general`
- `none-vowel-soft`
- `none-vowel-aspirate`
- `none-vowel-nasal`

## Reserved
- `none` (fallback-only when no specific `none-*` rule fits; must pair with explicit `explanationOverride`)

## Inlined Semantic Class Catalog
# Semantic Class Catalog

Last updated: 2026-02-14

Canonical and legacy-supported semantic classes for unit extraction.

## Purpose
- Keep semantic tagging consistent.
- Allow controlled expansion via provisional classes.

## Canonical Format
- Preferred format: lowercase dot-namespace, e.g. `place.town`, `time.period`.
- Legacy hyphen format is still accepted for existing data, e.g. `place-town`.

## Known Canonical Classes (Preferred)
- `place.town`
- `place.city`
- `place.village`
- `place.region`
- `place.country`
- `place.deictic`
- `time.period`
- `time.point`
- `time.frequency`
- `person.group`
- `person.role`
- `person.name`
- `object.transport`
- `object.document`
- `object.household`
- `object.clothing`
- `object.food`
- `object.drink`
- `media`
- `event`
- `abstract.issue`
- `abstract.quantity`
- `quality.evaluative`
- `quality.color`
- `quality.state`
- `discourse`
- `connector`
- `question.word`
- `polite`
- `intensifier`
- `number.cardinal`
- `number.ordinal`
- `grammar.preposition`
- `grammar.article`
- `grammar.pronoun`
- `grammar.verbnoun`
- `grammar.adjective`
- `grammar.noun`
- `expression.idiom`
- `expression.routine`

## Legacy-Supported Classes (Do Not Add New Ones)
- `place-town`
- `time-period`
- `time-point`
- `person-group`
- `object-document`
- `object-transport`
- `abstract-issue`
- `drink`
- `media`
- `event`
- `discourse`
- `connector`
- `question-word`
- `polite`
- `intensifier`
- `place-deictic`

## Provisional Class Rules
If a needed class is not listed:
1. Use `semanticClass` with best candidate name.
2. Set `semanticClassStatus: "provisional"`.
3. Add `semanticClassNotes` with rationale and examples.
4. Add/update catalog only after human review.

## Inlined Rule Proposal Workflow
# Rule Proposal Workflow

Last updated: 2026-02-14

Use this workflow when extraction finds a mutation context that does not match existing `ruleId` values.

## Principle
- External AI may propose new rules.
- External AI must not directly modify production rule catalog logic.
- Human review is mandatory before new rules are promoted to `src/data/rules.js`.

## Where Proposals Live
Unit file optional export:
- `u<N>_ruleProposals`

Central review log:
- `docs/RULE_PROPOSALS.md`

## Proposal Schema
```js
{
  id: "rule-prop-u1-01",
  proposedRuleId: "soft-prep-newcontext",
  course: "mynediad",
  unit: 1,
  mutation: "soft|nasal|aspirate",
  triggerContext: "short Welsh trigger/context label",
  en: "Proposed English explanation",
  cy: "Proposed Welsh explanation",
  rationale: "Why this cannot be represented by existing rule IDs",
  evidenceRefs: [
    { sourceId: "mynediad-de-v2-2023", page: 14, boxLabel: "unit-1-grammar-box", note: "..." }
  ],
  status: "proposed|approved|rejected"
}
```

## Review Steps
1. Extractor adds proposal to `u<N>_ruleProposals` with `status: "proposed"`.
2. Human reviewer checks evidence and overlap with existing rule IDs.
3. Decision:
   - approve -> add rule to `src/data/rules.js` and `docs/RULE_ID_CATALOG.md`
   - reject -> keep record as rejected in proposal log
4. Re-run:
   - `npm run validate:unit-data`
   - `npm run test -- --run`

## Best-Practice Rules
- Prefer reusing existing rule IDs where accurate.
- New rule IDs should be specific but reusable (avoid unit-specific names).
- Keep explanation wording short, pedagogical, and bilingual.


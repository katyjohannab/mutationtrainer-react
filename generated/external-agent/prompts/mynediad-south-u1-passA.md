# External AI One-Shot Prompt (Pass A: Vocab Only)

Generated: 2026-02-14T22:07:42.269Z

Copy this whole file into your external AI in one message.

## Unit Metadata
- level: mynediad
- dialect: south
- unit: 1
- sourceId: mynediad-de-v2-2023
- sourceTitle: Mynediad y De - Fersiwn 2 (argraffiad 2023)

## Attach These Source Pages
- Chapter-opening color-coded vocab page(s) for this unit.

## Execution Directive
- Execute Pass A only from the canonical prompt below.
- Return `u<N>_vocab`, `u<N>_patterns = []`, optional `u<N>_ruleProposals = []`, and `unit<N>.evidence.json`.

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


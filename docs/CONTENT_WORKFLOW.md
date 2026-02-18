# Content Workflow (CSV-First)

Last updated: 2026-02-18

Docs navigation:
- `docs/DOCS_INDEX.md`

## 1. Protected Runtime CSV Files
These remain mandatory:
- `public/data/cards.csv`
- `public/data/prep.csv`
- `public/data/article-sylfaen.csv`

## 2. Dysgu Unit Authoring Workflow
1. Extract unit data with GPT from coursebook pages.
2. Save one CSV per unit under `public/data/<CourseFolder>/unit<N>.csv`.
3. Use canonical header row:
   - `CardId,RuleFamily,RuleCategory,Trigger,Base,Translate,WordCategory,Before,After,Answer,Outcome,TranslateSent,Why,Why-Cym`
4. Register the unit in `src/data/dysguUnitRegistry.js`.
5. Run validation and tests.

## 3. Required Checks
```bash
npm run verify:manual-csv
npm run verify:csv-sources
npm run check:docs
npm run test -- --run
npm run build
```

## 4. Naming Rules
- Unit files must be lowercase and match `unit<number>.csv`.
- Header row is required.
- Registration is explicit (no auto-scan magic).

## 5. Parked Infrastructure
`src/content-gen/*` remains in the repository but is parked and not part of the active content workflow.

## 6. Generated Outputs
- Files under `generated/` are runtime/build artifacts.
- They are useful for review snapshots but are not canonical process documentation.

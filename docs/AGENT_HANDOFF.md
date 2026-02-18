# Agent Handoff

Last updated: 2026-02-18

Current implementation phase: `CSV-first Dysgu course rollout`

## Read Order For New Agents
1. `docs/DOCS_INDEX.md`
2. `docs/ARCHITECTURE.md`
3. `docs/CONTENT_WORKFLOW.md`
4. `docs/AI_DATA_ENTRY_PROMPT.md`
5. `src/DEFINITION_OF_DONE.md`

## Non-Negotiables
- Keep protected manual CSV files intact:
  - `public/data/cards.csv`
  - `public/data/prep.csv`
  - `public/data/article-sylfaen.csv`
- Register every new unit explicitly in `src/data/dysguUnitRegistry.js`.
- Enforce lowercase unit file naming: `unit<number>.csv`.
- Keep `src/content-gen/*` parked, not removed.
- Treat markdown under `generated/` as artifacts, not canonical docs.

## Required Commands
```bash
npm run verify:manual-csv
npm run verify:csv-sources
npm run check:docs
npm run test -- --run
npm run build
```

## Active Source Files
- `src/data/dysguUnitRegistry.js`
- `src/data/csvSources.js`
- `src/services/loadCsv.js`
- `src/data/courses.js`
- `src/data/presets.js`
- `src/components/FiltersPanel.jsx`

## Expected UX Model
- Dysgu Cymraeg Courses: course -> dialect -> unit
- Starter Packs: quick curated packs
- Advanced Filters: build custom sessions across full pool

# Copilot Instructions

Last updated: 2026-09-26

## Project Snapshot
React/Vite Welsh mutation trainer.

Runtime data is manual-CSV-first and protected:
- `public/data/cards.tsv`
- `public/data/prep.csv`
- `public/data/article-sylfaen.csv`

## Important Commands
```bash
npm run verify:manual-csv
npm run verify:csv-sources
npm run lint
npm run test -- --run
npm run build
```

## Active Authoring Model
The generator is parked. Author validated CSV/TSV and register topic packs or course-derived sources through `src/data/csvSources.js`. Follow `docs/IMPROVEMENT_PLAN.md`: retain/correct the full bank, support custom sessions, and do not require one session per unit. Ask the owner before any design change.

Use:
- `docs/AI_DATA_ENTRY_PROMPT.md`
- `docs/CONTENT_WORKFLOW.md`

## Guardrails
- Do not modify or remove protected manual CSV files via automation.
- Do not re-enable legacy generated CSV runtime sources without explicit QA sign-off.
- Legacy/dodgy/unused files are archived under `archive/legacy-unused-2026-02-14/`.

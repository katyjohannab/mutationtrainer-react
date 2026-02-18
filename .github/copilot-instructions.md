# Copilot Instructions

Last updated: 2026-02-14

## Project Snapshot
React/Vite Welsh mutation trainer.

Runtime data is manual-CSV-first and protected:
- `public/data/cards.csv`
- `public/data/prep.csv`
- `public/data/article-sylfaen.csv`

## Important Commands
```bash
npm run verify:manual-csv
npm run validate:unit-data
npm run lint
npm run test -- --run
npm run build
```

## Active Authoring Model
New coursebook extraction is authored in:
- `src/content-gen/unit-data/<level>/<dialect>/unit<N>.js`

Use:
- `docs/AI_DATA_ENTRY_PROMPT.md`
- `docs/CONTENT_WORKFLOW.md`

## Guardrails
- Do not modify or remove protected manual CSV files via automation.
- Do not re-enable legacy generated CSV runtime sources without explicit QA sign-off.
- Legacy/dodgy/unused files are archived under `archive/legacy-unused-2026-02-14/`.

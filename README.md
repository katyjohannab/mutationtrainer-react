# Hyfforddwr Treiglad (Welsh Mutation Trainer)

Last updated: 2026-02-18

React/Vite flashcard trainer focused on Welsh mutation practice.

## Start Here (Humans + Agents)
Read first:
- `docs/DOCS_INDEX.md`
- `docs/AGENT_HANDOFF.md`

## Active Runtime Model (CSV-First)
Runtime loads:
- protected manual CSVs in `public/data`
- registered Dysgu Cymraeg unit CSVs from `src/data/dysguUnitRegistry.js`

Source list and metadata stamping:
- `src/data/csvSources.js`
- `src/services/loadCsv.js`

## Content Authoring (Current)
Use GPT/manual workflow to create per-unit CSV files under `public/data/...` and register each unit in:
- `src/data/dysguUnitRegistry.js`

Required commands:
```bash
npm run verify:manual-csv
npm run verify:csv-sources
npm run check:docs
npm run test -- --run
npm run build
```

## UI Model
Filter rail now uses:
- `Dysgu Cymraeg Courses` (course -> dialect -> unit)
- `Starter Packs`
- `Advanced Filters`

## Parked Infrastructure
`src/content-gen/*` is kept for future scale but is currently parked and not part of active runtime workflow.

## Development
```bash
npm install
npm run dev
npm run lint
npm run test -- --run
npm run build
```

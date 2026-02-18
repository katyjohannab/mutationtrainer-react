# Architecture

Last updated: 2026-02-18

Docs navigation:
- `docs/DOCS_INDEX.md`

## 1. Runtime Architecture (CSV-First)
Runtime data comes from:
- protected manual CSV files: `cards.csv`, `prep.csv`, `article-sylfaen.csv`
- registered Dysgu Cymraeg unit CSV files from `src/data/dysguUnitRegistry.js`

Source composition and metadata map:
- `src/data/csvSources.js`

## 2. Runtime Data Flow
1. Source list + metadata registration (`src/data/csvSources.js`)
2. CSV load and normalization (`src/services/loadCsv.js`)
3. Source metadata stamping (`course/level/dialect/unit`)
4. Preset + manual filtering (`src/utils/applyFilters.js`)
5. Card selection (`src/utils/pickNext.js`, `src/utils/leitner.js`)
6. Answer checking (`src/utils/checkAnswer.js`)

## 3. Course Navigation Model
Courses UI is driven by:
- `src/data/dysguUnitRegistry.js` (single source of truth)
- `src/data/courses.js` (derived course model)
- `src/data/presets.js` (preset map)

Flow:
- Course -> Dialect -> Unit (single unit selectable)
- Starter packs remain separate
- Advanced filters can still shape a general mixed pool

## 4. CSV Hygiene and Governance
Strict verification command:
```bash
npm run verify:csv-sources
```

Checks include:
- registered files exist
- unit filename pattern `unit<number>.csv` (lowercase)
- canonical header row is present
- required CSV columns are present
- no source duplication/mismatch

## 5. Parked Generator Infrastructure
The JS unit-data generator stack remains in repo for future scale:
- `src/content-gen/*`

Status:
- kept
- parked
- excluded from active runtime workflow

## 6. Generated Markdown Artifacts
Markdown under `generated/` is output data, not canonical documentation.

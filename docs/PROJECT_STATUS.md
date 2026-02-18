# Documentation Status

Last updated: 2026-02-18

## Current Active State
- Runtime is CSV-first.
- Course/unit content is registered in `src/data/dysguUnitRegistry.js`.
- Course UI is driven by registry-derived data (`src/data/courses.js`).
- Canonical docs are indexed in `docs/DOCS_INDEX.md`.
- Filter rail labels are now:
  - Dysgu Cymraeg Courses
  - Starter Packs
  - Advanced Filters

## Guardrails in Place
- strict CSV source verification (`npm run verify:csv-sources`)
- protected manual CSV verification (`npm run verify:manual-csv`)
- docs freshness verification (`npm run check:docs`)

## Parked (Retained for Future Scale)
- `src/content-gen/*`
- legacy generator-oriented docs now marked as parked

## Next Operational Steps
1. Add more registered unit CSV files by course/dialect/unit.
2. Keep unit file names lowercase (`unit<number>.csv`).
3. Maintain bilingual copy parity for new UI strings.

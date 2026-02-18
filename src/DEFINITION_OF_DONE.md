# Definition of Done

Last updated: 2026-02-18

## 1. Runtime Safety
- Runtime source list includes protected manual CSV files and explicitly registered Dysgu unit CSV files.
- `npm run verify:manual-csv` passes.
- `npm run verify:csv-sources` passes.
- Protected manual files are not removed or overwritten by automation.

## 2. Content Quality (CSV-First)
- New unit content exists as `public/data/<CourseFolder>/unit<N>.csv`.
- Unit file is registered in `src/data/dysguUnitRegistry.js`.
- Unit filename is lowercase and matches `unit<number>.csv`.
- Canonical CSV header row is present.

## 3. Engineering Quality
- `npm run lint` passes.
- `npm run test -- --run` passes.
- `npm run build` passes.
- No dead imports introduced.

## 4. Documentation Quality
- `README.md`, `PROJECT_STATUS.md`, and all required files in `docs/` are updated.
- Parked generator docs are explicitly marked `PARKED`.
- `npm run check:docs` passes.

## 5. Archive Discipline
- Legacy/unused files stay under `archive/`.
- Archive items are not used by runtime code paths.
- Archive manifest explains why each group was moved.

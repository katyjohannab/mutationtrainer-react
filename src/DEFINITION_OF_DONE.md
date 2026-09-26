# Definition of Done

Last updated: 2026-09-26

## 1. Runtime Safety
- Runtime source list includes protected manual files and explicitly registered course-derived and topic-pack sources.
- `npm run verify:manual-csv` passes.
- `npm run verify:csv-sources` passes.
- Protected manual files are not removed or overwritten by automation.

## 2. Content Quality (CSV-First)
- New content is registered in the pack or course-source registry and passes the shared whole-bank validator.
- Sessions serve a learner need/topic/construction; do not require one session per unit.
- IDs are globally unique and stable. Record evidence/review status; structural validity is not Welsh approval.
- Canonical CSV header row is present.

## Design preservation
- Preserve the existing design, mobile responsiveness and touch targets. Obtain owner permission before any design change.

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

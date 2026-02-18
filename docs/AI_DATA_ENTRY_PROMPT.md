# AI Data Entry Prompt (CSV Runtime Target)

Last updated: 2026-02-18

Docs navigation:
- `docs/DOCS_INDEX.md`

Use this with an external AI that has no repo access.

## Goal
Produce runtime-ready CSV rows for one Dysgu Cymraeg unit.

## Output Target
- One file per unit: `public/data/<CourseFolder>/unit<N>.csv`
- File must include the canonical header row exactly once at the top.

## Canonical Header
```csv
CardId,RuleFamily,RuleCategory,Trigger,Base,Translate,WordCategory,Before,After,Answer,Outcome,TranslateSent,Why,Why-Cym
```

## Required Row Rules
- `CardId` must be unique within the file.
- `Outcome` should use `SM`, `NM`, `AM`, or `NONE`.
- Keep `Before` and `After` split around the answer slot.
- Include both English and Welsh explanations (`Why`, `Why-Cym`).
- Do not invent grammar claims not supported by source material.

## Required Input Bundle (to external AI)
1. Full unit pages from the coursebook.
2. Level/course, dialect, and unit number.
3. This prompt.

## Required Output Bundle
1. CSV content with canonical header.
2. Brief extraction coverage note listing which unit sections were used.

## After Receiving AI Output
1. Save CSV to the unit path under `public/data`.
2. Register the unit in `src/data/dysguUnitRegistry.js`.
3. Run:
```bash
npm run verify:csv-sources
npm run test -- --run
npm run build
```

## Notes
- Active runtime is CSV-first.
- JS unit-data generator workflow is currently parked.

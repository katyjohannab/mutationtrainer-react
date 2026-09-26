# AI Data Entry Prompt (CSV Runtime Target)

Last updated: 2026-09-26

Docs navigation:
- `docs/DOCS_INDEX.md`

Use this with an external AI that has no repo access.

## Goal
Produce draft CSV rows for an agreed mutation context/topic and appropriate learner level. Use relevant Dysgu Cymraeg pages as evidence, and broaden contexts where supported. Do not require one session per unit; some units contain no mutation material. AI output needs linguistic review before it is described as reviewed.

## Output Target
- An explicitly registered topic/pack file under `public/data`, or an existing course-derived unit source where appropriate. A file is not necessarily one learner session.
- File must include the canonical header row exactly once at the top.

## Canonical Header
```csv
CardId,RuleFamily,RuleCategory,Trigger,Base,Translate,WordCategory,Before,After,Answer,Outcome,TranslateSent,Why,Why-Cym
```

## Required Row Rules
- `CardId` must be stable and globally unique across the whole bank.
- `Outcome` should use `SM`, `NM`, `AM`, or `NONE`.
- Keep `Before` and `After` split around the answer slot.
- Include both English and Welsh explanations (`Why`, `Why-Cym`).
- Do not invent grammar claims not supported by source material.

## Required Input Bundle (to external AI)
1. Relevant coursebook pages and other grammar evidence for the chosen context.
2. Intended level/course and dialect, plus page/unit references as provenance.
3. This prompt.

## Required Output Bundle
1. CSV content with canonical header.
2. Brief extraction coverage note listing which unit sections were used.

## After Receiving AI Output
1. Review the Welsh and save CSV under the agreed source path in `public/data`.
2. Register a topic pack in `src/data/packRegistry.js`, or a course-derived source in `src/data/dysguUnitRegistry.js`.
3. Run:
```bash
npm run verify:csv-sources
npm run test -- --run
npm run build
```

## Notes
- Active runtime is CSV-first.
- JS unit-data generator workflow is currently parked.

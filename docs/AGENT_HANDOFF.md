# Agent handoff

Last updated: 2026-09-26

Read [the agreed plan](IMPROVEMENT_PLAN.md), [Phase 1 delivery](PHASE_1_DELIVERY.md), [content workflow](CONTENT_WORKFLOW.md) and [runtime runbook](DEPLOY_ADMIN_MODE.md). The September audit is historical; Phase 1 repairs are now in the working copy.

## Owner's requirements

- Adult learner pilot. Retain, correct and expand the full bank; broad contexts are central to the product.
- Topic/construction/level-appropriate sessions and learner-designed filters are equally important. Do not force a session for every coursebook unit. Units/pages are evidence and provenance.
- Dialect matters where it changes the answer/context; register is less urgent.
- Preserve the visual design, responsiveness and touch interaction. Ask the owner before implementing any design change, even one suggested in the audit. Phase 1 changes behaviour/data plumbing only.
- Support long-term progress. Help the owner choose and set up hosting; do not assume they can run a VPS.

## Content safeguards

Keep the protected manual files (`cards.tsv`, `prep.csv`, `article-sylfaen.csv`) intact unless a specific reviewed correction is authorized. Do not bulk-regenerate their Welsh using the mutation helper. These three files and the owner's existing registry/preset changes remain byte-identical to the Phase 1 baseline.

Register topic packs in `src/data/packRegistry.js`; legacy/course-derived sources can use `src/data/dysguUnitRegistry.js`. Both feed `src/data/csvSources.js`. Registration is explicit. A source file need not correspond to a learner session. Existing unit files keep the lowercase `unit<number>.csv` convention; this is a file naming convention, not a product requirement.

All registered rows must pass `src/services/cardFormat.js`. Authored IDs/answers are required; no fallback identity or generated answer masks a missing field. Missing classification/translation/review metadata is reported for Phase 2, without silently deleting the bank. Structural validation is not Welsh review. Keep `src/content-gen/` parked and generated markdown noncanonical.

Admin writes require a source revision, preserve IDs, create a verified private backup, then replace atomically. The Node runtime serves that canonical directory. See the runbook before altering persistence. Do not write secrets to logs or version control.

## Required checks

```text
npm run lint
npm run verify:manual-csv
npm run verify:csv-sources
npm run check:docs
npm test -- --run
npm run build
```

Vite builds automatically validate the content. CI runs the checks before Pages deployment. Phase 2 is next: fix known Welsh errors, review the entire bank by context, and supply useful filter metadata using the references. The supplied Uwch 1 PDF has only one page; do not imply it is the complete book. No hosting deployment or UI redesign has been authorized by completing Phase 1.

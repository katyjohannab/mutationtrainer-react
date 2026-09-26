# Phase 1 delivery and content contract

Last updated: 2026-09-26

Phase 1 is implemented in the local working copy. Nothing has been deployed. The [revised improvement plan](IMPROVEMENT_PLAN.md) incorporates the owner's full-bank, custom-session and design constraints.

## Changes

- All **3,499 cards across six registered sources** are retained. Validation now uses the live manual/unit/pack registry.
- Repaired quoting in the first 17 records of `public/data/Uwch1/unit2.csv`. Sentences containing commas, answers, outcomes and explanations now land in the intended fields. This repairs structure, not the outstanding Welsh claims or wrong-language explanations.
- Changed only the five duplicate Unit 2 IDs: `U110055`–`U110059` become `UWCH-S-U2-0055`–`UWCH-S-U2-0059`. The five Unit 1 IDs remain unchanged. The original working-copy registry/preset files and all three protected manual files were left intact.
- Shared parser/normaliser/validator in `src/services/cardFormat.js` is used by runtime loading, admin saving and build checks. Fetch/parse errors reject the load rather than silently dropping a source. Learner-facing load/error presentation remains an unapproved Phase 4 design decision.
- TSV quotes are literal. The writer no longer adds escaping that the reader treats as content. Tabs/newlines within TSV cells are rejected; CSV supports proper quoted multiline cells.
- Saving requires the loaded source's SHA-256 revision. A per-source filesystem lock, verified backup, flushed temporary file and atomic replacement protect edits. Unchanged forms preserve bytes. Backups live outside public files.
- A Node HTTP server replaces Vite preview as `start:prod`. Development, preview and Node runtime all serve the canonical editable data with `no-store`, including an optional separate persistent directory. No rebuild is required to see a saved data edit on this runtime.
- Browser learning history migrates to `wm_leitner_v2`, retaining attributable reviews. The five ambiguous v1 entries reset; the original `wm_leitner_v1` data remains untouched. New reviews of those IDs are retained normally. Revision hashes are separate from card identity.
- Existing report composers include source and revision. No report was sent. Opening the editor preserves the authored answer until the user explicitly chooses its existing suggestion control.
- CI runs lint, protected-file verification, registered-source validation and tests before building. Vite's build itself validates content, even when invoked directly.

## Validation boundary

Structural errors block load/build/save: malformed row widths/quoting, unknown or conflicting columns, missing authored identity/base/answer/outcome, unknown outcomes, missing prompt structure, empty answer variants and duplicate IDs. ID comparisons for uniqueness are case insensitive. Source metadata is applied without inventing unknown levels or dialects.

Editorial warnings do not delete content or count as linguistic review. Current missing-field counts are: level 2,579; dialect 2,583; sentence translation 1,564; category 792; English explanation 2; Welsh explanation 3; rule ID 3,499. A card may have several warnings. These are 11,022 missing-field observations, **not 11,022 Welsh errors**. Incorrect nonempty text also still requires review.

New authored rows need stable globally unique IDs. Do not derive identity from row position or rewrite an answer because a helper disagrees. To change identities or add/remove cards, use source-controlled changes plus whole-bank validation; the live editor and restore command deliberately retain the existing ID set.

## Verification

Completed locally: 114 tests in 16 files, ESLint, protected-manual verification, whole-bank validation, documentation check, and production builds at both `/` and `/mutationtrainer-react/`. The final local build uses `/`. A browser smoke check of the built Node runtime loaded all 3,499 cards and completed a reveal/next cycle with no console errors. This was not a new cross-browser or physical-phone design certification. The build reports an existing stale Browserslist dataset warning; dependencies were not upgraded in Phase 1.

Comparison with the audit's runtime snapshot found changed teaching fields only in the 17 repaired Unit 2 records. Hash comparison confirmed that the three protected manual files, other registered sources and five pre-existing registry/preset files match the captured baseline bytes.

The regression suite covers all-source cell round-trips, malformed fixtures, duplicate IDs, no-op saves, exactly one changed TSV cell, invalid-save rejection, stale/concurrent saves, backup and rename failures, exact restore with an undo backup, canonical data after save/restart at both `/` and `/mutationtrainer-react/`, and progress migration/corruption.

The baseline is in `output/phase1-baseline/`: byte copies of six source files and five existing registry/preset files, a SHA-256 manifest, and a record of the 17 repaired Unit 2 rows. Duplicate byte copies are ignored by Git; the manifest and repair record are reviewable. Baseline capture is not a substitute for an off-machine operational backup.

See [the admin runbook](DEPLOY_ADMIN_MODE.md) for local startup and restoration. All admin mutation tests use isolated temporary data; they do not edit the live protected teaching files.

## New reference inventory

PDF page counts were checked locally; no complete linguistic review of these books has been performed in Phase 1.

| Reference file | PDF pages | Scope |
| --- | ---: | --- |
| `Mynediad y De - Fersiwn 2 (argraffiad 2023).pdf` | 366 | Existing Mynediad South reference |
| `sylfaen-de (1).pdf` | 371 | Added Sylfaen South reference |
| `sylfaen-gogledd.pdf` | 377 | Added Sylfaen North reference |
| `uwch-1_de-cymru_fersiwn-2.pdf` | **1** | Single page, printed page 5 / Unit 1 opening; not the complete book |
| `uwch-2_fersiwn_2_2025 (1).pdf` | 342 | Added Uwch 2 reference |

Use coursebook units/pages as evidence for level/context suitability, not a requirement to create a session for every unit. The incomplete Uwch 1 reference remains a Phase 2 source gap.

## Remaining boundaries

The Welsh editorial corrections, session/repeated-grading bugs, digraph/distractor issues, fuller progress features and catalogue/filter improvements remain in later phases. Hosting is not yet selected or deployed. UI classes, CSS, breakpoints, spacing, touch targets and visible layout have not been changed. A specific design proposal requires the owner's permission.

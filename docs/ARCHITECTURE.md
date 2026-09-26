# Architecture

Last updated: 2026-09-26

See the [agreed plan](IMPROVEMENT_PLAN.md) and [Phase 1 delivery](PHASE_1_DELIVERY.md) for scope and outstanding defects.

## Data flow

1. `src/data/csvSources.js` composes protected manual files, `dysguUnitRegistry.js` source registrations and `packRegistry.js` topic-pack registrations.
2. `src/services/loadCsv.js` fetches each registered source without caching. `cardFormat.js` parses and validates the authored model, stamps source metadata and reports provenance. The combined load checks global IDs and rejects a partial/broken bank.
3. `src/utils/applyFilters.js` filters the full pool using presets and learner filters. Unknown outcomes are not interpreted as no mutation.
4. `pickNext.js` selects by stable card ID. `leitner.js` retains versioned local learning history. Revisions identify source contents, not card identity.
5. `checkAnswer.js` grades the authored accepted answers. Grammar/helper and session-state defects identified in the audit remain Phase 3 work.

## Catalogue versus storage

Topic/construction packs and learner-designed sessions are the agreed product model. Dysgu course level/dialect/unit metadata provides alignment and provenance. An authored file, unit reference and learner session are different things; do not require one session per unit. Existing course/picker code is partly legacy and will be reconciled through the plan, with permission before design changes.

## Validation and saves

`cardFormat.js` is shared by browser loading, server editing and `server/validateContent.js`. Vite's build plugin validates the entire registered bank. `scripts/verify-csv-sources.cjs` provides command-line diagnostics, including `--json`. Structural errors block publication; editorial metadata warnings remain a separate full-bank review backlog.

`server/adminApi.js` implements session/login/logout/save endpoints. A save carries source, row index, expected card ID, loaded source hash and changed fields. The server checks identity and revision, validates the resulting file and preserves all IDs. `contentRepository.js` locks the source, makes a verified immutable backup, writes/flushed a sibling temporary file, then atomically replaces the source. `restoreSourceRevision` uses the same safeguards.

`server/httpServer.js` serves built assets and admin routes with Node. `dataMiddleware.js` serves the canonical data directory before any built data copy can be reached. Vite development/preview uses the same data/admin middleware. Static hosting serves the validated build and cannot perform live edits.

Defaults are `public/data` and private `.content-revisions`; persistent hosted locations are configured through `WM_DATA_DIR` and `WM_REVISION_DIR`. See the [runbook](DEPLOY_ADMIN_MODE.md). No hosted server has been deployed.

## Parked infrastructure

`src/content-gen/` remains in the repository for future work but is not the active authoring/runtime pipeline. Markdown in `generated/` and diagnostic files in `output/` are artifacts. Active source/test discovery excludes copied baseline tests under `output/`.

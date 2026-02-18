# Docs Index

Last updated: 2026-02-18

Use this file as the starting point for any human or agent onboarding.

## 1) Canonical Active Docs
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/CONTENT_WORKFLOW.md`
- `docs/AI_DATA_ENTRY_PROMPT.md`
- `docs/PROJECT_STATUS.md`
- `docs/AGENT_HANDOFF.md`
- `docs/TAXONOMY.md`
- `src/DEFINITION_OF_DONE.md`

## 2) Parked Docs (Retained, Not Active)
These are intentionally retained for future scale-up but are not part of current day-to-day operation:
- `docs/EXTERNAL_AGENT_WORKFLOW.md`
- `docs/SCHEMA.md`
- `docs/RULE_ID_CATALOG.md`
- `docs/RULE_PROPOSAL_WORKFLOW.md`
- `docs/RULE_PROPOSALS.md`
- `docs/SEMANTIC_CLASS_CATALOG.md`
- `docs/SOURCE_INDEX.md`
- `src/content-gen/unit-data/README.md`
- `src/content-gen/qa/README.md`

## 3) Archive Docs
- `archive/README.md`
- `archive/legacy-unused-2026-02-14/MANIFEST.md`

Archive docs describe retired files and rationale. Archive paths are non-runtime.

## 4) Generated Markdown Artifacts
Markdown files under `generated/` are build/run artifacts, not canonical documentation.
Examples:
- `generated/external-agent/prompts/*.md`
- `generated/review/**/qa-report.md`

Treat generated markdown as output snapshots tied to the run that produced them.

## 5) Required Validation Commands
```bash
npm run verify:manual-csv
npm run verify:csv-sources
npm run check:docs
npm run test -- --run
npm run build
```


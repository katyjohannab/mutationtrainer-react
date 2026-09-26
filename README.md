# Treiglap — Welsh Mutation Trainer

Last updated: 2026-09-26

React/Vite mutation practice for an adult learner pilot, retaining a broad range of Welsh contexts. The current bank contains 3,499 cards; structural checks pass, but the Welsh editorial audit remains in progress.

Start with the [improvement plan](docs/IMPROVEMENT_PLAN.md), [Phase 1 delivery](docs/PHASE_1_DELIVERY.md) and [docs index](docs/DOCS_INDEX.md). Preserve the existing design; ask the owner before visual changes. Useful topic/construction practice and learner-designed filtered sessions are central. Coursebook unit references must not turn into a compulsory session for every unit.

## Run locally

Use Node 22.18 or later in the Node 22 line and the lockfile:

```powershell
npm ci
npm run dev
```

Open the local address Vite prints. If dependencies are already installed, `npm run dev` is sufficient. If the Windows npm launcher is broken, the installed app can be started directly with `node node_modules/vite/bin/vite.js`; repair npm separately before dependency installation.

For a built local app:

```powershell
npm run build
npm run start:prod
```

Open the address printed by the server (normally `http://127.0.0.1:4173/`). `WM_BASE_PATH` changes the path and must be the same at build and startup. `start:prod` now runs the Node HTTP server, not Vite preview. It defaults to local access; this command alone does not publish a website.

## Content and editing

The runtime source list is `src/data/csvSources.js`, combining protected manual files, registered course-derived files and `src/data/packRegistry.js` topic packs. `src/services/cardFormat.js` supplies the shared content contract. The generator under `src/content-gen/` remains parked.

For local browser editing, set `WM_ADMIN_PASSWORD` in the git-ignored `.env.local` or the current process environment, then restart the local server. Do not print or commit the password. The existing Admin badge opens login and editing. A save validates, backs up and replaces the canonical file; a fresh page sees it immediately. Without a password the learner app still works and admin login is unavailable.

The [admin runbook](docs/DEPLOY_ADMIN_MODE.md) explains revision conflicts, backups, restoration and persistent data. GitHub Pages remains static: make corrections locally, validate and publish through the normal repository workflow. Choosing and setting up a writable hosted service remains a separate task with the owner.

## Checks

```powershell
npm run lint
npm run verify:manual-csv
npm run verify:csv-sources
npm run check:docs
npm test -- --run
npm run build
```

Missing editorial metadata is reported separately from structural failures. A successful build is not Welsh linguistic approval. See [content workflow](docs/CONTENT_WORKFLOW.md) and [agent handoff](docs/AGENT_HANDOFF.md) before changing teaching material.

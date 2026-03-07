# Hyfforddwr Treiglad (Welsh Mutation Trainer)

Last updated: 2026-02-18

React/Vite flashcard trainer focused on Welsh mutation practice.

## Start Here (Humans + Agents)
Read first:
- `docs/DOCS_INDEX.md`
- `docs/AGENT_HANDOFF.md`

## Active Runtime Model (CSV-First)
Runtime loads:
- protected manual CSVs in `public/data`
- registered Dysgu Cymraeg unit CSVs from `src/data/dysguUnitRegistry.js`

Source list and metadata stamping:
- `src/data/csvSources.js`
- `src/services/loadCsv.js`

## Content Authoring (Current)
Use GPT/manual workflow to create per-unit CSV files under `public/data/...` and register each unit in:
- `src/data/dysguUnitRegistry.js`

Required commands:
```bash
npm run verify:manual-csv
npm run verify:csv-sources
npm run check:docs
npm run test -- --run
npm run build
```

## UI Model
Filter rail now uses:
- `Dysgu Cymraeg Courses` (course -> dialect -> unit)
- `Starter Packs`
- `Advanced Filters`

## Parked Infrastructure
`src/content-gen/*` is kept for future scale but is currently parked and not part of active runtime workflow.

## Development
```bash
npm install
npm run dev
npm run lint
npm run test -- --run
npm run build
```

## Operator Quickstart (Admin Mode, VPS-First)
For writable admin editing in production-like setup:
1. Set `WM_ADMIN_PASSWORD`
2. Build the app (`npm run build`)
3. Start server runtime (`npm run start:prod`)
4. Ensure `public/data/**` is writable and persistent

Full runbook:
- `docs/DEPLOY_ADMIN_MODE.md`
- systemd template: `deploy/systemd/mutationtrainer.service`
- env template: `deploy/systemd/mutationtrainer.env.example`

## Admin Mode (Simple Setup + Daily Use)

### Set Password Permanently (Windows)
Run once:
```powershell
setx WM_ADMIN_PASSWORD "your-strong-password"
```
Important:
- Close and reopen terminal/VS Code after running `setx`.
- `setx` does not update the current shell immediately.

Verify:
```powershell
echo $env:WM_ADMIN_PASSWORD
```

### Temporary Password (Current Terminal Only)
```powershell
$env:WM_ADMIN_PASSWORD="your-strong-password"
```

### Start Admin-Enabled Runtime
```powershell
npm run build
npm run start:prod
```
Open:
- `http://localhost:4173/mutationtrainer-react/`

### Use Admin Mode (Step-by-Step)
1. Open the app and practice normally.
2. Click the `Admin` badge near the `Noticed a mistake?` area.
3. Enter your admin password and sign in.
4. Click `Edit current card`.
5. Fix fields you want (`before`, `base`, `after`, `answer`, `outcome`, `trigger`, `category`, `translate`, `translateSent`, `why`, `whyCym`).
6. Click `Save to source`.
7. Confirm you see `Saved to source file.`.
8. Click next card and continue.

### Quick Check: Is Server Password Configured?
```powershell
Invoke-RestMethod http://localhost:4173/api/admin/session
```
Expected:
- `configured: True` means password is set.
- `authenticated: False` means not logged in yet (normal before login).

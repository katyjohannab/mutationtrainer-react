# Local editing and writable runtime

Last updated: 2026-09-26

Phase 1 provides a tested Node runtime and safe local editing. No hosting provider has been selected or deployed. The owner needs assistance with hosting; the older VPS templates are optional deployment examples, not a requirement to administer a VPS.

## Two publishing arrangements

- **Current static publishing:** learners use the built site on GitHub Pages. Make and validate corrections locally, review the changes in source control, then deploy the build. A static site cannot save source files through an admin API.
- **Writable Node runtime:** serve the built UI and the canonical CSV/TSV directory from `server/httpServer.js`. The learner data route reads the same files that editing writes, so a correction is visible without rebuilding. For hosting, both data and revision history need persistent storage outside replaceable deployment files.

The learner app works with no admin password. Login is enabled only when a password is configured. Do not expose a writable deployment publicly until its HTTPS, login abuse protection, backup/retention and restore arrangements are in place. Phase 1 tests local persistence; public operations remain Phase 5 work.

## Start on this Windows computer

From the repository directory, with dependencies installed:

```powershell
npm run build
npm run start:prod
```

The default address is `http://127.0.0.1:4173/`. Use the address printed at startup if a base path is configured. `start:prod` loads `.env.local` when present without printing its contents; externally set environment variables take precedence. Development and preview also expose the same data/admin middleware, but the Node server is the supported built runtime.

To enable the existing admin controls, add a strong `WM_ADMIN_PASSWORD` to `.env.local` or set it in the server environment, then restart. `.env.local` is ignored by Git. Verify configuration without displaying the password:

```powershell
Invoke-RestMethod http://127.0.0.1:4173/api/admin/session
```

`configured: true` means a password is set. `authenticated: false` is normal before login. If using a base path, prepend it to `/api/admin/session`.

Open Admin, sign in, edit the current card and save. Opening the editor retains the authored answer. Its existing suggestion button is optional; suggestions can be linguistically wrong and must be checked. If a save reports a source revision conflict, preserve the intended correction, reload and reapply it to the latest version. No conflicting edit is silently overwritten. Without HTTPS or localhost, some browsers cannot calculate editing revisions; use localhost for local editing and HTTPS for hosting.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `WM_ADMIN_PASSWORD` (or `ADMIN_PASSWORD`) | unset | Enables shared-password admin login |
| `WM_BIND_HOST` (or `HOST`) | `127.0.0.1` | Network interface; a host may require `0.0.0.0` |
| `WM_PORT` (or `PORT`) | `4173` | HTTP port |
| `WM_BASE_PATH` | `/` | Must match the build path, e.g. `/mutationtrainer-react/` |
| `WM_DATA_DIR` | `<repo>/public/data` | Canonical registered source files, preserving relative paths |
| `WM_REVISION_DIR` | `<repo>/.content-revisions` | Private revision backups/locks; must be outside public, dist and data directories |
| `WM_ADMIN_SESSION_TTL_HOURS` | `12` | Session expiry; limited to 0.25–168 hours |
| `NODE_ENV` | process default | `production` marks cookies Secure; a public host needs HTTPS |

Admin sessions are in process memory and require a new login after restart. The data file lock works across processes sharing one volume; distributed sessions/replicas are not configured. Keep a single application instance until that is deliberately addressed.

On a managed host, configure persistent `WM_DATA_DIR` **and** `WM_REVISION_DIR`. Seed an empty data volume once from the validated registered files in `public/data`; never overwrite existing edited files during a release. Starting the Node server validates every registered source. A newly registered source must be copied to the persistent volume before starting that release. The build validates the repository's publishing data; the server validates the actual runtime directory.

## Backups and restore

Each changed source has immutable, hash-verified copies under:

```text
<WM_REVISION_DIR>/<source-relative-path>/<sha256>.source
```

The hash is also the source revision carried by cards and report drafts. An unchanged form causes no rewrite. Rejected validation, backup failure and rename failure preserve the existing source. Temporary files are siblings of their sources so replacement stays on one filesystem. This protects ordinary write failures; it is not a guarantee against storage hardware failure or sudden power loss. Keep an off-machine copy of the data and history when hosted.

To list backups for the default local `cards.tsv` source:

```powershell
Get-ChildItem -LiteralPath .content-revisions/cards.tsv -Filter *.source
(Get-FileHash -LiteralPath public/data/cards.tsv -Algorithm SHA256).Hash.ToLowerInvariant()
```

The second command supplies the current revision. Choose the backup hash and run:

```text
node scripts/restore-content.mjs cards.tsv BACKUP_SHA256 CURRENT_SHA256 --apply
```

Substitute the real hashes. The restore uses the same environment paths as saving, validates the backup, rejects a stale current revision and retains a backup of the current version before restoring. It deliberately refuses a restore that adds/removes/renames card IDs; use a reviewed repository migration for those changes. Reload the browser afterward. These steps are covered by isolated automated save/restore tests.

A process crash can leave `write.lock` in a source's history folder. Only after stopping all editing/server processes and verifying no save is running, remove that specific stale lock and restart. Never clear a live process's lock to force a save.

## Release checks

```powershell
npm run lint
npm run verify:manual-csv
npm run verify:csv-sources
npm test -- --run
npm run build
```

The test suite saves copies of the real data in temporary directories. It checks one-cell TSV edits, unchanged forms, invalid content, concurrent/stale writes, failure recovery, restore, and anonymous data fetches after save and restart at `/` and `/mutationtrainer-react/`.

A public hosting walkthrough, provider/cost choice, login throttling, backup retention schedule and remote recovery test remain to be completed with the owner. No service, account or paid resource was created in Phase 1.

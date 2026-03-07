# Admin Mode Deployment (Writable Runtime)

Last updated: 2026-03-07

This guide explains exactly how to run the app with writable admin mode (live CSV/TSV edits).

## Why Static Hosting Is Not Enough
Admin save writes to files under `public/data/**` through server endpoints:
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `POST /api/admin/save-card`

A static host (for example pure GitHub Pages) can only serve files and cannot run this Node API or write files on save.

## Local Run (Windows PowerShell)
Run these commands from the repo root.

1. Install dependencies (once):
```powershell
npm install
```

2. Set admin password for the current terminal session:
```powershell
$env:WM_ADMIN_PASSWORD = "choose-a-strong-password"
```

3. Build production assets:
```powershell
npm run build
```

4. Start the Node preview server (serves app + `/api/admin/*`):
```powershell
npm run preview -- --host 0.0.0.0 --port 4173
```

5. Open:
- Local machine: `http://localhost:4173/mutationtrainer-react/`
- Same network (optional): `http://<your-lan-ip>:4173/mutationtrainer-react/`

## Local Run (macOS/Linux)
```bash
npm install
export WM_ADMIN_PASSWORD="choose-a-strong-password"
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```
Open `http://localhost:4173/mutationtrainer-react/`.

## Persisting Password
- Linux/macOS shell profile: add `export WM_ADMIN_PASSWORD="..."` to `.bashrc`, `.zshrc`, etc.
- Windows persistent env var:
```powershell
setx WM_ADMIN_PASSWORD "choose-a-strong-password"
```
Then open a new terminal before starting the server.

## Writable Filesystem Requirement
The server process user must be able to write under:
- `public/data/cards.csv`
- `public/data/prep.csv`
- `public/data/article-sylfaen.csv`
- any registered unit/pack file under `public/data/**`

Quick check (PowerShell):
```powershell
Test-Path .\public\data\cards.csv
```
If save fails with permission errors, fix folder permissions for the service user.

## Cloud/Container Requirement (Persistent Volume)
If you deploy in Docker/cloud, app writes must survive restart/redeploy.
Mount persistent storage to the app path containing `public/data`.

### Example: Docker (bind mount)
```bash
docker run -d \
  -p 4173:4173 \
  -e WM_ADMIN_PASSWORD="choose-a-strong-password" \
  -v /host/mutation-data:/app/public/data \
  your-image \
  sh -c "npm run build && npm run preview -- --host 0.0.0.0 --port 4173"
```

Meaning:
- `/host/mutation-data` is persistent storage on host
- `/app/public/data` is where the app reads/writes CSV/TSV

## Reverse Proxy / HTTPS
For production, run behind HTTPS (Nginx/Caddy/cloud proxy). The admin auth cookie is intended for secure deployments.

## Deployment Checklist
1. Server can run Node process continuously.
2. `WM_ADMIN_PASSWORD` is set in environment/secrets.
3. `public/data` is writable by the process user.
4. `public/data` is on persistent storage (volume/disk).
5. App is reachable at `/mutationtrainer-react/` (or update Vite `base` if you deploy on a different path).

## If You Deploy at Root (`/`) Instead of `/mutationtrainer-react/`
Current config uses:
- `vite.config.js` -> `base: "/mutationtrainer-react/"`

If your domain serves app at root, change `base` to `"/"`, rebuild, and redeploy.

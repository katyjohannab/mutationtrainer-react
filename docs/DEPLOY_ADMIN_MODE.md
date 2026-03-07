# Admin Mode Deployment (Writable Runtime, VPS-First)

Last updated: 2026-03-07

This is the production runbook for Option 2: one Node process on a VPS/VM, saving admin edits directly to `public/data/**`.

## 1. Why Static Hosting Cannot Work
Admin mode writes files through API endpoints:
- `GET /api/admin/session`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `POST /api/admin/save-card`

A static host (for example GitHub Pages without a server) cannot execute these endpoints and cannot write CSV/TSV files.

## 2. Required Environment Contract
- Required:
  - `WM_ADMIN_PASSWORD` (shared admin password)
- Optional:
  - `PORT` (default `4173`)
  - `WM_BIND_HOST` (default `0.0.0.0`)
  - `WM_ADMIN_SESSION_TTL_HOURS` (default `12`, clamp `0.25` to `168`)
  - `NODE_ENV=production` (recommended in VPS service env)

## 3. Local Dry Run (Before VPS)
Run from repo root.

### Windows PowerShell
```powershell
npm install
$env:WM_ADMIN_PASSWORD="choose-a-strong-password"
npm run build
npm run start:prod
```
Open: `http://localhost:4173/mutationtrainer-react/`

### macOS/Linux
```bash
npm install
export WM_ADMIN_PASSWORD="choose-a-strong-password"
npm run build
npm run start:prod
```
Open: `http://localhost:4173/mutationtrainer-react/`

## 4. VPS Install (Ubuntu example)

### 4.1 Prepare app directory
```bash
sudo mkdir -p /srv/mutationtrainer-react
sudo chown -R $USER:$USER /srv/mutationtrainer-react
# copy repo files into /srv/mutationtrainer-react
cd /srv/mutationtrainer-react
npm install
npm run build
```

### 4.2 Create service env file
```bash
sudo mkdir -p /etc/mutationtrainer
sudo cp deploy/systemd/mutationtrainer.env.example /etc/mutationtrainer/mutationtrainer.env
sudo nano /etc/mutationtrainer/mutationtrainer.env
```
Set at least:
```env
WM_ADMIN_PASSWORD=your-real-password
PORT=4173
WM_BIND_HOST=0.0.0.0
NODE_ENV=production
```

### 4.3 Install systemd service
```bash
sudo cp deploy/systemd/mutationtrainer.service /etc/systemd/system/mutationtrainer.service
sudo systemctl daemon-reload
sudo systemctl enable mutationtrainer.service
sudo systemctl start mutationtrainer.service
sudo systemctl status mutationtrainer.service
```

### 4.4 Logs
```bash
journalctl -u mutationtrainer.service -f
```

## 5. Reverse Proxy (Nginx)
Use template:
- `deploy/nginx/mutationtrainer.conf`

Key requirement: forward `X-Forwarded-Proto` so secure admin cookie behavior works correctly behind HTTPS.

After configuring Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 6. Writable + Persistent Data Requirement
The service user must have write access to:
- `public/data/cards.csv`
- `public/data/prep.csv`
- `public/data/article-sylfaen.csv`
- all registered unit/pack files under `public/data/**`

For VPS, persistence is usually the VM disk. For containers/cloud, mount a persistent volume to the app `public/data` path.

## 7. Backup and Restore (Before/After Admin Editing)

### Backup
```bash
cd /srv/mutationtrainer-react
mkdir -p backups
stamp=$(date +%Y%m%d-%H%M%S)
tar -czf "backups/public-data-$stamp.tgz" public/data
```

### Restore
```bash
cd /srv/mutationtrainer-react
tar -xzf backups/public-data-YYYYMMDD-HHMMSS.tgz
sudo systemctl restart mutationtrainer.service
```

## 8. VPS Smoke Test Checklist
1. Service starts with no errors.
2. Open app and verify normal learner flow still works.
3. Admin login succeeds with `WM_ADMIN_PASSWORD`.
4. Edit one card and save.
5. Verify changed content appears in app immediately.
6. Verify source file changed on disk (`public/data/...`).
7. Restart service and confirm change persists.
8. Negative test: remove write permission temporarily and verify save returns clear writable-path error.

## 9. Troubleshooting

### A) "Admin password is not configured on this server"
Cause: `WM_ADMIN_PASSWORD` missing in runtime environment.
Fix: set env var in systemd env file and restart service.

### B) 401 on save-card
Cause: session missing/expired or not logged in.
Fix: login again; check browser cookies; confirm reverse proxy forwards headers correctly.

### C) "rowIndex is out of range" or card mismatch
Cause: data changed between load and save, or stale card state.
Fix: refresh app deck and retry edit.

### D) "Server cannot write ... public/data"
Cause: filesystem permission issue (or read-only mount).
Fix: grant write permissions to service user; ensure mounted disk is read-write.

### E) Cookie/session issues behind proxy
Cause: proxy not forwarding scheme or HTTPS misconfiguration.
Fix: forward `X-Forwarded-Proto $scheme`; terminate TLS correctly at proxy.

## 10. Static-Only Deployment Block (Intentional)
Do not deploy admin-enabled workflow to static-only hosting. You need a running Node server for `/api/admin/*` and disk writes.

// Serve the built app with a regular Node HTTP server, not Vite preview.
(async () => {
  // Local convenience only; deployment environments should supply their own secrets.
  const fs = require('node:fs');
  if (fs.existsSync('.env.local')) process.loadEnvFile('.env.local');
  const { createAppServer } = await import('../server/httpServer.js');
  const host = process.env.WM_BIND_HOST || process.env.HOST || '127.0.0.1';
  const port = Number(process.env.WM_PORT || process.env.PORT || 4173);
  let base = process.env.WM_BASE_PATH || '/';
  if (!base.endsWith('/')) base += '/';
  const server = await createAppServer({ base });
  server.listen(port, host, () => console.log(`Treiglap: http://${host}:${port}${base}`));
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
})().catch(error => { console.error(error.message); process.exitCode = 1; });

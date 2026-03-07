const { spawn } = require("node:child_process");

const host = String(process.env.WM_BIND_HOST || process.env.HOST || "0.0.0.0").trim() || "0.0.0.0";
const port = String(process.env.WM_PORT || process.env.PORT || "4173").trim() || "4173";

const args = ["preview", "--host", host, "--port", port];
const viteBin = require.resolve("vite/bin/vite.js");

const child = spawn(process.execPath, [viteBin, ...args], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

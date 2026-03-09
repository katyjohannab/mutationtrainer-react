const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const host = String(process.env.WM_BIND_HOST || process.env.HOST || "0.0.0.0").trim() || "0.0.0.0";
const port = String(process.env.WM_PORT || process.env.PORT || "4173").trim() || "4173";
const configuredAdminPassword = String(
  process.env.WM_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || ""
).trim();

if (!configuredAdminPassword) {
  console.error(
    "Missing admin password. Set WM_ADMIN_PASSWORD (or ADMIN_PASSWORD) before running start:prod."
  );
  process.exit(1);
}

function resolveViteBin() {
  const pkgJsonPath = require.resolve("vite/package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));

  const binEntry =
    typeof pkg.bin === "string"
      ? pkg.bin
      : pkg.bin && typeof pkg.bin.vite === "string"
        ? pkg.bin.vite
        : null;

  if (!binEntry) {
    throw new Error("Unable to resolve Vite CLI entry from vite/package.json");
  }

  return path.resolve(path.dirname(pkgJsonPath), binEntry);
}

function runViteCommand(viteBin, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [viteBin, ...args], {
      stdio: "inherit",
      env: process.env,
    });

    child.on("error", reject);

    child.on("exit", (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal);
        return;
      }

      if ((code ?? 0) !== 0) {
        reject(new Error(`Vite command failed: ${args.join(" ")} (exit ${code ?? 0})`));
        return;
      }

      resolve();
    });
  });
}

(async () => {
  const viteBin = resolveViteBin();

  try {
    await runViteCommand(viteBin, ["build"]);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  const previewArgs = ["preview", "--host", host, "--port", port];

  const previewChild = spawn(process.execPath, [viteBin, ...previewArgs], {
    stdio: "inherit",
    env: process.env,
  });

  previewChild.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
})();

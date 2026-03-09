import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { viteAdminApiPlugin } from "./server/viteAdminApiPlugin.js";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL env vars (empty prefix) from .env/.env.local into process.env
  // so server-side plugins (adminApi) can read WM_ADMIN_PASSWORD etc.
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  const configuredBase = String(
    env.WM_BASE_PATH || env.VITE_BASE_PATH || "/"
  ).trim();

  const normalizedBase = configuredBase.endsWith("/")
    ? configuredBase
    : `${configuredBase}/`;

  return {
    base: normalizedBase,
    plugins: [react(), tailwindcss(), viteAdminApiPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

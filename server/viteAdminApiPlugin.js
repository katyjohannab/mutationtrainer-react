import { createAdminApiMiddleware } from "./adminApi.js";

export function viteAdminApiPlugin() {
  return {
    name: "vite-admin-api",
    configureServer(server) {
      server.middlewares.use(createAdminApiMiddleware({ rootDir: process.cwd() }));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createAdminApiMiddleware({ rootDir: process.cwd() }));
    },
  };
}

import { createAdminApiMiddleware } from "./adminApi.js";
import { createDataMiddleware } from "./dataMiddleware.js";

export function viteAdminApiPlugin() {
  return {
    name: "vite-admin-api",
    configureServer(server) {
      const options = { rootDir: server.config.root, base: server.config.base };
      server.middlewares.use(createDataMiddleware(options));
      server.middlewares.use(createAdminApiMiddleware(options));
    },
    configurePreviewServer(server) {
      const options = { rootDir: server.config.root, base: server.config.base };
      server.middlewares.use(createDataMiddleware(options));
      server.middlewares.use(createAdminApiMiddleware(options));
    },
  };
}

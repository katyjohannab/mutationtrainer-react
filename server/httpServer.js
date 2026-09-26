import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { createAdminApiMiddleware } from "./adminApi.js";
import { createDataMiddleware } from "./dataMiddleware.js";
import { contentPaths } from "./contentRepository.js";
import { requireValidContentDirectory } from "./validateContent.js";

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".mp3": "audio/mpeg", ".wav": "audio/wav" };

// No Vite dependency at runtime. Built UI and writable canonical data share one origin.
export async function createAppServer(options = {}) {
  const rootDir = path.resolve(options.rootDir || process.cwd());
  const base = options.base || "/";
  if (!base.startsWith("/") || !base.endsWith("/") || base.includes("..")) throw new Error("Base path must start and end with /.");
  const dist = path.resolve(rootDir, "dist");
  const index = await fs.readFile(path.join(dist, "index.html"));
  const config = { ...options, rootDir, base };
  const { dataRoot } = contentPaths(config);
  await requireValidContentDirectory(dataRoot);
  const data = createDataMiddleware(config);
  const admin = createAdminApiMiddleware(config);
  return http.createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url || "/", "http://localhost").pathname;
      if (!pathname.startsWith(base)) { res.statusCode = 404; return res.end("Not found."); }
      res.setHeader("X-Content-Type-Options", "nosniff");
      await data(req, res, async () => {
        await admin(req, res, async () => {
          if (!["GET", "HEAD"].includes(req.method)) { res.statusCode = 405; return res.end("Method not allowed."); }
          const relative = decodeURIComponent(pathname.slice(base.length));
          if (relative.split(/[\\/]/).some(part => part.startsWith(".")) || relative.includes("\\")) { res.statusCode = 404; return res.end("Not found."); }
          // Only the homepage has an HTML fallback; missing assets/data must be real 404s.
          if (!relative || relative === "index.html") {
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.setHeader("Cache-Control", "no-cache");
            return res.end(req.method === "HEAD" ? undefined : index);
          }
          if (relative.startsWith("api/") || relative.startsWith("data/")) { res.statusCode = 404; return res.end("Not found."); }
          const file = path.resolve(dist, relative);
          if (!file.startsWith(`${dist}${path.sep}`)) { res.statusCode = 404; return res.end("Not found."); }
          try {
            const bytes = await fs.readFile(file);
            res.setHeader("Content-Type", TYPES[path.extname(file)] || "application/octet-stream");
            res.setHeader("Cache-Control", relative.startsWith("assets/") ? "public, max-age=31536000, immutable" : "no-cache");
            res.end(req.method === "HEAD" ? undefined : bytes);
          } catch (error) {
            res.statusCode = ["ENOENT", "EISDIR"].includes(error.code) ? 404 : 500;
            res.end("Unable to read asset.");
          }
        });
      });
    } catch {
      if (!res.headersSent) res.statusCode = 500;
      res.end("Unable to complete request.");
    }
  });
}

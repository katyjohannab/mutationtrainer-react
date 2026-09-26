import fs from "node:fs/promises";
import path from "node:path";
import { ALL_RUNTIME_DATA_FILES } from "../src/data/csvSources.js";
import { contentPaths } from "./contentRepository.js";
import { revisionOf } from "./validateContent.js";

export function createDataMiddleware(options = {}) {
  const { dataRoot } = contentPaths(options);
  const prefix = `${options.base || "/"}data/`;
  return async (req, res, next) => {
    const pathname = new URL(req.url || "/", "http://localhost").pathname;
    if (!pathname.startsWith(prefix)) return next();
    let source;
    try { source = decodeURIComponent(pathname.slice(prefix.length)); }
    catch { res.statusCode = 400; return res.end("Invalid data path."); }
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (!ALL_RUNTIME_DATA_FILES.includes(source)) { res.statusCode = 404; return res.end("Unknown data source."); }
    if (!["GET", "HEAD"].includes(req.method)) { res.statusCode = 405; return res.end("Method not allowed."); }
    try {
      const bytes = await fs.readFile(path.join(dataRoot, source));
      res.setHeader("Content-Type", source.endsWith(".tsv") ? "text/tab-separated-values; charset=utf-8" : "text/csv; charset=utf-8");
      res.setHeader("ETag", `"${revisionOf(bytes)}"`);
      res.end(req.method === "HEAD" ? undefined : bytes);
    } catch (error) {
      res.statusCode = error.code === "ENOENT" ? 404 : 500;
      res.end("Unable to read canonical data source.");
    }
  };
}

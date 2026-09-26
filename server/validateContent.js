import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { ALL_RUNTIME_DATA_FILES } from "../src/data/csvSources.js";
import { parseCardSource, duplicateIdDiagnostics, ContentValidationError } from "../src/services/cardFormat.js";

export const revisionOf = text => crypto.createHash("sha256").update(text).digest("hex");

export async function validateContentDirectory(dataDir, sources = ALL_RUNTIME_DATA_FILES) {
  const cards = [], errors = [], warnings = [], files = [];
  for (const source of sources) {
    try {
      const text = await fs.readFile(path.join(dataDir, source), "utf8");
      const parsed = parseCardSource(text, source);
      cards.push(...parsed.cards);
      errors.push(...parsed.errors.filter(e => e.code !== "duplicate"));
      warnings.push(...parsed.warnings);
      files.push({ source, count: parsed.cards.length, revision: revisionOf(text) });
    } catch (error) {
      errors.push({ source, code: "read", message: `Cannot read source: ${error.code || error.message}` });
    }
  }
  errors.push(...duplicateIdDiagnostics(cards));
  return { files, cardCount: cards.length, errors, warnings };
}

export async function requireValidContentDirectory(dataDir, sources) {
  const report = await validateContentDirectory(dataDir, sources);
  if (report.errors.length) throw new ContentValidationError(report.errors);
  return report;
}

export function contentValidationPlugin() {
  let root;
  return {
    name: "validate-runtime-content", apply: "build",
    configResolved(config) { root = config.root; },
    async buildStart() {
      const report = await requireValidContentDirectory(path.resolve(root, "public/data"));
      this.info(`Validated ${report.cardCount} cards in ${report.files.length} registered sources; ${report.warnings.length} editorial metadata warnings (not Welsh approval).`);
    },
  };
}

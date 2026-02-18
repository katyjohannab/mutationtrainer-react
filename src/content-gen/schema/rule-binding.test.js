import fs from "fs";
import path from "path";
import process from "node:process";
import { pathToFileURL } from "url";
import { describe, expect, it } from "vitest";
import { GRAMMAR_RULES } from "../../data/rules.js";

const UNIT_DATA_ROOT = path.join(process.cwd(), "src/content-gen/unit-data");

function walkJsFiles(rootDir) {
  const files = [];
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith(".js")) files.push(full);
    }
  }
  walk(rootDir);
  return files;
}

describe("rule binding", () => {
  it("ensures all non-none pattern ruleIds exist in grammar rules", async () => {
    const files = walkJsFiles(UNIT_DATA_ROOT);
    const issues = [];

    for (const file of files) {
      const moduleExports = await import(pathToFileURL(file).href);
      const patternExports = Object.keys(moduleExports).filter((name) => name.endsWith("_patterns"));
      for (const exportName of patternExports) {
        const patterns = moduleExports[exportName];
        if (!Array.isArray(patterns)) continue;
        patterns.forEach((pattern, index) => {
          if (pattern.mutation === "none") return;
          if (!GRAMMAR_RULES[pattern.ruleId]) {
            issues.push(`${file}:${exportName}[${index}] missing ruleId '${pattern.ruleId}'`);
          }
        });
      }
    }

    expect(issues).toEqual([]);
  });
});

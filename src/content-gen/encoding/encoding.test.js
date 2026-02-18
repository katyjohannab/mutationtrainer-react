import fs from "fs";
import path from "path";
import process from "node:process";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const FILES = [
  "src/data/rules.js",
  "src/i18n/strings.js",
  "src/content-gen/unit-data/mynediad/south/unit1.js",
  "docs/AI_DATA_ENTRY_PROMPT.md",
];

const MOJIBAKE_PATTERNS = [
  "Ã¢",
  "Ã©",
  "Ã¨",
  "Ã´",
  "â€™",
  "â€œ",
  "â€",
  "â€¦",
  "â€“",
  "â€”",
  "â€¢",
  "Â·",
];

describe("encoding hygiene", () => {
  it("does not include common mojibake sequences in key files", () => {
    for (const relative of FILES) {
      const content = fs.readFileSync(path.join(ROOT, relative), "utf8");
      for (const bad of MOJIBAKE_PATTERNS) {
        expect(content.includes(bad), `${relative} contains '${bad}'`).toBe(false);
      }
    }
  });
});

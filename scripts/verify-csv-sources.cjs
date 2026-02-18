const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const ROOT = process.cwd();
const REQUIRED_PROTECTED = ["cards.csv", "prep.csv", "article-sylfaen.csv"];
const REQUIRED_COLUMNS = [
  "CardId",
  "RuleFamily",
  "RuleCategory",
  "Trigger",
  "Base",
  "Translate",
  "WordCategory",
  "Before",
  "After",
  "Answer",
  "Outcome",
  "TranslateSent",
  "Why",
  "Why-Cym",
];
const CANONICAL_HEADER = REQUIRED_COLUMNS.join(",");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function normalizePath(filePath) {
  return String(filePath || "").replace(/\\/g, "/");
}

function hasValidUnitFileName(filePath) {
  const normalized = normalizePath(filePath);
  return /(^|\/)unit\d+\.csv$/.test(normalized);
}

function readCsvWithHeader(absPath) {
  const raw = fs.readFileSync(absPath, "utf8");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim() !== "");
  const firstLine = lines[0] || "";

  if (!firstLine.trim().toLowerCase().startsWith("cardid,")) {
    fail(`CSV hygiene failed for ${absPath}: missing canonical header row (expected to start with 'CardId,').`);
  }
  if (firstLine.trim() !== CANONICAL_HEADER) {
    fail(
      `CSV hygiene failed for ${absPath}: header must match canonical order exactly:\n${CANONICAL_HEADER}`
    );
  }

  const headers = firstLine.split(",").map((header) => header.trim());
  if (headers.length === 0) {
    fail(`CSV hygiene failed for ${absPath}: no headers detected.`);
  }

  if (lines.length < 2) {
    fail(`CSV hygiene failed for ${absPath}: expected at least one data row.`);
  }

  const missingColumns = REQUIRED_COLUMNS.filter((column) => !headers.includes(column));
  if (missingColumns.length > 0) {
    fail(
      `CSV hygiene failed for ${absPath}: missing required columns: ${missingColumns.join(", ")}`
    );
  }
}

async function importModule(relativePath) {
  const absPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absPath)) {
    fail(`Missing module: ${relativePath}`);
  }
  return import(pathToFileURL(absPath).href);
}

(async () => {
  const csvSourcesModule = await importModule("src/data/csvSources.js");
  const registryModule = await importModule("src/data/dysguUnitRegistry.js");

  const allCsvFiles = csvSourcesModule.ALL_CSV_FILES;
  const protectedCsvFiles = csvSourcesModule.PROTECTED_MANUAL_CSV_FILES;
  const activeUnits = registryModule.ACTIVE_DYSGU_UNITS;

  if (!Array.isArray(allCsvFiles) || allCsvFiles.length === 0) {
    fail("No CSV sources found in src/data/csvSources.js.");
  }
  if (!Array.isArray(protectedCsvFiles) || protectedCsvFiles.length === 0) {
    fail("PROTECTED_MANUAL_CSV_FILES must be a non-empty array in src/data/csvSources.js.");
  }
  if (!Array.isArray(activeUnits)) {
    fail("ACTIVE_DYSGU_UNITS must be an array in src/data/dysguUnitRegistry.js.");
  }

  const protectedSet = new Set(protectedCsvFiles);
  const requiredProtectedSet = new Set(REQUIRED_PROTECTED);

  const missingProtected = REQUIRED_PROTECTED.filter((file) => !protectedSet.has(file));
  const extraProtected = [...protectedSet].filter((file) => !requiredProtectedSet.has(file));

  if (missingProtected.length > 0) {
    fail(`Runtime CSV source lock failed. Missing protected CSV: ${missingProtected.join(", ")}`);
  }
  if (extraProtected.length > 0) {
    fail(`Runtime CSV source lock failed. Unexpected protected CSV: ${extraProtected.join(", ")}`);
  }

  const allSet = new Set(allCsvFiles);
  if (allSet.size !== allCsvFiles.length) {
    fail("Duplicate CSV source entries found in src/data/csvSources.js.");
  }

  const expectedSources = [
    ...protectedCsvFiles,
    ...activeUnits.map((unit) => normalizePath(unit.file)),
  ];
  const expectedSet = new Set(expectedSources);

  const missingFromAll = [...expectedSet].filter((file) => !allSet.has(file));
  const extrasInAll = [...allSet].filter((file) => !expectedSet.has(file));

  if (missingFromAll.length > 0) {
    fail(`CSV source lock failed. Missing registered CSV sources: ${missingFromAll.join(", ")}`);
  }
  if (extrasInAll.length > 0) {
    fail(`CSV source lock failed. Unexpected CSV sources: ${extrasInAll.join(", ")}`);
  }

  for (const unit of activeUnits) {
    if (!unit.file || typeof unit.file !== "string") {
      fail(`Registry entry '${unit.id}' must include a CSV file path.`);
    }

    const normalized = normalizePath(unit.file);
    const baseName = path.basename(normalized);

    if (!hasValidUnitFileName(normalized)) {
      fail(
        `CSV hygiene failed for registry entry '${unit.id}': unit file must match 'unit<number>.csv' (lowercase). Received '${unit.file}'.`
      );
    }

    if (baseName !== baseName.toLowerCase()) {
      fail(
        `CSV hygiene failed for registry entry '${unit.id}': unit filename must be lowercase. Received '${baseName}'.`
      );
    }

    const absPath = path.join(ROOT, "public/data", normalized);
    if (!fs.existsSync(absPath)) {
      fail(`Registered CSV file not found for '${unit.id}': public/data/${normalized}`);
    }

    readCsvWithHeader(absPath);
  }

  console.log("Runtime CSV source lock passed.");
})().catch((error) => {
  fail(`Runtime CSV source verification failed: ${error.message}`);
});

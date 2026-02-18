import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { compileUnit, summarizeRules, toQaReport, toReviewCsv } from "../compiler/compile-lib.js";
import { inferUnitMetaFromPath, validateUnitModuleExports } from "../schema/content-schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UNIT_DATA_ROOT = path.resolve(__dirname, "../unit-data");
const QA_APPROVAL_ROOT = path.resolve(__dirname, "../qa/approvals");
const GENERATED_ROOT = path.resolve(__dirname, "../../../generated/review");

function getArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function walkUnitFiles(rootDir) {
  const output = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".js")) {
        output.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return output.sort((a, b) => a.localeCompare(b));
}

function parseFilters() {
  const level = getArg("--level");
  const dialect = getArg("--dialect");
  const unitRaw = getArg("--unit");
  const unit = unitRaw ? Number(unitRaw) : null;

  if (unitRaw && (!Number.isInteger(unit) || unit <= 0)) {
    throw new Error(`Invalid --unit value '${unitRaw}'. Expected a positive integer.`);
  }

  return { level, dialect, unit };
}

function shouldInclude(meta, filters) {
  if (!meta) return false;
  if (filters.level && meta.level !== filters.level) return false;
  if (filters.dialect && meta.dialect !== filters.dialect) return false;
  if (filters.unit && meta.unit !== filters.unit) return false;
  return true;
}

function loadApprovalRecord(level, dialect, unit) {
  const fileName = `${level}-${dialect}-u${unit}.json`;
  const approvalPath = path.join(QA_APPROVAL_ROOT, fileName);
  if (!fs.existsSync(approvalPath)) {
    return { record: null, approvalPath };
  }

  const raw = fs.readFileSync(approvalPath, "utf8");
  return {
    record: JSON.parse(raw),
    approvalPath,
  };
}

function loadEvidenceManifest(filePath, meta) {
  const evidencePath = filePath.replace(/unit(\d+)\.js$/, `unit${meta.unit}.evidence.json`);
  if (!fs.existsSync(evidencePath)) {
    throw new Error(`Evidence manifest not found: ${evidencePath}`);
  }

  const raw = fs.readFileSync(evidencePath, "utf8");
  const evidence = JSON.parse(raw);
  const requiredStringFields = ["sourceId", "sourceTitle", "level", "dialect"];
  for (const field of requiredStringFields) {
    if (typeof evidence[field] !== "string" || !evidence[field].trim()) {
      throw new Error(`Evidence manifest missing '${field}': ${evidencePath}`);
    }
  }
  if (evidence.level !== meta.level) {
    throw new Error(`Evidence level mismatch in ${evidencePath}. Expected '${meta.level}'.`);
  }
  if (evidence.dialect !== meta.dialect) {
    throw new Error(`Evidence dialect mismatch in ${evidencePath}. Expected '${meta.dialect}'.`);
  }
  if (evidence.unit !== meta.unit) {
    throw new Error(`Evidence unit mismatch in ${evidencePath}. Expected '${meta.unit}'.`);
  }
  if (!Array.isArray(evidence.refs) || evidence.refs.length === 0) {
    throw new Error(`Evidence manifest refs must be a non-empty array: ${evidencePath}`);
  }

  return { evidence, evidencePath };
}

function writeOutput({
  level,
  dialect,
  unit,
  cards,
  failures,
  approvalPath,
  sourceFile,
  evidencePath,
}) {
  const outDir = path.join(GENERATED_ROOT, level, dialect, `unit${unit}`);
  fs.mkdirSync(outDir, { recursive: true });

  const canonicalPath = path.join(outDir, "cards.canonical.json");
  const csvPath = path.join(outDir, "cards.review.csv");
  const reportPath = path.join(outDir, "qa-report.md");
  const manifestPath = path.join(outDir, "compile-manifest.json");
  const rulesLogPath = path.join(outDir, "rules-log.json");
  const rulesLog = summarizeRules(cards);

  fs.writeFileSync(canonicalPath, `${JSON.stringify(cards, null, 2)}\n`, "utf8");
  fs.writeFileSync(csvPath, toReviewCsv(cards), "utf8");
  fs.writeFileSync(
    reportPath,
    toQaReport({ level, dialect, unit, cards, failures, approvalPath }),
    "utf8"
  );
  fs.writeFileSync(rulesLogPath, `${JSON.stringify(rulesLog, null, 2)}\n`, "utf8");

  fs.writeFileSync(
    manifestPath,
    `${JSON.stringify(
      {
        level,
        dialect,
        unit,
        sourceFile,
        evidencePath,
        approvalPath,
        generatedAt: new Date().toISOString(),
        cardCount: cards.length,
        ruleCount: rulesLog.length,
        rulesLogPath,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  return { outDir, canonicalPath, csvPath, reportPath, manifestPath, rulesLogPath };
}

async function compileFile(filePath) {
  const fileUrl = pathToFileURL(filePath).href;
  const moduleExports = await import(fileUrl);
  const validation = validateUnitModuleExports(moduleExports, filePath);
  if (validation.errors.length > 0) {
    throw new Error(validation.errors.join("\n"));
  }

  const vocab = moduleExports[validation.vocabName];
  const patterns = moduleExports[validation.patternName];
  const meta = validation.inferred || inferUnitMetaFromPath(filePath);
  if (!meta) {
    throw new Error(`Unable to infer unit meta from path: ${filePath}`);
  }
  const evidenceResult = loadEvidenceManifest(filePath, meta);

  const approval = loadApprovalRecord(meta.level, meta.dialect, meta.unit);
  const compiled = compileUnit({
    level: meta.level,
    dialect: meta.dialect,
    unit: meta.unit,
    vocab,
    patterns,
    approvalRecord: approval.record,
  });

  if (compiled.failures.length > 0) {
    throw new Error(compiled.failures.join("\n"));
  }

  return {
    meta,
    evidencePath: evidenceResult.evidencePath,
    cards: compiled.cards,
    failures: compiled.failures,
    approvalPath: approval.approvalPath,
  };
}

async function main() {
  if (!fs.existsSync(UNIT_DATA_ROOT)) {
    throw new Error(`Unit-data root not found: ${UNIT_DATA_ROOT}`);
  }

  const filters = parseFilters();
  const files = walkUnitFiles(UNIT_DATA_ROOT).filter((file) =>
    shouldInclude(inferUnitMetaFromPath(file), filters)
  );

  if (files.length === 0) {
    throw new Error("No matching unit-data files found for provided filters.");
  }

  const results = [];
  for (const file of files) {
    const compiled = await compileFile(file);
    const output = writeOutput({
      ...compiled.meta,
      cards: compiled.cards,
      failures: compiled.failures,
      approvalPath: compiled.approvalPath,
      sourceFile: file,
      evidencePath: compiled.evidencePath,
    });
    results.push({
      file,
      meta: compiled.meta,
      evidencePath: compiled.evidencePath,
      output,
      cardCount: compiled.cards.length,
    });
  }

  console.log(`Compiled ${results.length} unit file(s).`);
  results.forEach((result) => {
    console.log(
      `- ${result.meta.level}/${result.meta.dialect}/unit${result.meta.unit}: ${result.cardCount} cards -> ${result.output.outDir} (evidence: ${result.evidencePath})`
    );
  });
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

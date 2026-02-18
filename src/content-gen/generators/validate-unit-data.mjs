import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { validateUnitModuleExports } from "../schema/content-schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UNIT_DATA_ROOT = path.resolve(__dirname, "../unit-data");
const SOURCE_INDEX_PATH = path.resolve(__dirname, "../../../docs/SOURCE_INDEX.md");

function readAllowedSourceIds() {
  if (!fs.existsSync(SOURCE_INDEX_PATH)) return new Set();
  const raw = fs.readFileSync(SOURCE_INDEX_PATH, "utf8");
  const matches = [...raw.matchAll(/^- `([^`]+)`/gm)];
  return new Set(matches.map((match) => match[1]));
}

function validateSourceIds(moduleExports, filePath, errors, allowedSourceIds) {
  if (allowedSourceIds.size === 0) return;

  const exportNames = Object.keys(moduleExports || {});
  for (const exportName of exportNames) {
    if (
      !exportName.endsWith("_vocab") &&
      !exportName.endsWith("_patterns") &&
      !exportName.endsWith("_ruleProposals")
    ) {
      continue;
    }
    const list = moduleExports[exportName];
    if (!Array.isArray(list)) continue;
    list.forEach((item, index) => {
      const refs = item?.evidenceRefs;
      if (!Array.isArray(refs)) return;
      refs.forEach((ref, refIndex) => {
        const sourceId = ref?.sourceId;
        if (typeof sourceId !== "string") return;
        if (!allowedSourceIds.has(sourceId)) {
          errors.push(
            `${filePath}: ${exportName}[${index}].evidenceRefs[${refIndex}].sourceId '${sourceId}' not found in docs/SOURCE_INDEX.md.`
          );
        }
      });
    });
  }
}

function validateEvidenceManifest(filePath, inferredMeta, errors, allowedSourceIds) {
  if (!inferredMeta) return;
  const evidencePath = filePath.replace(/unit(\d+)\.js$/, `unit${inferredMeta.unit}.evidence.json`);
  if (!fs.existsSync(evidencePath)) {
    errors.push(`${filePath}: missing evidence manifest ${evidencePath}.`);
    return;
  }

  let evidence;
  try {
    evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
  } catch (error) {
    errors.push(`${evidencePath}: invalid JSON (${error.message}).`);
    return;
  }

  const requiredString = ["sourceId", "sourceTitle", "level", "dialect"];
  requiredString.forEach((field) => {
    if (typeof evidence[field] !== "string" || !evidence[field].trim()) {
      errors.push(`${evidencePath}: '${field}' must be a non-empty string.`);
    }
  });

  if (evidence.level && evidence.level !== inferredMeta.level) {
    errors.push(`${evidencePath}: level must be '${inferredMeta.level}'.`);
  }
  if (evidence.dialect && evidence.dialect !== inferredMeta.dialect) {
    errors.push(`${evidencePath}: dialect must be '${inferredMeta.dialect}'.`);
  }
  if (evidence.unit !== inferredMeta.unit) {
    errors.push(`${evidencePath}: unit must be '${inferredMeta.unit}'.`);
  }
  if (!Array.isArray(evidence.refs) || evidence.refs.length === 0) {
    errors.push(`${evidencePath}: refs must be a non-empty array.`);
  }

  if (
    typeof evidence.sourceId === "string" &&
    allowedSourceIds.size > 0 &&
    !allowedSourceIds.has(evidence.sourceId)
  ) {
    errors.push(
      `${evidencePath}: sourceId '${evidence.sourceId}' not found in docs/SOURCE_INDEX.md.`
    );
  }
}

function findJsFiles(rootDir) {
  const out = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".js")) {
        out.push(fullPath);
      }
    }
  }

  walk(rootDir);
  return out;
}

async function validateFile(filePath, errors, allowedSourceIds) {
  const fileUrl = pathToFileURL(filePath).href;
  const module = await import(fileUrl);
  const result = validateUnitModuleExports(module, filePath);
  errors.push(...result.errors);
  validateSourceIds(module, filePath, errors, allowedSourceIds);
  validateEvidenceManifest(filePath, result.inferred, errors, allowedSourceIds);
}

async function main() {
  if (!fs.existsSync(UNIT_DATA_ROOT)) {
    console.error(`Unit-data root not found: ${UNIT_DATA_ROOT}`);
    process.exit(1);
  }

  const files = findJsFiles(UNIT_DATA_ROOT);
  const errors = [];
  const allowedSourceIds = readAllowedSourceIds();

  for (const file of files) {
    await validateFile(file, errors, allowedSourceIds);
  }

  if (errors.length > 0) {
    console.error(`\nValidation failed with ${errors.length} issue(s):`);
    errors.forEach((e) => console.error(`- ${e}`));
    process.exit(1);
  }

  console.log(`Validation passed: ${files.length} file(s) checked.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

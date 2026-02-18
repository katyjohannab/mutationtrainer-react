const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "generated", "external-agent", "prompts");

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readRequiredFile(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    fail(`Missing required file: ${relativePath}`);
  }
  return fs.readFileSync(fullPath, "utf8").trim();
}

function readOptionalFile(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  return fs.readFileSync(fullPath, "utf8").trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractExportArrayBlock(fileContent, exportName) {
  const pattern = new RegExp(
    `export\\s+const\\s+${escapeRegExp(exportName)}\\s*=\\s*\\[[\\s\\S]*?\\];`,
    "m",
  );
  const match = fileContent.match(pattern);
  return match ? match[0] : null;
}

function normalizePass(rawPass) {
  const value = (rawPass || "full").toLowerCase();
  if (["a", "pass-a", "passa", "1"].includes(value)) return "a";
  if (["b", "pass-b", "passb", "2"].includes(value)) return "b";
  if (["both", "all", "ab"].includes(value)) return "both";
  if (["full", "single", "whole-unit", "one-shot"].includes(value)) return "full";
  return null;
}

function usage() {
  return [
    "Usage:",
    "  npm run build:external-prompt -- --level mynediad --dialect south --unit 1 --source-id mynediad-de-v2-2023 --source-title \"Mynediad y De - Fersiwn 2\" [--pass full|a|b|both]",
    "",
    "Notes:",
    "  - Default --pass is full (single whole-unit prompt).",
    "  - Generates single copy-paste markdown prompt files in generated/external-agent/prompts/.",
  ].join("\n");
}

const level = getArg("--level");
const dialect = getArg("--dialect");
const unitRaw = getArg("--unit");
const unit = Number(unitRaw);
const sourceId = getArg("--source-id") || "TODO-source-id";
const sourceTitle = getArg("--source-title") || "TODO source title";
const pass = normalizePass(getArg("--pass"));

if (!level || !dialect || !Number.isInteger(unit) || unit <= 0 || !pass) {
  fail(usage());
}

const canonicalPrompt = readRequiredFile("docs/AI_DATA_ENTRY_PROMPT.md");
const semanticCatalog = readRequiredFile("docs/SEMANTIC_CLASS_CATALOG.md");
const ruleCatalog = readRequiredFile("docs/RULE_ID_CATALOG.md");
const ruleProposalWorkflow = readRequiredFile("docs/RULE_PROPOSAL_WORKFLOW.md");

const unitModuleRel = `src/content-gen/unit-data/${level}/${dialect}/unit${unit}.js`;
const evidenceRel = `src/content-gen/unit-data/${level}/${dialect}/unit${unit}.evidence.json`;

const unitModuleContent = readOptionalFile(unitModuleRel);
const evidenceContent = readOptionalFile(evidenceRel);
const vocabExportName = `u${unit}_vocab`;
const vocabBlock = unitModuleContent
  ? extractExportArrayBlock(unitModuleContent, vocabExportName)
  : null;

const generatedAt = new Date().toISOString();
const slug = `${level}-${dialect}-u${unit}`;

function buildSharedHeader(passLabel) {
  return [
    `# External AI One-Shot Prompt (${passLabel})`,
    "",
    `Generated: ${generatedAt}`,
    "",
    "Copy this whole file into your external AI in one message.",
    "",
    "## Unit Metadata",
    `- level: ${level}`,
    `- dialect: ${dialect}`,
    `- unit: ${unit}`,
    `- sourceId: ${sourceId}`,
    `- sourceTitle: ${sourceTitle}`,
    "",
  ].join("\n");
}

function buildPassAContent() {
  return [
    buildSharedHeader("Pass A: Vocab Only"),
    "## Attach These Source Pages",
    "- Chapter-opening color-coded vocab page(s) for this unit.",
    "",
    "## Execution Directive",
    "- Execute Pass A only from the canonical prompt below.",
    "- Return `u<N>_vocab`, `u<N>_patterns = []`, optional `u<N>_ruleProposals = []`, and `unit<N>.evidence.json`.",
    "",
    "## Canonical Prompt",
    canonicalPrompt,
    "",
    "## Inlined Semantic Class Catalog",
    semanticCatalog,
    "",
  ].join("\n");
}

function buildPassBContent() {
  const vocabContext = vocabBlock
    ? [
        "## Locked Pass A Vocab Baseline",
        "- Reuse this vocab exactly unless you include an explicit correction list.",
        "",
        "```js",
        vocabBlock,
        "```",
        "",
      ].join("\n")
    : unitModuleContent
      ? [
          "## Locked Pass A Unit Module Context",
          "- `u<N>_vocab` could not be isolated automatically, so the full module is inlined.",
          "- Reuse accepted vocab unless you include an explicit correction list.",
          "",
          "```js",
          unitModuleContent,
          "```",
          "",
        ].join("\n")
      : [
          "## Locked Pass A Vocab Baseline",
          "- `unit<N>.js` was not found, so Pass A vocab is not inlined.",
          "- Run Pass A first, then regenerate this Pass B one-shot prompt.",
          "",
        ].join("\n");

  const evidenceContext = evidenceContent
    ? [
        "## Existing Evidence Manifest Context",
        "```json",
        evidenceContent,
        "```",
        "",
      ].join("\n")
    : [
        "## Existing Evidence Manifest Context",
        "- `unit<N>.evidence.json` was not found yet.",
        "",
      ].join("\n");

  return [
    buildSharedHeader("Pass B: Patterns and Mutation Rules"),
    "## Attach These Source Pages",
    "- All grammar/pattern pages for this unit.",
    "- Unit goals and model lines used for guided drilling.",
    "",
    "## Execution Directive",
    "- Execute Pass B only from the canonical prompt below.",
    "- Generate mutation-testable `u<N>_patterns` with evidence refs.",
    "- Return `INSUFFICIENT_PATTERN_EVIDENCE` if required pattern pages are missing.",
    "",
    vocabContext,
    evidenceContext,
    "## Canonical Prompt",
    canonicalPrompt,
    "",
    "## Inlined Rule ID Catalog",
    ruleCatalog,
    "",
    "## Inlined Semantic Class Catalog",
    semanticCatalog,
    "",
    "## Inlined Rule Proposal Workflow",
    ruleProposalWorkflow,
    "",
  ].join("\n");
}

function buildFullContent() {
  const vocabContext = vocabBlock
    ? [
        "## Existing Vocab Baseline (Optional Reuse)",
        "- If this vocab has already been QA-accepted, keep it unless evidence requires correction.",
        "- If correction is needed, include a `VOCAB_CORRECTIONS` list in your response.",
        "",
        "```js",
        vocabBlock,
        "```",
        "",
      ].join("\n")
    : "";

  const evidenceContext = evidenceContent
    ? [
        "## Existing Evidence Manifest Context",
        "```json",
        evidenceContent,
        "```",
        "",
      ].join("\n")
    : "";

  return [
    buildSharedHeader("Full Unit: Vocab + Patterns (Single Prompt)"),
    "## Attach These Source Pages",
    "- Whole unit pages for this unit, including:",
    "  - chapter-opening vocab box page",
    "  - grammar boxes",
    "  - dialogues and model lines",
    "  - exercises that introduce or drill sentence frames",
    "  - unit review / consolidation pages",
    "  - any unit reference pages used in teaching the same patterns",
    "",
    "## Execution Directive",
    "- Execute full-unit extraction in one run.",
    "- Extract vocab strictly from chapter-opening color-coded vocab box.",
    "- Extract mutation-testable patterns from the whole unit (not only grammar boxes).",
    "- Include `PATTERN_COVERAGE_REPORT` that lists sections scanned and patterns extracted from each.",
    "",
    vocabContext,
    evidenceContext,
    "## Canonical Prompt",
    canonicalPrompt,
    "",
    "## Inlined Rule ID Catalog",
    ruleCatalog,
    "",
    "## Inlined Semantic Class Catalog",
    semanticCatalog,
    "",
    "## Inlined Rule Proposal Workflow",
    ruleProposalWorkflow,
    "",
  ].join("\n");
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const writtenFiles = [];

if (pass === "a" || pass === "both") {
  const passAFile = path.join(OUTPUT_DIR, `${slug}-passA.md`);
  fs.writeFileSync(passAFile, `${buildPassAContent()}\n`, "utf8");
  writtenFiles.push(path.relative(ROOT, passAFile));
}

if (pass === "b" || pass === "both") {
  const passBFile = path.join(OUTPUT_DIR, `${slug}-passB.md`);
  fs.writeFileSync(passBFile, `${buildPassBContent()}\n`, "utf8");
  writtenFiles.push(path.relative(ROOT, passBFile));
}

if (pass === "full") {
  const fullFile = path.join(OUTPUT_DIR, `${slug}-full.md`);
  fs.writeFileSync(fullFile, `${buildFullContent()}\n`, "utf8");
  writtenFiles.push(path.relative(ROOT, fullFile));
}

console.log("Generated one-shot external AI prompt file(s):");
for (const file of writtenFiles) {
  console.log(`- ${file}`);
}

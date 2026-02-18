const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const REQUIRED_DOCS = [
  "README.md",
  "PROJECT_STATUS.md",
  "src/DEFINITION_OF_DONE.md",
  "docs/DOCS_INDEX.md",
  "docs/ARCHITECTURE.md",
  "docs/CONTENT_WORKFLOW.md",
  "docs/AI_DATA_ENTRY_PROMPT.md",
  "docs/RULE_ID_CATALOG.md",
  "docs/RULE_PROPOSAL_WORKFLOW.md",
  "docs/RULE_PROPOSALS.md",
  "docs/PROJECT_STATUS.md",
  "docs/SCHEMA.md",
  "docs/TAXONOMY.md",
  "docs/SEMANTIC_CLASS_CATALOG.md",
  "docs/SOURCE_INDEX.md",
  "docs/AGENT_HANDOFF.md",
  "docs/EXTERNAL_AGENT_WORKFLOW.md",
  "archive/README.md",
  "archive/legacy-unused-2026-02-14/MANIFEST.md",
  "src/content-gen/qa/README.md",
  "src/content-gen/unit-data/README.md",
];

const LAST_UPDATED_REGEX = /^Last updated:\s\d{4}-\d{2}-\d{2}$/m;

function fail(message) {
  console.error(message);
  process.exit(1);
}

for (const relativePath of REQUIRED_DOCS) {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    fail(`Required documentation file missing: ${relativePath}`);
  }

  const content = fs.readFileSync(fullPath, "utf8");
  if (!LAST_UPDATED_REGEX.test(content)) {
    fail(`Missing or invalid 'Last updated:' line in ${relativePath}`);
  }
}

console.log("Documentation freshness check passed.");

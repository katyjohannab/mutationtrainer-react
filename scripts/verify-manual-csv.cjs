const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");

const ROOT = process.cwd();

const MANUAL_CSVS = [
  {
    file: "public/data/cards.csv",
    requiredColumns: ["CardId", "Trigger", "Base", "Before", "After", "Answer", "Outcome"],
  },
  {
    file: "public/data/prep.csv",
    requiredColumns: ["CardId", "Trigger", "Base", "Before", "After", "Answer", "Outcome"],
  },
  {
    file: "public/data/article-sylfaen.csv",
    requiredColumns: ["CardId", "Trigger", "Base", "Before", "After", "Answer", "Outcome"],
  },
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

for (const entry of MANUAL_CSVS) {
  const abs = path.join(ROOT, entry.file);
  if (!fs.existsSync(abs)) {
    fail(`Missing protected manual CSV: ${entry.file}`);
  }

  const raw = fs.readFileSync(abs, "utf8");
  if (!raw.trim()) {
    fail(`Protected manual CSV is empty: ${entry.file}`);
  }

  const parsed = Papa.parse(raw, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors && parsed.errors.length > 0) {
    fail(`CSV parse errors in protected file ${entry.file}: ${parsed.errors[0].message}`);
  }

  const headers = Object.keys(parsed.data[0] || {});
  if (headers.length === 0) {
    fail(`No headers detected in protected file: ${entry.file}`);
  }

  for (const col of entry.requiredColumns) {
    if (!headers.includes(col)) {
      fail(`Protected file ${entry.file} is missing expected column: ${col}`);
    }
  }
}

console.log("Protected manual CSV check passed.");


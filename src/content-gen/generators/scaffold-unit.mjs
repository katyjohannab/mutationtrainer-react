import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../unit-data");

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

const level = getArg("--level");
const dialect = getArg("--dialect");
const unitRaw = getArg("--unit");
const unit = Number(unitRaw);

if (!level || !dialect || !Number.isInteger(unit) || unit <= 0) {
  console.error("Usage: node scaffold-unit.mjs --level mynediad --dialect south --unit 1");
  process.exit(1);
}

const dir = path.join(ROOT, level, dialect);
const file = path.join(dir, `unit${unit}.js`);
const evidenceFile = path.join(dir, `unit${unit}.evidence.json`);

if (fs.existsSync(file)) {
  console.error(`File already exists: ${file}`);
  process.exit(1);
}

fs.mkdirSync(dir, { recursive: true });

const content = `const LEVEL = "${level}";
const DIALECT = "${dialect}";
const UNIT = ${unit};

const DEFAULT_VOCAB_EVIDENCE = [
  { sourceId: "TODO-source-id", page: 1, boxLabel: "TODO-unit-${unit}-vocab", note: "replace" },
];

const DEFAULT_PATTERN_EVIDENCE = [
  { sourceId: "TODO-source-id", page: 1, boxLabel: "TODO-unit-${unit}-pattern", note: "replace" },
];

export const u${unit}_vocab = [
  // Required fields:
  // id, base, en, unit, level, dialect, type, evidenceRefs
  // Example:
  // {
  //   id: "${level}-${dialect}-u${unit}-v001",
  //   base: "Abertawe",
  //   en: "Swansea",
  //   unit: UNIT,
  //   level: LEVEL,
  //   dialect: DIALECT,
  //   type: "place",
  //   gender: "null",
  //   semanticClass: "place-town",
  //   countability: "proper",
  //   articleBehaviour: "bare",
  //   placePrep: { yn: "yn-bare", i: "i-bare" },
  //   evidenceRefs: DEFAULT_VOCAB_EVIDENCE,
  // },
];

export const u${unit}_patterns = [
  // Required fields:
  // id, course, unit, name, mutation, ruleId, focus, templates, constraints, evidenceRefs
  // Each template must have exactly one slot.
  // Example:
  // {
  //   id: "pat-u${unit}-example",
  //   course: LEVEL,
  //   unit: UNIT,
  //   name: "Example pattern",
  //   focus: "contrast-none",
  //   templates: [
  //     { cy: "Dw i'n {verbnoun}.", en: "I {verbnoun}.", slot: "verbnoun" },
  //   ],
  //   mutation: "none",
  //   ruleId: "none",
  //   constraints: {
  //     verbnoun: { type: "verbnoun" },
  //   },
  //   evidenceRefs: DEFAULT_PATTERN_EVIDENCE,
  //   explanationOverride: {
  //     en: "Use for contrastive non-mutation examples in this unit.",
  //     cy: "Defnyddiwch ar gyfer enghreifftiau cyferbyniol heb dreiglad yn yr uned hon.",
  //   },
  // },
];
`;

fs.writeFileSync(file, content, "utf8");
if (!fs.existsSync(evidenceFile)) {
  const evidenceContent = {
    sourceId: "TODO-source-id",
    sourceTitle: "TODO source title",
    notes: "Store only page/box references, not full textbook text.",
    unit: unit,
    level,
    dialect,
    refs: [
      { page: 1, boxLabel: `TODO-unit-${unit}-vocab`, note: "replace" },
      { page: 1, boxLabel: `TODO-unit-${unit}-patterns`, note: "replace" },
    ],
  };
  fs.writeFileSync(evidenceFile, `${JSON.stringify(evidenceContent, null, 2)}\n`, "utf8");
}
console.log(`Created ${file}`);
console.log(`Created ${evidenceFile}`);

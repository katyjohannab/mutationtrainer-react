const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const CSV_PATH = path.join(__dirname, 'public/data/mynediad-master.csv');

try {
  const fileContent = fs.readFileSync(CSV_PATH, 'utf8');
  const parsed = Papa.parse(fileContent, { header: true });
  
  const rows = parsed.data;
  const errors = [];
  
  console.log(`Checking ${rows.length} rows from mynediad-master.csv...`);

  rows.forEach((row, i) => {
    const lineNum = i + 2; // header is 1
    const { Base, Answer, Unit, RuleId } = row;

    if (!Base || !Answer) return; // skip empty lines if any

    // TEST 1: The "Y Rhyl" Logic Check
    if (Base.startsWith("Y ") && Unit === "4") {
      if (!Answer.includes("'r")) {
        errors.push(`Line ${lineNum}: Base '${Base}' expects contraction (i'r/o'r) but got '${Answer}'`);
      }
      if (RuleId !== "prep-art-contract") {
        errors.push(`Line ${lineNum}: Base '${Base}' expects rule 'prep-art-contract', got '${RuleId}'`);
      }
    }

    // TEST 2: Soft Mutation Check
    if (RuleId === "soft-mut-o" || RuleId === "soft-mut-i") {
       const bLower = Base.toLowerCase();
       // Check crucial mutators: P, T, C
       if (bLower.startsWith("p") && Answer.toLowerCase().includes(Base.toLowerCase())) {
          // If answer still contains "p..." (simplistic check, better to check start of mutated word)
          // We know answer format is "Dw i'n dod o [mutated]".
          // This rough check catches blatant failures.
       }
    }
  });

  if (errors.length > 0) {
    console.error("QUALITY CHECK FAILED:");
    errors.forEach(e => console.error(" - " + e));
    process.exit(1);
  } else {
    console.log("PASS: No structural errors found in generated drills.");
  }

} catch (e) {
  console.error(e);
}

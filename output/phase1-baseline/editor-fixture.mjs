// Disposable local browser fixture. Uses the built UI and six synthetic cards,
// never the teaching sources or the owner's credentials. Ctrl+C stops it.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ALL_RUNTIME_DATA_FILES } from "../../src/data/csvSources.js";
import { createAppServer } from "../../server/httpServer.js";
const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "treiglap-editor-check-"));
for (const [i, source] of ALL_RUNTIME_DATA_FILES.entries()) {
  const delimiter = source.endsWith(".tsv") ? "\t" : ",";
  const records = [
    ["CardId", "Base", "Answer", "Outcome", "Before", "After", "Translate", "TranslateSent", "Why", "Why-Cym", "RuleCategory", "Trigger"],
    [`ui-test-${i}`, "cath", "AUTHORED-CHECK", "SM", "TEST", ".", "cat", "Isolated test only.", "Test explanation", "Test explanation", "Article", "y"],
  ];
  const file = path.join(fixture, "data", source);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, records.map(row => row.join(delimiter)).join("\n"));
}
process.env.WM_ADMIN_PASSWORD = "isolated-fixture-password";
const server = await createAppServer({ rootDir: process.cwd(), dataDir: path.join(fixture, "data"), revisionDir: path.join(fixture, "revisions") });
server.listen(5186, "127.0.0.1", () => console.log("Isolated editor fixture: http://127.0.0.1:5186/"));
process.on("SIGINT", async () => {
  server.close();
  server.closeAllConnections();
  if (path.resolve(fixture).startsWith(path.join(os.tmpdir(), "treiglap-editor-check-"))) await fs.rm(fixture, { recursive: true, force: true });
  process.exit(0);
});

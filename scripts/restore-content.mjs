import { restoreSourceRevision } from "../server/contentRepository.js";
const [source, revision, expectedSourceRevision, apply] = process.argv.slice(2);
if (!source || !revision || !expectedSourceRevision || apply !== "--apply") {
  console.error("Usage: node scripts/restore-content.mjs <registered-source> <backup-sha256> <current-sha256> --apply\nRestores one source, retaining a backup of its current contents. Stop editing while restoring.");
  process.exitCode = 1;
} else {
  try {
    const result = await restoreSourceRevision({ source, revision, expectedSourceRevision });
    console.log(`Restored ${source}; revision ${result.sourceRevision}. Reload the app.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}

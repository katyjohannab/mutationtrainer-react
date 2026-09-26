const path = require('node:path');
(async () => {
  const { validateContentDirectory } = await import('../server/validateContent.js');
  const report = await validateContentDirectory(path.resolve(process.env.WM_DATA_DIR || 'public/data'));
  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else {
    for (const file of report.files) console.log(`${file.source}: ${file.count} cards`);
    for (const error of report.errors) console.error(`${error.source}${error.record ? ` record ${error.record}` : ''}${error.cardId ? ` (${error.cardId})` : ''}: ${error.message}`);
    const counts = {};
    for (const warning of report.warnings) counts[warning.field] = (counts[warning.field] || 0) + 1;
    console.log(`Editorial warnings (not a Welsh correctness verdict): ${JSON.stringify(counts)}`);
    console.log(`${report.cardCount} cards; ${report.errors.length} structural errors.`);
  }
  process.exitCode = report.errors.length ? 1 : 0;
})().catch(error => { console.error(error.message); process.exitCode = 1; });

import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';
import Papa from 'papaparse';

// Read-only inspection of the actual runtime loader and current registered sources.
const root = process.cwd();
const out = path.join(root, 'output/audit-2026-09-26');
await fs.mkdir(out, { recursive: true });
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const originalFetch = globalThis.fetch;
try {
  const { ALL_RUNTIME_DATA_FILES } = await server.ssrLoadModule('/src/data/csvSources.js');
  const { loadManyCsvFiles } = await server.ssrLoadModule('/src/services/loadCsv.js');
  const { GRAMMAR_RULES } = await server.ssrLoadModule('/src/data/rules.js');
  const { mutateWord, makeChoices } = await server.ssrLoadModule('/src/utils/grammar.js');
  const { PRESET_DEFS } = await server.ssrLoadModule('/src/data/presets.js');
  const { applyFilters } = await server.ssrLoadModule('/src/utils/applyFilters.js');
  const { checkAnswer } = await server.ssrLoadModule('/src/utils/checkAnswer.js');
  globalThis.fetch = async (url) => {
    const file = String(url).split('/data/')[1];
    if (!ALL_RUNTIME_DATA_FILES.includes(file)) throw new Error('Unexpected source URL');
    return new Response(await fs.readFile(path.join(root, 'public/data', file), 'utf8'));
  };
  const rows = await loadManyCsvFiles(ALL_RUNTIME_DATA_FILES);
  const group = (list, key) => Object.fromEntries([...Map.groupBy(list, key)].map(([k,v]) => [k,v.length]));
  // Record number includes the header; it is not a physical line number when blank lines exist.
  const select = r => ({ id:r.cardId, source:r.__source, recordNumber:r.__rowIndex+2, before:r.before, base:r.base, answer:r.answer, after:r.after, outcome:r.outcome, trigger:r.trigger, category:r.category, translate:r.translateSent, why:r.why, whyCym:r.whyCym, ruleId:r.ruleId });
  const duplicates = [...Map.groupBy(rows, r => r.cardId)].filter(([,v]) => v.length > 1).map(([id,v]) => ({id,rows:v.map(select)}));
  const mismatches = rows.filter(r => !String(r.answer).split('|').some(a => a.trim().toLowerCase() === mutateWord(r.base, r.outcome).toLowerCase())).map(select);
  const ambiguous = [...Map.groupBy(rows, r => [r.before,r.base,r.after].map(s => String(s??'').toLowerCase()).join('|'))].filter(([,v]) => new Set(v.map(r=>r.answer.toLowerCase())).size > 1).map(([,v])=>v.map(select));
  const issues = {duplicates, mismatches, ambiguous,
    singleChoices:rows.filter(r=>makeChoices(r,rows,{base:r.base}).length<2).map(select),
    pipeAnswers:rows.filter(r=>r.answer.includes('|')).map(select),
    neu:rows.filter(r=>r.trigger?.toLowerCase()==='neu').map(select),
    articlesLlrh:rows.filter(r=>/^(ll|rh)/i.test(r.base)&&/article/i.test(r.category)).map(select),
    nasalYn:rows.filter(r=>r.outcome==='nasal'&&/\byn$/i.test(r.before)).map(select),
    unregisteredMynediad: Papa.parse(await fs.readFile('public/data/Mynediad-De/unit1.csv','utf8'),{header:true,skipEmptyLines:true}).data.length,
  };
  const summary = { date:'2026-09-26', total:rows.length, bySource:group(rows,r=>r.__source), byOutcome:group(rows,r=>r.outcome), byLevel:group(rows,r=>r.level||'(missing)'), byCategory:group(rows,r=>r.category||'(missing)'), missing:Object.fromEntries(['cardId','base','answer','translate','translateSent','why','whyCym','ruleId','level'].map(k=>[k, rows.filter(r=>!r[k]).length])), presets:Object.fromEntries(Object.entries(PRESET_DEFS).map(([id,preset])=>[id,applyFilters(rows,{preset}).length])), issueCounts:Object.fromEntries(Object.entries(issues).map(([k,v])=>[k,Array.isArray(v)?v.length:v])), rulesUsed:group(rows.filter(r=>r.ruleId),r=>r.ruleId), unusedRules:Object.keys(GRAMMAR_RULES).filter(k=>!rows.some(r=>r.ruleId===k)), grammarProbes:['chwaer','ddim','thad','phlentyn','ffrind','llaw','rhan'].map(base=>({base,soft:mutateWord(base,'soft'),nasal:mutateWord(base,'nasal'),aspirate:mutateWord(base,'aspirate')})), pipeProbe:{choices:makeChoices({base:'ci',answer:'gi|ghi'},[],{base:'ci'}),acceptLiteralPipe:checkAnswer({answer:'gi|ghi'},'gi|ghi') }};
  await fs.writeFile(path.join(out,'runtime-rows.json'),JSON.stringify(rows,null,2));
  await fs.writeFile(path.join(out,'content-findings.json'),JSON.stringify(issues,null,2));
  await fs.writeFile(path.join(out,'content-summary.json'),JSON.stringify(summary,null,2));
  console.log(JSON.stringify(summary,null,2));
} finally { globalThis.fetch = originalFetch; await server.close(); }

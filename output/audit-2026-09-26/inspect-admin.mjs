import fs from 'node:fs/promises';
import path from 'node:path';
import Papa from 'papaparse';
import { preview } from 'vite';
import { saveCardPatch, createAdminApiMiddleware } from '../../server/adminApi.js';

// Use disposable fixtures only; never edits real public/data or dist files.
const root = path.resolve('output/audit-2026-09-26/admin-fixture');
await fs.mkdir(path.join(root,'public/data'),{recursive:true});
await fs.mkdir(path.join(root,'dist/data'),{recursive:true});
const source = await fs.readFile('public/data/cards.tsv','utf8');
await fs.writeFile(path.join(root,'public/data/cards.tsv'),source);
const parse = text => Papa.parse(text,{header:true,delimiter:'\t',quoteChar:'\0',skipEmptyLines:true}).data;
const before = parse(source);
await saveCardPatch({rootDir:root,source:'cards.tsv',rowIndex:0,expectedCardId:'c000001',rawPatch:{translate:'audit fixture'}});
const after = parse(await fs.readFile(path.join(root,'public/data/cards.tsv'),'utf8'));
const changed = [];
for(let i=1;i<before.length;i++) for(const k of Object.keys(before[i])) if(before[i][k]!==after[i]?.[k]) changed.push({row:i+2,column:k,before:before[i][k],after:after[i]?.[k]});
const csv='CardId,Base,Answer,Outcome\np-audit,ci,ci,NONE\n';
await fs.writeFile(path.join(root,'public/data/prep.csv'),csv);
await fs.writeFile(path.join(root,'dist/data/prep.csv'),csv);
await fs.writeFile(path.join(root,'dist/index.html'),'<!doctype html><title>Audit fixture</title>');
const runtime=await preview({root,configFile:false,publicDir:'public',build:{outDir:'dist'},preview:{host:'127.0.0.1',port:5191,strictPort:true},plugins:[{name:'audit-admin',configurePreviewServer(s){s.middlewares.use(createAdminApiMiddleware({rootDir:root}));}}]});
try {
 await saveCardPatch({rootDir:root,source:'prep.csv',rowIndex:0,expectedCardId:'p-audit',rawPatch:{answer:'gi'}});
 const served=await (await fetch('http://127.0.0.1:5191/data/prep.csv')).text();
 const disk=await fs.readFile(path.join(root,'public/data/prep.csv'),'utf8');
 const result={tsv:{unrelatedCellsChanged:changed.length,unrelatedRowsChanged:new Set(changed.map(x=>x.row)).size,examples:changed.slice(0,3)},preview:{sourceChanged:disk.includes('gi'),servedUpdated:served.includes('gi'),served,source:disk}};
 await fs.writeFile('output/audit-2026-09-26/admin-findings.json',JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));
} finally {await new Promise(resolve=>runtime.httpServer.close(resolve));}

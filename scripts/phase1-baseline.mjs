// One-time, read-only source snapshot for the Phase 1 implementation.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { ALL_RUNTIME_DATA_FILES } from '../src/data/csvSources.js';
const destination = path.resolve('output/phase1-baseline');
const files = [...ALL_RUNTIME_DATA_FILES.map(f => `public/data/${f}`),
  'src/data/csvSources.js', 'src/data/csvSources.test.js', 'src/data/packRegistry.js',
  'src/data/presets.js', 'src/data/presets.test.js'];
const manifest = [];
for (const file of files) {
  const bytes = await fs.readFile(file);
  const target = path.join(destination, file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, bytes, { flag: 'wx' });
  manifest.push({ file, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
}
await fs.writeFile(path.join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
console.log(`Preserved ${manifest.length} files in ${destination}`);

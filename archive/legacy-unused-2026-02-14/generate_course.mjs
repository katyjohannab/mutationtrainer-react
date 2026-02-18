// generate_course.mjs
import fs from 'fs';
import path from 'path';
import PapaParse from 'papaparse';

// Import Units
import { unit6 } from './src/content-gen/units/m-u6-weather.js';

const OUTPUT_DIR = './public/data/generated';
const UNITS = [unit6];

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log("🚀 Starting Course Generation...");

async function run() {
  for (const unit of UNITS) {
    console.log(`Processing ${unit.title}...`);
    
    try {
      const cards = unit.generate();
      console.log(`  -> Generated ${cards.length} cards.`);
      
      // Convert to CSV
      const csv = PapaParse.unparse(cards, {
        header: true,
        quotes: true // Force quotes to be safe
      });
      
      const filename = `${unit.id}.csv`;
      const filePath = path.join(OUTPUT_DIR, filename);
      
      fs.writeFileSync(filePath, csv, 'utf-8');
      console.log(`  -> Wrote to ${filePath}`);
      
    } catch (e) {
      console.error(`ERROR processing ${unit.id}:`, e);
    }
  }
  
  console.log("✅ Generation Complete.");
}

run();

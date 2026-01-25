// src/services/loadCsv.js
import Papa from "papaparse";

/**
 * Load a CSV from /data/FILE.csv and return rows.
 * Adds __source so we can later filter by sourceScope like the old app.
 */
export async function loadCsvFromPublicData(filename) {
  const url = `/data/${filename}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);

  const csvText = await res.text();

  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors?.length) {
    console.warn(`CSV parse warnings for ${filename}`, parsed.errors);
  }

  // Attach __source and also trim string fields
  const rows = parsed.data.map((row) => {
    const clean = {};
    for (const [k, v] of Object.entries(row)) {
      clean[k] = typeof v === "string" ? v.trim() : v;
    }
    clean.__source = filename;
    return clean;
  });

  return rows;
}

/**
 * Load multiple CSV files and merge rows.
 */
export async function loadManyCsvFiles(filenames) {
  const chunks = await Promise.all(filenames.map(loadCsvFromPublicData));
  return chunks.flat();
}


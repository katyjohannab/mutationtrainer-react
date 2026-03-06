// src/data/csvSources.js
import { ACTIVE_DYSGU_UNITS } from "./dysguUnitRegistry.js";

export const PROTECTED_MANUAL_CSV_FILES = [
  "cards.csv",
  "prep.csv",
  "article-sylfaen.csv",
];

const REGISTERED_UNIT_FILES = ACTIVE_DYSGU_UNITS.map((unit) => unit.file);
const REGISTERED_PACK_FILES = ["Mynediad-De/packs/myn-de-p01-places.tsv"];

// Runtime dataset list for all delimited files (CSV and TSV).
export const ALL_RUNTIME_DATA_FILES = [
  ...new Set([
    ...PROTECTED_MANUAL_CSV_FILES,
    ...REGISTERED_UNIT_FILES,
    ...REGISTERED_PACK_FILES,
  ]),
];

// Backwards-compatible alias while call-sites migrate.
export const ALL_CSV_FILES = ALL_RUNTIME_DATA_FILES;

export const CSV_SOURCE_META = {
  ...Object.fromEntries(
    PROTECTED_MANUAL_CSV_FILES.map((file) => [file, { sourceType: "protected-manual" }])
  ),
  ...Object.fromEntries(
    ACTIVE_DYSGU_UNITS.map((unit) => [
      unit.file,
      {
        sourceType: "dysgu-unit",
        registryId: unit.id,
        course: unit.course,
        level: unit.course,
        dialect: unit.dialect,
        unit: String(unit.unit),
      },
    ])
  ),
  "Mynediad-De/packs/myn-de-p01-places.tsv": {
    sourceType: "dysgu-pack",
    course: "mynediad",
    level: "mynediad",
    dialect: "south",
    unit: "p01",
    pack: "myn-de-p01-places",
  },
};

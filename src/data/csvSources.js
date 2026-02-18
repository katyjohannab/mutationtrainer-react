// src/data/csvSources.js
import { ACTIVE_DYSGU_UNITS } from "./dysguUnitRegistry.js";

export const PROTECTED_MANUAL_CSV_FILES = [
  "cards.csv",
  "prep.csv",
  "article-sylfaen.csv",
];

const REGISTERED_UNIT_FILES = ACTIVE_DYSGU_UNITS.map((unit) => unit.file);

export const ALL_CSV_FILES = [...new Set([...PROTECTED_MANUAL_CSV_FILES, ...REGISTERED_UNIT_FILES])];

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
};


// src/data/courses.js
import { COURSE_PACK_BLUEPRINTS } from "./coursePacks";
import {
  COURSE_LABELS,
  COURSE_ORDER,
  DIALECT_LABELS,
  DYSGU_UNITS,
} from "./dysguUnitRegistry.js";

function compareByDialectThenUnit(a, b) {
  if (a.dialect !== b.dialect) return a.dialect.localeCompare(b.dialect);
  return a.unit - b.unit;
}

function makeUnitEntry(unitMeta) {
  const courseLabel = COURSE_LABELS[unitMeta.course] || { en: unitMeta.course, cy: unitMeta.course };
  const dialectLabel = DIALECT_LABELS[unitMeta.dialect] || {
    en: unitMeta.dialect,
    cy: unitMeta.dialect,
  };
  const isActive = unitMeta.status === "active";

  return {
    id: unitMeta.id,
    title: unitMeta.title || {
      en: `Unit ${unitMeta.unit}`,
      cy: `Uned ${unitMeta.unit}`,
    },
    description: unitMeta.description || {
      en: `${courseLabel.en} ${dialectLabel.en} unit ${unitMeta.unit}`,
      cy: `${courseLabel.cy} ${dialectLabel.cy} uned ${unitMeta.unit}`,
    },
    section: `${unitMeta.dialect}-units`,
    status: unitMeta.status,
    isSelectable: isActive,
    sourceFile: unitMeta.file || null,
    criteria: {
      course: unitMeta.course,
      level: unitMeta.course,
      dialect: unitMeta.dialect,
      unit: unitMeta.unit,
    },
  };
}

function makeDialectAggregatePack(level, dialect, units) {
  if (!units.length) return null;
  const dialectLabel = DIALECT_LABELS[dialect] || { en: dialect, cy: dialect };
  const sortedUnits = [...units].sort((a, b) => a - b);

  return {
    id: `${level}-${dialect}-all-units`,
    title: {
      en: `${dialectLabel.en} All Units`,
      cy: `Pob Uned ${dialectLabel.cy}`,
    },
    description: {
      en: `Combined deck across all available ${dialectLabel.en.toLowerCase()} units.`,
      cy: `Pecyn cyfun ar draws pob uned ${dialectLabel.cy.toLowerCase()} sydd ar gael.`,
    },
    isPack: true,
    status: "active",
    isSelectable: true,
    section: `${dialect}-packs`,
    criteria: {
      course: level,
      level,
      dialect,
      unit: sortedUnits,
    },
  };
}

function buildPackEntries(level, activeUnits) {
  const byDialect = { south: [], north: [] };
  activeUnits.forEach((unit) => {
    if (!byDialect[unit.dialect]) byDialect[unit.dialect] = [];
    byDialect[unit.dialect].push(unit.unit);
  });

  const entries = [];
  const southPack = makeDialectAggregatePack(level, "south", byDialect.south || []);
  const northPack = makeDialectAggregatePack(level, "north", byDialect.north || []);
  if (southPack) entries.push(southPack);
  if (northPack) entries.push(northPack);

  const customPacks = COURSE_PACK_BLUEPRINTS[level] || [];
  customPacks.forEach((pack) => {
    entries.push({
      ...pack,
      isPack: true,
      status: pack.status || "active",
      isSelectable: pack.status !== "coming-soon",
      section: pack.section || "packs",
    });
  });

  return entries;
}

function buildCourse(level) {
  const unitDefs = DYSGU_UNITS.filter((unit) => unit.course === level).sort(compareByDialectThenUnit);
  const activeUnitDefs = unitDefs.filter((unit) => unit.status === "active");
  const unitEntries = unitDefs.map(makeUnitEntry);
  const packEntries = buildPackEntries(level, activeUnitDefs);

  if (unitEntries.length === 0 && packEntries.length === 0) return null;

  const availableDialects = [...new Set(activeUnitDefs.map((unit) => unit.dialect))];

  return {
    id: level,
    isDysgu: true,
    title: COURSE_LABELS[level] || { en: level, cy: level },
    description: {
      en: "Dysgu Cymraeg course units from verified CSV content.",
      cy: "Unedau cwrs Dysgu Cymraeg o gynnwys CSV wedi ei wirio.",
    },
    dialects: ["south", "north"],
    availableDialects,
    units: [...unitEntries, ...packEntries],
  };
}

const STATIC_COURSES = [
  {
    id: "core",
    isDysgu: false,
    title: { en: "Core Manual Deck", cy: "Prif Becyn Llawlyfr" },
    description: {
      en: "Only manually verified datasets are active.",
      cy: "Dim ond setiau data sydd wedi eu gwirio a llaw sy'n weithredol.",
    },
    units: [
      {
        id: "core-manual-all",
        title: { en: "All Verified Cards", cy: "Pob Cerdyn Wedi'i Wirio" },
        description: {
          en: "cards.csv + prep.csv + article-sylfaen.csv",
          cy: "cards.csv + prep.csv + article-sylfaen.csv",
        },
        status: "active",
        isSelectable: true,
        section: "units",
        criteria: {
          sourceScope: ["cards.csv", "prep.csv", "article-sylfaen.csv"],
        },
      },
    ],
  },
];

const dysguCourses = COURSE_ORDER.map((level) => buildCourse(level)).filter(Boolean);

export const COURSES = [...STATIC_COURSES, ...dysguCourses];

// src/data/dysguUnitRegistry.js

export const COURSE_ORDER = ["mynediad", "sylfaen", "canolradd", "uwch"];

export const COURSE_LABELS = {
  mynediad: { en: "Mynediad (Entry)", cy: "Mynediad" },
  sylfaen: { en: "Sylfaen (Foundation)", cy: "Sylfaen" },
  canolradd: { en: "Canolradd (Intermediate)", cy: "Canolradd" },
  uwch: { en: "Uwch (Advanced)", cy: "Uwch" },
};

export const DIALECT_LABELS = {
  south: { en: "South", cy: "De" },
  north: { en: "North", cy: "Gogledd" },
};

// Keep this file explicit and hand-edited.
// It is the single source of truth for CSV course/unit registration.
export const DYSGU_UNIT_REGISTRY = [
  {
    id: "uwch-south-u1",
    file: "Uwch1/unit1.csv",
    course: "uwch",
    dialect: "south",
    unit: 1,
    status: "active",
    title: { en: "Unit 1", cy: "Uned 1" },
    description: {
      en: "Uwch South unit 1 from Dysgu Cymraeg course data.",
      cy: "Uned 1 Uwch De o ddata cwrs Dysgu Cymraeg.",
    },
  },
  {
    id: "uwch-south-u2",
    file: "Uwch1/unit2.csv",
    course: "uwch",
    dialect: "south",
    unit: 2,
    status: "active",
    title: { en: "Unit 2", cy: "Uned 2" },
    description: {
      en: "Uwch South unit 2 from Dysgu Cymraeg course data.",
      cy: "Uned 2 Uwch De o ddata cwrs Dysgu Cymraeg.",
    },
  },
  {
    id: "uwch-north-u1",
    file: null,
    course: "uwch",
    dialect: "north",
    unit: 1,
    status: "coming-soon",
    title: { en: "Unit 1", cy: "Uned 1" },
    description: {
      en: "North dialect content is planned.",
      cy: "Mae cynnwys tafodiaith y gogledd ar y gweill.",
    },
  },
];

export const DYSGU_UNITS = [...DYSGU_UNIT_REGISTRY];

export const ACTIVE_DYSGU_UNITS = DYSGU_UNITS.filter(
  (unit) => unit.status === "active" && typeof unit.file === "string" && unit.file.trim() !== ""
);

export const DYSGU_UNIT_FILES = ACTIVE_DYSGU_UNITS.map((unit) => unit.file);


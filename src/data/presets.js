import { COURSES } from "./courses";
import {
  DYSGU_PACKS_BY_LEVEL as REGISTRY_DYSGU_PACKS_BY_LEVEL,
  FOUNDATION_PACK_IDS,
  PACK_PRESET_DEFS,
  PACK_PRESET_ORDER,
  STARTER_PACK_GROUPS as REGISTRY_STARTER_PACK_GROUPS,
  STARTER_PACK_ORDER_IDS,
} from "./packRegistry.js";

const BASE_PRESETS = {
  "starter-all-verified": {
    id: "starter-all-verified",
    titleKey: "preset.allVerified.title",
    descriptionKey: "preset.allVerified.desc",
    sourceScope: ["cards.tsv", "prep.csv", "article-sylfaen.csv"],
  },
};

const COURSE_PRESETS = {};
for (const course of COURSES) {
  if (course.isDysgu === false) continue;

  for (const unit of course.units) {
    if (unit.isSelectable === false || unit.status === "coming-soon") continue;

    COURSE_PRESETS[unit.id] = {
      id: unit.id,
      title: unit.title,
      description: unit.description ?? null,
      ...unit.criteria,
    };
  }
}

export const PRESET_DEFS = {
  ...BASE_PRESETS,
  ...PACK_PRESET_DEFS,
  ...COURSE_PRESETS,
};

export const PRESET_ORDER = ["starter-all-verified", ...PACK_PRESET_ORDER];

export const STARTER_PACK_ORDER = STARTER_PACK_ORDER_IDS;

export const STARTER_PACK_GROUPS = REGISTRY_STARTER_PACK_GROUPS;

export const FOUNDATION_PACKS = FOUNDATION_PACK_IDS;

export const DYSGU_PACKS_BY_LEVEL = REGISTRY_DYSGU_PACKS_BY_LEVEL;

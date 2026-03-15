// src/data/presets.js
import { COURSES } from "./courses";

const BASE_PRESETS = {
  "starter-all-verified": {
    id: "starter-all-verified",
    titleKey: "preset.allVerified.title",
    descriptionKey: "preset.allVerified.desc",
    sourceScope: ["cards.tsv", "prep.csv", "article-sylfaen.csv"],
  },
  "starter-preps": {
    id: "starter-preps",
    titleKey: "preset.starterPreps.title",
    descriptionKey: "preset.starterPreps.desc",
    sourceScope: ["prep.csv"],
  },
  "numbers-1-10": {
    id: "numbers-1-10",
    titleKey: "preset.numbers1to10.title",
    descriptionKey: "preset.numbers1to10.desc",
    triggers: ["un","dwy","dau","tri","tair","pedwar","pedair","pum","pump","chwech","chwe","saith","wyth","naw","deg"],
  },
  "articles": {
    id: "articles",
    titleKey: "preset.articles.title",
    descriptionKey: "preset.articles.desc",
    category: "Article",
    sourceScope: ["article-sylfaen.csv"],
  },
  "place-names": {
    id: "place-names",
    titleKey: "preset.placeNames.title",
    descriptionKey: "preset.placeNames.desc",
    category: "PlaceName",
  },
  "mynediad-place-names-pack-01": {
    id: "mynediad-place-names-pack-01",
    titleKey: "preset.mynediadPlaceNamesPack01.title",
    descriptionKey: "preset.mynediadPlaceNamesPack01.desc",
    sourceScope: ["Mynediad-De/packs/myn-de-p01-places.tsv"],
  },
};

// Generate presets from Courses
const COURSE_PRESETS = {};
for (const course of COURSES) {
  if (course.isDysgu === false) continue;

  for (const unit of course.units) {
    if (unit.isSelectable === false || unit.status === "coming-soon") continue;

    // Preserve the structure required by applyFilters
    COURSE_PRESETS[unit.id] = {
      id: unit.id,
      title: unit.title, // { en, cy } object
      description: unit.description ?? null,
      ...unit.criteria
    };
  }
}

export const PRESET_DEFS = {
  ...BASE_PRESETS,
  ...COURSE_PRESETS,
};

export const PRESET_ORDER = [
  "starter-all-verified",
  "starter-preps",
  "numbers-1-10",
  "articles",
  "place-names",
];

// Curated user-facing starter packs (keeps compatibility with PRESET_DEFS/PRESET_ORDER).
export const STARTER_PACK_ORDER = [
  "starter-preps",
  "numbers-1-10",
  "articles",
  "place-names",
  "mynediad-place-names-pack-01",
];

export const STARTER_PACK_GROUPS = [
  {
    id: "core",
    presetIds: ["starter-preps", "numbers-1-10", "articles", "place-names"],
  },
  {
    id: "mynediad",
    titleKey: "courseMynediad",
    presetIds: ["mynediad-place-names-pack-01"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// NEW FILTER UI DATA STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Foundation packs — generalist packs for any learner.
 * These are not tied to any specific Dysgu Cymraeg course level.
 */
export const FOUNDATION_PACKS = [
  "starter-preps",
  "numbers-1-10",
  "articles",
  "place-names",
];

/**
 * Dysgu Cymraeg packs organized by course level.
 * Add pack IDs here as content is created for each level.
 */
export const DYSGU_PACKS_BY_LEVEL = {
  mynediad: ["mynediad-place-names-pack-01"],
  sylfaen: [],
  canolradd: [],
  uwch: [], // Note: uwch unit content exists but not organized as "packs" yet
};


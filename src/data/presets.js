// src/data/presets.js
import { COURSES } from "./courses";

const BASE_PRESETS = {
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
  "lazy-test": {
    id: "lazy-test",
    title: "Lazy CSV Test",
    description: "Testing auto-generated answers and rule lookups.",
    sourceScope: ["test-lazy.csv"],
  },
};

// Generate presets from Courses
const COURSE_PRESETS = {};
for (const course of COURSES) {
  for (const unit of course.units) {
    // Preserve the structure required by applyFilters
    COURSE_PRESETS[unit.id] = {
      id: unit.id,
      title: unit.title, // { en, cy } object
      description: null, // or derive from unit
      ...unit.criteria
    };
  }
}

export const PRESET_DEFS = {
  ...BASE_PRESETS,
  ...COURSE_PRESETS,
};

export const PRESET_ORDER = ["starter-preps", "numbers-1-10", "articles", "place-names", "lazy-test"];



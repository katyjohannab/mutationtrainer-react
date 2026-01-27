// src/data/presets.js
export const PRESET_DEFS = {
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
};

export const PRESET_ORDER = ["starter-preps", "numbers-1-10", "articles", "place-names"];


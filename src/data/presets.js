// src/data/presets.js

export const PRESET_DEFS = {
  "starter-preps": {
    id: "starter-preps",
    title: "Starter preps",
    description: "A curated guided set to warm up.",
    sourceScope: ["prep.csv"],
  },
  "numbers-1-10": {
    id: "numbers-1-10",
    title: "Numbers 1–10",
    description: "Cards triggered by numbers 1–10 across all CSVs.",
    triggers: ["un","dwy","dau","tri","tair","pedwar","pedair","pum","pump","chwech","chwe","saith","wyth","naw","deg"],
  },
  "articles": {
    id: "articles",
    title: "Articles",
    description: "Article focus (Sylfaen).",
    category: "Article",
    sourceScope: ["article-sylfaen.csv"],
  },
  "place-names": {
    id: "place-names",
    title: "Place names",
    description: "Place name cards across all CSVs.",
    category: "PlaceName",
  },
};

export const PRESET_ORDER = ["starter-preps", "numbers-1-10", "articles", "place-names"];

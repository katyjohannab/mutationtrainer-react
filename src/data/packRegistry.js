import { COURSE_ORDER } from "./dysguUnitRegistry.js";

const STARTER_GROUP_META = {
  core: { id: "core" },
  mynediad: { id: "mynediad", titleKey: "courseMynediad" },
};

const MYNEDIAD_PLACE_NAMES_FILE = "Mynediad-De/packs/myn-de-p01-places.tsv";

export const PACK_REGISTRY = [
  {
    id: "starter-preps",
    titleKey: "preset.starterPreps.title",
    descriptionKey: "preset.starterPreps.desc",
    criteria: {
      sourceScope: ["prep.csv"],
    },
    includeInPresetOrder: true,
    foundation: true,
    starterGroupId: "core",
  },
  {
    id: "numbers-1-10",
    titleKey: "preset.numbers1to10.title",
    descriptionKey: "preset.numbers1to10.desc",
    criteria: {
      triggers: [
        "un",
        "dwy",
        "dau",
        "tri",
        "tair",
        "pedwar",
        "pedair",
        "pum",
        "pump",
        "chwech",
        "chwe",
        "saith",
        "wyth",
        "naw",
        "deg",
      ],
    },
    includeInPresetOrder: true,
    foundation: true,
    starterGroupId: "core",
  },
  {
    id: "place-names",
    titleKey: "preset.placeNames.title",
    descriptionKey: "preset.placeNames.desc",
    criteria: {
      category: "PlaceName",
    },
    includeInPresetOrder: true,
    foundation: true,
    starterGroupId: "core",
  },
  {
    id: "articles",
    titleKey: "preset.articles.title",
    descriptionKey: "preset.articles.desc",
    criteria: {
      category: "Article",
      sourceScope: ["article-sylfaen.csv"],
    },
    includeInPresetOrder: true,
    level: "sylfaen",
  },
  {
    id: "mynediad-place-names-pack-01",
    packId: "myn-de-p01-places",
    titleKey: "preset.mynediadPlaceNamesPack01.title",
    descriptionKey: "preset.mynediadPlaceNamesPack01.desc",
    criteria: {
      sourceScope: [MYNEDIAD_PLACE_NAMES_FILE],
    },
    level: "mynediad",
    starterGroupId: "mynediad",
    runtimeSource: {
      file: MYNEDIAD_PLACE_NAMES_FILE,
      course: "mynediad",
      level: "mynediad",
      dialect: "south",
      unit: "p01",
    },
  },
];

export const PACK_REGISTRY_BY_ID = Object.fromEntries(
  PACK_REGISTRY.map((pack) => [pack.id, pack])
);

function makePackPresetDefinition(pack) {
  const preset = {
    id: pack.id,
    ...pack.criteria,
  };

  if (pack.title) preset.title = pack.title;
  if (pack.titleKey) preset.titleKey = pack.titleKey;
  if (pack.description !== undefined) preset.description = pack.description;
  if (pack.descriptionKey) preset.descriptionKey = pack.descriptionKey;

  return preset;
}

export const PACK_PRESET_DEFS = Object.fromEntries(
  PACK_REGISTRY.map((pack) => [pack.id, makePackPresetDefinition(pack)])
);

export const PACK_PRESET_ORDER = PACK_REGISTRY.filter((pack) => pack.includeInPresetOrder).map(
  (pack) => pack.id
);

export const FOUNDATION_PACK_IDS = PACK_REGISTRY.filter((pack) => pack.foundation).map(
  (pack) => pack.id
);

export const STARTER_PACK_ORDER_IDS = PACK_REGISTRY.filter((pack) => pack.starterGroupId).map(
  (pack) => pack.id
);

const starterGroupIds = [];
for (const pack of PACK_REGISTRY) {
  if (!pack.starterGroupId || starterGroupIds.includes(pack.starterGroupId)) continue;
  starterGroupIds.push(pack.starterGroupId);
}

export const STARTER_PACK_GROUPS = starterGroupIds
  .map((groupId) => ({
    ...(STARTER_GROUP_META[groupId] || { id: groupId }),
    presetIds: PACK_REGISTRY.filter((pack) => pack.starterGroupId === groupId).map(
      (pack) => pack.id
    ),
  }))
  .filter((group) => group.presetIds.length > 0);

export const DYSGU_PACKS_BY_LEVEL = (() => {
  const byLevel = Object.fromEntries(COURSE_ORDER.map((level) => [level, []]));

  for (const pack of PACK_REGISTRY) {
    if (!pack.level) continue;
    if (!byLevel[pack.level]) byLevel[pack.level] = [];
    byLevel[pack.level].push(pack.id);
  }

  return byLevel;
})();

export const RUNTIME_PACK_SOURCES = PACK_REGISTRY.flatMap((pack) => {
  if (!pack.runtimeSource?.file) return [];

  const { file, sourceType = "dysgu-pack", ...meta } = pack.runtimeSource;
  return [
    {
      file,
      sourceType,
      registryId: pack.id,
      pack: pack.packId || pack.id,
      ...meta,
    },
  ];
});

export const RUNTIME_PACK_SOURCE_FILES = RUNTIME_PACK_SOURCES.map((source) => source.file);

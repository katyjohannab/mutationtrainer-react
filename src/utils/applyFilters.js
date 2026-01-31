// src/utils/applyFilters.js

// Normalise for comparisons: lowercase and remove non-alphanumerics
function canon(s) {
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ""); // "Place names" -> "placenames"
}

// Split cells that may contain multiple tokens: un|dwy, un, dwy, un/dwy etc
function tokens(s) {
  const raw = (s ?? "").toString().trim();
  if (!raw) return [];
  return raw
    .split(/[\s,;|/]+/g)
    .map(canon)
    .filter(Boolean);
}

function matchesToken(cellValue, allowedSet) {
  // allowedSet contains canonical tokens (e.g. "un", "dwy")
  const t = tokens(cellValue);
  return t.some((x) => allowedSet.has(x));
}

function matchesCategory(cellValue, presetCategory) {
  const c = canon(cellValue);

  // Allow a couple of common variants/synonyms
  const preset = canon(presetCategory);

  // e.g. preset "PlaceName" should also match "placenames", "place-names", "place names"
  if (preset === "placename") {
    return c === "placename" || c === "placenames" || c === "placenamecards";
  }
  if (preset === "article") {
    return c === "article" || c === "articles";
  }

  return c === preset;
}

function mutationKeyFromOutcome(value) {
  const raw = (value ?? "").toString().trim().toLowerCase();
  if (!raw) return "none";
  const letters = raw.replace(/[^a-z]/g, "");
  if (letters.startsWith("sm")) return "soft";
  if (letters.startsWith("nm")) return "nasal";
  if (letters.startsWith("am")) return "aspirate";
  if (letters === "none") return "none";
  return "none";
}

export function applyFilters(rows, state) {
  let out = [...rows];
  // Guard against null state/preset/filters
  const preset = state?.preset;
  const filters = state?.filters;

  // 1) Preset filtering
  if (preset) {
    // A) Source Scope
    if (preset.sourceScope?.length) {
      const allowed = new Set(preset.sourceScope.map(canon));
      out = out.filter((r) => allowed.has(canon(r.__source)));
    }

    // B) Category
    if (preset.category) {
      out = out.filter((r) => matchesCategory(r.category, preset.category));
    }

    // C) Triggers
    if (preset.triggers?.length) {
      const allowedTriggers = new Set(preset.triggers.map(canon));
      out = out.filter((r) => matchesToken(r.trigger, allowedTriggers));
    }
  }

  // 2) Manual Families (User toggles)
  if (filters?.families && filters.families.size > 0) {
    const allowedMutations = filters.families;
    out = out.filter((r) => {
      const key = mutationKeyFromOutcome(r.outcome || r.Outcome);
      return allowedMutations.has(key);
    });
  }

  // 3) Manual Categories (User toggles)
  if (filters?.categories && filters.categories.size > 0) {
    const catSet = filters.categories;
    out = out.filter((r) => {
      const cat = r.category || r.rulecategory || r.RuleCategory || "";
      return catSet.has(canon(cat));
    });
  }

  return out;
}
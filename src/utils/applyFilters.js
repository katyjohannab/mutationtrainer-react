// src/utils/applyFilters.js

function norm(s) {
  return (s ?? "").toString().trim().toLowerCase();
}

/**
 * Apply preset layer first, then user filters.
 *
 * state fields expected:
 * - preset: { sourceScope?, triggers?, category? } OR null
 * - families: Set<string> (optional)
 * - categories: Set<string> (optional)
 * - triggerQuery: string (optional)
 */
export function applyFilters(rows, state) {
  let out = [...rows];

  const preset = state.preset;

  // 1) Preset sourceScope (restrict to certain CSV files)
  if (preset?.sourceScope?.length) {
    const allowed = new Set(preset.sourceScope.map(norm));
    out = out.filter((r) => allowed.has(norm(r.__source)));
  }

  // 2) Preset category
  if (preset?.category) {
    const c = norm(preset.category);
    out = out.filter((r) => norm(r.category) === c);
  }

  // 3) Preset triggers
  if (preset?.triggers?.length) {
    const allowedTriggers = new Set(preset.triggers.map(norm));
    out = out.filter((r) => allowedTriggers.has(norm(r.trigger)));
  }

  // ---- user filters (later you’ll hook these to the UI) ----

  // Families (Soft / Aspirate / Nasal / None), if your CSV has a field like family or mutationType
  if (state.families && state.families.size > 0) {
    const allowed = new Set([...state.families].map(norm));
    // change 'family' below if your CSV column name differs
    out = out.filter((r) => allowed.has(norm(r.family)));
  }

  // Categories (user-selected)
  if (state.categories && state.categories.size > 0) {
    const allowed = new Set([...state.categories].map(norm));
    out = out.filter((r) => allowed.has(norm(r.category)));
  }

  // Trigger query (free text)
  if (state.triggerQuery && norm(state.triggerQuery).length > 0) {
    const q = norm(state.triggerQuery);
    out = out.filter((r) => norm(r.trigger).includes(q));
  }

  return out;
}

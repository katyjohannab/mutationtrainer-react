import React, { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { cn } from "../lib/cn";
import { PRESET_DEFS, PRESET_ORDER } from "../data/presets";

import { Badge } from "./ui/badge";

function FilterBadge({ active, onClick, children, className }) {
  return (
    <Badge
      onClick={onClick}
      variant={active ? "default" : "secondary"}
      className={cn(
        "cursor-pointer select-none rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        active && "bg-emerald-700 text-white hover:bg-emerald-800",
        !active && "bg-slate-100 text-slate-700 hover:bg-slate-200",
        className
      )}
    >
      {children}
    </Badge>
  );
}

export default function FiltersPanel({
  className,
  activePresetId,
  onTogglePreset,
  available = { families: [], categories: [] },
  filters = { families: new Set(), categories: new Set() },
  onToggleFilter,
  onClearFilterType,
}) {
  const { t } = useI18n();

  const [expandedCats, setExpandedCats] = useState(false);

  const safeAvailable = available || { families: [], categories: [] };
  const safeFilters = filters || { families: new Set(), categories: new Set() };

  const isFamilyAll = safeFilters.families.size === 0;
  const isCategoryAll = safeFilters.categories.size === 0;

  // Decide how many categories to show
  // Screenshot has about 8-9 visible before "Fewer/More"
  const INITIAL_CAT_COUNT = 8;
  const visibleCategories = expandedCats
    ? safeAvailable.categories
    : safeAvailable.categories.slice(0, INITIAL_CAT_COUNT);

  return (
    <div className={cn("space-y-8 py-2 px-1", className)}>
      {/* 1. Quick Packs */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Quick packs</h2>
          <p className="text-sm text-slate-500">
            Start with a pack or fine-tune below.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Curated guided sets to jump into a topic.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_ORDER.map((id) => {
            const def = PRESET_DEFS[id];
            const active = activePresetId === id;
            const label = def?.titleKey ? t(def.titleKey) : def?.title ?? id;
            const desc = def?.descriptionKey
              ? t(def.descriptionKey)
              : def?.desc ?? "Practice set";

            return (
              <div
                key={id}
                onClick={() => onTogglePreset?.(active ? null : id)}
                className={cn(
                  "relative cursor-pointer rounded-xl border p-4 transition-all hover:shadow-md text-left select-none group",
                  active
                    ? "bg-emerald-50/50 border-[--cymru-green] ring-1 ring-[--cymru-green]"
                    : "bg-white border-slate-200 hover:border-emerald-200"
                )}
              >
                {active && (
                  <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
                    <div className="bg-[--cymru-green] rounded-full p-0.5 text-white">
                       <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                  </div>
                )}
                <div className="font-semibold text-slate-900 text-sm mb-1 pr-4 group-hover:text-[--cymru-green] transition-colors">
                  {label}
                </div>
                <div className="text-xs text-slate-500 leading-snug">
                  {desc}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Core Filters */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900">Core filters</h2>
          <p className="text-sm text-slate-500">
            Fine-tune across all cards.
          </p>
        </div>

        {/* Mutation Type */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Mutation Type
          </h3>
          <div className="flex flex-wrap gap-2">
            <FilterBadge
              active={isFamilyAll}
              onClick={() => onClearFilterType?.("families")}
            >
              All
            </FilterBadge>
            {safeAvailable.families.map(({ id, label }) => (
              <FilterBadge
                key={id}
                active={safeFilters.families.has(id)}
                onClick={() => onToggleFilter?.("families", id)}
              >
                {label}
              </FilterBadge>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            <FilterBadge
              active={isCategoryAll}
              onClick={() => onClearFilterType?.("categories")}
            >
              All
            </FilterBadge>
            {visibleCategories.map(({ id, label }) => (
              <FilterBadge
                key={id}
                active={safeFilters.categories.has(id)}
                onClick={() => onToggleFilter?.("categories", id)}
              >
                {label}
              </FilterBadge>
            ))}

            {/* Expander */}
            {safeAvailable.categories.length > INITIAL_CAT_COUNT && (
              <button
                type="button"
                onClick={() => setExpandedCats(!expandedCats)}
                className="px-3 py-1 rounded-md text-xs font-semibold border border-dashed border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400 flex items-center gap-1 transition-colors bg-transparent"
              >
                {expandedCats ? "Fewer filters" : "More filters"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn("transition-transform", expandedCats && "rotate-180")}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

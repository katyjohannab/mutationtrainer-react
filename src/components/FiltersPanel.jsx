import React, { useEffect, useState } from "react";
import { Sparkles, SlidersHorizontal } from "lucide-react";
import AppIcon from "./icons/AppIcon";
import { useI18n } from "../i18n/I18nContext";
import { cn } from "../lib/cn";
import { PRESET_DEFS, FOUNDATION_PACKS } from "../data/presets";
import DysguLevelPacks from "./filters/DysguLevelPacks";
import PackCard from "./filters/PackCard";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Badge, badgeVariants } from "./ui/badge";
import { Separator } from "./ui/separator";

const MUTATION_FILTERS = [
  { id: "aspirate", labelKey: "mutationFilterAspirate" },
  { id: "nasal", labelKey: "mutationFilterNasal" },
  { id: "soft", labelKey: "mutationFilterSoft" },
  { id: "none", labelKey: "mutationFilterNone" },
];

const MUTATION_FILTER_IDS = new Set(MUTATION_FILTERS.map((item) => item.id));
const LEVEL_LABEL_KEY_BY_ID = {
  mynediad: "courseMynediad",
  sylfaen: "courseSylfaen",
  canolradd: "courseCanolradd",
  uwch: "courseUwch",
};

function FilterBadge({ active, onClick, children, className, variant }) {
  return (
    <Badge
      onClick={onClick}
      variant={variant ?? (active ? "default" : "soft")}
      className={cn(
        "cursor-pointer select-none rounded-full px-3 py-1 text-xs font-semibold transition-colors",
        active && "ring-1 ring-primary/30",
        className
      )}
    >
      {children}
    </Badge>
  );
}

function ResetBadge({ onClick, children }) {
  return (
    <Badge
      onClick={onClick}
      className="cursor-pointer select-none rounded-full px-3 py-1 text-xs font-semibold transition-colors bg-[hsl(var(--cymru-red))] text-white hover:bg-[hsl(var(--cymru-red)/0.85)]"
    >
      {children}
    </Badge>
  );
}

function categoryTranslationKey(label) {
  return `category${String(label || "").replace(/[^a-zA-Z0-9]/g, "")}`;
}

export default function FiltersPanel({
  className,
  activePresetId,
  onTogglePreset,
  available = { families: [], categories: [], levels: [] },
  filters = { families: new Set(), categories: new Set(), levels: new Set() },
  onToggleFilter,
  onClearFilterType,
  defaultOpenItems,
  accordionType = "single",
}) {
  const { t, lang } = useI18n();

  const [expandedCats, setExpandedCats] = useState(false);

  const headerBase = "inline-flex items-center gap-2 font-semibold";
  const headerIcon = "h-4 w-4 shrink-0";

  const safeAvailable = {
    families: available?.families ?? [],
    categories: available?.categories ?? [],
    levels: available?.levels ?? [],
  };
  const safeFilters = {
    families: filters?.families ?? new Set(),
    categories: filters?.categories ?? new Set(),
    levels: filters?.levels ?? new Set(),
  };

  useEffect(() => {
    const current = Array.from(safeFilters.families ?? []);
    if (current.some((id) => !MUTATION_FILTER_IDS.has(id))) {
      onClearFilterType?.("families");
    }
  }, [safeFilters.families, onClearFilterType]);

  const isFamilyAll = safeFilters.families.size === 0;
  const isCategoryAll = safeFilters.categories.size === 0;
  const isLevelAll = safeFilters.levels.size === 0;

  const INITIAL_CAT_COUNT = 8;
  const visibleCategories = expandedCats
    ? safeAvailable.categories
    : safeAvailable.categories.slice(0, INITIAL_CAT_COUNT);

  const labelFor = (item) => {
    if (!item) return "";
    if (item.labelKey) return t(item.labelKey);

    if (item.label) {
      const translated = t(categoryTranslationKey(item.label));
      if (translated && translated !== categoryTranslationKey(item.label)) return translated;
    }

    return item.label ?? "";
  };

  const levelLabelFor = (item) => {
    if (!item) return "";
    const key = LEVEL_LABEL_KEY_BY_ID[item.id];
    if (key) return t(key);
    return item.label ?? "";
  };

  // Always uncontrolled — let the user open/close items freely.
  // defaultOpenItems can seed which items start open (e.g. "item-packs" for mobile drawer).
  const accordionProps = {
    defaultValue: defaultOpenItems ?? "item-packs",
  };

  const collapsibleProp = accordionType === "single" ? { collapsible: true } : {};

  /**
   * Get localized text from preset definitions
   */
  const getPackLabel = (def, lang) => {
    if (!def) return "";
    if (def.titleKey) return t(def.titleKey);
    if (typeof def.title === "object") return def.title[lang] || def.title.en || def.id;
    return def.title || def.id;
  };

  const getPackDesc = (def, lang) => {
    if (!def) return "";
    if (def.descriptionKey) return t(def.descriptionKey);
    if (typeof def.description === "object") return def.description[lang] || def.description.en || "";
    return def.description || def.desc || "";
  };

  return (
    <div className={cn("space-y-4 py-2 px-1", className)}>
      <Accordion
        className="w-full space-y-3"
        type={accordionType}
        {...collapsibleProp}
        {...accordionProps}
      >
        {/* ────────────────────────────────────────────────────────────────────
            PRACTICE PACKS — Foundation + Dysgu Cymraeg
        ──────────────────────────────────────────────────────────────────── */}
        <AccordionItem
          value="item-packs"
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline data-[state=open]:border-l-4 data-[state=open]:border-l-[hsl(var(--cymru-green))]">
            <div className={cn(headerBase, "text-sm text-[hsl(var(--cymru-green))]")}>
              <AppIcon
                icon={Sparkles}
                className={cn(headerIcon, "h-5 w-5 text-[hsl(var(--cymru-green))]")}
                aria-hidden="true"
              />
              <span className="font-bold">{t("practicePacksTitle")}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0">
            {/* Subtle green wash background */}
            <div className="bg-[hsl(var(--cymru-green-wash)/0.4)] px-4 py-5 space-y-6">
              {/* Subtitle hint */}
              <p className="text-xs text-muted-foreground">
                {t("practicePacksSubtitle")}
              </p>

              {/* Foundation Packs Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--cymru-green))]">
                  {t("foundationPacksHeading")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FOUNDATION_PACKS.map((id) => {
                    const def = PRESET_DEFS[id];
                    if (!def) return null;
                    const isActive = activePresetId === id;

                    return (
                      <PackCard
                        key={id}
                        active={isActive}
                        title={getPackLabel(def, lang)}
                        description={getPackDesc(def, lang)}
                        onClick={() => onTogglePreset?.(isActive ? null : id)}
                      />
                    );
                  })}
                </div>
              </div>

              <Separator className="bg-border/60" />

              {/* Dysgu Cymraeg Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--cymru-green))]">
                  {t("dysguPacksHeading")}
                </h3>
                <DysguLevelPacks
                  activePresetId={activePresetId}
                  onTogglePreset={onTogglePreset}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ────────────────────────────────────────────────────────────────────
            DESIGN YOUR SESSION — Advanced Filters
        ──────────────────────────────────────────────────────────────────── */}
        <AccordionItem
          value="item-filters"
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline data-[state=open]:border-l-4 data-[state=open]:border-l-[hsl(var(--cymru-gold))]">
            <div className={cn(headerBase, "text-sm text-[hsl(var(--cymru-gold))]")}>
              <AppIcon
                icon={SlidersHorizontal}
                className={cn(headerIcon, "h-5 w-5 text-[hsl(var(--cymru-gold))]")}
                aria-hidden="true"
              />
              <span className="font-bold">{t("designSessionTitle")}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0">
            {/* Subtle gold wash background */}
            <div className="bg-[hsl(var(--cymru-gold-wash)/0.4)] px-4 py-5 space-y-6">
              {/* Hint text */}
              <p className="text-xs text-muted-foreground">
                {t("designSessionHint")}
              </p>

              {/* Levels */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  {t("levelsHeading")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <FilterBadge
                    active={isLevelAll}
                    onClick={() => onClearFilterType?.("levels")}
                    variant={isLevelAll ? "cymru-gold" : "cymru-gold-wash"}
                  >
                    {t("filtersAll")}
                  </FilterBadge>
                  {safeAvailable.levels.map((item) => (
                    <FilterBadge
                      key={item.id}
                      active={safeFilters.levels.has(item.id)}
                      onClick={() => onToggleFilter?.("levels", item.id)}
                      variant={
                        safeFilters.levels.has(item.id)
                          ? "cymru-gold"
                          : "cymru-gold-wash"
                      }
                    >
                      {levelLabelFor(item)}
                    </FilterBadge>
                  ))}
                  {!isLevelAll && (
                    <ResetBadge onClick={() => onClearFilterType?.("levels")}>
                      {t("filtersReset")}
                    </ResetBadge>
                  )}
                </div>
              </div>

              {/* Mutation Type */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  {t("mutationTypeHeading")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <FilterBadge
                    active={isFamilyAll}
                    onClick={() => onClearFilterType?.("families")}
                    variant={isFamilyAll ? "cymru-dark" : "cymru-dark-wash"}
                  >
                    {t("filtersAll")}
                  </FilterBadge>
                  {MUTATION_FILTERS.map((item) => (
                    <FilterBadge
                      key={item.id}
                      active={safeFilters.families.has(item.id)}
                      onClick={() => onToggleFilter?.("families", item.id)}
                      variant={
                        safeFilters.families.has(item.id)
                          ? "cymru-dark"
                          : "cymru-dark-wash"
                      }
                    >
                      {labelFor(item)}
                    </FilterBadge>
                  ))}
                  {!isFamilyAll && (
                    <ResetBadge onClick={() => onClearFilterType?.("families")}>
                      {t("filtersReset")}
                    </ResetBadge>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  {t("categoriesHeading")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <FilterBadge
                    active={isCategoryAll}
                    onClick={() => onClearFilterType?.("categories")}
                    variant={isCategoryAll ? "cymru-light" : "cymru-light-wash"}
                  >
                    {t("filtersAll")}
                  </FilterBadge>
                  {visibleCategories.map((item) => (
                    <FilterBadge
                      key={item.id}
                      active={safeFilters.categories.has(item.id)}
                      onClick={() => onToggleFilter?.("categories", item.id)}
                      variant={
                        safeFilters.categories.has(item.id)
                          ? "cymru-light"
                          : "cymru-light-wash"
                      }
                    >
                      {labelFor(item)}
                    </FilterBadge>
                  ))}

                  {safeAvailable.categories.length > INITIAL_CAT_COUNT && (
                    <button
                      type="button"
                      onClick={() => setExpandedCats(!expandedCats)}
                      className={cn(
                        badgeVariants({ variant: "outline" }),
                        "cursor-pointer select-none rounded-full px-3 py-1 text-xs font-semibold border-dashed border-accent/40 text-foreground hover:bg-accent/10",
                        "gap-1"
                      )}
                    >
                      {t(expandedCats ? "filtersFewer" : "filtersMore")}
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
                  {!isCategoryAll && (
                    <ResetBadge onClick={() => onClearFilterType?.("categories")}>
                      {t("filtersReset")}
                    </ResetBadge>
                  )}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

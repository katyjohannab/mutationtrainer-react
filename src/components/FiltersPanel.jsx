import React, { useEffect, useState } from "react";
import { HelpCircle, Zap, Filter, BookOpen, Check } from "lucide-react";
import AppIcon from "./icons/AppIcon";
import { useI18n } from "../i18n/I18nContext";
import { cn } from "../lib/cn";
import { PRESET_DEFS, STARTER_PACK_ORDER } from "../data/presets";
import DysguCourseUnitPicker from "./filters/DysguCourseUnitPicker";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Badge, badgeVariants } from "./ui/badge";
import { Button } from "./ui/button";

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
  return `category${String(label || "").replace(/\s+/g, "")}`;
}

export default function FiltersPanel({
  className,
  activePresetId,
  onTogglePreset,
  onSetPreset,
  onPresetApplied,
  available = { families: [], categories: [], levels: [] },
  filters = { families: new Set(), categories: new Set(), levels: new Set() },
  onToggleFilter,
  onClearFilterType,
  openItems,
  onOpenItemsChange,
  accordionType = "single",
}) {
  const { t } = useI18n();

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

  const accordionProps =
    openItems !== undefined
      ? { value: openItems, onValueChange: onOpenItemsChange }
      : { defaultValue: "item-start" };

  const collapsibleProp = accordionType === "single" ? { collapsible: true } : {};

  return (
    <div className={cn("space-y-8 py-2 px-1", className)}>
      <Accordion
        className="w-full"
        type={accordionType}
        {...collapsibleProp}
        {...accordionProps}
      >
        <AccordionItem value="item-start">
          <AccordionTrigger>
            <div className={cn(headerBase, "text-sm text-[hsl(var(--cymru-green))]")}>
              <AppIcon
                icon={HelpCircle}
                className={cn(headerIcon, "text-[hsl(var(--cymru-green))]")}
                aria-hidden="true"
              />
              <span>{t("startHereTitle")}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-4 space-y-3">
              <p className="text-sm text-foreground font-semibold">
                {t("startHereSubtitle")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("startHereIntro")}
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
                <li>{t("startHereStepPick")}</li>
                <li>{t("startHereStepRefine")}</li>
                <li>{t("startHereStepPractice")}</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-courses">
          <AccordionTrigger>
            <div className={cn(headerBase, "text-sm text-[hsl(var(--cymru-green))]")}>
              <AppIcon
                icon={BookOpen}
                className={cn(headerIcon, "text-[hsl(var(--cymru-green))]")}
                aria-hidden="true"
              />
              <span>{t("coursesTitle") || "Dysgu Cymraeg Courses"}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mb-3 space-y-2">
              <Badge variant="cymru-dark-wash" className="rounded-full">
                {t("coursesLearnerBadge")}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {t("coursesSubtitle") || "Structured course-unit routes for Dysgu Cymraeg learners."}
              </p>
            </div>
            <DysguCourseUnitPicker
              activePresetId={activePresetId}
              onSetPreset={onSetPreset}
              onPresetApplied={onPresetApplied}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-quick">
          <AccordionTrigger>
            <div className={cn(headerBase, "text-sm text-[hsl(var(--cymru-green))]")}>
              <AppIcon
                icon={Zap}
                className={cn(headerIcon, "text-[hsl(var(--cymru-green))]")}
                aria-hidden="true"
              />
              <span>{t("starterPacksTitle")}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mb-3">
              <p className="text-xs text-muted-foreground">
                {t("starterPacksSubtitle")}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {t("starterPacksHint")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STARTER_PACK_ORDER.map((id) => {
                const def = PRESET_DEFS[id];
                const active = activePresetId === id;
                const label = def?.titleKey ? t(def.titleKey) : def?.title ?? id;
                const desc = def?.descriptionKey
                  ? t(def.descriptionKey)
                  : def?.desc ?? "Practice set";

                return (
                  <Button
                    key={id}
                    type="button"
                    variant="ghost"
                    onClick={() => onTogglePreset?.(active ? null : id)}
                    className={cn(
                      "group relative h-auto w-full items-start justify-start rounded-xl border p-4 text-left whitespace-normal break-words overflow-visible transition-all hover:shadow-md",
                      active
                        ? "border-2 border-[hsl(var(--cymru-green-light))] bg-primary/10"
                        : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <span className="flex min-w-0 flex-col items-start gap-1 pr-4">
                      <span className="w-full text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary whitespace-normal break-words">
                        {label}
                      </span>
                      <span className="w-full text-xs text-muted-foreground leading-snug whitespace-normal break-words">
                        {desc}
                      </span>
                    </span>
                    {active ? (
                      <span className="absolute -right-1.5 -top-1.5 sm:-right-2 sm:-top-2 inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border-2 border-card bg-[hsl(var(--cymru-green))] text-white shadow-sm">
                        <AppIcon icon={Check} className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </Button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-core">
          <AccordionTrigger>
            <div className={cn(headerBase, "text-sm text-[hsl(var(--cymru-green))]")}>
              <AppIcon
                icon={Filter}
                className={cn(headerIcon, "text-[hsl(var(--cymru-green))]")}
                aria-hidden="true"
              />
              <span>{t("advancedFiltersTitle")}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mb-3">
              <p className="text-xs text-muted-foreground">
                {t("advancedFiltersSubtitle")}
              </p>
            </div>

            <div className="mb-6">
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

            <div className="mb-6">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

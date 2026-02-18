import React, { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useI18n } from "../../i18n/I18nContext";
import { cn } from "../../lib/cn";
import { COURSES } from "../../data/courses";
import {
  findUnitByPresetId,
  getDialectsForCourse,
  getDysguCourses,
  getUnitsForCourseDialect,
} from "../../data/dysguPickerModel";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

function getLocalizedText(localizedValue, lang, fallback = "") {
  if (!localizedValue) return fallback;
  if (typeof localizedValue === "string") return localizedValue;
  return localizedValue[lang] || localizedValue.en || fallback;
}

function getCourseLabel(course, lang) {
  return getLocalizedText(course?.title, lang, course?.id || "");
}

function getUnitLabel(unit, lang) {
  return getLocalizedText(unit?.title, lang, unit?.id || "");
}

function getPreferredCourse(courses) {
  return (
    courses.find((course) =>
      (course.units || []).some((entry) => !entry.isPack && entry.status === "active")
    ) || courses[0] || null
  );
}

function getPreferredDialect(course, preferred) {
  const dialects = getDialectsForCourse(course);
  if (preferred && dialects.includes(preferred)) return preferred;

  const activeDialect = dialects.find((dialect) =>
    getUnitsForCourseDialect(course, dialect).some((unit) => unit.status === "active")
  );
  return activeDialect || dialects[0] || null;
}

function dialectLabelKey(dialect) {
  return dialect === "north" ? "dialectNorth" : "dialectSouth";
}

const ComboboxTrigger = React.forwardRef(
  (
    {
      label,
      value,
      placeholder,
      open,
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        type="button"
        variant="outline-secondary"
        role="combobox"
        aria-expanded={open}
        aria-label={label}
        disabled={disabled}
        className={cn(
          "h-11 w-full justify-between rounded-xl border-[hsl(var(--cymru-green-light)/0.35)]",
          "bg-background px-3 text-sm font-medium shadow-sm",
          "hover:bg-[hsl(var(--cymru-green-wash))] hover:text-[hsl(var(--cymru-green))]",
          "focus-visible:ring-[hsl(var(--cymru-green-light))]"
        )}
        {...props}
      >
        <span className={cn("truncate text-left", !value && "text-muted-foreground")}>
          {value || placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
      </Button>
    );
  }
);

ComboboxTrigger.displayName = "ComboboxTrigger";

export default function DysguCourseUnitPicker({
  activePresetId,
  onSetPreset,
  onPresetApplied,
  className,
}) {
  const { t, lang } = useI18n();
  const dysguCourses = useMemo(() => getDysguCourses(COURSES), []);

  const [courseOpen, setCourseOpen] = useState(false);
  const [dialectOpen, setDialectOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);
  const [courseQuery, setCourseQuery] = useState("");
  const [unitQuery, setUnitQuery] = useState("");

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedDialect, setSelectedDialect] = useState(null);

  const activeMatch = useMemo(
    () => findUnitByPresetId(dysguCourses, activePresetId),
    [dysguCourses, activePresetId]
  );

  const fallbackCourse = useMemo(
    () => getPreferredCourse(dysguCourses),
    [dysguCourses]
  );

  const selectedCourse = useMemo(() => {
    return (
      dysguCourses.find((course) => course.id === selectedCourseId) ||
      fallbackCourse ||
      null
    );
  }, [dysguCourses, fallbackCourse, selectedCourseId]);

  useEffect(() => {
    if (activeMatch) {
      setSelectedCourseId(activeMatch.course.id);
      setSelectedDialect(activeMatch.unit.criteria?.dialect || "south");
      return;
    }

    if (!selectedCourseId && fallbackCourse) {
      setSelectedCourseId(fallbackCourse.id);
    }
  }, [activeMatch, fallbackCourse, selectedCourseId]);

  useEffect(() => {
    if (!selectedCourse) return;

    const preferred = activeMatch?.course.id === selectedCourse.id
      ? activeMatch.unit.criteria?.dialect
      : selectedDialect;
    const nextDialect = getPreferredDialect(selectedCourse, preferred);

    if (nextDialect && selectedDialect !== nextDialect) {
      setSelectedDialect(nextDialect);
    }
  }, [selectedCourse, selectedDialect, activeMatch]);

  useEffect(() => {
    setUnitQuery("");
  }, [selectedCourseId, selectedDialect]);

  useEffect(() => {
    if (!courseOpen) setCourseQuery("");
  }, [courseOpen]);

  useEffect(() => {
    if (!unitOpen) setUnitQuery("");
  }, [unitOpen]);

  const dialects = useMemo(
    () => getDialectsForCourse(selectedCourse),
    [selectedCourse]
  );

  const units = useMemo(
    () => getUnitsForCourseDialect(selectedCourse, selectedDialect),
    [selectedCourse, selectedDialect]
  );
  const filteredCourses = dysguCourses.filter((course) => {
    const label = `${getCourseLabel(course, lang)} ${course.id}`.toLowerCase();
    return label.includes(courseQuery.trim().toLowerCase());
  });
  const filteredUnits = units.filter((unit) => {
    const label = `${getUnitLabel(unit, lang)} ${unit.id}`.toLowerCase();
    return label.includes(unitQuery.trim().toLowerCase());
  });

  const activeUnit = units.find((unit) => unit.id === activePresetId) || null;

  const handleUnitSelect = (unit) => {
    if (!unit || unit.status === "coming-soon") return;
    if (activePresetId === unit.id) {
      setUnitOpen(false);
      return;
    }

    onSetPreset?.(unit.id);
    onPresetApplied?.(unit.id);
    setUnitOpen(false);
  };

  const handleClear = () => {
    onSetPreset?.(null);
  };

  return (
    <Card
      className={cn(
        "rounded-2xl border border-[hsl(var(--cymru-green-light)/0.35)] p-4 shadow-sm",
        "bg-[linear-gradient(180deg,hsl(var(--cymru-green-wash)/0.55)_0%,hsl(var(--card))_56%)]",
        className
      )}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("coursesPickCourseLabel")}
          </label>
          <Popover
            open={courseOpen}
            onOpenChange={(open) => {
              setCourseOpen(open);
              if (open) {
                setDialectOpen(false);
                setUnitOpen(false);
              }
            }}
          >
            <PopoverTrigger asChild>
              <ComboboxTrigger
                label={t("coursesPickCourseLabel")}
                value={getCourseLabel(selectedCourse, lang)}
                placeholder={t("coursesPickCoursePlaceholder")}
                open={courseOpen}
                disabled={dysguCourses.length === 0}
              />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[var(--radix-popover-trigger-width)] border-[hsl(var(--cymru-green-light)/0.3)] p-0"
            >
              <Command>
                <CommandInput
                  aria-label={t("coursesPickCourseLabel")}
                  placeholder={t("coursesPickCoursePlaceholder")}
                  value={courseQuery}
                  onValueChange={setCourseQuery}
                />
                <CommandList>
                  {filteredCourses.length === 0 ? (
                    <CommandEmpty>{t("coursesNoUnitsMatch")}</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {filteredCourses.map((course) => {
                        const selected = selectedCourse?.id === course.id;
                        const label = getCourseLabel(course, lang);
                        return (
                          <CommandItem
                            key={course.id}
                            value={`${label} ${course.id}`}
                            onSelect={() => {
                              setSelectedCourseId(course.id);
                              setCourseQuery("");
                              setCourseOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selected ? "opacity-100" : "opacity-0"
                              )}
                              aria-hidden="true"
                            />
                            <span>{label}</span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("coursesPickDialectLabel")}
          </label>
          <Popover
            open={dialectOpen}
            onOpenChange={(open) => {
              setDialectOpen(open);
              if (open) {
                setCourseOpen(false);
                setUnitOpen(false);
              }
            }}
          >
            <PopoverTrigger asChild>
              <ComboboxTrigger
                label={t("coursesPickDialectLabel")}
                value={selectedDialect ? t(dialectLabelKey(selectedDialect)) : ""}
                placeholder={t("coursesPickDialectLabel")}
                open={dialectOpen}
                disabled={dialects.length === 0}
              />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[var(--radix-popover-trigger-width)] border-[hsl(var(--cymru-green-light)/0.3)] p-0"
            >
              <Command>
                <CommandList>
                  {dialects.length === 0 ? (
                    <CommandEmpty>{t("coursesNoUnitsMatch")}</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {dialects.map((dialect) => {
                        const selected = dialect === selectedDialect;
                        const label = t(dialectLabelKey(dialect));
                        const hasActiveUnits = getUnitsForCourseDialect(
                          selectedCourse,
                          dialect
                        ).some((unit) => unit.status === "active");

                        return (
                          <CommandItem
                            key={dialect}
                            value={label}
                            onSelect={() => {
                              setSelectedDialect(dialect);
                              setDialectOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selected ? "opacity-100" : "opacity-0"
                              )}
                              aria-hidden="true"
                            />
                            <span>{label}</span>
                            {!hasActiveUnits && (
                              <Badge variant="outline" className="ml-auto rounded-full text-[10px]">
                                {t("dialectComingSoon")}
                              </Badge>
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("coursesPickUnitLabel")}
          </label>
          <Popover
            open={unitOpen}
            onOpenChange={(open) => {
              setUnitOpen(open);
              if (open) {
                setCourseOpen(false);
                setDialectOpen(false);
              }
            }}
          >
            <PopoverTrigger asChild>
              <ComboboxTrigger
                label={t("coursesPickUnitLabel")}
                value={activeUnit ? getUnitLabel(activeUnit, lang) : ""}
                placeholder={t("coursesPickUnitPlaceholder")}
                open={unitOpen}
                disabled={units.length === 0}
              />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[var(--radix-popover-trigger-width)] border-[hsl(var(--cymru-green-light)/0.3)] p-0"
            >
              <Command>
                <CommandInput
                  aria-label={t("coursesPickUnitLabel")}
                  placeholder={t("coursesSearchUnitsPlaceholder")}
                  value={unitQuery}
                  onValueChange={setUnitQuery}
                />
                <CommandList>
                  {filteredUnits.length === 0 ? (
                    <CommandEmpty>{t("coursesNoUnitsMatch")}</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {filteredUnits.map((unit) => {
                        const isComingSoon = unit.status === "coming-soon";
                        const selected = unit.id === activePresetId;
                        const unitLabel = getUnitLabel(unit, lang);
                        return (
                          <CommandItem
                            key={unit.id}
                            value={`${unitLabel} ${unit.id}`}
                            disabled={isComingSoon}
                            onSelect={() => handleUnitSelect(unit)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selected ? "opacity-100" : "opacity-0"
                              )}
                              aria-hidden="true"
                            />
                            <span>{unitLabel}</span>
                            {isComingSoon && (
                              <Badge variant="outline" className="ml-auto rounded-full text-[10px]">
                                {t("dialectComingSoon")}
                              </Badge>
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <Separator className="bg-[hsl(var(--cymru-green-light)/0.25)]" />

        <div className="rounded-xl border border-[hsl(var(--cymru-green-light)/0.35)] bg-background/80 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={activeUnit ? "cymru-dark" : "cymru-light-wash"}
              className="rounded-full"
            >
              {activeUnit ? t("deck") : t("practice")}
            </Badge>
            <p className="min-w-0 flex-1 truncate text-sm text-foreground">
              {activeUnit
                ? `${getCourseLabel(selectedCourse, lang)} - ${t(
                    dialectLabelKey(selectedDialect)
                  )} - ${getUnitLabel(activeUnit, lang)}`
                : t("coursesPickUnitPlaceholder")}
            </p>
          </div>

          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline-destructive"
              onClick={handleClear}
              disabled={!activePresetId}
              className="rounded-full"
            >
              {t("coursesClearSelection")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

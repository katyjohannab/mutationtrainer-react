import React, { useMemo, useState } from "react";
import { useI18n } from "../../i18n/I18nContext";
import { cn } from "../../lib/cn";
import { PRESET_DEFS, DYSGU_PACKS_BY_LEVEL } from "../../data/presets";
import { COURSE_ORDER } from "../../data/dysguUnitRegistry";
import LevelPillTabs from "../ui/level-pill-tabs";
import PackCard from "./PackCard";

/**
 * Get localized text from a { en, cy } object or string.
 */
function getLocalizedText(value, lang, fallback = "") {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value[lang] || value.en || fallback;
}

/**
 * DysguLevelPacks — Level-organized pack picker for Dysgu Cymraeg content.
 * Replaces the complex 3-dropdown DysguCourseUnitPicker.
 * 
 * @param {Object} props
 * @param {string} props.activePresetId - Currently selected preset
 * @param {(id: string | null) => void} props.onTogglePreset - Toggle preset selection
 * @param {string} [props.className]
 */
export default function DysguLevelPacks({
  activePresetId,
  onTogglePreset,
  className,
}) {
  const { t, lang } = useI18n();

  // Build level options from COURSE_ORDER
  const levelOptions = useMemo(() => {
    return COURSE_ORDER.map((levelId) => {
      const packs = DYSGU_PACKS_BY_LEVEL[levelId] || [];
      const hasContent = packs.length > 0;
      
      // Get localized level label
      const labelKey = `course${levelId.charAt(0).toUpperCase() + levelId.slice(1)}`;
      const label = t(labelKey) || levelId.charAt(0).toUpperCase() + levelId.slice(1);

      return {
        id: levelId,
        label,
        disabled: !hasContent,
      };
    });
  }, [t]);

  // Find first level with content for default
  const defaultLevel = useMemo(() => {
    return levelOptions.find((opt) => !opt.disabled)?.id || "mynediad";
  }, [levelOptions]);

  const [selectedLevel, setSelectedLevel] = useState(defaultLevel);

  // Get packs for selected level
  const packsForLevel = useMemo(() => {
    const packIds = DYSGU_PACKS_BY_LEVEL[selectedLevel] || [];
    return packIds
      .map((id) => PRESET_DEFS[id])
      .filter(Boolean);
  }, [selectedLevel]);

  // Check if any level has content
  const hasAnyContent = levelOptions.some((opt) => !opt.disabled);

  if (!hasAnyContent) {
    return (
      <div className={cn("text-center py-6", className)}>
        <p className="text-sm text-muted-foreground">
          {t("dysguPacksComingSoon") || "Course-aligned packs coming soon."}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Level pill selector */}
      <LevelPillTabs
        options={levelOptions}
        value={selectedLevel}
        onValueChange={setSelectedLevel}
        className="w-full justify-start"
      />

      {/* Pack cards grid */}
      {packsForLevel.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {packsForLevel.map((pack) => {
            const isActive = activePresetId === pack.id;
            const title = pack.titleKey
              ? t(pack.titleKey)
              : getLocalizedText(pack.title, lang, pack.id);
            const description = pack.descriptionKey
              ? t(pack.descriptionKey)
              : getLocalizedText(pack.description, lang);

            return (
              <PackCard
                key={pack.id}
                active={isActive}
                title={title}
                description={description}
                onClick={() => onTogglePreset(isActive ? null : pack.id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t("levelComingSoon") || "Content for this level coming soon."}
          </p>
        </div>
      )}
    </div>
  );
}

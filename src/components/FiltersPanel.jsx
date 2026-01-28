import { PRESET_DEFS, PRESET_ORDER } from "../data/presets";
import { useI18n } from "../i18n/I18nContext";
import { cn } from "../lib/cn";
import { Button } from "./ui/button";

export default function FiltersPanel({
  className,
  activePresetId,
  onTogglePreset,
}) {
  const { t } = useI18n();

  return (
    <section
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-4 shadow-sm",
        className
      )}
    >
      <h2 className="text-base font-semibold text-gray-900">
        {t("presetPacks")}
      </h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {PRESET_ORDER.map((id) => {
          const isOn = id === activePresetId;
          const def = PRESET_DEFS[id];
          const label = def?.titleKey ? t(def.titleKey) : def?.title ?? id;

          return (
            <Button
              key={id}
              type="button"
              variant="pill"
              active={isOn}
              onClick={() => onTogglePreset(id)}
              title={label}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </section>
  );
}

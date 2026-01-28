import PracticeCard from "./PracticeCard";
import { useI18n } from "../i18n/I18nContext";
import { cn } from "../lib/cn";
import { Button } from "./ui/button";

export default function FlashcardArea({
  className,
  mode,
  onModeChange,
  rowsCount,
  filteredCount,
  currentRow,
  onResult,
}) {
  const { t } = useI18n();

  return (
    <section className={cn("flex-1", className)}>
      {/* Mode + counts */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">
            {t("mode")}:
          </span>

          <Button
            type="button"
            variant="pill"
            active={mode === "random"}
            onClick={() => onModeChange("random")}
          >
            {t("random")}
          </Button>

          <Button
            type="button"
            variant="pill"
            active={mode === "smart"}
            onClick={() => onModeChange("smart")}
          >
            {t("smart")}
          </Button>

          <span className="ml-2 text-sm text-gray-600">
            {t("loaded")}:{" "}
            <span className="font-semibold text-gray-900">{rowsCount}</span>
            <span className="mx-2 text-gray-300">|</span>
            {t("deck")}:{" "}
            <span className="font-semibold text-gray-900">{filteredCount}</span>
          </span>
        </div>
      </div>

      {/* Practice */}
      <div className="mt-6">
        <h2 className="text-base font-semibold text-gray-900">
          {t("practice")}
        </h2>

        {!currentRow ? (
          <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm">
            {t("noCards")}
          </div>
        ) : (
          <div className="mt-3">
            <PracticeCard row={currentRow} onResult={onResult} />
          </div>
        )}
      </div>
    </section>
  );
}

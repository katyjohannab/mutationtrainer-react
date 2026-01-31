import PracticeCard from "./PracticeCard";
import { useI18n } from "../i18n/I18nContext";
import { cn } from "../lib/cn";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export default function FlashcardArea({
  className,
  mode,
  onModeChange,
  rowsCount,
  filteredCount,
  currentRow,
  onResult,
  answerMode,
  deckRows,
  onAnswerModeChange,
}) {
  const { t } = useI18n();

  return (
    <section className={cn("flex-1", className)}>
      {/* Mode + Answer type + counts */}
      <div className="flex flex-col gap-4 sm:gap-3">
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Mode selector: shadcn ToggleGroup */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t("mode")}
            </span>
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(value) => {
                if (value) onModeChange(value);
              }}
            >
              <ToggleGroupItem
                value="random"
                className="rounded-md border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/80 shadow-sm transition data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                aria-label={t("random")}
              >
                {t("random")}
              </ToggleGroupItem>
              <ToggleGroupItem
                value="smart"
                className="rounded-md border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/80 shadow-sm transition data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                aria-label={t("smart")}
              >
                {t("smart")}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Answer method selector: shadcn ToggleGroup */}
          {onAnswerModeChange && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t("ateb") || "Answer"}
              </span>
              <ToggleGroup
                type="single"
                value={answerMode}
                onValueChange={(value) => {
                  if (value) onAnswerModeChange(value);
                }}
              >
                <ToggleGroupItem
                  value="type"
                  className="rounded-md border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/80 shadow-sm transition data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  aria-label={t("typeMode") || "Type"}
                >
                  {t("typeMode") || "Type"}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="tap"
                  className="rounded-md border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/80 shadow-sm transition data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                  aria-label={t("tapMode") || "Tap"}
                >
                  {t("tapMode") || "Tap"}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          {/* Stats row */}
          <div className="ml-auto text-xs text-muted-foreground">
            <span className="font-medium">{rowsCount}</span>
            <span className="mx-1">/</span>
            <span className="font-medium">{filteredCount}</span>
          </div>
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
            <PracticeCard
              row={currentRow}
              onResult={onResult}
              answerMode={answerMode}
              deckRows={deckRows}
            />
          </div>
        )}
      </div>
    </section>
  );
}

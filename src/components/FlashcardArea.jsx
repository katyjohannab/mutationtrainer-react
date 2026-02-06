import PracticeCard from "./PracticeCard";
import { useI18n } from "../i18n/I18nContext";
import { cn } from "../lib/cn";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Separator } from "./ui/separator";

export default function FlashcardArea({
  className,
  mode,
  onModeChange,
  progressText,
  deckLabel,
  currentRow,
  onResult,
  answerMode,
  deckRows,
  onAnswerModeChange,
}) {
  const { t } = useI18n();

  return (
    <section className={cn("flex-1", className)}>
      <div className="space-y-4 rounded-[var(--radius)] border border-border bg-[hsl(var(--panel))] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="mt-subtitle">{progressText}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="mt-subtitle">{t("mode")}</span>
              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={(value) => value && onModeChange(value)}
                size="sm"
                className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 sm:flex-nowrap"
              >
                <ToggleGroupItem
                  value="random"
                  className="rounded-md font-semibold text-foreground transition-colors border border-transparent hover:bg-muted/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary/60"
                >
                  {t("random")}
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="smart"
                  className="rounded-md font-semibold text-foreground transition-colors border border-transparent hover:bg-muted/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary/60"
                >
                  {t("smart")}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {onAnswerModeChange && (
              <div className="flex items-center gap-2">
                <span className="mt-subtitle">{t("ateb") || "Answer"}</span>
                <ToggleGroup
                  type="single"
                  value={answerMode}
                  onValueChange={(value) => value && onAnswerModeChange(value)}
                  size="sm"
                  className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 sm:flex-nowrap"
                >
                  <ToggleGroupItem
                    value="type"
                    className="rounded-md font-semibold text-foreground transition-colors border border-transparent hover:bg-muted/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary/60"
                  >
                    {t("typeMode") || "Type"}
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="tap"
                    className="rounded-md font-semibold text-foreground transition-colors border border-transparent hover:bg-muted/50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary/60"
                  >
                    {t("tapMode") || "Tap"}
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {!currentRow ? (
          <div className="surface-card p-6 text-sm text-muted-foreground text-center">
            {t("noCards")}
          </div>
        ) : (
          <PracticeCard
            row={currentRow}
            onResult={onResult}
            answerMode={answerMode}
            deckRows={deckRows}
            mode={mode}
            onModeChange={onModeChange}
            onAnswerModeChange={onAnswerModeChange}
            progressText={progressText}
            deckLabel={deckLabel}
          />
        )}
      </div>
    </section>
  );
}

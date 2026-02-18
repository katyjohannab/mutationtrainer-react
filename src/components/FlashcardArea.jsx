import PracticeCard from "./PracticeCard";
import SessionStatsInline from "./SessionStatsInline";
import ReportMistake from "./ReportMistake";
import { useI18n } from "../i18n/I18nContext";
import { cn } from "../lib/cn";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Separator } from "./ui/separator";

const toggleItemClass = cn(
  "h-8 min-w-[2.75rem] px-2.5 sm:px-3 py-0 rounded-md text-xs font-semibold leading-none",
  "border border-transparent transition-colors",
  "hover:bg-muted/50",
  "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary/60"
);

const toggleGroupClass = "flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5";

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
  onShuffle,
  showDysguBadges = false,
  sessionStats,
}) {
  const { t } = useI18n();
  const cardId = currentRow?.cardId ?? currentRow?.CardId ?? "";

  return (
    <section className={cn("flex-1", className)}>
      <div className="space-y-4 rounded-[var(--radius)] border border-border bg-[hsl(var(--panel))] p-4 sm:p-5 lg:p-6">
        {/* Header row - unified control bar */}
        <div className="flex flex-wrap items-start gap-2 sm:gap-3 text-sm">
          {/* Progress + Card ID + Mobile Stats */}
          <div className="flex flex-col-reverse items-start gap-1 min-w-0 shrink-0">
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-xs font-medium text-muted-foreground truncate">
                {progressText}
              </span>
              {cardId && (
                <span className="text-xs font-medium text-muted-foreground/60 truncate">
                  {t("reportCardId") || "Card ID"}: {cardId.toUpperCase()}
                </span>
              )}
            </div>
            {sessionStats && (
              <SessionStatsInline stats={sessionStats} className="md:hidden" />
            )}
          </div>

          {/* Controls - pushed right, wrap-safe */}
          <div className="flex flex-wrap items-start gap-2 ml-auto">
            {/* Mode toggle */}
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(value) => value && onModeChange(value)}
              size="sm"
              className={toggleGroupClass}
            >
              <ToggleGroupItem value="random" className={toggleItemClass}>
                {t("random")}
              </ToggleGroupItem>
              <ToggleGroupItem value="smart" className={toggleItemClass}>
                {t("smart")}
              </ToggleGroupItem>
            </ToggleGroup>

            {/* Answer mode toggle */}
            {onAnswerModeChange && (
              <ToggleGroup
                type="single"
                value={answerMode}
                onValueChange={(value) => value && onAnswerModeChange(value)}
                size="sm"
                className={toggleGroupClass}
              >
                <ToggleGroupItem value="type" className={toggleItemClass}>
                  {t("typeMode") || "Type"}
                </ToggleGroupItem>
                <ToggleGroupItem value="tap" className={toggleItemClass}>
                  {t("tapMode") || "Tap"}
                </ToggleGroupItem>
              </ToggleGroup>
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
            onShuffle={onShuffle}
            showDysguBadges={showDysguBadges}
          />
        )}

        {/* Card footer — report button aligned right */}
        {currentRow && (
          <div className="flex items-center justify-end pt-3">
            <ReportMistake cardId={cardId} />
          </div>
        )}
      </div>
    </section>
  );
}

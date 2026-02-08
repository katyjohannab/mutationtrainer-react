import PracticeCard from "./PracticeCard";
import SessionStatsInline from "./SessionStatsInline";
import { useI18n } from "../i18n/I18nContext";
import { cn } from "../lib/cn";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Shuffle } from "lucide-react";
import AppIcon from "./icons/AppIcon";

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
  sessionStats,
}) {
  const { t } = useI18n();
  const shuffleLabel = t("shuffle") || "Shuffle";
  const showShuffle = mode === "random";

  return (
    <section className={cn("flex-1", className)}>
      <div className="space-y-4 rounded-[var(--radius)] border border-border bg-[hsl(var(--panel))] p-4 sm:p-5 lg:p-6">
        {/* Header row - unified control bar */}
        <TooltipProvider>
          <div className="flex flex-wrap items-start gap-2 sm:gap-3 text-sm">
            {/* Progress + Mobile Stats */}
            <div className="flex flex-col-reverse items-center gap-1 min-w-0 shrink-0">
              <span className="text-xs font-medium text-muted-foreground truncate text-center">
                {progressText}
              </span>
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

              {/* Shuffle button - matches toggle height */}
              {showShuffle && (
                <div className={toggleGroupClass}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onShuffle}
                        className={toggleItemClass}
                        aria-label={shuffleLabel}
                      >
                        <AppIcon icon={Shuffle} className="h-3.5 w-3.5" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      {shuffleLabel}
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </TooltipProvider>

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

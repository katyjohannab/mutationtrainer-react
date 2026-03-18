import PracticeCard from "./PracticeCard";
import ReportMistake from "./ReportMistake";
import AdminCardControls from "./AdminCardControls";
import { useI18n } from "../i18n/I18nContext";
import { cn } from "../lib/cn";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Separator } from "./ui/separator";

const toggleItemClass = cn(
  "h-9 min-w-[3.125rem] rounded-lg px-3 text-[13px] font-semibold leading-none sm:h-10 sm:min-w-[3.5rem] sm:px-3.5 sm:text-sm",
  "border border-transparent transition-colors",
  "hover:bg-muted/50",
  "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary/60"
);

const toggleGroupClass =
  "flex max-w-full items-center gap-1 rounded-xl border border-border bg-card p-1";

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
  adminState,
  onAdminLogin,
  onAdminLogout,
  onAdminSave,
}) {
  const { t } = useI18n();
  const cardId = currentRow?.cardId ?? currentRow?.CardId ?? "";

  return (
    <section className={cn("flex-1", className)}>
      {/* Mobile: no border/bg box. sm+: styled panel */}
      <div className="space-y-5 sm:space-y-6 sm:rounded-[var(--radius)] sm:border sm:border-border sm:bg-[hsl(var(--panel))] sm:p-5 xl:p-6 [@media(max-height:700px)]:space-y-4">
        {/* Header row - unified control bar */}
        <div className="text-sm">
          {/* Mobile / tablet / laptop (< xl) */}
          <div className="flex flex-col gap-2 xl:hidden [@media(max-height:700px)]:gap-1.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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

              <div className="flex min-w-0 flex-col items-start gap-0.5 sm:items-end sm:text-right">
                <span className="text-[11px] sm:text-xs font-medium text-muted-foreground/70">
                  {progressText}
                </span>
                {cardId && (
                  <span className="text-[11px] sm:text-xs font-medium text-muted-foreground/55">
                    {t("reportCardId") || "Card ID"}: {cardId.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="hidden xl:flex xl:flex-wrap xl:items-center xl:gap-3">
            <div className="flex min-w-0 shrink-0 flex-col items-start gap-1">
              <span className="truncate text-xs font-medium text-muted-foreground">
                {progressText}
              </span>
              {cardId && (
                <span className="truncate text-xs font-medium text-muted-foreground/60">
                  {t("reportCardId") || "Card ID"}: {cardId.toUpperCase()}
                </span>
              )}
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
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
        </div>

        <Separator className="hidden opacity-60 sm:block" />

        <div>
          {!currentRow ? (
            <div className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t("noCards")}
              </p>
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
              sessionStats={sessionStats}
            />
          )}
        </div>

        {currentRow && (
          <div className="mx-auto flex w-full items-center justify-center gap-2 pt-2 sm:justify-end sm:pt-3 lg:max-w-3xl xl:max-w-none">
            {!adminState?.authenticated ? <ReportMistake cardId={cardId} /> : null}
            <div className="hidden sm:block">
              <AdminCardControls
                row={currentRow}
                isAuthenticated={Boolean(adminState?.authenticated)}
                authConfigured={adminState?.configured !== false}
                authError={adminState?.error || ""}
                onLogin={onAdminLogin}
                onLogout={onAdminLogout}
                onSave={onAdminSave}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

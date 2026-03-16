import PracticeCard from "./PracticeCard";
import ReportMistake from "./ReportMistake";
import AdminCardControls from "./AdminCardControls";
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
      <div className="space-y-7 sm:space-y-6 sm:rounded-[var(--radius)] sm:border sm:border-border sm:bg-[hsl(var(--panel))] sm:p-5 lg:p-6">
        {/* Header row - unified control bar */}
        <div className="text-sm">
          {/* ── Mobile / tablet (< lg) ── Single compact row */}
          <div className="flex items-center justify-between gap-2 lg:hidden">
            {/* Left: toggles */}
            <div className="flex items-center gap-1.5">
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

            {/* Right: progress only (no card ID on mobile) */}
            <span className="text-[11px] font-medium text-muted-foreground/70 shrink-0">
              {progressText}
            </span>
          </div>

          <div className="hidden lg:flex lg:flex-wrap lg:items-start lg:gap-3">
            <div className="flex flex-col items-start gap-0.5 min-w-0 shrink-0">
              <span className="text-xs font-medium text-muted-foreground truncate">
                {progressText}
              </span>
              {cardId && (
                <span className="text-xs font-medium text-muted-foreground/60 truncate">
                  {t("reportCardId") || "Card ID"}: {cardId.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-start gap-2 ml-auto">
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

        <Separator className="opacity-60 hidden sm:block" />

        <div>
        {!currentRow ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
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
          <div className="flex items-center justify-center sm:justify-end gap-2 pt-2 sm:pt-3">
            {!adminState?.authenticated ? <ReportMistake cardId={cardId} /> : null}
            {/* Admin controls hidden on mobile */}
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

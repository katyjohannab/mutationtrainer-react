import { useEffect, useMemo } from "react";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { cn } from "../lib/cn";
import HeroPill from "./HeroPill";
import { deriveDysguBadges } from "../utils/dysguBadges";
import CardTranslationPopover from "./card/CardTranslationPopover";
import CardUtilityCluster from "./card/CardUtilityCluster";
import SessionStatsInline from "./SessionStatsInline";

function normalizeChoice(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export default function PracticeCardChoices({
  sent,
  answer,
  cardState,
  choices,
  disabled,
  hintText,
  showHint,
  onToggleHint,
  onPick,
  onCheck,
  onReveal,
  onSkip,
  onShuffle,
  t,
  mode,
  guess,
  translationWord,
  translationCategory,
  unit,
  course,
  level,
  sourceFile,
  showDysguBadges = false,
  sessionStats,
}) {
  const isFeedback = cardState === "feedback";
  const baseword = sent?.base || "_____";
  const dysguBadges = useMemo(
    () =>
      showDysguBadges
        ? deriveDysguBadges({ course, level, unit, sourceFile, t })
        : null,
    [course, level, unit, sourceFile, t, showDysguBadges]
  );

  useEffect(() => {
    const handler = (event) => {
      if (disabled) return;
      if (event.key === "1" && choices[0]) {
        event.preventDefault();
        onPick?.(choices[0]);
      }
      if (event.key === "2" && choices[1]) {
        event.preventDefault();
        onPick?.(choices[1]);
      }
      if (event.key === "3" && choices[2]) {
        event.preventDefault();
        onPick?.(choices[2]);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [choices, disabled, onPick]);

  const normalizedAnswer = normalizeChoice(answer);
  const normalizedGuess = normalizeChoice(guess);

  return (
      <div className="space-y-8 sm:space-y-9 lg:space-y-12">
      {sessionStats && (
        <div className="flex justify-center lg:hidden">
          <SessionStatsInline stats={sessionStats} />
        </div>
      )}

      {dysguBadges && (
        <div className="hidden sm:flex w-full justify-start gap-2 px-2">
          {dysguBadges.courseLabel && (
            <Badge
              variant="cymru-dark"
              className="rounded-full px-3 py-1 text-xs font-semibold pointer-events-none"
            >
              {dysguBadges.courseLabel}
            </Badge>
          )}
          {dysguBadges.unitLabel && (
            <Badge
              variant="cymru-light"
              className="rounded-full px-3 py-1 text-xs font-semibold pointer-events-none"
            >
              {dysguBadges.unitLabel}
            </Badge>
          )}
        </div>
      )}

      <div className="flex flex-col items-center gap-2 w-full">
        <HeroPill
          text={baseword}
          showPin={false}
          cornerAction={
            <CardTranslationPopover
              word={translationWord}
              category={translationCategory}
              t={t}
            />
          }
        />
      </div>

      <p className="text-base sm:text-[clamp(1.05rem,0.6vw+0.95rem,1.45rem)] leading-relaxed text-foreground text-center px-1">
        <span className="whitespace-pre-wrap break-words">{sent?.before}</span>
        {" "}
        <span
          aria-hidden="true"
          className="mx-1.5 sm:mx-1 inline-block h-[1.4em] min-w-[6ch] w-[8ch] sm:w-[11.5ch] lg:w-[12.5ch] max-w-full rounded-lg bg-[hsl(var(--cymru-gold)/0.08)] align-middle"
        />
        {" "}
        <span className="whitespace-pre-wrap break-words">{sent?.after}</span>
      </p>

      <Separator className="hidden sm:block" />

      {/* Choice buttons — generous tap targets */}
      <div className="grid gap-2.5 sm:gap-3">
        {choices.map((choice, idx) => {
          const normalizedChoice = normalizeChoice(choice);
          const isCorrectChoice = isFeedback && normalizedChoice === normalizedAnswer;
          const isWrongChoice =
            isFeedback &&
            normalizedChoice === normalizedGuess &&
            normalizedChoice !== normalizedAnswer;
          const isSelected =
            !isFeedback && normalizedGuess && normalizedChoice === normalizedGuess;

          return (
            <button
              key={`${choice}-${idx}`}
              type="button"
              disabled={disabled}
              onClick={() => onPick?.(choice)}
              className={cn(
                "w-full min-h-[44px] rounded-xl border bg-card px-4 py-3 text-left text-[15px] sm:text-base font-medium shadow-sm transition-all",
                "hover:bg-muted/60 hover:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                "active:scale-[0.98]",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                !isSelected && !isCorrectChoice && !isWrongChoice && "border-border",
                isSelected && "border-primary ring-2 ring-primary/15",
                isCorrectChoice && "border-[hsl(var(--cymru-green-light)/0.5)] bg-[hsl(var(--cymru-green-wash)/0.6)]",
                isWrongChoice && "border-destructive/40 bg-destructive/10"
              )}
            >
              <span className="text-muted-foreground/60 mr-2 font-semibold">{idx + 1}.</span>
              {choice}
            </button>
          );
        })}
      </div>

      <CardUtilityCluster
        t={t}
        isFeedback={isFeedback}
        mode={mode}
        onToggleHint={onToggleHint}
        onReveal={onReveal}
        onSkip={onSkip}
        onShuffle={onShuffle}
        onCheck={onCheck}
      />

      {showHint && hintText ? (
        <div className="rounded-xl border border-[hsl(var(--cymru-green-light)/0.3)] bg-[hsl(var(--cymru-green-wash)/0.5)] px-4 py-3 text-sm font-medium text-foreground">
          {hintText}
        </div>
      ) : null}
    </div>
  );
}

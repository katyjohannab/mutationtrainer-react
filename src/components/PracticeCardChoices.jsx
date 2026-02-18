import { useEffect, useMemo } from "react";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { cn } from "../lib/cn";
import HeroPill from "./HeroPill";
import { deriveDysguBadges } from "../utils/dysguBadges";
import CardTranslationPopover from "./card/CardTranslationPopover";
import CardUtilityCluster from "./card/CardUtilityCluster";

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

  const blankSlot = "_____";

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
    <div className="space-y-6">
      {dysguBadges && (
        <div className="flex w-full justify-start gap-2 px-2">
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

      <div className="flex flex-col items-center gap-2 w-full px-2">
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

      <div className="min-w-0 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-lg sm:text-xl leading-relaxed text-foreground/80">
        <span className="whitespace-pre-wrap break-words">{sent?.before}</span>
        <Badge
          variant="secondary"
          className="rounded-full border border-border bg-muted text-base font-semibold text-foreground"
        >
          {blankSlot}
        </Badge>
        <span className="whitespace-pre-wrap break-words">{sent?.after}</span>
      </div>

      <Separator />

      <div className="mt-4 grid gap-2 sm:gap-3">
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
                "w-full rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm sm:text-base shadow-sm transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                isSelected && "border-primary ring-2 ring-primary/15",
                isCorrectChoice && "border-primary/40 bg-primary/10",
                isWrongChoice && "border-destructive/40 bg-destructive/10"
              )}
            >
              {idx + 1}. {choice}
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
        <div className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground">
          {hintText}
        </div>
      ) : null}
    </div>
  );
}

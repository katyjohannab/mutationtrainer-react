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
  const trimmedBaseword = String(baseword).trim();
  const isHeroStressed =
    trimmedBaseword.length >= 12 || /\s/.test(trimmedBaseword);
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
    <div
      className={cn(
        "space-y-6 sm:space-y-8 lg:space-y-9 xl:space-y-12 [@media(max-height:700px)]:space-y-5",
        isHeroStressed && "sm:space-y-7 lg:space-y-8 xl:space-y-11"
      )}
    >
      {dysguBadges && (
        <div className="hidden w-full justify-start gap-2 px-2 sm:flex">
          {dysguBadges.courseLabel && (
            <Badge
              variant="cymru-dark"
              className="pointer-events-none rounded-full px-3 py-1 text-xs font-semibold"
            >
              {dysguBadges.courseLabel}
            </Badge>
          )}
          {dysguBadges.unitLabel && (
            <Badge
              variant="cymru-light"
              className="pointer-events-none rounded-full px-3 py-1 text-xs font-semibold"
            >
              {dysguBadges.unitLabel}
            </Badge>
          )}
        </div>
      )}

      <div className="flex w-full flex-col items-center gap-1.5">
        <HeroPill
          text={baseword}
          compositionMode="contained"
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

      <div
        className={cn(
          "space-y-5 sm:space-y-6 lg:space-y-6 xl:space-y-8",
          isHeroStressed && "sm:space-y-5 lg:space-y-5 xl:space-y-7"
        )}
      >
        <div
          className={cn(
            "space-y-4 sm:space-y-5 lg:space-y-5 xl:space-y-6",
            isHeroStressed && "sm:space-y-4 lg:space-y-4 xl:space-y-5"
          )}
        >
          <p className="mx-auto max-w-[38rem] px-1 text-center text-[1.06rem] leading-[1.72] text-foreground sm:px-2 sm:text-[1.18rem] sm:leading-[1.66] lg:text-[1.28rem] xl:text-[clamp(1.08rem,0.62vw+0.98rem,1.45rem)] xl:leading-relaxed">
            <span className="whitespace-pre-wrap break-words">{sent?.before}</span>
            {" "}
            <span
              aria-hidden="true"
              className="mx-1.5 inline-flex h-[1.45em] min-w-[6ch] w-[7.8ch] items-center justify-center rounded-full border border-[hsl(var(--cymru-gold)/0.28)] bg-[hsl(var(--cymru-gold)/0.1)] align-middle shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] sm:w-[9.8ch] lg:w-[10.8ch] xl:w-[12.5ch]"
            />
            {" "}
            <span className="whitespace-pre-wrap break-words">{sent?.after}</span>
          </p>

          <div className="grid gap-2.5 sm:gap-3 lg:gap-3 xl:gap-3.5">
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
                    "w-full min-h-[44px] rounded-xl border bg-card px-4 py-3 text-left text-[15px] font-medium shadow-sm transition-all sm:text-base",
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
                  <span className="mr-2 font-semibold text-muted-foreground/60">{idx + 1}.</span>
                  {choice}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5 lg:space-y-5 xl:space-y-6">
          <Separator className="hidden sm:block" />

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
        </div>
      </div>

      {showHint && hintText ? (
        <div className="rounded-xl border border-[hsl(var(--cymru-green-light)/0.3)] bg-[hsl(var(--cymru-green-wash)/0.5)] px-4 py-3 text-sm font-medium text-foreground">
          {hintText}
        </div>
      ) : null}

      {sessionStats && (
        <div className="flex justify-center xl:hidden">
          <SessionStatsInline stats={sessionStats} />
        </div>
      )}
    </div>
  );
}

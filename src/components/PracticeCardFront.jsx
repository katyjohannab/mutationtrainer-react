import { useEffect, useMemo, useRef, useCallback } from "react";
import { Badge } from "./ui/badge";
import HeroPill from "./HeroPill";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { deriveDysguBadges } from "../utils/dysguBadges";
import CardTranslationPopover from "./card/CardTranslationPopover";
import CardUtilityCluster from "./card/CardUtilityCluster";
import SessionStatsInline from "./SessionStatsInline";

export default function PracticeCardFront({
  sent,
  cardState,
  cardId,
  guess,
  setGuess,
  disabledInput,
  placeholder,
  hintText,
  showHint,
  onToggleHint,
  onCheck,
  onReveal,
  onSkip,
  onShuffle,
  t,
  mode,
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

  const mobileInputRef = useRef(null);
  const desktopInputRef = useRef(null);

  // Focus the correct input based on what's actually visible
  const focusVisibleInput = useCallback(() => {
    // sm breakpoint = 640px
    const isDesktop = window.matchMedia("(min-width: 640px)").matches;
    const target = isDesktop ? desktopInputRef.current : mobileInputRef.current;
    target?.focus();
  }, []);

  useEffect(() => {
    if (isFeedback) return;
    focusVisibleInput();
  }, [cardId, isFeedback, focusVisibleInput]);

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

      {/* Sentence prompt + input: stacked on mobile, inline on desktop */}
      <div className="flex flex-col items-center gap-5 sm:gap-6 lg:gap-7 w-full">
        <p className="text-base sm:text-[clamp(1.05rem,0.6vw+0.95rem,1.45rem)] leading-relaxed text-foreground text-center">
          <span className="whitespace-pre-wrap break-words">{sent?.before}</span>
          <span className="hidden sm:inline">{" "}</span>
          <span className="inline sm:hidden text-muted-foreground/50">{' '}<span className="tracking-widest">______</span>{' '}</span>
          <span className="hidden sm:inline">
            <Input
              ref={desktopInputRef}
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              disabled={disabledInput}
              placeholder={placeholder}
              className="mx-1 inline-flex h-11 min-w-[10ch] w-[15ch] lg:w-[16ch] max-w-full align-baseline rounded-lg border-0 bg-[hsl(var(--cymru-gold)/0.08)] px-3 text-[clamp(1.05rem,0.6vw+0.95rem,1.45rem)] text-foreground shadow-sm placeholder:text-sm placeholder:font-medium placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/50"
              onKeyDown={(e) => {
                if (e.key === "Enter") onCheck();
              }}
            />
          </span>
          <span className="whitespace-pre-wrap break-words">{sent?.after}</span>
        </p>

        {/* Full-width input on mobile — prominent and central */}
        <div className="w-full sm:hidden">
          <Input
            ref={mobileInputRef}
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={disabledInput}
            placeholder={placeholder}
            className="h-12 w-full rounded-xl border-2 border-[hsl(var(--cymru-gold)/0.25)] bg-[hsl(var(--cymru-gold)/0.06)] px-4 text-lg text-foreground shadow-sm placeholder:text-sm placeholder:font-medium placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-[hsl(var(--cymru-gold)/0.4)] focus-visible:border-[hsl(var(--cymru-gold)/0.5)]"
            onKeyDown={(e) => {
              if (e.key === "Enter") onCheck();
            }}
          />
        </div>
      </div>

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

      {showHint && hintText ? (
        <div className="rounded-xl border border-[hsl(var(--cymru-green-light)/0.3)] bg-[hsl(var(--cymru-green-wash)/0.5)] px-4 py-3 text-sm font-medium text-foreground">
          {hintText}
        </div>
      ) : null}
    </div>
  );
}

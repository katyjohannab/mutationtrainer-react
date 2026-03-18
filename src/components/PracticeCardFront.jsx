import { useCallback, useEffect, useMemo, useRef } from "react";
import { Badge } from "./ui/badge";
import HeroPill from "./HeroPill";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { deriveDysguBadges } from "../utils/dysguBadges";
import CardTranslationPopover from "./card/CardTranslationPopover";
import CardUtilityCluster from "./card/CardUtilityCluster";
import SessionStatsInline from "./SessionStatsInline";
import { cn } from "../lib/cn";

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

  const mobileInputRef = useRef(null);
  const desktopInputRef = useRef(null);

  const focusVisibleInput = useCallback(() => {
    const isDesktop = window.matchMedia("(min-width: 1280px)").matches;
    const target = isDesktop ? desktopInputRef.current : mobileInputRef.current;
    target?.focus();
  }, []);

  useEffect(() => {
    if (isFeedback) return;
    focusVisibleInput();
  }, [cardId, isFeedback, focusVisibleInput]);

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
          "space-y-5 sm:space-y-6 lg:space-y-7 xl:space-y-8",
          isHeroStressed && "sm:space-y-5 lg:space-y-6 xl:space-y-7"
        )}
      >
        <div className="flex w-full flex-col items-center gap-4 sm:gap-5 lg:gap-6 xl:gap-7 [@media(max-height:700px)]:gap-3.5">
          <p className="mx-auto max-w-[38rem] text-center text-[1.06rem] leading-[1.72] text-foreground sm:px-2 sm:text-[1.18rem] sm:leading-[1.66] lg:text-[1.28rem] xl:text-[clamp(1.08rem,0.62vw+0.98rem,1.45rem)] xl:leading-relaxed">
            <span className="whitespace-pre-wrap break-words">{sent?.before}</span>
            {" "}
            <span
              aria-hidden="true"
              className="mx-1.5 inline-flex h-[1.45em] min-w-[6ch] w-[7.8ch] items-center justify-center rounded-full border border-[hsl(var(--cymru-gold)/0.28)] bg-[hsl(var(--cymru-gold)/0.1)] align-middle shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] sm:w-[9.8ch] lg:w-[10.8ch] xl:hidden"
            />
            <span className="hidden xl:inline">
              <Input
                ref={desktopInputRef}
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                disabled={disabledInput}
                placeholder={placeholder}
                className="mx-1 inline-flex h-11 min-w-[10ch] w-[15ch] max-w-full align-baseline rounded-lg border-0 bg-[hsl(var(--cymru-gold)/0.08)] px-3 text-[clamp(1.08rem,0.62vw+0.98rem,1.45rem)] text-foreground shadow-sm placeholder:text-sm placeholder:font-medium placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/50 2xl:w-[16ch]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCheck();
                }}
              />
            </span>
            {" "}
            <span className="whitespace-pre-wrap break-words">{sent?.after}</span>
          </p>

          <div className="mx-auto w-full xl:hidden sm:max-w-[21rem] lg:max-w-[23.5rem]">
            <Input
              ref={mobileInputRef}
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              disabled={disabledInput}
              placeholder={placeholder}
              className="h-12 w-full rounded-xl border-2 border-[hsl(var(--cymru-gold)/0.25)] bg-[hsl(var(--cymru-gold)/0.06)] px-4 text-lg text-foreground shadow-sm placeholder:text-sm placeholder:font-medium placeholder:text-muted-foreground/50 focus-visible:border-[hsl(var(--cymru-gold)/0.5)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--cymru-gold)/0.4)]"
              onKeyDown={(e) => {
                if (e.key === "Enter") onCheck();
              }}
            />
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

import { useEffect, useMemo, useRef } from "react";
import { Badge } from "./ui/badge";
import HeroPill from "./HeroPill";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { deriveDysguBadges } from "../utils/dysguBadges";
import CardTranslationPopover from "./card/CardTranslationPopover";
import CardUtilityCluster from "./card/CardUtilityCluster";

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

  const inputRef = useRef(null);

  useEffect(() => {
    if (isFeedback) return;
    inputRef.current?.focus();
  }, [cardId, isFeedback]);

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

      <div className="text-[clamp(1.05rem,0.6vw+0.95rem,1.45rem)] leading-relaxed text-foreground flex flex-wrap justify-center items-baseline gap-x-2.5 gap-y-2">
        <span className="whitespace-pre-wrap break-words">{sent?.before}</span>
        <Input
          ref={inputRef}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={disabledInput}
          placeholder={placeholder}
          className="mx-0 inline-flex h-10 sm:h-11 min-w-[10ch] w-[12ch] sm:w-[15ch] lg:w-[16ch] max-w-full align-baseline rounded-lg border-0 bg-[hsl(var(--cymru-gold)/0.08)] px-3 text-[clamp(1.05rem,0.6vw+0.95rem,1.45rem)] text-foreground shadow-sm placeholder:text-xs sm:placeholder:text-sm placeholder:font-medium placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/50"
          onKeyDown={(e) => {
            if (e.key === "Enter") onCheck();
          }}
        />
        <span className="whitespace-pre-wrap break-words">{sent?.after}</span>
      </div>

      <Separator />

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

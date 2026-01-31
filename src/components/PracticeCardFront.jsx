import { useMemo } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./ui/hover-card";
import {
  CheckIcon,
  LightBulbIcon,
  EyeIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/outline";

export default function PracticeCardFront({
  sent,
  answer,
  cardState,
  guess,
  setGuess,
  disabledInput,
  showTranslate,
  translate,
  placeholder,
  hintText,
  showHint,
  onToggleHint,
  onCheck,
  onReveal,
  onSkip,
  onNext,
  t,
  tooltipTranslate,
  tooltipWordCategory,
  instructionText,
}) {
  const isFeedback = cardState === "feedback";
  const baseword = sent?.base || "_____";
  const hoverCardContentClass =
    "w-64 max-w-[85vw] rounded-2xl border border-border bg-card/95 p-4 text-sm text-foreground shadow-xl backdrop-blur";

  const tooltipLines = useMemo(() => {
    const lines = [];
    if (tooltipTranslate) {
      lines.push({ label: "English", value: tooltipTranslate });
    }
    if (tooltipWordCategory) {
      lines.push({ label: "Category", value: tooltipWordCategory });
    }
    return lines;
  }, [tooltipTranslate, tooltipWordCategory]);

  const checkLabel = isFeedback ? (t("next") || "Next") : (t("check") || "Check");
  const hintLabel = t("hint") || "Hint";
  const revealLabel = t("reveal") || "Reveal";
  const skipLabel = t("skip") || "Skip";

  return (
    <div className="space-y-6">
      {instructionText ? (
        <div className="text-sm text-muted-foreground">{instructionText}</div>
      ) : null}

      <div className="flex justify-center">
        <div className="relative inline-flex">
          <Badge
            variant="secondary"
            className="rounded-full border border-border bg-muted px-8 py-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground shadow-sm leading-none"
          >
            {baseword}
          </Badge>

          {tooltipLines.length > 0 ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  aria-label="Translation and category"
                  className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  ?
                </button>
              </HoverCardTrigger>
              <HoverCardContent
                side="top"
                align="center"
                sideOffset={12}
                collisionPadding={12}
                className={hoverCardContentClass}
              >
                <div className="space-y-2">
                  {tooltipLines.map(({ label, value }, idx) => (
                    <div key={idx}>
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {label}
                      </div>
                      <div className="text-sm text-foreground">{value}</div>
                    </div>
                  ))}
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : null}
        </div>
      </div>

      {showTranslate ? (
        <div className="text-sm text-muted-foreground">{translate}</div>
      ) : null}

      <div className="min-w-0 flex flex-wrap items-center gap-2 text-lg sm:text-xl leading-relaxed text-foreground/80">
        <span className="whitespace-pre-wrap break-words">{sent?.before}</span>
        <input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={disabledInput}
          placeholder={placeholder}
          className="h-11 min-w-[8ch] w-[10ch] sm:w-[12ch] max-w-full rounded-full border border-input bg-muted px-4 text-base text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          onKeyDown={(e) => {
            if (e.key === "Enter") onCheck();
          }}
        />
        <span className="whitespace-pre-wrap break-words">{sent?.after}</span>
      </div>

      <Separator />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={onCheck}
          className="h-10 border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <CheckIcon className="h-5 w-5" aria-hidden="true" />
          {checkLabel}
        </Button>

        <Button
          type="button"
          variant="default"
          onClick={onToggleHint}
          className="h-10 border-border bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80"
        >
          <LightBulbIcon className="h-5 w-5" aria-hidden="true" />
          {hintLabel}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onReveal}
          disabled={isFeedback}
          className="h-10 border-border text-destructive shadow-sm hover:bg-destructive/10"
        >
          <EyeIcon className="h-5 w-5" aria-hidden="true" />
          {revealLabel}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          disabled={isFeedback}
          className="h-10 text-muted-foreground hover:text-foreground"
        >
          <ArrowUturnRightIcon className="h-5 w-5" aria-hidden="true" />
          {skipLabel}
        </Button>
      </div>

      {showHint && hintText ? (
        <div className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground">
          {hintText}
        </div>
      ) : null}
    </div>
  );
}

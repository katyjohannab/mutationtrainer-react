import { useEffect, useMemo, useRef } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import HeroPill from "./HeroPill";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./ui/hover-card";
import { CheckCircle2, Lightbulb, MonitorPlay, SkipForward } from "lucide-react";
import AppIcon from "./icons/AppIcon";

export default function PracticeCardFront({
  sent,
  cardState,
  cardId,
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
  t,
  tooltipTranslate,
  tooltipWordCategory,
}) {
  const isFeedback = cardState === "feedback";
  const baseword = sent?.base || "_____";
  const inputRef = useRef(null);
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

  useEffect(() => {
    if (isFeedback) return;
    inputRef.current?.focus();
  }, [cardId, isFeedback]);

  return (
    <div className="space-y-6">
      <div className="flex justify-center w-full px-2">
        <div className="relative inline-flex max-w-full">
          {/* TODO: Map cardState or parent feedback state to HeroPill state (success/destructive/hint) */}
          <HeroPill text={baseword} showPin={false} />

          {tooltipLines.length > 0 ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  aria-label="Translation and category"
                  className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-destructive bg-card text-xs font-extrabold text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive hover:bg-destructive/10 hover:shadow-sm transition-colors"
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
                      {label === "Category" ? (
                        <Badge
                          className="mt-1 bg-[#60A561] text-white hover:bg-[#60A561]/90 border-0 rounded-full px-3 py-1 text-xs font-semibold"
                        >
                          {value}
                        </Badge>
                      ) : (
                        <div className="text-sm text-foreground">{value}</div>
                      )}
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

      <div className="text-[clamp(1.05rem,0.6vw+0.95rem,1.45rem)] leading-relaxed text-foreground">
        <span className="whitespace-pre-wrap break-words">{sent?.before}</span>
        <Input
          ref={inputRef}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={disabledInput}
          placeholder={placeholder}
          className="mx-2 inline-flex h-10 sm:h-11 min-w-[10ch] w-[12ch] sm:w-[15ch] lg:w-[16ch] max-w-full align-baseline rounded-lg border-0 bg-[hsl(var(--cymru-gold)/0.08)] px-3 text-[clamp(1.05rem,0.6vw+0.95rem,1.45rem)] text-foreground shadow-sm placeholder:text-xs sm:placeholder:text-sm placeholder:font-medium placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/50"
          onKeyDown={(e) => {
            if (e.key === "Enter") onCheck();
          }}
        />
        <span className="whitespace-pre-wrap break-words">{sent?.after}</span>
      </div>

      <Separator />

      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
        <Button
          type="button"
          variant="default"
          onClick={onCheck}
          size="action"
          className="flex-1 sm:flex-none min-w-[120px]"
        >
          <AppIcon icon={CheckCircle2} className="h-4 w-4" aria-hidden="true" />
          {checkLabel}
        </Button>

        <Button
          type="button"
          variant="outline-secondary"
          onClick={onToggleHint}
          size="action"
          className="flex-1 sm:flex-none min-w-[120px]"
        >
          <AppIcon icon={Lightbulb} className="h-4 w-4" aria-hidden="true" />
          {hintLabel}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onReveal}
          disabled={isFeedback}
          size="action"
          className="flex-1 sm:flex-none min-w-[120px]"
        >
          <AppIcon icon={MonitorPlay} className="h-4 w-4" aria-hidden="true" />
          {revealLabel}
        </Button>

        <Button
          type="button"
          variant="outline-accent"
          onClick={onSkip}
          disabled={isFeedback}
          size="action"
          className="flex-1 sm:flex-none min-w-[120px]"
        >
          <AppIcon icon={SkipForward} className="h-4 w-4" aria-hidden="true" />
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

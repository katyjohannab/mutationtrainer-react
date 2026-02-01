import { useMemo } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import HeroPill from "./HeroPill";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { cn } from "../lib/cn";
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
          {/* TODO: Map cardState or parent feedback state to HeroPill state (success/destructive/hint) */}
          <div
            className={cn(
              "inline-flex items-center rounded-full",
              "ring-1 ring-[hsl(var(--ring)/0.2)]",
              "shadow-sm",
              "relative",
              "bg-[hsl(var(--primary)/0.14)]",
              "px-12 py-5 sm:px-14 sm:py-6",
              "border-2 border-[hsl(var(--cymru-green-light))]"
            )}
          >
            {/* Faint top highlight overlay */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
                pointerEvents: "none",
              }}
              aria-hidden="true"
            />
            <h1 className="relative z-10 text-center text-6xl sm:text-7xl font-extrabold tracking-tight text-[hsl(var(--cymru-green))] leading-none">
              {baseword}
            </h1>
          </div>

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

      <div className="text-base sm:text-lg leading-relaxed text-foreground">
        <span className="whitespace-pre-wrap break-words">{sent?.before}</span>
        <Input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={disabledInput}
          placeholder={placeholder}
          className="mx-2 inline-flex h-10 sm:h-11 min-w-[10ch] w-[12ch] sm:w-[15ch] lg:w-[16ch] max-w-full align-baseline rounded-lg border-0 bg-[hsl(var(--cymru-gold)/0.08)] px-3 text-base sm:text-lg text-foreground shadow-sm placeholder:text-xs sm:placeholder:text-sm placeholder:font-medium placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/50"
          onKeyDown={(e) => {
            if (e.key === "Enter") onCheck();
          }}
        />
        <span className="whitespace-pre-wrap break-words">{sent?.after}</span>
      </div>

      <Separator />

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="default" onClick={onCheck}>
          <CheckIcon className="h-4 w-4" aria-hidden="true" />
          {checkLabel}
        </Button>

        <Button type="button" variant="outline-secondary" onClick={onToggleHint}>
          <LightBulbIcon className="h-4 w-4" aria-hidden="true" />
          {hintLabel}
        </Button>

        <Button
          type="button"
          variant="outline-destructive"
          onClick={onReveal}
          disabled={isFeedback}
        >
          <EyeIcon className="h-4 w-4" aria-hidden="true" />
          {revealLabel}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          disabled={isFeedback}
        >
          <ArrowUturnRightIcon className="h-4 w-4" aria-hidden="true" />
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

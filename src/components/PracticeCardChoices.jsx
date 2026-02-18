import { useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { cn } from "../lib/cn";
import LanguagesIcon from "./icons/LanguagesIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./ui/hover-card";
import {
  CheckCircle2,
  Lightbulb,
  MonitorPlay,
  SkipForward,
} from "lucide-react";
import AppIcon from "./icons/AppIcon";
import { deriveDysguBadges } from "../utils/dysguBadges";

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
  showTranslate,
  translate,
  hintText,
  showHint,
  onToggleHint,
  onPick,
  onCheck,
  onReveal,
  onSkip,
  t,
  tooltipTranslate,
  tooltipWordCategory,
  guess,
  unit,
  course,
  level,
  sourceFile,
}) {
  const isFeedback = cardState === "feedback";
  const baseword = sent?.base || "_____";
  const dysguBadges = useMemo(
    () => deriveDysguBadges({ course, level, unit, sourceFile, t }),
    [course, level, unit, sourceFile, t]
  );

  const blankSlot = "_____";
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

  const checkLabel = isFeedback ? (t("next") || "Next") : (t("check") || "Check");
  const hintLabel = t("hint") || "Hint";
  const revealLabel = t("reveal") || "Reveal";
  const skipLabel = t("skip") || "Skip";
  const normalizedAnswer = normalizeChoice(answer);
  const normalizedGuess = normalizeChoice(guess);
  const utilityBaseClass =
    "h-10 w-10 shadow-none border border-transparent hover:border-border/60";
  const hintClass =
    "bg-[hsl(var(--cymru-green-light-wash))] text-[hsl(var(--cymru-green-light))] hover:bg-[hsl(var(--cymru-green-light-wash))]";
  const revealClass =
    "bg-[hsl(var(--cymru-red-wash))] text-[hsl(var(--cymru-red))] hover:bg-[hsl(var(--cymru-red-wash))]";
  const skipClass =
    "bg-[hsl(var(--cymru-gold-wash))] text-[hsl(var(--cymru-gold))] hover:bg-[hsl(var(--cymru-gold-wash))]";
  const tooltipBaseClass = "text-white";
  const tooltipGreenClass = "bg-[hsl(var(--cymru-green))] text-white";
  const tooltipRedClass = "bg-[hsl(var(--cymru-red))] text-white";
  const tooltipGoldClass = "bg-[hsl(var(--cymru-gold))] text-white";

  return (
    <div className="space-y-6">
      {/* Dysgu course/unit badges */}
      {dysguBadges && (
        <div className="flex w-full justify-start gap-2 px-2">
          {dysguBadges.courseLabel && (
            <Badge variant="cymru-dark" className="rounded-full px-3 py-1 text-xs font-semibold">
              {dysguBadges.courseLabel}
            </Badge>
          )}
          {dysguBadges.unitLabel && (
            <Badge variant="cymru-light" className="rounded-full px-3 py-1 text-xs font-semibold">
              {dysguBadges.unitLabel}
            </Badge>
          )}
        </div>
      )}
      
      <div className="flex flex-col items-center gap-2 w-full px-2">
        <div className="relative inline-flex max-w-full">
          <Badge
            variant="secondary"
            className="w-full max-w-[min(100%,52rem)] rounded-full border-2 border-[hsl(var(--cymru-green-light))] bg-[hsl(var(--hero-pill-bg))] px-[clamp(1.5rem,5vw,4.5rem)] py-[clamp(1rem,3vw,2.25rem)] shadow-[0_6px_18px_rgba(0,0,0,0.10),0_1px_2px_rgba(0,0,0,0.06)]"
          >
            <h1 className="text-center text-[clamp(2.5rem,6vw,5.25rem)] font-extrabold tracking-tight text-primary leading-[0.95] text-balance break-words">
              {baseword}
            </h1>
          </Badge>

          {tooltipLines.length > 0 ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  aria-label="Translation and category"
                  className="absolute -right-3 -top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--cymru-green-light))] hover:bg-primary/90 transition-colors"
                >
                  <LanguagesIcon size={16} color="currentColor" strokeWidth={2} />
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

      <div className="min-w-0 flex flex-wrap items-center gap-2 text-lg sm:text-xl leading-relaxed text-foreground/80">
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

      <TooltipProvider>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <ButtonGroup>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="default"
                    onClick={onToggleHint}
                    size="icon"
                    className={cn(utilityBaseClass, hintClass)}
                    aria-label={hintLabel}
                  >
                    <AppIcon icon={Lightbulb} className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className={cn(tooltipGreenClass, tooltipBaseClass)}>
                  {hintLabel}
                </TooltipContent>
              </Tooltip>
            </ButtonGroup>

            <ButtonGroup className="flex-wrap">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="default"
                    onClick={onReveal}
                    disabled={isFeedback}
                    size="icon"
                    className={cn(utilityBaseClass, revealClass)}
                    aria-label={revealLabel}
                  >
                    <AppIcon icon={MonitorPlay} className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className={cn(tooltipRedClass, tooltipBaseClass)}>
                  {revealLabel}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="default"
                    onClick={onSkip}
                    disabled={isFeedback}
                    size="icon"
                    className={cn(utilityBaseClass, skipClass)}
                    aria-label={skipLabel}
                  >
                    <AppIcon icon={SkipForward} className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className={cn(tooltipGoldClass, tooltipBaseClass)}>
                  {skipLabel}
                </TooltipContent>
              </Tooltip>
            </ButtonGroup>

          </div>

          <ButtonGroup>
            <Button
              type="button"
              variant="default"
              onClick={onCheck}
              size="action"
              className="w-full sm:w-auto bg-[hsl(var(--cymru-green))] text-white hover:bg-[hsl(var(--cymru-green)/0.9)] whitespace-nowrap shadow-sm font-semibold"
            >
              <AppIcon icon={CheckCircle2} className="h-5 w-5" aria-hidden="true" />
              {checkLabel}
            </Button>
          </ButtonGroup>
        </div>
      </TooltipProvider>

      {showHint && hintText ? (
        <div className="rounded-2xl border border-border bg-muted px-4 py-3 text-sm text-foreground">
          {hintText}
        </div>
      ) : null}
    </div>
  );
}




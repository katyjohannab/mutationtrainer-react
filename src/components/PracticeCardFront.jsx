import { useEffect, useMemo, useRef } from "react";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import { Badge } from "./ui/badge";
import HeroPill from "./HeroPill";
import { Input } from "./ui/input";
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
  unit,
  sourceFile,
}) {
  const isFeedback = cardState === "feedback";
  const baseword = sent?.base || "_____";

  const courseBadge = useMemo(() => {
    if (!unit) return null;
    let course = "";

    // Heuristic for course name from filename
    const src = (sourceFile || "").toLowerCase();
    if (src.includes("mynediad")) {
       course = "Mynediad";
    } else if (src.includes("sylfaen")) {
       course = "Sylfaen";
    }
    
    // Label: "Mynediad • Unit 1"
    const prefix = t("unitPrefix") || "Unit";
    const unitPart = `${prefix} ${unit}`;
    
    if (course) return `${course} • ${unitPart}`;
    return unitPart;
  }, [unit, sourceFile, t]);

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

  useEffect(() => {
    if (isFeedback) return;
    inputRef.current?.focus();
  }, [cardId, isFeedback]);

  return (
    <div className="space-y-6">
      {/* Course Badge - Top Left */}
      {courseBadge && (
        <div className="flex w-full px-2 justify-start">
           <Badge className="bg-[hsl(var(--cymru-green-light))] text-white hover:bg-[hsl(var(--cymru-green-light))] border-0 text-[10px] uppercase tracking-wider font-semibold opacity-90">
             {courseBadge}
           </Badge>
        </div>
      )}

      <div className="flex flex-col items-center gap-2 w-full px-2">
        <div className="relative inline-flex max-w-full">
          {/* TODO: Map cardState or parent feedback state to HeroPill state (success/destructive/hint) */}
          <HeroPill text={baseword} showPin={false} />

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

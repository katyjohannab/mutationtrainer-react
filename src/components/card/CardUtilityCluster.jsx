import { CheckCircle2, Lightbulb, MonitorPlay, Shuffle, SkipForward } from "lucide-react";
import { cn } from "../../lib/cn";
import AppIcon from "../icons/AppIcon";
import { Button } from "../ui/button";
import { ButtonGroup } from "../ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export default function CardUtilityCluster({
  t,
  isFeedback,
  mode,
  onToggleHint,
  onReveal,
  onSkip,
  onShuffle,
  onCheck,
}) {
  const checkLabel = isFeedback ? t("next") || "Next" : t("check") || "Check";
  const hintLabel = t("hint") || "Hint";
  const revealLabel = t("reveal") || "Reveal";
  const skipLabel = t("skip") || "Skip";
  const shuffleLabel = t("shuffle") || "Shuffle";
  const showShuffle = typeof onShuffle === "function";

  const utilityBaseClass =
    "h-10 w-10 border border-transparent shadow-none transition-all duration-200 hover:-translate-y-px hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring/40";
  const hintClass =
    "bg-[hsl(var(--cymru-green-light-wash))] text-[hsl(var(--cymru-green-light))] hover:bg-[hsl(var(--cymru-green-light-wash)/0.82)]";
  const revealClass =
    "bg-[hsl(var(--cymru-red-wash))] text-[hsl(var(--cymru-red))] hover:bg-[hsl(var(--cymru-red-wash)/0.82)]";
  const skipClass =
    "bg-[hsl(var(--cymru-gold-wash))] text-[hsl(var(--cymru-gold))] hover:bg-[hsl(var(--cymru-gold-wash)/0.82)]";
  const shuffleClass =
    "bg-[hsl(var(--cymru-green-wash))] text-[hsl(var(--cymru-green))] hover:bg-[hsl(var(--cymru-green-wash)/0.82)]";

  return (
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
              <TooltipContent>{hintLabel}</TooltipContent>
            </Tooltip>
          </ButtonGroup>

          <ButtonGroup className="flex-wrap">
            {showShuffle ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="default"
                    onClick={onShuffle}
                    size="icon"
                    className={cn(utilityBaseClass, shuffleClass)}
                    aria-label={shuffleLabel}
                  >
                    <AppIcon icon={Shuffle} className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{shuffleLabel}</TooltipContent>
              </Tooltip>
            ) : null}

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
              <TooltipContent>{revealLabel}</TooltipContent>
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
              <TooltipContent>{skipLabel}</TooltipContent>
            </Tooltip>
          </ButtonGroup>
        </div>

        <ButtonGroup>
          <Button
            type="button"
            variant="default"
            onClick={onCheck}
            size="action"
            className="w-full sm:w-auto bg-[hsl(var(--cymru-green))] text-white shadow-sm font-semibold transition-colors hover:bg-[hsl(var(--cymru-green)/0.9)]"
          >
            <AppIcon icon={CheckCircle2} className="h-5 w-5" aria-hidden="true" />
            {checkLabel}
          </Button>
        </ButtonGroup>
      </div>
    </TooltipProvider>
  );
}

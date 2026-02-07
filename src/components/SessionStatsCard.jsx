import React from "react";
import { RotateCcw, Flame, Target } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "../lib/cn";
import { useI18n } from "../i18n/I18nContext";

function StatItem({ icon: Icon, value, label, variant = "default" }) {
  const variantStyles = {
    default: "text-[hsl(var(--cymru-green))]",
    accent: "text-[hsl(var(--cymru-gold))]",
  };

  const bgStyles = {
    default: "bg-[hsl(var(--cymru-green-wash))]",
    accent: "bg-[hsl(var(--cymru-gold-wash))]",
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex items-center justify-center",
          "h-10 w-10 rounded-full",
          bgStyles[variant],
          variantStyles[variant]
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col">
        <span className={cn("text-lg font-bold leading-tight", variantStyles[variant])}>
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export default function SessionStatsCard({ stats, onReset, className }) {
  const { t } = useI18n();
  
  const accuracy = stats.attempted > 0 
    ? Math.round((stats.correct / stats.attempted) * 100) 
    : 0;

  const streakLabel = t("streakLabel") || "Streak";
  const accuracyLabel = t("accuracyLabel") || "Accuracy";
  const resetLabel = t("resetStats") || "Reset session";
  const statsTitle = t("sessionStatsTitle") || "Session stats";

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "border-2 border-[hsl(var(--cymru-green-light))]",
          "bg-card",
          className
        )}
      >
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-foreground">
            {statsTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="flex flex-col gap-3">
            {/* Stats row */}
            <div className="flex items-center justify-between gap-4">
              <StatItem
                icon={Flame}
                value={stats.streak}
                label={streakLabel}
                variant="accent"
              />
              <StatItem
                icon={Target}
                value={`${accuracy}%`}
                label={accuracyLabel}
              />
            </div>

            {/* Reset button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={onReset}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  {resetLabel}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {t("resetStatsHint") || "Reset streak and accuracy to zero"}
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

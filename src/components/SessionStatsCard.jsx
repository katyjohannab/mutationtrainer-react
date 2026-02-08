import React from "react";
import { RotateCcw, Flame, Trophy, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "../lib/cn";
import { useI18n } from "../i18n/I18nContext";
import StatItem from "./StatItem";

export default function SessionStatsCard({ stats, onReset, className }) {
  const { t } = useI18n();

  const accuracy = stats.attempted > 0
    ? Math.round((stats.correct / stats.attempted) * 100)
    : 0;

  const streakLabel     = t("streakLabel")     || "Streak";
  const bestStreakLabel = t("bestStreakLabel") || "Longest streak";
  const accuracyLabel   = t("accuracyLabel")   || "Accuracy";
  const resetLabel      = t("resetStats")      || "Reset session";
  const resetHint       = t("resetStatsHint")  || "Reset streak and accuracy to zero";
  const statsTitle      = t("sessionStatsTitle") || "Session stats";

  return (
    <TooltipProvider>
      <Card
        className={cn(
          "border-2 border-[hsl(var(--cymru-green-light))]",
          "bg-card",
          className
        )}
      >
        <CardHeader className="px-4 pt-4 pb-1 sm:px-5 sm:pt-5 lg:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {statsTitle}
            </CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="warning"
                  className="cursor-pointer px-1.5 py-1"
                  onClick={onReset}
                  role="button"
                  aria-label={resetLabel}
                >
                  <RotateCcw className="h-3 w-3" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {resetHint}
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-2 sm:px-5 sm:pb-5 lg:px-6">
          {/* Stats row — evenly spaced centered columns */}
          <div className="grid grid-cols-3 gap-2 py-1">
            <StatItem
              icon={Flame}
              value={stats.streak}
              label={streakLabel}
              variant="orange"
            />
            <StatItem
              icon={Trophy}
              value={stats.bestStreak}
              label={bestStreakLabel}
              variant="lightGreen"
            />
            <StatItem
              icon={Target}
              value={`${accuracy}%`}
              label={accuracyLabel}
            />
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

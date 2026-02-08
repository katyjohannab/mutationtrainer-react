import React from "react";
import { RotateCcw, Flame, Trophy, Target } from "lucide-react";
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
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {statsTitle}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-2 sm:px-5 sm:pb-5 lg:px-6">
          <div className="flex flex-col gap-4">
            {/* Stats row — evenly spaced centered columns */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <StatItem
                icon={Flame}
                value={stats.streak}
                label={streakLabel}
                variant="red"
              />
              <StatItem
                icon={Trophy}
                value={stats.bestStreak}
                label={bestStreakLabel}
                variant="accent"
              />
              <StatItem
                icon={Target}
                value={`${accuracy}%`}
                label={accuracyLabel}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

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

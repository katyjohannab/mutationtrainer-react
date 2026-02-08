import React from "react";
import { Flame, Trophy, Target } from "lucide-react";
import { cn } from "../lib/cn";
import { useI18n } from "../i18n/I18nContext";
import StatItem from "./StatItem";

export default function SessionStatsInline({ stats, className }) {
  const { t } = useI18n();

  const accuracy = stats.attempted > 0
    ? Math.round((stats.correct / stats.attempted) * 100)
    : 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <StatItem
        icon={Flame}
        value={stats.streak}
        label={t("streakLabel") || "Streak"}
        variant="red"
        size="compact"
      />
      <StatItem
        icon={Trophy}
        value={stats.bestStreak}
        label={t("bestStreakLabel") || "Longest streak"}
        variant="accent"
        size="compact"
      />
      <StatItem
        icon={Target}
        value={`${accuracy}%`}
        label={t("accuracyLabel") || "Accuracy"}
        size="compact"
      />
    </div>
  );
}

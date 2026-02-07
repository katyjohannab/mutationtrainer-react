import React from "react";
import { Flame, Target } from "lucide-react";
import { cn } from "../lib/cn";
import { useI18n } from "../i18n/I18nContext";

function InlineStat({ icon: Icon, value, label, variant = "default" }) {
  const variantStyles = {
    default: "text-[hsl(var(--cymru-green))]",
    accent: "text-[hsl(var(--cymru-gold))]",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        variantStyles[variant]
      )}
      title={label}
    >
      <Icon className="h-3 w-3" />
      <span>{value}</span>
    </div>
  );
}

export default function SessionStatsInline({ stats, className }) {
  const { t } = useI18n();
  
  const accuracy = stats.attempted > 0 
    ? Math.round((stats.correct / stats.attempted) * 100) 
    : 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <InlineStat
        icon={Flame}
        value={stats.streak}
        label={t("streakLabel") || "Streak"}
        variant="accent"
      />
      <InlineStat
        icon={Target}
        value={`${accuracy}%`}
        label={t("accuracyLabel") || "Accuracy"}
      />
    </div>
  );
}

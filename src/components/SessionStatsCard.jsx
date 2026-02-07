import React from "react";
import { RotateCcw, Flame, Target } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "../lib/cn";
import { useI18n } from "../i18n/I18nContext";

function StatBadge({ icon: Icon, value, label, variant = "default" }) {
  const variantStyles = {
    default: "bg-[hsl(var(--cymru-green-wash))] text-[hsl(var(--cymru-green))] border-[hsl(var(--cymru-green-light))]",
    accent: "bg-[hsl(var(--cymru-gold-wash))] text-[hsl(var(--cymru-gold))] border-[hsl(var(--cymru-gold))]",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex flex-col items-center justify-center",
              "h-16 w-16 rounded-full border",
              "transition-colors",
              variantStyles[variant]
            )}
          >
            <Icon className="h-4 w-4 mb-0.5" />
            <span className="text-lg font-bold leading-none">{value}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <span>{label}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function SessionStatsCard({ stats, onReset, className }) {
  const { t } = useI18n();
  
  const accuracy = stats.attempted > 0 
    ? Math.round((stats.correct / stats.attempted) * 100) 
    : 0;

  return (
    <Card
      className={cn(
        "border-2 border-[hsl(var(--cymru-green-light))]",
        "bg-card/80 backdrop-blur-sm",
        className
      )}
    >
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <StatBadge
            icon={Flame}
            value={stats.streak}
            label={t("streakLabel") || "Current streak"}
            variant="accent"
          />
          <StatBadge
            icon={Target}
            value={`${accuracy}%`}
            label={t("accuracyLabel") || "Accuracy"}
          />
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onReset}
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {t("resetStats") || "Reset stats"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

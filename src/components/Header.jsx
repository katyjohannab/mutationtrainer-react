import React from "react";
import { useI18n } from "../i18n/I18nContext";
import {
  QuestionMarkCircleIcon,
  ChartBarIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./ui/tooltip";
import { cn } from "../lib/cn";

export default function Header({
  onOpenHelp,
  onOpenStats,
  onOpenFilters,
}) {
  const { lang, setLang, t } = useI18n();
  const isCy = lang === "cy";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[hsl(var(--cymru-header))] shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        
        {/* Logo lockup: dragon + wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <img
            src="/dragon.png"
            alt=""
            className="h-8 w-8 sm:h-10 sm:w-10 drop-shadow-sm"
            aria-hidden="true"
          />
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl uppercase tracking-[-0.02em] leading-tight text-primary"
            style={{
              fontFamily:
                "'BBH Bogle', 'bbh-bogle-regular', 'Bogle', 'Poppins', 'Inter', sans-serif",
            }}
          >
            Hyfforddwr <span className="text-destructive">Treiglad</span>
          </h1>
        </div>

        {/* Control cluster: unified minimal surface */}
        <TooltipProvider>
          <div className="flex items-center border border-border rounded-lg bg-primary/10 px-3 py-2 gap-3">
            
            {/* Language toggle: EN [switch] CY */}
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs font-medium transition-colors",
                !isCy ? "text-primary" : "text-muted-foreground"
              )}>
                EN
              </span>
              <Switch
                checked={isCy}
                onCheckedChange={(checked) => setLang(checked ? "cy" : "en")}
                aria-label={t("headerSwitchLang") || "Toggle language"}
                className="h-5"
              />
              <span className={cn(
                "text-xs font-medium transition-colors",
                isCy ? "text-primary" : "text-muted-foreground"
              )}>
                CY
              </span>
            </div>

            {/* Separator */}
            <div className="h-4 w-px bg-border" />

            {/* Icon buttons: help, stats */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onOpenHelp}
                  aria-label={t("headerHelp") || "Help"}
                  className="h-9 w-9 text-primary hover:bg-primary/10"
                >
                  <QuestionMarkCircleIcon className="h-5 w-5" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {t("headerHelp") || "Help"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onOpenStats}
                  aria-label={t("headerStats") || "Stats"}
                  className="h-9 w-9 text-primary hover:bg-primary/10"
                >
                  <ChartBarIcon className="h-5 w-5" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {t("headerStats") || "Stats"}
              </TooltipContent>
            </Tooltip>

            {/* Mobile filters button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden h-9 w-9 text-primary hover:bg-primary/10"
                  onClick={onOpenFilters}
                  aria-label={t("headerFilters") || "Filters"}
                >
                  <FunnelIcon className="h-5 w-5" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {t("headerFilters") || "Filters"}
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </header>
  );
}

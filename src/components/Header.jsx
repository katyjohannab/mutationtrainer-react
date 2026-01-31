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
    <header className="sticky top-0 z-40 border-b shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 bg-[hsl(var(--cymru-white))]">
        
        {/* Logo lockup: dragon + wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <img
            src="/dragon.png"
            alt=""
            className="h-9 w-9 sm:h-11 sm:w-11 lg:h-12 lg:w-12 drop-shadow-sm"
            aria-hidden="true"
          />
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl uppercase tracking-[-0.03em] leading-tight text-primary"
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
          <div className="flex items-center border border-border rounded-lg bg-[hsl(var(--cymru-bg))] px-3 py-2 gap-3">
            
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
                  className="h-9 w-9 text-primary hover:bg-[hsl(var(--cymru-bg))]/70"
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
                  className="h-9 w-9 text-primary hover:bg-[hsl(var(--cymru-bg))]/70"
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
                  className="sm:hidden h-9 w-9 text-primary hover:bg-[hsl(var(--cymru-bg))]/70"
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
      <div className="h-0.5 bg-gradient-to-r from-[hsl(var(--cymru-green))] to-[hsl(var(--cymru-green-light))]" />
    </header>
  );
}

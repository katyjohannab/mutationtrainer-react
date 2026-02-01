import React from "react";
import { useI18n } from "../i18n/I18nContext";
import CymruRibbon from "./CymruRibbon";
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
    <header className="sticky top-0 z-40 border-b shadow-sm backdrop-blur bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-4 px-3 py-2 sm:px-6 sm:py-3 lg:py-3.5">
        
        {/* Logo lockup: dragon + wordmark */}
        <div className="flex items-center gap-[-0.5] min-w-0 shrink">
          <img
            src="/dragon.png"
            alt=""
            className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 xl:h-14 xl:w-14 drop-shadow-sm flex-shrink-0"
            aria-hidden="true"
          />
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl uppercase tracking-[-0.03em] leading-tight flex items-center gap--0.5
            "
            style={{
              fontFamily:
                "'BBH Bogle', 'bbh-bogle-regular', 'Bogle', 'Poppins', 'Inter', sans-serif",
            }}
          >
            <span 
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(to right, hsl(var(--cymru-green)) 0%, hsl(var(--cymru-green)) 10%, hsl(var(--cymru-green-light)) 90%, hsl(var(--cymru-green-light)) 100%)`
              }}
            >
              Hyfforddwr
            </span>
            <span className="text-destructive">Treiglad</span>
          </h1>
        </div>

        {/* Control cluster: unified minimal surface */}
        <TooltipProvider>
          <div className="flex items-center border border-border rounded-lg bg-[hsl(var(--rail))] px-2 py-1.5 sm:px-3 sm:py-2 gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Language toggle: EN [switch] CY */}
            <div className="hidden min-[400px]:flex items-center gap-1.5 sm:gap-2">
              <span className={cn(
                "text-[10px] sm:text-xs font-medium transition-colors",
                !isCy ? "text-primary" : "text-muted-foreground"
              )}>
                EN
              </span>
              <Switch
                checked={isCy}
                onCheckedChange={(checked) => setLang(checked ? "cy" : "en")}
                aria-label={t("headerSwitchLang") || "Toggle language"}
                className="h-4 sm:h-5"
              />
              <span className={cn(
                "text-[10px] sm:text-xs font-medium transition-colors",
                isCy ? "text-primary" : "text-muted-foreground"
              )}>
                CY
              </span>
            </div>

            {/* Separator */}
            <div className="hidden min-[400px]:block h-4 w-px bg-border" />

            {/* Icon buttons: help, stats */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onOpenHelp}
                  aria-label={t("headerHelp") || "Help"}
                  className="h-8 w-8 sm:h-9 sm:w-9 text-primary hover:bg-[hsl(var(--rail))]/70"
                >
                  <QuestionMarkCircleIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
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
                  className="h-8 w-8 sm:h-9 sm:w-9 text-primary hover:bg-[hsl(var(--rail))]/70"
                >
                  <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
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
                  className="sm:hidden h-8 w-8 text-primary hover:bg-[hsl(var(--rail))]/70"
                  onClick={onOpenFilters}
                  aria-label={t("headerFilters") || "Filters"}
                >
                  <FunnelIcon className="h-4 w-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {t("headerFilters") || "Filters"}
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      <div className="h-[2px] bg-gradient-to-r from-[hsl(var(--cymru-green))] to-[hsl(var(--cymru-green-light))]" />
    </header>
  );
}

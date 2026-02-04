import React from "react";
import { useI18n } from "../i18n/I18nContext";
import { Filter } from "lucide-react";
import AppIcon from "./icons/AppIcon";
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
  onOpenFilters,
}) {
  const { lang, setLang, t } = useI18n();
  const isCy = lang === "cy";

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-card" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)' }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-4 px-3 py-2 sm:px-6 sm:py-3 lg:py-3.5">
        
        {/* Logo lockup: dragon + wordmark */}
        <div className="brandLockup flex items-baseline min-w-0 shrink whitespace-nowrap">
          <img
            src="dragon.png"
            alt=""
            className="brandMark h-7 w-auto sm:h-8 md:h-9 lg:h-10 flex-shrink-0"
            aria-hidden="true"
          />
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl uppercase leading-none whitespace-nowrap"
            style={{
              fontFamily:
                "'BBH Bogle', 'bbh-bogle-regular', 'Bogle', 'Poppins', 'Inter', sans-serif",
            }}
          >
            <span className="brandWordmark" aria-label="HYFFORDDWR TREIGLAD">
              <span className="brandPrimary text-[hsl(var(--cymru-green))]">
                <span className="brandWordPart">HYFFORDD</span>
                <span className="brandWordPart brandWordPart--kern">WR</span>
              </span>
              <span className="brandGap" aria-hidden="true" />
              <span className="brandSecondary text-destructive">
                TREIGLAD
              </span>
            </span>
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
                  <AppIcon
                    icon={Filter}
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
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

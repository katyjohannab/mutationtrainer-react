import React from "react";
import { useI18n } from "../i18n/I18nContext";
import { Check, Filter, Globe, HelpCircle } from "lucide-react";
import AppIcon from "./icons/AppIcon";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Switch } from "./ui/switch";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./ui/tooltip";
import { cn } from "../lib/cn";
import PageContainer from "./layout/PageContainer";

export default function Header({
  onOpenFilters,
  onOpenHelp,
}) {
  const { lang, setLang, t } = useI18n();
  const isCy = lang === "cy";

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-card" style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)' }}>
      <PageContainer className="flex items-end justify-between gap-2 sm:gap-4 pt-2 pb-2.5 sm:pt-3 sm:pb-3 lg:pb-3.5">
        
        {/* Logo lockup: dragon + wordmark */}
        <div className="brandLockup flex items-end min-w-0 shrink whitespace-nowrap">
          <img
            src="dragon.png"
            alt=""
            className="brandMark h-8 w-auto sm:h-9 md:h-10 lg:h-11 flex-shrink-0"
            aria-hidden="true"
          />
          <h1
            className="-ml-1 sm:-ml-2 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl uppercase leading-none whitespace-nowrap"
            style={{
              fontFamily:
                "'BBH Bogle', 'bbh-bogle-regular', 'Bogle', 'Poppins', 'Inter', sans-serif",
            }}
          >
            <span className="brandWordmark" aria-label="TREIGLAP">
              <span className="brandPrimary text-[hsl(var(--cymru-green))]">
                TREIGL
              </span>
              <span className="brandSecondary text-destructive">AP</span>
            </span>
          </h1>
        </div>

        {/* Control cluster: unified minimal surface */}
        <TooltipProvider>
          <div className="flex items-center self-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Language toggle: EN [switch] CY */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden h-8 w-8 text-primary hover:bg-[hsl(var(--rail))]/70"
                  aria-label={t("headerSwitchLang") || "Toggle language"}
                >
                  <AppIcon icon={Globe} className="h-4 w-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                <DropdownMenuItem
                  className={cn("text-xs", !isCy && "text-primary")}
                  onSelect={() => setLang("en")}
                >
                  English (EN)
                  {!isCy ? (
                    <AppIcon
                      icon={Check}
                      className="ml-auto h-3 w-3 text-primary"
                      aria-hidden="true"
                    />
                  ) : null}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={cn("text-xs", isCy && "text-primary")}
                  onSelect={() => setLang("cy")}
                >
                  Cymraeg (CYM)
                  {isCy ? (
                    <AppIcon
                      icon={Check}
                      className="ml-auto h-3 w-3 text-primary"
                      aria-hidden="true"
                    />
                  ) : null}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
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
                className="h-4 sm:h-5 data-[state=checked]:bg-[hsl(var(--cymru-green-light))]"
              />
              <span className={cn(
                "text-[10px] sm:text-xs font-medium transition-colors",
                isCy ? "text-primary" : "text-muted-foreground"
              )}>
                CYM
              </span>
            </div>

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

            {/* Mobile help button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden h-8 w-8 text-primary hover:bg-[hsl(var(--rail))]/70"
                  onClick={onOpenHelp}
                  aria-label={t("headerHelp") || "Help"}
                >
                  <AppIcon
                    icon={HelpCircle}
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {t("headerHelp") || "Help"}
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </PageContainer>
    </header>
  );
}

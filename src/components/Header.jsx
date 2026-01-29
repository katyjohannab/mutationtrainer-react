import React from "react";
import { useI18n } from "../i18n/I18nContext";
import {
  QuestionMarkCircleIcon,
  ChartBarIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { cn } from "../lib/cn";

export default function Header({
  onOpenHelp,
  onOpenStats,
  onOpenFilters,
}) {
  const { lang, setLang, t } = useI18n();
  const isCy = lang === "cy";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-emerald-100 bg-white/95 px-4 py-2 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src="/dragon.png"
          alt=""
          className="h-9 w-9 drop-shadow-sm shrink-0"
          aria-hidden="true"
        />
        <h1
          className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-900"
          style={{
            fontFamily:
              "'bbh-bogle-regular', 'Bogle', 'Poppins', 'Inter', sans-serif",
          }}
        >
          Hyfforddwr <span className="text-red-600">Treiglad</span>
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/40 px-3 py-1.5 shadow-sm">
          <span
            className={cn(
              "text-xs font-semibold",
              !isCy ? "text-emerald-700" : "text-neutral-500"
            )}
          >
            EN
          </span>
          <Switch
            checked={isCy}
            onCheckedChange={(checked) => setLang(checked ? "cy" : "en")}
            aria-label={t("headerSwitchLang")}
            className="h-6 w-11 data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-neutral-200"
          />
          <span
            className={cn(
              "text-xs font-semibold",
              isCy ? "text-emerald-700" : "text-neutral-500"
            )}
          >
            CY
          </span>
        </div>

        <Button
          variant="icon"
          size="icon"
          onClick={onOpenHelp}
          aria-label={t("headerHelp")}
          className="border border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50"
        >
          <QuestionMarkCircleIcon className="h-5 w-5" aria-hidden="true" />
        </Button>

        <Button
          variant="icon"
          size="icon"
          onClick={onOpenStats}
          aria-label={t("headerStats")}
          className="border border-emerald-100 bg-white text-emerald-700 hover:bg-emerald-50"
        >
          <ChartBarIcon className="h-5 w-5" aria-hidden="true" />
        </Button>

        <Button
          variant="default"
          size="default"
          className="md:hidden bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
          onClick={onOpenFilters}
        >
          <FunnelIcon className="h-5 w-5" aria-hidden="true" />
          <span>{t("headerFilters")}</span>
        </Button>
      </div>
    </header>
  );
}

import React from "react";
import { useI18n } from "../i18n/I18nContext";
import {
  QuestionMarkCircleIcon,
  ChartBarIcon,
  FunnelIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";
import { Button } from "./ui/button";

export default function Header({
  onOpenHelp,
  onOpenStats,
  onOpenFilters,
}) {
  const { lang, setLang, t } = useI18n();
  const toggleLang = () => setLang(lang === "cy" ? "en" : "cy");
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-2 bg-white/90 backdrop-blur border-b border-gray-300">
      <div className="flex items-center gap-2 min-w-0">
        <img
          src="/dragon.png"
          alt=""
          className="h-8 w-8 drop-shadow shrink-0"
          aria-hidden="true"
        />
        <h1 className="text-xl font-bold tracking-tight">
          Hyfforddwr <span className="text-emerald-800">Treiglad</span>
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="default"
          size="default"
          onClick={toggleLang}
          aria-label={t("headerSwitchLang")}
        >
          <LanguageIcon className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">EN/CY</span>
          <span className="sr-only">{t("headerSwitchLang")}</span>
        </Button>

        <Button
          variant="icon"
          size="icon"
          onClick={onOpenHelp}
          aria-label={t("headerHelp")}
        >
          <QuestionMarkCircleIcon className="h-5 w-5" aria-hidden="true" />
        </Button>

        <Button
          variant="icon"
          size="icon"
          onClick={onOpenStats}
          aria-label={t("headerStats")}
        >
          <ChartBarIcon className="h-5 w-5" aria-hidden="true" />
        </Button>

        <Button
          variant="default"
          size="default"
          className="md:hidden"
          onClick={onOpenFilters}
        >
          <FunnelIcon className="h-5 w-5" aria-hidden="true" />
          <span>{t("headerFilters")}</span>
        </Button>
      </div>
    </header>
  );
}

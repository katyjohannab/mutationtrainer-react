import React from "react";
import { useI18n } from "../i18n/I18nContext";
import {
  QuestionMarkCircleIcon,
  ChartBarIcon,
  FunnelIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";

export default function Header({
  onOpenHelp,
  onOpenStats,
  onOpenFilters,
}) {
  const { lang, setLang, t } = useI18n();
  const toggleLang = () => setLang(lang === "cy" ? "en" : "cy");
  const title = t("appTitle");
  const [titleFirst, ...titleRest] = title.split(" ");
  const titleTail = titleRest.join(" ");

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-2 bg-white/90 backdrop-blur border-b border-gray-300">
      <div className="flex items-center gap-2 min-w-0">
        <img
          src="/dragon.png"
          alt=""
          className="h-8 w-8 drop-shadow shrink-0"
          aria-hidden="true"
        />
        <h1 className="text-xl font-bold tracking-tight truncate">
          <span>{titleFirst}</span>
          {titleTail ? (
            <>
              {" "}
              <span className="text-emerald-800">{titleTail}</span>
            </>
          ) : null}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="mt-btn"
          onClick={toggleLang}
          aria-label={t("headerSwitchLang")}
        >
          <LanguageIcon className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">EN/CY</span>
          <span className="sr-only">{t("headerSwitchLang")}</span>
        </button>

        <button
          type="button"
          className="mt-iconbtn"
          onClick={onOpenHelp}
          aria-label={t("headerHelp")}
        >
          <QuestionMarkCircleIcon className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">{t("headerHelp")}</span>
        </button>

        <button
          type="button"
          className="mt-iconbtn"
          onClick={onOpenStats}
          aria-label={t("headerStats")}
        >
          <ChartBarIcon className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">{t("headerStats")}</span>
        </button>

        <button
          type="button"
          className="mt-btn md:hidden"
          onClick={onOpenFilters}
          aria-label={t("headerFilters")}
        >
          <FunnelIcon className="h-5 w-5" aria-hidden="true" />
          <span>{t("headerFilters")}</span>
        </button>
      </div>
    </header>
  );
}

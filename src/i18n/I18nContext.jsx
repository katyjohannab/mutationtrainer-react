// src/i18n/I18nContext.jsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { STRINGS } from "./strings";

const LS_KEY = "wm_lang";
const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved === "cy" || saved === "en") return saved;
    } catch {
      // ignore storage read errors
    }
    return "cy";
  });

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, lang);
    } catch (e) {
      console.warn("Failed to persist language", e);
    }
  }, [lang]);

  const t = useMemo(() => {
    return (key) => {
      const dict = STRINGS[lang] ?? STRINGS.cy;
      return dict[key] ?? key;
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}

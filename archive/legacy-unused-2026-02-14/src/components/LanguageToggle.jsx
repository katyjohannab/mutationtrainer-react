// src/components/LanguageToggle.jsx
import React from "react";
import { useI18n } from "../i18n/I18nContext";

export default function LanguageToggle() {
  const { lang, setLang } = useI18n();
  const baseButtonStyle = {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid hsl(var(--border))",
    cursor: "pointer",
    background: "hsl(var(--card))",
    color: "hsl(var(--foreground))",
    transition: "background 150ms ease, color 150ms ease",
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button
        onClick={() => setLang("cy")}
        style={{
          ...baseButtonStyle,
          background:
            lang === "cy" ? "hsl(var(--primary))" : "hsl(var(--card))",
          color:
            lang === "cy"
              ? "hsl(var(--primary-foreground))"
              : "hsl(var(--foreground))",
        }}
      >
        Cymraeg
      </button>
      <button
        onClick={() => setLang("en")}
        style={{
          ...baseButtonStyle,
          background:
            lang === "en" ? "hsl(var(--primary))" : "hsl(var(--card))",
          color:
            lang === "en"
              ? "hsl(var(--primary-foreground))"
              : "hsl(var(--foreground))",
        }}
      >
        English
      </button>
    </div>
  );
}

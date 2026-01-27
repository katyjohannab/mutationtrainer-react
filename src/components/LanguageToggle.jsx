// src/components/LanguageToggle.jsx
import React from "react";
import { useI18n } from "../i18n/I18nContext";

export default function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <button
        onClick={() => setLang("cy")}
        style={{
          padding: "6px 10px",
          borderRadius: 999,
          border: "1px solid #ccc",
          cursor: "pointer",
          background: lang === "cy" ? "#111" : "#fff",
          color: lang === "cy" ? "#fff" : "#111",
        }}
      >
        Cymraeg
      </button>
      <button
        onClick={() => setLang("en")}
        style={{
          padding: "6px 10px",
          borderRadius: 999,
          border: "1px solid #ccc",
          cursor: "pointer",
          background: lang === "en" ? "#111" : "#fff",
          color: lang === "en" ? "#fff" : "#111",
        }}
      >
        English
      </button>
    </div>
  );
}

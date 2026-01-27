import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { playPollySentence } from "../services/ttsPolly";

export default function HearButton({ text }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onClick = async () => {
    if (!text || busy) return;
    setErr("");
    setBusy(true);
    try {
      await playPollySentence(text);
    } catch (e) {
      setErr(e?.message || "TTS failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
      <button
        type="button"
        onClick={onClick}
        disabled={!text || busy}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #ccc",
          cursor: busy ? "wait" : "pointer",
          opacity: !text || busy ? 0.7 : 1,
          background: "#fff",
        }}
        aria-label={t("hear")}
        title={t("hear")}
      >
        🔊 {busy ? t("loading") : t("hear")}
      </button>

      {err ? <div style={{ fontSize: 12, color: "#b00020" }}>{err}</div> : null}
    </div>
  );
}

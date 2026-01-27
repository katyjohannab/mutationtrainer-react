import { useMemo } from "react";

export default function PracticeCardFeedback({
  sent,
  answer,
  onHear,
  t,
  hearLabel,
  loadingLabel,
  ttsLoading,
  ttsError,
  last,
  whyEn,
  whyCy,
  lang,
}) {
  const explanation = useMemo(() => {
    return lang === "cy" ? (whyCy || whyEn) : (whyEn || whyCy);
  }, [lang, whyEn, whyCy]);

  const outcomeText = useMemo(() => {
    if (!last) return "";
    if (last === "correct") return t("correct") || "✓ Correct";
    if (last === "wrong") {
      return `${t("notQuite") || "✗ Not quite"} (${t("expected") || "Expected"}: ${answer})`;
    }
    if (last === "revealed") {
      return `${t("revealed") || "👍 Revealed"}: ${answer}`;
    }
    if (last === "skipped") {
      return `${t("skipped") || "➡️ Skipped"} (${t("expected") || "Expected"}: ${answer})`;
    }
    return "";
  }, [answer, last, t]);

  const whyLabel = t("why") || "Why";

  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        background: "#f7f7f7",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={onHear}
          disabled={ttsLoading}
          style={{ padding: "10px 12px", borderRadius: 10 }}
        >
          {ttsLoading ? loadingLabel : hearLabel}
        </button>
        {ttsError ? (
          <div style={{ color: "#b00", fontSize: 13 }}>{ttsError}</div>
        ) : null}
      </div>

      <div style={{ marginTop: 10, fontSize: 18, lineHeight: 1.5 }}>
        <span>{sent?.before}</span>
        <span style={{ fontWeight: 800, padding: "0 6px" }}>{answer}</span>
        <span>{sent?.after}</span>
      </div>

      {outcomeText ? (
        <div style={{ marginTop: 10, fontWeight: 600 }}>
          <span style={{ fontWeight: 600 }}>{t("outcome") || "Outcome"}:</span>{" "}
          <span style={{ fontWeight: 400 }}>{outcomeText}</span>
        </div>
      ) : null}

      {explanation ? (
        <div style={{ marginTop: 10 }}>
          <span style={{ fontWeight: 600 }}>{whyLabel}:</span>
          <div style={{ marginTop: 6 }}>{explanation}</div>
        </div>
      ) : null}
    </div>
  );
}

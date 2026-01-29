import { useEffect, useMemo, useState } from "react";

export default function PracticeCardChoices({
  sent,
  answer,
  cardState,
  choices,
  disabled,
  showTranslate,
  translate,
  hintText,
  showHint,
  onToggleHint,
  onPick,
  onCheck,
  onReveal,
  onSkip,
  onNext,
  t,
  tooltipTranslate,
  tooltipWordCategory,
}) {
  const isFeedback = cardState === "feedback";
  const blankLabel = sent?.base || "_____";

  const tooltipKey = `${tooltipTranslate ?? ""}|${tooltipWordCategory ?? ""}`;
  const tooltipLines = useMemo(() => {
    const lines = [];
    if (tooltipTranslate) {
      lines.push({ label: "English", value: tooltipTranslate });
    }
    if (tooltipWordCategory) {
      lines.push({ label: "Category", value: tooltipWordCategory });
    }
    return lines;
  }, [tooltipTranslate, tooltipWordCategory]);

  const [tooltipOpen, setTooltipOpen] = useState(false);

  useEffect(() => {
    setTooltipOpen(false);
  }, [tooltipKey]);

  useEffect(() => {
    const handler = (event) => {
      if (disabled) return;
      if (event.key === "1" && choices[0]) {
        event.preventDefault();
        onPick?.(choices[0]);
      }
      if (event.key === "2" && choices[1]) {
        event.preventDefault();
        onPick?.(choices[1]);
      }
      if (event.key === "3" && choices[2]) {
        event.preventDefault();
        onPick?.(choices[2]);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [choices, disabled, onPick]);

  const toggleTooltip = () => setTooltipOpen((open) => !open);
  const openTooltip = () => setTooltipOpen(true);
  const closeTooltip = () => setTooltipOpen(false);

  const checkLabel = isFeedback ? (t("next") || "Next") : (t("check") || "Check");
  const hintLabel = t("hint") || "Hint";
  const revealLabel = t("reveal") || "Reveal";
  const skipLabel = t("skip") || "Skip";
  const nextLabel = t("next") || "Next";

  return (
    <>
      <div
        style={{
          fontSize: 18,
          lineHeight: 1.5,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
        }}
      >
        <span>{sent?.before}</span>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontWeight: 700, padding: "0 6px" }}>
            {isFeedback ? answer : blankLabel}
          </span>
          {tooltipLines.length > 0 ? (
            <div style={{ position: "relative", display: "inline-flex" }}>
              <button
                type="button"
                onClick={toggleTooltip}
                onFocus={openTooltip}
                onBlur={closeTooltip}
                aria-haspopup="true"
                aria-expanded={tooltipOpen}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  border: "1px solid #ccc",
                  background: "#fff",
                  padding: 0,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ?
              </button>
              {tooltipOpen ? (
                <div
                  role="tooltip"
                  style={{
                    position: "absolute",
                    top: "110%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                    padding: "8px 10px",
                    marginTop: 6,
                    zIndex: 5,
                    minWidth: 160,
                  }}
                >
                  {tooltipLines.map(({ label, value }, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: 12,
                        marginBottom: idx < tooltipLines.length - 1 ? 4 : 0,
                      }}
                    >
                      <span style={{ fontWeight: 600, marginRight: 4 }}>
                        {label}:
                      </span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <span>{sent?.after}</span>
      </div>

      {showTranslate ? (
        <div style={{ marginTop: 6, color: "#555", fontSize: 13 }}>
          {translate}
        </div>
      ) : null}

      <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
        {choices.map((choice, idx) => (
          <button
            key={`${choice}-${idx}`}
            type="button"
            disabled={disabled}
            onClick={() => onPick?.(choice)}
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "#fff",
              fontSize: 16,
              textAlign: "left",
              cursor: disabled ? "default" : "pointer",
              opacity: disabled ? 0.6 : 1,
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}
          >
            {idx + 1}. {choice}
          </button>
        ))}
      </div>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button type="button" onClick={onCheck} style={{ padding: "10px 12px", borderRadius: 10 }}>
          {checkLabel}
        </button>

        <button type="button" onClick={onToggleHint} style={{ padding: "10px 12px", borderRadius: 10 }}>
          {hintLabel}
        </button>

        <button
          type="button"
          onClick={onReveal}
          disabled={isFeedback}
          style={{ padding: "10px 12px", borderRadius: 10 }}
        >
          {revealLabel}
        </button>

        <button
          type="button"
          onClick={onSkip}
          disabled={isFeedback}
          style={{ padding: "10px 12px", borderRadius: 10 }}
        >
          {skipLabel}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!isFeedback}
          style={{ padding: "10px 12px", borderRadius: 10 }}
        >
          {nextLabel}
        </button>
      </div>

      {showHint && hintText ? (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 10,
            background: "#f7f7f7",
          }}
        >
          {hintText}
        </div>
      ) : null}
    </>
  );
}

// src/components/PracticeCard.jsx
import { useEffect, useMemo, useState } from "react";
import { checkAnswer } from "../utils/checkAnswer";
import { useI18n } from "../i18n/I18nContext";
import { playPollyForCard } from "../services/ttsPolly";

function buildSentence(row) {
  const before = row?.before ?? row?.Before ?? "";
  const after = row?.after ?? row?.After ?? "";
  const base = row?.base ?? row?.Base ?? "";
  return { before, after, base };
}

export default function PracticeCard({ row, onResult }) {
  const { t, lang } = useI18n();

  const [guess, setGuess] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [last, setLast] = useState(null); // "correct" | "wrong" | "revealed" | "skipped"

  // TTS (always Welsh)
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState("");

  const sent = useMemo(() => buildSentence(row), [row]);

  useEffect(() => {
    setGuess("");
    setShowHint(false);
    setRevealed(false);
    setLast(null);
    setTtsError("");
    setTtsLoading(false);
  }, [row]);

  if (!row) return null;

  const answer = row?.answer ?? row?.Answer ?? "";

  // explanations baked into CSV
  const whyEn = row?.why ?? row?.Why ?? "";
  const whyCy = row?.whyCym ?? row?.["Why-Cym"] ?? row?.WhyCym ?? "";

  // pick by UI language (fallback if missing)
  const explanation = lang === "cy" ? (whyCy || whyEn) : (whyEn || whyCy);

  // English translation sentence: show only in EN mode
  const translate = row?.translateSent ?? row?.TranslateSent ?? "";
  const showTranslate = lang === "en" && Boolean(translate);

  // v1 hint: first letter of correct answer
  const firstLetter = (String(answer).trim()[0] || "").toUpperCase();
  const hintText = firstLetter ? `${t("hint") || "Hint"}: ${firstLetter}…` : "";

  const disabledInput = revealed;

  const goNext = () => {
    onResult?.({ result: "next" });
  };

  const onCheck = () => {
    // If already revealed, treat as Next
    if (revealed) {
      goNext();
      return;
    }

    const ok = checkAnswer(row, guess);
    const result = ok ? "correct" : "wrong";

    setRevealed(true);
    setLast(result);
    onResult?.({ result, guess, expected: answer });
  };

  const onReveal = () => {
    if (revealed) return;
    setRevealed(true);
    setLast("revealed");
    onResult?.({ result: "revealed", guess, expected: answer });
  };

  const onSkip = () => {
    if (revealed) return;
    setRevealed(true);
    setLast("skipped");
    onResult?.({ result: "skipped", guess: "", expected: answer });
  };

  const onHear = async () => {
    if (!revealed || ttsLoading) return;
    setTtsError("");
    setTtsLoading(true);
    try {
      // ALWAYS speak Welsh
      await playPollyForCard(row, "cy");
    } catch (e) {
      setTtsError(e?.message || "TTS failed.");
    } finally {
      setTtsLoading(false);
    }
  };

  const hearLabel = (t("hear") || "Hear").trim();
  const loadingLabel = (t("loading") || "Loading…").trim();

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginTop: 12 }}>
      {/* Sentence line (question view) */}
      <div style={{ fontSize: 18, lineHeight: 1.5 }}>
        <span>{sent.before}</span>
        <span style={{ fontWeight: 700, padding: "0 6px" }}>
          {revealed ? (
            answer
          ) : (
            <span style={{ color: "#666", fontStyle: "italic" }}>
              {sent.base || "_____"}
            </span>
          )}
        </span>
        <span>{sent.after}</span>
      </div>

      {showTranslate ? (
        <div style={{ marginTop: 6, color: "#555", fontSize: 13 }}>
          {translate}
        </div>
      ) : null}

      {/* Controls (always visible) */}
      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={disabledInput}
          placeholder={t("placeholderType") || "Type the mutated form…"}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ccc",
            minWidth: 240,
            opacity: disabledInput ? 0.7 : 1,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCheck();
          }}
        />

        {/* Check becomes Next after revealed */}
        <button onClick={onCheck} style={{ padding: "10px 12px", borderRadius: 10 }}>
          {revealed ? (t("next") || "Next") : (t("check") || "Check")}
        </button>

        <button
          onClick={() => setShowHint((s) => !s)}
          style={{ padding: "10px 12px", borderRadius: 10 }}
        >
          {t("hint") || "Hint"}
        </button>

        <button onClick={onReveal} disabled={revealed} style={{ padding: "10px 12px", borderRadius: 10 }}>
          {t("reveal") || "Reveal"}
        </button>

        <button onClick={onSkip} disabled={revealed} style={{ padding: "10px 12px", borderRadius: 10 }}>
          {t("skip") || "Skip"}
        </button>

        <button onClick={goNext} disabled={!revealed} style={{ padding: "10px 12px", borderRadius: 10 }}>
          {t("next") || "Next"}
        </button>
      </div>

      {/* Hint */}
      {showHint && hintText ? (
        <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: "#f7f7f7" }}>
          {hintText}
        </div>
      ) : null}

      {/* Feedback card area (only when revealed) */}
      {revealed ? (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "#f7f7f7" }}>
          {/* HEAR lives here */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={onHear}
              disabled={ttsLoading}
              style={{ padding: "10px 12px", borderRadius: 10 }}
            >
              {ttsLoading ? loadingLabel : hearLabel}
            </button>

            {ttsError ? <div style={{ color: "#b00", fontSize: 13 }}>{ttsError}</div> : null}
          </div>

          {/* Full correct sentence */}
          <div style={{ marginTop: 10, fontSize: 18, lineHeight: 1.5 }}>
            <span>{sent.before}</span>
            <span style={{ fontWeight: 800, padding: "0 6px" }}>{answer}</span>
            <span>{sent.after}</span>
          </div>

          {/* Why */}
          {explanation ? (
            <div style={{ marginTop: 10 }}>
              <b>{t("why") || "Why"}:</b> {explanation}
            </div>
          ) : null}

          {/* Result line */}
          {last ? (
            <div style={{ marginTop: 10, fontWeight: 600 }}>
              {last === "correct" ? (t("correct") || "✅ Correct") : null}
              {last === "wrong"
                ? `${t("notQuite") || "❌ Not quite"} (${t("expected") || "Expected"}: ${answer})`
                : null}
              {last === "revealed"
                ? `${t("revealed") || "👁️ Revealed"}: ${answer}`
                : null}
              {last === "skipped"
                ? `${t("skipped") || "⏭️ Skipped"} (${t("expected") || "Expected"}: ${answer})`
                : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

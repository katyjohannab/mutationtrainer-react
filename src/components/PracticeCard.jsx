import { useEffect, useMemo, useState } from "react";
import { checkAnswer } from "../utils/checkAnswer";
import { useI18n } from "../i18n/I18nContext";

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

  const sent = useMemo(() => buildSentence(row), [row]);

  useEffect(() => {
    setGuess("");
    setShowHint(false);
    setRevealed(false);
    setLast(null);
  }, [row]);

  if (!row) return null;

  const answer = row?.answer ?? row?.Answer ?? "";

  // Explanations 
  // English: Why
  // Welsh:   Why-Cym  (normalised to whyCym by loader)
  const whyEn = row?.why ?? row?.Why ?? "";
  const whyCy = row?.whyCym ?? row?.["Why-Cym"] ?? row?.WhyCym ?? "";

  // Preferred explanation depends on lang, but we fall back if missing.
  const explanation =
    lang === "cy" ? (whyCy || whyEn) : (whyEn || whyCy);

  // English translation sentence: only show in EN mode (recommended)
  const translate = row?.translateSent ?? row?.TranslateSent ?? "";
  const showTranslate = lang === "en" && Boolean(translate);

  const onCheck = () => {
    const ok = checkAnswer(row, guess);
    const result = ok ? "correct" : "wrong";
    setLast(result);
    onResult?.({ result, guess, expected: answer });
  };

  const onReveal = () => {
    setRevealed(true);
    setLast("revealed");
    onResult?.({ result: "revealed", guess, expected: answer });
  };

  const onSkip = () => {
    setRevealed(true);
    setLast("skipped");
    onResult?.({ result: "skipped", guess: "", expected: answer });
  };

  const onNext = () => {
    onResult?.({ result: "next" });
  };

  const disabledInput = revealed || last === "correct";

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginTop: 12 }}>
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

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={disabledInput}
          placeholder={t("placeholderType")}
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

        <button onClick={onCheck} disabled={disabledInput} style={{ padding: "10px 12px", borderRadius: 10 }}>
          {t("check")}
        </button>

        <button onClick={() => setShowHint((s) => !s)} style={{ padding: "10px 12px", borderRadius: 10 }}>
          {t("hint")}
        </button>

        <button onClick={onReveal} disabled={revealed} style={{ padding: "10px 12px", borderRadius: 10 }}>
          {t("reveal")}
        </button>

        <button onClick={onSkip} disabled={revealed} style={{ padding: "10px 12px", borderRadius: 10 }}>
          {t("skip")}
        </button>

        <button onClick={onNext} style={{ padding: "10px 12px", borderRadius: 10 }}>
          {t("next")}
        </button>
      </div>

      {showHint && explanation ? (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#f7f7f7" }}>
          <div>
            <b>{t("why")}:</b> {explanation}
          </div>
        </div>
      ) : null}

      {last ? (
        <div style={{ marginTop: 10, fontWeight: 600 }}>
          {last === "correct" ? t("correct") : null}
          {last === "wrong" ? `${t("notQuite")} (${t("expected")}: ${answer})` : null}
          {last === "revealed" ? `${t("revealed")}: ${answer}` : null}
          {last === "skipped" ? `${t("skipped")} (${t("expected")}: ${answer})` : null}
        </div>
      ) : null}
    </div>
  );
}

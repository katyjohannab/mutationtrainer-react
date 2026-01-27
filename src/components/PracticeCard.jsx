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

  // explanations baked into CSV
  const whyEn = row?.why ?? row?.Why ?? "";
  const whyCy = row?.whyCym ?? row?.["Why-Cym"] ?? row?.WhyCym ?? "";

  // pick by language (fallback if missing)
  const explanation = lang === "cy" ? (whyCy || whyEn) : (whyEn || whyCy);

  // English translation sentence: show only in EN mode
  const translate = row?.translateSent ?? row?.TranslateSent ?? "";
  const showTranslate = lang === "en" && Boolean(translate);

  // v1 hint: first letter of correct answer (without revealing full answer)
  const firstLetter = (String(answer).trim()[0] || "").toUpperCase();
  const hintText = firstLetter ? `${t("hint")}: ${firstLetter}…` : "";

  const disabledInput = revealed; // once revealed, lock it

  const goNext = () => {
    onResult?.({ result: "next" });
  };

  const onCheck = () => {
    // if already revealed, treat as Next (nice UX)
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
          placeholder={t("placeholderType") ?? "Type the mutated form…"}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ccc",
            minWidth: 240,
            opacity: disabledInput ? 0.7 : 1,
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // Enter: Check when not revealed, Next when revealed
              onCheck();
            }
          }}
        />

        {/* Check becomes Next after revealed */}
        <button onClick={onCheck} style={{ padding: "10px 12px", borderRadius: 10 }}>
          {revealed ? t("next") : t("check")}
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

        {/* Explicit Next button too (optional but clear) */}
        <button onClick={goNext} disabled={!revealed} style={{ padding: "10px 12px", borderRadius: 10 }}>
          {t("next")}
        </button>
      </div>

      {/* Hint (first-letter) */}
      {showHint && hintText ? (
        <div style={{ marginTop: 10, padding: 10, borderRadius: 10, background: "#f7f7f7" }}>
          {hintText}
        </div>
      ) : null}

      {/* Explanation: show only once revealed OR when user asks for hint  */}
      {revealed && explanation ? (
        <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: "#f7f7f7" }}>
          <div>
            <b>{t("why")}:</b> {explanation}
          </div>
        </div>
      ) : null}

      {/* Feedback */}
      {last ? (
        <div style={{ marginTop: 10, fontWeight: 600 }}>
          {last === "correct" ? t("correct") : null}
          {last === "wrong" ? `${t("notQuite")} (${t("expected")}: ${answer})` : null}
          {last === "revealed" ? `${t("revealed") ?? "👁️ Revealed"}: ${answer}` : null}
          {last === "skipped" ? `${t("skipped") ?? "⏭️ Skipped"} (${t("expected")}: ${answer})` : null}
        </div>
      ) : null}
    </div>
  );
}

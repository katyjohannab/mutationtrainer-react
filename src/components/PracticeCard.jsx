// src/components/PracticeCard.jsx
import { useEffect, useMemo, useState } from "react";
import { checkAnswer } from "../utils/checkAnswer";

function buildSentence(row) {
  const before = row?.before ?? row?.Before ?? "";
  const after = row?.after ?? row?.After ?? "";
  const base = row?.base ?? row?.Base ?? "";
  return { before, after, base };
}

export default function PracticeCard({ row, onResult }) {
  const [guess, setGuess] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [last, setLast] = useState(null); // "correct" | "wrong" | "revealed" | "skipped"

  const sent = useMemo(() => buildSentence(row), [row]);

  useEffect(() => {
    // reset when card changes
    setGuess("");
    setShowHint(false);
    setRevealed(false);
    setLast(null);
  }, [row]);

  if (!row) return null;

  const answer = row?.answer ?? row?.Answer ?? "";
  const why = row?.why ?? row?.Why ?? "";
  const whyCym = row?.whyCym ?? row?.["Why-Cym"] ?? row?.WhyCym ?? "";
  const translate = row?.translateSent ?? row?.TranslateSent ?? "";

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
          {revealed ? answer : "_____"}
        </span>
        <span>{sent.after}</span>
      </div>

      {translate ? (
        <div style={{ marginTop: 6, color: "#555", fontSize: 13 }}>
          {translate}
        </div>
      ) : null}

      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={disabledInput}
          placeholder="Type the mutated form…"
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
          Check
        </button>

        <button onClick={() => setShowHint((s) => !s)} style={{ padding: "10px 12px", borderRadius: 10 }}>
          Hint
        </button>

        <button onClick={onReveal} disabled={revealed} style={{ padding: "10px 12px", borderRadius: 10 }}>
          Reveal
        </button>

        <button onClick={onSkip} disabled={revealed} style={{ padding: "10px 12px", borderRadius: 10 }}>
          Skip
        </button>

        <button onClick={onNext} style={{ padding: "10px 12px", borderRadius: 10 }}>
          Next
        </button>
      </div>

      {showHint && (why || whyCym) ? (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#f7f7f7" }}>
          {why ? <div style={{ marginBottom: 8 }}><b>Why:</b> {why}</div> : null}
          {whyCym ? <div><b>Pam:</b> {whyCym}</div> : null}
        </div>
      ) : null}

      {last ? (
        <div style={{ marginTop: 10, fontWeight: 600 }}>
          {last === "correct" ? "✅ Correct" : null}
          {last === "wrong" ? `❌ Not quite (expected: ${answer})` : null}
          {last === "revealed" ? `👁️ Revealed: ${answer}` : null}
          {last === "skipped" ? `⏭️ Skipped (answer: ${answer})` : null}
        </div>
      ) : null}
    </div>
  );
}

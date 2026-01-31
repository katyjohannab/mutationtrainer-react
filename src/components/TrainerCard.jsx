import React from "react";
import { useTrainer } from "../state/TrainerContext";

export default function TrainerCard() {
  const {
    state,
    currentCard,
    checkAnswer,
    nextCard,
    reveal,
    setAnswer,
  } = useTrainer();

  const surfaceStyle = {
    marginTop: 16,
    padding: 12,
    border: "1px solid hsl(var(--border))",
    borderRadius: 12,
    background: "hsl(var(--card))",
    color: "hsl(var(--foreground))",
  };

  const pillStyle = {
    fontSize: 12,
    padding: "3px 8px",
    border: "1px solid hsl(var(--border))",
    borderRadius: 999,
    background: "hsl(var(--neutral) / 0.2)",
  };

  const actionButtonStyle = {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--card))",
    color: "hsl(var(--foreground))",
    cursor: "pointer",
    transition: "background 150ms ease, color 150ms ease",
  };

  if (!currentCard) {
    return <div style={surfaceStyle}>No cards in the current selection.</div>;
  }

  const before = currentCard.before ?? currentCard.Before ?? "";
  const after = currentCard.after ?? currentCard.After ?? "";
  const expected = currentCard.answer ?? currentCard.Answer ?? "";
  const why = currentCard.why ?? currentCard.Why ?? "";
  const whyCym = currentCard.whyCym ?? currentCard["Why-Cym"] ?? currentCard.WhyCym ?? "";

  const family = currentCard.family ?? currentCard.RuleFamily ?? "";
  const category = currentCard.category ?? currentCard.RuleCategory ?? "";
  const trigger = currentCard.trigger ?? currentCard.Trigger ?? "";
  const base = currentCard.base ?? currentCard.Base ?? "";
  const source = currentCard.__source ?? "";

  return (
    <section style={surfaceStyle}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <span style={pillStyle}>
          {source}
        </span>
        {family ? <span style={{ fontSize: 12, opacity: 0.8 }}>Family: <b>{family}</b></span> : null}
        {category ? <span style={{ fontSize: 12, opacity: 0.8 }}>Category: <b>{category}</b></span> : null}
        {trigger ? <span style={{ fontSize: 12, opacity: 0.8 }}>Trigger: <b>{trigger}</b></span> : null}
        {base ? <span style={{ fontSize: 12, opacity: 0.8 }}>Base: <b>{base}</b></span> : null}
      </div>

      <div style={{ fontSize: 18, lineHeight: 1.5, marginBottom: 12 }}>
        <span>{before}</span>
        <input
          value={state.userAnswer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type mutation…"
          style={{
            margin: "0 8px",
            padding: "6px 10px",
            borderRadius: 10,
            border: "1px solid hsl(var(--border))",
            minWidth: 160,
          }}
        />
        <span>{after}</span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={checkAnswer} style={actionButtonStyle}>
          Check
        </button>

        <button onClick={reveal} style={actionButtonStyle}>
          Reveal
        </button>

        <button onClick={nextCard} style={actionButtonStyle}>
          Next
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        {state.checked ? (
          state.isCorrect ? (
            <div
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid hsl(var(--primary) / 0.4)",
                background: "hsl(var(--primary) / 0.1)",
              }}
            >
              ✅ Correct
            </div>
          ) : (
            <div
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid hsl(var(--destructive) / 0.4)",
                background: "hsl(var(--destructive) / 0.08)",
              }}
            >
              ❌ Not quite. Correct answer: <b>{expected}</b>
            </div>
          )
        ) : null}

        {state.revealed ? (
          <div
            style={{
              marginTop: 10,
              padding: 10,
              borderRadius: 10,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
            }}
          >
            <div>
              <b>Answer:</b> {expected}
            </div>
            {why ? (
              <div style={{ marginTop: 6 }}>
                <b>Why (EN):</b> {why}
              </div>
            ) : null}
            {whyCym ? (
              <div style={{ marginTop: 6 }}>
                <b>Pam (CY):</b> {whyCym}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
        Session: seen <b>{state.session.seen}</b>, correct <b>{state.session.correct}</b>, wrong <b>{state.session.wrong}</b>
      </div>
    </section>
  );
}

import React from "react";
import { useTrainer } from "../state/TrainerContext";

export default function ModeToggle() {
  const { state, setMode } = useTrainer();
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
    <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ fontSize: 12, opacity: 0.8 }}>Mode:</span>

      <button
        onClick={() => setMode("random")}
        style={{
          ...baseButtonStyle,
          background:
            state.mode === "random"
              ? "hsl(var(--primary))"
              : "hsl(var(--card))",
          color:
            state.mode === "random"
              ? "hsl(var(--primary-foreground))"
              : "hsl(var(--foreground))",
        }}
      >
        Random
      </button>

      <button
        onClick={() => setMode("smart")}
        style={{
          ...baseButtonStyle,
          background:
            state.mode === "smart"
              ? "hsl(var(--primary))"
              : "hsl(var(--card))",
          color:
            state.mode === "smart"
              ? "hsl(var(--primary-foreground))"
              : "hsl(var(--foreground))",
        }}
      >
        Smart (Leitner)
      </button>
    </div>
  );
}

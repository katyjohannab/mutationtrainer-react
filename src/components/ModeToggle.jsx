import React from "react";
import { useTrainer } from "../state/TrainerContext";

export default function ModeToggle() {
  const { state, setMode } = useTrainer();

  return (
    <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ fontSize: 12, opacity: 0.8 }}>Mode:</span>

      <button
        onClick={() => setMode("random")}
        style={{
          padding: "6px 10px",
          borderRadius: 999,
          border: "1px solid #ccc",
          cursor: "pointer",
          background: state.mode === "random" ? "#111" : "#fff",
          color: state.mode === "random" ? "#fff" : "#111",
        }}
      >
        Random
      </button>

      <button
        onClick={() => setMode("smart")}
        style={{
          padding: "6px 10px",
          borderRadius: 999,
          border: "1px solid #ccc",
          cursor: "pointer",
          background: state.mode === "smart" ? "#111" : "#fff",
          color: state.mode === "smart" ? "#fff" : "#111",
        }}
      >
        Smart (Leitner)
      </button>
    </div>
  );
}

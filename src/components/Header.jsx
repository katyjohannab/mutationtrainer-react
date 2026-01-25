import React from "react";
import { useTrainer } from "../state/TrainerContext";

export default function Header() {
  const { state, preset, dispatch } = useTrainer();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <div style={{ fontWeight: 700 }}>MutationTrainer React</div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {preset ? (
          <span
            style={{
              fontSize: 12,
              padding: "4px 10px",
              border: "1px solid #ccc",
              borderRadius: 999,
            }}
            title="Preset focus is active"
          >
            Focus: {preset.title}
          </span>
        ) : (
          <span style={{ fontSize: 12, opacity: 0.7 }}>No focus preset</span>
        )}

        {state.activePresetId ? (
          <button
            onClick={() => dispatch({ type: "CLEAR_PRESET" })}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "#fff",
            }}
          >
            Clear focus
          </button>
        ) : null}
      </div>
    </div>
  );
}

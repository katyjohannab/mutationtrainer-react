import React from "react";
import { PRESET_DEFS, PRESET_ORDER } from "../data/presets";
import { useTrainer } from "../state/TrainerContext";

export default function PresetPacks() {
  const { state, dispatch } = useTrainer();

  return (
    <div>
      <h2 style={{ margin: "12px 0 8px" }}>Preset packs</h2>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {PRESET_ORDER.map((id) => {
          const isOn = id === state.activePresetId;
          const preset = PRESET_DEFS[id];

          return (
            <button
              key={id}
              onClick={() =>
                dispatch({ type: isOn ? "CLEAR_PRESET" : "APPLY_PRESET", presetId: id })
              }
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid #ccc",
                cursor: "pointer",
                background: isOn ? "#111" : "#fff",
                color: isOn ? "#fff" : "#111",
              }}
              title={preset.description}
            >
              {preset.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

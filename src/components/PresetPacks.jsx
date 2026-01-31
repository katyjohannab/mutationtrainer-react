import React from "react";
import { PRESET_DEFS, PRESET_ORDER } from "../data/presets";
import { useTrainer } from "../state/TrainerContext";
import { badgeVariants } from "./ui/badge";

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
              className={`${badgeVariants({ variant: isOn ? "default" : "soft" })} cursor-pointer rounded-full px-3 py-2 text-sm transition-colors ${isOn ? "ring-1 ring-primary/30" : ""}`}
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

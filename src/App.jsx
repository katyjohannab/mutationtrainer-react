import { useEffect, useMemo, useState } from "react";
import { PRESET_DEFS, PRESET_ORDER } from "./data/presets";
import { ALL_CSV_FILES } from "./data/csvSources";
import { loadManyCsvFiles } from "./services/loadCsv";
import { applyFilters } from "./utils/applyFilters";

export default function App() {
  const [rows, setRows] = useState([]);
  const [activePresetId, setActivePresetId] = useState(null);

  // Load all CSV files (combined dataset)
  useEffect(() => {
    loadManyCsvFiles(ALL_CSV_FILES)
      .then(setRows)
      .catch((e) => console.error(e));
  }, []);

  const preset = activePresetId ? PRESET_DEFS[activePresetId] : null;

  const filtered = useMemo(() => {
    return applyFilters(rows, { preset });
  }, [rows, preset]);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <h1>MutationTrainer React (Step 1)</h1>

      <p>
        Loaded rows: <b>{rows.length}</b> | After filters: <b>{filtered.length}</b>
      </p>

      <h2>Preset packs</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {PRESET_ORDER.map((id) => {
          const isOn = id === activePresetId;
          return (
            <button
              key={id}
              onClick={() => setActivePresetId(isOn ? null : id)}
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid #ccc",
                cursor: "pointer",
                background: isOn ? "#111" : "#fff",
                color: isOn ? "#fff" : "#111",
              }}
            >
              {PRESET_DEFS[id].title}
            </button>
          );
        })}
      </div>

      <h2 style={{ marginTop: 16 }}>First 3 cards (debug)</h2>
      <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
        {JSON.stringify(filtered.slice(0, 3), null, 2)}
      </pre>
    </div>
  );
}

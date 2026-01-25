import { useEffect, useMemo, useRef, useState } from "react";
import { PRESET_DEFS, PRESET_ORDER } from "./data/presets";
import { ALL_CSV_FILES } from "./data/csvSources";
import { loadManyCsvFiles } from "./services/loadCsv";
import { applyFilters } from "./utils/applyFilters";

import PracticeCard from "./components/PracticeCard";
import { loadLeitnerMap, updateLeitner } from "./utils/leitner";
import { getCardKey, pickRandomIndex, pickSmartIndex } from "./utils/pickNext";

export default function App() {
  const [rows, setRows] = useState([]);
  const [activePresetId, setActivePresetId] = useState(null);

  const [mode, setMode] = useState("random"); // "random" | "smart"
  const [leitnerMap, setLeitnerMap] = useState(() => loadLeitnerMap());

  const [currentIdx, setCurrentIdx] = useState(-1);

  // keep a small “recently shown” set to avoid annoying repeats in random mode
  const recentRef = useRef([]);
  const recentSet = useMemo(() => new Set(recentRef.current), [currentIdx]);

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

  // choose an initial card whenever the deck changes
  useEffect(() => {
    if (!filtered.length) {
      setCurrentIdx(-1);
      return;
    }
    const idx = mode === "smart"
      ? pickSmartIndex(filtered, leitnerMap)
      : pickRandomIndex(filtered, new Set());
    setCurrentIdx(idx);
    recentRef.current = [];
  }, [filtered, mode]); // intentionally not depending on leitnerMap to avoid jumpiness

  const currentRow = currentIdx >= 0 ? filtered[currentIdx] : null;

  function pushRecent(key) {
    const arr = recentRef.current;
    arr.push(key);
    // cap to last ~12
    while (arr.length > 12) arr.shift();
    recentRef.current = arr;
  }

  function pickNext(nextLeitnerMap) {
    if (!filtered.length) return;

    const idx = mode === "smart"
      ? pickSmartIndex(filtered, nextLeitnerMap)
      : pickRandomIndex(filtered, new Set(recentRef.current));

    setCurrentIdx(idx);
  }

  function onResult({ result, guess, expected }) {
    // "next" is just navigation; do not update Leitner
    if (result === "next") {
      pickNext(leitnerMap);
      return;
    }

    // update Leitner for smart scheduling (also harmless in random mode)
    const key = getCardKey(currentRow, currentIdx);
    pushRecent(key);

    const nextMap = updateLeitner(leitnerMap, key, result === "wrong" ? "wrong" : result);
    setLeitnerMap(nextMap);

    // move on after any “terminal” result
    if (result === "correct" || result === "wrong" || result === "revealed" || result === "skipped") {
      pickNext(nextMap);
    }
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <h1>MutationTrainer React</h1>

      <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <b>Mode:</b>{" "}
          <button
            onClick={() => setMode("random")}
            style={{ padding: "6px 10px", borderRadius: 999, marginRight: 6, background: mode === "random" ? "#111" : "#fff", color: mode === "random" ? "#fff" : "#111" }}
          >
            Random
          </button>
          <button
            onClick={() => setMode("smart")}
            style={{ padding: "6px 10px", borderRadius: 999, background: mode === "smart" ? "#111" : "#fff", color: mode === "smart" ? "#fff" : "#111" }}
          >
            Smart (Leitner)
          </button>
        </div>

        <div>
          Loaded: <b>{rows.length}</b> | Deck: <b>{filtered.length}</b>
        </div>
      </div>

      <h2 style={{ marginTop: 16 }}>Preset packs</h2>
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

      <h2 style={{ marginTop: 16 }}>Practice</h2>
      {!currentRow ? (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
          No cards available. Check your filters/preset.
        </div>
      ) : (
        <PracticeCard row={currentRow} onResult={onResult} />
      )}
    </div>
  );
}

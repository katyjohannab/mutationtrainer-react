import { useEffect, useMemo, useRef, useState } from "react";
import { PRESET_DEFS, PRESET_ORDER } from "./data/presets";
import { ALL_CSV_FILES } from "./data/csvSources";
import { loadManyCsvFiles } from "./services/loadCsv";
import { applyFilters } from "./utils/applyFilters";

import PracticeCard from "./components/PracticeCard";
import LanguageToggle from "./components/LanguageToggle";
import { useI18n } from "./i18n/I18nContext";

import { loadLeitnerMap, updateLeitner } from "./utils/leitner";
import { getCardKey, pickRandomIndex, pickSmartIndex } from "./utils/pickNext";

export default function App() {
  const { t } = useI18n();

  const [rows, setRows] = useState([]);
  const [activePresetId, setActivePresetId] = useState(null);

  const [mode, setMode] = useState("random"); // "random" | "smart"
  const [leitnerMap, setLeitnerMap] = useState(() => loadLeitnerMap());

  const [currentIdx, setCurrentIdx] = useState(-1);

  // avoid annoying repeats in random mode
  const recentRef = useRef([]);
  // always have the latest Leitner map available synchronously
  const leitnerRef = useRef(leitnerMap);

  useEffect(() => {
    leitnerRef.current = leitnerMap;
  }, [leitnerMap]);

  useEffect(() => {
    loadManyCsvFiles(ALL_CSV_FILES)
      .then(setRows)
      .catch((e) => console.error(e));
  }, []);

  const preset = activePresetId ? PRESET_DEFS[activePresetId] : null;

  const filtered = useMemo(() => {
    return applyFilters(rows, { preset });
  }, [rows, preset]);

  const currentRow = currentIdx >= 0 ? filtered[currentIdx] : null;

  function pushRecent(key) {
    const arr = recentRef.current;
    arr.push(key);
    while (arr.length > 12) arr.shift();
    recentRef.current = arr;
  }

  function pickNext(mapToUse) {
    if (!filtered.length) return;

    const idx =
      mode === "smart"
        ? pickSmartIndex(filtered, mapToUse)
        : pickRandomIndex(filtered, new Set(recentRef.current));

    setCurrentIdx(idx);
  }

  // Pick an initial card ONLY when the deck or mode changes.
  // CRITICAL: do NOT depend on leitnerMap here, or it will jump on Check.
  useEffect(() => {
    if (!filtered.length) {
      setCurrentIdx(-1);
      recentRef.current = [];
      return;
    }

    // If currentIdx is invalid for the new deck, re-pick.
    if (currentIdx >= filtered.length || currentIdx < 0) {
      const idx =
        mode === "smart"
          ? pickSmartIndex(filtered, leitnerRef.current)
          : pickRandomIndex(filtered, new Set());
      setCurrentIdx(idx);
      recentRef.current = [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, mode]); // <-- NO leitnerMap

  function onResult(payload) {
    const result = payload?.result;

    // Only "next" advances
    if (result === "next") {
      pickNext(leitnerRef.current);
      return;
    }

    // grading only: update Leitner but do NOT navigate
    if (!currentRow) return;

    const key = getCardKey(currentRow, currentIdx);
    pushRecent(key);

    const nextMap = updateLeitner(leitnerRef.current, key, result);
    setLeitnerMap(nextMap);

    // IMPORTANT: no pickNext() here
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ margin: 0 }}>{t("appTitle")}</h1>
        <LanguageToggle />
      </div>

      <div
        style={{
          marginTop: 10,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <b>{t("mode")}:</b>{" "}
          <button
            onClick={() => setMode("random")}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              marginRight: 6,
              border: "1px solid #ccc",
              cursor: "pointer",
              background: mode === "random" ? "#111" : "#fff",
              color: mode === "random" ? "#fff" : "#111",
            }}
          >
            {t("random")}
          </button>
          <button
            onClick={() => setMode("smart")}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid #ccc",
              cursor: "pointer",
              background: mode === "smart" ? "#111" : "#fff",
              color: mode === "smart" ? "#fff" : "#111",
            }}
          >
            {t("smart")}
          </button>
        </div>

        <div>
          {t("loaded")}: <b>{rows.length}</b> | {t("deck")}:{" "}
          <b>{filtered.length}</b>
        </div>
      </div>

      <h2 style={{ marginTop: 16 }}>{t("presetPacks")}</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {PRESET_ORDER.map((id) => {
          const isOn = id === activePresetId;
          const def = PRESET_DEFS[id];
          const label = def?.titleKey ? t(def.titleKey) : def?.title ?? id;

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
              {label}
            </button>
          );
        })}
      </div>

      <h2 style={{ marginTop: 16 }}>{t("practice")}</h2>
      {!currentRow ? (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 12,
          }}
        >
          {t("noCards")}
        </div>
      ) : (
        <PracticeCard row={currentRow} onResult={onResult} />
      )}
    </div>
  );
}

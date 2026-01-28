import { useEffect, useMemo, useRef, useState } from "react";
import { PRESET_DEFS, PRESET_ORDER } from "./data/presets";
import { ALL_CSV_FILES } from "./data/csvSources";
import { loadManyCsvFiles } from "./services/loadCsv";
import { applyFilters } from "./utils/applyFilters";

import PracticeCard from "./components/PracticeCard";
import Header from "./components/Header";
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

  const presetTitle = preset
    ? preset.titleKey
      ? t(preset.titleKey)
      : preset.title ?? null
    : null;

  return (
    <div className="min-h-full">
      <Header
        presetTitle={presetTitle}
        hasActivePreset={Boolean(activePresetId)}
        onClearPreset={() => setActivePresetId(null)}
        onOpenHelp={() => {}}
        onOpenStats={() => {}}
        onOpenFilters={() => {}}
      />

      <div className="mx-auto max-w-5xl px-4 py-4">
        {/* Mode + counts */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">
              {t("mode")}:
            </span>

            <button
              type="button"
              onClick={() => setMode("random")}
              className={`mt-pill ${mode === "random" ? "mt-pill-on" : ""}`}
            >
              {t("random")}
            </button>

            <button
              type="button"
              onClick={() => setMode("smart")}
              className={`mt-pill ${mode === "smart" ? "mt-pill-on" : ""}`}
            >
              {t("smart")}
            </button>

            <span className="ml-2 text-sm text-gray-600">
              {t("loaded")}:{" "}
              <span className="font-semibold text-gray-900">{rows.length}</span>
              <span className="mx-2 text-gray-300">|</span>
              {t("deck")}:{" "}
              <span className="font-semibold text-gray-900">
                {filtered.length}
              </span>
            </span>
          </div>
        </div>

        {/* Preset packs */}
        <div className="mt-6">
          <h2 className="text-base font-semibold text-gray-900">
            {t("presetPacks")}
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {PRESET_ORDER.map((id) => {
              const isOn = id === activePresetId;
              const def = PRESET_DEFS[id];
              const label = def?.titleKey ? t(def.titleKey) : def?.title ?? id;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActivePresetId(isOn ? null : id)}
                  className={`mt-pill ${isOn ? "mt-pill-on" : ""}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Practice */}
        <div className="mt-6">
          <h2 className="text-base font-semibold text-gray-900">
            {t("practice")}
          </h2>

          {!currentRow ? (
            <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm">
              {t("noCards")}
            </div>
          ) : (
            <div className="mt-3">
              <PracticeCard row={currentRow} onResult={onResult} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


<div className="bg-cymruRed-600 text-white p-2">test colour</div>
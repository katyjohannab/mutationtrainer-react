import { useEffect, useMemo, useRef, useState } from "react";
import { PRESET_DEFS } from "./data/presets";
import { ALL_CSV_FILES } from "./data/csvSources";
import { loadManyCsvFiles } from "./services/loadCsv";
import { applyFilters } from "./utils/applyFilters";

import Header from "./components/Header";
import FlashcardArea from "./components/FlashcardArea";
import FiltersPanel from "./components/FiltersPanel";
import FilterSheet from "./components/FilterSheet";

import { loadLeitnerMap, updateLeitner } from "./utils/leitner";
import { getCardKey, pickRandomIndex, pickSmartIndex } from "./utils/pickNext";

export default function App() {
  const [rows, setRows] = useState([]);
  const [activePresetId, setActivePresetId] = useState(null);

  const [mode, setMode] = useState("random"); // "random" | "smart"
  const [leitnerMap, setLeitnerMap] = useState(() => loadLeitnerMap());

  const [currentIdx, setCurrentIdx] = useState(-1);
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  function handleTogglePreset(id) {
    setActivePresetId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="min-h-full">
      <Header
        onOpenHelp={() => {}}
        onOpenStats={() => {}}
        onOpenFilters={() => setFiltersOpen(true)}
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-4">
        <div className="flex flex-col gap-6 md:flex-row">
          <FlashcardArea
            className="flex-1"
            mode={mode}
            onModeChange={setMode}
            rowsCount={rows.length}
            filteredCount={filtered.length}
            currentRow={currentRow}
            onResult={onResult}
          />

          <aside className="hidden md:block md:w-1/3">
            <FiltersPanel
              activePresetId={activePresetId}
              onTogglePreset={handleTogglePreset}
            />
          </aside>
        </div>
      </main>

      <FilterSheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <FiltersPanel
          activePresetId={activePresetId}
          onTogglePreset={handleTogglePreset}
        />
      </FilterSheet>
    </div>
  );
}

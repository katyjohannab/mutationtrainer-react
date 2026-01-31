import { useEffect, useMemo, useRef, useState } from "react";
import { PRESET_DEFS } from "./data/presets";
import { ALL_CSV_FILES } from "./data/csvSources";
import { loadManyCsvFiles } from "./services/loadCsv";
import { applyFilters } from "./utils/applyFilters";

import Header from "./components/Header";
import FlashcardArea from "./components/FlashcardArea";
import FiltersPanel from "./components/FiltersPanel";
import FilterSheet from "./components/FilterSheet";
import { Button } from "./components/ui/button";

import { loadLeitnerMap, updateLeitner } from "./utils/leitner";
import { getCardKey, pickRandomIndex, pickSmartIndex } from "./utils/pickNext";
import { useI18n } from "./i18n/I18nContext";

export default function App() {
  const { t } = useI18n();
  const [rows, setRows] = useState([]);
  const [activePresetId, setActivePresetId] = useState(null);

  const [mode, setMode] = useState("random"); // "random" | "smart"
  const [leitnerMap, setLeitnerMap] = useState(() => loadLeitnerMap());

  const [answerMode, setAnswerMode] = useState("type"); // "type" | "tap"
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    families: new Set(),
    categories: new Set(),
  });

  // avoid annoying repeats in random mode
  const recentRef = useRef([]);
  // always have the latest Leitner map available synchronously
  const leitnerRef = useRef(leitnerMap);

  useEffect(() => {
    leitnerRef.current = leitnerMap;
  }, [leitnerMap]);

  const canon = (s) =>
    (s ?? "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "");

  useEffect(() => {
    loadManyCsvFiles(ALL_CSV_FILES)
      .then(setRows)
      .catch((e) => console.error(e));
  }, []);

  const preset = activePresetId ? PRESET_DEFS[activePresetId] : null;

  const available = useMemo(() => {
    const famMap = new Map();
    const catMap = new Map();

    for (const r of rows) {
      const famRaw = r.family || r.rulefamily || r.RuleFamily || r.Family || "";
      const catRaw = r.category || r.rulecategory || r.RuleCategory || r.Category || "";

      const famKey = canon(famRaw);
      if (famKey && !famMap.has(famKey)) famMap.set(famKey, famRaw.trim());

      const catKey = canon(catRaw);
      if (catKey && !catMap.has(catKey)) catMap.set(catKey, catRaw.trim());
    }

    return {
      families: Array.from(famMap.entries())
        .map(([id, label]) => ({ id, label }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      categories: Array.from(catMap.entries())
        .map(([id, label]) => ({ id, label }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    };
  }, [rows]);

  const filtered = useMemo(() => {
    return applyFilters(rows, { preset, filters });
  }, [rows, preset, filters]);

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

  const toggleFilter = (kind, id) => {
    setFilters((prev) => {
      const nextSet = new Set(prev[kind] ?? []);
      if (nextSet.has(id)) nextSet.delete(id);
      else nextSet.add(id);
      return { ...prev, [kind]: nextSet };
    });
  };

  const clearFilterType = (kind) => {
    setFilters((prev) => ({ ...prev, [kind]: new Set() }));
  };

  return (
    <div className="min-h-full">
      <Header
        onOpenHelp={() => {}}
        onOpenStats={() => {}}
        onOpenFilters={() => setFiltersOpen(true)}
      />

      <main className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">
                {t("inputMode")}:
              </span>

              <Button
                type="button"
                variant="pill"
                active={answerMode === "type"}
                onClick={() => setAnswerMode("type")}
              >
                {t("typeMode")}
              </Button>

              <Button
                type="button"
                variant="pill"
                active={answerMode === "tap"}
                onClick={() => setAnswerMode("tap")}
              >
                {t("tapMode")}
              </Button>
            </div>

            <FlashcardArea
              className="mt-4"
              mode={mode}
              onModeChange={setMode}
              rowsCount={rows.length}
              filteredCount={filtered.length}
              currentRow={currentRow}
              onResult={onResult}
              answerMode={answerMode}
              deckRows={filtered}
            />
          </div>

          <aside className="hidden md:block md:w-1/3">
            <FiltersPanel
              activePresetId={activePresetId}
              onTogglePreset={handleTogglePreset}
              available={available}
              filters={filters}
              onToggleFilter={toggleFilter}
              onClearFilterType={clearFilterType}
            />
          </aside>
        </div>
      </main>

      <FilterSheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <FiltersPanel
          activePresetId={activePresetId}
          onTogglePreset={handleTogglePreset}
          available={available}
          filters={filters}
          onToggleFilter={toggleFilter}
          onClearFilterType={clearFilterType}
        />
      </FilterSheet>
    </div>
  );
}

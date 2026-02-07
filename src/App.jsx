import { useEffect, useMemo, useRef, useState } from "react";
import { PRESET_DEFS } from "./data/presets";
import { ALL_CSV_FILES } from "./data/csvSources";
import { loadManyCsvFiles } from "./services/loadCsv";
import { applyFilters } from "./utils/applyFilters";

import Header from "./components/Header";
import FlashcardArea from "./components/FlashcardArea";
import FiltersPanel from "./components/FiltersPanel";
import FilterSheet from "./components/FilterSheet";
import PageContainer from "./components/layout/PageContainer";

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
  const [sessionCardCount, setSessionCardCount] = useState(1); // Track cards viewed in session
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersOpenItems, setFiltersOpenItems] = useState(["item-core", "item-quick"]);
  const [filters, setFilters] = useState({
    families: new Set(),
    categories: new Set(),
  });

  // avoid annoying repeats in random mode
  const recentRef = useRef([]);
  // always have the latest Leitner map available synchronously
  const leitnerRef = useRef(leitnerMap);
  const handledReviewIdsRef = useRef(new Set());

  useEffect(() => {
    leitnerRef.current = leitnerMap;
  }, [leitnerMap]);

  useEffect(() => {
    handledReviewIdsRef.current.clear();
  }, [currentIdx, mode]);

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

  const presetLabel = preset
    ? preset.titleKey
      ? t(preset.titleKey)
      : preset.title || activePresetId
    : t("practice");

  // Calculate progress text based on mode
  let progressText = "";
  if (mode === "smart") {
    // Count how many cards have been reviewed (have leitner data)
    const reviewed = filtered.filter((row, idx) => {
      const key = getCardKey(row, idx);
      return leitnerMap[key] !== undefined;
    }).length;
    const poolSize = filtered.length;
    progressText = `${t("reviewedLabel")} ${reviewed} · ${t("poolLabel")} ${poolSize}`;
  } else {
    // Random mode: show session position (how many cards viewed)
    progressText = `${t("cardLabel")} ${sessionCardCount} / ${filtered.length || 0}`;
  }

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
    setSessionCardCount((prev) => prev + 1); // Increment card counter
  }

  // Pick an initial card ONLY when the deck or mode changes.
  // CRITICAL: do NOT depend on leitnerMap here, or it will jump on Check.
  useEffect(() => {
    if (!filtered.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentIdx(-1);
      setSessionCardCount(0);
      recentRef.current = [];
      return;
    }

    // Always start from the beginning when deck changes (filters/preset applied)
    const idx =
      mode === "smart"
        ? pickSmartIndex(filtered, leitnerRef.current)
        : pickRandomIndex(filtered, new Set());
    setCurrentIdx(idx);
    setSessionCardCount(1); // Reset to 1 when deck changes
    recentRef.current = [];
  }, [filtered, mode]); // <-- NO leitnerMap

  function onResult(payload) {
    const result = payload?.result;

    if (mode === "smart") {
      if (!currentRow) return;

      const key = getCardKey(currentRow, currentIdx);
      const baseResult = payload?.baseResult;
      const reviewId = payload?.reviewId;
      const currentEntry = leitnerRef.current[key];

      if (reviewId) {
        if (handledReviewIdsRef.current.has(reviewId)) {
          return;
        }
        handledReviewIdsRef.current.add(reviewId);
      }

      if (reviewId && currentEntry?.lastReviewId === reviewId) {
        return;
      }

      if (result === "easy" || result === "again" || result === "next") {
        const normalizedBase = baseResult === "correct" ? "correct" : "wrong";
        const nextMap = updateLeitner(leitnerRef.current, key, normalizedBase, {
          baseResult: normalizedBase,
          ease: result,
          reviewId,
        });
        setLeitnerMap(nextMap);
        pickNext(nextMap);
      }
      return;
    }

    // Only "next" advances
    if (result === "next") {
      pickNext(leitnerRef.current);
      return;
    }

    if (result === "shuffle") {
      if (!currentRow) return;
      const key = getCardKey(currentRow, currentIdx);
      pushRecent(key);
      pickNext(leitnerRef.current);
      return;
    }

    // grading only: update Leitner but do NOT navigate
    if (!currentRow) return;

    const key = getCardKey(currentRow, currentIdx);
    pushRecent(key);

    const nextMap = updateLeitner(leitnerRef.current, key, result);
    setLeitnerMap(nextMap);

    if (result === "easy" || result === "again") {
      pickNext(nextMap);
      return;
    }

    // IMPORTANT: no pickNext() here for standard grading
  }

  const handleShuffle = () => {
    if (mode !== "random") return;
    onResult({ result: "shuffle" });
  };

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

  const openFiltersSheet = (items) => {
    setFiltersOpenItems(items);
    setFiltersOpen(true);
  };

  return (
    <div className="min-h-full">
      <Header
        onOpenFilters={() => openFiltersSheet(["item-core", "item-quick"])}
        onOpenHelp={() => openFiltersSheet(["item-start"])}
      />

      <PageContainer as="main" className="pb-4 pt-6 sm:pt-7 lg:pt-8 2xl:pt-10">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-1">
            <FlashcardArea
              className="mt-4"
              mode={mode}
              onModeChange={setMode}
              progressText={progressText}
              deckLabel={presetLabel}
              currentRow={currentRow}
              onResult={onResult}
              onShuffle={handleShuffle}
              answerMode={answerMode}
              onAnswerModeChange={setAnswerMode}
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
      </PageContainer>

      <FilterSheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <FiltersPanel
          activePresetId={activePresetId}
          onTogglePreset={handleTogglePreset}
          available={available}
          filters={filters}
          onToggleFilter={toggleFilter}
          onClearFilterType={clearFilterType}
          openItems={filtersOpenItems}
          onOpenItemsChange={setFiltersOpenItems}
          accordionType="multiple"
        />
      </FilterSheet>
    </div>
  );
}

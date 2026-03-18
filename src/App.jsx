import { useEffect, useMemo, useRef, useState } from "react";
import { PRESET_DEFS } from "./data/presets";
import { ALL_RUNTIME_DATA_FILES } from "./data/csvSources";
import { loadManyCsvFiles } from "./services/loadCsv";
import { applyFilters } from "./utils/applyFilters";
import { getAdminSession, loginAdmin, logoutAdmin, saveAdminCard } from "./services/adminApi";

import Header from "./components/Header";
import FlashcardArea from "./components/FlashcardArea";
import FilterSheet from "./components/FilterSheet";
import RailContent from "./components/rail/RailContent";
import PageContainer from "./components/layout/PageContainer";
import WelcomeModal from "./components/WelcomeModal";

import { loadLeitnerMap, updateLeitner } from "./utils/leitner";
import { getCardKey, pickRandomIndex, pickSmartIndex } from "./utils/pickNext";
import { useI18n } from "./i18n/I18nContext";

export default function App() {
  const { t, lang } = useI18n();
  const [rows, setRows] = useState([]);
  const [activePresetId, setActivePresetId] = useState(null);

  const [mode, setMode] = useState("random"); // "random" | "smart"
  const [leitnerMap, setLeitnerMap] = useState(() => loadLeitnerMap());

  const [answerMode, setAnswerMode] = useState("type"); // "type" | "tap"
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [sessionCardCount, setSessionCardCount] = useState(1); // Track cards viewed in session
  
  // Centralized session stats
  const [sessionStats, setSessionStats] = useState({
    attempted: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
  });

  // Centralized drawer state with intent
  const [drawer, setDrawer] = useState({
    open: false,
    intent: "filters", // "filters"
  });

  // Welcome/help modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [adminState, setAdminState] = useState({
    authenticated: false,
    configured: true,
    error: "",
  });

  const [filters, setFilters] = useState({
    families: new Set(),
    categories: new Set(),
    levels: new Set(),
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
    loadManyCsvFiles(ALL_RUNTIME_DATA_FILES)
      .then(setRows)
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    let active = true;

    getAdminSession()
      .then((session) => {
        if (!active) return;
        setAdminState({
          authenticated: Boolean(session?.authenticated),
          configured: session?.configured !== false,
          error: "",
        });
      })
      .catch((error) => {
        if (!active) return;
        setAdminState({
          authenticated: false,
          configured: false,
          error: error?.message || "Admin API unavailable.",
        });
      });

    return () => {
      active = false;
    };
  }, []);

  const preset = activePresetId ? PRESET_DEFS[activePresetId] : null;
  const showDysguBadges = Boolean(
    preset?.course && preset?.dialect && preset?.unit
  );

  const available = useMemo(() => {
    const famMap = new Map();
    const catMap = new Map();
    const levelMap = new Map();

    for (const r of rows) {
      const famRaw = r.family || r.rulefamily || r.RuleFamily || r.Family || "";
      const catRaw = r.category || r.rulecategory || r.RuleCategory || r.Category || "";
      const levelRaw = r.level || r.Level || r.course || r.Course || "";

      const famKey = canon(famRaw);
      if (famKey && !famMap.has(famKey)) famMap.set(famKey, famRaw.trim());

      const catKey = canon(catRaw);
      if (catKey && !catMap.has(catKey)) catMap.set(catKey, catRaw.trim());

      const levelKey = canon(levelRaw);
      if (levelKey && !levelMap.has(levelKey)) levelMap.set(levelKey, levelRaw.trim());
    }

    return {
      families: Array.from(famMap.entries())
        .map(([id, label]) => ({ id, label }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      categories: Array.from(catMap.entries())
        .map(([id, label]) => ({ id, label }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      levels: Array.from(levelMap.entries())
        .map(([id, label]) => ({ id, label }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    };
  }, [rows]);

  const filtered = useMemo(() => {
    return applyFilters(rows, { preset, filters });
  }, [rows, preset, filters]);

  const presetLabel = useMemo(() => {
    if (!preset) return t("practice");
    if (preset.titleKey) return t(preset.titleKey);
    if (preset.title && typeof preset.title === 'object') {
       // Handle {en, cy} objects
       return preset.title[lang] || preset.title.en || "Preset";
    }
    return preset.title || activePresetId;
  }, [preset, t, lang, activePresetId]);

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
    const baseResult = payload?.baseResult;

    // Track session stats on graded outcomes (not navigation-only actions)
    if (baseResult === "correct" || baseResult === "wrong") {
      recordResult(baseResult === "correct");
    } else if (
      mode === "random" &&
      (result === "correct" || result === "wrong")
    ) {
      recordResult(result === "correct");
    }

    if (result === "shuffle") {
      if (!filtered.length) return;

      if (mode === "random") {
        if (!currentRow) return;
        const key = getCardKey(currentRow, currentIdx);
        pushRecent(key);
        pickNext(leitnerRef.current);
        return;
      }

      // Smart mode: jump to a fresh random start point in the current pool.
      const idx = pickRandomIndex(filtered, new Set());
      setCurrentIdx(idx);
      return;
    }

    if (mode === "smart") {
      if (!currentRow) return;

      const key = getCardKey(currentRow, currentIdx);
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

      if (result === "skipped") {
        pickNext(leitnerRef.current);
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

    // "next" and "skipped" both advance without grading
    if (result === "next" || result === "skipped") {
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
    onResult({ result: "shuffle" });
  };

  function handleTogglePreset(id) {
    setActivePresetId((prev) => (prev === id ? null : id));
    // Selecting a pack clears any active advanced filters (they're mutually exclusive)
    if (id !== null) {
      setFilters({ families: new Set(), categories: new Set(), levels: new Set() });
    }
  }

  function handleSetPreset(idOrNull) {
    setActivePresetId(idOrNull ?? null);
    if (idOrNull !== null) {
      setFilters({ families: new Set(), categories: new Set(), levels: new Set() });
    }
  }

  const toggleFilter = (kind, id) => {
    // Applying any advanced filter clears the active pack
    setActivePresetId(null);
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

  // Session stats helpers
  const recordResult = (isCorrect) => {
    setSessionStats((prev) => {
      const newAttempted = prev.attempted + 1;
      const newCorrect = prev.correct + (isCorrect ? 1 : 0);
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const newBestStreak = Math.max(prev.bestStreak, newStreak);
      return {
        attempted: newAttempted,
        correct: newCorrect,
        streak: newStreak,
        bestStreak: newBestStreak,
      };
    });
  };

  const resetSessionStats = () => {
    setSessionStats({ attempted: 0, correct: 0, streak: 0, bestStreak: 0 });
  };
  async function handleAdminLogin(password) {
    await loginAdmin(password);
    const session = await getAdminSession();
    setAdminState({
      authenticated: Boolean(session?.authenticated),
      configured: session?.configured !== false,
      error: "",
    });
  }

  async function handleAdminLogout() {
    await logoutAdmin();
    setAdminState((prev) => ({ ...prev, authenticated: false }));
  }

  async function handleAdminSave({ row, patch }) {
    try {
      const response = await saveAdminCard({
        source: row?.__source,
        rowIndex: row?.__rowIndex,
        expectedCardId: row?.cardId || row?.CardId || "",
        patch,
      });

      const updatedRow = response?.updatedRow || {};

      setRows((prev) =>
        prev.map((entry) => {
          if (entry.__source !== row.__source) return entry;
          if (entry.__rowIndex !== row.__rowIndex) return entry;
          return { ...entry, ...updatedRow };
        })
      );

      return updatedRow;
    } catch (error) {
      if (error?.status === 401) {
        setAdminState((prev) => ({ ...prev, authenticated: false }));
      }
      throw error;
    }
  }

  // Drawer helpers
  const openDrawer = (intent) => {
    setDrawer({ open: true, intent });
  };

  // Derive accordion open items for drawer
  // NOTE: do NOT pass openItems to the drawer — let FiltersPanel manage its own
  // accordion state so all items are user-togglable on mobile.
  const drawerAccordionItems = ["item-packs"]; // used as defaultValue only

  return (
    <div className="min-h-full">
      <Header
        onOpenFilters={() => openDrawer("filters")}
        onOpenHelp={() => setShowWelcomeModal(true)}
        hasActiveFilters={Boolean(
          activePresetId ||
          filters.families.size > 0 ||
          filters.categories.size > 0 ||
          filters.levels.size > 0
        )}
      />

      {/* Welcome/Help Modal */}
      <WelcomeModal
        forceOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />

      <PageContainer as="main" className="pb-4 pt-3 sm:pt-6 lg:pt-8 2xl:pt-10 [@media(max-height:700px)]:pt-2.5">
        {/* Responsive grid: single column through tablet/laptop, rail returns once xl has real room */}
        <div className="grid grid-cols-1 gap-3 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_clamp(21rem,29vw,24rem)] 2xl:grid-cols-[minmax(0,1fr)_clamp(22.5rem,27vw,26rem)]">
          {/* Main practice area */}
          <div className="min-w-0 xl:self-start">
            <FlashcardArea
              mode={mode}
              onModeChange={setMode}
              progressText={progressText}
              deckLabel={presetLabel}
              currentRow={currentRow}
              onResult={onResult}
              onShuffle={handleShuffle}
              showDysguBadges={showDysguBadges}
              answerMode={answerMode}
              onAnswerModeChange={setAnswerMode}
              deckRows={filtered}
              sessionStats={sessionStats}
              adminState={adminState}
              onAdminLogin={handleAdminLogin}
              onAdminLogout={handleAdminLogout}
              onAdminSave={handleAdminSave}
            />
          </div>

          {/* Right rail - hidden through the laptop band, sticky sidebar on xl+ */}
          <aside className="hidden xl:block xl:sticky xl:top-[4.5rem] xl:self-start xl:max-h-[calc(100dvh-5.5rem)] xl:overflow-y-auto space-y-4">
            <RailContent
              variant="sidebar"
              stats={sessionStats}
              onResetStats={resetSessionStats}
              filterProps={{
                activePresetId,
                onTogglePreset: handleTogglePreset,
                available,
                filters,
                onToggleFilter: toggleFilter,
                onClearFilterType: clearFilterType,
                defaultOpenItems: ["item-packs"],
                accordionType: "multiple",
              }}
            />
          </aside>
        </div>
      </PageContainer>

      {/* Mobile drawer */}
      <FilterSheet
        open={drawer.open}
        onOpenChange={(open) => setDrawer((prev) => ({ ...prev, open }))}
        title={drawer.intent === "help" ? t("startHereTitle") : t("headerFilters")}
      >
        <RailContent
          variant="drawer"
          filterProps={{
            activePresetId,
            onTogglePreset: handleTogglePreset,
            onPresetApplied: () => setDrawer((prev) => ({ ...prev, open: false })),
            available,
            filters,
            onToggleFilter: toggleFilter,
            onClearFilterType: clearFilterType,
            defaultOpenItems: drawerAccordionItems,
            accordionType: "multiple",
          }}
        />
      </FilterSheet>
    </div>
  );
}






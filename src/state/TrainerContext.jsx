/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { PRESET_DEFS } from "../data/presets";
import { applyFilters } from "../utils/applyFilters";

const STORAGE_KEY_PRESET = "wm_active_preset";
const STORAGE_KEY_MODE = "wm_mode"; // "random" | "smart"
const STORAGE_KEY_LEITNER = "wm_leitner_v1"; // map cardId -> { box, dueAt, correct, wrong, lastSeenAt }

const TrainerContext = createContext(null);

const LEITNER_INTERVALS_MS = [
  0, // unused (box starts at 1)
  0, // box 1: due now
  6 * 60 * 60 * 1000, // box 2: 6h
  24 * 60 * 60 * 1000, // box 3: 1 day
  3 * 24 * 60 * 60 * 1000, // box 4: 3 days
  7 * 24 * 60 * 60 * 1000, // box 5: 7 days
];

const MUTATION_FILTERS = [
  { id: "aspirate", labelKey: "mutationFilterAspirate" },
  { id: "nasal", labelKey: "mutationFilterNasal" },
  { id: "soft", labelKey: "mutationFilterSoft" },
  { id: "none", labelKey: "mutationFilterNone" },
];

const MUTATION_FILTER_IDS = new Set(MUTATION_FILTERS.map((item) => item.id));

function now() {
  return Date.now();
}

function safeLower(s) {
  return (s ?? "").toString().trim().toLowerCase();
}

function canon(s) {
  return (s ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function getCardId(card) {
  // you normalised CardId -> cardId in loadCsv, but keep fallback
  return card?.cardId ?? card?.CardId ?? "";
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures
  }
}

function clampBox(n) {
  if (n < 1) return 1;
  if (n > 5) return 5;
  return n;
}

function chooseRandomIndex(n) {
  if (!n) return 0;
  return Math.floor(Math.random() * n);
}

function chooseSmartIndex(filtered, leitner) {
  // Pick the most due card among the currently filtered deck.
  // If none are due, pick the soonest due.
  const t = now();
  let bestDueIdx = -1;
  let bestDueAt = Infinity;

  let soonestIdx = -1;
  let soonestDueAt = Infinity;

  for (let i = 0; i < filtered.length; i++) {
    const card = filtered[i];
    const id = getCardId(card);
    if (!id) continue;

    const entry = leitner[id];
    const dueAt = entry?.dueAt ?? 0; // never seen => due now

    // due now candidates
    if (dueAt <= t && dueAt < bestDueAt) {
      bestDueAt = dueAt;
      bestDueIdx = i;
    }

    // track soonest overall
    if (dueAt < soonestDueAt) {
      soonestDueAt = dueAt;
      soonestIdx = i;
    }
  }

  if (bestDueIdx !== -1) return bestDueIdx;
  if (soonestIdx !== -1) return soonestIdx;

  // fallback
  return 0;
}

const initialState = {
  rows: [],
  loadError: null,

  activePresetId: null,
  filters: {
    families: new Set(),
    categories: new Set(),
  },
  available: {
    families: MUTATION_FILTERS,
    categories: [],
  },
  mode: "random", // "random" | "smart"

  index: 0,
  userAnswer: "",
  checked: false,
  isCorrect: null, // boolean|null
  revealed: false,

  // Leitner map
  leitner: {},

  // Session stats (simple for now)
  session: {
    seen: 0,
    correct: 0,
    wrong: 0,
  },
};

function reducer(state, action) {
  switch (action.type) {
    case "LOAD_ROWS_SUCCESS": {
      const catMap = new Map();

      for (const r of action.rows) {
        const catRaw = r.category || r.rulecategory || r.RuleCategory || r.Category || "";
        if (catRaw && catRaw.trim()) {
          const k = canon(catRaw);
          if (k && !catMap.has(k)) {
            catMap.set(k, catRaw.trim());
          }
        }
      }

      const categories = Array.from(catMap.entries())
        .map(([id, label]) => ({ id, label }))
        .sort((a, b) => a.label.localeCompare(b.label));

      const available = {
        families: MUTATION_FILTERS,
        categories,
      };

      const validCategoryIds = new Set(categories.map((cat) => cat.id));
      const nextFilters = {
        families: new Set(
          Array.from(state.filters.families || []).filter((id) => MUTATION_FILTER_IDS.has(id))
        ),
        categories: new Set(
          Array.from(state.filters.categories || []).filter((id) => validCategoryIds.has(id))
        ),
      };

      return {
        ...state,
        rows: action.rows,
        loadError: null,
        available,
        filters: nextFilters,
      };
    }

    case "LOAD_ROWS_ERROR":
      return { ...state, loadError: action.error };

    case "APPLY_PRESET":
      return { ...state, activePresetId: action.presetId };

    case "CLEAR_PRESET":
      return { ...state, activePresetId: null };

    case "TOGGLE_FILTER": {
      const { kind, id } = action;
      const targetSet = state.filters[kind];
      if (!targetSet) return state;

      const nextSet = new Set(targetSet);
      if (nextSet.has(id)) {
        nextSet.delete(id);
      } else {
        nextSet.add(id);
      }

      return {
        ...state,
        filters: {
          ...state.filters,
          [kind]: nextSet,
        },
      };
    }

    case "CLEAR_FILTER_TYPE": {
      const { kind } = action;
      if (!state.filters[kind]) return state; // safety
      return {
        ...state,
        filters: {
          ...state.filters,
          [kind]: new Set(), // empty set implies 'All'
        },
      };
    }

    case "SET_MODE":
      return { ...state, mode: action.mode };

    case "SET_ANSWER":
      return { ...state, userAnswer: action.value, checked: false, isCorrect: null };

    case "REVEAL":
      return { ...state, revealed: true };

    case "RESET_FOR_NEW_DECK":
      return {
        ...state,
        index: action.index ?? 0,
        userAnswer: "",
        checked: false,
        isCorrect: null,
        revealed: false,
        session: { seen: 0, correct: 0, wrong: 0 },
      };

    case "CHECK_ANSWER": {
      const { card, isCorrect } = action;
      const id = getCardId(card);
      if (!id) {
        return { ...state, checked: true, isCorrect };
      }

      const prev = state.leitner[id] ?? { box: 1, dueAt: 0, correct: 0, wrong: 0, lastSeenAt: 0 };

      const nextBox = isCorrect ? clampBox((prev.box ?? 1) + 1) : 1;
      const interval = LEITNER_INTERVALS_MS[nextBox] ?? 0;
      const nextDueAt = now() + interval;

      const updated = {
        ...prev,
        box: nextBox,
        dueAt: nextDueAt,
        correct: (prev.correct ?? 0) + (isCorrect ? 1 : 0),
        wrong: (prev.wrong ?? 0) + (isCorrect ? 0 : 1),
        lastSeenAt: now(),
      };

      return {
        ...state,
        checked: true,
        isCorrect,
        revealed: state.revealed || !isCorrect, // auto-reveal if wrong
        leitner: { ...state.leitner, [id]: updated },
        session: {
          seen: state.session.seen + 1,
          correct: state.session.correct + (isCorrect ? 1 : 0),
          wrong: state.session.wrong + (isCorrect ? 0 : 1),
        },
      };
    }

    case "NEXT_CARD":
      return {
        ...state,
        index: action.index,
        userAnswer: "",
        checked: false,
        isCorrect: null,
        revealed: false,
      };

    case "SET_LEITNER":
      return { ...state, leitner: action.leitner ?? {} };

    default:
      return state;
  }
}

export function TrainerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted preset + mode + leitner on first mount
  useEffect(() => {
    try {
      const savedPreset = localStorage.getItem(STORAGE_KEY_PRESET);
      if (savedPreset && PRESET_DEFS[savedPreset]) {
        dispatch({ type: "APPLY_PRESET", presetId: savedPreset });
      }
    } catch (e) {
      console.warn("Failed to restore preset", e);
    }

    try {
      const savedMode = localStorage.getItem(STORAGE_KEY_MODE);
      if (savedMode === "random" || savedMode === "smart") {
        dispatch({ type: "SET_MODE", mode: savedMode });
      }
    } catch (e) {
      console.warn("Failed to restore mode", e);
    }

    const savedLeitner = loadJson(STORAGE_KEY_LEITNER, {});
    if (savedLeitner && typeof savedLeitner === "object") {
      dispatch({ type: "SET_LEITNER", leitner: savedLeitner });
    }
  }, []);

  // Persist preset when it changes
  useEffect(() => {
    try {
      if (state.activePresetId) localStorage.setItem(STORAGE_KEY_PRESET, state.activePresetId);
      else localStorage.removeItem(STORAGE_KEY_PRESET);
    } catch (e) {
      console.warn("Failed to persist preset", e);
    }
  }, [state.activePresetId]);

  // Persist mode when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MODE, state.mode);
    } catch (e) {
      console.warn("Failed to persist mode", e);
    }
  }, [state.mode]);

  // Persist leitner map when it changes
  useEffect(() => {
    saveJson(STORAGE_KEY_LEITNER, state.leitner);
  }, [state.leitner]);

  const preset = state.activePresetId ? PRESET_DEFS[state.activePresetId] : null;

  const filtered = useMemo(() => {
    try {
      // Only pass what applyFilters actually needs - not the full state object
      return applyFilters(state.rows, { preset, filters: state.filters });
    } catch (e) {
      console.error("applyFilters crashed:", e);
      return [];
    }
  }, [state.rows, preset, state.filters]);

  // When deck changes (preset changes, or rows load), reset session + choose a valid index based on mode
  useEffect(() => {
    if (!filtered.length) {
      dispatch({ type: "RESET_FOR_NEW_DECK", index: 0 });
      return;
    }

    const index =
      state.mode === "smart"
        ? chooseSmartIndex(filtered, state.leitner)
        : chooseRandomIndex(filtered.length);

    dispatch({ type: "RESET_FOR_NEW_DECK", index });
  }, [filtered, state.mode, state.leitner]);

  const currentCard = filtered[state.index] ?? null;

  const value = useMemo(
    () => ({
      state,
      preset,
      filtered,
      currentCard,
      dispatch,
      // helpers exposed for UI buttons
      checkAnswer: () => {
        if (!currentCard) return;
        const expected = safeLower(currentCard.answer ?? currentCard.Answer);
        const got = safeLower(state.userAnswer);
        const ok = expected.length > 0 && got === expected;
        dispatch({ type: "CHECK_ANSWER", card: currentCard, isCorrect: ok });
      },
      nextCard: () => {
        if (!filtered.length) return;

        const nextIndex =
          state.mode === "smart"
            ? chooseSmartIndex(filtered, state.leitner)
            : chooseRandomIndex(filtered.length);

        dispatch({ type: "NEXT_CARD", index: nextIndex });
      },
      reveal: () => dispatch({ type: "REVEAL" }),
      setAnswer: (v) => dispatch({ type: "SET_ANSWER", value: v }),
      setMode: (m) => dispatch({ type: "SET_MODE", mode: m }),
      setPresetId: (idOrNull) => {
        if (!idOrNull) dispatch({ type: "CLEAR_PRESET" });
        else dispatch({ type: "APPLY_PRESET", presetId: idOrNull });
      },
      toggleFilter: (kind, id) => {
        dispatch({ type: "TOGGLE_FILTER", kind, id });
      },
    }),
    [state, preset, filtered, currentCard]
  );

  return <TrainerContext.Provider value={value}>{children}</TrainerContext.Provider>;
}

export function useTrainer() {
  const ctx = useContext(TrainerContext);
  if (!ctx) throw new Error("useTrainer must be used inside <TrainerProvider>");
  return ctx;
}

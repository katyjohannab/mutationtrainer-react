import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { PRESET_DEFS } from "../data/presets";
import { applyFilters } from "../utils/applyFilters";

const STORAGE_KEY_PRESET = "wm_active_preset"; 

const TrainerContext = createContext(null);

const initialState = {
  rows: [],
  activePresetId: null,
  loadError: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOAD_ROWS_SUCCESS":
      return { ...state, rows: action.rows, loadError: null };

    case "LOAD_ROWS_ERROR":
      return { ...state, loadError: action.error };

    case "APPLY_PRESET":
      return { ...state, activePresetId: action.presetId };

    case "CLEAR_PRESET":
      return { ...state, activePresetId: null };

    default:
      return state;
  }
}

export function TrainerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted preset on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRESET);
      if (saved && PRESET_DEFS[saved]) {
        dispatch({ type: "APPLY_PRESET", presetId: saved });
      }
    } catch {
      // ignore storage issues
    }
  }, []);

  // Persist preset when it changes
  useEffect(() => {
    try {
      if (state.activePresetId) {
        localStorage.setItem(STORAGE_KEY_PRESET, state.activePresetId);
      } else {
        localStorage.removeItem(STORAGE_KEY_PRESET);
      }
    } catch {
      // ignore storage issues
    }
  }, [state.activePresetId]);

  const preset = state.activePresetId ? PRESET_DEFS[state.activePresetId] : null;

  const filtered = useMemo(() => {
    try {
      return applyFilters(state.rows, { preset });
    } catch (e) {
      console.error("applyFilters crashed:", e);
      return [];
    }
  }, [state.rows, preset]);

  const value = useMemo(
    () => ({
      state,
      preset,
      filtered,
      dispatch,
    }),
    [state, preset, filtered]
  );

  return <TrainerContext.Provider value={value}>{children}</TrainerContext.Provider>;
}

export function useTrainer() {
  const ctx = useContext(TrainerContext);
  if (!ctx) throw new Error("useTrainer must be used inside <TrainerProvider>");
  return ctx;
}

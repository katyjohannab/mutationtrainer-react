import React, { useEffect } from "react";
import { TrainerProvider, useTrainer } from "./state/TrainerContext";
import { ALL_CSV_FILES } from "./data/csvSources";
import { loadManyCsvFiles } from "./services/loadCsv";

import Header from "./components/Header";
import PresetPacks from "./components/PresetPacks";
import ModeToggle from "./components/ModeToggle";
import TrainerCard from "./components/TrainerCard";
import DebugPanel from "./components/DebugPanel";

function AppInner() {
  const { dispatch } = useTrainer();

  useEffect(() => {
    let cancelled = false;

    loadManyCsvFiles(ALL_CSV_FILES)
      .then((rows) => {
        if (!cancelled) dispatch({ type: "LOAD_ROWS_SUCCESS", rows });
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) dispatch({ type: "LOAD_ROWS_ERROR", error: String(e?.message ?? e) });
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return (
    <div style={{ padding: 16, fontFamily: "system-ui" }}>
      <Header />
      <PresetPacks />
      <ModeToggle />
      <TrainerCard />

      <details style={{ marginTop: 16 }}>
        <summary style={{ cursor: "pointer" }}>Show debug</summary>
        <DebugPanel />
      </details>
    </div>
  );
}

export default function App() {
  return (
    <TrainerProvider>
      <AppInner />
    </TrainerProvider>
  );
}

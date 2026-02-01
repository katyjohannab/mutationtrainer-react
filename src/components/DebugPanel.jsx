import React, { useMemo } from "react";
import { useTrainer } from "../state/TrainerContext";

export default function DebugPanel() {
  const { state, filtered } = useTrainer();

  const rows = useMemo(
    () => (Array.isArray(state?.rows) ? state.rows : []),
    [state]
  );
  const safeFiltered = Array.isArray(filtered) ? filtered : [];

  const sampleSources = useMemo(() => {
    const set = new Set();
    for (const r of rows) {
      if (r?.__source) set.add(r.__source);
      if (set.size >= 20) break;
    }
    return [...set];
  }, [rows]);

  const sampleCategories = useMemo(() => {
    const set = new Set();
    for (const r of rows) {
      if (r?.category) set.add(r.category);
      if (set.size >= 30) break;
    }
    return [...set];
  }, [rows]);

  const sampleTriggers = useMemo(() => {
    const set = new Set();
    for (const r of rows) {
      if (r?.trigger) set.add(r.trigger);
      if (set.size >= 30) break;
    }
    return [...set];
  }, [rows]);

  const firstRowKeys = useMemo(() => {
    if (!rows.length) return [];
    return Object.keys(rows[0]).slice(0, 80);
  }, [rows]);

  const hasCategory = useMemo(() => rows.some((r) => !!r?.category), [rows]);
  const hasTrigger = useMemo(() => rows.some((r) => !!r?.trigger), [rows]);

  return (
    <section
      style={{
        marginTop: 16,
        padding: 12,
        border: "1px solid hsl(var(--border))",
        borderRadius: 12,
        background: "hsl(var(--card))",
        color: "hsl(var(--foreground))",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Debug</h2>

      {state?.loadError ? (
        <div
          style={{
            padding: 12,
            border: "1px solid hsl(var(--destructive) / 0.4)",
            borderRadius: 8,
            background: "hsl(var(--destructive) / 0.1)",
          }}
        >
          <b>Load error:</b> {state.loadError}
        </div>
      ) : null}

      <p style={{ marginBottom: 8 }}>
        Loaded rows: <b>{rows.length}</b> | After filters: <b>{safeFiltered.length}</b>
      </p>

      <p style={{ margin: "0 0 12px" }}>
        Field health:{" "}
        <b style={{ color: hasCategory ? "inherit" : "hsl(var(--destructive))" }}>
          category {hasCategory ? "✓" : "✗"}
        </b>{" "}
        |{" "}
        <b style={{ color: hasTrigger ? "inherit" : "hsl(var(--destructive))" }}>
          trigger {hasTrigger ? "✓" : "✗"}
        </b>
      </p>

      <details style={{ marginBottom: 10 }}>
        <summary style={{ cursor: "pointer" }}>
          Sources (first 20)
        </summary>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
          {JSON.stringify(sampleSources, null, 2)}
        </pre>
      </details>

      <details style={{ marginBottom: 10 }}>
        <summary style={{ cursor: "pointer" }}>
          Categories (first 30 unique)
        </summary>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
          {JSON.stringify(sampleCategories, null, 2)}
        </pre>
      </details>

      <details style={{ marginBottom: 10 }}>
        <summary style={{ cursor: "pointer" }}>
          Triggers (first 30 unique)
        </summary>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
          {JSON.stringify(sampleTriggers, null, 2)}
        </pre>
      </details>

      <details style={{ marginBottom: 10 }}>
        <summary style={{ cursor: "pointer" }}>
          First row keys (first 80)
        </summary>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
          {JSON.stringify(firstRowKeys, null, 2)}
        </pre>
      </details>

      <details>
        <summary style={{ cursor: "pointer" }}>
          First 3 cards after filters
        </summary>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
          {JSON.stringify(safeFiltered.slice(0, 3), null, 2)}
        </pre>
      </details>
    </section>
  );
}

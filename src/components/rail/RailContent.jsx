import React from "react";
import { cn } from "../../lib/cn";
import SessionStatsCard from "../SessionStatsCard";
import FiltersPanel from "../FiltersPanel";

/**
 * Unified rail content for both desktop sidebar and mobile drawer.
 * Single source of truth for stats + filters UI.
 *
 * @param {"sidebar" | "drawer"} variant - Layout variant
 * @param {Object} stats - Session stats object
 * @param {Function} onResetStats - Reset stats handler
 * @param {Object} filterProps - Props passed to FiltersPanel
 * @param {string} [className]
 */
export default function RailContent({
  variant = "sidebar",
  stats,
  onResetStats,
  filterProps,
  className,
}) {
  const isDrawer = variant === "drawer";

  return (
    <div
      className={cn(
        "flex flex-col",
        isDrawer ? "gap-4 px-1" : "gap-4",
        className
      )}
    >
      {/* Stats card - only in sidebar (drawer has inline stats in header) */}
      {!isDrawer && stats && (
        <SessionStatsCard stats={stats} onReset={onResetStats} />
      )}

      {/* Filters panel */}
      <FiltersPanel
        {...filterProps}
        className={cn(isDrawer && "pb-safe")}
      />
    </div>
  );
}

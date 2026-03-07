import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Level pill tabs — stylized toggle for course levels.
 * Matches HeroPill gradient border aesthetic when active.
 * 
 * @param {Object} props
 * @param {Array<{id: string, label: string, disabled?: boolean}>} props.options
 * @param {string} props.value - Currently selected id
 * @param {(id: string) => void} props.onValueChange
 * @param {string} [props.className]
 */
export function LevelPillTabs({ options, value, onValueChange, className }) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex flex-wrap items-center gap-1.5 rounded-xl bg-muted/50 p-1.5",
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option.id;
        const isDisabled = option.disabled;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-disabled={isDisabled}
            disabled={isDisabled}
            onClick={() => !isDisabled && onValueChange(option.id)}
            className={cn(
              "relative inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              isActive && !isDisabled && [
                // Active state - gradient border like HeroPill
                "bg-[radial-gradient(120%_120%_at_50%_50%,hsl(var(--cymru-green))_0%,hsl(var(--cymru-green-light))_100%)]",
                "text-white shadow-sm",
              ],
              !isActive && !isDisabled && [
                "bg-transparent text-foreground",
                "hover:bg-[hsl(var(--cymru-green-wash))] hover:text-[hsl(var(--cymru-green))]",
              ],
              isDisabled && [
                "cursor-not-allowed opacity-50 bg-transparent text-muted-foreground",
              ]
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default LevelPillTabs;

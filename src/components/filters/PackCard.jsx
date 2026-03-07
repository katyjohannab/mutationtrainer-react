import React from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/cn";
import { Badge } from "../ui/badge";
import AppIcon from "../icons/AppIcon";

/**
 * Reusable pack card for preset/pack selection.
 * Matches SessionStatsCard border emphasis pattern when active.
 * 
 * @param {Object} props
 * @param {boolean} props.active - Whether this pack is selected
 * @param {string} props.title - Pack title
 * @param {string} [props.description] - Optional description
 * @param {() => void} props.onClick
 * @param {boolean} [props.comingSoon] - Shows "coming soon" badge
 * @param {string} [props.className]
 */
export default function PackCard({
  active,
  title,
  description,
  onClick,
  comingSoon = false,
  className,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={comingSoon}
      className={cn(
        // Base styles - matches rounded-xl card convention
        "group relative flex h-auto w-full flex-col items-start justify-start gap-1",
        "rounded-xl border bg-card p-4 text-left shadow-sm",
        "transition-all duration-150",
        // Focus state
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        // Active state - border emphasis like SessionStatsCard
        active && [
          "border-2 border-[hsl(var(--cymru-green-light))]",
          "bg-[hsl(var(--cymru-green-wash)/0.4)]",
          "shadow-md",
        ],
        // Inactive hover state
        !active && !comingSoon && [
          "border-border",
          "hover:border-[hsl(var(--cymru-green-light)/0.5)]",
          "hover:shadow-md",
          "hover:bg-[hsl(var(--cymru-green-wash)/0.2)]",
        ],
        // Coming soon state
        comingSoon && [
          "cursor-not-allowed opacity-60 border-border",
        ],
        className
      )}
    >
      {/* Active checkmark - positioned like in existing FiltersPanel */}
      {active && (
        <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-[hsl(var(--cymru-green))] text-white shadow-sm">
          <AppIcon icon={Check} className="h-3 w-3" aria-hidden="true" />
        </span>
      )}

      {/* Coming soon badge */}
      {comingSoon && (
        <Badge
          variant="cymru-gold-wash"
          className="absolute -right-1 -top-1 rounded-full px-2 py-0.5 text-[10px]"
        >
          Coming soon
        </Badge>
      )}

      {/* Title */}
      <span
        className={cn(
          "text-sm font-semibold leading-snug text-foreground",
          "transition-colors",
          !comingSoon && "group-hover:text-[hsl(var(--cymru-green))]"
        )}
      >
        {title}
      </span>

      {/* Description */}
      {description && (
        <span className="text-xs leading-snug text-muted-foreground">
          {description}
        </span>
      )}
    </button>
  );
}

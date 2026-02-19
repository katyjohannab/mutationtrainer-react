import React from "react";
import { cn } from "../lib/cn";

const colorMap = {
  default: {
    text: "text-[hsl(var(--cymru-green))]",
    bg: "bg-[hsl(var(--cymru-green-wash))]",
  },
  orange: {
    text: "text-[hsl(var(--cymru-gold))]",
    bg: "bg-[hsl(var(--cymru-gold-wash))]",
  },
  lightGreen: {
    text: "text-[hsl(var(--cymru-green-light))]",
    bg: "bg-[hsl(var(--cymru-green-light-wash))]",
  },
  red: {
    text: "text-[hsl(var(--cymru-red))]",
    bg: "bg-[hsl(var(--cymru-red-wash))]",
  },
};

/**
 * Reusable stat item — circle (icon) + value + label.
 *
 * Sizes:
 *  - "card"    → centered column layout for the desktop stats card
 *  - "compact" → inline horizontal layout for mobile bar
 *
 * @param {Object}  props
 * @param {import("lucide-react").LucideIcon} props.icon
 * @param {string|number} props.value
 * @param {string} props.label
 * @param {"default"|"orange"|"lightGreen"|"red"} [props.variant="default"]
 * @param {"card"|"compact"} [props.size="card"]
 */
export default function StatItem({
  icon: Icon,
  value,
  label,
  variant = "default",
  size = "card",
}) {
  const colors = colorMap[variant];

  /* ── compact  (mobile inline) ───────────────────────── */
  if (size === "compact") {
    return (
      <div className="inline-flex items-center gap-1.5 leading-none" title={label}>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-semibold",
            colors.text
          )}
        >
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
          <span className="text-sm font-bold tabular-nums">{value}</span>
        </span>
        <span className="text-[10px] font-medium leading-none text-muted-foreground/75">
          {label}
        </span>
      </div>
    );
  }

  /* ── card  (desktop stats panel — centered column) ──── */
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      {/* icon circle */}
      <div
        className={cn(
          "flex shrink-0 items-center justify-center",
          "h-9 w-9 sm:h-10 sm:w-10 rounded-full",
          colors.bg,
          colors.text
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
      </div>

      {/* value */}
      <span
        className={cn(
          "text-lg sm:text-xl font-bold leading-none tabular-nums",
          colors.text
        )}
      >
        {value}
      </span>

      {/* label */}
      <span className="text-[10px] sm:text-xs font-medium leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

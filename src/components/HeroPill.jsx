import React from "react";
import { cn } from "../lib/cn";

export default function HeroPill({
  text,
  state = "default",
  showPin = true,
  className,
}) {
  const stateStyles = {
    default: {
      fill: "bg-[hsl(var(--primary)/0.14)]",
      text: "text-primary",
      pin: "bg-[hsl(var(--hint))]",
    },
    success: {
      fill: "bg-[hsl(var(--success)/0.14)]",
      text: "text-success",
      pin: "bg-[hsl(var(--success))]",
    },
    destructive: {
      fill: "bg-[hsl(var(--destructive)/0.14)]",
      text: "text-destructive",
      pin: "bg-[hsl(var(--destructive))]",
    },
    hint: {
      fill: "bg-[hsl(var(--hint)/0.14)]",
      text: "text-hint",
      pin: "bg-[hsl(var(--hint))]",
    },
  };

  const styles = stateStyles[state];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full",
        "shadow-sm",
        "relative",
        styles.fill,
        styles.text,
        "font-medium tracking-tight",
        "border-2 border-[hsl(var(--cymru-green-light))]",
        className
      )}
    >
      {/* Faint top highlight overlay */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-2">
        {showPin && (
          <div
            className={cn(
              "h-2 w-2 rounded-full flex-shrink-0",
              "ring-1 ring-[hsl(var(--card))]",
              styles.pin
            )}
          />
        )}
        <span>{text}</span>
      </div>
    </div>
  );
}

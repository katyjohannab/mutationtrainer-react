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
      fill: "bg-[hsl(var(--hero-pill-bg))]",
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
        "inline-flex rounded-full p-[2px] sm:p-[2.5px]",
        "bg-gradient-to-r from-[hsl(var(--cymru-green))] to-[hsl(var(--cymru-green-light))]",
        "shadow-md sm:shadow-sm",
        "relative w-full max-w-[min(94vw,40rem)]",
        className
      )}
    >
      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded-full",
          "px-[clamp(2rem,6vw,4rem)] py-[clamp(1.5rem,4vw,2rem)]",
          styles.fill,
          styles.text,
          "font-extrabold tracking-tight leading-none",
          "w-full"
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
        <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-2.5 w-full min-w-0">
          {showPin && (
            <div
              className={cn(
                "h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full flex-shrink-0",
                "ring-1 ring-[hsl(var(--card))]",
                styles.pin
              )}
            />
          )}
          <span className="text-[clamp(3rem,8vw,5rem)] break-words hyphens-auto min-w-0 flex-1 text-center">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}

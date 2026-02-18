import React from "react";
import { cn } from "../lib/cn";

export default function HeroPill({
  text,
  state = "default",
  showPin = true,
  cornerAction = null,
  className,
}) {
  const normalizedText = String(text ?? "");
  const textLength = normalizedText.trim().length;
  const textSizeClass =
    textLength >= 12
      ? "text-[clamp(2.15rem,8.8vw,4.4rem)]"
      : textLength >= 9
      ? "text-[clamp(2.45rem,10.8vw,4.8rem)]"
      : "text-[clamp(2.85rem,13.2vw,5.2rem)]";

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
        "relative inline-flex max-w-[min(96vw,44rem)] overflow-visible",
        "rounded-[1.15rem] p-[2.5px] sm:rounded-[1.35rem] sm:p-[3px]",
        "bg-[radial-gradient(140%_155%_at_50%_50%,hsl(var(--cymru-green))_0%,hsl(var(--cymru-green-light))_52%,hsl(var(--cymru-green))_100%)]",
        "shadow-[0_8px_18px_rgba(9,34,27,0.14),0_2px_6px_rgba(9,34,27,0.09),inset_0_1px_0_rgba(255,255,255,0.4)] sm:shadow-[0_7px_16px_rgba(9,34,27,0.12),0_2px_6px_rgba(9,34,27,0.08),inset_0_1px_0_rgba(255,255,255,0.36)]",
        className
      )}
    >
      {cornerAction ? (
        <div className="absolute right-0 top-0 z-20 translate-x-[32%] -translate-y-[44%]">
          {cornerAction}
        </div>
      ) : null}

      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded-[1rem] sm:rounded-[1.2rem]",
          "px-[clamp(1.3rem,4.8vw,3.4rem)] py-[clamp(0.75rem,2.8vw,1.5rem)]",
          "shadow-[0_2px_0_rgba(255,255,255,0.35)_inset,0_8px_18px_rgba(10,34,27,0.12)]",
          styles.fill,
          styles.text,
          "font-extrabold tracking-tight leading-[1.1]"
        )}
      >
        {/* Faint top highlight overlay */}
        <div
          className="absolute inset-0 rounded-[inherit]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2.5 min-w-0">
          {showPin && (
            <div
              className={cn(
                "h-1.5 w-1.5 sm:h-2.5 sm:w-2.5 rounded-full flex-shrink-0",
                "ring-1 ring-[hsl(var(--card))]",
                styles.pin
              )}
            />
          )}
          <span
            className={cn(
              textSizeClass,
              "break-words hyphens-auto min-w-0 text-center leading-[0.98]",
              "[text-shadow:0_1px_0_rgba(255,255,255,0.35),0_1px_1px_rgba(7,33,26,0.1)]"
            )}
          >
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}



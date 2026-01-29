import { useMemo } from "react";
import { Button } from "./ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./ui/hover-card";

export default function PracticeCardFront({
  sent,
  answer,
  cardState,
  guess,
  setGuess,
  disabledInput,
  showTranslate,
  translate,
  placeholder,
  hintText,
  showHint,
  onToggleHint,
  onCheck,
  onReveal,
  onSkip,
  onNext,
  t,
  tooltipTranslate,
  tooltipWordCategory,
}) {
  const isFeedback = cardState === "feedback";
  const blankLabel = sent?.base || "_____";

  const tooltipLines = useMemo(() => {
    const lines = [];
    if (tooltipTranslate) {
      lines.push({ label: "English", value: tooltipTranslate });
    }
    if (tooltipWordCategory) {
      lines.push({ label: "Category", value: tooltipWordCategory });
    }
    return lines;
  }, [tooltipTranslate, tooltipWordCategory]);

  const checkLabel = isFeedback ? (t("next") || "Next") : (t("check") || "Check");
  const hintLabel = t("hint") || "Hint";
  const revealLabel = t("reveal") || "Reveal";
  const skipLabel = t("skip") || "Skip";
  const nextLabel = t("next") || "Next";

  return (
    <div className="space-y-4">
      <div className="text-lg sm:text-xl leading-relaxed flex flex-wrap items-center gap-2">
        <span>{sent?.before}</span>
        <span className="inline-flex items-center gap-2">
          <span className="font-semibold text-neutral-900 px-1">
            {isFeedback ? answer : blankLabel}
          </span>
          {tooltipLines.length > 0 ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  aria-label="Translation and category"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30"
                >
                  ?
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="rounded-xl border border-neutral-200 bg-white p-3 text-sm shadow-lg">
                {tooltipLines.map(({ label, value }, idx) => (
                  <div
                    key={idx}
                    className={idx < tooltipLines.length - 1 ? "mb-2" : ""}
                  >
                    <span className="font-semibold text-neutral-900">
                      {label}:
                    </span>{" "}
                    <span className="text-neutral-700">{value}</span>
                  </div>
                ))}
              </HoverCardContent>
            </HoverCard>
          ) : null}
        </span>
        <span>{sent?.after}</span>
      </div>

      {showTranslate ? (
        <div className="text-sm text-neutral-600">{translate}</div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={disabledInput}
          placeholder={placeholder}
          className="h-10 min-w-[220px] flex-1 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 disabled:cursor-not-allowed disabled:opacity-60"
          onKeyDown={(e) => {
            if (e.key === "Enter") onCheck();
          }}
        />

        <Button type="button" onClick={onCheck} className="h-10">
          {checkLabel}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onToggleHint}
          className="h-10"
        >
          {hintLabel}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onReveal}
          disabled={isFeedback}
          className="h-10"
        >
          {revealLabel}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          disabled={isFeedback}
          className="h-10"
        >
          {skipLabel}
        </Button>

        <Button
          type="button"
          onClick={onNext}
          disabled={!isFeedback}
          className="h-10"
        >
          {nextLabel}
        </Button>
      </div>

      {showHint && hintText ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800">
          {hintText}
        </div>
      ) : null}
    </div>
  );
}

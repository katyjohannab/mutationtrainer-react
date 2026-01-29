import { useMemo } from "react";
import { Button } from "./ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "./ui/hover-card";
import {
  CheckIcon,
  LightBulbIcon,
  EyeIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/outline";

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
  instructionText,
}) {
  const isFeedback = cardState === "feedback";
  const baseword = sent?.base || "_____";

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

  return (
    <div className="space-y-5">
      {instructionText ? (
        <div className="text-sm text-neutral-600">{instructionText}</div>
      ) : null}

      <div className="flex justify-center">
        <div className="relative inline-flex">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-emerald-950 shadow-sm">
            {baseword}
          </div>

          {tooltipLines.length > 0 ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  aria-label="Translation and category"
                  className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30"
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
        </div>
      </div>

      {showTranslate ? (
        <div className="text-sm text-neutral-600">{translate}</div>
      ) : null}

      <div className="min-w-0 flex flex-wrap items-center gap-2 text-lg sm:text-xl leading-relaxed">
        <span className="whitespace-pre-wrap break-words">{sent?.before}</span>
        <input
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          disabled={disabledInput}
          placeholder={placeholder}
          className="h-11 min-w-[8ch] w-[10ch] sm:w-[12ch] max-w-full rounded-full border border-emerald-200 bg-white px-4 text-base text-neutral-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30 disabled:cursor-not-allowed disabled:opacity-60"
          onKeyDown={(e) => {
            if (e.key === "Enter") onCheck();
          }}
        />
        <span className="whitespace-pre-wrap break-words">{sent?.after}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={onCheck} className="h-10">
          <CheckIcon className="h-5 w-5" aria-hidden="true" />
          {checkLabel}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onToggleHint}
          className="h-10"
        >
          <LightBulbIcon className="h-5 w-5" aria-hidden="true" />
          {hintLabel}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onReveal}
          disabled={isFeedback}
          className="h-10"
        >
          <EyeIcon className="h-5 w-5" aria-hidden="true" />
          {revealLabel}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          disabled={isFeedback}
          className="h-10"
        >
          <ArrowUturnRightIcon className="h-5 w-5" aria-hidden="true" />
          {skipLabel}
        </Button>
      </div>

      {showHint && hintText ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-800">
          {hintText}
        </div>
      ) : null}
    </div>
  );
}

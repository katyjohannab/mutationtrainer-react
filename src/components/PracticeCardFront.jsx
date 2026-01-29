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
  const hoverCardContentClass =
    "w-64 max-w-[85vw] rounded-2xl border border-emerald-100 bg-white/95 p-4 text-sm text-neutral-800 shadow-xl backdrop-blur";

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
        <div className="text-sm text-emerald-900/80">{instructionText}</div>
      ) : null}

      <div className="flex justify-center">
        <div className="relative inline-flex">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/70 px-6 py-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-emerald-950 shadow-sm ring-1 ring-emerald-100/70">
            {baseword}
          </div>

          {tooltipLines.length > 0 ? (
            <HoverCard>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  aria-label="Translation and category"
                  className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-200 bg-red-500 text-xs font-semibold text-white shadow-sm transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
                >
                  ?
                </button>
              </HoverCardTrigger>
              <HoverCardContent
                side="top"
                align="center"
                sideOffset={12}
                collisionPadding={12}
                className={hoverCardContentClass}
              >
                <div className="space-y-2">
                  {tooltipLines.map(({ label, value }, idx) => (
                    <div key={idx}>
                      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        {label}
                      </div>
                      <div className="text-sm text-neutral-800">{value}</div>
                    </div>
                  ))}
                </div>
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
        <Button
          type="button"
          onClick={onCheck}
          className="h-10 border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <CheckIcon className="h-5 w-5" aria-hidden="true" />
          {checkLabel}
        </Button>

        <Button
          type="button"
          variant="default"
          onClick={onToggleHint}
          className="h-10 border-emerald-100 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
        >
          <LightBulbIcon className="h-5 w-5" aria-hidden="true" />
          {hintLabel}
        </Button>

        <Button
          type="button"
          variant="default"
          onClick={onReveal}
          disabled={isFeedback}
          className="h-10 border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
        >
          <EyeIcon className="h-5 w-5" aria-hidden="true" />
          {revealLabel}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          disabled={isFeedback}
          className="h-10 text-neutral-600 hover:text-neutral-800"
        >
          <ArrowUturnRightIcon className="h-5 w-5" aria-hidden="true" />
          {skipLabel}
        </Button>
      </div>

      {showHint && hintText ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3 text-sm text-emerald-950">
          {hintText}
        </div>
      ) : null}
    </div>
  );
}

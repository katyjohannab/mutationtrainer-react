import { useEffect, useMemo, useState } from "react";
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
import { cn } from "../lib/cn";

function normalizeChoice(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export default function PracticeCardChoices({
  sent,
  answer,
  cardState,
  choices,
  disabled,
  showTranslate,
  translate,
  hintText,
  showHint,
  onToggleHint,
  onPick,
  onCheck,
  onReveal,
  onSkip,
  onNext,
  t,
  tooltipTranslate,
  tooltipWordCategory,
  instructionText,
  guess,
}) {
  const isFeedback = cardState === "feedback";
  const baseword = sent?.base || "_____";
  const blankSlot = "_____";

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

  useEffect(() => {
    const handler = (event) => {
      if (disabled) return;
      if (event.key === "1" && choices[0]) {
        event.preventDefault();
        onPick?.(choices[0]);
      }
      if (event.key === "2" && choices[1]) {
        event.preventDefault();
        onPick?.(choices[1]);
      }
      if (event.key === "3" && choices[2]) {
        event.preventDefault();
        onPick?.(choices[2]);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [choices, disabled, onPick]);

  const checkLabel = isFeedback ? (t("next") || "Next") : (t("check") || "Check");
  const hintLabel = t("hint") || "Hint";
  const revealLabel = t("reveal") || "Reveal";
  const skipLabel = t("skip") || "Skip";

  const normalizedAnswer = normalizeChoice(answer);
  const normalizedGuess = normalizeChoice(guess);

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
        <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-base font-semibold text-neutral-700">
          {blankSlot}
        </span>
        <span className="whitespace-pre-wrap break-words">{sent?.after}</span>
      </div>

      <div className="mt-4 grid gap-2 sm:gap-3">
        {choices.map((choice, idx) => {
          const normalizedChoice = normalizeChoice(choice);
          const isCorrectChoice = isFeedback && normalizedChoice === normalizedAnswer;
          const isWrongChoice =
            isFeedback &&
            normalizedChoice === normalizedGuess &&
            normalizedChoice !== normalizedAnswer;
          const isSelected =
            !isFeedback && normalizedGuess && normalizedChoice === normalizedGuess;

          return (
            <button
              key={`${choice}-${idx}`}
              type="button"
              disabled={disabled}
              onClick={() => onPick?.(choice)}
              className={cn(
                "w-full rounded-xl border bg-white px-4 py-3 text-left text-sm sm:text-base shadow-sm transition hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/30",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                isSelected && "border-neutral-900 ring-2 ring-neutral-900/10",
                isCorrectChoice && "border-emerald-300 bg-emerald-50",
                isWrongChoice && "border-red-300 bg-red-50"
              )}
            >
              {idx + 1}. {choice}
            </button>
          );
        })}
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

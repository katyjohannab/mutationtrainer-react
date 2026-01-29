import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { cn } from "../lib/cn";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function PracticeCardFeedback({
  sent,
  answer,
  onHear,
  t,
  hearLabel,
  loadingLabel,
  ttsLoading,
  ttsError,
  last,
  whyEn,
  whyCy,
  lang,
  onNext,
}) {
  const [autoplay, setAutoplay] = useState(false);
  const autoplayKeyRef = useRef("");

  useEffect(() => {
    try {
      setAutoplay(localStorage.getItem("wm_autoplay") === "1");
    } catch {
      setAutoplay(false);
    }
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const key = `${answer}|${sent?.before ?? ""}|${sent?.after ?? ""}`;
    if (autoplayKeyRef.current === key) return;
    autoplayKeyRef.current = key;
    onHear?.();
  }, [autoplay, answer, sent, onHear]);

  const explanation = useMemo(() => {
    return lang === "cy" ? (whyCy || whyEn) : (whyEn || whyCy);
  }, [lang, whyEn, whyCy]);

  const outcomeText = useMemo(() => {
    if (!last) return "";
    if (last === "correct") return "";
    if (last === "wrong") return `${t("expected") || "Expected"}: ${answer}`;
    if (last === "revealed") return `${t("expected") || "Expected"}: ${answer}`;
    if (last === "skipped") return `${t("expected") || "Expected"}: ${answer}`;
    return "";
  }, [answer, last, t]);

  const whyLabel = t("why") || "Why";
  const statusLabel = useMemo(() => {
    if (!last) return "";
    if (last === "correct") return t("correct") || "Correct";
    if (last === "wrong") return t("notQuite") || "Not quite";
    if (last === "revealed") return t("revealed") || "Revealed";
    if (last === "skipped") return t("skipped") || "Skipped";
    return "";
  }, [last, t]);
  const isCorrect = last === "correct";
  const nextLabel = t("next") || "Next";
  const outcomeClass =
    last && last !== "correct" ? "text-red-700" : "text-neutral-700";

  return (
    <div className="space-y-5">
      {statusLabel ? (
        <div
          className={cn(
            "inline-flex rounded-full border px-4 py-2 text-sm font-semibold shadow-sm",
            isCorrect
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          )}
        >
          {statusLabel}
        </div>
      ) : null}

      <div className="text-lg sm:text-xl leading-relaxed">
        <span className="whitespace-pre-wrap break-words">{sent?.before}</span>
        <span className="mx-1 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold text-emerald-950 shadow-sm">
          {answer}
        </span>
        <span className="whitespace-pre-wrap break-words">{sent?.after}</span>
      </div>

      {outcomeText ? (
        <div className={cn("text-sm", outcomeClass)}>{outcomeText}</div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={onHear}
          disabled={ttsLoading}
          className="h-10 border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {ttsLoading ? loadingLabel : hearLabel}
        </Button>

        <ToggleGroup
          type="single"
          value={autoplay ? "on" : ""}
          onValueChange={(value) => {
            const next = value === "on";
            setAutoplay(next);
            try {
              localStorage.setItem("wm_autoplay", next ? "1" : "0");
            } catch {
              // ignore
            }
          }}
          className="ml-1"
        >
          <ToggleGroupItem
            value="on"
            aria-label="Autoplay"
            className="rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm transition data-[state=on]:border-emerald-600 data-[state=on]:bg-emerald-600 data-[state=on]:text-white"
          >
            Autoplay
          </ToggleGroupItem>
        </ToggleGroup>

        {ttsError ? (
          <div className="text-sm text-red-600">{ttsError}</div>
        ) : null}
      </div>

      {explanation ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 text-sm text-emerald-950">
          <div className="text-sm font-semibold text-emerald-950">
            {whyLabel}
          </div>
          <div className="mt-2">{explanation}</div>
        </div>
      ) : null}

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          onClick={onNext}
          className="h-10 border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {nextLabel}
          <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { cn } from "../lib/cn";
import {
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  XMarkIcon,
  ArrowUturnRightIcon,
  SpeakerWaveIcon,
} from "@heroicons/react/24/outline";

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
    last && last !== "correct" ? "text-destructive" : "text-muted-foreground";
  const statusIcon = useMemo(() => {
    if (!last) return null;
    if (last === "correct") return CheckIcon;
    if (last === "wrong") return XMarkIcon;
    if (last === "revealed") return EyeIcon;
    if (last === "skipped") return ArrowUturnRightIcon;
    return null;
  }, [last]);
  const StatusIcon = statusIcon;
  const panelClass = cn(
    "rounded-2xl border bg-card p-4 shadow-sm",
    last === "correct"
      ? "border-primary/30"
      : last
        ? "border-destructive/30"
        : "border-border"
  );

  return (
    <div className="space-y-5">
      {statusLabel ? (
        <Badge
          variant="outline"
          className={cn(
            "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide shadow-sm",
            isCorrect
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          )}
        >
          {StatusIcon ? (
            <StatusIcon className="h-4 w-4" aria-hidden="true" />
          ) : null}
          {statusLabel}
        </Badge>
      ) : null}

      <Card className={panelClass}>
        <CardContent className="space-y-4 p-0">
          <div className="text-base sm:text-lg leading-relaxed text-foreground">
            <span className="whitespace-pre-wrap break-words">{sent?.before}</span>
            <Badge
              variant="secondary"
              className="mx-1 rounded-full border border-border bg-muted text-base font-semibold text-foreground"
            >
              {answer}
            </Badge>
            <span className="whitespace-pre-wrap break-words">{sent?.after}</span>
          </div>

          {outcomeText ? (
            <div className={cn("text-sm", outcomeClass)}>{outcomeText}</div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="destructive"
              className="cursor-pointer gap-1.5 rounded-full px-3 py-1.5"
              onClick={onHear}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onHear?.()}
            >
              <SpeakerWaveIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {ttsLoading ? loadingLabel : hearLabel}
            </Badge>

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
              <ToggleGroupItem value="on" aria-label="Autoplay">
                Autoplay
              </ToggleGroupItem>
            </ToggleGroup>

            {ttsError ? (
              <div className="text-sm text-destructive">{ttsError}</div>
            ) : null}
          </div>

          {explanation ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              <div className="text-xs font-semibold uppercase tracking-wide text-foreground">
                {whyLabel}
              </div>
              <div className="mt-2">{explanation}</div>
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button type="button" onClick={onNext}>
              {nextLabel}
              <ArrowRightIcon aria-hidden="true" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

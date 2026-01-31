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
    "rounded-2xl border p-4",
    last === "correct"
      ? "border-primary/30 bg-primary/10"
      : last
        ? "border-destructive/30 bg-destructive/10"
        : "border-border bg-card"
  );

  return (
    <div className="space-y-5">
      {statusLabel ? (
        <Badge
          variant="outline"
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-semibold shadow-sm",
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
        <CardContent className="space-y-3 p-0">
          <div className="text-lg sm:text-xl leading-relaxed text-foreground">
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
              variant="outline"
              role="button"
              tabIndex={0}
              onClick={onHear}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onHear();
                }
              }}
              className="uppercase text-[11px] px-2 py-1 rounded-md tracking-wide border-destructive/30 bg-destructive/10 text-destructive shadow-sm cursor-pointer"
            >
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
              <ToggleGroupItem
                value="on"
                aria-label="Autoplay"
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/80 shadow-sm transition data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                Autoplay
              </ToggleGroupItem>
            </ToggleGroup>

            {ttsError ? (
              <div className="text-sm text-destructive">{ttsError}</div>
            ) : null}
          </div>

          {explanation ? (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              <div className="text-sm font-semibold text-foreground">
                {whyLabel}
              </div>
              <div className="mt-2">{explanation}</div>
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={onNext}
              className="h-10 border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              {nextLabel}
              <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

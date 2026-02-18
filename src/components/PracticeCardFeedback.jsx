import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import { Card, CardContent } from "./ui/card";
import { badgeVariants } from "./ui/badge";
import { cn } from "../lib/cn";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  X,
  Undo2,
  Volume2,
} from "lucide-react";
import AppIcon from "./icons/AppIcon";

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
  onResult,
  mode,
  pendingResult,
  pendingReviewId,
}) {
  const [autoplay, setAutoplay] = useState(() => {
    try {
      return localStorage.getItem("wm_autoplay") === "1";
    } catch {
      return false;
    }
  });
  const autoplayKeyRef = useRef("");

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
  const isRevealed = last === "revealed";
  const hearButtonVariant = "cymru-light";
  const nextLabel = t("next") || "Next";
  const easyLabel = t("easy") || "Easy";
  const hardLabel = t("hard") || "Hard";
  const greenOutlineClass =
    "border-[hsl(var(--cymru-green))] text-[hsl(var(--cymru-green))] hover:bg-[hsl(var(--cymru-green-wash))] hover:text-[hsl(var(--cymru-green))] hover:shadow-sm";
  const redOutlineClass =
    "border-[hsl(var(--cymru-red))] text-[hsl(var(--cymru-red))] hover:bg-[hsl(var(--cymru-red-wash))] hover:text-[hsl(var(--cymru-red))] hover:shadow-sm";
  const statusIcon = useMemo(() => {
    if (!last) return null;
    if (last === "correct") return CheckCircle2;
    if (last === "wrong") return X;
    if (last === "revealed") return Eye;
    if (last === "skipped") return Undo2;
    return null;
  }, [last]);
  const panelClass = cn(
    "rounded-2xl border border-border p-5 shadow-md",
    isCorrect
      ? "bg-[image:var(--gradient-correct)]"
      : isRevealed
        ? "bg-[image:var(--gradient-revealed)]"
        : "bg-[image:var(--gradient-incorrect)]"
  );
  const isSmartMode = mode === "smart";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSmartResult = (result) => {
    if (!onResult || isSubmitting) return;
    setIsSubmitting(true);
    onResult({
      result,
      baseResult: pendingResult,
      reviewId: pendingReviewId,
    });
  };

  return (
    <div className="space-y-5">
      <Card className={panelClass}>
        <CardContent className="space-y-5 p-0">
          {statusLabel ? (
            <div className="flex items-center gap-3">
              {statusIcon ? (
                <AppIcon
                  icon={statusIcon}
                  className="h-10 w-10 text-white flex-shrink-0"
                  aria-hidden="true"
                />
              ) : null}
              <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
                {statusLabel}
              </h1>
            </div>
          ) : null}

          {/* White content window */}
          <div className="rounded-xl bg-card p-5 shadow-sm space-y-4">
            <p className="text-xl sm:text-2xl leading-relaxed text-foreground font-medium">
              <span className="whitespace-pre-wrap break-words">{sent?.before}</span>
              <span className="mx-1 rounded-md border border-[hsl(var(--cymru-gold))] bg-[hsl(var(--cymru-gold-wash))] px-2 py-0.5 font-semibold text-foreground">
                {answer}
              </span>
              <span className="whitespace-pre-wrap break-words">{sent?.after}</span>
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onHear}
                className={cn(
                  badgeVariants({ variant: hearButtonVariant }),
                  "cursor-pointer select-none rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  "inline-flex items-center gap-1.5"
                )}
              >
                <AppIcon icon={Volume2} className="h-3.5 w-3.5" aria-hidden="true" />
                {ttsLoading ? loadingLabel : hearLabel}
              </button>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={autoplay}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setAutoplay(next);
                    try {
                      localStorage.setItem("wm_autoplay", next ? "1" : "0");
                    } catch {
                      // ignore
                    }
                  }}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                Autoplay
              </label>

              {ttsError ? (
                <div className="text-sm text-destructive">{ttsError}</div>
              ) : null}
            </div>

            {explanation ? (
              <div className="rounded-lg bg-[hsl(var(--cymru-neutral)/0.35)] p-4 text-sm text-foreground">
                <div className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                  {whyLabel}
                </div>
                <div className="mt-2 text-foreground/90">
                  {(() => {
                    // Simple bold parser for **text**
                    const parts = explanation.split(/(\*\*[^*]+\*\*)/g);
                    return parts.map((part, i) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return <strong key={i}>{part.slice(2, -2)}</strong>;
                      }
                      return <span key={i}>{part}</span>;
                    });
                  })()}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {isSmartMode ? (
              <>
                <ButtonGroup className="flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSmartResult("again")}
                    size="action"
                    disabled={isSubmitting}
                    className={redOutlineClass}
                  >
                    <AppIcon icon={X} className="h-4 w-4" aria-hidden="true" />
                    {hardLabel}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSmartResult("easy")}
                    size="action"
                    disabled={isSubmitting}
                    className={greenOutlineClass}
                  >
                    <AppIcon icon={CheckCircle2} className="h-4 w-4" aria-hidden="true" />
                    {easyLabel}
                  </Button>
                </ButtonGroup>
                <ButtonGroup>
                  <Button
                    type="button"
                    onClick={() => handleSmartResult("next")}
                    size="action"
                    disabled={isSubmitting}
                  >
                    {nextLabel}
                    <AppIcon icon={ArrowRight} className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </ButtonGroup>
              </>
            ) : (
              <Button type="button" onClick={onNext} size="action">
                {nextLabel}
                <AppIcon icon={ArrowRight} className="h-5 w-5" aria-hidden="true" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

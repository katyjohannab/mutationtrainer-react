import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import { Card, CardContent } from "./ui/card";
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
  sentenceTranslation,
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
  const sentenceTranslationLabel =
    t("feedbackSentenceTranslation") || "Sentence translation";
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
  const nextLabel = t("next") || "Next";
  const easyLabel = t("easy") || "Easy";
  const hardLabel = t("hard") || "Hard";
  const statusIcon = useMemo(() => {
    if (!last) return null;
    if (last === "correct") return CheckCircle2;
    if (last === "wrong") return X;
    if (last === "revealed") return Eye;
    if (last === "skipped") return Undo2;
    return null;
  }, [last]);
  // Gradient panel at all sizes with nested white content window
  const panelClass = cn(
    "rounded-2xl border border-border p-3.5 sm:p-5 shadow-md",
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
    <div className="space-y-4 sm:space-y-5">
      <Card className={panelClass}>
        <CardContent className="space-y-4 sm:space-y-5 p-0">
          {statusLabel ? (
            <div className="flex items-center gap-2.5 sm:gap-3">
              {statusIcon ? (
                <AppIcon
                  icon={statusIcon}
                  className="h-8 w-8 sm:h-10 sm:w-10 text-white flex-shrink-0"
                  aria-hidden="true"
                />
              ) : null}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white">
                {statusLabel}
              </h1>
            </div>
          ) : null}

          {/* Nested white content window */}
          <div className="rounded-xl bg-card p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
            <p className="text-lg sm:text-xl md:text-2xl leading-relaxed font-medium text-foreground">
              <span className="whitespace-pre-wrap break-words">{sent?.before}</span>
              <span className="mx-1.5 sm:mx-1 rounded-md border border-[hsl(var(--cymru-gold))] bg-[hsl(var(--cymru-gold-wash))] px-2.5 py-0.5 font-semibold text-foreground">
                {answer}
              </span>
              <span className="whitespace-pre-wrap break-words">{sent?.after}</span>
            </p>

            {sentenceTranslation ? (
              <div className="rounded-lg border border-border/70 bg-muted/35 px-3 sm:px-4 py-2.5 sm:py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {sentenceTranslationLabel}
                </p>
                <p className="mt-1 text-sm sm:text-base leading-relaxed text-foreground">
                  {sentenceTranslation}
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onHear}
                className={cn(
                  "cursor-pointer select-none rounded-full px-3 py-1.5 sm:py-1 text-xs font-semibold transition-colors min-h-[36px] sm:min-h-0",
                  "inline-flex items-center gap-1.5",
                  "bg-[hsl(var(--cymru-green-light-wash))] text-[hsl(var(--cymru-green-light))] border-transparent hover:bg-[hsl(var(--cymru-green-light-wash)/0.82)]"
                )}
              >
                <AppIcon icon={Volume2} className="h-4 w-4 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
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
                  className="h-5 w-5 sm:h-4 sm:w-4 rounded border-border text-primary focus:ring-primary"
                />
                Autoplay
              </label>

              {ttsError ? (
                <div className="text-sm text-destructive">{ttsError}</div>
              ) : null}
            </div>

            {explanation ? (
              <div className="rounded-xl bg-[hsl(var(--cymru-neutral)/0.35)] p-3 sm:p-4 text-sm">
                <div className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                  {whyLabel}
                </div>
                <div className="mt-1.5 sm:mt-2 text-foreground/90 leading-relaxed">
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

          {/* Action buttons — stacked full-width on mobile, inline on sm+ */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-end gap-2 pt-2 sm:pt-0">
            {isSmartMode ? (
              <>
                <ButtonGroup className="flex w-full sm:w-auto gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSmartResult("again")}
                    size="action"
                    disabled={isSubmitting}
                    className={cn(
                      "flex-1 sm:flex-initial h-12 sm:h-auto rounded-xl active:scale-[0.98]",
                      "bg-transparent border-[hsl(var(--cymru-red))] text-[hsl(var(--cymru-red))] hover:bg-[hsl(var(--cymru-red-wash))]"
                    )}
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
                    className={cn(
                      "flex-1 sm:flex-initial h-12 sm:h-auto rounded-xl active:scale-[0.98]",
                      "bg-transparent border-[hsl(var(--cymru-green))] text-[hsl(var(--cymru-green))] hover:bg-[hsl(var(--cymru-green-wash))]"
                    )}
                  >
                    <AppIcon icon={CheckCircle2} className="h-4 w-4" aria-hidden="true" />
                    {easyLabel}
                  </Button>
                </ButtonGroup>
                <ButtonGroup className="w-full sm:w-auto">
                  <Button
                    type="button"
                    onClick={() => handleSmartResult("next")}
                    size="action"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto h-12 sm:h-auto rounded-xl active:scale-[0.98] bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {nextLabel}
                    <AppIcon icon={ArrowRight} className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </ButtonGroup>
              </>
            ) : (
              <Button
                type="button"
                onClick={onNext}
                size="action"
                className="w-full sm:w-auto h-12 sm:h-auto rounded-xl active:scale-[0.98] bg-primary text-primary-foreground hover:bg-primary/90"
              >
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

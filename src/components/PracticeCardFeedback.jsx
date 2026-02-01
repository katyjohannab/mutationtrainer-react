import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Badge } from "./ui/badge";
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
  const nextLabel = t("next") || "Next";
  const statusIcon = useMemo(() => {
    if (!last) return null;
    if (last === "correct") return CheckCircle2;
    if (last === "wrong") return X;
    if (last === "revealed") return Eye;
    if (last === "skipped") return Undo2;
    return null;
  }, [last]);
  const panelClass = cn(
    "rounded-2xl border p-5 shadow-sm",
    isCorrect
      ? "border-secondary/40 bg-[image:var(--gradient-correct)]"
      : "border-destructive/30 bg-[image:var(--gradient-incorrect)]"
  );

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
          <div className="rounded-xl bg-card p-5 space-y-4">
            <p className="text-xl sm:text-2xl leading-relaxed text-foreground font-medium">
              <span className="whitespace-pre-wrap break-words">{sent?.before}</span>
              <span className="mx-1 rounded-md border border-[hsl(var(--cymru-gold))] bg-[hsl(var(--cymru-gold-wash))] px-2 py-0.5 font-semibold text-foreground">
                {answer}
              </span>
              <span className="whitespace-pre-wrap break-words">{sent?.after}</span>
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="destructive"
                className="cursor-pointer gap-1.5 rounded-full px-3 py-1.5"
                onClick={onHear}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onHear?.()}
              >
                <AppIcon icon={Volume2} className="h-3.5 w-3.5" aria-hidden="true" />
                {ttsLoading ? loadingLabel : hearLabel}
              </Badge>

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
                <div className="mt-2 text-foreground/90">{explanation}</div>
              </div>
            ) : null}
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={onNext} size="lg">
              {nextLabel}
              <AppIcon icon={ArrowRight} className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

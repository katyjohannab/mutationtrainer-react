import React, { useEffect, useState } from "react";
import { Lightbulb, MousePointerClick, Repeat, X } from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import { cn } from "../lib/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import AppIcon from "./icons/AppIcon";

const STORAGE_KEY = "wm_onboarding_dismissed";

/**
 * WelcomeModal — First-visit onboarding modal.
 * Matches HeroPill gradient header aesthetic.
 */
export default function WelcomeModal({ forceOpen = false, onClose }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(forceOpen);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Sync with forceOpen prop
  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
    }
  }, [forceOpen]);

  // Check localStorage on mount for auto-open
  useEffect(() => {
    if (!forceOpen) {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        setOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setOpen(false);
    onClose?.();
  };

  const steps = [
    {
      icon: MousePointerClick,
      titleKey: "onboardingStep1Title",
      descKey: "onboardingStep1Desc",
      fallbackTitle: "Pick a pack",
      fallbackDesc: "Choose a Practice Pack or design your own session with filters.",
    },
    {
      icon: Lightbulb,
      titleKey: "onboardingStep2Title",
      descKey: "onboardingStep2Desc",
      fallbackTitle: "Practice mutations",
      fallbackDesc: "Type or tap the mutated form of the baseword shown.",
    },
    {
      icon: Repeat,
      titleKey: "onboardingStep3Title",
      descKey: "onboardingStep3Desc",
      fallbackTitle: "Build your streak",
      fallbackDesc: "Keep going to improve your accuracy and unlock longer streaks.",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        className={cn(
          "max-w-md overflow-hidden rounded-2xl border-0 p-0 shadow-xl",
          "sm:max-w-lg"
        )}
      >
        {/* Gradient header bar - matches HeroPill */}
        <div
          className="h-2 w-full"
          style={{
            background:
              "linear-gradient(90deg, hsl(var(--cymru-red)) 0%, hsl(var(--cymru-green)) 50%, hsl(var(--cymru-green-light)) 100%)",
          }}
          aria-hidden="true"
        />

        <div className="px-6 pt-5 pb-6 space-y-5">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-foreground">
              {t("onboardingWelcome") || "Welcome to Treiglap!"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t("onboardingSubtitle") || "Master Welsh mutations with focused practice."}
            </DialogDescription>
          </DialogHeader>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                {/* Icon circle - uses cymru colors */}
                <span
                  className={cn(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    idx === 0 && "bg-[hsl(var(--cymru-green-wash))] text-[hsl(var(--cymru-green))]",
                    idx === 1 && "bg-[hsl(var(--cymru-gold-wash))] text-[hsl(var(--cymru-gold))]",
                    idx === 2 && "bg-[hsl(var(--cymru-green-light-wash))] text-[hsl(var(--cymru-green-light))]"
                  )}
                >
                  <AppIcon icon={step.icon} className="h-4 w-4" aria-hidden="true" />
                </span>

                {/* Text */}
                <div className="space-y-0.5 pt-0.5">
                  <p className="text-sm font-semibold text-foreground">
                    {t(step.titleKey) || step.fallbackTitle}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(step.descKey) || step.fallbackDesc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={handleClose}
              className="w-full rounded-xl"
              size="lg"
            >
              {t("onboardingGotIt") || "Got it!"}
            </Button>

            <label className="flex items-center justify-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/50"
              />
              <span className="text-xs text-muted-foreground">
                {t("onboardingDontShow") || "Don't show this again"}
              </span>
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

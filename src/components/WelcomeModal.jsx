import React, { useEffect, useState } from "react";
import { AlertTriangle, Lightbulb, MousePointerClick, Repeat } from "lucide-react";
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
  const { t, lang, setLang } = useI18n();
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

  const sections = [
    {
      icon: MousePointerClick,
      titleKey: "onboardingStep1Title",
      descKey: "onboardingStep1Desc",
      desc2Key: "onboardingStep1Desc2",
      colorClass: "bg-[hsl(var(--cymru-green-wash))] text-[hsl(var(--cymru-green))]",
    },
    {
      icon: Lightbulb,
      titleKey: "onboardingStep2Title",
      descKey: "onboardingStep2Desc",
      desc2Key: "onboardingStep2Desc2",
      colorClass: "bg-[hsl(var(--cymru-gold-wash))] text-[hsl(var(--cymru-gold))]",
      bullets: ["onboardingStep2Bullet1", "onboardingStep2Bullet2"],
    },
    {
      icon: Repeat,
      titleKey: "onboardingStep3Title",
      descKey: "onboardingStep3Desc",
      colorClass: "bg-[hsl(var(--cymru-green-light-wash))] text-[hsl(var(--cymru-green-light))]",
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

        <div className="max-h-[85vh] overflow-y-auto px-6 pt-5 pb-6 space-y-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setLang(lang === "cy" ? "en" : "cy")}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            >
              {lang === "cy" ? t("onboardingShowEnglish") : t("onboardingShowWelsh")}
            </button>
          </div>

          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-foreground">
              {t("onboardingWelcome")}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground space-y-2">
              <p>{t("onboardingSubtitle")}</p>
              <p>{t("onboardingSubtitle2")}</p>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {sections.map((section, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span
                  className={cn(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    section.colorClass
                  )}
                >
                  <AppIcon icon={section.icon} className="h-4 w-4" aria-hidden="true" />
                </span>

                <div className="space-y-1 pt-0.5">
                  <p className="text-sm font-semibold text-foreground">{t(section.titleKey)}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(section.descKey)}</p>
                  {section.desc2Key ? (
                    <p className="text-xs text-muted-foreground leading-relaxed">{t(section.desc2Key)}</p>
                  ) : null}
                  {section.bullets ? (
                    <ul className="list-disc pl-4 space-y-1">
                      {section.bullets.map((key) => (
                        <li key={key} className="text-xs text-muted-foreground leading-relaxed">
                          {t(key)}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">{t("onboardingFinalNoteTitle")}</span>{" "}
            {t("onboardingFinalNoteBody")}
          </p>

          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--cymru-red-wash))] text-[hsl(var(--cymru-red))]">
              <AppIcon icon={AlertTriangle} className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="space-y-1 pt-0.5">
              <p className="text-sm font-semibold text-[hsl(var(--cymru-red))]">{t("onboardingMistakeTitle")}</p>
              <p className="text-xs leading-relaxed text-foreground">{t("onboardingMistakeBody")}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button onClick={handleClose} className="w-full rounded-xl" size="lg">
              {t("onboardingGotIt")}
            </Button>

            <label className="flex items-center justify-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/50"
              />
              <span className="text-xs text-muted-foreground">{t("onboardingDontShow")}</span>
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

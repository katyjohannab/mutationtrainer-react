import React, { useState } from "react";
import { MessageSquareWarning, Github, Mail, Send, ExternalLink } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { cn } from "../lib/cn";
import { useI18n } from "../i18n/I18nContext";
import AppIcon from "./icons/AppIcon";

const GITHUB_REPO = "katyjane/mutationtrainer-react";
const CONTACT_EMAIL = "katyjohannabenson@gmail.com";

/**
 * "Noticed a mistake?" button + dialog.
 *
 * @param {string} cardId - Current card ID from CSV
 */
export default function ReportMistake({ cardId }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [mistakeType, setMistakeType] = useState("current"); // "current" | "other"
  const [description, setDescription] = useState("");
  const [notifyVia, setNotifyVia] = useState("email"); // "email" | "github"

  function handleOpen(isOpen) {
    setOpen(isOpen);
    if (isOpen) {
      setMistakeType("current");
      setDescription("");
      setNotifyVia("email");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    const subject = encodeURIComponent(
      `[Mutation Trainer] Card report: ${cardId}`
    );
    const bodyParts = [
      `Card ID: ${cardId}`,
      `Mistake type: ${mistakeType === "current" ? "Current card" : "Something else"}`,
      `Description: ${description}`,
    ];
    const body = encodeURIComponent(bodyParts.join("\n"));

    if (notifyVia === "github") {
      const labels = encodeURIComponent("bug,card-report");
      window.open(
        `https://github.com/${GITHUB_REPO}/issues/new?title=${subject}&body=${body}&labels=${labels}`,
        "_blank"
      );
    } else {
      window.open(
        `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`,
        "_blank"
      );
    }

    setOpen(false);
  }

  const toggleItemClass = cn(
    "h-8 flex-1 px-3 py-0 rounded-md text-xs font-medium leading-none",
    "border border-transparent transition-colors",
    "hover:bg-muted/50",
    "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary/60"
  );

  const toggleGroupClass =
    "flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5 w-full";

  const reportLabel = t("reportMistake") || "Noticed a mistake?";

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Badge variant="warning" className="cursor-pointer gap-1.5">
          <ExternalLink className="h-3 w-3" />
          {reportLabel}
        </Badge>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-base">
              {t("reportTitle") || "Report a mistake"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {t("reportFriendlyMessage") ||
                "Sorry about that! I am a Welsh learner myself and this app is in a development phase so I can't guarantee everything is perfect yet… Supporting me by reporting any mistakes you come across will help this app get bigger, better and reach more people so thank you very much!"}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Card ID (read-only) */}
            <div className="space-y-1.5">
              <Label htmlFor="report-card-id" className="text-xs text-muted-foreground">
                {t("reportCardId") || "Card ID"}
              </Label>
              <Input
                id="report-card-id"
                value={cardId}
                readOnly
                className="h-8 text-xs font-mono bg-muted/40"
              />
            </div>

            {/* Where is the mistake? */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("reportWhereLabel") || "Where is the mistake?"}
              </Label>
              <ToggleGroup
                type="single"
                value={mistakeType}
                onValueChange={(v) => v && setMistakeType(v)}
                className={toggleGroupClass}
              >
                <ToggleGroupItem value="current" className={toggleItemClass}>
                  {t("reportCurrentCard") || "This card"}
                </ToggleGroupItem>
                <ToggleGroupItem value="other" className={toggleItemClass}>
                  {t("reportSomethingElse") || "Something else"}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="report-desc" className="text-xs text-muted-foreground">
                {t("reportDescLabel") || "Describe the issue"}
              </Label>
              <Textarea
                id="report-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  t("reportDescPlaceholder") ||
                  "e.g. The expected answer seems wrong…"
                }
                className="min-h-[72px] text-sm resize-none"
              />
            </div>

            {/* Notify via */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("reportNotifyLabel") || "Notify via"}
              </Label>
              <ToggleGroup
                type="single"
                value={notifyVia}
                onValueChange={(v) => v && setNotifyVia(v)}
                className={toggleGroupClass}
              >
                <ToggleGroupItem value="email" className={toggleItemClass}>
                  <AppIcon icon={Mail} className="h-3 w-3 mr-1.5" aria-hidden="true" />
                  {t("reportEmail") || "Email"}
                </ToggleGroupItem>
                <ToggleGroupItem value="github" className={toggleItemClass}>
                  <AppIcon icon={Github} className="h-3 w-3 mr-1.5" aria-hidden="true" />
                  GitHub
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <DialogFooter className="mt-5">
            <Button type="submit" size="sm" className="w-full sm:w-auto">
              <AppIcon icon={Send} className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              {t("reportSubmit") || "Send report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

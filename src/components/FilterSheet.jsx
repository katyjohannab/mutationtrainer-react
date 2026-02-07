import { X } from "lucide-react";
import AppIcon from "./icons/AppIcon";
import { useI18n } from "../i18n/I18nContext";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";

export default function FilterSheet({ open, onOpenChange, title, children }) {
  const { t } = useI18n();
  const displayTitle = title || t("headerFilters");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent position="right" className="flex h-full max-w-sm flex-col overflow-hidden">
        <SheetHeader>
          <SheetTitle>{displayTitle}</SheetTitle>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("close") || "Close"}
            >
              <AppIcon icon={X} className="h-5 w-5" aria-hidden="true" />
            </Button>
          </SheetClose>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

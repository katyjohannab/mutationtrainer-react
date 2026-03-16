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
      <SheetContent 
        side="right" 
        showClose={false}
        className="flex h-full w-[88vw] max-w-md flex-col overflow-hidden p-0"
      >
        {/* Fixed header */}
        <SheetHeader className="flex-shrink-0 flex flex-row items-center justify-between gap-2 border-b border-border/60 px-5 py-3.5">
          <SheetTitle className="text-base font-semibold">{displayTitle}</SheetTitle>
          <SheetClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg"
              aria-label={t("close") || "Close"}
            >
              <AppIcon icon={X} className="h-4 w-4" aria-hidden="true" />
            </Button>
          </SheetClose>
        </SheetHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

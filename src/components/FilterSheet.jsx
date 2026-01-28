import { XMarkIcon } from "@heroicons/react/24/outline";
import { useI18n } from "../i18n/I18nContext";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Button } from "./ui/button";

export default function FilterSheet({ open, onOpenChange, children }) {
  const { t } = useI18n();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent position="right" className="max-w-sm">
        <SheetHeader>
          <SheetTitle>{t("headerFilters")}</SheetTitle>
          <SheetClose asChild>
            <Button
              variant="icon"
              size="icon"
              aria-label={t("headerFilters")}
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </Button>
          </SheetClose>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

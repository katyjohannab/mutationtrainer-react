import { XMarkIcon } from "@heroicons/react/24/outline";
import { useI18n } from "../i18n/I18nContext";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "./ui/dialog";

export default function FilterDrawer({ open, onOpenChange, children }) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <DialogTitle>{t("headerFilters")}</DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              className="mt-iconbtn"
              aria-label={t("headerFilters")}
            >
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </DialogClose>
        </div>
        <div className="p-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

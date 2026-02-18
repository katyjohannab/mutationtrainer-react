import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import AppIcon from "../icons/AppIcon";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function CardTranslationPopover({
  word,
  category,
  t,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  if (!word) return null;

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("translationButton") || "Translate"}
            className={cn(
              "h-5 w-5 sm:h-6 sm:w-6 rounded-full !border-2 !border-[hsl(var(--cymru-gold))] !bg-card !text-[hsl(var(--cymru-gold))] shadow-[0_1px_4px_rgba(0,0,0,0.18)] transition-[transform,box-shadow,color,border-color,background-color] duration-150 hover:!border-[hsl(var(--cymru-gold))] hover:!bg-card hover:!text-[hsl(var(--cymru-gold))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--cymru-gold)/0.5)]",
              !open &&
                "hover:-translate-y-px hover:shadow-[0_4px_10px_rgba(0,0,0,0.22)] active:translate-y-0 active:shadow-[0_1px_4px_rgba(0,0,0,0.18)]"
            )}
          >
            <span className="text-[10px] sm:text-xs font-extrabold leading-none">?</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side={isMobile ? "bottom" : "right"}
          align={isMobile ? "end" : "start"}
          sideOffset={isMobile ? 10 : 8}
          collisionPadding={10}
          className="relative w-[min(14.5rem,calc(100vw-1rem))] rounded-xl border border-border bg-popover p-2.5 text-popover-foreground shadow-md sm:w-max sm:max-w-[16rem] data-[state=open]:animate-none data-[state=closed]:animate-none"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("close") || "Close"}
            className={cn(
              "absolute right-1.5 top-1.5 inline-flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              isMobile ? "hidden" : "h-6 w-6"
            )}
          >
            <AppIcon icon={X} className="h-3.5 w-3.5" aria-hidden="true" />
          </button>

          <div className={cn("space-y-2", isMobile ? "pr-0" : "pr-7")}>
            <p className="text-base font-semibold leading-tight text-foreground break-words sm:text-lg">
              {word}
            </p>
            {category ? (
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {`${t("translationCategoryLabel") || "Category"}:`}
                </p>
                <Badge
                  variant="cymru-light-wash"
                  className="rounded-full px-2 py-0.5 text-xs pointer-events-none"
                >
                  {category}
                </Badge>
              </div>
            ) : null}
          </div>

          {isMobile ? (
            <Button
              type="button"
              variant="outline-secondary"
              size="sm"
              onClick={() => setOpen(false)}
              className="mt-2 h-8 w-full rounded-lg"
            >
              {t("close") || "Close"}
            </Button>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  );
}

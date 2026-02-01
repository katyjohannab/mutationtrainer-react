import * as React from "react";
import { cn } from "../../lib/cn";

const GlassPanel = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default:
        "bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10",
      light:
        "bg-white/30 dark:bg-white/3 backdrop-blur-sm border border-white/15 dark:border-white/8",
      strong:
        "bg-white/50 dark:bg-white/8 backdrop-blur-xl border border-white/25 dark:border-white/15",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg shadow-sm",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

GlassPanel.displayName = "GlassPanel";

export { GlassPanel };

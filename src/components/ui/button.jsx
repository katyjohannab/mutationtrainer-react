import * as React from "react";
import { cn } from "../../lib/cn";

const variantClasses = {
  default:
    "bg-card/90 text-foreground border border-border hover:bg-muted shadow-sm active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2",
  ghost:
    "bg-transparent text-muted-foreground border border-transparent hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2",
  icon:
    "bg-card/90 text-muted-foreground border border-border hover:bg-muted shadow-sm active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2",
  pill:
    "bg-card text-foreground border border-border hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2",
};

const activeVariants = {
  default: "bg-primary/10 text-primary border-primary/30 shadow",
  pill: "bg-primary/10 text-primary border-primary/30",
};

const sizeClasses = {
  default: "px-3 py-2 text-sm rounded-full",
  sm: "px-2 py-1 text-xs rounded-full",
  icon: "p-2 rounded-full",
};

export function Button({
  variant = "default",
  size = "default",
  active = false,
  className,
  ...props
}) {
  const variantClass = cn(
    variantClasses[variant],
    active ? activeVariants[variant] : undefined,
    sizeClasses[size],
    "inline-flex items-center justify-center gap-2 font-medium transition duration-150",
    className
  );

  return <button className={variantClass} {...props} />;
}

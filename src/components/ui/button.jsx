import * as React from "react";
import { cn } from "../../lib/cn";

const variantClasses = {
  default:
    "bg-white/90 text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-emerald-700/40 focus-visible:ring-offset-2",
  ghost:
    "bg-transparent text-gray-700 border border-transparent hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-emerald-700/40 focus-visible:ring-offset-2",
  icon:
    "bg-white/90 text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-emerald-700/40 focus-visible:ring-offset-2",
  pill:
    "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-emerald-700/40 focus-visible:ring-offset-2",
};

const activeVariants = {
  default: "bg-emerald-50 text-emerald-900 border-emerald-200 shadow",
  pill: "bg-emerald-50 text-emerald-900 border-emerald-800/40",
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

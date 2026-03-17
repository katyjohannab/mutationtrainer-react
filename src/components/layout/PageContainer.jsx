import React from "react";
import { cn } from "../../lib/cn";

export default function PageContainer({
  as: Component = "div",
  className,
  children,
  ...props
}) {
  return (
    <Component
      className={cn(
        "mx-auto w-full max-w-5xl px-4 sm:max-w-6xl sm:px-6 lg:px-8 xl:max-w-screen-xl 2xl:max-w-screen-2xl 2xl:px-6",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

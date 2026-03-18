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
        "mx-auto w-full max-w-5xl px-4 sm:max-w-6xl sm:px-6 lg:max-w-[76rem] lg:px-8 xl:max-w-[84rem] 2xl:max-w-[98rem]",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

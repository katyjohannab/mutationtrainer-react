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
        "mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-5xl md:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem]",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

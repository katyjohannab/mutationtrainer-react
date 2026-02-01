import React from "react";

export default function AppIcon({
  icon: Icon,
  className,
  size,
  strokeWidth = 2.5,
  ...props
}) {
  if (!Icon) return null;
  return (
    <Icon
      className={className}
      size={size}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}

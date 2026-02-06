import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/90",
        success:
          "border-transparent bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.25)]",
        soft:
          "border-secondary/30 bg-secondary/15 text-foreground hover:bg-secondary/25",
        outline:
          "border-border bg-transparent text-foreground hover:bg-secondary/15",
        "cymru-dark":
          "border-transparent bg-[hsl(var(--cymru-green))] text-[hsl(var(--cymru-white))] hover:bg-[hsl(var(--cymru-green)/0.9)]",
        "cymru-light":
          "border-transparent bg-[hsl(var(--cymru-green-light))] text-[hsl(var(--cymru-white))] hover:bg-[hsl(var(--cymru-green-light)/0.9)]",
        "cymru-dark-wash":
          "border-transparent bg-[hsl(var(--cymru-green-wash))] text-[hsl(var(--cymru-green))] hover:bg-[hsl(var(--cymru-green-wash)/0.85)]",
        "cymru-light-wash":
          "border-transparent bg-[hsl(var(--cymru-green-light)/0.2)] text-[hsl(var(--cymru-green-light))] hover:bg-[hsl(var(--cymru-green-light)/0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

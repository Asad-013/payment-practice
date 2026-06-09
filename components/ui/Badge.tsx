import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-white/5 border border-border text-foreground hover:bg-white/10",
        destructive: "border-transparent bg-destructive/15 text-destructive border border-destructive/20",
        outline: "text-foreground border-border",
        success: "border-transparent bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
        warning: "border-transparent bg-amber-500/10 text-amber-400 border border-amber-500/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status?: string;
}

function Badge({ className, variant, status, ...props }: BadgeProps) {
  let mappedVariant = variant
  let text = props.children

  if (status) {
    text = status.charAt(0).toUpperCase() + status.slice(1)
    switch (status) {
      case "completed":
      case "processing":
        mappedVariant = "success"
        break
      case "pending":
        mappedVariant = "warning"
        break
      case "cancelled":
      case "failed":
        mappedVariant = "destructive"
        break
      default:
        mappedVariant = "secondary"
    }
  }

  return (
    <div className={cn(badgeVariants({ variant: mappedVariant }), className)} {...props}>
      {text}
    </div>
  )
}

export { Badge, badgeVariants }

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-[var(--font-mono)] text-xs font-semibold whitespace-nowrap select-none transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 tabular-nums",
  {
    variants: {
      variant: {
        default:
          "border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]",
        secondary:
          "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-2)]",
        outline:
          "border border-[var(--line)] text-[var(--ink-2)]",
        success:
          "border border-[var(--positive)]/30 bg-[var(--positive)]/10 text-[var(--positive)]",
        destructive:
          "border border-red-500/30 bg-red-500/10 text-red-400",
        accent:
          "bg-[var(--accent)] text-[var(--accent-ink)] font-bold",
        surface:
          "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-3)]",
      },
      size: {
        default: "px-2.5 py-0.5 text-[11px]",
        sm: "px-2 py-0.25 text-[10px] tracking-wider",
        lg: "px-3 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

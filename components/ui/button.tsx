import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] font-[var(--font-text)] text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent)] text-[var(--accent-ink)] font-bold shadow-[var(--shadow-near)] hover:bg-[oklch(0.85_0.17_95)] hover:shadow-[var(--shadow-far)] hover:-translate-y-0.5 border border-[var(--accent)]",
        secondary:
          "bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--surface)] hover:border-[var(--ink-3)]",
        outline:
          "border border-[var(--line)] bg-transparent text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-[var(--ink)] hover:border-[var(--ink-3)]",
        ghost:
          "text-[var(--ink-2)] hover:bg-[var(--surface)] hover:text-[var(--ink)]",
        destructive:
          "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40",
        link: "text-[var(--accent)] underline-offset-4 hover:underline p-0 h-auto font-normal",
        pill: "bg-[var(--surface)] text-[var(--ink-2)] border border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--ink)] rounded-full",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-base font-semibold",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "press inline-flex min-w-0 items-center justify-center gap-2 rounded-xl text-sm font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-soft hover:bg-primary/90",
        brand: "gradient-brand text-primary-foreground shadow-glow hover:brightness-110",
        destructive: "bg-danger text-danger-foreground shadow-soft hover:bg-danger/90",
        outline: "border border-border-strong bg-surface hover:bg-muted",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        soft: "bg-primary-soft text-primary hover:bg-primary-soft/70",
        ghost: "hover:bg-muted text-foreground",
        glass: "glass text-foreground shadow-soft hover:bg-surface/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-lg px-3 text-xs",
        // B6 — fluid large size: fits "Creating account…" / "Continue →" on
        // ≤360px screens, and lets long localized labels wrap instead of
        // overflowing (whitespace-normal + text-wrap i18n-safe).
        lg: "h-11 min-h-11 rounded-2xl px-4 text-sm whitespace-normal [text-wrap:pretty] sm:h-12 sm:px-7 sm:text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-lg",
        pill: "h-9 rounded-full px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

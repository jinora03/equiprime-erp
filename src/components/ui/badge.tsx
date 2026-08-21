import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium leading-4 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-1",
  {
    variants: {
      variant: {
        default: "border-primary/15 bg-primary/10 text-primary",
        brand: "border-brand/20 bg-brand/10 text-brand-700",
        secondary: "border-border/70 bg-secondary text-secondary-foreground",
        outline: "border-border bg-background text-foreground",
        success: "border-success/15 bg-success/10 text-success",
        warning: "border-warning/20 bg-warning/10 text-warning",
        info: "border-info/15 bg-info/10 text-info",
        destructive: "border-destructive/15 bg-destructive/10 text-destructive",
        solid: "border-transparent bg-primary text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em]',
  {
    variants: {
      variant: {
        default: 'bg-primary/12 text-primary',
        secondary: 'bg-accent/12 text-accent',
        outline: 'border border-white/20 bg-white/12 text-white backdrop-blur-sm',
        muted: 'bg-foreground/6 text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };


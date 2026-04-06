import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[1.2rem] text-sm font-extrabold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-4 focus-visible:ring-ring/40',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_18px_38px_rgba(157,69,39,0.22)] hover:-translate-y-0.5 hover:shadow-[0_24px_46px_rgba(157,69,39,0.28)]',
        secondary:
          'bg-accent/10 text-accent hover:-translate-y-0.5 hover:bg-accent/15',
        ghost: 'bg-foreground/5 text-muted-foreground hover:-translate-y-0.5 hover:bg-foreground/8',
        outline:
          'border border-border bg-white/70 text-foreground hover:-translate-y-0.5 hover:bg-white',
      },
      size: {
        default: 'h-12 px-5 py-3',
        sm: 'h-10 px-4 py-2.5 text-sm',
        lg: 'h-14 px-6 py-4 text-base',
        icon: 'size-12 rounded-[1.2rem]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn('relative flex w-full touch-none select-none items-center', className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-secondary/90">
      <SliderPrimitive.Range className="absolute h-full rounded-full bg-gradient-to-r from-primary to-accent" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block size-6 rounded-full border-4 border-white bg-primary shadow-[0_10px_24px_rgba(157,69,39,0.28)] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40" />
    <SliderPrimitive.Thumb className="block size-6 rounded-full border-4 border-white bg-accent shadow-[0_10px_24px_rgba(46,107,114,0.28)] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/40" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

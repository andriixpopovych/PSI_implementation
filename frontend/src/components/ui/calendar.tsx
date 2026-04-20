import type { ComponentProps } from "react";
import "react-day-picker/style.css";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import {
  type ChevronProps,
  DayPicker,
  getDefaultClassNames,
} from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CalendarProps = ComponentProps<typeof DayPicker>;

const defaultClassNames = getDefaultClassNames();

function CalendarChevron({
  className,
  orientation = "left",
}: ChevronProps) {
  const classes = cn("size-5 text-foreground", className);

  if (orientation === "right") {
    return <ChevronRight className={classes} />;
  }

  if (orientation === "down") {
    return <ChevronDown className={classes} />;
  }

  if (orientation === "up") {
    return <ChevronUp className={classes} />;
  }

  return <ChevronLeft className={classes} />;
}

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      fixedWeeks
      navLayout="around"
      className={cn("rounded-[1.4rem] bg-white/78 p-3", className)}
      classNames={{
        root: cn(defaultClassNames.root, "w-fit"),
        months: cn(defaultClassNames.months, "flex flex-col gap-4"),
        month: cn(defaultClassNames.month, "space-y-4"),
        month_caption: cn(
          defaultClassNames.month_caption,
          "relative flex h-10 items-center justify-center px-12",
        ),
        caption_label: cn(
          defaultClassNames.caption_label,
          "font-display text-[1.1rem] font-black tracking-[-0.04em] text-foreground",
        ),
        nav: cn(
          defaultClassNames.nav,
          "absolute inset-x-0 top-0 flex items-center justify-between",
        ),
        button_previous: cn(
          defaultClassNames.button_previous,
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-10 rounded-full border border-transparent bg-foreground/5 p-0 text-foreground hover:-translate-y-0 hover:bg-accent/10 hover:text-foreground",
        ),
        button_next: cn(
          defaultClassNames.button_next,
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-10 rounded-full border border-transparent bg-foreground/5 p-0 text-foreground hover:-translate-y-0 hover:bg-accent/10 hover:text-foreground",
        ),
        chevron: cn(defaultClassNames.chevron, "size-5 fill-current"),
        month_grid: cn(defaultClassNames.month_grid, "border-collapse"),
        weekdays: cn(defaultClassNames.weekdays),
        weekday: cn(
          defaultClassNames.weekday,
          "h-10 w-10 p-0 text-center text-[0.72rem] font-bold uppercase tracking-[0.16em] text-muted-foreground",
        ),
        weeks: cn(defaultClassNames.weeks),
        week: cn(defaultClassNames.week),
        day: cn(
          defaultClassNames.day,
          "p-0 text-center align-middle text-sm",
        ),
        day_button: cn(
          defaultClassNames.day_button,
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-10 rounded-full border border-transparent bg-transparent p-0 font-medium text-[0.98rem] text-foreground shadow-none hover:-translate-y-0 hover:bg-accent/10 hover:text-foreground",
        ),
        selected: cn(
          defaultClassNames.selected,
          "[&>button]:border-primary [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground",
        ),
        today: cn(
          defaultClassNames.today,
          "text-inherit [&>button]:border-primary/35 [&>button]:text-primary",
        ),
        outside: cn(
          defaultClassNames.outside,
          "text-muted-foreground opacity-40",
        ),
        disabled: cn(defaultClassNames.disabled, "opacity-30"),
        hidden: cn(defaultClassNames.hidden, "invisible"),
        ...classNames,
      }}
      components={{
        Chevron: CalendarChevron,
      }}
      {...props}
    />
  );
}

import type { ComponentProps } from "react";
import { DayPicker } from "react-day-picker";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CalendarProps = ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        months: "flex flex-col gap-3 sm:flex-row",
        month: "space-y-3",
        caption: "relative flex items-center justify-center px-8 pt-1",
        caption_label: "text-sm font-semibold",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-8 rounded-xl p-0 opacity-75 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell: "w-9 text-[0.78rem] font-medium text-muted-foreground",
        row: "mt-1 flex w-full",
        cell: "relative h-9 w-9 p-0 text-center text-sm",
        day: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "size-9 rounded-xl p-0 font-medium aria-selected:bg-primary/15 aria-selected:text-primary",
        ),
        day_selected: "bg-primary text-primary-foreground hover:bg-primary/90",
        day_today: "border border-primary/35",
        day_outside: "text-muted-foreground opacity-40",
        day_disabled: "opacity-35",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}

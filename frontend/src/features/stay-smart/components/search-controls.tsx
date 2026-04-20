import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  MapPin,
  Minus,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function formatDateLabel(value: string, fallback = "Select date") {
  const parsed = toDate(value);
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function toDate(value: string) {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return undefined;
  }

  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type SearchableLocationFieldProps = {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  icon?: LucideIcon;
  emptyText?: string;
  onChange: (value: string) => void;
};

type DateFieldProps = {
  label: string;
  value: string;
  min?: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export function SearchableLocationField({
  label,
  value,
  options,
  placeholder = "Search location",
  icon: Icon = MapPin,
  emptyText = "No options found.",
  onChange,
}: SearchableLocationFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return options.slice(0, 8);
    }

    return options
      .filter((option) => option.toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [options, query]);

  return (
    <div className="space-y-2.5">
      <label className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setQuery("");
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-16 w-full justify-between rounded-[1.45rem] border-white/85 bg-white/86 px-5 text-left text-[1.02rem] font-medium text-foreground shadow-[0_8px_24px_rgba(89,61,34,0.06)]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{value || placeholder}</span>
            </span>
            <span className="flex items-center gap-2">
              {value ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onChange("");
                    setQuery("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      onChange("");
                      setQuery("");
                    }
                  }}
                  className="inline-flex size-7 items-center justify-center rounded-full bg-foreground/6 text-muted-foreground transition hover:bg-foreground/10"
                >
                  <X className="size-4" />
                </span>
              ) : null}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] rounded-[1.6rem] border-white/80 bg-[rgba(255,252,248,0.98)] p-3 shadow-[0_24px_70px_rgba(89,61,34,0.18)]"
        >
          <div className="rounded-[1.2rem] border border-border/70 bg-white/80 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                placeholder={placeholder}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 rounded-[1rem] border-white/80 bg-white pl-10"
              />
            </div>
          </div>

          <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const selected = option === value;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange(option);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[1.1rem] px-4 py-3 text-left text-sm font-semibold transition",
                      selected
                        ? "bg-primary/10 text-primary"
                        : "bg-white/55 text-foreground hover:bg-white",
                    )}
                  >
                    <span>{option}</span>
                    <Check
                      className={cn(
                        "size-4 transition-opacity",
                        selected ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </button>
                );
              })
            ) : (
              <div className="rounded-[1.1rem] bg-white/55 px-4 py-5 text-sm text-muted-foreground">
                {emptyText}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function DateField({
  label,
  value,
  min,
  placeholder = "Select date",
  onChange,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = toDate(value);
  const minDate = toDate(min ?? "");

  return (
    <div className="space-y-2.5">
      <label className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-16 w-full justify-between rounded-[1.45rem] border-white/85 bg-white/86 px-5 text-left text-[1.02rem] font-medium text-foreground shadow-[0_8px_24px_rgba(89,61,34,0.06)]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{formatDateLabel(value, placeholder)}</span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto rounded-[1.6rem] border-white/80 bg-[rgba(255,252,248,0.98)] p-3 shadow-[0_24px_70px_rgba(89,61,34,0.18)]"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            disabled={minDate ? (date) => date < minDate : undefined}
            onSelect={(date) => {
              if (!date) {
                return;
              }

              onChange(toIsoDate(date));
              setOpen(false);
            }}
            className="rounded-[1.4rem] bg-white/78"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function GuestField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const guestCount = Math.max(1, Number(value) || 1);

  return (
    <div className="space-y-2.5">
      <label className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <div className="flex h-16 items-center justify-between rounded-[1.45rem] border border-white/85 bg-white/86 px-3 shadow-[0_8px_24px_rgba(89,61,34,0.06)]">
        <div className="flex min-w-0 items-center gap-3 px-2">
          <Users className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-[1.02rem] font-medium text-foreground">
            {guestCount} guest{guestCount === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(String(Math.max(1, guestCount - 1)))}
            className="inline-flex size-10 items-center justify-center rounded-full bg-foreground/6 text-foreground transition hover:bg-foreground/10"
            aria-label="Decrease guests"
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange(String(Math.min(16, guestCount + 1)))}
            className="inline-flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90"
            aria-label="Increase guests"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

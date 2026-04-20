import { useMemo } from 'react';
import { Check, SlidersHorizontal } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

export const catalogSortModes = [
  'Recommended',
  'Lowest price',
  'Highest price',
  'Most guests',
] as const;

export type CatalogSortMode = (typeof catalogSortModes)[number];

export type CatalogDrawerFilters = {
  priceRange: [number, number];
  selectedTypes: string[];
  sortBy: CatalogSortMode;
};

export const defaultCatalogDrawerFilters: CatalogDrawerFilters = {
  priceRange: [0, 5000],
  selectedTypes: [],
  sortBy: 'Recommended',
};

export function CatalogFiltersDrawer({
  value,
  propertyTypes,
  onChange,
  onReset,
}: {
  value: CatalogDrawerFilters;
  propertyTypes: string[];
  onChange: (value: CatalogDrawerFilters) => void;
  onReset: () => void;
}) {
  const { priceRange, selectedTypes, sortBy } = value;

  const activeFiltersCount = useMemo(() => {
    const hasCustomPrice =
      priceRange[0] !== defaultCatalogDrawerFilters.priceRange[0] ||
      priceRange[1] !== defaultCatalogDrawerFilters.priceRange[1];

    return (
      Number(hasCustomPrice) +
      selectedTypes.length +
      Number(sortBy !== catalogSortModes[0])
    );
  }, [priceRange, selectedTypes, sortBy]);

  const toggleType = (type: string) => {
    const nextTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((item) => item !== type)
      : [...selectedTypes, type];

    onChange({
      priceRange,
      selectedTypes: nextTypes,
      sortBy,
    });
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="rounded-[1.15rem] border-white/80 bg-white/70">
          <SlidersHorizontal className="size-4" />
          Filters
          <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground">
            {activeFiltersCount}
          </span>
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden">
          <DrawerHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <Badge variant="default">Catalog filters</Badge>
                <DrawerTitle>Filters</DrawerTitle>
                <DrawerDescription>Only filters that actually affect the catalog.</DrawerDescription>
              </div>

              <div className="rounded-[1.4rem] border border-white/80 bg-white/78 px-4 py-3 text-right shadow-[0_10px_26px_rgba(89,61,34,0.05)]">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Budget
                </p>
                <p className="mt-2 font-display text-[1.8rem] font-black leading-none tracking-[-0.05em]">
                  ${priceRange[0]} to ${priceRange[1]}
                </p>
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-hidden px-2 pb-3 sm:px-3">
            <div className="grid h-full gap-6 overflow-y-auto pr-2 sm:pr-4 [scrollbar-gutter:stable] lg:grid-cols-[1.15fr_0.85fr]">
              <FilterPanel title="Price">
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <PriceBox label="Min" value={`$${priceRange[0]}`} />
                    <PriceBox label="Max" value={`$${priceRange[1]}`} />
                  </div>
                  <Slider
                    value={priceRange}
                    min={0}
                    max={5000}
                    step={100}
                    minStepsBetweenThumbs={2}
                    onValueChange={(nextValue) =>
                      onChange({
                        priceRange: nextValue as [number, number],
                        selectedTypes,
                        sortBy,
                      })
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="muted">Nightly price</Badge>
                    <Badge variant="muted">Updates the feed</Badge>
                  </div>
                </div>
              </FilterPanel>

              <FilterPanel title="Sort by">
                <div className="grid gap-2">
                  {catalogSortModes.map((option) => (
                    <FilterRowButton
                      key={option}
                      active={sortBy === option}
                      onClick={() =>
                        onChange({
                          priceRange,
                          selectedTypes,
                          sortBy: option,
                        })
                      }
                      label={option}
                    />
                  ))}
                </div>
              </FilterPanel>

              <FilterPanel title="Property type">
                <div className="flex flex-wrap gap-3">
                  {propertyTypes.map((type) => (
                    <FilterChip
                      key={type}
                      active={selectedTypes.includes(type)}
                      onClick={() => toggleType(type)}
                    >
                      {type}
                    </FilterChip>
                  ))}
                </div>
              </FilterPanel>
            </div>
          </div>

          <DrawerFooter className="border-t border-white/60">
            <Button variant="outline" className="sm:min-w-36" onClick={onReset}>
              Reset
            </Button>
            <DrawerClose asChild>
              <Button className="sm:min-w-44">Show stays</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function FilterPanel({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn('rounded-[1.9rem] border-white/70 bg-white/72', className)}>
      <CardContent className="space-y-5 p-6 sm:p-7">
        <h3 className="font-display text-[1.65rem] font-black leading-none tracking-[-0.05em] text-foreground">
          {title}
        </h3>
        {children}
      </CardContent>
    </Card>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-2.5 text-sm font-bold transition',
        active
          ? 'border-accent/20 bg-accent text-accent-foreground shadow-[0_12px_28px_rgba(46,107,114,0.18)]'
          : 'border-white/80 bg-white/90 text-foreground hover:-translate-y-0.5 hover:bg-white',
      )}
    >
      {children}
    </button>
  );
}

function FilterRowButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center justify-between rounded-[1.3rem] border px-4 py-3 text-left transition',
        active
          ? 'border-primary/20 bg-primary/10 text-foreground'
          : 'border-white/80 bg-white/80 text-muted-foreground hover:-translate-y-0.5 hover:bg-white',
      )}
    >
      <span className="font-semibold">{label}</span>
      <span
        className={cn(
          'flex size-6 items-center justify-center rounded-full transition',
          active ? 'bg-primary text-primary-foreground' : 'bg-foreground/6 text-transparent',
        )}
      >
        <Check className="size-3.5" />
      </span>
    </button>
  );
}

function PriceBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 rounded-[1.4rem] border border-white/80 bg-white/90 px-4 py-3 shadow-[0_10px_22px_rgba(89,61,34,0.06)]">
      <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-[1.5rem] font-black leading-none tracking-[-0.04em] text-foreground">
        {value}
      </p>
    </div>
  );
}

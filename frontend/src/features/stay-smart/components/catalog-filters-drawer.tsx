import { useMemo, useState } from 'react';
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

const defaultPriceRange = [1200, 3200] as [number, number];
const propertyTypes = ['Apartment', 'Flat', 'Room', 'Villa'];
const stayPeriods = ['Weekend', 'Short term', 'Monthly', 'Long stay'];
const amenities = ['Parking', 'Pets ok', 'Fast Wi-Fi', 'Balcony', 'Netflix', 'Washer'];
const sortModes = ['Recommended', 'Lowest price', 'Best rated'];

export function CatalogFiltersDrawer() {
  const [priceRange, setPriceRange] = useState<[number, number]>(defaultPriceRange);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Apartment', 'Villa']);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['Short term']);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Parking', 'Fast Wi-Fi']);
  const [sortBy, setSortBy] = useState(sortModes[0]);

  const activeFiltersCount = useMemo(() => {
    const hasCustomPrice =
      priceRange[0] !== defaultPriceRange[0] || priceRange[1] !== defaultPriceRange[1];

    return (
      Number(hasCustomPrice) +
      selectedTypes.length +
      selectedPeriods.length +
      selectedAmenities.length +
      Number(sortBy !== sortModes[0])
    );
  }, [priceRange, selectedTypes, selectedPeriods, selectedAmenities, sortBy]);

  const toggleValue = (
    currentValues: string[],
    value: string,
    setValues: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setValues((items) =>
      items.includes(value) ? items.filter((item) => item !== value) : [...items, value],
    );
  };

  const resetFilters = () => {
    setPriceRange(defaultPriceRange);
    setSelectedTypes(['Apartment', 'Villa']);
    setSelectedPeriods(['Short term']);
    setSelectedAmenities(['Parking', 'Fast Wi-Fi']);
    setSortBy(sortModes[0]);
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
                <DrawerDescription>Price, type, stay length and amenities.</DrawerDescription>
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
                    min={400}
                    max={5000}
                    step={100}
                    minStepsBetweenThumbs={2}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                  />
                  <div className="flex flex-wrap gap-2">
                    {['Budget', 'Balanced', 'Premium'].map((tag) => (
                      <Badge key={tag} variant="muted">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </FilterPanel>

              <FilterPanel title="Sort by">
                <div className="grid gap-2">
                  {sortModes.map((option) => (
                    <FilterRowButton
                      key={option}
                      active={sortBy === option}
                      onClick={() => setSortBy(option)}
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
                      onClick={() => toggleValue(selectedTypes, type, setSelectedTypes)}
                    >
                      {type}
                    </FilterChip>
                  ))}
                </div>
              </FilterPanel>

              <FilterPanel title="Stay length">
                <div className="flex flex-wrap gap-3">
                  {stayPeriods.map((period) => (
                    <FilterChip
                      key={period}
                      active={selectedPeriods.includes(period)}
                      onClick={() => toggleValue(selectedPeriods, period, setSelectedPeriods)}
                    >
                      {period}
                    </FilterChip>
                  ))}
                </div>
              </FilterPanel>

              <FilterPanel title="Amenities" className="lg:col-span-2">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {amenities.map((amenity) => (
                    <FilterRowButton
                      key={amenity}
                      active={selectedAmenities.includes(amenity)}
                      onClick={() => toggleValue(selectedAmenities, amenity, setSelectedAmenities)}
                      label={amenity}
                    />
                  ))}
                </div>
              </FilterPanel>
            </div>
          </div>

          <DrawerFooter className="border-t border-white/60">
            <Button variant="outline" className="sm:min-w-36" onClick={resetFilters}>
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

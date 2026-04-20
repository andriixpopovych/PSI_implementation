import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

import { PropertyCard, SectionHeading } from "../components/content-blocks";
import {
  DateField,
  GuestField,
  SearchableLocationField,
} from "../components/search-controls";
import { searchLocations, searchObjects } from "../lib/api";
import { itemMotion } from "../lib/motion";
import { staySmartRoutes } from "../lib/routes";
import { mapObjectToCardView, type PropertyCardView } from "../lib/view-models";

const catalogCategories = [
  "All stays",
  "Apartment",
  "House",
  "Room",
  "Villa",
] as const;

const catalogSortModes = [
  "Recommended",
  "Lowest price",
  "Highest price",
  "Most guests",
] as const;

type CatalogSortMode = (typeof catalogSortModes)[number];

type CatalogFilters = {
  priceRange: [number, number];
  sortBy: CatalogSortMode;
};

const defaultCatalogFilters: CatalogFilters = {
  priceRange: [0, 5000],
  sortBy: "Recommended",
};

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<PropertyCardView[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpandedFilters, setShowExpandedFilters] = useState(false);
  const [searchDraft, setSearchDraft] = useState({
    q: searchParams.get("q") ?? "",
    city: searchParams.get("city") ?? "",
    checkIn: searchParams.get("checkIn") ?? "",
    checkOut: searchParams.get("checkOut") ?? "",
    guests: searchParams.get("guests") ?? "",
  });
  const [activeCategory, setActiveCategory] = useState<string>(
    searchParams.get("category") ?? catalogCategories[0],
  );
  const [filters, setFilters] = useState<CatalogFilters>({
    priceRange: [
      Number(searchParams.get("minPrice") ?? defaultCatalogFilters.priceRange[0]),
      Number(searchParams.get("maxPrice") ?? defaultCatalogFilters.priceRange[1]),
    ],
    sortBy:
      (searchParams.get("sort") as CatalogSortMode | null) ??
      defaultCatalogFilters.sortBy,
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([searchObjects({}), searchLocations()])
      .then(([objectResponse, locationResponse]) => {
        setProperties(objectResponse.data.map(mapObjectToCardView));
        setLocationOptions(locationResponse.data.map((item) => item.label));
      })
      .catch(() => {
        setProperties([]);
        setLocationOptions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSearchDraft({
      q: searchParams.get("q") ?? "",
      city: searchParams.get("city") ?? "",
      checkIn: searchParams.get("checkIn") ?? "",
      checkOut: searchParams.get("checkOut") ?? "",
      guests: searchParams.get("guests") ?? "",
    });
    setActiveCategory(searchParams.get("category") ?? catalogCategories[0]);
    setFilters({
      priceRange: [
        Number(searchParams.get("minPrice") ?? defaultCatalogFilters.priceRange[0]),
        Number(searchParams.get("maxPrice") ?? defaultCatalogFilters.priceRange[1]),
      ],
      sortBy:
        (searchParams.get("sort") as CatalogSortMode | null) ??
        defaultCatalogFilters.sortBy,
    });
  }, [searchParams]);

  const syncSearchParams = (next: {
    q?: string;
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }) => {
    const params = new URLSearchParams();

    if (next.q) params.set("q", next.q);
    if (next.city) params.set("city", next.city);
    if (next.checkIn) params.set("checkIn", next.checkIn);
    if (next.checkOut) params.set("checkOut", next.checkOut);
    if (next.guests) params.set("guests", next.guests);
    if (next.category && next.category !== catalogCategories[0]) {
      params.set("category", next.category);
    }
    if (
      next.minPrice !== undefined &&
      next.minPrice !== defaultCatalogFilters.priceRange[0]
    ) {
      params.set("minPrice", String(next.minPrice));
    }
    if (
      next.maxPrice !== undefined &&
      next.maxPrice !== defaultCatalogFilters.priceRange[1]
    ) {
      params.set("maxPrice", String(next.maxPrice));
    }
    if (next.sort && next.sort !== defaultCatalogFilters.sortBy) {
      params.set("sort", next.sort);
    }

    setSearchParams(params, { replace: true });
  };

  const applySearch = () => {
    syncSearchParams({
      ...searchDraft,
      category: activeCategory,
      minPrice: filters.priceRange[0],
      maxPrice: filters.priceRange[1],
      sort: filters.sortBy,
    });
  };

  const resetAllFilters = () => {
    const nextDraft = {
      q: "",
      city: "",
      checkIn: "",
      checkOut: "",
      guests: "",
    };

    setSearchDraft(nextDraft);
    setActiveCategory(catalogCategories[0]);
    setFilters(defaultCatalogFilters);
    syncSearchParams({
      ...nextDraft,
      category: catalogCategories[0],
      minPrice: defaultCatalogFilters.priceRange[0],
      maxPrice: defaultCatalogFilters.priceRange[1],
      sort: defaultCatalogFilters.sortBy,
    });
  };

  const visibleProperties = useMemo(() => {
    const normalizedQuery = searchDraft.q.trim().toLowerCase();
    const normalizedCity = searchDraft.city.trim().toLowerCase();
    const minimumGuests = Number(searchDraft.guests || "0");
    const [minPrice, maxPrice] = filters.priceRange;

    const filtered = properties.filter((property) => {
      const matchesQuery =
        !normalizedQuery ||
        [property.title, property.address, property.host, property.type]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCity =
        !normalizedCity ||
        property.city.toLowerCase().includes(normalizedCity) ||
        `${property.city}, ${property.country}`
          .toLowerCase()
          .includes(normalizedCity);
      const matchesGuests =
        !minimumGuests || property.maxGuests >= minimumGuests;
      const matchesCategory =
        activeCategory === catalogCategories[0] ||
        property.type.toLowerCase().includes(activeCategory.toLowerCase());
      const matchesPrice =
        property.nightlyPrice === null ||
        (property.nightlyPrice >= minPrice &&
          property.nightlyPrice <= maxPrice);

      return (
        matchesQuery &&
        matchesCity &&
        matchesGuests &&
        matchesCategory &&
        matchesPrice
      );
    });

    return [...filtered].sort((left, right) => {
      switch (filters.sortBy) {
        case "Lowest price":
          return (
            (left.nightlyPrice ?? Number.MAX_SAFE_INTEGER) -
            (right.nightlyPrice ?? Number.MAX_SAFE_INTEGER)
          );
        case "Highest price":
          return (right.nightlyPrice ?? 0) - (left.nightlyPrice ?? 0);
        case "Most guests":
          return right.maxGuests - left.maxGuests;
        default:
          return right.beds - left.beds;
      }
    });
  }, [activeCategory, filters, properties, searchDraft]);

  return (
    <>
      <SectionHeading
        title="Catalog"
        copy="Browse stays, narrow the list, and find the right match faster."
      />

      <motion.section variants={itemMotion}>
        <Card className="rounded-[2rem] border-white/70">
          <CardContent className="space-y-6 p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Search stays</p>
                <p className="text-sm text-muted-foreground">
                  Set the basics first, then expand filters if needed.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  className="rounded-[1.2rem] border-white/80 bg-white/78"
                  onClick={() => setShowExpandedFilters((current) => !current)}
                >
                  Filters
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform",
                      showExpandedFilters && "rotate-180",
                    )}
                  />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-[1.2rem] border-white/80 bg-white/78"
                  onClick={resetAllFilters}
                >
                  Reset
                </Button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr_0.9fr_0.9fr_auto] lg:items-end">
              <div className="space-y-2.5">
                <label className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Search stays
                </label>
                <Input
                  value={searchDraft.q}
                  onChange={(event) =>
                    setSearchDraft((current) => ({
                      ...current,
                      q: event.target.value,
                    }))
                  }
                  placeholder="Seach..."
                  className="h-16 rounded-[1.45rem] border-white/85 bg-white/86 px-5 text-[1.02rem] font-medium shadow-[0_8px_24px_rgba(89,61,34,0.06)]"
                />
              </div>

              <DateField
                label="Check In"
                value={searchDraft.checkIn}
                onChange={(value) =>
                  setSearchDraft((current) => ({ ...current, checkIn: value }))
                }
              />

              <DateField
                label="Check Out"
                value={searchDraft.checkOut}
                min={searchDraft.checkIn || undefined}
                onChange={(value) =>
                  setSearchDraft((current) => ({ ...current, checkOut: value }))
                }
              />

              <GuestField
                label="Guests"
                value={searchDraft.guests}
                onChange={(value) =>
                  setSearchDraft((current) => ({ ...current, guests: value }))
                }
              />

              <Button
                className="h-16 w-full rounded-[1.5rem] px-6 shadow-[0_18px_38px_rgba(157,69,39,0.24)] lg:w-auto"
                onClick={applySearch}
              >
                <Search className="size-5" />
                Search
              </Button>
            </div>

            {showExpandedFilters ? (
              <div className="grid gap-5 border-t border-white/70 pt-6">
                <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr] lg:items-end">
                  <SearchableLocationField
                    label="Location"
                    value={searchDraft.city}
                    options={locationOptions}
                    placeholder="Search by city"
                    onChange={(value) =>
                      setSearchDraft((current) => ({ ...current, city: value }))
                    }
                  />

                  <div className="space-y-2.5">
                    <label className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Sort by
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {catalogSortModes.map((mode) => (
                        <Button
                          key={mode}
                          type="button"
                          variant={filters.sortBy === mode ? "secondary" : "outline"}
                          className={
                            filters.sortBy === mode
                              ? "rounded-full bg-primary/10 text-primary hover:bg-primary/12"
                              : "rounded-full border-white/80 bg-white/78"
                          }
                          onClick={() => {
                            setFilters((current) => ({ ...current, sortBy: mode }));
                            syncSearchParams({
                              ...searchDraft,
                              category: activeCategory,
                              minPrice: filters.priceRange[0],
                              maxPrice: filters.priceRange[1],
                              sort: mode,
                            });
                          }}
                        >
                          {mode}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-[1.6rem] border border-white/80 bg-white/76 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Price per night</p>
                      <p className="text-sm text-muted-foreground">
                        ${filters.priceRange[0]} to ${filters.priceRange[1]}
                      </p>
                    </div>
                  </div>
                  <Slider
                    value={filters.priceRange}
                    min={0}
                    max={5000}
                    step={100}
                    minStepsBetweenThumbs={2}
                    onValueChange={(nextValue) => {
                      const nextRange = nextValue as [number, number];
                      setFilters((current) => ({ ...current, priceRange: nextRange }));
                      syncSearchParams({
                        ...searchDraft,
                        category: activeCategory,
                        minPrice: nextRange[0],
                        maxPrice: nextRange[1],
                        sort: filters.sortBy,
                      });
                    }}
                  />
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.section>

      <motion.section variants={itemMotion} className="flex flex-wrap gap-3">
        {catalogCategories.map((filter) => (
          <Button
            key={filter}
            variant={filter === activeCategory ? "secondary" : "ghost"}
            className={
              filter === activeCategory
                ? "rounded-full bg-primary/10 text-primary hover:bg-primary/12"
                : "rounded-full"
            }
            onClick={() => {
              setActiveCategory(filter);
              syncSearchParams({
                ...searchDraft,
                category: filter,
                minPrice: filters.priceRange[0],
                maxPrice: filters.priceRange[1],
                sort: filters.sortBy,
              });
            }}
          >
            {filter}
          </Button>
        ))}
      </motion.section>

      <motion.section
        variants={itemMotion}
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        {loading ? (
          <p className="text-muted-foreground">Loading stays...</p>
        ) : visibleProperties.length === 0 ? (
          <p className="text-muted-foreground">
            No stays match the current search. Reset filters or try a broader
            query.
          </p>
        ) : (
          visibleProperties.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              to={staySmartRoutes.property(property.id)}
              index={index}
            />
          ))
        )}
      </motion.section>
    </>
  );
}

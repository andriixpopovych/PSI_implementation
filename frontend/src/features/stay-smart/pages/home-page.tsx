import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { PropertyCard, SearchField, SectionHeading } from '../components/content-blocks';
import { searchObjects } from '../lib/api';
import { categoryFilters, searchModes, type SearchMode } from '../lib/mock-data';
import { itemMotion } from '../lib/motion';
import { staySmartRoutes } from '../lib/routes';
import { mapObjectToCardView, type PropertyCardView } from '../lib/view-models';

export function HomePage() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<SearchMode>(searchModes[0]);
  const [featured, setFeatured] = useState<PropertyCardView[]>([]);
  const [location, setLocation] = useState('Los Angeles');
  const [checkIn, setCheckIn] = useState('2027-03-12');
  const [checkOut, setCheckOut] = useState('2027-03-25');
  const [guests, setGuests] = useState('2');

  useEffect(() => {
    searchObjects({})
      .then((response) => {
        setFeatured(response.data.slice(0, 6).map(mapObjectToCardView));
      })
      .catch(() => {
        setFeatured([]);
      });
  }, []);

  const openResults = () => {
    const params = new URLSearchParams({
      city: location,
      guests,
      checkIn,
      checkOut,
    });

    navigate(`${staySmartRoutes.results}?${params.toString()}`);
  };

  return (
    <>
      <section className="grid gap-6 lg:min-h-[690px] lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <motion.div variants={itemMotion} className="h-full">
          <Card className="ambient-panel h-full rounded-[2rem] border-white/70">
            <CardContent className="flex h-full flex-col justify-between gap-8 p-8 sm:p-10 lg:p-12">
              <div className="space-y-5">
                <Badge variant="default">Stay Smart</Badge>
                <h1 className="font-display max-w-[9ch] text-[2.55rem] font-black leading-[0.94] tracking-[-0.06em] text-foreground sm:text-[3.25rem] lg:text-[3.95rem]">
                  Smarter stays for city breaks and longer plans.
                </h1>
                <p className="max-w-[42ch] text-[14px] leading-7 text-muted-foreground sm:text-[15px]">
                  Frontend now reads approved listings from the backend, so this page mirrors the same
                  data you later show in catalog, detail, reservation, and manager approval flows.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={() => navigate(staySmartRoutes.catalog)}>
                  Explore stays
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-[1.2rem] border-white/80 bg-white/78"
                  onClick={openResults}
                >
                  Live search
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {categoryFilters.slice(0, 3).map((filter) => (
                  <div key={filter} className="rounded-[1.5rem] border border-white/70 bg-white/62 p-4">
                    <p className="font-display text-[2rem] font-black leading-none tracking-[-0.05em] text-foreground">
                      {filter}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Ready for demo search</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemMotion} className="h-full">
          <Card className="hero-spot relative h-full overflow-hidden rounded-[2rem] border-white/10 text-white">
            <CardContent className="grid h-full min-h-[460px] gap-4 p-4 sm:grid-cols-[1.18fr_0.82fr] sm:p-5">
              <div className="relative h-full overflow-hidden rounded-[1.7rem]">
                <img
                  src={featured[0]?.image ?? 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80'}
                  alt={featured[0]?.title ?? 'Featured stay'}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute inset-x-6 bottom-6 space-y-3">
                  <Badge variant="outline" className="mb-0">
                    Approved listing
                  </Badge>
                  <p className="font-display max-w-[8ch] text-[2.35rem] font-black leading-[0.92] tracking-[-0.055em] sm:text-[3rem]">
                    {featured[0]?.title ?? 'Demo listing ready'}
                  </p>
                  <p className="max-w-[28ch] text-sm leading-6 text-white/78">
                    {featured[0]?.address ?? 'Seeded data appears here once backend is running.'}
                  </p>
                </div>
              </div>

              <div className="grid h-full auto-rows-fr gap-4">
                {featured.slice(1, 3).map((property) => (
                  <div
                    key={property.id}
                    className="relative h-full min-h-[220px] overflow-hidden rounded-[1.5rem] sm:min-h-0"
                  >
                    <img
                      src={property.image}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                    <div className="absolute inset-x-4 bottom-4 space-y-2">
                      <Badge variant="outline" className="w-fit px-2.5 py-1 text-[10px]">
                        {property.badge}
                      </Badge>
                      <p className="font-display max-w-[8ch] text-[1.45rem] font-black leading-[0.95] tracking-[-0.04em] sm:text-[1.7rem]">
                        {property.title}
                      </p>
                      <p className="max-w-[18ch] text-sm leading-5 text-white/78">{property.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <motion.section variants={itemMotion}>
        <Card className="rounded-[2rem] border-white/70">
          <CardContent className="space-y-6 p-6 sm:p-7">
            <div className="flex flex-wrap gap-3">
              {searchModes.map((mode) => (
                <Button
                  key={mode}
                  variant={mode === activeMode ? 'secondary' : 'ghost'}
                  className={mode === activeMode ? 'rounded-full bg-accent/12 text-accent hover:bg-accent/16' : 'rounded-full'}
                  onClick={() => setActiveMode(mode)}
                >
                  {mode}
                </Button>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr_0.95fr_0.95fr_auto] lg:items-end">
              <SearchField label="Location" defaultValue={location} onChange={setLocation} />
              <SearchField label="Check In" defaultValue={checkIn} onChange={setCheckIn} />
              <SearchField label="Check Out" defaultValue={checkOut} onChange={setCheckOut} />
              <SearchField label="Guests" defaultValue={guests} onChange={setGuests} />
              <Button
                className="h-16 w-full rounded-[1.5rem] px-0 shadow-[0_18px_38px_rgba(157,69,39,0.24)] lg:w-16"
                onClick={openResults}
              >
                <Search className="size-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      <SectionHeading
        title="Featured properties on Stay Smart"
        copy="These cards come from the approved listings in PostgreSQL, not from front-end mocks."
      />

      <motion.section variants={itemMotion} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {featured.slice(0, 6).map((property, index) => (
          <PropertyCard
            key={property.id}
            property={property}
            to={staySmartRoutes.property(property.id)}
            index={index}
          />
        ))}
      </motion.section>
    </>
  );
}

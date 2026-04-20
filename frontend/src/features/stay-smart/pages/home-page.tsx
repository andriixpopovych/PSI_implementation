import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { PropertyCard, SectionHeading } from '../components/content-blocks';
import { DateField, GuestField, SearchableLocationField } from '../components/search-controls';
import { searchLocations, searchObjects } from '../lib/api';
import { searchModes, type SearchMode } from '../lib/mock-data';
import { itemMotion } from '../lib/motion';
import { staySmartRoutes } from '../lib/routes';
import { mapObjectToCardView, type PropertyCardView } from '../lib/view-models';

export function HomePage() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<SearchMode>(searchModes[0]);
  const [featured, setFeatured] = useState<PropertyCardView[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [location, setLocation] = useState('Los Angeles');
  const [checkIn, setCheckIn] = useState('2027-03-12');
  const [checkOut, setCheckOut] = useState('2027-03-25');
  const [guests, setGuests] = useState('2');

  useEffect(() => {
    Promise.all([searchObjects({}), searchLocations()])
      .then(([objectResponse, locationResponse]) => {
        setFeatured(objectResponse.data.slice(0, 6).map(mapObjectToCardView));
        setLocationOptions(locationResponse.data.map((item) => item.label));
      })
      .catch(() => {
        setFeatured([]);
        setLocationOptions([]);
      });
  }, []);

  const openResults = () => {
    const params = new URLSearchParams({
      city: location,
      guests,
      checkIn,
      checkOut,
    });

    navigate(`${staySmartRoutes.catalog}?${params.toString()}`);
  };

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
        <motion.div variants={itemMotion} className="h-full">
          <Card className="ambient-panel h-full rounded-[2rem] border-white/70">
            <CardContent className="flex h-full flex-col justify-center gap-8 p-8 sm:p-10 lg:p-12">
              <div className="space-y-5">
                <Badge variant="default">Stay Smart</Badge>
                <h1 className="font-display max-w-[10ch] text-[2.7rem] font-black leading-[0.96] tracking-[-0.06em] text-foreground sm:text-[3.35rem] lg:text-[4rem]">
                  Find a clean city stay without the noise.
                </h1>
                <p className="max-w-[44ch] text-[14px] leading-7 text-muted-foreground sm:text-[15px]">
                  Browse stays, use the catalog search, and book the option that fits your trip.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={() => navigate(staySmartRoutes.catalog)}>
                  Explore catalog
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-[1.2rem] border-white/80 bg-white/78"
                  onClick={openResults}
                >
                  Quick search
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemMotion} className="h-full">
          <Card className="h-full rounded-[2rem] border-white/70 bg-white/70">
            <CardContent className="flex h-full flex-col gap-5 p-6 sm:p-7">
              <div className="rounded-[1.7rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(249,241,232,0.92))] p-5 shadow-[0_18px_40px_rgba(89,61,34,0.07)]">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Live now
                </p>
                <p className="mt-3 font-display text-[2.2rem] font-black leading-none tracking-[-0.05em] text-foreground">
                  {featured.length}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  stays available right now.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.6rem] border border-white/80 bg-white/82 p-5">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Search
                  </p>
                  <p className="mt-3 text-base font-semibold leading-7 text-foreground">
                    City, dates, guests and filters all open from one catalog flow.
                  </p>
                </div>

                <div className="rounded-[1.6rem] border border-white/80 bg-white/82 p-5">
                  <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Booking
                  </p>
                  <p className="mt-3 text-base font-semibold leading-7 text-foreground">
                    Pick a variant, review the total, then confirm the reservation.
                  </p>
                </div>
              </div>

              <div className="rounded-[1.7rem] border border-dashed border-primary/18 bg-primary/5 p-5">
                <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Featured preview
                </p>
                <div className="mt-4 space-y-4">
                  {featured.slice(0, 2).map((property) => (
                    <div
                      key={property.id}
                      className="rounded-[1.3rem] border border-white/80 bg-white/88 px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold text-foreground">
                            {property.title}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {property.city}, {property.country}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {property.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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
              <SearchableLocationField
                label="Location"
                value={location}
                options={locationOptions}
                placeholder="Search by city"
                onChange={setLocation}
              />
              <DateField label="Check In" value={checkIn} onChange={setCheckIn} />
              <DateField label="Check Out" value={checkOut} min={checkIn} onChange={setCheckOut} />
              <GuestField label="Guests" value={guests} onChange={setGuests} />
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
        copy="A few stays worth opening first."
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

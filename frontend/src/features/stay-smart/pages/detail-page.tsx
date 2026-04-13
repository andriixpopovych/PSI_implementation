import { motion } from 'framer-motion';
import { Bath, BedDouble, CarFront, MapPin, PawPrint } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import {
  InfoBullet,
  SectionHeading,
  StatCard,
} from '../components/content-blocks';
import { amenityGroups, properties, safetyItems } from '../lib/mock-data';
import { itemMotion } from '../lib/motion';
import { staySmartRoutes } from '../lib/routes';

export function DetailPage() {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const property = properties.find((item) => item.id === propertyId) ?? properties[0];
  const galleryTiles = properties.filter((item) => item.id !== property.id).slice(0, 4);

  return (
    <>
      <SectionHeading
        title={property.title}
        copy={property.address}
        action={<Badge variant="default">{property.badge}</Badge>}
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <motion.div
          variants={itemMotion}
          className="relative min-w-0 overflow-hidden rounded-[2rem] xl:min-h-[470px]"
        >
          <img src={property.image} alt={property.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-6 bottom-6 flex items-end gap-4 text-white">
            <div className="flex size-14 items-center justify-center rounded-full bg-white/15 text-xl font-black backdrop-blur-md">
              {property.host.charAt(0)}
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-white/80">Listed by</span>
              <p className="font-display text-3xl font-black leading-none tracking-[-0.05em]">
                {property.host}
              </p>
              <p className="mt-2 text-sm text-white/80">For: {property.price}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemMotion}
          className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-2"
        >
          {galleryTiles.map((tile) => (
            <div key={tile.id} className="overflow-hidden rounded-[1.7rem]">
              <img src={tile.image} alt={tile.title} className="aspect-[1/0.86] w-full object-cover" />
            </div>
          ))}
        </motion.div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <motion.div variants={itemMotion} className="min-w-0 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={<BedDouble className="size-5" />} label={`${property.beds} Bedrooms`} />
            <StatCard icon={<Bath className="size-5" />} label={`${property.baths} Bathrooms`} />
            <StatCard icon={<CarFront className="size-5" />} label={`${property.parking} Cars / Bikes`} />
            <StatCard icon={<PawPrint className="size-5" />} label={`${property.pets} Pets Allowed`} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Apartment Description</CardTitle>
              <CardDescription>
                A bright, easygoing stay with enough space to settle in for a weekend or a longer
                chapter.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-base leading-8 text-muted-foreground">
              <p>
                Expect a balanced mix of natural light, comfortable rooms, and a layout that keeps
                daily routines simple.
              </p>
              <p>
                Whether you stay for a few days or a few months, the space is set up to feel calm,
                practical, and ready to move into.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Offered Amenities</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {amenityGroups.map((item) => (
                <InfoBullet key={item} text={item} />
              ))}
            </CardContent>
          </Card>

          <Button variant="outline" className="rounded-full border-white/80 bg-white/70">
            Show All 10 Amenities
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Safety and Hygiene</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {safetyItems.map((item) => (
                <InfoBullet key={item} text={item} />
              ))}
            </CardContent>
          </Card>

          <Card className="map-grid relative overflow-hidden rounded-[2rem]">
            <CardContent className="relative min-h-[320px] overflow-hidden rounded-[inherit] p-0">
              <div className="absolute left-[12%] top-[55%] h-px w-[70%] rotate-[-16deg] bg-foreground/10" />
              <div className="absolute left-[24%] top-[35%] h-px w-[52%] rotate-[24deg] bg-foreground/10" />
              <div className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-[0_18px_36px_rgba(89,61,34,0.16)]">
                <MapPin className="size-5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.aside variants={itemMotion} className="min-w-0 xl:sticky xl:top-28">
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle>{property.price}</CardTitle>
              <CardDescription>Simple booking panel with static prices for now.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p>Short Period: $1000</p>
                <p>Medium Period: $2000</p>
                <p>Long Period: $2000</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Button className="w-full" onClick={() => navigate(staySmartRoutes.reservations)}>
                  Reserve Now
                </Button>
                <Button variant="outline" className="w-full rounded-full border-white/80 bg-white/70">
                  Property Inquiry
                </Button>
                <Button variant="ghost" className="w-full rounded-full">
                  Contact Host
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.aside>
      </section>
    </>
  );
}

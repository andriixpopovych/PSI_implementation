import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Bath, BedDouble, CarFront, CheckCircle2, Heart, PawPrint } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { itemMotion } from '../lib/motion';
import type { PropertyCardView, ReservationCardView } from '../lib/view-models';

export function SectionHeading({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <motion.section
      variants={itemMotion}
      className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
    >
      <div className="space-y-3">
        <h2 className="font-display text-4xl font-black tracking-[-0.06em] text-foreground sm:text-5xl">
          {title}
        </h2>
        <p className="max-w-[56ch] text-[15px] leading-7 text-muted-foreground sm:text-base">
          {copy}
        </p>
      </div>
      {action}
    </motion.section>
  );
}

export function SearchField({
  label,
  defaultValue,
  onChange,
}: {
  label: string;
  defaultValue: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      <label className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <Input
        value={defaultValue}
        onChange={(event) => onChange?.(event.target.value)}
        className="h-16 rounded-[1.45rem] border-white/85 bg-white/86 px-6 text-[1.08rem] font-medium shadow-[0_8px_24px_rgba(89,61,34,0.06)]"
      />
    </div>
  );
}

export function PropertyCard({
  property,
  to,
  index,
}: {
  property: PropertyCardView;
  to: string;
  index: number;
}) {
  return (
    <motion.article
      initial={false}
      whileHover={{ y: -10 }}
    >
      <Card className="h-full overflow-hidden">
        <Link to={to} className="block w-full cursor-pointer text-left">
          <div className="relative overflow-hidden">
            <img src={property.image} alt={property.title} className="aspect-[1.08/1] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-3">
              <Badge variant="outline">{property.badge}</Badge>
              <div className="flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md">
                <Heart className="size-4" />
              </div>
            </div>
            <div className="absolute inset-x-5 bottom-5">
              <Badge variant="outline" className="text-[11px]">
                {property.price}
              </Badge>
            </div>
          </div>

          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <h3 className="min-h-[4.4rem] font-display text-[2rem] font-black leading-[0.92] tracking-[-0.05em] text-foreground">
                {property.title}
              </h3>
              <p className="text-base leading-7 text-muted-foreground">{property.address}</p>
            </div>
            <div className="border-t border-border/70 pt-4">
              <PropertyMeta property={property} />
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.article>
  );
}

export function ResultCard({
  property,
  to,
  index,
}: {
  property: PropertyCardView;
  to: string;
  index: number;
}) {
  return (
    <motion.article
      initial={false}
      whileHover={{ y: -8 }}
    >
      <Card className="overflow-hidden">
        <Link to={to} className="block w-full cursor-pointer text-left">
          <div className="relative overflow-hidden">
            <img src={property.image} alt={property.title} className="aspect-[1.38/1] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-transparent" />
            <div className="absolute right-5 top-5 flex size-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md">
              <Heart className="size-4" />
            </div>
            <div className="absolute inset-x-5 bottom-5 flex items-end gap-4 text-white">
              <div className="flex size-14 items-center justify-center rounded-full bg-white/15 text-xl font-black backdrop-blur-md">
                {property.host.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/80">
                  Listed by
                </span>
                <p className="font-display text-[1.9rem] font-black leading-[0.95] tracking-[-0.05em]">
                  {property.host}
                </p>
                <p className="mt-2 text-sm text-white/80">For: {property.price}</p>
              </div>
            </div>
          </div>

          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <h3 className="font-display text-[2rem] font-black leading-[0.94] tracking-[-0.05em] text-foreground">
                {property.title}
              </h3>
              <p className="text-base leading-7 text-muted-foreground">{property.address}</p>
            </div>

            <div className="border-t border-border/70 pt-4">
              <PropertyMeta property={property} />
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span>{property.type}</span>
              <span className="text-border">|</span>
              <span>{property.period}</span>
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.article>
  );
}

export function ReservationCard({
  property,
  reservation,
  action,
  index,
}: {
  property: PropertyCardView;
  reservation: ReservationCardView;
  action: ReactNode;
  index: number;
}) {
  return (
    <motion.div initial={false}>
      <Card className="overflow-hidden rounded-[1.8rem]">
        <CardContent className="grid gap-5 p-4 lg:grid-cols-[190px_1fr_auto] lg:items-center">
          <div className="overflow-hidden rounded-[1.3rem]">
            <img src={property.image} alt={property.title} className="aspect-[1.2/1] w-full object-cover" />
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-3xl font-black leading-none tracking-[-0.05em]">
              {property.title}
            </h3>
            <div className="flex flex-wrap gap-4 text-sm leading-6 text-muted-foreground">
              <span>
                <strong className="text-foreground">Check In:</strong> {reservation.checkIn}
              </span>
              <span>
                <strong className="text-foreground">Duration:</strong> {reservation.duration}
              </span>
              <span>
                <strong className="text-foreground">Guests:</strong> {reservation.guests}
              </span>
            </div>
            <p className="font-display text-3xl font-black tracking-[-0.05em]">{reservation.price}</p>
          </div>

          <div className="lg:min-w-[220px]">{action}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function PropertyMeta({ property }: { property: PropertyCardView }) {
  return (
    <div className="flex flex-wrap gap-4 text-sm font-semibold text-muted-foreground">
      <MetaItem icon={<BedDouble className="size-4" />}>{property.beds}</MetaItem>
      <MetaItem icon={<Bath className="size-4" />}>{property.baths}</MetaItem>
      <MetaItem icon={<CarFront className="size-4" />}>{property.parking}</MetaItem>
      <MetaItem icon={<PawPrint className="size-4" />}>{property.pets}</MetaItem>
    </div>
  );
}

export function InfoPill({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/62 p-4">
      <p className="font-display text-[2rem] font-black leading-none tracking-[-0.05em] text-foreground">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
    </div>
  );
}

export function StatCard({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <Card className="rounded-[1.6rem]">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          {icon}
        </div>
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

export function InfoBullet({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/70 bg-white/60 px-4 py-3">
      <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-accent">
        <CheckCircle2 className="size-4" />
      </div>
      <span className="text-sm font-semibold text-foreground">{text}</span>
    </div>
  );
}

function MetaItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      {icon}
      {children}
    </span>
  );
}

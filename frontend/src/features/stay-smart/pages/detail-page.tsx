import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bath,
  BedDouble,
  CalendarIcon,
  CarFront,
  MapPin,
  PawPrint,
} from "lucide-react";
import { useParams } from "react-router-dom";

import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  InfoBullet,
  SectionHeading,
  StatCard,
} from "../components/content-blocks";
import { createReservation, getObject } from "../lib/api";
import type { ApiObject } from "../lib/api-types";
import { amenityGroups, safetyItems } from "../lib/mock-data";
import { itemMotion } from "../lib/motion";
import { mapObjectToCardView, prettifyType } from "../lib/view-models";

function formatDateLabel(value?: Date) {
  if (!value) {
    return "Pick a date";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function DetailPage() {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [object, setObject] = useState<ApiObject | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [booking, setBooking] = useState({
    startDate: new Date("2027-03-12"),
    endDate: new Date("2027-03-25"),
    guestCount: "2",
  });

  useEffect(() => {
    if (!propertyId) {
      return;
    }

    getObject(propertyId)
      .then((response) => {
        setObject(response.data);
        setSelectedVariantId(response.data.variants[0]?.id ?? null);
      })
      .catch((error: Error) => {
        setMessage(error.message);
      });
  }, [propertyId]);

  if (!object) {
    return (
      <p className="text-muted-foreground">
        {message ?? "Loading property..."}
      </p>
    );
  }

  const property = mapObjectToCardView(object);
  const selectedVariant =
    object.variants.find((variant) => variant.id === selectedVariantId) ??
    object.variants[0];

  const reserve = async () => {
    if (!user) {
      const nextMessage = "Login as guest first to create a reservation.";
      setMessage(nextMessage);
      showToast({
        variant: "info",
        title: "Login required",
        description: nextMessage,
      });
      return;
    }

    if (!selectedVariant) {
      showToast({
        variant: "error",
        title: "No variant selected",
        description: "This property has no active variants for booking.",
      });
      return;
    }

    const checkIn = booking.startDate;
    const checkOut = booking.endDate;
    if (!checkIn || !checkOut || startOfDay(checkIn) >= startOfDay(checkOut)) {
      showToast({
        variant: "error",
        title: "Invalid dates",
        description: "Check-out must be after check-in.",
      });
      return;
    }

    try {
      await createReservation({
        propertyId: object.id,
        variantId: selectedVariant.id,
        startDate: toIsoDate(checkIn),
        endDate: toIsoDate(checkOut),
        guestCount: Number(booking.guestCount),
      });
      const nextMessage =
        "Reservation created. Open Reservations to show the demo flow.";
      setMessage(nextMessage);
      showToast({
        variant: "success",
        title: "Reservation created",
        description: "Open Reservations to manage it.",
      });
    } catch (error) {
      const nextMessage =
        error instanceof Error
          ? error.message
          : "Failed to create reservation.";
      setMessage(nextMessage);
      showToast({
        variant: "error",
        title: "Reservation failed",
        description: nextMessage,
      });
    }
  };

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
          <img
            src={property.image}
            alt={property.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-6 bottom-6 flex items-end gap-4 text-white">
            <div className="flex size-14 items-center justify-center rounded-full bg-white/15 text-xl font-black backdrop-blur-md">
              {property.host.charAt(0)}
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-white/80">
                Listed by
              </span>
              <p className="font-display text-3xl font-black leading-none tracking-[-0.05em]">
                {property.host}
              </p>
              <p className="mt-2 text-sm text-white/80">{property.price}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemMotion}
          className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-2"
        >
          {[0, 1, 2, 3].map((tile) => (
            <div key={tile} className="overflow-hidden rounded-[1.7rem]">
              <img
                src={property.image}
                alt={property.title}
                className="aspect-[1/0.86] w-full object-cover"
              />
            </div>
          ))}
        </motion.div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <motion.div variants={itemMotion} className="min-w-0 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<BedDouble className="size-5" />}
              label={`${property.beds} Bedrooms`}
            />
            <StatCard
              icon={<Bath className="size-5" />}
              label={`${property.baths} Bathrooms`}
            />
            <StatCard
              icon={<CarFront className="size-5" />}
              label={`${property.parking} Cars / Bikes`}
            />
            <StatCard
              icon={<PawPrint className="size-5" />}
              label={`${property.pets} Pets Allowed`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Apartment Description</CardTitle>
              <CardDescription>
                {prettifyType(object.type)} in {object.city}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-base leading-8 text-muted-foreground">
              <p>{property.description}</p>
              <p>
                Listing status: {object.status}. Variants available:{" "}
                {object.variants.length}.
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

        <motion.aside
          variants={itemMotion}
          className="min-w-0 xl:sticky xl:top-28"
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle>{property.price}</CardTitle>
              <CardDescription>
                Creates a real reservation via backend session auth.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p>{selectedVariant?.title ?? "Main variant"}</p>
                <p>Capacity: {selectedVariant?.guests ?? 0} guests</p>
                <p>Monthly: {selectedVariant?.pricePerMonth ?? "n/a"} USD</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  Choose placement variant
                </p>
                <div className="grid gap-2">
                  {object.variants.map((variant) => {
                    const isActive = variant.id === selectedVariant?.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={cn(
                          "rounded-2xl border px-3 py-2 text-left transition",
                          isActive
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border bg-white/60 text-foreground hover:bg-white",
                        )}
                      >
                        <p className="text-sm font-semibold">{variant.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {variant.type.replace(/_/g, " ")} · {variant.guests}{" "}
                          guests · ${variant.pricePerNight}/night
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-2xl font-semibold"
                    >
                      <CalendarIcon className="size-4" />
                      Check-in: {formatDateLabel(booking.startDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={booking.startDate}
                      onSelect={(date) => {
                        if (!date) {
                          return;
                        }

                        setBooking((current) => {
                          const nextStartDate = startOfDay(date);
                          const currentEndDate = startOfDay(current.endDate);
                          const nextEndDate =
                            nextStartDate >= currentEndDate
                              ? new Date(
                                  nextStartDate.getFullYear(),
                                  nextStartDate.getMonth(),
                                  nextStartDate.getDate() + 1,
                                )
                              : current.endDate;

                          return {
                            ...current,
                            startDate: nextStartDate,
                            endDate: nextEndDate,
                          };
                        });
                      }}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-2xl font-semibold"
                    >
                      <CalendarIcon className="size-4" />
                      Check-out: {formatDateLabel(booking.endDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={booking.endDate}
                      onSelect={(date) => {
                        if (!date) {
                          return;
                        }

                        setBooking((current) => ({
                          ...current,
                          endDate: startOfDay(date),
                        }));
                      }}
                      disabled={(date) =>
                        startOfDay(date) <= startOfDay(booking.startDate)
                      }
                    />
                  </PopoverContent>
                </Popover>

                <Input
                  type="number"
                  min={1}
                  max={selectedVariant?.guests ?? 12}
                  value={booking.guestCount}
                  onChange={(event) =>
                    setBooking((current) => ({
                      ...current,
                      guestCount: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-3">
                <Button className="w-full" onClick={() => void reserve()}>
                  Reserve Now
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-white/80 bg-white/70"
                  disabled
                >
                  Property Inquiry
                </Button>
              </div>

              {message ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  {message}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </motion.aside>
      </section>
    </>
  );
}

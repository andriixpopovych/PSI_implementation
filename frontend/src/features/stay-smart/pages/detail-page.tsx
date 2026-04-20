import { useEffect, useState, type SyntheticEvent } from "react";
import { motion } from "framer-motion";
import {
  Bath,
  BedDouble,
  CarFront,
  CheckCircle2,
  ExternalLink,
  MapPin,
  PawPrint,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "@/app/auth-context";
import { useToast } from "@/app/toast-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import {
  InfoBullet,
  SectionHeading,
  StatCard,
} from "../components/content-blocks";
import { DateField } from "../components/search-controls";
import { SmartImage } from "../components/smart-image";
import { createReservation, getObject } from "../lib/api";
import type { ApiObject, ApiVariant } from "../lib/api-types";
import {
  calculateReservationTotal,
  formatBookingCurrency,
  getNightCount,
} from "../lib/booking";
import { getDemoImageFallback } from "../lib/media";
import { amenityGroups, safetyItems } from "../lib/mock-data";
import { itemMotion } from "../lib/motion";
import { staySmartRoutes } from "../lib/routes";
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

function clampGuestCount(value: number, maxGuests: number) {
  return Math.max(1, Math.min(value, Math.max(1, maxGuests)));
}

function buildVariantDescription(variant: ApiVariant) {
  const pieces = [
    prettifyType(variant.type),
    `${variant.guests} guest${variant.guests === 1 ? "" : "s"}`,
    `${variant.bedrooms} bedroom${variant.bedrooms === 1 ? "" : "s"}`,
    `${variant.bathrooms} bathroom${variant.bathrooms === 1 ? "" : "s"}`,
  ];

  if (variant.pricePerMonth) {
    pieces.push(`monthly option $${variant.pricePerMonth}`);
  }

  return pieces.join(" · ");
}

type BookingReceipt = {
  reservationId: string;
  variantTitle: string;
  total: number;
  nightCount: number;
  guestCount: number;
  startLabel: string;
  endLabel: string;
};

export function DetailPage() {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [object, setObject] = useState<ApiObject | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null,
  );
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false);
  const [bookingReceipt, setBookingReceipt] = useState<BookingReceipt | null>(
    null,
  );
  const [portraitGalleryImages, setPortraitGalleryImages] = useState<
    Record<string, boolean>
  >({});
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
  const galleryImages =
    property.images.length > 0 ? Array.from(new Set(property.images)) : [property.image];
  const secondaryGalleryImages = galleryImages.slice(1);
  const secondaryGalleryClassName =
    secondaryGalleryImages.length === 2
      ? "grid min-w-0 gap-5 xl:h-full xl:grid-rows-2"
      : "grid min-w-0 gap-5 sm:grid-cols-2 xl:h-full xl:auto-rows-fr xl:grid-cols-2";
  const selectedVariant =
    object.variants.find((variant) => variant.id === selectedVariantId) ??
    object.variants[0];
  const guestCount = clampGuestCount(
    Number(booking.guestCount) || 1,
    selectedVariant?.guests ?? 12,
  );
  const { nightCount, staySubtotal, serviceFee, extraGuestFee, total: bookingTotal } =
    calculateReservationTotal({
      pricePerNight: selectedVariant?.pricePerNight,
      startDate: booking.startDate,
      endDate: booking.endDate,
      guests: guestCount,
    });
  const mapQuery = `${object.address}, ${object.city}, ${object.country}`;
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapQuery,
  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const submitReservation = async () => {
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

    if (guestCount > selectedVariant.guests) {
      showToast({
        variant: "error",
        title: "Guest limit reached",
        description: `This variant allows up to ${selectedVariant.guests} guest${selectedVariant.guests === 1 ? "" : "s"}.`,
      });
      return;
    }

    try {
      setIsSubmittingReservation(true);
      const reservation = await createReservation({
        propertyId: object.id,
        variantId: selectedVariant.id,
        startDate: toIsoDate(checkIn),
        endDate: toIsoDate(checkOut),
        guestCount,
      });
      const nextMessage =
        "Reservation created. You can review it in Reservations.";
      setMessage(nextMessage);
      setBookingReceipt({
        reservationId: reservation.id,
        variantTitle: selectedVariant.title,
        total: bookingTotal,
        nightCount,
        guestCount,
        startLabel: formatDateLabel(checkIn),
        endLabel: formatDateLabel(checkOut),
      });
      showToast({
        variant: "success",
        title: "Reservation created",
        description: `${selectedVariant.title} is ready for ${nightCount} night${nightCount === 1 ? "" : "s"}.`,
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
    } finally {
      setIsSubmittingReservation(false);
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
          <SmartImage
            src={galleryImages[0] ?? property.image}
            alt={property.title}
            fallbackSrc={getDemoImageFallback(0)}
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
          className={secondaryGalleryClassName}
        >
          {secondaryGalleryImages.map((image, tile) => (
            <div
              key={`${image}-${tile}`}
              className="overflow-hidden rounded-[1.7rem] min-h-[180px] xl:h-full xl:min-h-0"
            >
              {portraitGalleryImages[image] ? (
                <div className="flex h-full items-center justify-center bg-[rgba(255,252,248,0.92)] p-5 xl:p-6">
                  <SmartImage
                    src={image}
                    alt={`${property.title} preview ${tile + 2}`}
                    fallbackSrc={getDemoImageFallback(tile + 1)}
                    onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
                      const target = event.currentTarget;
                      const isPortrait =
                        target.naturalHeight > target.naturalWidth * 1.15;

                      setPortraitGalleryImages((current) =>
                        current[image] === isPortrait
                          ? current
                          : { ...current, [image]: isPortrait },
                      );
                    }}
                    className="max-h-[72%] w-auto max-w-full object-contain"
                  />
                </div>
              ) : (
                <SmartImage
                  src={image}
                  alt={`${property.title} preview ${tile + 2}`}
                  fallbackSrc={getDemoImageFallback(tile + 1)}
                  onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
                    const target = event.currentTarget;
                    const isPortrait =
                      target.naturalHeight > target.naturalWidth * 1.15;

                    setPortraitGalleryImages((current) =>
                      current[image] === isPortrait
                        ? current
                        : { ...current, [image]: isPortrait },
                    );
                  }}
                  className={
                    secondaryGalleryImages.length === 2
                      ? "aspect-[1.8/1] w-full object-cover xl:h-full xl:aspect-auto"
                      : "h-full w-full object-cover"
                  }
                />
              )}
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

          <Card className="overflow-hidden rounded-[2rem] border-white/70">
            <CardHeader className="pb-3">
              <CardTitle>Location</CardTitle>
              <CardDescription>
                {object.address}, {object.city}, {object.country}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative overflow-hidden rounded-[1.7rem] border border-white/80 bg-white/80">
                <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-2 text-sm font-semibold text-foreground shadow-[0_10px_24px_rgba(89,61,34,0.12)]">
                  <MapPin className="size-4 text-primary" />
                  Map preview
                </div>
                <iframe
                  title={`Map for ${property.title}`}
                  src={googleMapsEmbedUrl}
                  className="h-[320px] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                Open in Google Maps
                <ExternalLink className="size-4" />
              </a>
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
                Pick dates now, then choose the final stay option in the booking window.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p>{selectedVariant?.title ?? "Main variant"}</p>
                <p>Capacity: {selectedVariant?.guests ?? 0} guests</p>
                <p>Monthly: {selectedVariant?.pricePerMonth ?? "n/a"} USD</p>
              </div>

              <div className="rounded-[1.6rem] border border-dashed border-primary/20 bg-primary/5 p-4 text-sm leading-7 text-muted-foreground">
                <p className="font-semibold text-foreground">
                  Final option is chosen after Reserve Now
                </p>
                <p className="mt-1">
                  We will show every available variant in a confirmation window
                  together with an estimated total before the reservation is
                  sent.
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <DateField
                  label={`Check In · ${formatDateLabel(booking.startDate)}`}
                  value={toIsoDate(booking.startDate)}
                  onChange={(value) => {
                    const nextStartDate = startOfDay(new Date(value));
                    if (Number.isNaN(nextStartDate.getTime())) {
                      return;
                    }

                    setBooking((current) => {
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

                <DateField
                  label={`Check Out · ${formatDateLabel(booking.endDate)}`}
                  value={toIsoDate(booking.endDate)}
                  min={toIsoDate(booking.startDate)}
                  onChange={(value) => {
                    const nextEndDate = startOfDay(new Date(value));
                    if (Number.isNaN(nextEndDate.getTime())) {
                      return;
                    }

                    setBooking((current) => ({
                      ...current,
                      endDate: nextEndDate,
                    }));
                  }}
                />

                <Input
                  type="number"
                  min={1}
                  max={selectedVariant?.guests ?? 12}
                  value={guestCount}
                  onChange={(event) =>
                    setBooking((current) => ({
                      ...current,
                      guestCount: String(
                        clampGuestCount(
                          Number(event.target.value) || 1,
                          selectedVariant?.guests ?? 12,
                        ),
                      ),
                    }))
                  }
                />
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => {
                    setBookingReceipt(null);
                    setIsBookingDialogOpen(true);
                  }}
                  disabled={!selectedVariant}
                >
                  Reserve Now
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

      <Dialog
        open={isBookingDialogOpen}
        onOpenChange={(open) => {
          setIsBookingDialogOpen(open);
          if (!open) {
            setBookingReceipt(null);
          }
        }}
      >
        <DialogContent className="w-[min(920px,calc(100%-24px))] max-w-none overflow-hidden p-0">
          {bookingReceipt ? (
            <div className="bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(252,245,237,0.98),rgba(242,227,210,0.92))] p-8 sm:p-10">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-[0_18px_36px_rgba(16,185,129,0.16)]">
                <CheckCircle2 className="size-8" />
              </div>
              <DialogHeader className="mt-6">
                <DialogTitle className="text-center">
                  Reservation confirmed
                </DialogTitle>
                <DialogDescription className="max-w-[42ch]">
                  {bookingReceipt.variantTitle} is booked from{" "}
                  {bookingReceipt.startLabel} to {bookingReceipt.endLabel} for{" "}
                  {bookingReceipt.guestCount} guest
                  {bookingReceipt.guestCount === 1 ? "" : "s"}.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-white/80 bg-white/82 p-4 text-center shadow-[0_14px_30px_rgba(89,61,34,0.08)]">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Reservation ID
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {bookingReceipt.reservationId.slice(0, 8)}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/80 bg-white/82 p-4 text-center shadow-[0_14px_30px_rgba(89,61,34,0.08)]">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Stay Length
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {bookingReceipt.nightCount} night
                    {bookingReceipt.nightCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/80 bg-white/82 p-4 text-center shadow-[0_14px_30px_rgba(89,61,34,0.08)]">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Total
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {formatBookingCurrency(bookingReceipt.total)}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.6rem] border border-white/80 bg-white/84 p-5 shadow-[0_18px_40px_rgba(89,61,34,0.08)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  What happens next
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  You can now open the Reservations page to review or cancel this stay.
                </p>
              </div>

              <DialogFooter>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setIsBookingDialogOpen(false);
                    setBookingReceipt(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    setIsBookingDialogOpen(false);
                    setBookingReceipt(null);
                    navigate(staySmartRoutes.reservations);
                  }}
                >
                  Open Reservations
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <div className="border-b border-white/60 p-8 lg:border-b-0 lg:border-r">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-left">
                    Choose your stay option
                  </DialogTitle>
                  <DialogDescription className="mx-0 max-w-none text-left">
                    Pick the variant you want, review the estimate, then confirm the reservation.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 grid gap-3">
                  {object.variants.map((variant) => {
                    const isActive = variant.id === selectedVariant?.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          setBooking((current) => ({
                            ...current,
                            guestCount: String(
                              clampGuestCount(
                                Number(current.guestCount) || 1,
                                variant.guests,
                              ),
                            ),
                          }));
                        }}
                        className={cn(
                          "rounded-[1.5rem] border px-4 py-4 text-left transition",
                          isActive
                            ? "border-primary/30 bg-primary/10 text-primary shadow-[0_16px_32px_rgba(157,69,39,0.12)]"
                            : "border-white/80 bg-white/70 text-foreground hover:bg-white",
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-base font-semibold">
                              {variant.title}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              {buildVariantDescription(variant)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-semibold">
                              {formatBookingCurrency(variant.pricePerNight)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              per night
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-[1.1rem] bg-white/70 px-3 py-2 text-center text-xs font-semibold text-muted-foreground">
                            {variant.bedrooms} bedrooms
                          </div>
                          <div className="rounded-[1.1rem] bg-white/70 px-3 py-2 text-center text-xs font-semibold text-muted-foreground">
                            {variant.bathrooms} bathrooms
                          </div>
                          <div className="rounded-[1.1rem] bg-white/70 px-3 py-2 text-center text-xs font-semibold text-muted-foreground">
                            Up to {variant.guests} guests
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(252,245,237,0.98),rgba(242,227,210,0.92))] p-8">
                <div className="rounded-[1.6rem] border border-white/80 bg-white/84 p-5 shadow-[0_18px_40px_rgba(89,61,34,0.08)]">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Booking summary
                  </p>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-muted-foreground">Variant</span>
                      <span className="text-right font-semibold text-foreground">
                        {selectedVariant?.title ?? "Not available"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-muted-foreground">Dates</span>
                      <span className="text-right font-semibold text-foreground">
                        {formatDateLabel(booking.startDate)} to{" "}
                        {formatDateLabel(booking.endDate)}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-muted-foreground">Guests</span>
                      <span className="text-right font-semibold text-foreground">
                        {guestCount} guest{guestCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-muted-foreground">Stay length</span>
                      <span className="text-right font-semibold text-foreground">
                        {nightCount} night{nightCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.6rem] border border-white/80 bg-white/88 p-5 shadow-[0_18px_40px_rgba(89,61,34,0.08)]">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Estimated total
                  </p>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4 text-muted-foreground">
                      <span>
                        {formatBookingCurrency(selectedVariant?.pricePerNight ?? 0)} x{" "}
                        {nightCount} night{nightCount === 1 ? "" : "s"}
                      </span>
                      <span>{formatBookingCurrency(staySubtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-muted-foreground">
                      <span>Service fee</span>
                      <span>{formatBookingCurrency(serviceFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-muted-foreground">
                      <span>Extra guest fee</span>
                      <span>{formatBookingCurrency(extraGuestFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between gap-4 text-base font-semibold text-foreground">
                      <span>Total due now</span>
                      <span>{formatBookingCurrency(bookingTotal)}</span>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setIsBookingDialogOpen(false)}
                    disabled={isSubmittingReservation}
                  >
                    Back
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => void submitReservation()}
                    disabled={!selectedVariant || isSubmittingReservation}
                  >
                    {isSubmittingReservation
                      ? "Confirming..."
                      : "Confirm reservation"}
                  </Button>
                </DialogFooter>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

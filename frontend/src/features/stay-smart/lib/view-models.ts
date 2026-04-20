import type { ApiObject, ApiReservation, ListingStatus } from './api-types';
import { calculateReservationTotal, formatBookingCurrency } from './booking';
import { getDemoImageFallback } from './media';

export type PropertyCardView = {
  id: string;
  title: string;
  address: string;
  city: string;
  country: string;
  price: string;
  nightlyPrice: number | null;
  beds: number;
  baths: number;
  maxGuests: number;
  parking: number;
  pets: number;
  host: string;
  type: string;
  period: string;
  badge: string;
  image: string;
  images: string[];
  status: ListingStatus;
  description: string;
  variants: ApiObject['variants'];
};

export type ReservationCardView = {
  id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  guests: string;
  price: string;
  status: 'upcoming' | 'completed' | 'canceled';
  apiStatus: ApiReservation['status'];
};

function formatCurrency(value?: number | null) {
  if (!value) {
    return 'Price on request';
  }

  return formatBookingCurrency(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatDuration(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInDays = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return `${diffInDays} day${diffInDays === 1 ? '' : 's'}`;
}

function getVariantImages(object: ApiObject, index = 0) {
  const variantImages = object.variants
    .map((variant) => variant.photoUrl)
    .filter((image): image is string => Boolean(image));

  if (variantImages.length > 0) {
    return Array.from(new Set(variantImages));
  }

  return [getDemoImageFallback(index)];
}

export function mapObjectToCardView(object: ApiObject, index = 0): PropertyCardView {
  const mainVariant = object.variants[0];
  const images = getVariantImages(object, index);

  return {
    id: object.id,
    title: object.title,
    address: `${object.address}, ${object.city}, ${object.country}`,
    city: object.city,
    country: object.country,
    price: mainVariant
      ? `${formatCurrency(mainVariant.pricePerNight)} / night`
      : 'Variant missing',
    nightlyPrice: mainVariant?.pricePerNight ?? null,
    beds: mainVariant?.bedrooms ?? 0,
    baths: mainVariant?.bathrooms ?? 0,
    maxGuests: Math.max(...object.variants.map((variant) => variant.guests), 0),
    parking: Math.max(0, Math.min(2, mainVariant?.bedrooms ?? 0)),
    pets: 0,
    host: object.host?.fullName ?? 'Stay Smart Host',
    type: prettifyType(object.type),
    period: mainVariant?.pricePerMonth
      ? `${formatCurrency(mainVariant.pricePerMonth)} / month`
      : 'Short and medium stays',
    badge: listingBadge(object.status),
    image: images[0],
    images,
    status: object.status,
    description:
      object.description ?? 'Comfortable place prepared for quick demo and reservation flows.',
    variants: object.variants,
  };
}

export function mapReservationToCardView(
  reservation: ApiReservation,
  objects: ApiObject[],
): ReservationCardView {
  const relatedObject =
    objects.find((item) => item.id === reservation.object?.id) ??
    (reservation.object
      ? {
          id: reservation.object.id,
          title: reservation.object.title,
          description: null,
          type: reservation.object.type,
          city: reservation.object.city,
          country: '',
          address: reservation.object.address,
          status: 'APPROVED' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          host: null,
          variants: [],
        }
      : null);

  const variantPrice = reservation.variant?.pricePerNight ?? relatedObject?.variants[0]?.pricePerNight ?? null;
  const reservationPricing = calculateReservationTotal({
    pricePerNight: variantPrice,
    startDate: reservation.startDate,
    endDate: reservation.endDate,
    guests: reservation.guests,
  });
  const now = Date.now();
  const isCanceled = reservation.status === 'CANCELED';
  const isCompleted =
    reservation.status === 'COMPLETED' ||
    (!isCanceled && new Date(reservation.endDate).getTime() < now);

  return {
    id: reservation.id,
    propertyId: reservation.object?.id ?? relatedObject?.id ?? '',
    checkIn: formatDate(reservation.startDate),
    checkOut: formatDate(reservation.endDate),
    duration: formatDuration(reservation.startDate, reservation.endDate),
    guests: `${reservation.guests} guest${reservation.guests === 1 ? '' : 's'}`,
    price: variantPrice ? `${formatBookingCurrency(reservationPricing.total)} total` : 'Reserved',
    status: isCanceled ? 'canceled' : isCompleted ? 'completed' : 'upcoming',
    apiStatus: reservation.status,
  };
}

export function prettifyType(type: string) {
  return type
    .toLowerCase()
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

function listingBadge(status: ListingStatus) {
  if (status === 'APPROVED') {
    return 'Live listing';
  }

  if (status === 'REJECTED') {
    return 'Needs fixes';
  }

  return 'Waiting approval';
}

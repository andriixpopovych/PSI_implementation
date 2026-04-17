import type { ApiObject, ApiReservation, ListingStatus } from './api-types';

export type PropertyCardView = {
  id: string;
  title: string;
  address: string;
  price: string;
  beds: number;
  baths: number;
  parking: number;
  pets: number;
  host: string;
  type: string;
  period: string;
  badge: string;
  image: string;
  status: ListingStatus;
  description: string;
  variants: ApiObject['variants'];
};

export type ReservationCardView = {
  id: string;
  propertyId: string;
  checkIn: string;
  duration: string;
  guests: string;
  price: string;
  status: 'upcoming' | 'past';
  apiStatus: ApiReservation['status'];
};

const fallbackImages = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
];

function formatCurrency(value?: number | null) {
  if (!value) {
    return 'Price on request';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
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

export function mapObjectToCardView(object: ApiObject, index = 0): PropertyCardView {
  const mainVariant = object.variants[0];

  return {
    id: object.id,
    title: object.title,
    address: `${object.address}, ${object.city}, ${object.country}`,
    price: mainVariant
      ? `${formatCurrency(mainVariant.pricePerNight)} / night`
      : 'Variant missing',
    beds: mainVariant?.bedrooms ?? 0,
    baths: mainVariant?.bathrooms ?? 0,
    parking: Math.max(0, Math.min(2, mainVariant?.bedrooms ?? 0)),
    pets: 0,
    host: object.host?.fullName ?? 'Stay Smart Host',
    type: prettifyType(object.type),
    period: mainVariant?.pricePerMonth
      ? `${formatCurrency(mainVariant.pricePerMonth)} / month`
      : 'Short and medium stays',
    badge: listingBadge(object.status),
    image: fallbackImages[index % fallbackImages.length],
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
  const now = Date.now();
  const isPast = new Date(reservation.endDate).getTime() < now || reservation.status !== 'ACTIVE';

  return {
    id: reservation.id,
    propertyId: reservation.object?.id ?? relatedObject?.id ?? '',
    checkIn: formatDate(reservation.startDate),
    duration: formatDuration(reservation.startDate, reservation.endDate),
    guests: `${reservation.guests} guest${reservation.guests === 1 ? '' : 's'}`,
    price: variantPrice ? `${formatCurrency(variantPrice)}` : 'Reserved',
    status: isPast ? 'past' : 'upcoming',
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

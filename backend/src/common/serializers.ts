import type {
  AccommodationObject,
  PlacementVariant,
  Reservation,
  User,
} from '../generated/prisma/client';

export function serializeObject(
  object: AccommodationObject & {
    host?: Pick<User, 'id' | 'fullName' | 'email'> | null;
    variants?: PlacementVariant[];
  },
) {
  return {
    id: object.id,
    title: object.title,
    description: object.description,
    type: object.type,
    city: object.city,
    country: object.country,
    address: object.address,
    status: object.status,
    host: object.host
      ? {
          id: object.host.id,
          fullName: object.host.fullName,
          email: object.host.email,
        }
      : null,
    createdAt: object.createdAt,
    updatedAt: object.updatedAt,
    variants:
      object.variants?.map((variant) => ({
        id: variant.id,
        title: variant.title,
        photoUrl: variant.photoUrl,
        type: variant.type,
        guests: variant.guests,
        bedrooms: variant.bedrooms,
        bathrooms: variant.bathrooms,
        pricePerNight: variant.pricePerNight,
        pricePerMonth: variant.pricePerMonth,
        isActive: variant.isActive,
      })) ?? [],
  };
}

export function serializeReservation(
  reservation: Reservation & {
    object?: AccommodationObject | null;
    variant?: PlacementVariant | null;
  },
) {
  return {
    id: reservation.id,
    status: reservation.status,
    startDate: reservation.startDate,
    endDate: reservation.endDate,
    guests: reservation.guests,
    cancelReason: reservation.cancelReason,
    canceledAt: reservation.canceledAt,
    object: reservation.object
      ? {
          id: reservation.object.id,
          title: reservation.object.title,
          type: reservation.object.type,
          city: reservation.object.city,
          address: reservation.object.address,
        }
      : null,
    variant: reservation.variant
      ? {
          id: reservation.variant.id,
          title: reservation.variant.title,
          type: reservation.variant.type,
          pricePerNight: reservation.variant.pricePerNight,
          pricePerMonth: reservation.variant.pricePerMonth,
        }
      : null,
  };
}

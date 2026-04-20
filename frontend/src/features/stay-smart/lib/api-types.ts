export type UserRole = 'GUEST' | 'HOST' | 'ADMIN';
export type ListingStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PropertyType = 'APARTMENT' | 'HOUSE' | 'HOSTEL' | 'VILLA' | 'ROOM';
export type PlacementVariantType = 'ENTIRE_PLACE' | 'PRIVATE_ROOM' | 'SHARED_ROOM' | 'STUDIO';
export type ReservationStatus = 'ACTIVE' | 'CANCELED' | 'COMPLETED';

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};

export type ApiVariant = {
  id: string;
  title: string;
  photoUrl: string | null;
  type: PlacementVariantType;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  pricePerMonth: number | null;
  isActive: boolean;
};

export type ApiObject = {
  id: string;
  title: string;
  description: string | null;
  type: PropertyType;
  city: string;
  country: string;
  address: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  host: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  variants: ApiVariant[];
};

export type ApiReservation = {
  id: string;
  status: ReservationStatus;
  startDate: string;
  endDate: string;
  guests: number;
  cancelReason: string | null;
  canceledAt: string | null;
  object: {
    id: string;
    title: string;
    type: PropertyType;
    city: string;
    address: string;
  } | null;
  variant: {
    id: string;
    title: string;
    type: PlacementVariantType;
    pricePerNight: number;
    pricePerMonth: number | null;
  } | null;
};

export type ApiLocationOption = {
  city: string;
  country: string;
  label: string;
};

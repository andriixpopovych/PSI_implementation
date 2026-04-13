export type ReservationTab = 'upcoming' | 'past';

export type Property = {
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
};

export type Reservation = {
  id: string;
  propertyId: string;
  checkIn: string;
  duration: string;
  guests: string;
  price: string;
  status: ReservationTab;
};

export const searchModes = ['Rooms', 'Flats', 'Hostels', 'Villas'] as const;
export type SearchMode = (typeof searchModes)[number];

export const categoryFilters = [
  'Apartments',
  'Houses',
  'Villas',
  'Homestays',
  'Studios',
  'More',
] as const;
export type CategoryFilter = (typeof categoryFilters)[number];

export const hostTypes = ['Apartment', 'Flat', 'Room', 'Villa'] as const;
export type HostType = (typeof hostTypes)[number];

export const amenityGroups = [
  'Kitchen',
  'Television with Netflix',
  'Air Conditioner',
  'Free Wireless Internet',
  'Washer',
  'Balcony or Patio',
];

export const safetyItems = [
  'Daily Cleaning',
  'Fire Extinguishers',
  'Disinfections and Sterilizations',
  'Smoke Detectors',
];

export const properties: Property[] = [
  {
    id: 'amber-flat',
    title: 'Well Furnished Apartment',
    address: '100 Smart Street, LA, USA',
    price: '$1000 - $5000 USD',
    beds: 3,
    baths: 1,
    parking: 2,
    pets: 0,
    host: 'John Doberman',
    type: 'Apartment on Rent',
    period: 'For Long Period: 1 - 2 Years',
    badge: 'Fast move-in',
    image:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'dream-building',
    title: 'Amazing Dream Building',
    address: '100 Smart Street, LA, USA',
    price: '$1200 - $2800 USD',
    beds: 2,
    baths: 1,
    parking: 1,
    pets: 0,
    host: 'Harry Potter',
    type: 'Apartment on Rent',
    period: 'For Medium Period: 2 - 4 Months',
    badge: 'Design pick',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'boys-hostel',
    title: 'Boys Hostel Apartment',
    address: '100 Smart Street, LA, USA',
    price: '$500 - $1100 USD',
    beds: 3,
    baths: 1,
    parking: 0,
    pets: 0,
    host: 'Sofia Reed',
    type: 'Hostel on Rent',
    period: 'For Semester Stay',
    badge: 'Student choice',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sunset-villa',
    title: 'Sunset Villa Modern',
    address: '41 Palm Court, Valencia',
    price: '$1900 - $4200 USD',
    beds: 4,
    baths: 2,
    parking: 2,
    pets: 0,
    host: 'Mason Lee',
    type: 'Villa on Rent',
    period: 'For Medium Period: 3 - 6 Months',
    badge: 'Warm terrace',
    image:
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'family-rent',
    title: 'Large Family Flat on Rent',
    address: '203 Willow Park, Prague',
    price: '$1600 - $3600 USD',
    beds: 3,
    baths: 1,
    parking: 2,
    pets: 1,
    host: 'Nina Ford',
    type: 'Flat on Rent',
    period: 'For Long Period: 8 - 12 Months',
    badge: 'Family ready',
    image:
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'beach-house',
    title: 'Beach House Apartment',
    address: '7 Coastline Ave, Split',
    price: '$1500 - $3200 USD',
    beds: 2,
    baths: 1,
    parking: 1,
    pets: 1,
    host: 'Noah Price',
    type: 'Home Room on Rent',
    period: 'For Short Period: 3 - 5 Months',
    badge: 'Near the sea',
    image:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'harbor-loft',
    title: 'Harbor Loft Apartment',
    address: '18 Marina Walk, Lisbon',
    price: '$1200 - $2800 USD',
    beds: 3,
    baths: 1,
    parking: 1,
    pets: 1,
    host: 'Olivia Hart',
    type: 'Apartment on Rent',
    period: 'For Long Period: 1 - 2 Years',
    badge: 'City favorite',
    image:
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'attached-room',
    title: 'Large Room with Attached Bathroom',
    address: '36 Canopera Street, Lisbon',
    price: '$1000 - $5000 USD',
    beds: 1,
    baths: 1,
    parking: 2,
    pets: 0,
    host: 'Harry Potter',
    type: 'Home Room on Rent',
    period: 'For Short Period: 3 - 5 Months',
    badge: 'Private bath',
    image:
      'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'studio-calm',
    title: 'Country Boys Hostel',
    address: '100 Smart Street, LA, USA',
    price: '$700 - $1400 USD',
    beds: 3,
    baths: 1,
    parking: 0,
    pets: 0,
    host: 'Elena Cruz',
    type: 'Shared Hostel',
    period: 'For Short Period: 2 - 8 Weeks',
    badge: 'Budget pick',
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  },
];

export const reservations: Reservation[] = [
  {
    id: 'reservation-1',
    propertyId: 'amber-flat',
    checkIn: '12 Mar 2027',
    duration: 'Long (2 - 5 Years)',
    guests: '4 Adults',
    price: '$1000 USD',
    status: 'upcoming',
  },
  {
    id: 'reservation-2',
    propertyId: 'family-rent',
    checkIn: '28 Apr 2027',
    duration: 'Medium (2 - 8 Months)',
    guests: '3 Adults',
    price: '$1400 USD',
    status: 'upcoming',
  },
  {
    id: 'reservation-3',
    propertyId: 'beach-house',
    checkIn: '07 Nov 2026',
    duration: 'Short (3 Weeks)',
    guests: '2 Adults',
    price: '$900 USD',
    status: 'past',
  },
];

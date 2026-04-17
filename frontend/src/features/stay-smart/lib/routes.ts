export const staySmartRoutes = {
  home: '/',
  catalog: '/catalog',
  results: '/results',
  host: '/host',
  addListing: '/host/add',
  manager: '/manager',
  saved: '/host/saved',
  reservations: '/reservations',
  property: (propertyId = ':propertyId') => `/properties/${propertyId}`,
} as const;

export function isHostPath(pathname: string) {
  return pathname.startsWith(staySmartRoutes.host);
}

export function isReservationsPath(pathname: string) {
  return pathname.startsWith(staySmartRoutes.reservations);
}

export function isManagerPath(pathname: string) {
  return pathname.startsWith(staySmartRoutes.manager);
}

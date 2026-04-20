export const staySmartRoutes = {
  home: '/',
  catalog: '/catalog',
  results: '/results',
  host: '/host',
  addListing: '/host/add',
  manageObject: (propertyId = ':propertyId') => `/host/${propertyId}/manage`,
  manageVariants: (propertyId = ':propertyId') => `/host/${propertyId}/variants`,
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

import type { ApiLocationOption, ApiObject, ApiReservation, ListingStatus, SessionUser } from './api-types';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined;

  if (hasBody) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : typeof payload === 'string' && payload.trim().length > 0
          ? payload
        : `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return payload as T;
}

export const demoAccounts = {
  guest: {
    email: 'guest@staysmart.app',
    password: 'demo1234',
    label: 'Guest',
  },
  host: {
    email: 'host@staysmart.app',
    password: 'demo1234',
    label: 'Host',
  },
  manager: {
    email: 'manager@staysmart.app',
    password: 'demo1234',
    label: 'Manager',
  },
} as const;

export async function getSessionUser() {
  return apiRequest<{ user: SessionUser }>('/auth/me');
}

export async function login(email: string, password: string) {
  return apiRequest<{ user: SessionUser }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function logout() {
  return apiRequest<{ success: boolean }>('/auth/logout', {
    method: 'POST',
  });
}

export async function searchObjects(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });

  return apiRequest<{ count: number; data: ApiObject[] }>(`/search?${query.toString()}`);
}

export async function searchLocations() {
  return apiRequest<{ count: number; data: ApiLocationOption[] }>('/search/locations');
}

export async function getObject(objectId: string) {
  return apiRequest<{ data: ApiObject }>(`/objects/${objectId}`);
}

export async function getMyReservations() {
  return apiRequest<{ count: number; data: ApiReservation[] }>('/me/reservations');
}

export async function cancelReservation(id: string, reason: string) {
  return apiRequest<{ message: string; data: ApiReservation }>(`/reservations/${id}/cancel`, {
    method: 'PATCH',
    body: { reason },
  });
}

export async function createReservation(payload: {
  propertyId: string;
  variantId?: string;
  startDate: string;
  endDate: string;
  guestCount: number;
}) {
  return apiRequest<ApiReservation>('/reservations', {
    method: 'POST',
    body: payload,
  });
}

export async function getMyListings() {
  return apiRequest<{ count: number; data: ApiObject[] }>('/objects/me/listings');
}

export async function updateObject(
  objectId: string,
  payload: Partial<{
    title: string;
    description: string;
    city: string;
    country: string;
    address: string;
  }>,
) {
  return apiRequest<{ message: string; data: ApiObject }>(`/objects/${objectId}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function createListing(payload: {
  title: string;
  description: string;
  type: ApiObject['type'];
  city: string;
  country: string;
  address: string;
  initialVariant?: {
    title: string;
    photoUrl?: string;
    type: ApiObject['variants'][number]['type'];
    guests: number;
    bedrooms: number;
    bathrooms: number;
    pricePerNight: number;
    pricePerMonth?: number;
  };
  variants?: Array<{
    title: string;
    photoUrl?: string;
    type: ApiObject['variants'][number]['type'];
    guests: number;
    bedrooms: number;
    bathrooms: number;
    pricePerNight: number;
    pricePerMonth?: number;
    isActive?: boolean;
  }>;
}) {
  return apiRequest<{ message: string; data: ApiObject }>('/objects', {
    method: 'POST',
    body: payload,
  });
}

export async function createObjectVariant(
  objectId: string,
  payload: {
    title: string;
    photoUrl?: string;
    type: ApiObject['variants'][number]['type'];
    guests: number;
    bedrooms: number;
    bathrooms: number;
    pricePerNight: number;
    pricePerMonth?: number;
    isActive?: boolean;
  },
) {
  return apiRequest<{ message: string; data: ApiObject['variants'][number] }>(
    `/objects/${objectId}/variants`,
    {
      method: 'POST',
      body: payload,
    },
  );
}

export async function updateObjectVariant(
  objectId: string,
  variantId: string,
  payload: Partial<{
    title: string;
    photoUrl: string;
    type: ApiObject['variants'][number]['type'];
    guests: number;
    bedrooms: number;
    bathrooms: number;
    pricePerNight: number;
    pricePerMonth: number;
    isActive: boolean;
  }>,
) {
  return apiRequest<{ message: string; data: ApiObject['variants'][number] }>(
    `/objects/${objectId}/variants/${variantId}`,
    {
      method: 'PATCH',
      body: payload,
    },
  );
}

export async function deleteObjectVariant(objectId: string, variantId: string) {
  return apiRequest<{ message: string }>(
    `/objects/${objectId}/variants/${variantId}/delete`,
    {
      method: 'POST',
    },
  );
}

export async function getListingsForReview(status?: ListingStatus) {
  const suffix = status ? `?status=${status}` : '';
  return apiRequest<{ count: number; data: ApiObject[] }>(`/objects/manager/review${suffix}`);
}

export async function reviewListing(id: string, status: ListingStatus, note?: string) {
  return apiRequest<{ message: string; data: ApiObject }>(`/objects/manager/${id}/status`, {
    method: 'PATCH',
    body: { status, note },
  });
}

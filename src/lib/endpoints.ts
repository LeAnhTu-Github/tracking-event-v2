export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://api.gms.xtel.vn';

export const APPS_ENDPOINT = `${BASE_URL}/apps`;

export const EVENTS_SEARCH_ENDPOINT = `${BASE_URL}/events/search`;

export const LEVELS_ENDPOINT = (appId: number) => `${BASE_URL}/api/levels/${appId}`;
export const DROPPED_USERS_ENDPOINT = (appId: number) =>
  `${BASE_URL}/api/dropped-users/${appId}`;

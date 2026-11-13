import axios from 'axios';

export const TOKEN_KEY = 'swiftbus.token';
export const USER_KEY = 'swiftbus.user';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const userStore = {
  get: () => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
      return null;
    }
  },
  set: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: () => localStorage.removeItem(USER_KEY),
};

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
});

// Short-lived client cache so revisiting a page renders immediately.
const CACHE_TTL = 30_000;
const responseCache = new Map();
const inFlight = new Map();

function serializeParams(params = {}) {
  return Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
}

export function invalidateCache(prefix) {
  if (!prefix) {
    responseCache.clear();
    inFlight.clear();
    return;
  }

  for (const key of [...responseCache.keys()]) {
    if (key.startsWith(prefix)) responseCache.delete(key);
  }

  for (const key of [...inFlight.keys()]) {
    if (key.startsWith(prefix)) inFlight.delete(key);
  }
}

// Read a still-fresh response synchronously so a page can render its data
// on the first paint instead of showing a loading state.
export function peekCache(url, config = {}) {
  const key = `${url}?${serializeParams(config.params)}`;
  const cached = responseCache.get(key);

  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return cached.data;
  }

  return null;
}

export function cachedGet(url, config = {}) {
  const key = `${url}?${serializeParams(config.params)}`;
  const cached = responseCache.get(key);

  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return Promise.resolve({ ...cached.response, data: cached.data });
  }

  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  const request = http
    .get(url, config)
    .then((response) => {
      responseCache.set(key, { data: response.data, at: Date.now() });
      return response;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
}

http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => {
    if (response.config.method && response.config.method !== 'get') {
      invalidateCache();
    }
    return response;
  },
  (error) => {
    const hadSession = Boolean(tokenStore.get());
    const status = error.response?.status;

    if (status === 401 && hadSession) {
      tokenStore.clear();
      userStore.clear();
      invalidateCache();
      window.dispatchEvent(new Event('swiftbus:unauthorized'));
    }

    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'The server took too long to respond.'
        : 'Unable to reach the SwiftBus server.');

    const normalized = new Error(message);
    normalized.status = status;
    return Promise.reject(normalized);
  }
);

export default http;

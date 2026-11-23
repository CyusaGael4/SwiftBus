import axios from 'axios';

export const TOKEN_KEY = 'swiftbus.token';
export const USER_KEY = 'swiftbus.user';
export const REMEMBER_KEY = 'swiftbus.keep-signed-in';

// A remembered session goes to localStorage and survives closing the browser;
// an ordinary one goes to sessionStorage and ends with the tab. Reads check
// both so a reload, or a second tab, always finds the active session.
function readValue(key) {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

function writeValue(key, value, remember) {
  const target = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  target.setItem(key, value);
  other.removeItem(key);
}

function removeValue(key) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

function tokenIsRemembered() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export const tokenStore = {
  get: () => readValue(TOKEN_KEY),
  set: (token, remember = true) => {
    writeValue(TOKEN_KEY, token, remember);
    localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0');
  },
  clear: () => removeValue(TOKEN_KEY),
  // Keeps the sign in choice after signing out, so the box starts where the
  // person left it.
  remembered: () => localStorage.getItem(REMEMBER_KEY) !== '0',
};

export const userStore = {
  get: () => {
    try {
      return JSON.parse(readValue(USER_KEY));
    } catch {
      return null;
    }
  },
  set: (user, remember) => {
    const persistent = remember === undefined ? tokenIsRemembered() : remember;
    writeValue(USER_KEY, JSON.stringify(user), persistent);
  },
  clear: () => removeValue(USER_KEY),
};

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
});

// Connection state is announced once per outage: failed requests raise the
// offline toast, and the next successful request clears it again.
let connectionDown = false;

function announceOffline() {
  if (connectionDown) return;
  connectionDown = true;
  window.dispatchEvent(new Event('swiftbus:offline'));
}

function announceOnline() {
  if (!connectionDown) return;
  connectionDown = false;
  window.dispatchEvent(new Event('swiftbus:online'));
}

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
    announceOnline();

    if (response.config.method && response.config.method !== 'get') {
      invalidateCache();
    }
    return response;
  },
  (error) => {
    const hadSession = Boolean(tokenStore.get());
    const status = error.response?.status;

    // No response and not a timeout means the request never left the device
    // (or nothing answered on the network), which is an offline condition.
    if (!error.response && error.code !== 'ECONNABORTED') {
      announceOffline();
    }

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

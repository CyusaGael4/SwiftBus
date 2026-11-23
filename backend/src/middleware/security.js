// Input hardening and throttling for the JSON API.
//
// Two separate problems are handled here:
// 1. MongoDB operator injection. A client can send {"email": {"$ne": null}} or
//    a query string such as ?role[$ne]=driver; stripping keys that start with
//    "$" or contain "." before a controller sees them keeps those objects from
//    turning into query operators.
// 2. Password guessing. Credential endpoints are throttled per address (and per
//    email on sign in) so repeated attempts stop being practical.

const MAX_DEPTH = 6;

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

function scrub(value, depth = 0) {
  if (depth > MAX_DEPTH || value === null || typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    // Drops now-empty objects from arrays so a crafted array cannot leave an
    // empty operator object behind for a query to match against.
    for (let index = value.length - 1; index >= 0; index -= 1) {
      scrub(value[index], depth + 1);
      if (isPlainObject(value[index]) && !Object.keys(value[index]).length) {
        value.splice(index, 1);
      }
    }
    return;
  }

  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete value[key];
      continue;
    }

    scrub(value[key], depth + 1);

    if (isPlainObject(value[key]) && !Object.keys(value[key]).length) {
      delete value[key];
    }
  }
}

// Every query parameter this API reads is a plain string, so arrays and objects
// (from ?role[$ne]=x or ?search[]=x) are dropped rather than handed to a
// controller that expects text.
function sanitizeQuery(query) {
  scrub(query);

  for (const key of Object.keys(query)) {
    if (typeof query[key] !== 'string') {
      delete query[key];
    }
  }
}

const sanitizeInput = (req, _res, next) => {
  scrub(req.body);
  sanitizeQuery(req.query);
  scrub(req.params);
  return next();
};

function rateLimit({ windowMs, max, key = (req) => req.ip, message }) {
  const hits = new Map();

  // Expired entries are dropped on a timer so the map cannot grow without
  // bound; unref keeps the timer from holding the process open.
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [id, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(id);
    }
  }, windowMs);
  if (typeof timer.unref === 'function') timer.unref();

  return (req, res, next) => {
    const id = key(req);
    const now = Date.now();
    const entry = hits.get(id);

    if (!entry || entry.resetAt <= now) {
      hits.set(id, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({
        message: message || 'Too many requests. Try again in a few minutes.',
      });
    }

    return next();
  };
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  key: (req) =>
    `${req.ip}:${String(req.body?.email || '').toLowerCase().trim()}`,
  message: 'Too many sign in attempts. Wait a few minutes and try again.',
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  key: (req) => req.ip,
  message: 'Too many account requests from this address. Try again later.',
});

module.exports = { sanitizeInput, rateLimit, loginLimiter, registerLimiter };

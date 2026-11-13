const DRAFT_KEY = 'swiftbus.passengerDraft';

export function createHoldToken() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `hold-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function readDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(draft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage can be unavailable in private mode; checkout still works in-memory.
  }
}

export function clearDraft() {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Ignore storage failures.
  }
}

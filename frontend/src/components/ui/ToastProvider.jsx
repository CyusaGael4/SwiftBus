import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const ToastContext = createContext(null);

const TONES = {
  info: { chip: 'bg-navy', icon: 'info' },
  success: { chip: 'bg-success', icon: 'check' },
  warning: { chip: 'bg-accent', icon: 'warning' },
};

function ToastIcon({ tone }) {
  if (tone === 'success') {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="m5 12.5 4.5 4.5L19 7"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (tone === 'warning') {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 6.5v7"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <circle cx="12" cy="17.6" r="1.15" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 10.5v6"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <circle cx="12" cy="7" r="1.15" fill="currentColor" />
    </svg>
  );
}

let nextToastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ id, title, description = '', tone = 'info', duration = 5000 }) => {
      const toastId = id || `toast-${(nextToastId += 1)}`;
      const nextToast = { id: toastId, title, description, tone };

      // Re-showing an existing id (for example while the connection is still
      // down) updates the message instead of stacking duplicates.
      setToasts((current) => {
        const exists = current.some((toast) => toast.id === toastId);
        if (!exists) return [...current, nextToast];
        return current.map((toast) => (toast.id === toastId ? nextToast : toast));
      });

      const previousTimer = timers.current.get(toastId);
      if (previousTimer) clearTimeout(previousTimer);
      timers.current.delete(toastId);

      // A duration of 0 keeps the toast until it is dismissed or replaced.
      if (duration > 0) {
        timers.current.set(
          toastId,
          setTimeout(() => dismiss(toastId), duration)
        );
      }

      return toastId;
    },
    [dismiss]
  );

  useEffect(
    () => () => {
      for (const timer of timers.current.values()) clearTimeout(timer);
      timers.current.clear();
    },
    []
  );

  const value = useMemo(() => ({ showToast, dismiss }), [showToast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:top-4 sm:items-end sm:px-0"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const tone = TONES[toast.tone] || TONES.info;

          return (
            <div
              key={toast.id}
              role={toast.tone === 'warning' ? 'alert' : 'status'}
              className="pointer-events-auto flex w-full max-w-[420px] animate-fade-in items-start gap-3 rounded-[6px] border border-border bg-surface px-4 py-3 shadow-modal"
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${tone.chip}`}
              >
                <ToastIcon tone={tone.icon} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold leading-snug text-navy">
                  {toast.title}
                </p>
                {toast.description ? (
                  <p className="mt-0.5 text-[12.5px] leading-snug text-muted">
                    {toast.description}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="-mr-1 -mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted transition hover:bg-cream hover:text-navy"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider.');
  }

  return context;
}

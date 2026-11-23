import { useEffect, useRef } from 'react';
import { useToast } from './ToastProvider.jsx';

const OFFLINE_TOAST_ID = 'swiftbus-offline';

// Tells the person when the device loses its connection and when it is back.
// Two sources feed this: the browser's own offline/online events, and failed
// requests from the API client (a network can be reachable at the interface
// level while the internet behind it is not).
export default function OfflineToasts() {
  const { showToast, dismiss } = useToast();
  const offlineVisible = useRef(false);

  useEffect(() => {
    const showOffline = () => {
      offlineVisible.current = true;
      showToast({
        id: OFFLINE_TOAST_ID,
        tone: 'warning',
        title: 'You are offline',
        description:
          'No internet connection. Check your network and this page will reconnect automatically.',
        duration: 0,
      });
    };

    const showOnline = () => {
      if (!offlineVisible.current) return;

      offlineVisible.current = false;
      dismiss(OFFLINE_TOAST_ID);
      showToast({
        tone: 'success',
        title: 'Back online',
        description: 'Your internet connection is working again.',
        duration: 4000,
      });
    };

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      showOffline();
    }

    window.addEventListener('offline', showOffline);
    window.addEventListener('online', showOnline);
    window.addEventListener('swiftbus:offline', showOffline);
    window.addEventListener('swiftbus:online', showOnline);

    return () => {
      window.removeEventListener('offline', showOffline);
      window.removeEventListener('online', showOnline);
      window.removeEventListener('swiftbus:offline', showOffline);
      window.removeEventListener('swiftbus:online', showOnline);
    };
  }, [showToast, dismiss]);

  return null;
}

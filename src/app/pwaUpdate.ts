import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Small wrapper around the PWA virtual module. Tests mock this module so the
 * virtual module does not need a service worker environment.
 */
export function usePwaUpdate() {
  return useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) {
        return;
      }

      let lastCheck = 0;
      const checkForUpdate = () => {
        if (Date.now() - lastCheck < 60_000) {
          return;
        }

        lastCheck = Date.now();
        void registration.update().catch(() => undefined);
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          checkForUpdate();
        }
      });
      window.addEventListener('focus', checkForUpdate);
      window.addEventListener('online', checkForUpdate);
    },
  });
}

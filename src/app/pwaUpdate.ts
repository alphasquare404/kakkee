import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Small wrapper around the PWA virtual module. Tests mock this module so the
 * virtual module does not need a service worker environment.
 */
export function usePwaUpdate() {
  return useRegisterSW();
}

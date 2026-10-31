import { useSyncExternalStore } from 'react';
import {
  getTrackingPreferences,
  subscribeTrackingPreferences,
} from '../core/preferences/trackingPreferences';

export function useTrackingPreferences() {
  return useSyncExternalStore(
    subscribeTrackingPreferences,
    getTrackingPreferences,
  );
}

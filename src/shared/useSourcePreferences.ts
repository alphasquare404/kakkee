import { useSyncExternalStore } from 'react';
import {
  getSourcePreferences,
  subscribeSourcePreferences,
} from '../core/preferences/sourcePreferences';

export function useSourcePreferences() {
  return useSyncExternalStore(
    subscribeSourcePreferences,
    getSourcePreferences,
  );
}

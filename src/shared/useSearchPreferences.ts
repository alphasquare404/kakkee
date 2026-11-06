import { useSyncExternalStore } from 'react';
import {
  getSearchPreferences,
  subscribeSearchPreferences,
} from '../core/preferences/searchPreferences';

export function useSearchPreferences() {
  return useSyncExternalStore(
    subscribeSearchPreferences,
    getSearchPreferences,
  );
}

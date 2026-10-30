import { useSyncExternalStore } from 'react';
import {
  getHistoryPreferences,
  subscribeHistoryPreferences,
} from '../core/preferences/historyPreferences';

export function useHistoryPreferences() {
  return useSyncExternalStore(
    subscribeHistoryPreferences,
    getHistoryPreferences,
  );
}

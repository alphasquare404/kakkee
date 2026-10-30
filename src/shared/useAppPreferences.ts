import { useSyncExternalStore } from 'react';
import {
  getAppPreferences,
  subscribeAppPreferences,
} from '../core/preferences/appPreferences';

export function useAppPreferences() {
  return useSyncExternalStore(subscribeAppPreferences, getAppPreferences);
}

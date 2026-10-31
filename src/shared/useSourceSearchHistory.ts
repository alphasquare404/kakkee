import { useSyncExternalStore } from 'react';
import {
  getSourceSearchHistory,
  subscribeSourceSearchHistory,
} from '../core/preferences/sourceSearchHistory';

export function useSourceSearchHistory(sourceId: string) {
  return useSyncExternalStore(
    subscribeSourceSearchHistory,
    () => getSourceSearchHistory(sourceId),
  );
}

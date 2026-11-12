import { useSyncExternalStore } from 'react';
import {
  getHiddenHistoryMangaIds,
  subscribeHiddenHistory,
} from '../core/preferences/hiddenHistory';

export function useHiddenHistory() {
  return useSyncExternalStore(
    subscribeHiddenHistory,
    getHiddenHistoryMangaIds,
  );
}

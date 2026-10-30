import { useSyncExternalStore } from 'react';
import {
  getSearchHistory,
  subscribeSearchHistory,
} from '../core/preferences/searchHistory';

export function useSearchHistory() {
  return useSyncExternalStore(subscribeSearchHistory, getSearchHistory);
}

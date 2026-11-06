import { useMemo, useSyncExternalStore } from 'react';
import {
  getLibraryPreferences,
  subscribeLibraryPreferences,
} from '../core/preferences/libraryPreferences';

/**
 * Category IDs hidden from Library browsing. The same preference filters
 * Library, Reading, Continue Reading and History.
 */
export function useHiddenCategoryIds(): ReadonlySet<number> {
  const preferences = useSyncExternalStore(
    subscribeLibraryPreferences,
    getLibraryPreferences,
    getLibraryPreferences,
  );

  return useMemo(
    () => new Set(preferences.hiddenCategoryIds),
    [preferences.hiddenCategoryIds],
  );
}

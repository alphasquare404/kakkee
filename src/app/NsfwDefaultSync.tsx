import { useEffect, useMemo } from 'react';
import { useConnection } from './useConnection';
import { createNsfwDefaultRepository } from '../core/preferences/nsfwDefault';
import { updateNsfwPreferences } from '../core/preferences/nsfwPreferences';
import {
  getLibraryPreferences,
  updateLibraryPreferences,
} from '../core/preferences/libraryPreferences';
import { replaceHiddenHistoryMangaIds } from '../core/preferences/hiddenHistory';

/**
 * Applies server-wide visibility defaults on every connection. A new
 * browser/device therefore starts from the server's saved NSFW mode and
 * hidden-category list.
 */
export function NsfwDefaultSync() {
  const { state } = useConnection();
  const context = state.status === 'connected' ? state.context : null;
  const repository = useMemo(
    () =>
      context
        ? createNsfwDefaultRepository({ getClient: () => context.graphQL })
        : null,
    [context],
  );

  useEffect(() => {
    if (!repository) {
      return;
    }

    let active = true;

    const sync = async () => {
      try {
        const defaults = await repository.getVisibilityDefaults();

        if (!active) {
          return;
        }

        if (defaults.hideNsfw !== null) {
          updateNsfwPreferences({ hideNsfw: defaults.hideNsfw });
        }

        if (defaults.hiddenCategoryIds !== null) {
          updateLibraryPreferences({
            ...getLibraryPreferences(),
            hiddenCategoryIds: [...defaults.hiddenCategoryIds],
          });
        }

        if (defaults.hiddenHistoryMangaIds !== null) {
          replaceHiddenHistoryMangaIds(defaults.hiddenHistoryMangaIds);
        }
      } catch {
        // Keep local preferences when Global Meta is unavailable.
      }
    };

    void sync();
    const onFocus = () => void sync();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void sync();
      }
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    const interval = window.setInterval(() => void sync(), 60_000);

    return () => {
      active = false;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearInterval(interval);
    };
  }, [repository]);

  return null;
}

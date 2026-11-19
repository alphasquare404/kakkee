import { useEffect, useMemo } from 'react';
import { useConnection } from './useConnection';
import { createNsfwDefaultRepository } from '../core/preferences/nsfwDefault';
import { updateNsfwPreferences } from '../core/preferences/nsfwPreferences';

/**
 * Applies the server-wide Default NSFW mode on every new connection. A new
 * browser/device therefore starts from the account's saved default instead of
 * an unset local preference.
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

    void repository
      .getDefault()
      .then((hideNsfw) => {
        if (active && hideNsfw !== null) {
          updateNsfwPreferences({ hideNsfw });
        }
      })
      .catch(() => {
        // Keep the local preference when Global Meta is unavailable.
      });

    return () => {
      active = false;
    };
  }, [repository]);

  return null;
}

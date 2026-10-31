import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { ApolloClient } from '@apollo/client';
import {
  createNavigationController,
  type NavigationController,
} from '../core/navigation/navigationController';
import { createNavigationRepository } from '../core/navigation/navigationRepository';
import type { NavigationBadges } from '../core/navigation/navigationRepository';

const EMPTY: NavigationBadges = { downloads: 0, extensionUpdates: 0 };

function emptySubscribe(): () => void {
  return () => undefined;
}

function getEmpty(): NavigationBadges {
  return EMPTY;
}

export function useNavigationBadges(
  graphQL: ApolloClient | null,
  pathname: string,
): NavigationBadges {
  const controller = useMemo<NavigationController | null>(
    () =>
      graphQL
        ? createNavigationController(
            createNavigationRepository({ getClient: () => graphQL }),
          )
        : null,
    [graphQL],
  );

  useEffect(() => {
    void controller?.load();
  }, [controller, pathname]);

  return useSyncExternalStore(
    controller?.subscribe ?? emptySubscribe,
    controller?.getState ?? getEmpty,
    getEmpty,
  );
}

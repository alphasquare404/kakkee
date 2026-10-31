import { useEffect, useMemo, useSyncExternalStore } from 'react';
import type { ApolloClient } from '@apollo/client';
import { DownloadStatusChangedDocument } from '../core/graphql/generated/graphql';
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

  useEffect(() => {
    if (!graphQL || typeof graphQL.subscribe !== 'function') {
      return;
    }

    const observable = graphQL.subscribe({
      query: DownloadStatusChangedDocument,
    });
    const subscription = observable.subscribe({
      next: () => {
        void controller?.load();
      },
      error: () => undefined,
    });
    const interval = window.setInterval(() => {
      void controller?.load();
    }, 60_000);

    return () => {
      subscription.unsubscribe();
      window.clearInterval(interval);
    };
  }, [controller, graphQL]);

  return useSyncExternalStore(
    controller?.subscribe ?? emptySubscribe,
    controller?.getState ?? getEmpty,
    getEmpty,
  );
}

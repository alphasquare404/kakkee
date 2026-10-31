import type { ApolloClient } from '@apollo/client';
import {
  NavigationBadgesDocument,
  type NavigationBadgesQuery,
} from '../graphql/generated/graphql';

export interface NavigationBadges {
  readonly downloads: number;
  readonly extensionUpdates: number;
}

export function createNavigationRepository(options: {
  readonly getClient: () => ApolloClient;
}) {
  return {
    async getBadges(): Promise<NavigationBadges> {
      const result = await options.getClient().query({
        query: NavigationBadgesDocument,
        fetchPolicy: 'network-only',
      });

      if (!result.data) {
        throw new Error('Navigation badges are unavailable.');
      }

      const data: NavigationBadgesQuery = result.data;

      return {
        downloads: data.downloadStatus?.queue.length ?? 0,
        extensionUpdates: data.extensions.totalCount,
      };
    },
  };
}

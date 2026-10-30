import type { ApolloClient } from '@apollo/client';
import {
  LogoutTrackerDocument,
  TrackingServicesDocument,
  type TrackingServicesQuery,
} from '../graphql/generated/graphql';

export type Tracker = TrackingServicesQuery['trackers']['nodes'][number];

export interface TrackingRepository {
  getTrackers(): Promise<readonly Tracker[]>;
  logout(trackerId: number): Promise<void>;
}

export function createTrackingRepository(options: {
  readonly getClient: () => ApolloClient;
}): TrackingRepository {
  return {
    async getTrackers() {
      const result = await options.getClient().query({
        query: TrackingServicesDocument,
        fetchPolicy: 'network-only',
      });

      if (!result.data?.trackers) {
        throw new Error('Tracking services are unavailable.');
      }

      return result.data.trackers.nodes;
    },
    async logout(trackerId) {
      const result = await options.getClient().mutate({
        mutation: LogoutTrackerDocument,
        variables: { input: { trackerId } },
      });

      if (!result.data?.logoutTracker) {
        throw new Error('Tracker logout failed.');
      }
    },
  };
}

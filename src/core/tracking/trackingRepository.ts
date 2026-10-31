import type { ApolloClient } from '@apollo/client';
import {
  LoginTrackerCredentialsDocument,
  LogoutTrackerDocument,
  TrackingServicesDocument,
  type TrackingServicesQuery,
} from '../graphql/generated/graphql';

export type Tracker = TrackingServicesQuery['trackers']['nodes'][number];

export interface TrackingRepository {
  getTrackers(): Promise<readonly Tracker[]>;
  loginCredentials(
    trackerId: number,
    username: string,
    password: string,
  ): Promise<boolean>;
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
    async loginCredentials(trackerId, username, password) {
      const result = await options.getClient().mutate({
        mutation: LoginTrackerCredentialsDocument,
        variables: {
          input: { trackerId, username, password },
        },
      });

      if (!result.data?.loginTrackerCredentials) {
        throw new Error('Tracker login failed.');
      }

      return result.data.loginTrackerCredentials.isLoggedIn;
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

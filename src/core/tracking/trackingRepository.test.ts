import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import {
  LogoutTrackerDocument,
  TrackingServicesDocument,
} from '../graphql/generated/graphql';
import { createTrackingRepository } from './trackingRepository';

describe('createTrackingRepository', () => {
  it('loads trackers and logs one out', async () => {
    const query = vi.fn(async () => ({
      data: {
        trackers: {
          __typename: 'TrackerNodeList',
          nodes: [
            {
              __typename: 'TrackerType',
              id: 1,
              name: 'MAL',
              icon: 'mal',
              isLoggedIn: true,
              isTokenExpired: false,
              authUrl: 'https://example.test/auth',
              supportsPrivateTracking: true,
              supportsReadingDates: true,
              supportsTrackDeletion: true,
            },
          ],
        },
      },
    }));
    const mutate = vi.fn(async () => ({
      data: { logoutTracker: { tracker: { id: 1, isLoggedIn: false } } },
    }));
    const client = { query, mutate } as unknown as ApolloClient;
    const repository = createTrackingRepository({ getClient: () => client });

    await expect(repository.getTrackers()).resolves.toHaveLength(1);
    await repository.logout(1);

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({ query: TrackingServicesDocument }),
    );
    expect(mutate).toHaveBeenCalledWith({
      mutation: LogoutTrackerDocument,
      variables: { input: { trackerId: 1 } },
    });
  });
});

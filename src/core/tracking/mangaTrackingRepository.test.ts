import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import {
  BindTrackDocument,
  MangaTrackingDocument,
  SearchTrackerDocument,
  TrackingServicesDocument,
  UnbindTrackDocument,
  UpdateTrackDocument,
} from '../graphql/generated/graphql';
import { createMangaTrackingRepository } from './mangaTrackingRepository';

const record = {
  __typename: 'TrackRecordType' as const,
  id: 9,
  trackerId: 1,
  title: 'One Piece',
  status: 1,
  score: 0,
  displayScore: '',
  private: false,
  remoteUrl: 'https://example.test/manga/1',
  tracker: {
    __typename: 'TrackerType' as const,
    id: 1,
    name: 'MAL',
    scores: ['0', '5', '10'],
    statuses: [{ __typename: 'TrackStatusType' as const, name: 'Reading', value: 1 }],
  },
};

describe('createMangaTrackingRepository', () => {
  it('loads records, updates, and unbinds', async () => {
    const query = vi.fn(async () => ({
      data: {
        manga: {
          __typename: 'MangaType',
          id: 1,
          trackRecords: {
            __typename: 'TrackRecordNodeList',
            nodes: [record],
          },
        },
      },
    }));
    const mutate = vi.fn(async ({ mutation }: { mutation: unknown }) => {
      if (mutation === UpdateTrackDocument) {
        return {
          data: {
            updateTrack: {
              trackRecord: {
                __typename: 'TrackRecordType',
                id: 9,
                status: 2,
                score: 8,
                displayScore: '8',
                trackerId: 1,
              },
            },
          },
        };
      }
      if (mutation === UnbindTrackDocument) {
        return { data: { unbindTrack: { trackRecord: { id: 9 } } } };
      }
      throw new Error('unexpected mutation');
    });
    const client = { query, mutate } as unknown as ApolloClient;
    const repository = createMangaTrackingRepository({ getClient: () => client });

    await expect(repository.getRecords(1)).resolves.toHaveLength(1);
    await expect(repository.update({ status: 2 }, 9)).resolves.toMatchObject({
      status: 2,
      displayScore: '8',
    });
    await repository.unbind(9);

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        query: MangaTrackingDocument,
        variables: { mangaId: 1 },
      }),
    );
    expect(mutate).toHaveBeenNthCalledWith(1, {
      mutation: UpdateTrackDocument,
      variables: { input: { recordId: 9, status: 2 } },
    });
    expect(mutate).toHaveBeenNthCalledWith(2, {
      mutation: UnbindTrackDocument,
      variables: { input: { recordId: 9 } },
    });
  });

  it('loads trackers, searches, and binds a record', async () => {
    const query = vi.fn(async ({ query: document }: { query: unknown }) => {
      if (document === TrackingServicesDocument) {
        return {
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
                  authUrl: null,
                  supportsPrivateTracking: true,
                  supportsReadingDates: true,
                  supportsTrackDeletion: true,
                },
              ],
            },
          },
        };
      }

      if (document === SearchTrackerDocument) {
        return {
          data: {
            searchTracker: {
              trackSearches: [
                {
                  __typename: 'TrackSearchType',
                  id: 3,
                  remoteId: 'remote-1',
                  trackerId: 1,
                  title: 'One Piece',
                  coverUrl: '',
                  summary: '',
                  totalChapters: 100,
                  publishingStatus: 'Publishing',
                  publishingType: 'Manga',
                  score: 0,
                  displayScore: '',
                  status: 1,
                },
              ],
            },
          },
        };
      }

      throw new Error('unexpected query');
    });
    const mutate = vi.fn(async () => ({
      data: { bindTrack: { trackRecord: record } },
    }));
    const client = { query, mutate } as unknown as ApolloClient;
    const repository = createMangaTrackingRepository({ getClient: () => client });

    await expect(repository.getTrackers()).resolves.toHaveLength(1);
    await expect(repository.search(1, 'One Piece')).resolves.toHaveLength(1);
    await expect(
      repository.bind({ mangaId: 1, trackerId: 1, remoteId: 'remote-1' }),
    ).resolves.toMatchObject({ id: 9 });

    expect(mutate).toHaveBeenCalledWith({
      mutation: BindTrackDocument,
      variables: {
        input: { mangaId: 1, trackerId: 1, remoteId: 'remote-1' },
      },
    });
  });
});

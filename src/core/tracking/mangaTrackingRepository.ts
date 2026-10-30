import type { ApolloClient } from '@apollo/client';
import {
  BindTrackDocument,
  MangaTrackingDocument,
  SearchTrackerDocument,
  TrackProgressDocument,
  TrackingServicesDocument,
  UnbindTrackDocument,
  UpdateTrackDocument,
  type BindTrackMutation,
  type MangaTrackingQuery,
  type SearchTrackerQuery,
  type TrackingServicesQuery,
  type UpdateTrackInput,
} from '../graphql/generated/graphql';

export type TrackRecord =
  MangaTrackingQuery['manga']['trackRecords']['nodes'][number];
export type Tracker =
  TrackingServicesQuery['trackers']['nodes'][number];
export type TrackSearch = SearchTrackerQuery['searchTracker']['trackSearches'][number];

export interface MangaTrackingRepository {
  getRecords(mangaId: number): Promise<readonly TrackRecord[]>;
  getTrackers(): Promise<readonly Tracker[]>;
  search(
    trackerId: number,
    query: string,
  ): Promise<readonly TrackSearch[]>;
  bind(input: {
    readonly mangaId: number;
    readonly trackerId: number;
    readonly remoteId: string;
    readonly private?: boolean;
  }): Promise<NonNullable<BindTrackMutation['bindTrack']>['trackRecord']>;
  unbind(recordId: number): Promise<void>;
  syncProgress(mangaId: number): Promise<readonly TrackRecord[]>;
  update(
    patch: Omit<UpdateTrackInput, 'recordId'>,
    recordId: number,
  ): Promise<{
    readonly id: number;
    readonly status: number;
    readonly score: number;
    readonly displayScore: string;
  }>;
}

export function createMangaTrackingRepository(options: {
  readonly getClient: () => ApolloClient;
}): MangaTrackingRepository {
  return {
    async getRecords(mangaId) {
      const result = await options.getClient().query({
        query: MangaTrackingDocument,
        variables: { mangaId },
        fetchPolicy: 'network-only',
      });

      if (!result.data?.manga) {
        throw new Error('Track records are unavailable.');
      }

      return result.data.manga.trackRecords.nodes;
    },
    async getTrackers() {
      const result = await options.getClient().query({
        query: TrackingServicesDocument,
        fetchPolicy: 'network-only',
      });

      if (!result.data?.trackers) {
        throw new Error('Trackers are unavailable.');
      }

      return result.data.trackers.nodes;
    },
    async search(trackerId, query) {
      const result = await options.getClient().query({
        query: SearchTrackerDocument,
        variables: { input: { trackerId, query } },
        fetchPolicy: 'network-only',
      });

      if (!result.data?.searchTracker) {
        throw new Error('Tracker search failed.');
      }

      return result.data.searchTracker.trackSearches;
    },
    async bind(input) {
      const result = await options.getClient().mutate({
        mutation: BindTrackDocument,
        variables: { input },
      });

      if (!result.data?.bindTrack) {
        throw new Error('Track record could not be bound.');
      }

      return result.data.bindTrack.trackRecord;
    },
    async unbind(recordId) {
      const result = await options.getClient().mutate({
        mutation: UnbindTrackDocument,
        variables: { input: { recordId } },
      });

      if (!result.data?.unbindTrack) {
        throw new Error('Track record could not be unlinked.');
      }
    },
    async syncProgress(mangaId) {
      const result = await options.getClient().mutate({
        mutation: TrackProgressDocument,
        variables: { input: { mangaId } },
      });

      if (!result.data?.trackProgress) {
        throw new Error('Progress could not be synced.');
      }

      return result.data.trackProgress.trackRecords;
    },
    async update(patch, recordId) {
      const result = await options.getClient().mutate({
        mutation: UpdateTrackDocument,
        variables: { input: { recordId, ...patch } },
      });

      if (!result.data?.updateTrack?.trackRecord) {
        throw new Error('Track record could not be updated.');
      }

      return result.data.updateTrack.trackRecord;
    },
  };
}

import type { ApolloClient } from '@apollo/client';
import {
  MangaTrackingDocument,
  UnbindTrackDocument,
  UpdateTrackDocument,
  type MangaTrackingQuery,
  type UpdateTrackInput,
} from '../graphql/generated/graphql';

export type TrackRecord =
  MangaTrackingQuery['manga']['trackRecords']['nodes'][number];

export interface MangaTrackingRepository {
  getRecords(mangaId: number): Promise<readonly TrackRecord[]>;
  unbind(recordId: number): Promise<void>;
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
    async unbind(recordId) {
      const result = await options.getClient().mutate({
        mutation: UnbindTrackDocument,
        variables: { input: { recordId } },
      });

      if (!result.data?.unbindTrack) {
        throw new Error('Track record could not be unlinked.');
      }
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

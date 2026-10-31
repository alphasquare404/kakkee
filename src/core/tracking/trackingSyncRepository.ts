import type { ApolloClient } from '@apollo/client';
import { TrackProgressDocument } from '../graphql/generated/graphql';

export function createTrackingSyncRepository(options: {
  readonly getClient: () => ApolloClient;
}) {
  return {
    async sync(mangaId: number): Promise<void> {
      const result = await options.getClient().mutate({
        mutation: TrackProgressDocument,
        variables: { input: { mangaId } },
      });

      if (!result.data?.trackProgress) {
        throw new Error('Tracker progress could not be synced.');
      }
    },
  };
}

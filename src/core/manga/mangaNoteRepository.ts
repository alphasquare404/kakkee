import type { ApolloClient } from '@apollo/client';
import {
  DeleteMangaNoteDocument,
  MangaNotesDocument,
  SetMangaNoteDocument,
} from '../graphql/generated/graphql';

const NOTE_KEY = 'notes';

export interface MangaNoteRepository {
  getNote(mangaId: number): Promise<string>;
  save(mangaId: number, value: string): Promise<string>;
  remove(mangaId: number): Promise<void>;
}

export function createMangaNoteRepository(options: {
  readonly getClient: () => ApolloClient;
}): MangaNoteRepository {
  return {
    async getNote(mangaId) {
      const result = await options.getClient().query({
        query: MangaNotesDocument,
        variables: { mangaId },
        fetchPolicy: 'network-only',
      });

      return (
        result.data?.manga?.meta.find((meta) => meta.key === NOTE_KEY)?.value ?? ''
      );
    },
    async save(mangaId, value) {
      const result = await options.getClient().mutate({
        mutation: SetMangaNoteDocument,
        variables: { input: { meta: { mangaId, key: NOTE_KEY, value } } },
      });

      if (!result.data?.setMangaMeta) {
        throw new Error('Note could not be saved.');
      }

      return result.data.setMangaMeta.meta.value;
    },
    async remove(mangaId) {
      const result = await options.getClient().mutate({
        mutation: DeleteMangaNoteDocument,
        variables: { input: { mangaId, key: NOTE_KEY } },
      });

      if (!result.data?.deleteMangaMeta) {
        throw new Error('Note could not be deleted.');
      }
    },
  };
}

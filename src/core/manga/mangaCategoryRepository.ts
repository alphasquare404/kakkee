import type { ApolloClient } from '@apollo/client';
import {
  MangaCategoryPickerDocument,
  SetMangaCategoriesDocument,
  type MangaCategoryPickerQuery,
} from '../graphql/generated/graphql';

export type MangaCategory = MangaCategoryPickerQuery['categories']['nodes'][number];

export interface MangaCategoryState {
  readonly all: readonly MangaCategory[];
  readonly selected: readonly MangaCategory[];
}

export function createMangaCategoryRepository(options: {
  readonly getClient: () => ApolloClient;
}) {
  return {
    async get(mangaId: number): Promise<MangaCategoryState> {
      const result = await options.getClient().query({
        query: MangaCategoryPickerDocument,
        variables: { mangaId },
        fetchPolicy: 'network-only',
      });

      if (!result.data?.manga) {
        throw new Error('Manga categories are unavailable.');
      }

      return {
        all: result.data.categories.nodes,
        selected: result.data.manga.categories.nodes,
      };
    },
    async save(mangaId: number, categoryIds: readonly number[]): Promise<void> {
      const result = await options.getClient().mutate({
        mutation: SetMangaCategoriesDocument,
        variables: {
          input: {
            id: mangaId,
            patch: {
              clearCategories: true,
              addToCategories: [...categoryIds],
            },
          },
        },
      });

      if (!result.data?.updateMangaCategories) {
        throw new Error('Manga categories could not be saved.');
      }
    },
  };
}

import type { ApolloClient } from '@apollo/client';
import {
  FetchSourceMangaDocument,
  SourceInfoDocument,
  UpdateMangasLibraryDocument,
  type FetchSourceMangaMutation,
  type FetchSourceMangaType,
  type FilterChangeInput,
  type SourceInfoQuery,
} from '../graphql/generated/graphql';

export type SourceInfo = SourceInfoQuery['source'];
export type SourceManga =
  NonNullable<FetchSourceMangaMutation['fetchSourceManga']>['mangas'][number];

export interface SourceRepository {
  getInfo(sourceId: string): Promise<SourceInfo>;
  fetchManga(input: {
    readonly sourceId: string;
    readonly type: FetchSourceMangaType;
    readonly query?: string;
    readonly filters?: readonly FilterChangeInput[];
    readonly page: number;
  }): Promise<{
    readonly mangas: readonly SourceManga[];
    readonly hasNextPage: boolean;
  }>;
  setLibrary(ids: readonly number[], inLibrary: boolean): Promise<void>;
}

export function createSourceRepository(options: {
  readonly getClient: () => ApolloClient;
}): SourceRepository {
  return {
    async getInfo(sourceId) {
      const result = await options.getClient().query({
        query: SourceInfoDocument,
        variables: { id: sourceId },
        fetchPolicy: 'network-only',
      });

      if (!result.data?.source) {
        throw new Error('Source tidak ditemukan.');
      }

      return result.data.source;
    },
    async fetchManga({ sourceId, type, query, filters, page }) {
      const result = await options.getClient().mutate({
        mutation: FetchSourceMangaDocument,
        variables: {
          input: {
            source: sourceId,
            type,
            page,
            ...(query ? { query } : {}),
            ...(filters && filters.length > 0 ? { filters: [...filters] } : {}),
          },
        },
      });

      if (!result.data?.fetchSourceManga) {
        throw new Error('Katalog source tidak dapat dimuat.');
      }

      return {
        mangas: result.data.fetchSourceManga.mangas,
        hasNextPage: result.data.fetchSourceManga.hasNextPage,
      };
    },
    async setLibrary(ids, inLibrary) {
      const result = await options.getClient().mutate({
        mutation: UpdateMangasLibraryDocument,
        variables: { input: { ids: [...ids], patch: { inLibrary } } },
      });

      if (!result.data?.updateMangas) {
        throw new Error('Library manga tidak dapat disimpan.');
      }
    },
  };
}

import type { ApolloClient } from '@apollo/client';
import {
  FetchChapterPagesDocument,
  ReaderChapterDocument,
  ReaderNeighborsDocument,
  type ReaderChapterQuery,
  type ReaderNeighborsQuery,
} from '../graphql/generated/graphql';

export type ReaderChapter = ReaderChapterQuery['chapter'];
export type ReaderNeighbors = ReaderNeighborsQuery;

export interface ReaderRepository {
  getChapter(chapterId: number): Promise<ReaderChapter>;
  getNeighbors(mangaId: number, chapterNumber: number): Promise<ReaderNeighbors>;
  getPages(chapterId: number): Promise<readonly string[]>;
}

export interface ReaderRepositoryOptions {
  readonly getClient: () => ApolloClient;
}

export function createReaderRepository(
  options: ReaderRepositoryOptions,
): ReaderRepository {
  return {
    async getChapter(chapterId) {
      const result = await options.getClient().query({
        query: ReaderChapterDocument,
        variables: { chapterId },
        fetchPolicy: 'network-only',
      });

      if (!result.data?.chapter) {
        throw new Error('Chapter tidak ditemukan.');
      }

      return result.data.chapter;
    },
    async getNeighbors(mangaId, chapterNumber) {
      const result = await options.getClient().query({
        query: ReaderNeighborsDocument,
        variables: { mangaId, chapterNumber },
        fetchPolicy: 'network-only',
      });

      if (!result.data) {
        throw new Error('Navigasi chapter tidak tersedia.');
      }

      return result.data;
    },
    async getPages(chapterId) {
      const result = await options.getClient().mutate({
        mutation: FetchChapterPagesDocument,
        variables: { input: { chapterId } },
        fetchPolicy: 'network-only',
      });

      if (!result.data?.fetchChapterPages) {
        throw new Error('Halaman chapter tidak tersedia.');
      }

      return result.data.fetchChapterPages.pages;
    },
  };
}

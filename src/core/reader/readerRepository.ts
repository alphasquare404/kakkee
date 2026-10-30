import type { ApolloClient } from '@apollo/client';
import {
  FetchChapterPagesDocument,
  ReaderChapterDocument,
  ReaderChapterListDocument,
  ReaderNeighborsDocument,
  UpdateChapterProgressDocument,
  type ReaderChapterListQuery,
  type ReaderChapterQuery,
  type ReaderNeighborsQuery,
} from '../graphql/generated/graphql';

export type ReaderChapter = ReaderChapterQuery['chapter'];
export type ReaderNeighbors = ReaderNeighborsQuery;
export type ReaderChapterListItem =
  ReaderChapterListQuery['chapters']['nodes'][number];

export interface ReaderRepository {
  getChapter(chapterId: number): Promise<ReaderChapter>;
  getNeighbors(mangaId: number, chapterNumber: number): Promise<ReaderNeighbors>;
  getChapterList(mangaId: number): Promise<readonly ReaderChapterListItem[]>;
  getPages(chapterId: number): Promise<readonly string[]>;
  updateProgress(
    chapterId: number,
    lastPageRead: number,
    isRead?: boolean,
  ): Promise<void>;
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
    async getChapterList(mangaId) {
      const result = await options.getClient().query({
        query: ReaderChapterListDocument,
        variables: { mangaId },
        fetchPolicy: 'network-only',
      });

      if (!result.data?.chapters) {
        throw new Error('Daftar chapter tidak tersedia.');
      }

      return result.data.chapters.nodes;
    },
    async getPages(chapterId) {      const result = await options.getClient().mutate({
        mutation: FetchChapterPagesDocument,
        variables: { input: { chapterId } },
        fetchPolicy: 'network-only',
      });

      if (!result.data?.fetchChapterPages) {
        throw new Error('Halaman chapter tidak tersedia.');
      }

      return result.data.fetchChapterPages.pages;
    },
    async updateProgress(chapterId, lastPageRead, isRead) {
      const result = await options.getClient().mutate({
        mutation: UpdateChapterProgressDocument,
        variables: {
          input: {
            id: chapterId,
            patch: {
              lastPageRead,
              ...(isRead === undefined ? {} : { isRead }),
            },
          },
        },
      });

      if (!result.data?.updateChapter) {
        throw new Error('Progress chapter tidak dapat disimpan.');
      }
    },
  };
}

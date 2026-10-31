import type { ApolloClient } from '@apollo/client';
import {
  DeleteDownloadedChapterDocument,
  EnqueueDownloadDocument,
  FetchChapterPagesDocument,
  ReaderChapterDocument,
  ReaderChapterListDocument,
  ReaderNeighborsDocument,
  UpdateChapterProgressDocument,
  UpdateMangaLibraryDocument,
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
  enqueueDownload(chapterId: number): Promise<void>;
  deleteDownload(chapterId: number): Promise<void>;
  setBookmark(chapterId: number, isBookmarked: boolean): Promise<void>;
  setInLibrary(mangaId: number, inLibrary: boolean): Promise<void>;
}

export interface ReaderRepositoryOptions {
  readonly getClient: () => ApolloClient;
}

export function createReaderRepository(
  options: ReaderRepositoryOptions,
): ReaderRepository {
  const pageCache = new Map<number, readonly string[]>();

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
    async getPages(chapterId) {
      const cached = pageCache.get(chapterId);

      if (cached) {
        return cached;
      }

      const result = await options.getClient().mutate({
        mutation: FetchChapterPagesDocument,
        variables: { input: { chapterId } },
        fetchPolicy: 'network-only',
      });

      if (!result.data?.fetchChapterPages) {
        throw new Error('Halaman chapter tidak tersedia.');
      }

      const pages = result.data.fetchChapterPages.pages;
      pageCache.set(chapterId, pages);
      return pages;
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
    async enqueueDownload(chapterId) {
      const result = await options.getClient().mutate({
        mutation: EnqueueDownloadDocument,
        variables: { input: { id: chapterId } },
      });

      if (!result.data?.enqueueChapterDownload) {
        throw new Error('Chapter tidak dapat diunduh.');
      }
    },
    async deleteDownload(chapterId) {
      const result = await options.getClient().mutate({
        mutation: DeleteDownloadedChapterDocument,
        variables: { input: { id: chapterId } },
      });

      if (!result.data?.deleteDownloadedChapter) {
        throw new Error('Download chapter tidak dapat dihapus.');
      }
    },
    async setBookmark(chapterId, isBookmarked) {
      const result = await options.getClient().mutate({
        mutation: UpdateChapterProgressDocument,
        variables: { input: { id: chapterId, patch: { isBookmarked } } },
      });

      if (!result.data?.updateChapter) {
        throw new Error('Bookmark chapter tidak dapat disimpan.');
      }
    },
    async setInLibrary(mangaId, inLibrary) {
      const result = await options.getClient().mutate({
        mutation: UpdateMangaLibraryDocument,
        variables: { input: { id: mangaId, patch: { inLibrary } } },
      });

      if (!result.data?.updateManga) {
        throw new Error('Status library tidak dapat disimpan.');
      }
    },
  };
}

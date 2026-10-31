import type { ApolloClient } from '@apollo/client';
import {
  DeleteDownloadedChapterDocument,
  DeleteDownloadedChaptersDocument,
  EnqueueChapterDownloadsDocument,
  EnqueueDownloadDocument,
  MangaDetailDocument,
  RefreshMangaDocument,
  UpdateChapterProgressDocument,
  UpdateChaptersStateDocument,
  UpdateMangaLibraryDocument,
  type ChapterOrderInput,
  type MangaDetailQuery,
} from '../graphql/generated/graphql';

export const MANGA_CHAPTER_PAGE_SIZE = 50;

export type MangaDetail = MangaDetailQuery['manga'];
export type MangaChapter = MangaDetailQuery['chapters']['nodes'][number];
export type MangaChapterOrder = 'newest' | 'oldest';

export interface MangaDetailPage {
  readonly manga: MangaDetail;
  readonly chapters: readonly MangaChapter[];
  readonly totalCount: number;
  readonly pageInfo: {
    readonly endCursor: string | null;
    readonly hasNextPage: boolean;
  };
}

export interface MangaDetailInput {
  readonly mangaId: number;
  readonly first?: number;
  readonly after?: string | null;
  readonly order?: MangaChapterOrder;
}

export interface MangaRepository {
  getDetail(input: MangaDetailInput): Promise<MangaDetailPage>;
  refresh(mangaId: number): Promise<void>;
  setChapterRead(chapterId: number, isRead: boolean): Promise<void>;
  setChapterBookmark(chapterId: number, isBookmarked: boolean): Promise<void>;
  setChaptersRead(ids: readonly number[], isRead: boolean): Promise<void>;
  setChaptersBookmark(
    ids: readonly number[],
    isBookmarked: boolean,
  ): Promise<void>;
  enqueueDownload(chapterId: number): Promise<void>;
  enqueueDownloads(ids: readonly number[]): Promise<void>;
  deleteDownloads(ids: readonly number[]): Promise<void>;
  deleteDownload(chapterId: number): Promise<void>;
  setInLibrary(mangaId: number, inLibrary: boolean): Promise<void>;
}

export interface MangaRepositoryOptions {
  readonly getClient: () => ApolloClient;
}

export function chapterOrderInput(order: MangaChapterOrder): ChapterOrderInput[] {
  return [
    {
      by: 'SOURCE_ORDER',
      byType: order === 'oldest' ? 'ASC' : 'DESC',
    },
  ];
}

async function updateChaptersPatch(
  options: MangaRepositoryOptions,
  ids: readonly number[],
  patch: { readonly isRead?: boolean; readonly isBookmarked?: boolean },
): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  const result = await options.getClient().mutate({
    mutation: UpdateChaptersStateDocument,
    variables: { input: { ids: [...ids], patch } },
  });

  if (!result.data?.updateChapters) {
    throw new Error('Status chapter tidak dapat disimpan.');
  }
}

export function createMangaRepository(
  options: MangaRepositoryOptions,
): MangaRepository {
  return {
    async getDetail(input) {
      const result = await options.getClient().query({
        query: MangaDetailDocument,
        variables: {
          mangaId: input.mangaId,
          first: input.first ?? MANGA_CHAPTER_PAGE_SIZE,
          after: input.after ?? undefined,
          order: chapterOrderInput(input.order ?? 'newest'),
        },
        fetchPolicy: 'network-only',
      });

      if (!result.data?.manga || !result.data.chapters) {
        throw new Error('Respons manga tidak lengkap.');
      }

      return {
        manga: result.data.manga,
        chapters: result.data.chapters.nodes,
        totalCount: result.data.chapters.totalCount,
        pageInfo: {
          endCursor: result.data.chapters.pageInfo.endCursor,
          hasNextPage: result.data.chapters.pageInfo.hasNextPage,
        },
      };
    },
    async refresh(mangaId) {
      const result = await options.getClient().mutate({
        mutation: RefreshMangaDocument,
        variables: {
          input: { id: mangaId, fetchManga: true, fetchChapters: true },
        },
      });

      if (!result.data?.fetchMangaAndChapters) {
        throw new Error('Manga metadata could not be refreshed.');
      }
    },
    async setChapterRead(chapterId, isRead) {      const result = await options.getClient().mutate({
        mutation: UpdateChapterProgressDocument,
        variables: {
          input: {
            id: chapterId,
            patch: { isRead },
          },
        },
      });

      if (!result.data?.updateChapter) {
        throw new Error('Status chapter tidak dapat disimpan.');
      }
    },
    async setChapterBookmark(chapterId, isBookmarked) {
      const result = await options.getClient().mutate({
        mutation: UpdateChapterProgressDocument,
        variables: {
          input: {
            id: chapterId,
            patch: { isBookmarked },
          },
        },
      });

      if (!result.data?.updateChapter) {
        throw new Error('Bookmark chapter tidak dapat disimpan.');
      }
    },
    async enqueueDownload(chapterId) {
      const result = await options.getClient().mutate({
        mutation: EnqueueDownloadDocument,
        variables: { input: { id: chapterId } },
      });

      if (!result.data?.enqueueChapterDownload) {
        throw new Error('Chapter tidak dapat dimasukkan ke antrean download.');
      }
    },
    async enqueueDownloads(ids) {
      if (ids.length === 0) {
        return;
      }

      const result = await options.getClient().mutate({
        mutation: EnqueueChapterDownloadsDocument,
        variables: { input: { ids: [...ids] } },
      });

      if (!result.data?.enqueueChapterDownloads) {
        throw new Error('Chapter tidak dapat dimasukkan ke antrean download.');
      }
    },
    async deleteDownloads(ids) {
      if (ids.length === 0) {
        return;
      }

      const result = await options.getClient().mutate({
        mutation: DeleteDownloadedChaptersDocument,
        variables: { input: { ids: [...ids] } },
      });

      if (!result.data?.deleteDownloadedChapters) {
        throw new Error('Download chapter tidak dapat dihapus.');
      }
    },
    async setChaptersRead(ids, isRead) {
      await updateChaptersPatch(options, ids, { isRead });
    },
    async setChaptersBookmark(ids, isBookmarked) {
      await updateChaptersPatch(options, ids, { isBookmarked });
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
    async setInLibrary(mangaId, inLibrary) {
      const result = await options.getClient().mutate({
        mutation: UpdateMangaLibraryDocument,
        variables: {
          input: {
            id: mangaId,
            patch: { inLibrary },
          },
        },
      });

      if (!result.data?.updateManga) {
        throw new Error('Status library manga tidak dapat disimpan.');
      }
    },
  };
}

import type { ApolloClient } from '@apollo/client';
import {
  MangaDetailDocument,
  UpdateChapterProgressDocument,
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
  setChapterRead(chapterId: number, isRead: boolean): Promise<void>;
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
    async setChapterRead(chapterId, isRead) {
      const result = await options.getClient().mutate({
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

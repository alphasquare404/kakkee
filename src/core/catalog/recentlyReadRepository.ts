import type { ApolloClient } from '@apollo/client';
import {
  RecentlyReadDocument,
  type RecentlyReadQuery,
  type RecentlyReadQueryVariables,
} from '../graphql/generated/graphql';

type RecentlyReadNode = RecentlyReadQuery['chapters']['nodes'][number];
type FirstUnreadChapter = NonNullable<
  RecentlyReadNode['manga']['firstUnreadChapter']
>;

export interface RecentlyReadTargetChapter {
  readonly id: number;
  readonly name: string;
  readonly chapterNumber: number;
  readonly lastPageRead: number;
  readonly pageCount: number;
}

export interface RecentlyReadEntry {
  readonly manga: {
    readonly id: number;
    readonly title: string;
    readonly thumbnailUrl: string | null;
  };
  readonly lastReadChapter: {
    readonly id: number;
    readonly name: string;
    readonly lastReadAt: number;
    readonly lastPageRead: number;
    readonly pageCount: number;
    readonly isRead: boolean;
  };
  readonly targetChapter: RecentlyReadTargetChapter;
}

export interface RecentlyReadRepository {
  get(
    limit?: number,
    hiddenCategoryIds?: ReadonlySet<number>,
  ): Promise<readonly RecentlyReadEntry[]>;
}

export interface RecentlyReadRepositoryOptions {
  readonly getClient: () => ApolloClient;
}

const PAGE_SIZE = 100;
const MAX_PAGES = 10;
export const DEFAULT_RECENTLY_READ_LIMIT = 24;

function isChapterFinished(node: RecentlyReadNode): boolean {
  return (
    node.isRead ||
    (node.pageCount > 0 && node.lastPageRead >= node.pageCount)
  );
}

function targetFromNode(node: RecentlyReadNode): RecentlyReadTargetChapter {
  return {
    id: node.id,
    name: node.name,
    chapterNumber: node.chapterNumber,
    lastPageRead: node.lastPageRead,
    pageCount: node.pageCount,
  };
}

function targetFromFirstUnread(
  chapter: FirstUnreadChapter,
): RecentlyReadTargetChapter {
  return {
    id: chapter.id,
    name: chapter.name,
    chapterNumber: chapter.chapterNumber,
    lastPageRead: chapter.lastPageRead,
    pageCount: chapter.pageCount,
  };
}

/**
 * Groups recently read chapters by manga, in last-read order.
 *
 * - Only chapters with a recorded lastReadAt are queried.
 * - The newest read chapter per manga is used.
 * - A finished chapter advances to the manga's first unread chapter.
 * - Manga with no remaining unread chapter are omitted.
 */
export function createRecentlyReadRepository(
  options: RecentlyReadRepositoryOptions,
): RecentlyReadRepository {
  return {
    async get(
      limit = DEFAULT_RECENTLY_READ_LIMIT,
      hiddenCategoryIds: ReadonlySet<number> = new Set(),
    ) {
      const requested = Math.max(1, Math.min(100, Math.trunc(limit)));
      const seen = new Set<number>();
      const entries: RecentlyReadEntry[] = [];
      let after: string | null = null;

      for (let page = 0; page < MAX_PAGES && entries.length < requested; page += 1) {
        const variables: RecentlyReadQueryVariables = {
          first: PAGE_SIZE,
          ...(after ? { after } : {}),
        };
        const result = await options.getClient().query({
          query: RecentlyReadDocument,
          variables,
          fetchPolicy: 'network-only',
        });
        const chapters = result.data?.chapters;

        if (!chapters) {
          throw new Error('Recently read chapters are unavailable.');
        }

        for (const chapter of chapters.nodes) {
          const mangaId = chapter.manga.id;

          if (seen.has(mangaId)) {
            continue;
          }

          seen.add(mangaId);

          if (
            chapter.manga.categories.nodes.some((category) =>
              hiddenCategoryIds.has(category.id),
            )
          ) {
            continue;
          }

          const target = isChapterFinished(chapter)
            ? chapter.manga.firstUnreadChapter
            : chapter;

          if (!target) {
            continue;
          }

          entries.push({
            manga: {
              id: mangaId,
              title: chapter.manga.title,
              thumbnailUrl: chapter.manga.thumbnailUrl,
            },
            lastReadChapter: {
              id: chapter.id,
              name: chapter.name,
              lastReadAt: Number(chapter.lastReadAt),
              lastPageRead: chapter.lastPageRead,
              pageCount: chapter.pageCount,
              isRead: chapter.isRead,
            },
            targetChapter: isChapterFinished(chapter)
              ? targetFromFirstUnread(target as FirstUnreadChapter)
              : targetFromNode(target as RecentlyReadNode),
          });

          if (entries.length >= requested) {
            break;
          }
        }

        if (!chapters.pageInfo.hasNextPage || !chapters.pageInfo.endCursor) {
          break;
        }

        after = chapters.pageInfo.endCursor;
      }

      return entries;
    },
  };
}

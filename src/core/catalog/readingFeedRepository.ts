import type { ApolloClient } from '@apollo/client';
import {
  ReadingFeedDocument,
  type ReadingFeedQuery,
  type ReadingFeedQueryVariables,
} from '../graphql/generated/graphql';
import type { FeedChapter } from './catalogRepository';

type MangaNode = ReadingFeedQuery['mangas']['nodes'][number];
type LatestChapter = NonNullable<MangaNode['latestUploadedChapter']>;

export interface ReadingFeedPage {
  readonly items: readonly FeedChapter[];
  readonly totalCount: number;
}

export interface ReadingFeedRepository {
  get(): Promise<ReadingFeedPage>;
}

export interface ReadingFeedRepositoryOptions {
  readonly getClient: () => ApolloClient;
}

const PAGE_SIZE = 200;
const MAX_PAGES = 20;

function toFeedChapter(
  manga: Pick<MangaNode, 'id' | 'title' | 'thumbnailUrl'>,
  chapter: LatestChapter,
): FeedChapter {
  return {
    __typename: 'ChapterType',
    id: chapter.id,
    name: chapter.name,
    chapterNumber: chapter.chapterNumber,
    pageCount: chapter.pageCount,
    isRead: chapter.isRead,
    isDownloaded: chapter.isDownloaded,
    lastPageRead: chapter.lastPageRead,
    lastReadAt: chapter.lastReadAt,
    uploadDate: chapter.uploadDate,
    scanlator: chapter.scanlator,
    manga: {
      __typename: 'MangaType',
      id: manga.id,
      title: manga.title,
      thumbnailUrl: manga.thumbnailUrl,
    },
  };
}

/**
 * One row per Library manga, using the server's latestUploadedChapter.
 *
 * The rows are sorted by the latest chapter's uploadDate descending. Because
 * the source is the manga list, a manga cannot appear twice and the total is a
 * manga count rather than a chapter count.
 */
export function createReadingFeedRepository(
  options: ReadingFeedRepositoryOptions,
): ReadingFeedRepository {
  return {
    async get() {
      const items: FeedChapter[] = [];
      const seen = new Set<number>();
      let totalCount = 0;
      let after: string | null = null;

      for (let page = 0; page < MAX_PAGES; page += 1) {
        const variables: ReadingFeedQueryVariables = {
          first: PAGE_SIZE,
          ...(after ? { after } : {}),
        };
        const result = await options.getClient().query({
          query: ReadingFeedDocument,
          variables,
          fetchPolicy: 'network-only',
        });
        const mangas = result.data?.mangas;

        if (!mangas) {
          throw new Error('Reading feed is unavailable.');
        }

        totalCount = mangas.totalCount;

        for (const manga of mangas.nodes) {
          if (seen.has(manga.id)) {
            continue;
          }

          seen.add(manga.id);

          if (!manga.latestUploadedChapter) {
            continue;
          }

          items.push(toFeedChapter(manga, manga.latestUploadedChapter));
        }

        if (!mangas.pageInfo.hasNextPage || !mangas.pageInfo.endCursor) {
          break;
        }

        after = mangas.pageInfo.endCursor;
      }

      items.sort((left, right) => {
        const difference = Number(right.uploadDate) - Number(left.uploadDate);

        return difference !== 0 ? difference : right.id - left.id;
      });

      return { items, totalCount };
    },
  };
}

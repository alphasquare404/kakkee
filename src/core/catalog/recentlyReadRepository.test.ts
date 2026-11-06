import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import { RecentlyReadDocument, type RecentlyReadQuery } from '../graphql/generated/graphql';
import { createRecentlyReadRepository } from './recentlyReadRepository';

function chapter(
  id: number,
  mangaId: number,
  options: {
    lastReadAt?: string;
    isRead?: boolean;
    lastPageRead?: number;
    pageCount?: number;
    nextChapter?: {
      id: number;
      name: string;
      chapterNumber: number;
      lastPageRead: number;
      pageCount: number;
    } | null;
  } = {},
): RecentlyReadQuery['chapters']['nodes'][number] {
  return {
    __typename: 'ChapterType',
    id,
    name: `Chapter ${id}`,
    chapterNumber: id,
    isRead: options.isRead ?? false,
    lastReadAt: options.lastReadAt ?? '100',
    lastPageRead: options.lastPageRead ?? 0,
    pageCount: options.pageCount ?? 20,
    manga: {
      __typename: 'MangaType',
      id: mangaId,
      title: `Manga ${mangaId}`,
      thumbnailUrl: `/manga/${mangaId}/thumbnail`,
      firstUnreadChapter: options.nextChapter
        ? {
            __typename: 'ChapterType',
            id: options.nextChapter.id,
            name: options.nextChapter.name,
            chapterNumber: options.nextChapter.chapterNumber,
            lastPageRead: options.nextChapter.lastPageRead,
            pageCount: options.nextChapter.pageCount,
          }
        : null,
    },
  };
}

function page(
  nodes: RecentlyReadQuery['chapters']['nodes'],
  hasNextPage = false,
  endCursor: string | null = null,
): RecentlyReadQuery {
  return {
    __typename: 'Query',
    chapters: {
      __typename: 'ChapterNodeList',
      nodes,
      pageInfo: {
        __typename: 'PageInfo',
        endCursor,
        hasNextPage,
      },
    },
  };
}

function clientWith(response: RecentlyReadQuery | RecentlyReadQuery[]) {
  const query = vi.fn();
  const responses = Array.isArray(response) ? [...response] : [response];
  for (const value of responses) {
    query.mockResolvedValueOnce({ data: value });
  }
  return {
    query,
    client: { query } as unknown as ApolloClient,
  };
}

describe('recently read repository', () => {
  it('deduplicates by manga and uses the newest read chapter', async () => {
    const { client, query } = clientWith(
      page(
        [
          chapter(10, 1, { lastPageRead: 5, pageCount: 20 }),
          chapter(9, 1, { lastPageRead: 2, pageCount: 20 }),
          chapter(20, 2, {
            isRead: true,
            pageCount: 20,
            nextChapter: {
              id: 21,
              name: 'Chapter 21',
              chapterNumber: 21,
              lastPageRead: 0,
              pageCount: 18,
            },
          }),
          chapter(30, 3, { isRead: true, pageCount: 20 }),
        ],
      ),
    );
    const repository = createRecentlyReadRepository({ getClient: () => client });

    const result = await repository.get(24);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      manga: { id: 1 },
      lastReadChapter: { id: 10 },
      targetChapter: { id: 10 },
    });
    expect(result[1]).toMatchObject({
      manga: { id: 2 },
      lastReadChapter: { id: 20 },
      targetChapter: { id: 21, name: 'Chapter 21' },
    });
    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        query: RecentlyReadDocument,
        fetchPolicy: 'network-only',
        variables: { first: 100 },
      }),
    );
  });

  it('advances a finished chapter to the next unread chapter and drops fully read manga', async () => {
    const { client } = clientWith(
      page([
        chapter(40, 4, {
          isRead: true,
          lastPageRead: 20,
          pageCount: 20,
          nextChapter: {
            id: 41,
            name: 'Chapter 41',
            chapterNumber: 41,
            lastPageRead: 0,
            pageCount: 15,
          },
        }),
        chapter(50, 5, { isRead: true, lastPageRead: 20, pageCount: 20 }),
      ]),
    );
    const repository = createRecentlyReadRepository({ getClient: () => client });

    const result = await repository.get(24);

    expect(result).toHaveLength(1);
    expect(result[0]?.targetChapter.id).toBe(41);
  });

  it('paginates until it has enough unique manga', async () => {
    const { client, query } = clientWith([
      page([chapter(1, 1), chapter(2, 1)], true, 'cursor-1'),
      page([chapter(3, 2)], false, null),
    ]);
    const repository = createRecentlyReadRepository({ getClient: () => client });

    const result = await repository.get(2);

    expect(result.map((entry) => entry.manga.id)).toEqual([1, 2]);
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        variables: { first: 100, after: 'cursor-1' },
      }),
    );
  });
});

import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import {
  ReadingFeedDocument,
  type ReadingFeedQuery,
} from '../graphql/generated/graphql';
import { createReadingFeedRepository } from './readingFeedRepository';

function manga(
  id: number,
  uploadDate: string,
  chapterId = id * 10,
): ReadingFeedQuery['mangas']['nodes'][number] {
  return {
    __typename: 'MangaType',
    id,
    title: `Manga ${id}`,
    thumbnailUrl: `/manga/${id}/thumbnail`,
    source: null,
    categories: { __typename: 'CategoryNodeList', nodes: [] },
    latestUploadedChapter: {
      __typename: 'ChapterType',
      id: chapterId,
      name: `Chapter ${chapterId}`,
      chapterNumber: chapterId,
      pageCount: 20,
      isRead: id % 2 === 0,
      isDownloaded: true,
      lastPageRead: 0,
      lastReadAt: '0',
      uploadDate,
      scanlator: null,
      sourceOrder: 1,
    },
  };
}

function page(
  nodes: ReadingFeedQuery['mangas']['nodes'],
  totalCount: number,
  hasNextPage = false,
  endCursor: string | null = null,
): ReadingFeedQuery {
  return {
    __typename: 'Query',
    mangas: {
      __typename: 'MangaNodeList',
      totalCount,
      nodes,
      pageInfo: {
        __typename: 'PageInfo',
        endCursor,
        hasNextPage,
      },
    },
  };
}

function clientWith(response: ReadingFeedQuery | ReadingFeedQuery[]) {
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

describe('reading feed repository', () => {
  it('returns one latest chapter per manga sorted by upload date', async () => {
    const { client, query } = clientWith(
      page(
        [
          manga(1, '1000', 10),
          manga(2, '3000', 20),
          manga(3, '2000', 30),
        ],
        3,
      ),
    );
    const repository = createReadingFeedRepository({ getClient: () => client });

    const result = await repository.get();

    expect(result.totalCount).toBe(3);
    expect(result.items.map((item) => item.manga.id)).toEqual([2, 3, 1]);
    expect(result.items[0]).toMatchObject({
      id: 20,
      manga: { id: 2, title: 'Manga 2' },
    });
    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        query: ReadingFeedDocument,
        fetchPolicy: 'network-only',
        variables: { first: 200 },
      }),
    );
  });

  it('excludes manga assigned to hidden categories', async () => {
    const hidden = manga(1, '3000');
    hidden.categories.nodes = [{ __typename: 'CategoryType', id: 7 }];
    const { client } = clientWith(page([hidden, manga(2, '2000')], 2));
    const repository = createReadingFeedRepository({ getClient: () => client });

    const result = await repository.get(new Set([7]));

    expect(result.items.map((item) => item.manga.id)).toEqual([2]);
    expect(result.totalCount).toBe(1);
  });

  it('skips manga without a latest chapter', async () => {
    const empty = manga(1, '1000');
    empty.latestUploadedChapter = null;
    const { client } = clientWith(page([empty, manga(2, '2000')], 2));
    const repository = createReadingFeedRepository({ getClient: () => client });

    const result = await repository.get();

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.manga.id).toBe(2);
  });

  it('paginates the manga list without duplicating manga', async () => {
    const { client, query } = clientWith([
      page([manga(1, '1000')], 2, true, 'cursor-1'),
      page([manga(1, '1000'), manga(2, '2000')], 2, false, null),
    ]);
    const repository = createReadingFeedRepository({ getClient: () => client });

    const result = await repository.get();

    expect(result.items.map((item) => item.manga.id)).toEqual([2, 1]);
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        variables: { first: 200, after: 'cursor-1' },
      }),
    );
  });
});

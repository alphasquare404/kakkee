import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import { GlobalSearchDocument } from '../graphql/generated/graphql';
import { createSearchRepository } from './searchRepository';

describe('createSearchRepository', () => {
  it('queries manga and sources with the search term', async () => {
    const query = vi.fn(async () => ({
      data: {
        mangas: {
          __typename: 'MangaNodeList',
          totalCount: 1,
          nodes: [
            {
              __typename: 'MangaType',
              id: 1,
              title: 'Alpha',
              thumbnailUrl: null,
              inLibrary: true,
              unreadCount: 2,
            },
          ],
        },
        sources: {
          __typename: 'SourceNodeList',
          totalCount: 1,
          nodes: [
            {
              __typename: 'SourceType',
              id: '42',
              name: 'Example',
              displayName: 'Example Source',
              lang: 'en',
            },
          ],
        },
      },
    }));
    const client = { query, mutate: vi.fn() } as unknown as ApolloClient;
    const repository = createSearchRepository({ getClient: () => client });

    await expect(repository.search('alpha')).resolves.toMatchObject({
      mangas: { totalCount: 1 },
    });
    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        query: GlobalSearchDocument,
        variables: { search: 'alpha' },
      }),
    );
  });
});

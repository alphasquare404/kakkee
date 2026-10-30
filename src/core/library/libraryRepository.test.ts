import type { ApolloClient } from '@apollo/client';
import { print } from 'graphql';
import { describe, expect, it, vi } from 'vitest';
import {
  LibraryCategoriesDocument,
  LibraryMangasDocument,
  UpdateMangasCategoriesDocument,
  UpdateMangasLibraryDocument,
  type LibraryCategoriesQuery,
  type LibraryMangasQuery,
  type LibraryMangasQueryVariables,
} from '../graphql/generated/graphql';
import {
  createLibraryRepository,
  DEFAULT_LIBRARY_PAGE_SIZE,
  LibraryInputError,
  MAX_LIBRARY_PAGE_SIZE,
  type LibraryPageInput,
} from './libraryRepository';

function libraryData(overrides: Partial<LibraryMangasQuery['mangas']> = {}): LibraryMangasQuery {
  return {
    __typename: 'Query',
    mangas: {
      __typename: 'MangaNodeList',
      totalCount: 2,
      nodes: [
        {
          __typename: 'MangaType',
          id: 1,
          title: 'Alpha',
          thumbnailUrl: '/api/v1/manga/1/thumbnail',
          thumbnailUrlLastFetched: '100',
          unreadCount: 3,
          downloadCount: 1,
        },
        {
          __typename: 'MangaType',
          id: 2,
          title: 'Beta',
          thumbnailUrl: null,
          thumbnailUrlLastFetched: null,
          unreadCount: 0,
          downloadCount: 0,
        },
      ],
      pageInfo: {
        __typename: 'PageInfo',
        endCursor: 'cursor-2',
        hasNextPage: true,
      },
      ...overrides,
    },
    ...overrides,
  } as LibraryMangasQuery;
}

interface QueryOptions {
  variables?: LibraryMangasQueryVariables;
  query?: unknown;
  fetchPolicy?: string;
}

function fakeClient(data: LibraryMangasQuery = libraryData()) {
  const query = vi.fn(async (_options: QueryOptions) => {
    void _options;
    return { data };
  });

  return {
    client: { query } as unknown as ApolloClient,
    query,
  };
}

function queryOptions(
  query: { mock: { calls: unknown[][] } },
  index = 0,
): QueryOptions {
  return query.mock.calls[index][0] as QueryOptions;
}

function categoryData(
  nodes: LibraryCategoriesQuery['categories']['nodes'] = [
    { __typename: 'CategoryType', id: 0, name: 'Default', order: 0, mangas: { __typename: 'MangaNodeList', totalCount: 0 } },
    { __typename: 'CategoryType', id: 3, name: 'Action', order: 3, mangas: { __typename: 'MangaNodeList', totalCount: 2 } },
  ],
): LibraryCategoriesQuery {
  return {
    __typename: 'Query',
    categories: {
      __typename: 'CategoryNodeList',
      nodes,
    },
  };
}

function fakeCategoryClient(data: LibraryCategoriesQuery = categoryData()) {
  const query = vi.fn(async (_options: QueryOptions) => {
    void _options;
    return { data };
  });

  return {
    client: { query } as unknown as ApolloClient,
    query,
  };
}

describe('createLibraryRepository request mapping', () => {
  it('uses the generated document, library invariant, default page size, and default sort', async () => {
    const { client, query } = fakeClient();
    const repository = createLibraryRepository({ getClient: () => client });

    await repository.getPage();

    const options = queryOptions(query);
    expect(options.query).toBe(LibraryMangasDocument);
    expect(options.fetchPolicy).toBe('network-only');
    expect(options.variables).toEqual({
      first: DEFAULT_LIBRARY_PAGE_SIZE,
      order: [{ by: 'IN_LIBRARY_AT', byType: 'DESC' }],
    });
    expect(print(LibraryMangasDocument)).toContain('condition: { inLibrary: true }');
  });

  it('accepts a bounded custom page size and the maximum', async () => {
    const { client, query } = fakeClient();
    const repository = createLibraryRepository({ getClient: () => client });

    await repository.getPage({ first: 10 });
    await repository.getPage({ first: MAX_LIBRARY_PAGE_SIZE });

    expect(queryOptions(query, 0).variables?.first).toBe(10);
    expect(queryOptions(query, 1).variables?.first).toBe(MAX_LIBRARY_PAGE_SIZE);
  });

  it.each([0, -1, 1.5, MAX_LIBRARY_PAGE_SIZE + 1, Number.NaN])(
    'rejects invalid page size %s',
    async (first) => {
      const { client } = fakeClient();
      const repository = createLibraryRepository({ getClient: () => client });

      await expect(repository.getPage({ first })).rejects.toMatchObject({
        code: 'INVALID_PAGE_SIZE',
      });
    },
  );

  it('passes after and omits empty or whitespace-only cursors', async () => {
    const { client, query } = fakeClient();
    const repository = createLibraryRepository({ getClient: () => client });

    await repository.getPage({ after: 'opaque-cursor' });
    await repository.getPage({ after: '' });
    await repository.getPage({ after: '   ' });

    expect(queryOptions(query, 0).variables?.after).toBe('opaque-cursor');
    expect(queryOptions(query, 1).variables).not.toHaveProperty('after');
    expect(queryOptions(query, 2).variables).not.toHaveProperty('after');
  });
});

describe('createLibraryRepository filtering', () => {
  it('trims title search and omits empty search', async () => {
    const { client, query } = fakeClient();
    const repository = createLibraryRepository({ getClient: () => client });

    await repository.getPage({ filter: { search: '  Alpha  ' } });
    await repository.getPage({ filter: { search: '   ' } });

    expect(queryOptions(query, 0).variables?.filter).toEqual({
      title: { includesInsensitive: 'Alpha' },
    });
    expect(queryOptions(query, 1).variables).not.toHaveProperty('filter');
  });

  it('maps status, source, and single category filters', async () => {
    const { client, query } = fakeClient();
    const repository = createLibraryRepository({ getClient: () => client });

    await repository.getPage({
      filter: {
        status: 'ONGOING',
        sourceId: ' 12345 ',
        categoryId: 7,
      },
    });

    expect(queryOptions(query).variables?.filter).toEqual({
      status: { equalTo: 'ONGOING' },
      sourceId: { equalTo: '12345' },
      categoryId: { equalTo: 7 },
    });
  });

  it('rejects a non-integer category id', async () => {
    const { client } = fakeClient();
    const repository = createLibraryRepository({ getClient: () => client });

    await expect(
      repository.getPage({ filter: { categoryId: 1.5 } }),
    ).rejects.toBeInstanceOf(LibraryInputError);
  });
});

describe('createLibraryRepository sorting', () => {
  it.each([
    ['title', 'asc', 'TITLE'],
    ['dateAdded', 'desc', 'IN_LIBRARY_AT'],
    ['lastFetched', 'asc', 'LAST_FETCHED_AT'],
    ['id', 'desc', 'ID'],
  ] as const)('maps %s %s to %s', async (field, direction, by) => {
    const { client, query } = fakeClient();
    const repository = createLibraryRepository({ getClient: () => client });

    await repository.getPage({ sort: { field, direction } });

    expect(queryOptions(query).variables?.order).toEqual([
      { by, byType: direction === 'desc' ? 'DESC' : 'ASC' },
    ]);
  });
});

describe('createLibraryRepository response mapping', () => {
  it('maps nodes, totalCount, endCursor, and hasNextPage', async () => {
    const { client } = fakeClient();
    const repository = createLibraryRepository({ getClient: () => client });

    const page = await repository.getPage();

    expect(page.items).toHaveLength(2);
    expect(page.items[0]).toMatchObject({
      id: 1,
      title: 'Alpha',
      thumbnailUrl: '/api/v1/manga/1/thumbnail',
    });
    expect(page.totalCount).toBe(2);
    expect(page.pageInfo).toEqual({
      endCursor: 'cursor-2',
      hasNextPage: true,
    });
  });

  it('preserves an empty page and null cursor', async () => {
    const { client } = fakeClient(
      libraryData({
        nodes: [],
        totalCount: 0,
        pageInfo: {
          __typename: 'PageInfo',
          endCursor: null,
          hasNextPage: false,
        },
      }),
    );
    const repository = createLibraryRepository({ getClient: () => client });

    const page = await repository.getPage();

    expect(page.items).toEqual([]);
    expect(page.totalCount).toBe(0);
    expect(page.pageInfo).toEqual({
      endCursor: null,
      hasNextPage: false,
    });
  });

  it('does not swallow GraphQL/client errors', async () => {
    const error = new Error('GraphQL failure');
    const query = vi.fn(async () => {
      throw error;
    });
    const client = { query } as unknown as ApolloClient;
    const repository = createLibraryRepository({ getClient: () => client });

    await expect(repository.getPage()).rejects.toBe(error);
  });

  it('fails instead of fabricating an empty page for malformed response data', async () => {
    const query = vi.fn(async () => ({ data: undefined }));
    const client = { query } as unknown as ApolloClient;
    const repository = createLibraryRepository({ getClient: () => client });

    await expect(repository.getPage()).rejects.toThrow(
      'Respons Library tidak memiliki data mangas.',
    );
  });
});

describe('createLibraryRepository categories', () => {
  it('uses the generated category document and preserves backend order', async () => {
    const { client, query } = fakeCategoryClient();
    const repository = createLibraryRepository({ getClient: () => client });

    const categories = await repository.getCategories();

    const options = queryOptions(query);
    expect(options.query).toBe(LibraryCategoriesDocument);
    expect(options.fetchPolicy).toBe('network-only');
    expect(categories.map((category) => category.id)).toEqual([0, 3]);
    expect(categories.map((category) => category.order)).toEqual([0, 3]);
    expect(print(LibraryCategoriesDocument)).toContain(
      'order: [{ by: ORDER, byType: ASC }]',
    );
  });

  it('returns an empty array for no categories', async () => {
    const { client } = fakeCategoryClient(categoryData([]));
    const repository = createLibraryRepository({ getClient: () => client });

    await expect(repository.getCategories()).resolves.toEqual([]);
  });

  it('propagates category errors instead of returning empty categories', async () => {
    const error = new Error('category query failed');
    const query = vi.fn(async () => {
      throw error;
    });
    const client = { query } as unknown as ApolloClient;
    const repository = createLibraryRepository({ getClient: () => client });

    await expect(repository.getCategories()).rejects.toBe(error);
  });

  it('uses the current client for each category request', async () => {
    const first = fakeCategoryClient();
    const second = fakeCategoryClient(
      categoryData([{ __typename: 'CategoryType', id: 9, name: 'Later', order: 9, mangas: { __typename: 'MangaNodeList', totalCount: 1 } }]),
    );
    let current = first.client;
    const getClient = vi.fn(() => current);
    const repository = createLibraryRepository({ getClient });

    await repository.getCategories();
    current = second.client;
    const categories = await repository.getCategories();

    expect(getClient).toHaveBeenCalledTimes(2);
    expect(first.query).toHaveBeenCalledTimes(1);
    expect(second.query).toHaveBeenCalledTimes(1);
    expect(categories.map((category) => category.id)).toEqual([9]);
  });
});

describe('createLibraryRepository connection ownership', () => {
  it('calls getClient for every request and does not retain the previous client', async () => {
    const first = fakeClient();
    const second = fakeClient();
    let current = first.client;
    const getClient = vi.fn(() => current);
    const repository = createLibraryRepository({ getClient });

    await repository.getPage();
    current = second.client;
    await repository.getPage({ first: 10 });

    expect(getClient).toHaveBeenCalledTimes(2);
    expect(first.query).toHaveBeenCalledTimes(1);
    expect(second.query).toHaveBeenCalledTimes(1);
    expect(queryOptions(second.query).variables?.first).toBe(10);
  });
});

describe('LibraryInputError', () => {
  it('has a stable code and contains no credentials or server URL', () => {
    const error = new LibraryInputError('INVALID_PAGE_SIZE');

    expect(error.code).toBe('INVALID_PAGE_SIZE');
    expect(error.message).not.toContain('token');
    expect(error.message).not.toContain('password');
  });

  it('does not expose arbitrary raw filter or condition input', async () => {
    const { client, query } = fakeClient();
    const repository = createLibraryRepository({ getClient: () => client });

    await repository.getPage({
      first: 10,
      condition: { inLibrary: false },
    } as unknown as LibraryPageInput);

    expect(queryOptions(query).variables).not.toHaveProperty('condition');
    expect(queryOptions(query).variables?.filter).toBeUndefined();
  });

  it('writes bulk library and category mutations through generated operations', async () => {
    const mutate = vi.fn(async ({ mutation }: { mutation: unknown }) => {
      if (mutation === UpdateMangasCategoriesDocument) {
        return { data: { updateMangasCategories: { mangas: [] } } };
      }

      return { data: { updateMangas: { mangas: [] } } };
    });
    const client = { mutate } as unknown as ApolloClient;
    const repository = createLibraryRepository({ getClient: () => client });

    await repository.setLibrary([1, 2], false);
    await repository.addToCategory([1], 7);

    expect(mutate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        mutation: UpdateMangasLibraryDocument,
        variables: { input: { ids: [1, 2], patch: { inLibrary: false } } },
      }),
    );
    expect(mutate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        mutation: UpdateMangasCategoriesDocument,
        variables: {
          input: { ids: [1], patch: { addToCategories: [7] } },
        },
      }),
    );
  });
});

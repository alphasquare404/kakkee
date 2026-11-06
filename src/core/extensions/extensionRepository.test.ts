import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import {
  AddExtensionStoreDocument,
  ExtensionsCatalogDocument,
  FetchExtensionsDocument,
  RemoveExtensionStoreDocument,
  UpdateExtensionsDocument,
} from '../graphql/generated/graphql';
import { createExtensionRepository } from './extensionRepository';

const extension = {
  __typename: 'ExtensionType' as const,
  pkgName: 'example',
  name: 'Example',
  versionName: '1.0.0',
  lang: 'en',
  isInstalled: false,
  hasUpdate: false,
  isObsolete: false,
  iconUrl: '/icon.png',
  contentWarning: 'SAFE' as const,
  extensionStore: { __typename: 'ExtensionStoreType' as const, name: 'Store' },
};

describe('createExtensionRepository', () => {
  it('loads, refreshes, and updates extensions', async () => {
    const query = vi.fn(async () => ({
      data: {
        extensions: {
          __typename: 'ExtensionNodeList',
          totalCount: 1,
          nodes: [extension],
          pageInfo: {
            __typename: 'PageInfo',
            endCursor: null,
            hasNextPage: false,
          },
        },
      },
    }));
    const mutate = vi.fn(async ({ mutation }: { mutation: unknown }) => {
      if (mutation === FetchExtensionsDocument) {
        return {
          data: {
            fetchExtensions: {
              extensions: [extension],
              extensionStores: [
                {
                  __typename: 'ExtensionStoreType',
                  name: 'Store',
                  badgeLabel: 'Official',
                  indexUrl: 'https://example.test/index',
                },
              ],
            },
          },
        };
      }

      if (mutation === UpdateExtensionsDocument) {
        return {
          data: {
            updateExtensions: {
              extensions: [
                {
                  __typename: 'ExtensionType',
                  pkgName: 'example',
                  isInstalled: true,
                  hasUpdate: false,
                },
              ],
            },
          },
        };
      }

      throw new Error('unexpected mutation');
    });
    const client = { query, mutate } as unknown as ApolloClient;
    const repository = createExtensionRepository({ getClient: () => client });

    await expect(repository.getExtensions()).resolves.toHaveLength(1);
    await expect(repository.refresh()).resolves.toMatchObject({
      stores: [{ name: 'Store' }],
    });
    await expect(repository.update('example', { install: true })).resolves.toEqual([
      expect.objectContaining({ pkgName: 'example', isInstalled: true }),
    ]);

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        query: ExtensionsCatalogDocument,
        variables: { first: 500 },
      }),
    );
    expect(mutate).toHaveBeenNthCalledWith(2, {
      mutation: UpdateExtensionsDocument,
      variables: { input: { ids: ['example'], patch: { install: true } } },
    });
  });

  it('reads every extension page', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        data: {
          extensions: {
            __typename: 'ExtensionNodeList',
            totalCount: 2,
            nodes: [extension],
            pageInfo: {
              __typename: 'PageInfo',
              endCursor: 'next',
              hasNextPage: true,
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          extensions: {
            __typename: 'ExtensionNodeList',
            totalCount: 2,
            nodes: [
              {
                ...extension,
                pkgName: 'second',
                name: 'Second',
              },
            ],
            pageInfo: {
              __typename: 'PageInfo',
              endCursor: null,
              hasNextPage: false,
            },
          },
        },
      });
    const repository = createExtensionRepository({
      getClient: () => ({ query } as unknown as ApolloClient),
    });

    await expect(repository.getExtensions()).resolves.toHaveLength(2);
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        variables: { first: 500, after: 'next' },
      }),
    );
  });

  it('adds and removes extension stores', async () => {
    const mutate = vi.fn(async ({ mutation }: { mutation: unknown }) => {
      if (mutation === AddExtensionStoreDocument) {
        return {
          data: {
            addExtensionStore: {
              extensionStore: {
                __typename: 'ExtensionStoreType',
                name: 'Store',
                badgeLabel: 'Community',
                indexUrl: 'https://example.test/index.json',
              },
            },
          },
        };
      }
      if (mutation === RemoveExtensionStoreDocument) {
        return {
          data: {
            removeExtensionStore: {
              extensionStore: {
                __typename: 'ExtensionStoreType',
                indexUrl: 'https://example.test/index.json',
              },
            },
          },
        };
      }
      throw new Error('unexpected mutation');
    });
    const client = { query: vi.fn(), mutate } as unknown as ApolloClient;
    const repository = createExtensionRepository({ getClient: () => client });

    await expect(
      repository.addStore('https://example.test/index.json'),
    ).resolves.toMatchObject({ name: 'Store' });
    await repository.removeStore('https://example.test/index.json');

    expect(mutate).toHaveBeenNthCalledWith(1, {
      mutation: AddExtensionStoreDocument,
      variables: { input: { indexUrl: 'https://example.test/index.json' } },
    });
    expect(mutate).toHaveBeenNthCalledWith(2, {
      mutation: RemoveExtensionStoreDocument,
      variables: { input: { indexUrl: 'https://example.test/index.json' } },
    });
  });

  it('uploads an external extension JAR', async () => {
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { installExternalExtension: {} } }),
    })) as unknown as typeof fetch;
    const client = { query: vi.fn(), mutate: vi.fn() } as unknown as ApolloClient;
    const repository = createExtensionRepository({
      getClient: () => client,
      getGraphqlUrl: () => 'https://example.test/api/graphql',
      getAccessToken: () => 'token-1',
      fetchImpl,
    });

    await repository.installExternal(new File(['jar'], 'extension.jar'));

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://example.test/api/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer token-1' },
        body: expect.any(FormData),
      }),
    );
  });
});

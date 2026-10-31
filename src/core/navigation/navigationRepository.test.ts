import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import { NavigationBadgesDocument } from '../graphql/generated/graphql';
import { createNavigationRepository } from './navigationRepository';

describe('createNavigationRepository', () => {
  it('reads download and extension-update counts', async () => {
    const query = vi.fn(async () => ({
      data: {
        downloadStatus: {
          __typename: 'DownloadStatus',
          queue: [{ __typename: 'DownloadType', position: 1 }],
        },
        extensions: { __typename: 'ExtensionNodeList', totalCount: 2 },
      },
    }));
    const client = { query } as unknown as ApolloClient;
    const repository = createNavigationRepository({ getClient: () => client });

    await expect(repository.getBadges()).resolves.toEqual({
      downloads: 1,
      extensionUpdates: 2,
    });
    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({ query: NavigationBadgesDocument }),
    );
  });
});

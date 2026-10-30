import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import {
  FetchSourceMangaDocument,
  SourceInfoDocument,
  UpdateMangasLibraryDocument,
} from '../graphql/generated/graphql';
import { createSourceRepository } from './sourceRepository';

describe('createSourceRepository', () => {
  it('loads source info, fetches catalog pages, and toggles library state', async () => {
    const query = vi.fn(async () => ({
      data: {
        source: {
          __typename: 'SourceType',
          id: '42',
          displayName: 'Example',
          name: 'ExampleSource',
          lang: 'en',
          contentWarning: 'SAFE',
        },
      },
    }));
    const mutate = vi.fn(async ({ mutation }: { mutation: unknown }) => {
      if (mutation === FetchSourceMangaDocument) {
        return {
          data: {
            fetchSourceManga: {
              hasNextPage: true,
              mangas: [
                {
                  __typename: 'MangaType',
                  id: 1,
                  title: 'Alpha',
                  thumbnailUrl: null,
                  inLibrary: false,
                  sourceId: '42',
                },
              ],
            },
          },
        };
      }
      if (mutation === UpdateMangasLibraryDocument) {
        return { data: { updateMangas: { mangas: [] } } };
      }
      throw new Error('unexpected mutation');
    });
    const client = { query, mutate } as unknown as ApolloClient;
    const repository = createSourceRepository({ getClient: () => client });

    await expect(repository.getInfo('42')).resolves.toMatchObject({
      displayName: 'Example',
    });
    await expect(
      repository.fetchManga({ sourceId: '42', type: 'POPULAR', page: 1 }),
    ).resolves.toMatchObject({ hasNextPage: true });
    await repository.setLibrary([1], true);

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        query: SourceInfoDocument,
        variables: { id: '42' },
      }),
    );
    expect(mutate).toHaveBeenCalledWith({
      mutation: FetchSourceMangaDocument,
      variables: { input: { source: '42', type: 'POPULAR', page: 1 } },
    });
    expect(mutate).toHaveBeenCalledWith({
      mutation: UpdateMangasLibraryDocument,
      variables: { input: { ids: [1], patch: { inLibrary: true } } },
    });
  });
});

import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import {
  MangaCategoryPickerDocument,
  SetMangaCategoriesDocument,
} from '../graphql/generated/graphql';
import { createMangaCategoryRepository } from './mangaCategoryRepository';

describe('createMangaCategoryRepository', () => {
  it('loads and saves manga category links', async () => {
    const query = vi.fn(async () => ({
      data: {
        manga: {
          __typename: 'MangaType',
          id: 1,
          categories: {
            nodes: [{ __typename: 'CategoryType', id: 2, name: 'Reading' }],
          },
        },
        categories: {
          nodes: [
            { __typename: 'CategoryType', id: 2, name: 'Reading' },
            { __typename: 'CategoryType', id: 3, name: 'Archive' },
          ],
        },
      },
    }));
    const mutate = vi.fn(async () => ({
      data: {
        updateMangaCategories: {
          manga: { __typename: 'MangaType', id: 1, categories: { nodes: [] } },
        },
      },
    }));
    const client = { query, mutate } as unknown as ApolloClient;
    const repository = createMangaCategoryRepository({ getClient: () => client });

    await expect(repository.get(1)).resolves.toMatchObject({
      all: [{ id: 2 }, { id: 3 }],
      selected: [{ id: 2 }],
    });
    await repository.save(1, [2, 3]);

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        query: MangaCategoryPickerDocument,
        variables: { mangaId: 1 },
      }),
    );
    expect(mutate).toHaveBeenCalledWith({
      mutation: SetMangaCategoriesDocument,
      variables: {
        input: {
          id: 1,
          patch: { clearCategories: true, addToCategories: [2, 3] },
        },
      },
    });
  });
});

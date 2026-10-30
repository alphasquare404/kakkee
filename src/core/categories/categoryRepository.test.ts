import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import {
  CreateCategoryDocument,
  DeleteCategoryDocument,
  UpdateCategoryDocument,
  UpdateCategoryOrderDocument,
} from '../graphql/generated/graphql';
import { createCategoryRepository } from './categoryRepository';

const category = {
  __typename: 'CategoryType' as const,
  id: 4,
  name: 'Favorites',
  default: false,
  isDefaultCategory: false,
  order: 2,
  mangas: { __typename: 'MangaNodeList' as const, totalCount: 3 },
};

describe('createCategoryRepository', () => {
  it('creates, renames, moves, and deletes a category', async () => {
    const mutate = vi.fn(async ({ mutation }: { mutation: unknown }) => {
      if (mutation === CreateCategoryDocument) {
        return { data: { createCategory: { category } } };
      }
      if (mutation === UpdateCategoryDocument) {
        return { data: { updateCategory: { category: { ...category, name: 'Later' } } } };
      }
      if (mutation === UpdateCategoryOrderDocument) {
        return { data: { updateCategoryOrder: { categories: [] } } };
      }
      if (mutation === DeleteCategoryDocument) {
        return { data: { deleteCategory: { category: { id: 4 } } } };
      }
      throw new Error('unexpected mutation');
    });
    const client = { query: vi.fn(), mutate } as unknown as ApolloClient;
    const repository = createCategoryRepository({ getClient: () => client });

    await expect(repository.createCategory('Favorites')).resolves.toMatchObject({
      name: 'Favorites',
    });
    await expect(repository.renameCategory(4, 'Later')).resolves.toMatchObject({
      name: 'Later',
    });
    await repository.moveCategory(4, 1);
    await repository.deleteCategory(4);

    expect(mutate).toHaveBeenNthCalledWith(3, {
      mutation: UpdateCategoryOrderDocument,
      variables: { input: { id: 4, position: 1 } },
    });
    expect(mutate).toHaveBeenNthCalledWith(4, {
      mutation: DeleteCategoryDocument,
      variables: { input: { categoryId: 4 } },
    });
  });
});

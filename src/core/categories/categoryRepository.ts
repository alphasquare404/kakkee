import type { ApolloClient } from '@apollo/client';
import {
  CategoryCatalogDocument,
  CreateCategoryDocument,
  DeleteCategoryDocument,
  UpdateCategoryDocument,
  UpdateCategoryOrderDocument,
  type CategoryCatalogQuery,
  type IncludeOrExclude,
} from '../graphql/generated/graphql';

export type Category = CategoryCatalogQuery['categories']['nodes'][number];

export interface CategoryRepository {
  getCategories(): Promise<readonly Category[]>;
  createCategory(name: string): Promise<Category>;
  renameCategory(id: number, name: string): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  moveCategory(id: number, position: number): Promise<void>;
  setCategoryFlags(
    id: number,
    flags: Partial<{
      includeInUpdate: IncludeOrExclude;
      includeInDownload: IncludeOrExclude;
      default: boolean;
    }>,
  ): Promise<void>;
}

export interface CategoryRepositoryOptions {
  readonly getClient: () => ApolloClient;
}

export function createCategoryRepository(
  options: CategoryRepositoryOptions,
): CategoryRepository {
  return {
    async getCategories() {
      const result = await options.getClient().query({
        query: CategoryCatalogDocument,
        fetchPolicy: 'network-only',
      });

      if (!result.data?.categories) {
        throw new Error('Categories are unavailable.');
      }

      return result.data.categories.nodes;
    },
    async createCategory(name) {
      const result = await options.getClient().mutate({
        mutation: CreateCategoryDocument,
        variables: { input: { name } },
      });

      if (!result.data?.createCategory) {
        throw new Error('Category could not be created.');
      }

      return result.data.createCategory.category;
    },
    async renameCategory(id, name) {
      const result = await options.getClient().mutate({
        mutation: UpdateCategoryDocument,
        variables: { input: { id, patch: { name } } },
      });

      if (!result.data?.updateCategory) {
        throw new Error('Category could not be renamed.');
      }

      return result.data.updateCategory.category;
    },
    async deleteCategory(id) {
      const result = await options.getClient().mutate({
        mutation: DeleteCategoryDocument,
        variables: { input: { categoryId: id } },
      });

      if (!result.data?.deleteCategory) {
        throw new Error('Category could not be deleted.');
      }
    },
    async moveCategory(id, position) {
      const result = await options.getClient().mutate({
        mutation: UpdateCategoryOrderDocument,
        variables: { input: { id, position } },
      });

      if (!result.data?.updateCategoryOrder) {
        throw new Error('Category order could not be saved.');
      }
    },
    async setCategoryFlags(id, flags) {
      const result = await options.getClient().mutate({
        mutation: UpdateCategoryDocument,
        variables: { input: { id, patch: flags } },
      });

      if (!result.data?.updateCategory) {
        throw new Error('Category flags could not be saved.');
      }
    },
  };
}

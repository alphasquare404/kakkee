import { describe, expect, it, vi } from 'vitest';
import type { Category, CategoryRepository } from './categoryRepository';
import { createCategoryController } from './categoryController';

const category: Category = {
  __typename: 'CategoryType',
  id: 1,
  name: 'Default',
  default: true,
  isDefaultCategory: true,
  order: 0,
  includeInUpdate: 'INCLUDE',
  includeInDownload: 'INCLUDE',
  mangas: { __typename: 'MangaNodeList', totalCount: 4 },
};

function setup() {
  const getCategories = vi.fn(async () => [category]);
  const createCategory = vi.fn(async () => category);
  const renameCategory = vi.fn(async () => category);
  const deleteCategory = vi.fn(async () => undefined);
  const moveCategory = vi.fn(async () => undefined);
  const repository = {
    getCategories,
    createCategory,
    renameCategory,
    deleteCategory,
    moveCategory,
  } as unknown as CategoryRepository;
  return {
    controller: createCategoryController(repository),
    createCategory,
    renameCategory,
    deleteCategory,
    moveCategory,
  };
}

describe('createCategoryController', () => {
  it('loads categories and applies create/rename/move/delete', async () => {
    const { controller, createCategory, renameCategory, moveCategory, deleteCategory } =
      setup();
    await controller.load();

    expect(controller.getState().items).toHaveLength(1);
    await expect(controller.create('New')).resolves.toBe(true);
    await expect(controller.rename(1, 'Renamed')).resolves.toBe(true);
    await expect(controller.move(1, 2)).resolves.toBe(true);
    await expect(controller.remove(1)).resolves.toBe(true);

    expect(createCategory).toHaveBeenCalledWith('New');
    expect(renameCategory).toHaveBeenCalledWith(1, 'Renamed');
    expect(moveCategory).toHaveBeenCalledWith(1, 2);
    expect(deleteCategory).toHaveBeenCalledWith(1);
  });

  it('reports an action error without discarding loaded categories', async () => {
    const { controller, createCategory } = setup();
    await controller.load();
    createCategory.mockRejectedValueOnce(new Error('rejected'));

    await expect(controller.create('New')).resolves.toBe(false);
    expect(controller.getState().actionError).toBe(true);
    expect(controller.getState().items).toHaveLength(1);
  });
});

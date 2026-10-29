import { describe, expect, it, vi } from 'vitest';
import { createLibraryCategoryController } from './libraryCategoryController';
import type { LibraryCategory } from './libraryRepository';

function category(id: number, name = `Category ${id}`, order = id): LibraryCategory {
  return { __typename: 'CategoryType', id, name, order };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

describe('createLibraryCategoryController', () => {
  it('starts empty and idle', () => {
    const getCategories = vi.fn();
    const controller = createLibraryCategoryController({
      repository: { getCategories },
    });

    expect(controller.getState()).toEqual({
      categories: [],
      isLoading: false,
      error: null,
    });
  });

  it('loads categories and preserves backend order', async () => {
    const getCategories = vi.fn().mockResolvedValue([
      category(0, 'Default', 0),
      category(3, 'Action', 3),
    ]);
    const controller = createLibraryCategoryController({
      repository: { getCategories },
    });

    await controller.load();

    expect(controller.getState().categories.map((item) => item.id)).toEqual([0, 3]);
    expect(controller.getState().isLoading).toBe(false);
    expect(controller.getState().error).toBeNull();
  });

  it('handles an empty category list', async () => {
    const controller = createLibraryCategoryController({
      repository: { getCategories: vi.fn().mockResolvedValue([]) },
    });

    await controller.load();

    expect(controller.getState()).toEqual({
      categories: [],
      isLoading: false,
      error: null,
    });
  });

  it('propagates category errors without replacing existing categories with empty data', async () => {
    const error = new Error('categories failed');
    const getCategories = vi
      .fn()
      .mockResolvedValueOnce([category(0)])
      .mockRejectedValueOnce(error);
    const controller = createLibraryCategoryController({
      repository: { getCategories },
    });

    await controller.load();
    await controller.load();

    expect(controller.getState().categories.map((item) => item.id)).toEqual([0]);
    expect(controller.getState().isLoading).toBe(false);
    expect(controller.getState().error).toBe(error);
  });

  it('ignores a stale category response', async () => {
    const first = deferred<readonly LibraryCategory[]>();
    const second = deferred<readonly LibraryCategory[]>();
    const getCategories = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    const controller = createLibraryCategoryController({
      repository: { getCategories },
    });

    const firstLoad = controller.load();
    const secondLoad = controller.load();

    second.resolve([category(2)]);
    await secondLoad;
    first.resolve([category(1)]);
    await firstLoad;

    expect(controller.getState().categories.map((item) => item.id)).toEqual([2]);
  });

  it('notifies subscribers and stops after unsubscribe', async () => {
    const getCategories = vi.fn().mockResolvedValue([category(0)]);
    const controller = createLibraryCategoryController({
      repository: { getCategories },
    });
    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener);

    await controller.load();
    expect(listener).toHaveBeenCalled();
    const calls = listener.mock.calls.length;

    unsubscribe();
    await controller.load();

    expect(listener).toHaveBeenCalledTimes(calls);
  });
});

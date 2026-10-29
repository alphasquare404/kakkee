import { describe, expect, it, vi } from 'vitest';
import {
  createLibraryController,
  LibraryPaginationError,
  type LibraryState,
} from './libraryController';
import {
  DEFAULT_LIBRARY_SORT,
  type LibraryManga,
  type LibraryPage,
  type LibraryRepository,
} from './libraryRepository';

function manga(id: number, title = `Manga ${id}`): LibraryManga {
  return {
    __typename: 'MangaType',
    id,
    title,
    thumbnailUrl: null,
    thumbnailUrlLastFetched: null,
  };
}

function page(
  items: LibraryManga[],
  overrides: Partial<LibraryPage['pageInfo']> & { totalCount?: number } = {},
): LibraryPage {
  const defaultCursor = items.length > 0 ? `cursor-${items[items.length - 1].id}` : null;

  return {
    items,
    totalCount: overrides.totalCount ?? items.length,
    pageInfo: {
      endCursor:
        'endCursor' in overrides ? (overrides.endCursor ?? null) : defaultCursor,
      hasNextPage: overrides.hasNextPage ?? false,
    },
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

function setup() {
  const getPage = vi.fn();
  const repository = { getPage } as unknown as LibraryRepository;
  const controller = createLibraryController({ repository });
  return { controller, getPage };
}

function state(controller: ReturnType<typeof setup>['controller']): LibraryState {
  return controller.getState();
}

describe('createLibraryController initial load', () => {
  it('starts with a deterministic empty Library state and default criteria', () => {
    const { controller } = setup();
    const initial = state(controller);

    expect(initial.items).toEqual([]);
    expect(initial.totalCount).toBe(0);
    expect(initial.pageInfo).toEqual({ endCursor: null, hasNextPage: false });
    expect(initial.filter).toEqual({});
    expect(initial.sort).toEqual(DEFAULT_LIBRARY_SORT);
    expect(initial.isInitialLoading).toBe(false);
    expect(initial.isLoadingMore).toBe(false);
    expect(initial.initialError).toBeNull();
    expect(initial.loadMoreError).toBeNull();
  });

  it('loads the first page with default page size and exposes loading state', async () => {
    const request = deferred<LibraryPage>();
    const { controller, getPage } = setup();
    getPage.mockReturnValueOnce(request.promise);

    const pending = controller.load();
    expect(state(controller).isInitialLoading).toBe(true);
    expect(state(controller).items).toEqual([]);

    request.resolve(page([manga(1), manga(2)], { hasNextPage: true, totalCount: 2 }));
    await pending;

    expect(getPage).toHaveBeenCalledWith({
      first: 40,
      filter: {},
      sort: DEFAULT_LIBRARY_SORT,
    });
    expect(state(controller).items.map((item) => item.id)).toEqual([1, 2]);
    expect(state(controller).pageInfo).toEqual({
      endCursor: 'cursor-2',
      hasNextPage: true,
    });
    expect(state(controller).totalCount).toBe(2);
    expect(state(controller).isInitialLoading).toBe(false);
    expect(state(controller).initialError).toBeNull();
  });

  it('handles an empty Library', async () => {
    const { controller, getPage } = setup();
    getPage.mockResolvedValueOnce(page([]));

    await controller.load();

    expect(state(controller).items).toEqual([]);
    expect(state(controller).totalCount).toBe(0);
    expect(state(controller).pageInfo).toEqual({
      endCursor: null,
      hasNextPage: false,
    });
  });

  it('exposes an initial error without inventing an empty Library', async () => {
    const error = new Error('GraphQL failed');
    const { controller, getPage } = setup();
    getPage.mockRejectedValueOnce(error);

    await controller.load();

    expect(state(controller).items).toEqual([]);
    expect(state(controller).totalCount).toBe(0);
    expect(state(controller).isInitialLoading).toBe(false);
    expect(state(controller).initialError).toBe(error);
  });
});

describe('createLibraryController load more', () => {
  async function loadedController(firstPage = page([manga(1)], { hasNextPage: true })) {
    const setupResult = setup();
    setupResult.getPage.mockResolvedValueOnce(firstPage);
    await setupResult.controller.load();

    return setupResult;
  }

  it('appends the next page and updates totalCount/pageInfo', async () => {
    const { controller, getPage } = await loadedController(
      page([manga(1)], { hasNextPage: true, totalCount: 2 }),
    );
    getPage.mockResolvedValueOnce(page([manga(2)], { hasNextPage: false, totalCount: 2 }));

    await controller.loadMore();

    expect(getPage).toHaveBeenLastCalledWith({
      first: 40,
      after: 'cursor-1',
      filter: {},
      sort: DEFAULT_LIBRARY_SORT,
    });
    expect(state(controller).items.map((item) => item.id)).toEqual([1, 2]);
    expect(state(controller).totalCount).toBe(2);
    expect(state(controller).pageInfo).toEqual({
      endCursor: 'cursor-2',
      hasNextPage: false,
    });
    expect(state(controller).isLoadingMore).toBe(false);
  });

  it('keeps existing items when load-more fails', async () => {
    const { controller, getPage } = await loadedController();
    const error = new Error('page two failed');
    getPage.mockRejectedValueOnce(error);

    await controller.loadMore();

    expect(state(controller).items.map((item) => item.id)).toEqual([1]);
    expect(state(controller).totalCount).toBe(1);
    expect(state(controller).pageInfo.endCursor).toBe('cursor-1');
    expect(state(controller).isLoadingMore).toBe(false);
    expect(state(controller).loadMoreError).toBe(error);
  });

  it('does not request another page when hasNextPage is false', async () => {
    const { controller, getPage } = setup();
    getPage.mockResolvedValueOnce(page([manga(1)], { hasNextPage: false }));
    await controller.load();

    await controller.loadMore();

    expect(getPage).toHaveBeenCalledTimes(1);
    expect(state(controller).loadMoreError).toBeNull();
  });

  it('prevents duplicate concurrent loadMore calls', async () => {
    const { controller, getPage } = await loadedController();
    const secondPage = deferred<LibraryPage>();
    getPage.mockReturnValueOnce(secondPage.promise);

    const first = controller.loadMore();
    const duplicate = controller.loadMore();

    expect(state(controller).isLoadingMore).toBe(true);
    expect(getPage).toHaveBeenCalledTimes(2);

    secondPage.resolve(page([manga(2)]));
    await Promise.all([first, duplicate]);

    expect(getPage).toHaveBeenCalledTimes(2);
    expect(state(controller).items.map((item) => item.id)).toEqual([1, 2]);
  });

  it('stops on hasNextPage=true with null endCursor without loop', async () => {
    const { controller, getPage } = setup();
    getPage.mockResolvedValueOnce(
      page([manga(1)], { hasNextPage: true, endCursor: null }),
    );
    await controller.load();

    expect(state(controller).loadMoreError).toBeInstanceOf(LibraryPaginationError);

    await controller.loadMore();

    expect(getPage).toHaveBeenCalledTimes(1);
  });

  it('deduplicates by manga id without reordering existing items', async () => {
    const { controller, getPage } = await loadedController(
      page([manga(1), manga(2)], { hasNextPage: true }),
    );
    getPage.mockResolvedValueOnce(
      page([manga(2), manga(3), manga(3)], { hasNextPage: false }),
    );

    await controller.loadMore();

    expect(state(controller).items.map((item) => item.id)).toEqual([1, 2, 3]);
  });
});

describe('createLibraryController criteria changes', () => {
  it('resets old pagination immediately when search changes', async () => {
    const { controller, getPage } = setup();
    getPage.mockResolvedValueOnce(page([manga(1)], { hasNextPage: true }));
    await controller.load();

    const next = deferred<LibraryPage>();
    getPage.mockReturnValueOnce(next.promise);
    const pending = controller.setSearch('alpha');

    expect(state(controller).items).toEqual([]);
    expect(state(controller).totalCount).toBe(0);
    expect(state(controller).pageInfo).toEqual({
      endCursor: null,
      hasNextPage: false,
    });
    expect(state(controller).isInitialLoading).toBe(true);
    expect(state(controller).filter.search).toBe('alpha');

    next.resolve(page([manga(2)]));
    await pending;

    expect(state(controller).items.map((item) => item.id)).toEqual([2]);
  });

  it('resets when filter changes and preserves the new filter', async () => {
    const { controller, getPage } = setup();
    getPage.mockResolvedValueOnce(page([manga(1)]));
    await controller.load();
    getPage.mockResolvedValueOnce(page([manga(2)]));

    await controller.setFilter({ status: 'ONGOING', categoryId: 3 });

    expect(getPage).toHaveBeenLastCalledWith({
      first: 40,
      filter: { status: 'ONGOING', categoryId: 3 },
      sort: DEFAULT_LIBRARY_SORT,
    });
    expect(state(controller).filter).toEqual({ status: 'ONGOING', categoryId: 3 });
  });

  it('resets when sort changes and preserves the new sort', async () => {
    const { controller, getPage } = setup();
    getPage.mockResolvedValueOnce(page([manga(1)]));
    await controller.load();
    getPage.mockResolvedValueOnce(page([manga(2)]));

    await controller.setSort({ field: 'title', direction: 'asc' });

    expect(getPage).toHaveBeenLastCalledWith({
      first: 40,
      filter: {},
      sort: { field: 'title', direction: 'asc' },
    });
    expect(state(controller).sort).toEqual({ field: 'title', direction: 'asc' });
  });

  it('ignores a stale initial response after a newer search starts', async () => {
    const first = deferred<LibraryPage>();
    const second = deferred<LibraryPage>();
    const { controller, getPage } = setup();
    getPage.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    const firstLoad = controller.load();
    const secondLoad = controller.setSearch('new search');

    second.resolve(page([manga(2)]));
    await secondLoad;
    first.resolve(page([manga(1)]));
    await firstLoad;

    expect(state(controller).filter.search).toBe('new search');
    expect(state(controller).items.map((item) => item.id)).toEqual([2]);
    expect(state(controller).isInitialLoading).toBe(false);
  });

  it('ignores a stale load-more result after criteria change', async () => {
    const { controller, getPage } = setup();
    getPage.mockResolvedValueOnce(page([manga(1)], { hasNextPage: true }));
    await controller.load();

    const oldPage = deferred<LibraryPage>();
    getPage.mockReturnValueOnce(oldPage.promise);
    const oldLoadMore = controller.loadMore();

    getPage.mockResolvedValueOnce(page([manga(2)]));
    await controller.setSearch('new search');

    oldPage.resolve(page([manga(3)], { hasNextPage: false }));
    await oldLoadMore;

    expect(state(controller).items.map((item) => item.id)).toEqual([2]);
    expect(state(controller).filter.search).toBe('new search');
  });
});

describe('createLibraryController subscription', () => {
  it('notifies subscribers and stops after unsubscribe', async () => {
    const { controller, getPage } = setup();
    getPage.mockResolvedValue(page([]));
    const listener = vi.fn();
    const unsubscribe = controller.subscribe(listener);

    await controller.load();
    expect(listener).toHaveBeenCalled();
    const calls = listener.mock.calls.length;

    unsubscribe();
    await controller.setSearch('x');
    await controller.setSearch('y');

    expect(listener).toHaveBeenCalledTimes(calls);
  });
});

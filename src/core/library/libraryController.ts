import {
  DEFAULT_LIBRARY_PAGE_SIZE,
  DEFAULT_LIBRARY_SORT,
  type LibraryFilter,
  type LibraryManga,
  type LibraryPage,
  type LibraryRepository,
  type LibrarySort,
} from './libraryRepository';

export interface LibraryPaginationState {
  readonly endCursor: string | null;
  readonly hasNextPage: boolean;
}

export type LibraryFilterCriteria = Omit<LibraryFilter, 'categoryId'>;

export interface LibraryState {
  readonly items: readonly LibraryManga[];
  readonly totalCount: number;
  readonly pageInfo: LibraryPaginationState;
  readonly filter: LibraryFilterCriteria;
  /** null means the synthetic All view; no category refinement is sent. */
  readonly categoryId: number | null;
  readonly sort: LibrarySort;
  readonly isInitialLoading: boolean;
  readonly isLoadingMore: boolean;
  readonly initialError: unknown | null;
  readonly loadMoreError: unknown | null;
}

export class LibraryPaginationError extends Error {
  public readonly code = 'INCONSISTENT_PAGINATION';

  constructor() {
    super('Server mengembalikan hasNextPage=true tanpa endCursor.');
    this.name = 'LibraryPaginationError';
  }
}

export interface LibraryControllerOptions {
  readonly repository: LibraryRepository;
  readonly pageSize?: number;
  readonly initialFilter?: LibraryFilterCriteria;
  readonly initialSort?: LibrarySort;
  readonly initialCategoryId?: number | null;
}

export interface LibraryController {
  getState(): LibraryState;
  subscribe(listener: (state: LibraryState) => void): () => void;
  load(): Promise<void>;
  loadMore(): Promise<void>;
  setSearch(search: string): Promise<void>;
  setFilter(filter: LibraryFilterCriteria): Promise<void>;
  setSort(sort: LibrarySort): Promise<void>;
  setCategory(categoryId: number | null): Promise<void>;
  removeFromLibrary(ids: readonly number[]): Promise<void>;
  addToCategory(ids: readonly number[], categoryId: number): Promise<void>;
  markRead(ids: readonly number[], isRead: boolean): Promise<void>;
  downloadMangas(ids: readonly number[]): Promise<void>;
  deleteMangaDownloads(ids: readonly number[]): Promise<void>;
}

function initialState(options: LibraryControllerOptions): LibraryState {
  return {
    items: [],
    totalCount: 0,
    pageInfo: {
      endCursor: null,
      hasNextPage: false,
    },
    filter: { ...(options.initialFilter ?? {}) },
    categoryId: options.initialCategoryId ?? null,
    sort: options.initialSort ?? DEFAULT_LIBRARY_SORT,
    isInitialLoading: false,
    isLoadingMore: false,
    initialError: null,
    loadMoreError: null,
  };
}

function appendUnique(
  existing: readonly LibraryManga[],
  incoming: readonly LibraryManga[],
): LibraryManga[] {
  const seen = new Set(existing.map((item) => item.id));
  const appended: LibraryManga[] = [];

  for (const item of incoming) {
    if (seen.has(item.id)) {
      continue;
    }

    seen.add(item.id);
    appended.push(item);
  }

  return [...existing, ...appended];
}

function isInconsistent(page: LibraryPage): boolean {
  return page.pageInfo.hasNextPage && page.pageInfo.endCursor === null;
}

function repositoryFilter(
  filter: LibraryFilterCriteria,
  categoryId: number | null,
): LibraryFilter {
  return categoryId === null ? filter : { ...filter, categoryId };
}

export function createLibraryController(
  options: LibraryControllerOptions,
): LibraryController {
  const pageSize = options.pageSize ?? DEFAULT_LIBRARY_PAGE_SIZE;
  let state = initialState(options);
  let generation = 0;
  const listeners = new Set<(state: LibraryState) => void>();

  function setState(next: LibraryState): void {
    state = next;

    for (const listener of [...listeners]) {
      listener(state);
    }
  }

  function patch(next: Partial<LibraryState>): void {
    setState({ ...state, ...next });
  }

  function applyFirstPage(page: LibraryPage): void {
    patch({
      items: page.items,
      totalCount: page.totalCount,
      pageInfo: page.pageInfo,
      isInitialLoading: false,
      isLoadingMore: false,
      initialError: null,
      loadMoreError: isInconsistent(page) ? new LibraryPaginationError() : null,
    });
  }

  function applyNextPage(page: LibraryPage): void {
    patch({
      items: appendUnique(state.items, page.items),
      totalCount: page.totalCount,
      pageInfo: page.pageInfo,
      isLoadingMore: false,
      loadMoreError: isInconsistent(page) ? new LibraryPaginationError() : null,
    });
  }

  async function loadFirstPage(
    filter: LibraryFilterCriteria,
    sort: LibrarySort,
    categoryId: number | null,
  ): Promise<void> {
    const requestGeneration = ++generation;

    setState({
      ...state,
      items: [],
      totalCount: 0,
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
      filter,
      categoryId,
      sort,
      isInitialLoading: true,
      isLoadingMore: false,
      initialError: null,
      loadMoreError: null,
    });

    try {
      const page = await options.repository.getPage({
        first: pageSize,
        filter: repositoryFilter(filter, categoryId),
        sort,
      });

      if (requestGeneration !== generation) {
        return;
      }

      applyFirstPage(page);
    } catch (error) {
      if (requestGeneration !== generation) {
        return;
      }

      patch({
        items: [],
        totalCount: 0,
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
        },
        isInitialLoading: false,
        isLoadingMore: false,
        initialError: error,
        loadMoreError: null,
      });
    }
  }

  function load(): Promise<void> {
    return loadFirstPage(state.filter, state.sort, state.categoryId);
  }

  function loadMore(): Promise<void> {
    if (state.isInitialLoading || state.isLoadingMore) {
      return Promise.resolve();
    }

    if (!state.pageInfo.hasNextPage) {
      return Promise.resolve();
    }

    if (!state.pageInfo.endCursor) {
      patch({ loadMoreError: new LibraryPaginationError() });
      return Promise.resolve();
    }

    const requestGeneration = generation;
    const after = state.pageInfo.endCursor;

    patch({
      isLoadingMore: true,
      loadMoreError: null,
    });

    return (async () => {
      try {
        const page = await options.repository.getPage({
          first: pageSize,
          after,
          filter: repositoryFilter(state.filter, state.categoryId),
          sort: state.sort,
        });

        if (requestGeneration !== generation) {
          return;
        }

        applyNextPage(page);
      } catch (error) {
        if (requestGeneration !== generation) {
          return;
        }

        patch({
          isLoadingMore: false,
          loadMoreError: error,
        });
      }
    })();
  }

  function setSearch(search: string): Promise<void> {
    return loadFirstPage({ ...state.filter, search }, state.sort, state.categoryId);
  }

  function setFilter(filter: LibraryFilterCriteria): Promise<void> {
    return loadFirstPage(filter, state.sort, state.categoryId);
  }

  function setSort(sort: LibrarySort): Promise<void> {
    return loadFirstPage(state.filter, sort, state.categoryId);
  }

  function setCategory(categoryId: number | null): Promise<void> {
    return loadFirstPage(state.filter, state.sort, categoryId);
  }

  async function removeFromLibrary(ids: readonly number[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    await options.repository.setLibrary(ids, false);

    const removed = new Set(ids);
    patch({
      items: state.items.filter((item) => !removed.has(item.id)),
      totalCount: Math.max(0, state.totalCount - ids.length),
    });
  }

  async function addToCategory(
    ids: readonly number[],
    categoryId: number,
  ): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    await options.repository.addToCategory(ids, categoryId);
  }

  async function markRead(
    ids: readonly number[],
    isRead: boolean,
  ): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    const chapterIds = await collectChapterIds(ids);
    await options.repository.setChaptersRead(chapterIds, isRead);

    if (isRead) {
      const updated = new Set(ids);
      patch({
        items: state.items.map((item) =>
          updated.has(item.id) ? { ...item, unreadCount: 0 } : item,
        ),
      });
    }
  }

  async function collectChapterIds(
    ids: readonly number[],
  ): Promise<readonly number[]> {
    const chapterIds: number[] = [];

    for (const mangaId of ids) {
      chapterIds.push(...(await options.repository.getChapterIds(mangaId)));
    }

    return chapterIds;
  }

  async function downloadMangas(ids: readonly number[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    await options.repository.enqueueChapterDownloads(
      await collectChapterIds(ids),
    );
  }

  async function deleteMangaDownloads(ids: readonly number[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    await options.repository.deleteDownloadedChapters(
      await collectChapterIds(ids),
    );

    const updated = new Set(ids);
    patch({
      items: state.items.map((item) =>
        updated.has(item.id) ? { ...item, downloadCount: 0 } : item,
      ),
    });
  }

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    load,
    loadMore,
    setSearch,
    setFilter,
    setSort,
    setCategory,
    removeFromLibrary,
    addToCategory,
    markRead,
    downloadMangas,
    deleteMangaDownloads,
  };
}

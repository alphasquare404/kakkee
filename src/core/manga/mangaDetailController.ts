import {
  MANGA_CHAPTER_PAGE_SIZE,
  type MangaChapter,
  type MangaChapterOrder,
  type MangaDetail,
  type MangaRepository,
} from './mangaRepository';

export interface MangaDetailState {
  readonly manga: MangaDetail | null;
  readonly chapters: readonly MangaChapter[];
  readonly totalCount: number;
  readonly pageInfo: {
    readonly endCursor: string | null;
    readonly hasNextPage: boolean;
  };
  readonly order: MangaChapterOrder;
  readonly isLoading: boolean;
  readonly isLoadingMore: boolean;
  readonly error: unknown | null;
  readonly loadMoreError: unknown | null;
}

export interface MangaDetailController {
  getState(): MangaDetailState;
  subscribe(listener: (state: MangaDetailState) => void): () => void;
  load(): Promise<void>;
  loadMore(): Promise<void>;
  setOrder(order: MangaChapterOrder): Promise<void>;
}

export interface MangaDetailControllerOptions {
  readonly repository: MangaRepository;
  readonly mangaId: number;
}

function initialState(order: MangaChapterOrder = 'newest'): MangaDetailState {
  return {
    manga: null,
    chapters: [],
    totalCount: 0,
    pageInfo: { endCursor: null, hasNextPage: false },
    order,
    isLoading: false,
    isLoadingMore: false,
    error: null,
    loadMoreError: null,
  };
}

function appendUnique(
  existing: readonly MangaChapter[],
  incoming: readonly MangaChapter[],
): MangaChapter[] {
  const seen = new Set(existing.map((chapter) => chapter.id));
  const result = [...existing];

  for (const chapter of incoming) {
    if (!seen.has(chapter.id)) {
      seen.add(chapter.id);
      result.push(chapter);
    }
  }

  return result;
}

export function createMangaDetailController(
  options: MangaDetailControllerOptions,
): MangaDetailController {
  let state = initialState();
  let generation = 0;
  const listeners = new Set<(state: MangaDetailState) => void>();

  function setState(next: MangaDetailState): void {
    state = next;

    for (const listener of [...listeners]) {
      listener(state);
    }
  }

  function patch(next: Partial<MangaDetailState>): void {
    setState({ ...state, ...next });
  }

  async function loadFirstPage(order: MangaChapterOrder): Promise<void> {
    const requestGeneration = ++generation;

    setState({
      ...initialState(order),
      isLoading: true,
    });

    try {
      const page = await options.repository.getDetail({
        mangaId: options.mangaId,
        first: MANGA_CHAPTER_PAGE_SIZE,
        order,
      });

      if (requestGeneration !== generation) {
        return;
      }

      setState({
        manga: page.manga,
        chapters: page.chapters,
        totalCount: page.totalCount,
        pageInfo: page.pageInfo,
        order,
        isLoading: false,
        isLoadingMore: false,
        error: null,
        loadMoreError: null,
      });
    } catch (error) {
      if (requestGeneration !== generation) {
        return;
      }

      patch({
        isLoading: false,
        error,
      });
    }
  }

  function load(): Promise<void> {
    return loadFirstPage(state.order);
  }

  function setOrder(order: MangaChapterOrder): Promise<void> {
    return loadFirstPage(order);
  }

  function loadMore(): Promise<void> {
    if (state.isLoading || state.isLoadingMore || !state.pageInfo.hasNextPage) {
      return Promise.resolve();
    }

    if (!state.pageInfo.endCursor) {
      patch({ loadMoreError: new Error('Cursor chapter tidak konsisten.') });
      return Promise.resolve();
    }

    const requestGeneration = generation;
    const after = state.pageInfo.endCursor;

    patch({ isLoadingMore: true, loadMoreError: null });

    return (async () => {
      try {
        const page = await options.repository.getDetail({
          mangaId: options.mangaId,
          first: MANGA_CHAPTER_PAGE_SIZE,
          after,
          order: state.order,
        });

        if (requestGeneration !== generation) {
          return;
        }

        patch({
          chapters: appendUnique(state.chapters, page.chapters),
          totalCount: page.totalCount,
          pageInfo: page.pageInfo,
          isLoadingMore: false,
          loadMoreError: null,
        });
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
    setOrder,
  };
}

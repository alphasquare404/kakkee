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
  refresh(): Promise<void>;
  setOrder(order: MangaChapterOrder): Promise<void>;
  setChapterRead(chapterId: number, isRead: boolean): Promise<void>;
  setChapterBookmark(chapterId: number, isBookmarked: boolean): Promise<void>;
  setChaptersRead(ids: readonly number[], isRead: boolean): Promise<void>;
  setChaptersBookmark(
    ids: readonly number[],
    isBookmarked: boolean,
  ): Promise<void>;
  enqueueChapterDownloads(ids: readonly number[]): Promise<void>;
  deleteChapterDownloads(ids: readonly number[]): Promise<void>;
  setChapterDownloaded(
    chapterId: number,
    isDownloaded: boolean,
  ): Promise<void>;
  setInLibrary(inLibrary: boolean): Promise<void>;
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

  async function refresh(): Promise<void> {
    await options.repository.refresh(options.mangaId);

    if (state.manga) {
      await load();
    }
  }

  function setOrder(order: MangaChapterOrder): Promise<void> {
    return loadFirstPage(order);
  }

  function loadMore(): Promise<void> {    if (state.isLoading || state.isLoadingMore || !state.pageInfo.hasNextPage) {
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

  async function setChapterRead(
    chapterId: number,
    isRead: boolean,
  ): Promise<void> {
    const requestGeneration = generation;

    await options.repository.setChapterRead(chapterId, isRead);

    if (requestGeneration !== generation) {
      return;
    }

    patch({
      chapters: state.chapters.map((chapter) =>
        chapter.id === chapterId ? { ...chapter, isRead } : chapter,
      ),
    });
  }

  async function setChapterBookmark(
    chapterId: number,
    isBookmarked: boolean,
  ): Promise<void> {
    const requestGeneration = generation;

    await options.repository.setChapterBookmark(chapterId, isBookmarked);

    if (requestGeneration !== generation) {
      return;
    }

    patch({
      chapters: state.chapters.map((chapter) =>
        chapter.id === chapterId ? { ...chapter, isBookmarked } : chapter,
      ),
    });
  }

  async function setChapterDownloaded(
    chapterId: number,
    isDownloaded: boolean,
  ): Promise<void> {
    const requestGeneration = generation;

    if (isDownloaded) {
      await options.repository.deleteDownload(chapterId);
    } else {
      await options.repository.enqueueDownload(chapterId);
      return;
    }

    if (requestGeneration !== generation) {
      return;
    }

    patch({
      chapters: state.chapters.map((chapter) =>
        chapter.id === chapterId ? { ...chapter, isDownloaded: false } : chapter,
      ),
    });
  }

  async function setChaptersRead(
    ids: readonly number[],
    isRead: boolean,
  ): Promise<void> {
    const requestGeneration = generation;

    await options.repository.setChaptersRead(ids, isRead);

    if (requestGeneration !== generation) {
      return;
    }

    const selected = new Set(ids);
    patch({
      chapters: state.chapters.map((chapter) =>
        selected.has(chapter.id) ? { ...chapter, isRead } : chapter,
      ),
    });
  }

  async function setChaptersBookmark(
    ids: readonly number[],
    isBookmarked: boolean,
  ): Promise<void> {
    const requestGeneration = generation;

    await options.repository.setChaptersBookmark(ids, isBookmarked);

    if (requestGeneration !== generation) {
      return;
    }

    const selected = new Set(ids);
    patch({
      chapters: state.chapters.map((chapter) =>
        selected.has(chapter.id) ? { ...chapter, isBookmarked } : chapter,
      ),
    });
  }

  async function enqueueChapterDownloads(
    ids: readonly number[],
  ): Promise<void> {
    await options.repository.enqueueDownloads(ids);
  }

  async function deleteChapterDownloads(ids: readonly number[]): Promise<void> {
    const requestGeneration = generation;

    await options.repository.deleteDownloads(ids);

    if (requestGeneration !== generation) {
      return;
    }

    const selected = new Set(ids);
    patch({
      chapters: state.chapters.map((chapter) =>
        selected.has(chapter.id) ? { ...chapter, isDownloaded: false } : chapter,
      ),
    });
  }

  async function setInLibrary(inLibrary: boolean): Promise<void> {    const requestGeneration = generation;

    await options.repository.setInLibrary(options.mangaId, inLibrary);

    if (requestGeneration !== generation || !state.manga) {
      return;
    }

    patch({
      manga: { ...state.manga, inLibrary },
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
    refresh,
    setOrder,
    setChapterRead,
    setChapterBookmark,
    setChaptersRead,
    setChaptersBookmark,
    enqueueChapterDownloads,
    deleteChapterDownloads,
    setChapterDownloaded,
    setInLibrary,
  };
}

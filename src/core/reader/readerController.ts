import type {
  ReaderChapter,
  ReaderChapterListItem,
  ReaderRepository,
} from './readerRepository';

export interface ReaderState {
  readonly chapter: ReaderChapter | null;
  readonly chapters: readonly ReaderChapterListItem[];
  readonly pages: readonly string[];
  readonly previousChapter: { readonly id: number; readonly name: string } | null;
  readonly nextChapter: { readonly id: number; readonly name: string } | null;
  readonly isLoading: boolean;
  readonly isLoadingPages: boolean;
  readonly error: unknown | null;
  readonly pagesError: unknown | null;
}

export interface ReaderController {
  getState(): ReaderState;
  subscribe(listener: (state: ReaderState) => void): () => void;
  load(chapterId: number): Promise<void>;
  preload(chapterId: number): Promise<void>;
  retryPages(): Promise<void>;
  saveProgress(
    chapterId: number,
    lastPageRead: number,
    isRead?: boolean,
  ): Promise<void>;
  downloadChapter(chapterId: number): Promise<void>;
  deleteDownload(chapterId: number): Promise<void>;
  setBookmark(isBookmarked: boolean): Promise<void>;
  setInLibrary(inLibrary: boolean): Promise<void>;
}

export interface ReaderControllerOptions {
  readonly repository: ReaderRepository;
}

function initialState(): ReaderState {
  return {
    chapter: null,
    chapters: [],
    pages: [],
    previousChapter: null,
    nextChapter: null,
    isLoading: false,
    isLoadingPages: false,
    error: null,
    pagesError: null,
  };
}

export function createReaderController(
  options: ReaderControllerOptions,
): ReaderController {
  let state = initialState();
  let generation = 0;
  const listeners = new Set<(state: ReaderState) => void>();

  function setState(next: ReaderState): void {
    state = next;

    for (const listener of [...listeners]) {
      listener(state);
    }
  }

  function patch(next: Partial<ReaderState>): void {
    setState({ ...state, ...next });
  }

  async function load(chapterId: number): Promise<void> {
    const requestGeneration = ++generation;

    setState({
      ...initialState(),
      isLoading: true,
    });

    let chapter: ReaderChapter;

    try {
      chapter = await options.repository.getChapter(chapterId);
    } catch (error) {
      if (requestGeneration !== generation) {
        return;
      }

      patch({ isLoading: false, error });
      return;
    }

    if (requestGeneration !== generation) {
      return;
    }

    patch({
      chapter,
      isLoading: false,
      isLoadingPages: true,
    });

    const [neighborsResult, pagesResult, chaptersResult] = await Promise.allSettled([
      options.repository.getNeighbors(chapter.manga.id, chapter.chapterNumber),
      options.repository.getPages(chapter.id),
      options.repository.getChapterList(chapter.manga.id),
    ]);

    if (requestGeneration !== generation) {
      return;
    }

    const neighbors =
      neighborsResult.status === 'fulfilled' ? neighborsResult.value : null;
    const pages = pagesResult.status === 'fulfilled' ? pagesResult.value : [];
    const pagesError = pagesResult.status === 'rejected' ? pagesResult.reason : null;
    const chapters =
      chaptersResult.status === 'fulfilled' ? chaptersResult.value : [];

    patch({
      chapters,
      pages,
      previousChapter: neighbors?.previous.nodes[0] ?? null,
      nextChapter: neighbors?.next.nodes[0] ?? null,
      isLoadingPages: false,
      pagesError,
    });
  }

  async function retryPages(): Promise<void> {
    if (!state.chapter) {
      return;
    }

    const requestGeneration = generation;
    const chapter = state.chapter;

    patch({ isLoadingPages: true, pagesError: null });

    try {
      const pages = await options.repository.getPages(chapter.id);

      if (requestGeneration !== generation) {
        return;
      }

      patch({
        pages,
        isLoadingPages: false,
        pagesError: null,
      });
    } catch (error) {
      if (requestGeneration !== generation) {
        return;
      }

      patch({
        isLoadingPages: false,
        pagesError: error,
      });
    }
  }

  async function downloadChapter(chapterId: number): Promise<void> {
    await options.repository.enqueueDownload(chapterId);

    if (state.chapter?.id === chapterId) {
      patch({ chapter: { ...state.chapter, isDownloaded: true } });
    }
  }

  async function deleteDownload(chapterId: number): Promise<void> {
    await options.repository.deleteDownload(chapterId);

    if (state.chapter?.id === chapterId) {
      patch({ chapter: { ...state.chapter, isDownloaded: false } });
    }
  }

  async function preload(chapterId: number): Promise<void> {
    try {
      await options.repository.getPages(chapterId);
    } catch {
      // Preloading is best-effort; the normal load path reports errors.
    }
  }

  async function setBookmark(isBookmarked: boolean): Promise<void> {
    const chapter = state.chapter;

    if (!chapter) {
      return;
    }

    await options.repository.setBookmark(chapter.id, isBookmarked);

    if (state.chapter?.id === chapter.id) {
      patch({ chapter: { ...state.chapter, isBookmarked } });
    }
  }

  async function setInLibrary(inLibrary: boolean): Promise<void> {
    const chapter = state.chapter;

    if (!chapter) {
      return;
    }

    await options.repository.setInLibrary(chapter.manga.id, inLibrary);

    if (state.chapter?.id === chapter.id) {
      patch({
        chapter: {
          ...state.chapter,
          manga: { ...state.chapter.manga, inLibrary },
        },
      });
    }
  }

  async function saveProgress(
    chapterId: number,
    lastPageRead: number,
    isRead?: boolean,
  ): Promise<void> {
    const chapter = state.chapter;

    if (!chapter || chapter.id !== chapterId) {
      return;
    }

    const requestGeneration = generation;

    await options.repository.updateProgress(chapterId, lastPageRead, isRead);

    const current = state.chapter;

    if (
      requestGeneration !== generation ||
      current?.id !== chapterId ||
      isRead !== true
    ) {
      return;
    }

    patch({
      chapter: {
        ...current,
        isRead: true,
        lastPageRead,
      },
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
    preload,
    retryPages,
    saveProgress,
    downloadChapter,
    deleteDownload,
    setBookmark,
    setInLibrary,
  };
}

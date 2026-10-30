import type { ReaderChapter, ReaderRepository } from './readerRepository';

export interface ReaderState {
  readonly chapter: ReaderChapter | null;
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
  retryPages(): Promise<void>;
}

export interface ReaderControllerOptions {
  readonly repository: ReaderRepository;
}

function initialState(): ReaderState {
  return {
    chapter: null,
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

    const [neighborsResult, pagesResult] = await Promise.allSettled([
      options.repository.getNeighbors(chapter.manga.id, chapter.chapterNumber),
      options.repository.getPages(chapter.id),
    ]);

    if (requestGeneration !== generation) {
      return;
    }

    const neighbors =
      neighborsResult.status === 'fulfilled' ? neighborsResult.value : null;
    const pages = pagesResult.status === 'fulfilled' ? pagesResult.value : [];
    const pagesError = pagesResult.status === 'rejected' ? pagesResult.reason : null;

    patch({
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

  return {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    load,
    retryPages,
  };
}

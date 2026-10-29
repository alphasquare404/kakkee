import type { LibraryCategory, LibraryRepository } from './libraryRepository';

export interface LibraryCategoryState {
  readonly categories: readonly LibraryCategory[];
  readonly isLoading: boolean;
  readonly error: unknown | null;
}

export interface LibraryCategoryControllerOptions {
  readonly repository: Pick<LibraryRepository, 'getCategories'>;
}

export interface LibraryCategoryController {
  getState(): LibraryCategoryState;
  subscribe(listener: (state: LibraryCategoryState) => void): () => void;
  load(): Promise<void>;
}

export function createLibraryCategoryController(
  options: LibraryCategoryControllerOptions,
): LibraryCategoryController {
  let state: LibraryCategoryState = {
    categories: [],
    isLoading: false,
    error: null,
  };
  let generation = 0;
  const listeners = new Set<(state: LibraryCategoryState) => void>();

  function setState(next: LibraryCategoryState): void {
    state = next;

    for (const listener of [...listeners]) {
      listener(state);
    }
  }

  function load(): Promise<void> {
    const requestGeneration = ++generation;

    setState({
      ...state,
      isLoading: true,
      error: null,
    });

    return (async () => {
      try {
        const categories = await options.repository.getCategories();

        if (requestGeneration !== generation) {
          return;
        }

        setState({
          categories,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if (requestGeneration !== generation) {
          return;
        }

        setState({
          ...state,
          isLoading: false,
          error,
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
  };
}

import type { SearchRepository, SearchResult } from './searchRepository';

export type SearchStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface SearchState {
  readonly status: SearchStatus;
  readonly query: string;
  readonly results: SearchResult | null;
  readonly error: boolean;
}

export interface SearchController {
  getState(): SearchState;
  subscribe(listener: () => void): () => void;
  search(query: string): Promise<void>;
}

export function createSearchController(
  repository: SearchRepository,
): SearchController {
  let state: SearchState = {
    status: 'idle',
    query: '',
    results: null,
    error: false,
  };
  let generation = 0;
  const listeners = new Set<() => void>();

  const patch = (next: Partial<SearchState>) => {
    state = { ...state, ...next };
    notify();
  };

  const notify = () => {
    for (const listener of [...listeners]) {
      listener();
    }
  };

  async function search(query: string): Promise<void> {
    const value = query.trim();

    if (!value) {
      patch({ status: 'idle', query: '', results: null, error: false });
      return;
    }

    const requestGeneration = ++generation;
    patch({ status: 'loading', query: value, error: false });

    try {
      const results = await repository.search(value);

      if (requestGeneration === generation) {
        patch({ status: 'ready', results });
      }
    } catch {
      if (requestGeneration === generation) {
        patch({ status: 'error', error: true });
      }
    }
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    search,
  };
}

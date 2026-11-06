import type { SourceManga } from '../source/sourceRepository';

export type SearchPageFetcher = (
  sourceId: string,
  page: number,
  query: string,
) => Promise<{
  readonly mangas: readonly SourceManga[];
  readonly hasNextPage: boolean;
}>;

export interface SourceSearchState {
  readonly status: 'loading' | 'ready' | 'error';
  readonly mangas: readonly SourceManga[];
  readonly hasNextPage: boolean;
  readonly page: number;
  readonly loadingMore: boolean;
}

export interface MultiSourceSearchState {
  readonly status: 'idle' | 'searching' | 'ready';
  readonly query: string;
  readonly sourceIds: readonly string[];
  readonly sources: Readonly<Record<string, SourceSearchState>>;
  readonly completed: number;
  readonly total: number;
}

export interface MultiSourceSearchController {
  getState(): MultiSourceSearchState;
  subscribe(listener: () => void): () => void;
  start(query: string, sourceIds: readonly string[]): Promise<void>;
  loadMore(sourceId: string): Promise<void>;
  retrySource(sourceId: string): Promise<void>;
  cancel(): void;
}

const CONCURRENCY = 4;

function emptySource(): SourceSearchState {
  return {
    status: 'loading',
    mangas: [],
    hasNextPage: false,
    page: 0,
    loadingMore: false,
  };
}

export function createMultiSourceSearchController(options: {
  readonly fetchPage: SearchPageFetcher;
}): MultiSourceSearchController {
  let state: MultiSourceSearchState = {
    status: 'idle',
    query: '',
    sourceIds: [],
    sources: {},
    completed: 0,
    total: 0,
  };
  let generation = 0;
  const listeners = new Set<() => void>();

  const notify = () => {
    for (const listener of [...listeners]) {
      listener();
    }
  };

  const patch = (next: Partial<MultiSourceSearchState>) => {
    state = { ...state, ...next };
    notify();
  };

  const patchSource = (sourceId: string, next: Partial<SourceSearchState>) => {
    const current = state.sources[sourceId];

    if (!current) {
      return;
    }

    state = {
      ...state,
      sources: {
        ...state.sources,
        [sourceId]: { ...current, ...next },
      },
    };
    notify();
  };

  async function start(query: string, sourceIds: readonly string[]): Promise<void> {
    const run = ++generation;
    const trimmed = query.trim();
    const sources: Record<string, SourceSearchState> = {};

    for (const sourceId of sourceIds) {
      sources[sourceId] = emptySource();
    }

    state = {
      status: trimmed && sourceIds.length > 0 ? 'searching' : 'idle',
      query: trimmed,
      sourceIds: [...sourceIds],
      sources,
      completed: 0,
      total: sourceIds.length,
    };
    notify();

    if (!trimmed || sourceIds.length === 0) {
      state = { ...state, status: 'ready' };
      notify();
      return;
    }

    const queue = [...sourceIds];
    let completed = 0;

    const worker = async () => {
      for (;;) {
        const sourceId = queue.shift();

        if (!sourceId) {
          return;
        }

        try {
          const page = await options.fetchPage(sourceId, 1, trimmed);

          if (run !== generation) {
            return;
          }

          patchSource(sourceId, {
            status: 'ready',
            mangas: page.mangas,
            hasNextPage: page.hasNextPage,
            page: 1,
          });
        } catch {
          if (run !== generation) {
            return;
          }

          patchSource(sourceId, { status: 'error', page: 0 });
        }

        completed += 1;
        patch({ completed });
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, sourceIds.length) }, () =>
        worker(),
      ),
    );

    if (run !== generation) {
      return;
    }

    patch({ status: 'ready', completed: sourceIds.length });
  }

  async function loadMore(sourceId: string): Promise<void> {
    const current = state.sources[sourceId];

    if (
      !current ||
      current.status !== 'ready' ||
      !current.hasNextPage ||
      current.loadingMore ||
      state.status !== 'ready'
    ) {
      return;
    }

    const run = generation;
    const nextPage = current.page + 1;
    patchSource(sourceId, { loadingMore: true });

    try {
      const page = await options.fetchPage(sourceId, nextPage, state.query);

      if (run !== generation) {
        return;
      }

      const seen = new Set(current.mangas.map((manga) => manga.id));
      const additions = page.mangas.filter((manga) => !seen.has(manga.id));

      patchSource(sourceId, {
        mangas: [...current.mangas, ...additions],
        hasNextPage: page.hasNextPage,
        page: nextPage,
        loadingMore: false,
      });
    } catch {
      if (run === generation) {
        patchSource(sourceId, { loadingMore: false });
      }
    }
  }

  async function retrySource(sourceId: string): Promise<void> {
    if (!state.sources[sourceId] || !state.query) {
      return;
    }

    const run = generation;
    patchSource(sourceId, { status: 'loading', mangas: [], page: 0 });

    try {
      const page = await options.fetchPage(sourceId, 1, state.query);

      if (run !== generation) {
        return;
      }

      patchSource(sourceId, {
        status: 'ready',
        mangas: page.mangas,
        hasNextPage: page.hasNextPage,
        page: 1,
      });
    } catch {
      if (run === generation) {
        patchSource(sourceId, { status: 'error' });
      }
    }
  }

  function cancel(): void {
    generation += 1;

    if (state.status === 'idle' && state.sourceIds.length === 0) {
      return;
    }

    state = {
      status: 'idle',
      query: '',
      sourceIds: [],
      sources: {},
      completed: 0,
      total: 0,
    };
    notify();
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start,
    loadMore,
    retrySource,
    cancel,
  };
}

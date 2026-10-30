import type {
  FetchSourceMangaType,
} from '../graphql/generated/graphql';
import type {
  SourceInfo,
  SourceManga,
  SourceRepository,
} from './sourceRepository';

export type SourceLoadState = 'idle' | 'loading' | 'ready' | 'error';

export interface SourceState {
  readonly source: SourceInfo | null;
  readonly mangas: readonly SourceManga[];
  readonly type: FetchSourceMangaType;
  readonly query: string;
  readonly page: number;
  readonly hasNextPage: boolean;
  readonly status: SourceLoadState;
  readonly loadingMore: boolean;
  readonly error: boolean;
  readonly actionError: boolean;
}

export interface SourceController {
  getState(): SourceState;
  subscribe(listener: () => void): () => void;
  load(sourceId: string): Promise<void>;
  setType(type: FetchSourceMangaType): Promise<void>;
  search(query: string): Promise<void>;
  loadMore(): Promise<void>;
  toggleLibrary(manga: SourceManga): Promise<void>;
}

export function createSourceController(
  repository: SourceRepository,
): SourceController {
  let sourceId = '';
  let state: SourceState = {
    source: null,
    mangas: [],
    type: 'POPULAR',
    query: '',
    page: 1,
    hasNextPage: false,
    status: 'idle',
    loadingMore: false,
    error: false,
    actionError: false,
  };
  let generation = 0;
  const listeners = new Set<() => void>();

  const patch = (next: Partial<SourceState>) => {
    state = { ...state, ...next };
    notify();
  };

  const notify = () => {
    for (const listener of [...listeners]) {
      listener();
    }
  };

  async function fetchPage(
    type: FetchSourceMangaType,
    query: string,
    page: number,
    append: boolean,
  ): Promise<void> {
    if (!sourceId) {
      return;
    }

    const requestGeneration = ++generation;

    patch(
      append
        ? { loadingMore: true, error: false }
        : {
            status: 'loading',
            mangas: [],
            loadingMore: false,
            error: false,
            actionError: false,
            type,
            query,
            page,
          },
    );

    try {
      const result = await repository.fetchManga({
        sourceId,
        type,
        query: query || undefined,
        page,
      });

      if (requestGeneration !== generation) {
        return;
      }

      patch({
        mangas: append ? [...state.mangas, ...result.mangas] : result.mangas,
        hasNextPage: result.hasNextPage,
        page,
        status: 'ready',
        loadingMore: false,
      });
    } catch {
      if (requestGeneration === generation) {
        patch({
          status: append ? state.status : 'error',
          loadingMore: false,
          error: !append,
        });
      }
    }
  }

  async function load(nextSourceId: string): Promise<void> {
    sourceId = nextSourceId;
    patch({ status: 'loading', error: false, source: null });

    try {
      const source = await repository.getInfo(nextSourceId);
      patch({ source });
      await fetchPage('POPULAR', '', 1, false);
    } catch {
      patch({ status: 'error', error: true });
    }
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load,
    async setType(type) {
      await fetchPage(type, '', 1, false);
    },
    async search(query) {
      await fetchPage(query ? 'SEARCH' : 'POPULAR', query.trim(), 1, false);
    },
    async loadMore() {
      if (!state.hasNextPage || state.loadingMore) {
        return;
      }

      await fetchPage(state.type, state.query, state.page + 1, true);
    },
    async toggleLibrary(manga) {
      patch({ actionError: false });

      try {
        await repository.setLibrary([manga.id], !manga.inLibrary);
        patch({
          mangas: state.mangas.map((item) =>
            item.id === manga.id ? { ...item, inLibrary: !manga.inLibrary } : item,
          ),
        });
      } catch {
        patch({ actionError: true });
      }
    },
  };
}

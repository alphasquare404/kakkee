import type { DownloadQueue } from './downloadRepository';
import type { DownloadRepository } from './downloadRepository';

export interface DownloadStateView {
  readonly queue: DownloadQueue | null;
  readonly isLoading: boolean;
  readonly error: unknown | null;
  readonly isActing: boolean;
  readonly actionError: unknown | null;
}

export interface DownloadController {
  getState(): DownloadStateView;
  subscribe(listener: (state: DownloadStateView) => void): () => void;
  load(): Promise<void>;
  togglePaused(): Promise<void>;
  dequeue(chapterId: number): Promise<void>;
  deleteDownloaded(chapterId: number): Promise<void>;
}

export function createDownloadController(
  repository: DownloadRepository,
): DownloadController {
  let state: DownloadStateView = {
    queue: null,
    isLoading: false,
    error: null,
    isActing: false,
    actionError: null,
  };
  let generation = 0;
  const listeners = new Set<(state: DownloadStateView) => void>();

  function setState(next: DownloadStateView): void {
    state = next;

    for (const listener of [...listeners]) {
      listener(state);
    }
  }

  function patch(next: Partial<DownloadStateView>): void {
    setState({ ...state, ...next });
  }

  async function load(): Promise<void> {
    const current = ++generation;
    patch({ isLoading: true, error: null });

    try {
      const queue = await repository.getQueue();

      if (current !== generation) {
        return;
      }

      patch({ queue, isLoading: false, error: null });
    } catch (error) {
      if (current !== generation) {
        return;
      }

      patch({ isLoading: false, error });
    }
  }

  async function action(task: () => Promise<void>): Promise<void> {
    patch({ isActing: true, actionError: null });

    try {
      await task();
      await load();
      patch({ isActing: false, actionError: null });
    } catch (error) {
      patch({ isActing: false, actionError: error });
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
    togglePaused: () =>
      action(() => repository.setPaused(state.queue?.state !== 'STOPPED')),
    dequeue: (chapterId) => action(() => repository.dequeue(chapterId)),
    deleteDownloaded: (chapterId) =>
      action(() => repository.deleteDownloaded(chapterId)),
  };
}

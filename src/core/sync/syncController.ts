import type {
  EditableSyncSettings,
  SyncRepository,
  SyncResult,
  SyncSettings,
} from './syncRepository';

export type SyncStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface SyncState {
  readonly status: SyncStatus;
  readonly settings: SyncSettings | null;
  readonly busy: boolean;
  readonly result: SyncResult | null;
  readonly error: boolean;
}

export interface SyncController {
  getState(): SyncState;
  subscribe(listener: () => void): () => void;
  load(): Promise<void>;
  update(patch: Partial<EditableSyncSettings>): Promise<void>;
  start(): Promise<void>;
}

export function createSyncController(repository: SyncRepository): SyncController {
  let state: SyncState = {
    status: 'idle',
    settings: null,
    busy: false,
    result: null,
    error: false,
  };
  const listeners = new Set<() => void>();

  const notify = () => {
    for (const listener of [...listeners]) {
      listener();
    }
  };

  const patch = (next: Partial<SyncState>) => {
    state = { ...state, ...next };
    notify();
  };

  async function load(): Promise<void> {
    patch({ status: 'loading', error: false });

    try {
      const settings = await repository.getSettings();
      patch({ status: 'ready', settings });
    } catch {
      patch({ status: 'error', error: true });
    }
  }

  async function update(next: Partial<EditableSyncSettings>): Promise<void> {
    if (!state.settings) {
      return;
    }

    patch({ busy: true, error: false });

    try {
      await repository.update(next);
      patch({ settings: { ...state.settings, ...next }, busy: false });
    } catch {
      patch({ busy: false, error: true });
    }
  }

  async function start(): Promise<void> {
    patch({ busy: true, error: false, result: null });

    try {
      const result = await repository.start();
      patch({ busy: false, result });
    } catch {
      patch({ busy: false, error: true });
    }
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load,
    update,
    start,
  };
}

import type { PartialBackupFlagsInput } from '../graphql/generated/graphql';
import type { BackupRepository, BackupSettings } from './backupRepository';

export type BackupStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface BackupState {
  readonly status: BackupStatus;
  readonly settings: BackupSettings | null;
  readonly creating: boolean;
  readonly createdUrl: string | null;
  readonly restoring: boolean;
  readonly restoredId: string | null;
  readonly error: boolean;
  readonly lastAction: 'create' | 'restore' | null;
}

export interface BackupController {
  getState(): BackupState;
  subscribe(listener: () => void): () => void;
  load(): Promise<void>;
  create(flags: PartialBackupFlagsInput): Promise<void>;
  restore(file: File, flags: PartialBackupFlagsInput): Promise<void>;
}

export function createBackupController(
  repository: BackupRepository,
): BackupController {
  let state: BackupState = {
    status: 'idle',
    settings: null,
    creating: false,
    createdUrl: null,
    restoring: false,
    restoredId: null,
    error: false,
    lastAction: null,
  };
  const listeners = new Set<() => void>();

  const patch = (next: Partial<BackupState>) => {
    state = { ...state, ...next };
    notify();
  };

  const notify = () => {
    for (const listener of [...listeners]) {
      listener();
    }
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

  async function create(flags: PartialBackupFlagsInput): Promise<void> {
    patch({ creating: true, error: false, createdUrl: null, lastAction: 'create' });

    try {
      const url = await repository.create(flags);
      patch({ creating: false, createdUrl: url });
    } catch {
      patch({ creating: false, error: true });
    }
  }

  async function restore(
    file: File,
    flags: PartialBackupFlagsInput,
  ): Promise<void> {
    patch({ restoring: true, error: false, restoredId: null, lastAction: 'restore' });

    try {
      const id = await repository.restore(file, flags);
      patch({ restoring: false, restoredId: id });
    } catch {
      patch({ restoring: false, error: true });
    }
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load,
    create,
    restore,
  };
}

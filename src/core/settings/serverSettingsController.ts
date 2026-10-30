import type {
  EditableServerSettings,
  ServerSettings,
  ServerSettingsRepository,
} from './serverSettingsRepository';

export type ServerSettingsLoadState = 'idle' | 'loading' | 'ready' | 'error';

export interface ServerSettingsState {
  readonly status: ServerSettingsLoadState;
  readonly settings: ServerSettings | null;
  readonly saving: boolean;
  readonly saveError: boolean;
}

export interface ServerSettingsController {
  getState(): ServerSettingsState;
  subscribe(listener: () => void): () => void;
  load(): Promise<void>;
  retry(): Promise<void>;
  update(patch: Partial<EditableServerSettings>): Promise<void>;
}

export function createServerSettingsController(
  repository: ServerSettingsRepository,
): ServerSettingsController {
  let state: ServerSettingsState = {
    status: 'idle',
    settings: null,
    saving: false,
    saveError: false,
  };
  const listeners = new Set<() => void>();

  const notify = () => {
    for (const listener of [...listeners]) {
      listener();
    }
  };

  const patch = (next: Partial<ServerSettingsState>) => {
    state = { ...state, ...next };
    notify();
  };

  async function load(): Promise<void> {
    patch({ status: 'loading' });

    try {
      const settings = await repository.getSettings();

      patch({ status: 'ready', settings });
    } catch {
      patch({ status: 'error' });
    }
  }

  async function update(
    next: Partial<EditableServerSettings>,
  ): Promise<void> {
    if (!state.settings) {
      return;
    }

    patch({ saving: true, saveError: false });

    try {
      const saved = await repository.updateSettings(next);
      patch({
        settings: { ...state.settings, ...saved },
        saving: false,
      });
    } catch {
      patch({ saving: false, saveError: true });
    }
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load,
    retry: load,
    update,
  };
}

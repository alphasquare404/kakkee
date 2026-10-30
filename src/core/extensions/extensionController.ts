import type { UpdateExtensionPatchInput } from '../graphql/generated/graphql';
import type {
  Extension,
  ExtensionRepository,
  ExtensionStore,
} from './extensionRepository';

export type ExtensionStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ExtensionState {
  readonly status: ExtensionStatus;
  readonly items: readonly Extension[];
  readonly stores: readonly ExtensionStore[];
  readonly busyPkg: string | null;
  readonly refreshing: boolean;
  readonly storeBusy: string | null;
  readonly actionError: boolean;
}

export interface ExtensionController {
  getState(): ExtensionState;
  subscribe(listener: () => void): () => void;
  load(): Promise<void>;
  refresh(): Promise<void>;
  update(pkgName: string, patch: UpdateExtensionPatchInput): Promise<void>;
  addStore(indexUrl: string): Promise<void>;
  removeStore(indexUrl: string): Promise<void>;
}

export function createExtensionController(
  repository: ExtensionRepository,
): ExtensionController {
  let state: ExtensionState = {
    status: 'idle',
    items: [],
    stores: [],
    busyPkg: null,
    refreshing: false,
    storeBusy: null,
    actionError: false,
  };
  const listeners = new Set<() => void>();

  const notify = () => {
    for (const listener of [...listeners]) {
      listener();
    }
  };

  const patch = (next: Partial<ExtensionState>) => {
    state = { ...state, ...next };
    notify();
  };

  async function load(): Promise<void> {
    patch({ status: 'loading' });

    try {
      const items = await repository.getExtensions();
      patch({ status: 'ready', items });
    } catch {
      patch({ status: 'error' });
    }
  }

  async function refresh(): Promise<void> {
    patch({ refreshing: true, actionError: false });

    try {
      const result = await repository.refresh();
      patch({
        items: result.extensions,
        stores: result.stores,
        status: 'ready',
        refreshing: false,
      });
    } catch {
      patch({ refreshing: false, actionError: true });
    }
  }

  async function update(
    pkgName: string,
    next: UpdateExtensionPatchInput,
  ): Promise<void> {
    patch({ busyPkg: pkgName, actionError: false });

    try {
      const updated = await repository.update(pkgName, next);
      const byPkg = new Map(updated.map((extension) => [extension.pkgName, extension]));

      patch({
        items: state.items.map((extension) => {
          const change = byPkg.get(extension.pkgName);

          return change ? { ...extension, ...change } : extension;
        }),
        busyPkg: null,
      });
    } catch {
      patch({ busyPkg: null, actionError: true });
    }
  }

  async function addStore(indexUrl: string): Promise<void> {
    patch({ storeBusy: indexUrl, actionError: false });

    try {
      const store = await repository.addStore(indexUrl);
      patch({
        stores: [
          ...state.stores.filter((item) => item.indexUrl !== store.indexUrl),
          store,
        ],
        storeBusy: null,
      });
    } catch {
      patch({ storeBusy: null, actionError: true });
    }
  }

  async function removeStore(indexUrl: string): Promise<void> {
    patch({ storeBusy: indexUrl, actionError: false });

    try {
      await repository.removeStore(indexUrl);
      patch({
        stores: state.stores.filter((store) => store.indexUrl !== indexUrl),
        storeBusy: null,
      });
    } catch {
      patch({ storeBusy: null, actionError: true });
    }
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load,
    refresh,
    update,
    addStore,
    removeStore,
  };
}

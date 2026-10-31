import type { Category, CategoryRepository } from './categoryRepository';

export type CategoryLoadState = 'idle' | 'loading' | 'ready' | 'error';

export interface CategoryState {
  readonly status: CategoryLoadState;
  readonly items: readonly Category[];
  readonly busy: boolean;
  readonly actionError: boolean;
}

export interface CategoryController {
  getState(): CategoryState;
  subscribe(listener: () => void): () => void;
  load(): Promise<void>;
  retry(): Promise<void>;
  create(name: string): Promise<boolean>;
  rename(id: number, name: string): Promise<boolean>;
  remove(id: number): Promise<boolean>;
  move(id: number, position: number): Promise<boolean>;
  setFlags(
    id: number,
    flags: Partial<{
      includeInUpdate: 'INCLUDE' | 'EXCLUDE';
      includeInDownload: 'INCLUDE' | 'EXCLUDE';
    }>,
  ): Promise<boolean>;
}

export function createCategoryController(
  repository: CategoryRepository,
): CategoryController {
  let state: CategoryState = {
    status: 'idle',
    items: [],
    busy: false,
    actionError: false,
  };
  const listeners = new Set<() => void>();

  const notify = () => {
    for (const listener of [...listeners]) {
      listener();
    }
  };

  const patch = (next: Partial<CategoryState>) => {
    state = { ...state, ...next };
    notify();
  };

  async function load(): Promise<void> {
    patch({ status: 'loading' });

    try {
      const items = await repository.getCategories();
      patch({ status: 'ready', items });
    } catch {
      patch({ status: 'error' });
    }
  }

  async function run(action: () => Promise<void>): Promise<boolean> {
    patch({ busy: true, actionError: false });

    try {
      await action();
      await load();
      patch({ busy: false });
      return true;
    } catch {
      patch({ busy: false, actionError: true });
      return false;
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
    async create(name) {
      return run(async () => {
        await repository.createCategory(name);
      });
    },
    async rename(id, name) {
      return run(async () => {
        await repository.renameCategory(id, name);
      });
    },
    async remove(id) {
      return run(async () => {
        await repository.deleteCategory(id);
      });
    },
    async move(id, position) {
      return run(async () => {
        await repository.moveCategory(id, position);
      });
    },
    async setFlags(id, flags) {
      return run(async () => {
        await repository.setCategoryFlags(id, flags);
      });
    },
  };
}

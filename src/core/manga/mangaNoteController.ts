import type { MangaNoteRepository } from './mangaNoteRepository';

export type MangaNoteStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface MangaNoteState {
  readonly status: MangaNoteStatus;
  readonly value: string;
  readonly saving: boolean;
  readonly error: boolean;
}

export interface MangaNoteController {
  getState(): MangaNoteState;
  subscribe(listener: () => void): () => void;
  load(mangaId: number): Promise<void>;
  save(mangaId: number, value: string): Promise<void>;
  remove(mangaId: number): Promise<void>;
}

export function createMangaNoteController(
  repository: MangaNoteRepository,
): MangaNoteController {
  let state: MangaNoteState = {
    status: 'idle',
    value: '',
    saving: false,
    error: false,
  };
  const listeners = new Set<() => void>();

  const patch = (next: Partial<MangaNoteState>) => {
    state = { ...state, ...next };
    notify();
  };

  const notify = () => {
    for (const listener of [...listeners]) {
      listener();
    }
  };

  async function load(mangaId: number): Promise<void> {
    patch({ status: 'loading', error: false });

    try {
      const value = await repository.getNote(mangaId);
      patch({ status: 'ready', value });
    } catch {
      patch({ status: 'error', error: true });
    }
  }

  async function save(mangaId: number, value: string): Promise<void> {
    patch({ saving: true, error: false });

    try {
      const saved = await repository.save(mangaId, value);
      patch({ value: saved, saving: false });
    } catch {
      patch({ saving: false, error: true });
    }
  }

  async function remove(mangaId: number): Promise<void> {
    patch({ saving: true, error: false });

    try {
      await repository.remove(mangaId);
      patch({ value: '', saving: false });
    } catch {
      patch({ saving: false, error: true });
    }
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load,
    save,
    remove,
  };
}

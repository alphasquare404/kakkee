import type { UpdateTrackInput } from '../graphql/generated/graphql';
import type {
  MangaTrackingRepository,
  TrackRecord,
} from './mangaTrackingRepository';

export type MangaTrackingStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface MangaTrackingState {
  readonly status: MangaTrackingStatus;
  readonly records: readonly TrackRecord[];
  readonly busyId: number | null;
  readonly error: boolean;
}

export interface MangaTrackingController {
  getState(): MangaTrackingState;
  subscribe(listener: () => void): () => void;
  load(mangaId: number): Promise<void>;
  unbind(recordId: number): Promise<void>;
  update(
    recordId: number,
    patch: Omit<UpdateTrackInput, 'recordId'>,
  ): Promise<void>;
}

export function createMangaTrackingController(
  repository: MangaTrackingRepository,
): MangaTrackingController {
  let state: MangaTrackingState = {
    status: 'idle',
    records: [],
    busyId: null,
    error: false,
  };
  const listeners = new Set<() => void>();

  const patch = (next: Partial<MangaTrackingState>) => {
    state = { ...state, ...next };
    notify();
  };

  const notify = () => {
    for (const listener of [...listeners]) {
      listener();
    }
  };

  async function load(nextMangaId: number): Promise<void> {
    patch({ status: 'loading', error: false });

    try {
      const records = await repository.getRecords(nextMangaId);
      patch({ status: 'ready', records });
    } catch {
      patch({ status: 'error', error: true });
    }
  }

  async function unbind(recordId: number): Promise<void> {
    patch({ busyId: recordId, error: false });

    try {
      await repository.unbind(recordId);
      patch({
        records: state.records.filter((record) => record.id !== recordId),
        busyId: null,
      });
    } catch {
      patch({ busyId: null, error: true });
    }
  }

  async function update(
    recordId: number,
    next: Omit<UpdateTrackInput, 'recordId'>,
  ): Promise<void> {
    patch({ busyId: recordId, error: false });

    try {
      const updated = await repository.update(next, recordId);
      patch({
        records: state.records.map((record) =>
          record.id === recordId ? { ...record, ...updated } : record,
        ),
        busyId: null,
      });
    } catch {
      patch({ busyId: null, error: true });
    }
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load,
    unbind,
    update,
  };
}

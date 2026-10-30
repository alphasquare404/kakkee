import type { UpdateTrackInput } from '../graphql/generated/graphql';
import type {
  MangaTrackingRepository,
  TrackRecord,
  TrackSearch,
  Tracker,
} from './mangaTrackingRepository';

export type MangaTrackingStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface MangaTrackingState {
  readonly status: MangaTrackingStatus;
  readonly records: readonly TrackRecord[];
  readonly trackers: readonly Tracker[];
  readonly searchResults: readonly TrackSearch[];
  readonly searching: boolean;
  readonly syncing: boolean;
  readonly busyId: number | null;
  readonly error: boolean;
}

export interface MangaTrackingController {
  getState(): MangaTrackingState;
  subscribe(listener: () => void): () => void;
  load(mangaId: number): Promise<void>;
  search(trackerId: number, query: string): Promise<void>;
  bind(
    trackerId: number,
    remoteId: string,
    isPrivate: boolean,
  ): Promise<void>;
  syncProgress(): Promise<void>;
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
    trackers: [],
    searchResults: [],
    searching: false,
    syncing: false,
    busyId: null,
    error: false,
  };
  let activeMangaId = 0;
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
    activeMangaId = nextMangaId;
    patch({ status: 'loading', error: false });

    try {
      const [records, trackers] = await Promise.all([
        repository.getRecords(nextMangaId),
        repository.getTrackers(),
      ]);
      patch({ status: 'ready', records, trackers });
    } catch {
      patch({ status: 'error', error: true });
    }
  }

  async function search(trackerId: number, query: string): Promise<void> {
    patch({ searching: true, error: false, searchResults: [] });

    try {
      const searchResults = await repository.search(trackerId, query);
      patch({ searching: false, searchResults });
    } catch {
      patch({ searching: false, error: true });
    }
  }

  async function bind(
    trackerId: number,
    remoteId: string,
    isPrivate: boolean,
  ): Promise<void> {
    if (!activeMangaId) {
      return;
    }

    patch({ busyId: trackerId, error: false });

    try {
      const record = await repository.bind({
        mangaId: activeMangaId,
        trackerId,
        remoteId,
        ...(isPrivate ? { private: true } : {}),
      });

      patch({
        records: [
          ...state.records.filter((item) => item.trackerId !== trackerId),
          record,
        ],
        searchResults: [],
        busyId: null,
      });
    } catch {
      patch({ busyId: null, error: true });
    }
  }

  async function syncProgress(): Promise<void> {
    if (!activeMangaId) {
      return;
    }

    patch({ syncing: true, error: false });

    try {
      const records = await repository.syncProgress(activeMangaId);
      patch({ records, syncing: false });
    } catch {
      patch({ syncing: false, error: true });
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
    search,
    bind,
    syncProgress,
    unbind,
    update,
  };
}

import type { Tracker, TrackingRepository } from './trackingRepository';

export type TrackingStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface TrackingState {
  readonly status: TrackingStatus;
  readonly items: readonly Tracker[];
  readonly busyId: number | null;
  readonly error: boolean;
}

export interface TrackingController {
  getState(): TrackingState;
  subscribe(listener: () => void): () => void;
  load(): Promise<void>;
  logout(trackerId: number): Promise<void>;
}

export function createTrackingController(
  repository: TrackingRepository,
): TrackingController {
  let state: TrackingState = {
    status: 'idle',
    items: [],
    busyId: null,
    error: false,
  };
  const listeners = new Set<() => void>();

  const patch = (next: Partial<TrackingState>) => {
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
      const items = await repository.getTrackers();
      patch({ status: 'ready', items });
    } catch {
      patch({ status: 'error', error: true });
    }
  }

  async function logout(trackerId: number): Promise<void> {
    patch({ busyId: trackerId, error: false });

    try {
      await repository.logout(trackerId);
      patch({
        items: state.items.map((tracker) =>
          tracker.id === trackerId ? { ...tracker, isLoggedIn: false } : tracker,
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
    logout,
  };
}

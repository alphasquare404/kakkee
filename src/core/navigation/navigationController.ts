import type { NavigationBadges } from './navigationRepository';

export interface NavigationController {
  getState(): NavigationBadges;
  subscribe(listener: () => void): () => void;
  load(): Promise<void>;
}

const EMPTY: NavigationBadges = { downloads: 0, extensionUpdates: 0 };

export function createNavigationController(
  repository: { getBadges(): Promise<NavigationBadges> },
): NavigationController {
  let state: NavigationBadges = EMPTY;
  const listeners = new Set<() => void>();

  const notify = () => {
    for (const listener of [...listeners]) {
      listener();
    }
  };

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async load() {
      try {
        state = await repository.getBadges();
        notify();
      } catch {
        // Navigation badges are optional; keep the last known values.
      }
    },
  };
}

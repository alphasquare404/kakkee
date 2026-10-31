const STORAGE_KEY = 'suwayomi.tracking-preferences.v1';

let snapshot: { readonly autoSync: boolean } = { autoSync: load() };
const listeners = new Set<() => void>();

function load(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function notify(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}

export function getTrackingPreferences(): { readonly autoSync: boolean } {
  return snapshot;
}

export function subscribeTrackingPreferences(listener: () => void): () => void {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function setAutoSyncTracking(value: boolean): void {
  snapshot = { autoSync: value };

  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // Keep the in-memory setting.
  }

  notify();
}

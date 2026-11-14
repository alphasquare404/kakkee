export interface HistoryPreferences {
  readonly hideRead: boolean;
  readonly showHiddenHistory: boolean;
}

export const DEFAULT_HISTORY_PREFERENCES: HistoryPreferences = {
  hideRead: false,
  showHiddenHistory: false,
};

const STORAGE_KEY = 'suwayomi.history-preferences.v1';

let state: HistoryPreferences = load();
const listeners = new Set<() => void>();

function load(): HistoryPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_HISTORY_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<HistoryPreferences>;

    return {
      hideRead: parsed.hideRead === true,
      showHiddenHistory: parsed.showHiddenHistory === true,
    };
  } catch {
    return DEFAULT_HISTORY_PREFERENCES;
  }
}

function persist(next: HistoryPreferences): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Keep in memory if storage is unavailable.
  }
}

function notify(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}

export function getHistoryPreferences(): HistoryPreferences {
  return state;
}

export function subscribeHistoryPreferences(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function updateHistoryPreferences(next: Partial<HistoryPreferences>): void {
  state = {
    hideRead:
      typeof next.hideRead === 'boolean' ? next.hideRead : state.hideRead,
    showHiddenHistory:
      typeof next.showHiddenHistory === 'boolean'
        ? next.showHiddenHistory
        : state.showHiddenHistory,
  };
  persist(state);
  notify();
}

export function resetHistoryPreferences(): void {
  state = DEFAULT_HISTORY_PREFERENCES;
  persist(state);
  notify();
}

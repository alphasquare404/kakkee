const STORAGE_KEY = 'suwayomi.library-search-history.v1';
const MAX_ITEMS = 8;

let state: readonly string[] = load();
const listeners = new Set<() => void>();

function load(): readonly string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string').slice(0, MAX_ITEMS)
      : [];
  } catch {
    return [];
  }
}

function persist(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Keep in memory if storage is unavailable.
  }
}

function notify(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}

export function getSearchHistory(): readonly string[] {
  return state;
}

export function subscribeSearchHistory(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function addSearchHistory(query: string): void {
  const value = query.trim();

  if (!value) {
    return;
  }

  state = [value, ...state.filter((item) => item !== value)].slice(0, MAX_ITEMS);
  persist();
  notify();
}

export function clearSearchHistory(): void {
  state = [];
  persist();
  notify();
}

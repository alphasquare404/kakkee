const STORAGE_KEY = 'suwayomi.source-search-history.v1';
const MAX_ITEMS = 8;
const EMPTY: readonly string[] = [];

let state: Record<string, string[]> = load();
const listeners = new Set<() => void>();

function load(): Record<string, string[]> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    const result: Record<string, string[]> = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (Array.isArray(value)) {
        result[key] = value
          .filter((item): item is string => typeof item === 'string')
          .slice(0, MAX_ITEMS);
      }
    }

    return result;
  } catch {
    return {};
  }
}

function persist(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // History remains in memory.
  }
}

function notify(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}

export function getSourceSearchHistory(sourceId: string): readonly string[] {
  return state[sourceId] ?? EMPTY;
}

export function subscribeSourceSearchHistory(listener: () => void): () => void {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function addSourceSearch(sourceId: string, query: string): void {
  const value = query.trim();

  if (!value) {
    return;
  }

  state = {
    ...state,
    [sourceId]: [
      value,
      ...(state[sourceId] ?? []).filter((item) => item !== value),
    ].slice(0, MAX_ITEMS),
  };
  persist();
  notify();
}

export function clearSourceSearchHistory(sourceId: string): void {
  const next = { ...state };
  delete next[sourceId];
  state = next;
  persist();
  notify();
}

const STORAGE_KEY = 'suwayomi.hidden-history.v1';

let hidden = load();
const listeners = new Set<() => void>();

function load(): ReadonlySet<number> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((value): value is number => Number.isInteger(value))
        : [],
    );
  } catch {
    return new Set();
  }
}

function persist(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...hidden]));
  } catch {
    // Keep the in-memory set when storage is unavailable.
  }
}

function notify(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}

export function getHiddenHistoryMangaIds(): ReadonlySet<number> {
  return hidden;
}

export function subscribeHiddenHistory(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function hideHistoryManga(mangaId: number): void {
  if (hidden.has(mangaId)) {
    return;
  }

  hidden = new Set([...hidden, mangaId]);
  persist();
  notify();
}

export function replaceHiddenHistoryMangaIds(mangaIds: readonly number[]): void {
  hidden = new Set(
    mangaIds.filter(
      (value): value is number => Number.isSafeInteger(value) && value > 0,
    ),
  );
  persist();
  notify();
}

export function clearHiddenHistory(): void {
  hidden = new Set();
  persist();
  notify();
}

import type { ReaderMode } from './readerSettings';

const STORAGE_KEY = 'suwayomi.manga-reader-overrides.v1';
const listeners = new Set<() => void>();

let state: Record<string, ReaderMode> = load();

function load(): Record<string, ReaderMode> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    const result: Record<string, ReaderMode> = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (
        value === 'vertical' ||
        value === 'webtoon' ||
        value === 'single' ||
        value === 'double' ||
        value === 'horizontal'
      ) {
        result[key] = value;
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
    // Keep overrides in memory.
  }
}

function notify(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}

export function getMangaReaderMode(mangaId: number): ReaderMode | null {
  return state[String(mangaId)] ?? null;
}

export function setMangaReaderMode(
  mangaId: number,
  mode: ReaderMode | null,
): void {
  if (mode === null) {
    delete state[String(mangaId)];
  } else {
    state = { ...state, [String(mangaId)]: mode };
  }

  persist();
  notify();
}

export function subscribeMangaReaderOverrides(listener: () => void): () => void {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

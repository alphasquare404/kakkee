import type { MangaChapterOrder } from '../manga/mangaRepository';

export type ChapterFilter =
  | 'all'
  | 'unread'
  | 'read'
  | 'downloaded'
  | 'bookmarked';

export interface ChapterViewPreferences {
  readonly order: MangaChapterOrder;
  readonly filter: ChapterFilter;
  readonly scanlator: string;
  readonly hideDuplicates: boolean;
}

const STORAGE_KEY = 'suwayomi.chapter-view-preferences.v1';
const listeners = new Set<() => void>();
let state = load();

function load(): Record<string, ChapterViewPreferences> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    const result: Record<string, ChapterViewPreferences> = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value !== 'object' || value === null) {
        continue;
      }

      const item = value as Partial<ChapterViewPreferences>;

      result[key] = {
        order: item.order === 'oldest' ? 'oldest' : 'newest',
        filter:
          item.filter === 'unread' ||
          item.filter === 'read' ||
          item.filter === 'downloaded' ||
          item.filter === 'bookmarked'
            ? item.filter
            : 'all',
        scanlator: typeof item.scanlator === 'string' ? item.scanlator : 'all',
        hideDuplicates: item.hideDuplicates === true,
      };
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
    // Preferences remain in memory.
  }
}

function notify(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}

export function getChapterViewPreferences(
  mangaId: number,
): ChapterViewPreferences | null {
  return state[String(mangaId)] ?? null;
}

export function saveChapterViewPreferences(
  mangaId: number,
  preferences: ChapterViewPreferences,
): void {
  state = { ...state, [String(mangaId)]: preferences };
  persist();
  notify();
}

export function subscribeChapterViewPreferences(listener: () => void): () => void {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function clearChapterViewPreferences(): void {
  state = {};
  persist();
  notify();
}

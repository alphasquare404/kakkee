import { useSyncExternalStore } from 'react';

export interface NsfwPreferences {
  readonly hideNsfw: boolean;
  readonly mangaIds: readonly number[];
  readonly categoryIdsByManga: Readonly<Record<number, readonly number[]>>;
  readonly removedAutoMangaIds: readonly number[];
}

export const DEFAULT_NSFW_PREFERENCES: NsfwPreferences = {
  hideNsfw: false,
  mangaIds: [],
  categoryIdsByManga: {},
  removedAutoMangaIds: [],
};

const STORAGE_KEY = 'suwayomi.nsfw-preferences.v1';
const listeners = new Set<() => void>();

function load(): NsfwPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_NSFW_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<NsfwPreferences>;

    const categoryIdsByManga: Record<number, readonly number[]> = {};

    if (
      parsed.categoryIdsByManga &&
      typeof parsed.categoryIdsByManga === 'object'
    ) {
      for (const [key, value] of Object.entries(parsed.categoryIdsByManga)) {
        const mangaId = Number(key);

        if (!Number.isInteger(mangaId) || mangaId <= 0 || !Array.isArray(value)) {
          continue;
        }

        categoryIdsByManga[mangaId] = value.filter(
          (categoryId): categoryId is number =>
            Number.isInteger(categoryId) && categoryId >= 0,
        );
      }
    }

    return {
      hideNsfw: parsed.hideNsfw === true,
      mangaIds: Array.isArray(parsed.mangaIds)
        ? parsed.mangaIds.filter(
            (value): value is number => Number.isInteger(value) && value > 0,
          )
        : [],
      categoryIdsByManga,
      removedAutoMangaIds: Array.isArray(parsed.removedAutoMangaIds)
        ? parsed.removedAutoMangaIds.filter(
            (value): value is number => Number.isInteger(value) && value > 0,
          )
        : [],
    };
  } catch {
    return DEFAULT_NSFW_PREFERENCES;
  }
}

let state = load();

function persist(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Keep the in-memory state when storage is unavailable.
  }
}

function notify(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}

export function getNsfwPreferences(): NsfwPreferences {
  return state;
}

export function updateNsfwPreferences(
  next: Partial<NsfwPreferences>,
): void {
  state = {
    hideNsfw:
      typeof next.hideNsfw === 'boolean' ? next.hideNsfw : state.hideNsfw,
    mangaIds: Array.isArray(next.mangaIds)
      ? next.mangaIds.filter(
          (value): value is number => Number.isInteger(value) && value > 0,
        )
      : state.mangaIds,
    categoryIdsByManga:
      next.categoryIdsByManga ?? state.categoryIdsByManga,
    removedAutoMangaIds:
      next.removedAutoMangaIds ?? state.removedAutoMangaIds,
  };
  persist();
  notify();
}

export function isMangaNsfw(mangaId: number): boolean {
  return state.mangaIds.includes(mangaId);
}

export function toggleMangaNsfw(
  mangaId: number,
  categoryIds: readonly number[] = [],
): void {
  const hasLabel = state.mangaIds.includes(mangaId);
  const categoryIdsByManga = { ...state.categoryIdsByManga };

  if (hasLabel) {
    delete categoryIdsByManga[mangaId];
  } else if (categoryIds.length > 0) {
    categoryIdsByManga[mangaId] = [...new Set(categoryIds)];
  }

  updateNsfwPreferences({
    mangaIds: hasLabel
      ? state.mangaIds.filter((id) => id !== mangaId)
      : [...state.mangaIds, mangaId],
    categoryIdsByManga,
    removedAutoMangaIds: hasLabel
      ? [...new Set([...state.removedAutoMangaIds, mangaId])]
      : state.removedAutoMangaIds.filter((id) => id !== mangaId),
  });
}

export function autoLabelMangas(mangaIds: readonly number[]): void {
  const candidates = mangaIds.filter(
    (mangaId) =>
      Number.isInteger(mangaId) &&
      mangaId > 0 &&
      !state.mangaIds.includes(mangaId) &&
      !state.removedAutoMangaIds.includes(mangaId),
  );

  if (candidates.length === 0) {
    return;
  }

  updateNsfwPreferences({
    mangaIds: [...state.mangaIds, ...candidates],
  });
}

export function hiddenNsfwCountForCategory(
  categoryId: number,
  preferences: NsfwPreferences,
): number {
  if (!preferences.hideNsfw) {
    return 0;
  }

  return preferences.mangaIds.filter((mangaId) =>
    preferences.categoryIdsByManga[mangaId]?.includes(categoryId),
  ).length;
}

export function resetNsfwPreferences(): void {
  state = DEFAULT_NSFW_PREFERENCES;
  persist();
  notify();
}

export function subscribeNsfwPreferences(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useNsfwPreferences(): NsfwPreferences {
  return useSyncExternalStore(
    subscribeNsfwPreferences,
    getNsfwPreferences,
    getNsfwPreferences,
  );
}

export function isHiddenByNsfw(
  mangaId: number,
  preferences: NsfwPreferences,
): boolean {
  return preferences.hideNsfw && preferences.mangaIds.includes(mangaId);
}

import { useSyncExternalStore } from 'react';

export interface NsfwPreferences {
  readonly hideNsfw: boolean;
  readonly mangaIds: readonly number[];
}

export const DEFAULT_NSFW_PREFERENCES: NsfwPreferences = {
  hideNsfw: false,
  mangaIds: [],
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

    return {
      hideNsfw: parsed.hideNsfw === true,
      mangaIds: Array.isArray(parsed.mangaIds)
        ? parsed.mangaIds.filter(
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
  };
  persist();
  notify();
}

export function isMangaNsfw(mangaId: number): boolean {
  return state.mangaIds.includes(mangaId);
}

export function toggleMangaNsfw(mangaId: number): void {
  updateNsfwPreferences({
    mangaIds: state.mangaIds.includes(mangaId)
      ? state.mangaIds.filter((id) => id !== mangaId)
      : [...state.mangaIds, mangaId],
  });
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

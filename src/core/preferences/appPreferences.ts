export type ThemeMode = 'dark' | 'pure-black';
export type LibraryDensity = 'compact' | 'comfortable';

export interface AppPreferences {
  readonly theme: ThemeMode;
  readonly libraryDensity: LibraryDensity;
}

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  theme: 'dark',
  libraryDensity: 'compact',
};

const STORAGE_KEY = 'suwayomi.app-preferences.v1';

let state: AppPreferences = load();
const listeners = new Set<() => void>();

function load(): AppPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_APP_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<AppPreferences>;

    return {
      theme: parsed.theme === 'pure-black' ? 'pure-black' : 'dark',
      libraryDensity:
        parsed.libraryDensity === 'comfortable' ? 'comfortable' : 'compact',
    };
  } catch {
    return DEFAULT_APP_PREFERENCES;
  }
}

function persist(next: AppPreferences): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Preferences remain in memory when storage is unavailable.
  }
}

function notify(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}

export function getAppPreferences(): AppPreferences {
  return state;
}

export function subscribeAppPreferences(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function updateAppPreferences(patch: Partial<AppPreferences>): void {
  state = {
    ...state,
    theme: patch.theme === 'pure-black' ? 'pure-black' : patch.theme === 'dark' ? 'dark' : state.theme,
    libraryDensity:
      patch.libraryDensity === 'comfortable'
        ? 'comfortable'
        : patch.libraryDensity === 'compact'
          ? 'compact'
          : state.libraryDensity,
  };
  persist(state);
  notify();
}

export function resetAppPreferences(): void {
  state = DEFAULT_APP_PREFERENCES;
  persist(state);
  notify();
}

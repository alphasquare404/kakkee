export type ThemeMode = 'dark' | 'pure-black';
export type LibraryDensity = 'compact' | 'comfortable';
export type LibraryView = 'grid' | 'list';
export type Locale = 'en' | 'id';

export interface AppPreferences {
  readonly theme: ThemeMode;
  readonly libraryDensity: LibraryDensity;
  readonly libraryView: LibraryView;
  readonly libraryBadges: boolean;
  readonly libraryContinue: boolean;
  readonly locale: Locale;
}

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  theme: 'dark',
  libraryDensity: 'compact',
  libraryView: 'grid',
  libraryBadges: true,
  libraryContinue: true,
  locale: 'en',
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
      libraryView: parsed.libraryView === 'list' ? 'list' : 'grid',
      libraryBadges: parsed.libraryBadges !== false,
      libraryContinue: parsed.libraryContinue !== false,
      locale: parsed.locale === 'id' ? 'id' : 'en',
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
    libraryView:
      patch.libraryView === 'list'
        ? 'list'
        : patch.libraryView === 'grid'
          ? 'grid'
          : state.libraryView,
    libraryBadges:
      typeof patch.libraryBadges === 'boolean'
        ? patch.libraryBadges
        : state.libraryBadges,
    libraryContinue:
      typeof patch.libraryContinue === 'boolean'
        ? patch.libraryContinue
        : state.libraryContinue,
    locale: patch.locale === 'id' ? 'id' : patch.locale === 'en' ? 'en' : state.locale,
  };
  persist(state);
  notify();
}

export function resetAppPreferences(): void {
  state = DEFAULT_APP_PREFERENCES;
  persist(state);
  notify();
}

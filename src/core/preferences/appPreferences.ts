export type ThemeMode = 'dark' | 'pure-black' | 'snow-white';
export type LibraryDensity = 'compact' | 'comfortable';
export type LibraryView = 'grid' | 'list';
export type Locale = 'en' | 'id';
export type DownloadTarget = 'server' | 'device';

export interface AppPreferences {
  readonly theme: ThemeMode;
  readonly libraryDensity: LibraryDensity;
  readonly libraryView: LibraryView;
  readonly libraryBadges: boolean;
  readonly accent: string;
  readonly locale: Locale;
  readonly downloadTarget: DownloadTarget;
}

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  theme: 'dark',
  libraryDensity: 'compact',
  libraryView: 'grid',
  libraryBadges: true,
  accent: '#f3332a',
  locale: 'en',
  downloadTarget: 'server',
};

function preferredTheme(): ThemeMode {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: light)').matches
  ) {
    return 'snow-white';
  }

  return 'pure-black';
}

function systemDefaultPreferences(): AppPreferences {
  return { ...DEFAULT_APP_PREFERENCES, theme: preferredTheme() };
}

const STORAGE_KEY = 'suwayomi.app-preferences.v1';

let state: AppPreferences = load();
const listeners = new Set<() => void>();

function load(): AppPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return systemDefaultPreferences();
    }

    const parsed = JSON.parse(raw) as Partial<AppPreferences>;

    return {
      theme:
        parsed.theme === 'pure-black'
          ? 'pure-black'
          : parsed.theme === 'snow-white'
            ? 'snow-white'
            : parsed.theme === 'dark'
              ? 'dark'
              : preferredTheme(),
      libraryDensity:
        parsed.libraryDensity === 'comfortable' ? 'comfortable' : 'compact',
      libraryView: parsed.libraryView === 'list' ? 'list' : 'grid',
      libraryBadges: parsed.libraryBadges !== false,
      accent:
        typeof parsed.accent === 'string' &&
        /^#[0-9a-f]{6}$/i.test(parsed.accent)
          ? parsed.accent === '#5b7cff'
            ? DEFAULT_APP_PREFERENCES.accent
            : parsed.accent
          : DEFAULT_APP_PREFERENCES.accent,
      locale: parsed.locale === 'id' ? 'id' : 'en',
      downloadTarget: parsed.downloadTarget === 'device' ? 'device' : 'server',
    };
  } catch {
    return systemDefaultPreferences();
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
    theme:
      patch.theme === 'pure-black'
        ? 'pure-black'
        : patch.theme === 'snow-white'
          ? 'snow-white'
          : patch.theme === 'dark'
            ? 'dark'
            : state.theme,
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
    accent:
      typeof patch.accent === 'string' && /^#[0-9a-f]{6}$/i.test(patch.accent)
        ? patch.accent
        : state.accent,
    locale: patch.locale === 'id' ? 'id' : patch.locale === 'en' ? 'en' : state.locale,
    downloadTarget:
      patch.downloadTarget === 'device'
        ? 'device'
        : patch.downloadTarget === 'server'
          ? 'server'
          : state.downloadTarget,
  };
  persist(state);
  notify();
}

export function resetAppPreferences(): void {
  state = DEFAULT_APP_PREFERENCES;
  persist(state);
  notify();
}

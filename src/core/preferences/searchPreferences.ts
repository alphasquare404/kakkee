const STORAGE_KEY = 'suwayomi.search-preferences.v1';
const listeners = new Set<() => void>();

export interface SearchPreferences {
  readonly languages: readonly string[];
  readonly allSources: boolean;
  readonly sourceIds: readonly string[];
}

const DEFAULTS: SearchPreferences = {
  languages: [],
  allSources: true,
  sourceIds: [],
};

let state = loadSearchPreferences();

export function loadSearchPreferences(): SearchPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULTS;
    }

    const parsed = JSON.parse(raw) as Partial<SearchPreferences>;

    return {
      languages: Array.isArray(parsed.languages)
        ? parsed.languages.filter(
            (value): value is string => typeof value === 'string',
          )
        : [],
      allSources: parsed.allSources !== false,
      sourceIds: Array.isArray(parsed.sourceIds)
        ? parsed.sourceIds.filter(
            (value): value is string => typeof value === 'string',
          )
        : [],
    };
  } catch {
    return DEFAULTS;
  }
}

function persist(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Keep the preferences in memory when storage is unavailable.
  }
}

function notify(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}

export function getSearchPreferences(): SearchPreferences {
  return state;
}

export function subscribeSearchPreferences(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updateSearchPreferences(
  patch: Partial<SearchPreferences>,
): void {
  state = { ...state, ...patch };
  persist();
  notify();
}

export function resetSearchPreferences(): void {
  state = DEFAULTS;
  persist();
  notify();
}


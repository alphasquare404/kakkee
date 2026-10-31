const STORAGE_KEY = 'suwayomi.source-preferences.v1';
const listeners = new Set<() => void>();

export interface SourcePreferences {
  readonly pinned: readonly string[];
  readonly lastSourceId: string | null;
  readonly language: string;
  readonly preferredLanguages: readonly string[];
  readonly showNsfw: boolean;
}

let state = load();

function load(): SourcePreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return {
        pinned: [],
        lastSourceId: null,
        language: 'all',
        preferredLanguages: [],
        showNsfw: false,
      };
    }

    const parsed = JSON.parse(raw) as Partial<SourcePreferences>;

    return {
      pinned: Array.isArray(parsed.pinned)
        ? parsed.pinned.filter((value): value is string => typeof value === 'string')
        : [],
      lastSourceId:
        typeof parsed.lastSourceId === 'string' ? parsed.lastSourceId : null,
      language: typeof parsed.language === 'string' ? parsed.language : 'all',
      preferredLanguages: Array.isArray(parsed.preferredLanguages)
        ? parsed.preferredLanguages.filter(
            (value): value is string => typeof value === 'string',
          )
        : [],
      showNsfw: parsed.showNsfw === true,
    };
  } catch {
    return {
      pinned: [],
      lastSourceId: null,
      language: 'all',
      preferredLanguages: [],
      showNsfw: false,
    };
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

export function getSourcePreferences(): SourcePreferences {
  return state;
}

export function subscribeSourcePreferences(listener: () => void): () => void {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function updateSourcePreferences(
  patch: Partial<SourcePreferences>,
): void {
  state = { ...state, ...patch };
  persist();
  notify();
}

export function togglePinnedSource(sourceId: string): void {
  state = {
    ...state,
    pinned: state.pinned.includes(sourceId)
      ? state.pinned.filter((id) => id !== sourceId)
      : [...state.pinned, sourceId],
  };
  persist();
  notify();
}

export function markSourceUsed(sourceId: string): void {
  state = { ...state, lastSourceId: sourceId };
  persist();
  notify();
}

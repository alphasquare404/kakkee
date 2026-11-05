import type {
  LibrarySort,
  LibrarySortField,
  LibrarySortDirection,
} from '../library/libraryRepository';

export interface LibraryPreferences {
  readonly status?: string;
  readonly statuses?: readonly string[];
  readonly categoryId: number | null;
  readonly hiddenCategoryIds: readonly number[];
  readonly showAllCategory: boolean;
  readonly sort: LibrarySort;
}

export const DEFAULT_LIBRARY_PREFERENCES: LibraryPreferences = {
  categoryId: null,
  hiddenCategoryIds: [],
  showAllCategory: true,
  sort: { field: 'dateAdded', direction: 'desc' },
};

const STORAGE_KEY = 'suwayomi.library-preferences.v1';
const SORT_FIELDS: readonly LibrarySortField[] = [
  'title',
  'dateAdded',
  'lastFetched',
  'id',
];
const SORT_DIRECTIONS: readonly LibrarySortDirection[] = ['asc', 'desc'];

let state: LibraryPreferences = load();
const listeners = new Set<() => void>();

function load(): LibraryPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_LIBRARY_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<LibraryPreferences>;
    const sort = parsed.sort;
    const field = sort && SORT_FIELDS.includes(sort.field) ? sort.field : 'dateAdded';
    const direction =
      sort && SORT_DIRECTIONS.includes(sort.direction) ? sort.direction : 'desc';

    return {
      status: typeof parsed.status === 'string' ? parsed.status : undefined,
      statuses: Array.isArray(parsed.statuses)
        ? parsed.statuses.filter(
            (value): value is string => typeof value === 'string',
          )
        : undefined,
      categoryId:
        typeof parsed.categoryId === 'number' && Number.isSafeInteger(parsed.categoryId)
          ? parsed.categoryId
          : null,
      hiddenCategoryIds: Array.isArray(parsed.hiddenCategoryIds)
        ? parsed.hiddenCategoryIds.filter(
            (value): value is number =>
              typeof value === 'number' && Number.isSafeInteger(value),
          )
        : [],
      showAllCategory: parsed.showAllCategory !== false,
      sort: { field, direction },
    };
  } catch {
    return DEFAULT_LIBRARY_PREFERENCES;
  }
}

function persist(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Keep in memory if storage is unavailable.
  }
}

function notify(): void {
  for (const listener of [...listeners]) {
    listener();
  }
}

export function getLibraryPreferences(): LibraryPreferences {
  return state;
}

export function subscribeLibraryPreferences(listener: () => void): () => void {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function updateLibraryPreferences(next: LibraryPreferences): void {
  state = {
    status: next.status,
    statuses: next.statuses,
    categoryId: next.categoryId,
    hiddenCategoryIds: [...next.hiddenCategoryIds],
    showAllCategory: next.showAllCategory,
    sort: next.sort,
  };
  persist();
  notify();
}

export function resetLibraryPreferences(): void {
  state = DEFAULT_LIBRARY_PREFERENCES;
  persist();
  notify();
}

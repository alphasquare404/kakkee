import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Link, Navigate } from 'react-router-dom';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  createLibraryController,
  type LibraryFilterCriteria,
  type LibraryController,
} from '../../core/library/libraryController';
import {
  createLibraryCategoryController,
  type LibraryCategoryController,
} from '../../core/library/libraryCategoryController';
import {
  createLibraryRepository,
  type LibraryCategory,
  type LibraryFilter,
  type LibraryManga,
  type LibrarySortDirection,
  type LibrarySortField,
} from '../../core/library/libraryRepository';
import { useConnection } from '../../app/useConnection';
import { useImageResource } from '../../shared/useImageResource';
import { AmbientArt } from '../../shared/AmbientArt';
import { useAppPreferences } from '../../shared/useAppPreferences';
import { updateAppPreferences } from '../../core/preferences/appPreferences';
import { useSearchHistory } from '../../shared/useSearchHistory';
import { addSearchHistory, clearSearchHistory } from '../../core/preferences/searchHistory';
import {
  getLibraryPreferences,
  updateLibraryPreferences,
} from '../../core/preferences/libraryPreferences';
import { LibraryMenu, type LibraryMenuGroup } from './LibraryMenu';
import { MangaCard, MangaCardSkeleton } from './MangaCard';
import { createCatalogRepository } from '../../core/catalog/catalogRepository';
import { LibrarySyncButton } from './LibrarySyncButton';
import { IconClose, IconFilter, IconSearch, IconSort } from './icons';

type LibraryStatus = NonNullable<LibraryFilter['status']>;
type OpenPanel = 'filter' | 'sort';

const SEARCH_FORM_ID = 'library-search-form';
const FILTER_MENU_ID = 'library-filter-menu';
const SORT_MENU_ID = 'library-sort-menu';

/** Empty value is the "no status refinement" choice; it is never sent to the server. */
const STATUS_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'LICENSED', label: 'Licensed' },
  { value: 'PUBLISHING_FINISHED', label: 'Publishing finished' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'ON_HIATUS', label: 'On hiatus' },
  { value: 'UNKNOWN', label: 'Unknown' },
];

const SORT_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'title', label: 'Title' },
  { value: 'dateAdded', label: 'Date added' },
  { value: 'lastFetched', label: 'Last fetched' },
  { value: 'id', label: 'ID' },
  { value: 'random', label: 'Random' },
];

const DIRECTION_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
];

function statusFilter(
  filter: LibraryFilterCriteria,
  status: LibraryStatus | null,
): LibraryFilterCriteria {
  return {
    ...(filter.search !== undefined ? { search: filter.search } : {}),
    ...(status !== null ? { status } : {}),
    ...(filter.sourceId !== undefined ? { sourceId: filter.sourceId } : {}),
  };
}

function hasNarrowingCriteria(
  filter: LibraryFilterCriteria,
  categoryId: number | null,
): boolean {
  return Boolean(
    filter.search?.trim() ||
      filter.status ||
      filter.sourceId ||
      categoryId !== null,
  );
}

function countLabel(totalCount: number, loading: boolean): string {
  if (loading) {
    return 'Loading…';
  }

  return `${totalCount.toLocaleString('en-US')} manga`;
}

function shuffled<T>(items: readonly T[], seed: number): readonly T[] {
  const result = [...items];
  let state = seed + 1;

  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0;
    const swapIndex = state % (index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function fuzzyMatch(title: string, query: string): boolean {  const haystack = title.toLowerCase();
  const needles = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (needles.length === 0) {
    return true;
  }

  if (needles.every((needle) => haystack.includes(needle))) {
    return true;
  }

  let position = 0;

  for (const character of haystack) {
    if (character === query.toLowerCase()[position]) {
      position += 1;

      if (position === query.length) {
        return true;
      }
    }
  }

  return false;
}

function duplicateKey(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

export function LibraryPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return <Navigate to="/" replace />;
  }

  return <ConnectedLibrary context={state.context} />;
}

function ConnectedLibrary({ context }: { readonly context: ConnectedContext }) {
  const repository = useMemo(
    () => createLibraryRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const savedPreferences = useRef(getLibraryPreferences()).current;
  const controller = useMemo(
    () =>
      createLibraryController({
        repository,
        initialFilter: {
          ...(savedPreferences.status
            ? { status: savedPreferences.status as LibraryStatus }
            : {}),
          ...(savedPreferences.statuses && savedPreferences.statuses.length > 0
            ? { statuses: savedPreferences.statuses as LibraryStatus[] }
            : {}),
        },
        initialSort: savedPreferences.sort,
        initialCategoryId: savedPreferences.categoryId,
      }),
    [repository, savedPreferences],
  );
  const categoryController = useMemo(
    () => createLibraryCategoryController({ repository }),
    [repository],
  );
  const library = useSyncExternalStore(controller.subscribe, controller.getState);
  const categories = useSyncExternalStore(
    categoryController.subscribe,
    categoryController.getState,
  );
  const ambient = useImageResource(
    context.resources,
    library.items[1]?.thumbnailUrl ?? library.items[0]?.thumbnailUrl ?? null,
  );
  const appPreferences = useAppPreferences();
  const searchHistory = useSearchHistory();
  const [historyOpen, setHistoryOpen] = useState(false);
  const loadedLibrary = useRef<LibraryController | null>(null);
  const loadedCategories = useRef<LibraryCategoryController | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const filterButton = useRef<HTMLButtonElement>(null);
  const sortButton = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchToggle = useRef<HTMLButtonElement>(null);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<OpenPanel | null>(null);
  const [randomOrder, setRandomOrder] = useState(false);
  const [randomSeed, setRandomSeed] = useState(0);
  const [fuzzy, setFuzzy] = useState(false);
  const [duplicatesOpen, setDuplicatesOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<
    'all' | 'unread' | 'started' | 'downloaded'
  >('all');
  const [sources, setSources] = useState<
    readonly { readonly id: string; readonly displayName: string }[]
  >([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [categoryChoice, setCategoryChoice] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [confirmDeleteDownloads, setConfirmDeleteDownloads] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkError, setBulkError] = useState(false);

  useEffect(() => {
    if (loadedLibrary.current !== controller) {
      loadedLibrary.current = controller;
      void controller.load();
    }

    if (loadedCategories.current !== categoryController) {
      loadedCategories.current = categoryController;
      void categoryController.load();
    }
  }, [controller, categoryController]);

  useEffect(() => {
    let active = true;
    const repository = createCatalogRepository({
      getClient: () => context.graphQL,
    });

    void repository
      .getSources()
      .then((result) => {
        if (active) {
          setSources(
            result.items.map((source) => ({
              id: source.id,
              displayName: source.displayName,
            })),
          );
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [context.graphQL]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    searchInput.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!openPanel) {
      return;
    }

    const handlePointer = (event: PointerEvent) => {
      if (!actionsRef.current?.contains(event.target as Node)) {
        setOpenPanel(null);
      }
    };

    document.addEventListener('pointerdown', handlePointer);

    return () => {
      document.removeEventListener('pointerdown', handlePointer);
    };
  }, [openPanel]);

  const closePanel = () => {
    const trigger = openPanel === 'sort' ? sortButton.current : filterButton.current;

    setOpenPanel(null);
    trigger?.focus({ preventScroll: true });
  };

  const togglePanel = (panel: OpenPanel) => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();

    if (query) {
      addSearchHistory(query);
    }

    setHistoryOpen(false);

    if (fuzzy) {
      const rest = { ...library.filter };
      delete rest.search;

      if (library.filter.search !== undefined) {
        void controller.setFilter(rest);
      }

      return;
    }

    void controller.setSearch(query);
  };

  const clearSearch = () => {
    setSearch('');
    void controller.setSearch('');
  };

  const handleSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && searchOpen) {
      event.preventDefault();
      event.stopPropagation();
      setSearchOpen(false);
      searchToggle.current?.focus({ preventScroll: true });
    }
  };

  const handleStatus = (value: string) => {
    const status = value === '' ? null : (value as LibraryStatus);

    void controller.setFilter(statusFilter(library.filter, status));
  };

  const handleSortField = (value: string) => {
    if (value === 'random') {
      setRandomOrder(true);
      setRandomSeed((seed) => seed + 1);
      return;
    }

    setRandomOrder(false);
    void controller.setSort({ ...library.sort, field: value as LibrarySortField });
  };

  const handleSortDirection = (value: string) => {
    void controller.setSort({
      ...library.sort,
      direction: value as LibrarySortDirection,
    });
  };

  const handleCategory = (category: LibraryCategory | null) => {
    void controller.setCategory(category?.id ?? null);
  };

  const toggleFuzzy = () => {
    const next = !fuzzy;
    setFuzzy(next);

    if (next && library.filter.search !== undefined) {
      const rest = { ...library.filter };
      delete rest.search;
      void controller.setFilter(rest);
    }
  };

  const saveDefaults = () => {
    updateLibraryPreferences({
      status: library.filter.status,
      statuses: library.filter.statuses,
      categoryId: library.categoryId,
      sort: library.sort,
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setLastSelectedIndex(null);
    setConfirmRemove(false);
    setCategoryChoice('');
    setBulkError(false);
  };

  const toggleSelected = (index: number, mangaId: number, shiftKey: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);

        for (let position = start; position <= end; position += 1) {
          const item = library.items[position];

          if (item) {
            next.add(item.id);
          }
        }
      } else if (next.has(mangaId)) {
        next.delete(mangaId);
      } else {
        next.add(mangaId);
      }

      return next;
    });
    setLastSelectedIndex(index);
  };

  const applyCategory = async () => {
    if (!categoryChoice || selectedIds.size === 0) {
      return;
    }

    setBulkBusy(true);
    setBulkError(false);

    try {
      await controller.addToCategory([...selectedIds], Number(categoryChoice));
      clearSelection();
      setSelectionMode(false);
    } catch {
      setBulkError(true);
    } finally {
      setBulkBusy(false);
    }
  };

  const markSelectedRead = async (isRead: boolean) => {
    if (selectedIds.size === 0) {
      return;
    }

    setBulkBusy(true);
    setBulkError(false);

    try {
      await controller.markRead([...selectedIds], isRead);
      clearSelection();
      setSelectionMode(false);
    } catch {
      setBulkError(true);
    } finally {
      setBulkBusy(false);
    }
  };

  const downloadSelected = async () => {
    if (selectedIds.size === 0) {
      return;
    }

    setBulkBusy(true);
    setBulkError(false);

    try {
      await controller.downloadMangas([...selectedIds]);
      clearSelection();
      setSelectionMode(false);
    } catch {
      setBulkError(true);
    } finally {
      setBulkBusy(false);
    }
  };

  const deleteSelectedDownloads = async () => {
    if (selectedIds.size === 0) {
      return;
    }

    setBulkBusy(true);
    setBulkError(false);

    try {
      await controller.deleteMangaDownloads([...selectedIds]);
      clearSelection();
      setSelectionMode(false);
      setConfirmDeleteDownloads(false);
    } catch {
      setBulkError(true);
    } finally {
      setBulkBusy(false);
    }
  };

  const removeSelected = async () => {    if (selectedIds.size === 0) {
      return;
    }

    setBulkBusy(true);
    setBulkError(false);

    try {
      await controller.removeFromLibrary([...selectedIds]);
      clearSelection();
      setSelectionMode(false);
    } catch {
      setBulkError(true);
    } finally {
      setBulkBusy(false);
    }
  };

  const isNarrowed = hasNarrowingCriteria(library.filter, library.categoryId);
  const filterActive = Boolean(
    library.filter.status ||
      (library.filter.statuses?.length ?? 0) > 0 ||
      library.filter.sourceId,
  );
  const searchActive = Boolean(search.trim()) || Boolean(library.filter.search?.trim());
  const sortActive =
    randomOrder ||
    library.sort.field !== 'dateAdded' ||
    library.sort.direction !== 'desc';
  const hasAnyRefinement =
    isNarrowed || sortActive || searchActive || quickFilter !== 'all';
  const locallyFiltered =
    fuzzy && search.trim()
      ? library.items.filter((manga) => fuzzyMatch(manga.title, search.trim()))
      : library.items;
  const quickFiltered =
    quickFilter === 'all'
      ? locallyFiltered
      : locallyFiltered.filter((manga) => {
          if (quickFilter === 'unread') {
            return manga.unreadCount > 0;
          }

          if (quickFilter === 'started') {
            return manga.lastReadChapter !== null;
          }

          return manga.downloadCount > 0;
        });
  const displayedItems = randomOrder
    ? shuffled(quickFiltered, randomSeed)
    : quickFiltered;
  const duplicateGroups = useMemo(() => {
    const groups = new Map<string, LibraryManga[]>();

    for (const manga of library.items) {
      const key = duplicateKey(manga.title);

      if (!key) {
        continue;
      }

      const group = groups.get(key);

      if (group) {
        group.push(manga);
      } else {
        groups.set(key, [manga]);
      }
    }

    return [...groups.values()].filter((group) => group.length > 1);
  }, [library.items]);

  const resetAll = () => {
    setSearch('');
    setRandomOrder(false);
    setRandomSeed(0);
    setFuzzy(false);
    setQuickFilter('all');
    setOpenPanel(null);
    void controller.setFilter({});

    if (library.categoryId !== null) {
      void controller.setCategory(null);
    }

    if (
      library.sort.field !== 'dateAdded' ||
      library.sort.direction !== 'desc'
    ) {
      void controller.setSort({ field: 'dateAdded', direction: 'desc' });
    }
  };
  const showInitialLoading = library.isInitialLoading && library.items.length === 0;
  const showInitialError = Boolean(library.initialError) && library.items.length === 0;

  const filterGroups: readonly LibraryMenuGroup[] = [
    {
      key: 'status',
      label: 'Status',
      value: library.filter.status ?? '',
      options: STATUS_OPTIONS,
      onSelect: (value) => {
        handleStatus(value);
        closePanel();
      },
    },
    {
      key: 'statuses',
      label: 'Status OR',
      value: '',
      selection: 'multiple',
      values: library.filter.statuses ?? [],
      options: STATUS_OPTIONS.filter((option) => option.value !== ''),
      onSelect: () => undefined,
      onToggle: (value) => {
        const current = new Set(library.filter.statuses ?? []);
        const status = value as LibraryStatus;

        if (current.has(status)) {
          current.delete(status);
        } else {
          current.add(status);
        }

        const statuses = [...current];
        void controller.setFilter({
          ...statusFilter(library.filter, null),
          ...(statuses.length > 0 ? { statuses } : {}),
        });
      },
    },
    {
      key: 'source',
      label: 'Source',
      value: library.filter.sourceId ?? '',
      options: [
        { value: '', label: 'All sources' },
        ...sources.map((source) => ({
          value: source.id,
          label: source.displayName,
        })),
      ],
      onSelect: (value) => {
        void controller.setFilter({
          ...library.filter,
          sourceId: value || undefined,
        });
        closePanel();
      },
    },
  ];

  const sortGroups: readonly LibraryMenuGroup[] = [
    {
      key: 'field',
      label: 'Sort by',
      value: randomOrder ? 'random' : library.sort.field,
      options: SORT_OPTIONS,
      onSelect: (value) => {
        handleSortField(value);
        closePanel();
      },
    },
    {
      key: 'direction',
      label: 'Direction',
      value: library.sort.direction,
      options: DIRECTION_OPTIONS,
      onSelect: (value) => {
        handleSortDirection(value);
        closePanel();
      },
    },
  ];

  return (
    <div
      className={`app-shell library-shell${
        appPreferences.libraryDensity === 'comfortable' ? ' is-comfortable' : ''
      }`}
    >
      <AmbientArt imageUrl={ambient.objectUrl} className="library-ambient" />
      <header className="library-header">
        <div className="library-title">
          <h1>Library</h1>
          <p className="library-count" aria-live="polite">
            {countLabel(library.totalCount, library.isInitialLoading)}
          </p>
        </div>

        <form
          className={`library-search${searchOpen ? ' is-open' : ''}`}
          id={SEARCH_FORM_ID}
          role="search"
          onSubmit={handleSearch}
        >
          <IconSearch className="library-search-icon" />
          <label className="sr-only" htmlFor="library-search">
            Search library
          </label>
          <input
            ref={searchInput}
            id="library-search"
            name="search"
            type="search"
            placeholder="Search library"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => setHistoryOpen(true)}
            onClick={() => setHistoryOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setHistoryOpen(false), 120);
            }}
            onKeyDown={handleSearchKeyDown}
            autoComplete="off"
            enterKeyHint="search"
          />
          {search.length > 0 ? (
            <button
              className="library-search-clear"
              type="button"
              aria-label="Clear search"
              onClick={clearSearch}
            >
              <IconClose />
            </button>
          ) : null}
          {historyOpen && searchHistory.length > 0 ? (
            <div className="library-search-history" role="listbox" aria-label="Recent searches">
              {searchHistory.map((term) => (
                <button
                  key={term}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setSearch(term);
                    addSearchHistory(term);
                    setHistoryOpen(false);
                    void controller.setSearch(term);
                  }}
                >
                  {term}
                </button>
              ))}
              <button
                className="library-search-history-clear"
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => clearSearchHistory()}
              >
                Clear history
              </button>
            </div>
          ) : null}
        </form>

        <div className="library-controls">
          <button
            ref={searchToggle}
            className={`library-icon-button library-search-toggle${searchActive ? ' is-active' : ''}`}
            type="button"
            aria-label={
              searchOpen ? 'Close search' : searchActive ? 'Search, active' : 'Search'
            }
            aria-expanded={searchOpen}
            aria-controls={SEARCH_FORM_ID}
            onClick={() => {
              if (searchOpen) {
                setSearchOpen(false);
                searchToggle.current?.focus({ preventScroll: true });
              } else {
                setSearchOpen(true);
              }
            }}
          >
            <IconSearch />
            {searchActive && !searchOpen ? (
              <span className="library-action-dot" aria-hidden="true" />
            ) : null}
          </button>

          <div className="library-actions" ref={actionsRef}>
            <button
              className={`library-action${selectionMode ? ' is-active' : ''}`}
              type="button"
              aria-pressed={selectionMode}
              onClick={() => {
                if (selectionMode) {
                  clearSelection();
                }
                setSelectionMode((value) => !value);
              }}
            >
              {selectionMode ? 'Done' : 'Select'}
            </button>
            <button
              className={`library-action${fuzzy ? ' is-active' : ''}`}
              type="button"
              aria-pressed={fuzzy}
              title="Fuzzy search loaded titles"
              onClick={toggleFuzzy}
            >
              Fuzzy
            </button>
            <button
              className={`library-action${duplicatesOpen ? ' is-active' : ''}`}
              type="button"
              aria-pressed={duplicatesOpen}
              disabled={duplicateGroups.length === 0}
              title="Show duplicate titles in the loaded library"
              onClick={() => setDuplicatesOpen((value) => !value)}
            >
              Duplicates ({duplicateGroups.length})
            </button>
            <button
              className={`library-action${
                appPreferences.libraryView === 'grid' ? ' is-active' : ''
              }`}
              type="button"
              aria-pressed={appPreferences.libraryView === 'grid'}
              onClick={() => updateAppPreferences({ libraryView: 'grid' })}
            >
              Grid
            </button>
            <button
              className={`library-action${
                appPreferences.libraryView === 'list' ? ' is-active' : ''
              }`}
              type="button"
              aria-pressed={appPreferences.libraryView === 'list'}
              onClick={() => updateAppPreferences({ libraryView: 'list' })}
            >
              List
            </button>

            <button
              ref={filterButton}
              className={`library-action${filterActive ? ' is-active' : ''}`}
              type="button"
              aria-haspopup="menu"
              aria-expanded={openPanel === 'filter'}
              aria-controls={FILTER_MENU_ID}
              onClick={() => togglePanel('filter')}
            >
              <IconFilter />
              <span>Filter</span>
              {filterActive ? (
                <span className="library-action-dot" aria-hidden="true" />
              ) : null}
              {filterActive ? <span className="sr-only">, active</span> : null}
            </button>

            <button
              ref={sortButton}
              className={`library-action${sortActive ? ' is-active' : ''}`}
              type="button"
              aria-haspopup="menu"
              aria-expanded={openPanel === 'sort'}
              aria-controls={SORT_MENU_ID}
              onClick={() => togglePanel('sort')}
            >
              <IconSort />
              <span>Sort</span>
              {sortActive ? (
                <span className="library-action-dot" aria-hidden="true" />
              ) : null}
              {sortActive ? <span className="sr-only">, active</span> : null}
            </button>

            <LibraryMenu
              id={FILTER_MENU_ID}
              label="Status filter"
              open={openPanel === 'filter'}
              groups={filterGroups}
              onClose={closePanel}
            />

            <LibraryMenu
              id={SORT_MENU_ID}
              label="Sort options"
              open={openPanel === 'sort'}
              groups={sortGroups}
              onClose={closePanel}
            />

            {hasAnyRefinement ? (
              <button
                className="library-action"
                type="button"
                onClick={resetAll}
              >
                Reset
              </button>
            ) : null}
            <button
              className="library-action"
              type="button"
              title="Save current category, status, and sort as default"
              onClick={saveDefaults}
            >
              Save defaults
            </button>
            <LibrarySyncButton
              context={context}
              className="library-action"
              onComplete={() => void controller.load()}
            />
          </div>
        </div>
      </header>

      {duplicatesOpen && duplicateGroups.length > 0 ? (
        <section className="library-duplicates" aria-labelledby="duplicates-heading">
          <div className="section-heading-row">
            <h2 id="duplicates-heading">Possible duplicates</h2>
            <button
              className="library-action"
              type="button"
              onClick={() => setDuplicatesOpen(false)}
            >
              Close
            </button>
          </div>
          <div className="library-duplicate-groups">
            {duplicateGroups.map((group) => (
              <div className="library-duplicate-group" key={group[0]?.id}>
                <strong>{group[0]?.title}</strong>
                <ul>
                  {group.map((manga) => (
                    <li key={manga.id}>
                      <Link to={`/manga/${manga.id}`}>{manga.title}</Link>
                      <span>#{manga.id}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <nav className="category-nav" aria-label="Library categories">
        <div className="category-tabs">
          <button
            className="category-tab"
            type="button"
            aria-pressed={library.categoryId === null}
            aria-label="All"
            onClick={() => handleCategory(null)}
          >
            All
            <span className="category-tab-count">
              {library.totalCount.toLocaleString('en-US')}
            </span>
          </button>
          {categories.categories.map((category) => (
            <button
              className="category-tab"
              key={category.id}
              type="button"
              aria-pressed={library.categoryId === category.id}
              aria-label={category.name}
              onClick={() => handleCategory(category)}
            >
              {category.name}
              <span className="category-tab-count">
                {category.mangas.totalCount.toLocaleString('en-US')}
              </span>
            </button>
          ))}
        </div>

        {categories.isLoading && categories.categories.length === 0 ? (
          <p className="library-note" role="status">
            Loading categories…
          </p>
        ) : null}

        {categories.error ? (
          <p className="library-note library-note-warning" role="status">
            Categories unavailable. The All view still works.
          </p>
        ) : null}

        {!categories.isLoading &&
        !categories.error &&
        categories.categories.length === 0 ? (
          <p className="library-note">No server categories.</p>
        ) : null}
      </nav>

      <div className="library-quick-filters" role="group" aria-label="Quick filters">
        {(
          [
            ['all', 'All titles'],
            ['unread', 'Unread'],
            ['started', 'Started'],
            ['downloaded', 'Downloaded'],
          ] as const
        ).map(([value, label]) => (
          <button
            className={quickFilter === value ? 'is-active' : undefined}
            key={value}
            type="button"
            aria-pressed={quickFilter === value}
            onClick={() => setQuickFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {selectionMode ? (
        <div className="library-selection-bar" role="toolbar" aria-label="Bulk manga actions">
          <strong>{selectedIds.size} selected</strong>

          {confirmRemove ? (
            <div className="library-selection-confirm">
              <span>Remove {selectedIds.size} manga from library?</span>
              <button
                className="library-action is-danger"
                type="button"
                disabled={bulkBusy}
                onClick={() => void removeSelected()}
              >
                Confirm
              </button>
              <button
                className="library-action"
                type="button"
                onClick={() => setConfirmRemove(false)}
              >
                Cancel
              </button>
            </div>
          ) : confirmDeleteDownloads ? (
            <div className="library-selection-confirm">
              <span>Delete downloads for {selectedIds.size} manga?</span>
              <button
                className="library-action is-danger"
                type="button"
                disabled={bulkBusy}
                onClick={() => void deleteSelectedDownloads()}
              >
                Confirm
              </button>
              <button
                className="library-action"
                type="button"
                onClick={() => setConfirmDeleteDownloads(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <label className="library-bulk-category">
                <span className="sr-only">Add selected manga to category</span>
                <select
                  value={categoryChoice}
                  onChange={(event) => setCategoryChoice(event.target.value)}
                >
                  <option value="">Add to category…</option>
                  {categories.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="library-action"
                type="button"
                disabled={!categoryChoice || bulkBusy || selectedIds.size === 0}
                onClick={() => void applyCategory()}
              >
                Apply category
              </button>
              <button
                className="library-action is-danger"
                type="button"
                disabled={bulkBusy || selectedIds.size === 0}
                onClick={() => setConfirmRemove(true)}
              >
                Remove from library
              </button>
              <button
                className="library-action"
                type="button"
                disabled={bulkBusy || selectedIds.size === 0}
                onClick={() => void markSelectedRead(true)}
              >
                Mark read
              </button>
              <button
                className="library-action"
                type="button"
                disabled={bulkBusy || selectedIds.size === 0}
                onClick={() => void markSelectedRead(false)}
              >
                Mark unread
              </button>
              <button
                className="library-action"
                type="button"
                disabled={bulkBusy || selectedIds.size === 0}
                onClick={() => void downloadSelected()}
              >
                Download
              </button>
              <button
                className="library-action"
                type="button"
                disabled={bulkBusy || selectedIds.size === 0}
                onClick={() => setConfirmDeleteDownloads(true)}
              >
                Delete download
              </button>
              <button
                className="library-action"
                type="button"
                onClick={clearSelection}
              >
                Clear
              </button>
            </>
          )}

          {bulkError ? (
            <span className="library-selection-error" role="alert">
              Bulk action failed.
            </span>
          ) : null}
        </div>
      ) : null}

      <main className="library-main">
        <section
          className="library-results"
          aria-busy={library.isInitialLoading || library.isLoadingMore}
          aria-label="Manga library"
        >
          {showInitialLoading ? (
            <div className="manga-grid" aria-hidden="true">
              {Array.from({ length: 12 }, (_, index) => (
                <MangaCardSkeleton key={index} />
              ))}
            </div>
          ) : null}

          {showInitialError ? (
            <div className="library-state" role="alert">
              <h2>Couldn&apos;t load library</h2>
              <p>The request to your server failed. Try again.</p>
              <button
                className="button"
                type="button"
                onClick={() => void controller.load()}
                disabled={library.isInitialLoading}
              >
                Retry
              </button>
            </div>
          ) : null}

          {!showInitialLoading &&
          !showInitialError &&
          library.items.length === 0 ? (
            <div className="library-state">
              <h2>{isNarrowed ? 'No manga found' : 'Your library is empty'}</h2>
              <p>
                {isNarrowed
                  ? 'Try a different search, category, or status.'
                  : 'Manga you add in Suwayomi will appear here.'}
              </p>
            </div>
          ) : null}

          {library.items.length > 0 ? (
            <div
              className={`manga-grid${
                appPreferences.libraryView === 'list' ? ' is-list' : ''
              }`}
            >
              {displayedItems.map((manga, index) => (
                <MangaCard
                  key={manga.id}
                  manga={manga}
                  resources={context.resources}
                  selectable={selectionMode}
                  selected={selectedIds.has(manga.id)}
                  onToggle={(shiftKey) =>
                    toggleSelected(index, manga.id, shiftKey)
                  }
                  onLongPress={() => {
                    setSelectionMode(true);
                    setSelectedIds(new Set([manga.id]));
                    setLastSelectedIndex(index);
                  }}
                />
              ))}
            </div>
          ) : null}
        </section>

        {library.items.length > 0 && library.pageInfo.hasNextPage ? (
          <section className="library-load-more" aria-label="Load more results">
            {library.loadMoreError ? (
              <p className="alert alert-error" role="alert">
                Couldn&apos;t load more manga.
              </p>
            ) : null}
            <button
              className="button button-secondary"
              type="button"
              disabled={library.isLoadingMore}
              onClick={() => void controller.loadMore()}
            >
              {library.isLoadingMore ? 'Loading…' : 'Load more'}
            </button>
          </section>
        ) : null}
      </main>
    </div>
  );
}

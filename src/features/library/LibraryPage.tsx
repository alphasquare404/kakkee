import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
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
  type LibraryManga,
  type DuplicateScanItem,
  type LibraryFilter,
  type LibrarySortDirection,
  type LibrarySortField,
} from '../../core/library/libraryRepository';
import { useConnection } from '../../app/useConnection';
import { getAutoConnect, getLastServerUrl } from '../../core/preferences/connectionPreferences';
import { useAppPath } from '../../app/useAppPath';
import { ActionMenu } from '../../shared/ActionMenu';
import { ContextMenu } from '../../shared/ContextMenu';
import { useAppPreferences } from '../../shared/useAppPreferences';
import { updateAppPreferences } from '../../core/preferences/appPreferences';
import { useSearchHistory } from '../../shared/useSearchHistory';
import { addSearchHistory, clearSearchHistory } from '../../core/preferences/searchHistory';
import {
  getLibraryPreferences,
  updateLibraryPreferences,
} from '../../core/preferences/libraryPreferences';
import { LibraryMenu, type LibraryMenuGroup } from './LibraryMenu';
import { LibraryFilterDrawer } from './LibraryFilterDrawer';
import { MangaCard, MangaCardSkeleton } from './MangaCard';
import { createCatalogRepository } from '../../core/catalog/catalogRepository';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  Library: 'Perpustakaan',
  'Loading…': 'Memuat…',
  'Search library': 'Cari di perpustakaan',
  'Manga and progress': 'Manga dan progres',
  'Submit search': 'Cari',
  'Clear history': 'Hapus riwayat',
  Select: 'Pilih',
  Done: 'Selesai',
  Grid: 'Grid',
  List: 'Daftar',
  Filter: 'Filter',
  Sort: 'Urutkan',
  Reset: 'Reset',
  'Save defaults': 'Simpan default',
  'All titles': 'Semua judul',
  Unread: 'Belum dibaca',
  'Working…': 'Memproses…',
  Started: 'Sudah dimulai',
  Downloaded: 'Terunduh',
  Bookmarked: 'Ditandai',
  Tracked: 'Dilacak',
  'Possible duplicates': 'Kemungkinan duplikat',
  'Scan all library': 'Pindai seluruh perpustakaan',
  'Rescan library': 'Pindai ulang',
  Close: 'Tutup',
  All: 'Semua',
  'No server categories.': 'Tidak ada kategori server.',
  'Loading categories…': 'Memuat kategori…',
});
import { LibrarySyncButton } from './LibrarySyncButton';
import {
  hiddenNsfwCountForCategory,
  toggleMangaNsfw,
  updateNsfwPreferences,
  useNsfwPreferences,
} from '../../core/preferences/nsfwPreferences';
import { LabeledMangaCategoriesDocument } from '../../core/graphql/generated/graphql';
import {
  IconClose,
  IconFilter,
  IconGrid,
  IconList,
  IconSearch,
  IconSort,
} from './icons';

type LibraryStatus = NonNullable<LibraryFilter['status']>;
type OpenPanel = 'sort';
type QuickFilter = 'unread' | 'started' | 'downloaded' | 'bookmarked' | 'tracked';

const QUICK_FILTER_OPTIONS: ReadonlyArray<{ readonly value: QuickFilter; readonly label: string }> = [
  { value: 'unread', label: 'Unread' },
  { value: 'started', label: 'Started' },
  { value: 'downloaded', label: 'Downloaded' },
  { value: 'bookmarked', label: 'Bookmarked' },
  { value: 'tracked', label: 'Tracked' },
];

const SEARCH_FORM_ID = 'library-search-form';
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

function countLabel(
  totalCount: number,
  loading: boolean,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  if (loading) {
    return t('Loading…');
  }

  return t('{count} manga', {
    count: totalCount.toLocaleString('en-US'),
  });
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
  const { from } = useAppPath();

  if (state.status !== 'connected') {
    const autoStarting =
      (state.status === 'disconnected' || state.status === 'connecting') &&
      getAutoConnect() &&
      Boolean(getLastServerUrl());

    if (autoStarting) {
      return (
        <div className="app-shell page-shell library-shell" aria-busy="true">
          <header className="library-header">
            <div>
              <h1>Library</h1>
              <p>Manga and progress</p>
            </div>
          </header>
          <div className="manga-grid" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <MangaCardSkeleton key={index} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <Navigate
        to="/"
        replace
        state={{
          from,
        }}
      />
    );
  }

  return <ConnectedLibrary context={state.context} />;
}

function ConnectedLibrary({ context }: { readonly context: ConnectedContext }) {
  const { t } = useI18n();
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
  const appPreferences = useAppPreferences();
  const nsfw = useNsfwPreferences();
  const searchHistory = useSearchHistory();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamKey = searchParams.toString();
  const initialQuery = searchParams.get('q') ?? '';
  const initialFuzzy = searchParams.get('fuzzy') === '1';
  const [historyOpen, setHistoryOpen] = useState(false);
  const loadedLibrary = useRef<LibraryController | null>(null);
  const loadedCategories = useRef<LibraryCategoryController | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const filterButton = useRef<HTMLButtonElement>(null);
  const categoryTabsRef = useRef<HTMLDivElement>(null);
  const sortButton = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const searchToggle = useRef<HTMLButtonElement>(null);
  const contextTriggerRef = useRef<HTMLElement | null>(null);
  const swipeStart = useRef<{
    readonly x: number;
    readonly y: number;
  } | null>(null);
  const suppressSwipeClick = useRef(false);
  const appliedInitialSearch = useRef(false);
  const [search, setSearch] = useState(initialQuery);
  const searchRef = useRef(search);
  searchRef.current = search;
  const [searchOpen, setSearchOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<OpenPanel | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [randomOrder, setRandomOrder] = useState(false);
  const [randomSeed, setRandomSeed] = useState(0);
  const [fuzzy, setFuzzy] = useState(initialFuzzy);
  const fuzzyRef = useRef(fuzzy);
  fuzzyRef.current = fuzzy;
  const [duplicatesOpen, setDuplicatesOpen] = useState(false);
  const [scannedDuplicates, setScannedDuplicates] = useState<
    readonly DuplicateScanItem[] | null
  >(null);
  const [duplicateScanBusy, setDuplicateScanBusy] = useState(false);
  const [duplicateScanError, setDuplicateScanError] = useState(false);
  const [quickFilters, setQuickFilters] = useState<ReadonlySet<QuickFilter>>(
    () => new Set(),
  );
  const [sources, setSources] = useState<
    readonly { readonly id: string; readonly displayName: string }[]
  >([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [categoryChoice, setCategoryChoice] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [hiddenCategoryIds, setHiddenCategoryIds] = useState<ReadonlySet<number>>(
    () => new Set(getLibraryPreferences().hiddenCategoryIds),
  );
  const [showAllCategory, setShowAllCategory] = useState(
    () => getLibraryPreferences().showAllCategory,
  );
  const [knownCategoryCounts, setKnownCategoryCounts] = useState<
    Readonly<Record<number, number>>
  >({});
  const [contextMenu, setContextMenu] = useState<{
    readonly manga: LibraryManga;
    readonly index: number;
    readonly x: number;
    readonly y: number;
  } | null>(null);
  const [contextBusy, setContextBusy] = useState(false);
  const [contextError, setContextError] = useState(false);
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
    if (appliedInitialSearch.current) {
      return;
    }

    appliedInitialSearch.current = true;

    if (initialQuery && !initialFuzzy) {
      void controller.setSearch(initialQuery);
    }
  }, [controller, initialFuzzy, initialQuery]);

  useEffect(() => {
    const params = new URLSearchParams(searchParamKey);
    const urlQuery = params.get('q') ?? '';
    const urlFuzzy = params.get('fuzzy') === '1';

    if (urlQuery === searchRef.current && urlFuzzy === fuzzyRef.current) {
      return;
    }

    setSearch(urlQuery);
    setFuzzy(urlFuzzy);

    if (!urlFuzzy) {
      void controller.setSearch(urlQuery);
    }
  }, [controller, searchParamKey]);

  const writeSearchUrl = (query: string, nextFuzzy: boolean) => {
    setSearchParams(
      () => {
        const params = new URLSearchParams();

        if (query) {
          params.set('q', query);
        }

        if (nextFuzzy) {
          params.set('fuzzy', '1');
        }

        return params;
      },
      { replace: true },
    );
  };

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
    setOpenPanel(null);
    sortButton.current?.focus({ preventScroll: true });
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

      writeSearchUrl(query, fuzzy);
      return;
    }

    void controller.setSearch(query);
    writeSearchUrl(query, fuzzy);
  };

  const clearSearch = () => {
    setSearch('');
    writeSearchUrl('', false);
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

  useEffect(() => {
    if (
      library.categoryId !== null &&
      hiddenCategoryIds.has(library.categoryId)
    ) {
      void controller.setCategory(null);
    }
  }, [controller, hiddenCategoryIds, library.categoryId]);

  useEffect(() => {
    if (library.categoryId === null || library.isInitialLoading) {
      return;
    }

    setKnownCategoryCounts((current) =>
      current[library.categoryId as number] === library.totalCount
        ? current
        : {
            ...current,
            [library.categoryId as number]: library.totalCount,
          },
    );
  }, [library.categoryId, library.isInitialLoading, library.totalCount]);

  const categoryIdsByManga = { ...nsfw.categoryIdsByManga };

  for (const manga of library.items) {
    if (
      nsfw.mangaIds.includes(manga.id) &&
      !categoryIdsByManga[manga.id]
    ) {
      categoryIdsByManga[manga.id] = manga.categories.nodes.map(
        (category) => category.id,
      );
    }
  }

  const effectiveNsfw = { ...nsfw, categoryIdsByManga };

  const allLibraryLoaded =
    nsfw.hideNsfw &&
    library.categoryId === null &&
    !library.isInitialLoading &&
    library.items.length > 0 &&
    library.items.length >= library.totalCount;
  const visibleLoadedItems = allLibraryLoaded
    ? library.items.filter(
        (manga) => !(nsfw.hideNsfw && nsfw.mangaIds.includes(manga.id)),
      )
    : [];

  const displayCategories = categories.categories.map((category) => {
    const loadedCount = allLibraryLoaded
      ? visibleLoadedItems.filter((manga) =>
          manga.categories.nodes.some((entry) => entry.id === category.id),
        ).length
      : null;
    const knownCount = knownCategoryCounts[category.id];
    const activeCount =
      !library.isInitialLoading && library.totalCount > 0
        ? library.totalCount
        : category.mangas.totalCount;
    const baseCount =
      library.categoryId === category.id
        ? activeCount
        : knownCount ?? category.mangas.totalCount;

    return {
      ...category,
      mangas: {
        ...category.mangas,
        totalCount:
          loadedCount ??
          Math.max(
            0,
            baseCount - hiddenNsfwCountForCategory(category.id, effectiveNsfw),
          ),
      },
    };
  });
  const missingNsfwCategories = nsfw.mangaIds.filter(
    (mangaId) => !(mangaId in nsfw.categoryIdsByManga),
  );

  useEffect(() => {
    if (!nsfw.hideNsfw || missingNsfwCategories.length === 0) {
      return;
    }

    let active = true;

    void context.graphQL
      .query({
        query: LabeledMangaCategoriesDocument,
        variables: { ids: missingNsfwCategories },
        fetchPolicy: 'network-only',
      })
      .then((result) => {
        if (!active) {
          return;
        }

        const categoryIdsByManga = { ...nsfw.categoryIdsByManga };
        const nodes = result.data?.mangas?.nodes ?? [];

        for (const node of nodes) {
          categoryIdsByManga[node.id] = node.categories.nodes.map(
            (category) => category.id,
          );
        }

        for (const mangaId of missingNsfwCategories) {
          if (!(mangaId in categoryIdsByManga)) {
            categoryIdsByManga[mangaId] = [];
          }
        }

        updateNsfwPreferences({ categoryIdsByManga });
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [
    context.graphQL,
    missingNsfwCategories,
    nsfw.categoryIdsByManga,
    nsfw.hideNsfw,
  ]);

  const visibleCategories = displayCategories.filter(
    (category) =>
      !hiddenCategoryIds.has(category.id) && category.mangas.totalCount !== 0,
  );

  useEffect(() => {
    if (
      categories.isLoading ||
      library.isInitialLoading ||
      categories.categories.length === 0 ||
      library.categoryId === null ||
      visibleCategories.some((category) => category.id === library.categoryId)
    ) {
      return;
    }

    void controller.setCategory(visibleCategories[0]?.id ?? null);
  }, [
    categories.categories.length,
    categories.isLoading,
    controller,
    library.isInitialLoading,
    library.categoryId,
    visibleCategories,
  ]);
  const firstVisibleCategoryId = visibleCategories[0]?.id ?? null;
  const categorySteps: readonly { readonly category: LibraryCategory | null }[] = [
    ...(showAllCategory ? [{ category: null }] : []),
    ...visibleCategories.map((category) => ({ category })),
  ];

  const swipeToAdjacentCategory = (direction: 1 | -1) => {
    const currentIndex = categorySteps.findIndex((step) =>
      step.category === null
        ? library.categoryId === null
        : step.category.id === library.categoryId,
    );

    if (currentIndex < 0) {
      return;
    }

    const nextIndex = Math.min(
      categorySteps.length - 1,
      Math.max(0, currentIndex + direction),
    );

    if (nextIndex === currentIndex) {
      return;
    }

    handleCategory(categorySteps[nextIndex]?.category ?? null);
  };

  const handleLibraryTouchStart = (event: ReactTouchEvent<HTMLElement>) => {
    if (
      selectionMode ||
      filterOpen ||
      contextMenu ||
      event.touches.length !== 1
    ) {
      return;
    }

    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    if (
      touch.clientX < 24 ||
      touch.clientX > window.innerWidth - 24 ||
      (event.target as HTMLElement).closest(
        '.library-header, .category-tabs, .library-selection-bar, .library-duplicates, input, select, textarea',
      )
    ) {
      return;
    }

    swipeStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleLibraryTouchMove = (event: ReactTouchEvent<HTMLElement>) => {
    const start = swipeStart.current;
    const touch = event.touches[0];

    if (!start || !touch) {
      return;
    }

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    if (Math.abs(dy) > Math.abs(dx) + 10) {
      swipeStart.current = null;
    }
  };

  const handleLibraryTouchEnd = (event: ReactTouchEvent<HTMLElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;

    if (!start) {
      return;
    }

    const touch = event.changedTouches[0];

    if (!touch) {
      return;
    }

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.4) {
      return;
    }

    suppressSwipeClick.current = true;
    window.setTimeout(() => {
      suppressSwipeClick.current = false;
    }, 500);
    swipeToAdjacentCategory(dx < 0 ? 1 : -1);
  };

  const handleLibraryClickCapture = (event: ReactMouseEvent<HTMLElement>) => {
    if (!suppressSwipeClick.current) {
      return;
    }

    suppressSwipeClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  useEffect(() => {
    const container = categoryTabsRef.current;
    const active = container?.querySelector<HTMLElement>(
      '.category-tab[aria-pressed="true"]',
    );

    if (!container || !active) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    if (activeRect.left < containerRect.left) {
      container.scrollTo({
        left: container.scrollLeft - (containerRect.left - activeRect.left) - 8,
        behavior: 'smooth',
      });
    } else if (activeRect.right > containerRect.right) {
      container.scrollTo({
        left: container.scrollLeft + (activeRect.right - containerRect.right) + 8,
        behavior: 'smooth',
      });
    }
  }, [library.categoryId, showAllCategory, visibleCategories.length]);

  useEffect(() => {
    if (
      !showAllCategory &&
      library.categoryId === null &&
      firstVisibleCategoryId !== null
    ) {
      void controller.setCategory(firstVisibleCategoryId);
    }
  }, [controller, firstVisibleCategoryId, library.categoryId, showAllCategory]);

  const toggleFuzzy = () => {
    const next = !fuzzy;
    setFuzzy(next);
    writeSearchUrl(search.trim(), next);

    if (next && library.filter.search !== undefined) {
      const rest = { ...library.filter };
      delete rest.search;
      void controller.setFilter(rest);
    } else if (!next && search.trim()) {
      void controller.setSearch(search.trim());
    }
  };

  const saveDefaults = () => {
    updateLibraryPreferences({
      status: library.filter.status,
      statuses: library.filter.statuses,
      categoryId: library.categoryId,
      hiddenCategoryIds: [...hiddenCategoryIds],
      showAllCategory,
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

  const closeContextMenu = (restoreFocus = true) => {
    const trigger = contextTriggerRef.current;
    contextTriggerRef.current = null;
    setContextMenu(null);

    if (restoreFocus) {
      trigger?.focus({ preventScroll: true });
    }
  };

  const toggleCategoryVisibility = (categoryId: number) => {
    const next = new Set(hiddenCategoryIds);

    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }

    setHiddenCategoryIds(next);
    updateLibraryPreferences({
      ...getLibraryPreferences(),
      hiddenCategoryIds: [...next],
    });

    if (library.categoryId === categoryId) {
      handleCategory(null);
    }
  };

  const toggleAllCategory = () => {
    const next = !showAllCategory;

    if (
      !next &&
      library.categoryId === null &&
      visibleCategories.length === 0
    ) {
      return;
    }

    setShowAllCategory(next);
    updateLibraryPreferences({
      ...getLibraryPreferences(),
      showAllCategory: next,
    });

    if (!next && library.categoryId === null && visibleCategories[0]) {
      handleCategory(visibleCategories[0]);
    }
  };

  const showAllCategories = () => {
    const next = new Set<number>();
    setHiddenCategoryIds(next);
    setShowAllCategory(true);
    updateLibraryPreferences({
      ...getLibraryPreferences(),
      hiddenCategoryIds: [],
      showAllCategory: true,
    });
  };

  const selectContextManga = () => {
    if (!contextMenu) {
      return;
    }

    setSelectionMode(true);
    setSelectedIds(new Set([contextMenu.manga.id]));
    setLastSelectedIndex(contextMenu.index);
    setConfirmRemove(false);
    setCategoryChoice('');
    const cardId = contextMenu.manga.id;
    closeContextMenu(false);
    window.requestAnimationFrame(() => {
      document
        .getElementById(`library-card-${cardId}`)
        ?.focus({ preventScroll: true });
    });
  };

  const removeContextManga = async () => {
    if (!contextMenu || contextBusy) {
      return;
    }

    setContextBusy(true);
    setContextError(false);

    try {
      const removedId = contextMenu.manga.id;
      await controller.removeFromLibrary([removedId]);
      void categoryController.load();

      if (selectedIds.has(removedId)) {
        const remaining = new Set(selectedIds);
        remaining.delete(removedId);
        setSelectedIds(remaining);

        if (remaining.size === 0) {
          setSelectionMode(false);
        }
      }

      closeContextMenu(false);
    } catch {
      setContextError(true);
      closeContextMenu(false);
    } finally {
      setContextBusy(false);
    }
  };

  const toggleSelected = (
    items: readonly LibraryManga[],
    index: number,
    mangaId: number,
    shiftKey: boolean,
  ) => {
    setSelectedIds((current) => {
      const next = new Set(current);

      if (shiftKey && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);

        for (let position = start; position <= end; position += 1) {
          const item = items[position];

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
      void categoryController.load();
      clearSelection();
      setSelectionMode(false);
    } catch {
      setBulkError(true);
    } finally {
      setBulkBusy(false);
    }
  };

  const removeCategory = async () => {
    if (!categoryChoice || selectedIds.size === 0) {
      return;
    }

    setBulkBusy(true);
    setBulkError(false);

    try {
      await controller.removeFromCategory(
        [...selectedIds],
        Number(categoryChoice),
      );
      void categoryController.load();
      clearSelection();
      setSelectionMode(false);
    } catch {
      setBulkError(true);
    } finally {
      setBulkBusy(false);
    }
  };

  const removeSelected = async () => {
    if (selectedIds.size === 0) {
      return;
    }

    setBulkBusy(true);
    setBulkError(false);

    try {
      await controller.removeFromLibrary([...selectedIds]);
      void categoryController.load();
      clearSelection();
      setSelectionMode(false);
    } catch {
      setBulkError(true);
    } finally {
      setBulkBusy(false);
    }
  };

  const isNarrowed = hasNarrowingCriteria(library.filter, library.categoryId);
  const selectedStatuses = library.filter.statuses?.length
    ? library.filter.statuses
    : library.filter.status
      ? [library.filter.status]
      : [];
  const serverFilterCount =
    selectedStatuses.length + (library.filter.sourceId ? 1 : 0);
  const filterCount = serverFilterCount + quickFilters.size;
  const filterActive = filterCount > 0;
  const searchActive = Boolean(search.trim()) || Boolean(library.filter.search?.trim());
  const sortActive =
    randomOrder ||
    library.sort.field !== 'dateAdded' ||
    library.sort.direction !== 'desc';
  const hasAnyRefinement =
    isNarrowed || sortActive || searchActive || quickFilters.size > 0;
  const categoryVisibleItems = library.items.filter(
    (manga) =>
      !(
        nsfw.hideNsfw && nsfw.mangaIds.includes(manga.id)
      ) &&
      (hiddenCategoryIds.size === 0 ||
        !manga.categories.nodes.some((category) =>
          hiddenCategoryIds.has(category.id),
        )),
  );
  const locallyFiltered =
    fuzzy && search.trim()
      ? categoryVisibleItems.filter((manga) =>
          fuzzyMatch(manga.title, search.trim()),
        )
      : categoryVisibleItems;
  const quickFiltered =
    quickFilters.size === 0
      ? locallyFiltered
      : locallyFiltered.filter((manga) =>
          [...quickFilters].every((quickFilter) => {
            if (quickFilter === 'unread') {
              return manga.unreadCount > 0;
            }

            if (quickFilter === 'started') {
              return manga.lastReadChapter !== null;
            }

            if (quickFilter === 'bookmarked') {
              return manga.bookmarkCount > 0;
            }

            if (quickFilter === 'tracked') {
              return manga.trackRecords.totalCount > 0;
            }

            return manga.downloadCount > 0;
          }),
        );
  const displayedItems = randomOrder
    ? shuffled(quickFiltered, randomSeed)
    : quickFiltered;
  const duplicateGroups = useMemo(() => {
    const groups = new Map<string, Array<{ id: number; title: string }>>();

    for (const manga of scannedDuplicates ?? library.items) {
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
  }, [library.items, scannedDuplicates]);

  const resetAll = () => {
    setSearch('');
    writeSearchUrl('', false);
    setRandomOrder(false);
    setRandomSeed(0);
    setFuzzy(false);
    setQuickFilters(new Set());
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

  const scanAllDuplicates = async () => {
    setDuplicateScanBusy(true);
    setDuplicateScanError(false);

    try {
      setScannedDuplicates(await repository.scanDuplicates());
    } catch {
      setDuplicateScanError(true);
    } finally {
      setDuplicateScanBusy(false);
    }
  };

  const showInitialLoading = library.isInitialLoading && library.items.length === 0;
  const showInitialError = Boolean(library.initialError) && library.items.length === 0;

  const applyStatuses = (next: readonly LibraryStatus[]) => {
    const filter = { ...library.filter };
    delete filter.status;
    delete filter.statuses;

    void controller.setFilter({
      ...filter,
      ...(next.length > 0 ? { statuses: [...next] } : {}),
    });
  };

  const toggleStatus = (value: string) => {
    const next = new Set(selectedStatuses);
    const status = value as LibraryStatus;

    if (next.has(status)) {
      next.delete(status);
    } else {
      next.add(status);
    }

    applyStatuses([...next]);
  };

  const toggleQuickFilter = (value: string) => {
    const next = new Set(quickFilters);
    const filter = value as QuickFilter;

    if (next.has(filter)) {
      next.delete(filter);
    } else {
      next.add(filter);
    }

    setQuickFilters(next);
  };

  const selectSource = (value: string) => {
    void controller.setFilter({
      ...library.filter,
      sourceId: value || undefined,
    });
  };

  const resetFilterState = () => {
    const filter = { ...library.filter };
    delete filter.status;
    delete filter.statuses;
    delete filter.sourceId;

    void controller.setFilter(filter);
    setQuickFilters(new Set());
  };

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
      onTouchStart={handleLibraryTouchStart}
      onTouchMove={handleLibraryTouchMove}
      onTouchEnd={handleLibraryTouchEnd}
      onTouchCancel={() => {
        swipeStart.current = null;
      }}
      onClickCapture={handleLibraryClickCapture}
    >
      <header className={`library-header${searchOpen ? ' is-search-open' : ''}`}>
        <div className="library-title">
          <div className="library-title-row">
            <h1>{t('Library')}</h1>
            <p className="library-count" aria-live="polite">
              {countLabel(library.totalCount, library.isInitialLoading, t)}
            </p>
          </div>
          <p className="page-subtitle library-subtitle">
            {t('Manga and progress')}
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
            placeholder={t('Search library')}
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
          <button
            className="library-search-submit"
            type="submit"
            aria-label={t('Submit search')}
            disabled={!search.trim()}
          >
            <IconSearch />
          </button>
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
                    writeSearchUrl(term, fuzzy);
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
              className="library-action"
              type="button"
              title={`Switch to ${
                appPreferences.libraryView === 'grid' ? 'list' : 'grid'
              } view`}
              aria-label={`Current view: ${appPreferences.libraryView}. Switch to ${
                appPreferences.libraryView === 'grid' ? 'list' : 'grid'
              } view`}
              onClick={() =>
                updateAppPreferences({
                  libraryView:
                    appPreferences.libraryView === 'grid' ? 'list' : 'grid',
                })
              }
            >
              {appPreferences.libraryView === 'grid' ? (
                <IconGrid />
              ) : (
                <IconList />
              )}
              <span className="library-action-label">
                {appPreferences.libraryView === 'grid' ? t('Grid') : t('List')}
              </span>
            </button>

            <button
              ref={filterButton}
              className={`library-action${filterActive ? ' is-active' : ''}`}
              type="button"
              aria-label={filterCount > 0 ? `Filter, ${filterCount} active` : 'Filter'}
              aria-haspopup="dialog"
              aria-expanded={filterOpen}
              title="Filter"
              onClick={() => setFilterOpen(true)}
            >
              <IconFilter />
              <span className="library-action-label">Filter</span>
              {filterCount > 0 ? (
                <span className="library-action-count" aria-hidden="true">
                  {filterCount}
                </span>
              ) : null}
              {filterCount > 0 ? (
                <span className="sr-only">, {filterCount} active</span>
              ) : null}
            </button>

            <button
              ref={sortButton}
              className={`library-action${sortActive ? ' is-active' : ''}`}
              type="button"
              aria-label={sortActive ? 'Sort, active' : 'Sort'}
              aria-haspopup="menu"
              aria-expanded={openPanel === 'sort'}
              aria-controls={SORT_MENU_ID}
              title="Sort"
              onClick={() => togglePanel('sort')}
            >
              <IconSort />
              <span className="library-action-label">Sort</span>
              {sortActive ? (
                <span className="library-action-dot" aria-hidden="true" />
              ) : null}
              {sortActive ? <span className="sr-only">, active</span> : null}
            </button>

            <LibraryMenu
              id={SORT_MENU_ID}
              label="Sort options"
              open={openPanel === 'sort'}
              groups={sortGroups}
              onClose={closePanel}
            />

            <ActionMenu
              label="More"
              ariaLabel="More library actions"
              summaryClassName={`library-action${
                fuzzy || duplicatesOpen || hasAnyRefinement
                  ? ' is-active'
                  : ''
              }`}
            >
              <p className="action-menu-section">Library tools</p>
              <button
                type="button"
                aria-pressed={fuzzy}
                onClick={toggleFuzzy}
              >
                <span>Fuzzy</span>
                <span>{fuzzy ? 'On' : ''}</span>
              </button>
              <button
                type="button"
                aria-pressed={duplicatesOpen}
                onClick={() => setDuplicatesOpen((value) => !value)}
              >
                <span>Duplicates ({duplicateGroups.length})</span>
                <span>{duplicatesOpen ? 'On' : ''}</span>
              </button>
              {hasAnyRefinement ? (
                <button type="button" onClick={resetAll}>
                  Reset
                </button>
              ) : null}
              <p className="action-menu-section">Library maintenance</p>
              <button
                type="button"
                title="Save current category, status, and sort as default"
                onClick={saveDefaults}
              >
                Save defaults
              </button>
              <LibrarySyncButton
                context={context}
                className=""
                onComplete={() => void controller.load()}
              />
            </ActionMenu>
          </div>
        </div>
      </header>

      <LibraryFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        triggerRef={filterButton}
        statusOptions={STATUS_OPTIONS.filter((option) => option.value !== '')}
        selectedStatuses={selectedStatuses}
        onToggleStatus={toggleStatus}
        quickOptions={QUICK_FILTER_OPTIONS}
        quickFilters={quickFilters}
        onToggleQuick={toggleQuickFilter}
        sources={sources.map((source) => ({
          value: source.id,
          label: source.displayName,
        }))}
        sourceId={library.filter.sourceId}
        onSelectSource={selectSource}
        categories={displayCategories}
        hiddenCategoryIds={hiddenCategoryIds}
        showAllCategory={showAllCategory}
        onToggleAllCategory={toggleAllCategory}
        onToggleCategoryVisibility={toggleCategoryVisibility}
        onShowAllCategories={showAllCategories}
        onReset={resetFilterState}
        activeCount={filterCount}
      />

      <ContextMenu
        open={contextMenu !== null}
        position={
          contextMenu
            ? { x: contextMenu.x, y: contextMenu.y }
            : { x: 0, y: 0 }
        }
        label={
          contextMenu
            ? `Manga actions for ${contextMenu.manga.title}`
            : 'Manga actions'
        }
        onClose={() => closeContextMenu()}
      >
        {contextMenu ? (
          <>
            <Link
              className="context-menu-item"
              role="menuitem"
              to={`/manga/${contextMenu.manga.id}`}
              state={{ origin }}
              onClick={() => closeContextMenu()}
            >
              View Details
            </Link>
            {contextMenu.manga.lastReadChapter ? (
              <Link
                className="context-menu-item"
                role="menuitem"
                to={`/manga/${contextMenu.manga.id}/chapter/${
                  contextMenu.manga.lastReadChapter.id
                }${
                  contextMenu.manga.lastReadChapter.lastPageRead > 0
                    ? `?page=${contextMenu.manga.lastReadChapter.lastPageRead + 1}`
                    : ''
                }`}
                state={{ origin }}
                onClick={() => closeContextMenu()}
              >
                Continue reading
              </Link>
            ) : (
              <button
                className="context-menu-item"
                type="button"
                role="menuitem"
                disabled
              >
                Continue reading
              </button>
            )}
            <button
              className="context-menu-item"
              type="button"
              role="menuitem"
              onClick={selectContextManga}
            >
              Select
            </button>
            <button
              className="context-menu-item"
              type="button"
              role="menuitem"
              onClick={() => {
                toggleMangaNsfw(
                  contextMenu.manga.id,
                  contextMenu.manga.categories.nodes.map((category) => category.id),
                );
                closeContextMenu();
              }}
            >
              {nsfw.mangaIds.includes(contextMenu.manga.id)
                ? 'Remove NSFW label'
                : 'Label as NSFW'}
            </button>
            <button
              className="context-menu-item is-danger"
              type="button"
              role="menuitem"
              disabled={contextBusy}
              onClick={() => void removeContextManga()}
            >
              {contextBusy ? 'Removing…' : 'Remove from library'}
            </button>
          </>
        ) : null}
      </ContextMenu>

      {duplicatesOpen ? (
        <section className="library-duplicates" aria-labelledby="duplicates-heading">
          <div className="section-heading-row">
            <h2 id="duplicates-heading">Possible duplicates</h2>
            <span className="library-duplicate-actions">
              <button
                className="library-action"
                type="button"
                disabled={duplicateScanBusy}
                onClick={() => void scanAllDuplicates()}
              >
                {duplicateScanBusy
                  ? 'Scanning…'
                  : scannedDuplicates
                    ? 'Rescan library'
                    : 'Scan all library'}
              </button>
              <button
                className="library-action"
                type="button"
                onClick={() => setDuplicatesOpen(false)}
              >
                Close
              </button>
            </span>
          </div>
          {duplicateScanError ? (
            <p className="alert alert-error" role="alert">
              Could not scan the full library.
            </p>
          ) : null}
          {duplicateGroups.length > 0 ? (
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
          ) : (
            <p className="settings-save-state">
              {scannedDuplicates
                ? 'No duplicate titles found in the full library.'
                : 'No duplicates in the loaded page. Scan the full library to check everything.'}
            </p>
          )}
        </section>
      ) : null}

      <nav className="category-nav" aria-label="Library categories">
        <div className="category-tabs" ref={categoryTabsRef}>
          {showAllCategory ? (
            <button
              className="category-tab"
              type="button"
              aria-pressed={library.categoryId === null}
              aria-label="All"
              onClick={() => handleCategory(null)}
            >
              All
              <span className="category-tab-count">
                {(allLibraryLoaded
                  ? visibleLoadedItems.length
                  : Math.max(
                      0,
                      library.totalCount -
                        (nsfw.hideNsfw ? nsfw.mangaIds.length : 0),
                    )
                ).toLocaleString('en-US')}
              </span>
            </button>
          ) : null}
          {visibleCategories.map((category) => (
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

      {contextError ? (
        <p className="library-note library-note-warning" role="alert">
          Couldn&apos;t update the library.
        </p>
      ) : null}

      {selectionMode ? (
        <div
          className="library-selection-bar"
          role="toolbar"
          aria-label="Bulk manga actions"
          aria-busy={bulkBusy}
        >
          <div className="library-selection-rail">
            <span className="library-bulk-status" role="status">
              {bulkBusy ? 'Working…' : ''}
            </span>

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
                  className="library-action"
                  type="button"
                  disabled={!categoryChoice || bulkBusy || selectedIds.size === 0}
                  onClick={() => void removeCategory()}
                >
                  Remove from category
                </button>
                <button
                  className="library-action is-danger"
                  type="button"
                  disabled={bulkBusy || selectedIds.size === 0}
                  onClick={() => setConfirmRemove(true)}
                >
                  Remove from library
                </button>
              </>
            )}

            {bulkError ? (
              <span className="library-selection-error" role="alert">
                Bulk action failed.
              </span>
            ) : null}
          </div>

          <button
            className="library-selection-clear"
            type="button"
            aria-label="Clear selection"
            title="Clear selection"
            onClick={() => {
              clearSelection();
              setSelectionMode(false);
            }}
          >
            <IconClose />
          </button>
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
              <div className="actions">
                {isNarrowed ? (
                  <button className="button" type="button" onClick={resetAll}>
                    Reset filters
                  </button>
                ) : (
                  <Link className="button" to="/browse">
                    Browse sources
                  </Link>
                )}
              </div>
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
                  showBadges={appPreferences.libraryBadges}
                  onToggle={(shiftKey) =>
                    toggleSelected(displayedItems, index, manga.id, shiftKey)
                  }
                  onContextMenu={(position, trigger) => {
                    setContextError(false);
                    contextTriggerRef.current = trigger;
                    setContextMenu({
                      manga,
                      index,
                      x: position.x,
                      y: position.y,
                    });
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

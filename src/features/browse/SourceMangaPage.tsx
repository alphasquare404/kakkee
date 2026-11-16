import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import { useAppPath } from '../../app/useAppPath';
import { ActionMenu } from '../../shared/ActionMenu';
import { BackButton } from '../../shared/BackButton';
import { FilterDrawer } from '../../shared/FilterDrawer';
import { ContextMenu } from '../../shared/ContextMenu';
import {
  createSectionOrigin,
  type NavigationOrigin,
} from '../../app/navigationOrigin';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  createSourceController,
} from '../../core/source/sourceController';
import {
  createSourceRepository,
  type SourceManga,
} from '../../core/source/sourceRepository';
import { useImageResource } from '../../shared/useImageResource';
import { PageHeader } from '../../shared/PageHeader';
import {
  IconCheck,
  IconClose,
  IconFilter,
  IconSearch,
} from '../library/icons';
import { SourcePreferencesSection } from './SourcePreferencesSection';
import { SourceFilterPanel, type SourceFilterData } from './SourceFilterPanel';
import { MangaBookmarkChoices } from '../manga/MangaBookmarkChoices';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { useAppPreferences } from '../../shared/useAppPreferences';

registerMessages('id', {
  Source: 'Source',
  'Source manga catalog': 'Katalog manga source',
  'All sources': 'Semua source',
  'Source actions': 'Aksi source',
  Popular: 'Populer',
  Latest: 'Terbaru',
  'Hide in library': 'Sembunyikan yang ada di perpustakaan',
  'Duplicates only': 'Hanya duplikat',
  Filters: 'Filter',
  'Source filters': 'Filter source',
  'Result filters': 'Filter hasil',
  'Search source': 'Cari di source',
  'Open source search': 'Buka pencarian source',
  'Search this source…': 'Cari di source ini…',
  'Clear history': 'Hapus riwayat',
  'Library change was rejected by the server.':
    'Perubahan perpustakaan ditolak server.',
  'Couldn’t load this source': 'Tidak dapat memuat source ini',
  'The source catalog could not be loaded.':
    'Katalog source tidak dapat dimuat.',
  Retry: 'Coba lagi',
  'No manga found': 'Tidak ada manga',
  'Try another search or catalog type.':
    'Coba pencarian atau tipe katalog lain.',
  'Clear search': 'Hapus pencarian',
  'Clear filters': 'Hapus filter',
  'No manga match these filters': 'Tidak ada manga yang cocok',
  'Turn off a filter or adjust the search.':
    'Matikan filter atau sesuaikan pencarian.',
  'Add to library': 'Tambahkan ke perpustakaan',
  'Remove from library': 'Hapus dari perpustakaan',
  'Adding…': 'Menambahkan…',
  'Removing…': 'Menghapus…',
});
import { useSourceSearchHistory } from '../../shared/useSourceSearchHistory';
import {
  autoLabelMangas,
  useNsfwPreferences,
} from '../../core/preferences/nsfwPreferences';
import {
  addSourceSearch,
  clearSourceSearchHistory,
} from '../../core/preferences/sourceSearchHistory';

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

export function SourceMangaPage() {  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <SourceMangaContent context={state.context} />;
}

function SourceMangaContent({ context }: { readonly context: ConnectedContext }) {
  const { t } = useI18n();
  const appPreferences = useAppPreferences();
  const { sourceId = '' } = useParams();
  const repository = useMemo(
    () => createSourceRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const controller = useMemo(
    () => createSourceController(repository),
    [repository],
  );
  const source = useSyncExternalStore(controller.subscribe, controller.getState);
  const nsfw = useNsfwPreferences();

  useEffect(() => {
    if (source.source?.contentWarning !== 'NSFW') {
      return;
    }

    autoLabelMangas(source.mangas.map((manga) => manga.id));
  }, [source.mangas, source.source?.contentWarning]);
  const { pathname, search: searchString } = useAppPath();
  const origin = createSectionOrigin('browse', {
    pathname,
    search: searchString,
    trail: [
      { pathname: '/browse', labelKey: 'Browse' },
      {
        pathname,
        search: searchString,
        label: source.source?.displayName ?? t('Source'),
      },
    ],
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamKey = searchParams.toString();
  const initialQuery = searchParams.get('q') ?? '';
  const initialQueryRef = useRef(initialQuery);
  const [search, setSearch] = useState(initialQuery);
  const searchRef = useRef(search);
  searchRef.current = search;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const filtersButton = useRef<HTMLButtonElement>(null);
  const preferencesButton = useRef<HTMLElement>(null);
  const sourceSearchInput = useRef<HTMLInputElement>(null);
  const loadMoreSentinel = useRef<HTMLDivElement>(null);
  const sourceContextTrigger = useRef<HTMLElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sourceContext, setSourceContext] = useState<{
    readonly manga: SourceManga;
    readonly x: number;
    readonly y: number;
  } | null>(null);
  const [categoryManga, setCategoryManga] = useState<SourceManga | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [hideInLibrary, setHideInLibrary] = useState(false);
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);
  const activeFilterCount =
    filterCount + (hideInLibrary ? 1 : 0) + (duplicatesOnly ? 1 : 0);
  const searchHistory = useSourceSearchHistory(sourceId);

  const runSearch = (value: string) => {
    const query = value.trim();

    if (query) {
      addSourceSearch(sourceId, query);
    }

    setHistoryOpen(false);
    setSearchParams(query ? { q: query } : {}, { replace: true });
    void controller.search(query);
  };

  const titleCounts = new Map<string, number>();

  for (const manga of source.mangas) {
    const key = normalizeTitle(manga.title);

    if (key) {
      titleCounts.set(key, (titleCounts.get(key) ?? 0) + 1);
    }
  }

  const visibleMangas = source.mangas.filter((manga) => {
    if (nsfw.hideNsfw && nsfw.mangaIds.includes(manga.id)) {
      return false;
    }

    if (hideInLibrary && manga.inLibrary) {
      return false;
    }

    if (duplicatesOnly) {
      const key = normalizeTitle(manga.title);
      return Boolean(key) && (titleCounts.get(key) ?? 0) > 1;
    }

    return true;
  });

  useEffect(() => {
    let active = true;

    void controller.load(sourceId).then(() => {
      if (active && initialQueryRef.current) {
        void controller.search(initialQueryRef.current);
      }
    });

    return () => {
      active = false;
    };
  }, [controller, sourceId]);

  useEffect(() => {
    const params = new URLSearchParams(searchParamKey);
    const urlQuery = params.get('q') ?? '';

    if (urlQuery === searchRef.current.trim()) {
      return;
    }

    setSearch(urlQuery);
    void controller.search(urlQuery);
  }, [controller, searchParamKey]);

  useEffect(() => {
    if (
      typeof IntersectionObserver === 'undefined' ||
      !source.hasNextPage ||
      source.loadingMore ||
      source.status !== 'ready'
    ) {
      return;
    }

    const node = loadMoreSentinel.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void controller.loadMore();
        }
      },
      { rootMargin: '600px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [controller, source.hasNextPage, source.loadingMore, source.status]);

  const categoryMangaCurrent = categoryManga
    ? source.mangas.find((item) => item.id === categoryManga.id) ?? categoryManga
    : null;

  const setMangaLibrary = async (
    manga: SourceManga,
    inLibrary: boolean,
  ): Promise<void> => {
    const current =
      source.mangas.find((item) => item.id === manga.id) ?? manga;

    if (current.inLibrary !== inLibrary) {
      await controller.toggleLibrary(current);
    }
  };

  return (
    <div className="app-shell page-shell browse-shell">
      <PageHeader
        title={source.source?.displayName ?? t('Source')}
        subtitle={source.source?.name ?? t('Source manga catalog')}
        leading={<BackButton to="/browse" label={t('All sources')} />}
        toolbar={
          <form
            id="source-search-form"
            className={`library-search header-search-form${searchOpen ? ' is-open' : ''}`}
            role="search"
            onSubmit={(event) => {
              event.preventDefault();

              if (source.status !== 'loading') {
                runSearch(search);
              }
            }}
          >
            <IconSearch className="library-search-icon" />
            <span className="sr-only">{t('Search source')}</span>
            <input
              ref={sourceSearchInput}
              type="search"
              aria-label={t('Search source')}
              placeholder={t('Search this source…')}
              value={search}
              enterKeyHint="search"
              autoComplete="off"
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => setHistoryOpen(true)}
              onClick={() => setHistoryOpen(true)}
              onBlur={() => window.setTimeout(() => setHistoryOpen(false), 120)}
            />
            <button
              className="library-search-submit"
              type="submit"
              aria-label={t('Search source')}
              disabled={source.status === 'loading'}
            >
              <IconSearch />
            </button>
            {search ? (
              <button
                type="button"
                className="library-search-clear"
                aria-label={t('Clear search')}
                onClick={() => {
                  setSearch('');
                  runSearch('');
                  sourceSearchInput.current?.focus();
                }}
              >
                <IconClose />
              </button>
            ) : null}
            {historyOpen && searchHistory.length > 0 ? (
              <div
                className="source-search-history"
                role="listbox"
                aria-label="Recent source searches"
              >
                {searchHistory.map((term) => (
                  <button
                    key={term}
                    type="button"
                    role="option"
                    aria-selected={false}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setSearch(term);
                      runSearch(term);
                    }}
                  >
                    {term}
                  </button>
                ))}
                <button
                  className="source-search-history-clear"
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => clearSourceSearchHistory(sourceId)}
                >
                  {t('Clear history')}
                </button>
              </div>
            ) : null}
          </form>
        }
      >
        <button
          className={`library-action source-header-action library-search-toggle${searchOpen ? ' is-active' : ''}`}
          type="button"
          aria-label={searchOpen ? t('Close search') : t('Open source search')}
          aria-expanded={searchOpen}
          aria-controls="source-search-form"
          onClick={() => {
            if (searchOpen) {
              setSearchOpen(false);
            } else {
              setSearchOpen(true);
              window.setTimeout(() => sourceSearchInput.current?.focus(), 0);
            }
          }}
        >
          <IconSearch />
        </button>
        <button
          ref={filtersButton}
          className={`library-action source-header-action${activeFilterCount > 0 ? ' is-active' : ''}`}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={filtersOpen}
          aria-label={
            activeFilterCount > 0
              ? `${t('Filters')}, ${activeFilterCount} active`
              : t('Filters')
          }
          title={t('Filters')}
          onClick={() => setFiltersOpen(true)}
        >
          <IconFilter />
          <span className="library-action-label">{t('Filters')}</span>
          {activeFilterCount > 0 ? (
            <span className="library-action-count" aria-hidden="true">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
        <ActionMenu
          label={<MoreVerticalIcon />}
          ariaLabel={t('Source actions')}
          showChevron={false}
          summaryClassName="library-action source-header-action"
          triggerRef={preferencesButton}
        >
          <button
            type="button"
            onClick={() => setPreferencesOpen(true)}
          >
            {t('Source preferences')}
          </button>
        </ActionMenu>
      </PageHeader>

      <div className="source-manga-controls">
        <div className="browse-filters" role="group" aria-label="Source catalog type">
          <button
            className={source.type === 'POPULAR' && !source.query ? 'is-active' : undefined}
            type="button"
            aria-pressed={source.type === 'POPULAR' && !source.query}
            onClick={() => void controller.setType('POPULAR')}
          >
            {t('Popular')}
          </button>
          <button
            className={source.type === 'LATEST' ? 'is-active' : undefined}
            type="button"
            aria-pressed={source.type === 'LATEST'}
            onClick={() => void controller.setType('LATEST')}
          >
            {t('Latest')}
          </button>
        </div>
      </div>

      <FilterDrawer
        open={filtersOpen}
        title={t('Source filters')}
        description={source.source?.displayName}
        onClose={() => setFiltersOpen(false)}
        triggerRef={filtersButton}
      >
        <details className="filter-section" open>
          <summary>{t('Result filters')}</summary>
          <div className="filter-section-content">
            <label className="settings-toggle">
              <span>{t('Hide in library')}</span>
              <input
                type="checkbox"
                checked={hideInLibrary}
                onChange={(event) => setHideInLibrary(event.target.checked)}
              />
            </label>
            <label className="settings-toggle">
              <span>{t('Duplicates only')}</span>
              <input
                type="checkbox"
                checked={duplicatesOnly}
                onChange={(event) => setDuplicatesOnly(event.target.checked)}
              />
            </label>
          </div>
        </details>

        {source.source ? (
          <SourceFilterPanel
            filters={source.source.filters as unknown as readonly SourceFilterData[]}
            busy={source.status === 'loading'}
            onReset={() => {
              setHideInLibrary(false);
              setDuplicatesOnly(false);
              setFilterCount(0);
            }}
            onApply={(changes, activeCount) => {
              setFilterCount(activeCount);
              void controller.setFilters(changes);
              setFiltersOpen(false);
            }}
          />
        ) : null}
      </FilterDrawer>

      <FilterDrawer
        open={preferencesOpen}
        title={t('Source preferences')}
        description={source.source?.displayName}
        onClose={() => setPreferencesOpen(false)}
        triggerRef={preferencesButton}
      >
        <SourcePreferencesSection context={context} sourceId={sourceId} />
      </FilterDrawer>

      {source.actionError ? (
        <p className="settings-inline-error" role="alert">
          {t('Library change was rejected by the server.')}
        </p>
      ) : null}

      {source.status === 'loading' && source.mangas.length === 0 ? (
        <div className="source-manga-grid" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <div className="source-manga-card source-manga-skeleton" key={index} />
          ))}
        </div>
      ) : null}

      {source.status === 'error' ? (
        <div className="library-state" role="alert">
          <h1>{t('Couldn’t load this source')}</h1>
          <p>{t('The source catalog could not be loaded.')}</p>
          <button className="button" type="button" onClick={() => void controller.load(sourceId)}>
            {t('Retry')}
          </button>
        </div>
      ) : null}

      {source.status === 'ready' && source.mangas.length === 0 ? (
        <div className="library-state">
          <h1>{t('No manga found')}</h1>
          <p>{t('Try another search or catalog type.')}</p>
          <div className="actions">
            {source.query || search.trim() ? (
              <button
                className="button button-secondary"
                type="button"
                onClick={() => {
                  setSearch('');
                  runSearch('');
                }}
              >
                {t('Clear search')}
              </button>
            ) : null}
            <Link className="button button-secondary" to="/browse">
              {t('All sources')}
            </Link>
          </div>
        </div>
      ) : null}

      {source.status === 'ready' && source.mangas.length > 0 && visibleMangas.length === 0 ? (
        <div className="library-state">
          <h1>{t('No manga match these filters')}</h1>
          <p>{t('Turn off a filter or adjust the search.')}</p>
          <div className="actions">
            <button
              className="button"
              type="button"
              onClick={() => {
                setHideInLibrary(false);
                setDuplicatesOnly(false);
                void controller.setFilters([]);
              }}
            >
              {t('Clear filters')}
            </button>
          </div>
        </div>
      ) : null}

      {visibleMangas.length > 0 ? (
        <>
          <div className="source-manga-grid">
            {visibleMangas.map((manga) => (
              <SourceMangaCard
                key={manga.id}
                manga={manga}
                resources={context.resources}
                origin={origin}
                busy={source.pendingLibraryId === manga.id}
                onToggleLibrary={() => {
                  if (
                    !manga.inLibrary &&
                    !appPreferences.quickAddToDefaultLibrary
                  ) {
                    setCategoryManga(manga);
                    return;
                  }

                  void controller.toggleLibrary(manga);
                }}
                onContextMenu={(_position, trigger) => {
                  sourceContextTrigger.current = trigger;
                  setSourceContext({
                    manga,
                    x: _position.x,
                    y: _position.y,
                  });
                }}
              />
            ))}
          </div>
          {source.hasNextPage ? (
            <div
              ref={loadMoreSentinel}
              className="source-load-sentinel"
              aria-hidden="true"
            />
          ) : null}
          {source.loadingMore ? (
            <p className="source-auto-loading" role="status">
              {t('Loading…')}
            </p>
          ) : null}
        </>
      ) : null}

      <ContextMenu
        open={sourceContext !== null}
        position={
          sourceContext
            ? { x: sourceContext.x, y: sourceContext.y }
            : { x: 0, y: 0 }
        }
        label={
          sourceContext
            ? `Manga actions for ${sourceContext.manga.title}`
            : 'Manga actions'
        }
        onClose={() => setSourceContext(null)}
        returnFocusRef={sourceContextTrigger}
      >
        {sourceContext ? (
          <>
            <Link
              className="context-menu-item"
              role="menuitem"
              to={`/manga/${sourceContext.manga.id}`}
              state={{ origin }}
              onClick={() => setSourceContext(null)}
            >
              {t('View details')}
            </Link>
            {sourceContext.manga.inLibrary ? (
              <>
                <button
                  className="context-menu-item"
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setCategoryManga(sourceContext.manga);
                    setSourceContext(null);
                  }}
                >
                  {t('Manage categories')}
                </button>
                <button
                  className="context-menu-item is-danger"
                  type="button"
                  role="menuitem"
                  disabled={source.pendingLibraryId === sourceContext.manga.id}
                  onClick={() => {
                    const manga = sourceContext.manga;
                    setSourceContext(null);
                    void setMangaLibrary(manga, false);
                  }}
                >
                  {t('Remove from library')}
                </button>
              </>
            ) : appPreferences.quickAddToDefaultLibrary ? (
              <button
                className="context-menu-item"
                type="button"
                role="menuitem"
                disabled={source.pendingLibraryId === sourceContext.manga.id}
                onClick={() => {
                  const manga = sourceContext.manga;
                  setSourceContext(null);
                  void setMangaLibrary(manga, true);
                }}
              >
                {t('Add to library')}
              </button>
            ) : (
              <button
                className="context-menu-item"
                type="button"
                role="menuitem"
                onClick={() => {
                  setCategoryManga(sourceContext.manga);
                  setSourceContext(null);
                }}
              >
                {t('Add to library and choose categories')}
              </button>
            )}
          </>
        ) : null}
      </ContextMenu>

      <FilterDrawer
        open={categoryMangaCurrent !== null}
        title={t('Add to library')}
        description={categoryMangaCurrent?.title}
        onClose={() => setCategoryManga(null)}
        triggerRef={sourceContextTrigger}
      >
        {categoryMangaCurrent ? (
          <MangaBookmarkChoices
            context={context}
            mangaId={categoryMangaCurrent.id}
            inLibrary={categoryMangaCurrent.inLibrary}
            onSetLibrary={(inLibrary) =>
              setMangaLibrary(categoryMangaCurrent, inLibrary)
            }
          />
        ) : null}
      </FilterDrawer>
    </div>
  );
}

function SourceMangaCard({
  manga,
  resources,
  origin,
  busy,
  onToggleLibrary,
  onContextMenu,
}: {
  readonly manga: SourceManga;
  readonly resources: ConnectedContext['resources'];
  readonly origin: NavigationOrigin;
  readonly busy: boolean;
  readonly onToggleLibrary: () => void;
  readonly onContextMenu: (
    position: { readonly x: number; readonly y: number },
    trigger: HTMLElement,
  ) => void;
}) {
  const { t } = useI18n();
  const image = useImageResource(resources, manga.thumbnailUrl);
  const longPressTimer = useRef<number | null>(null);
  const longPressPoint = useRef<{ x: number; y: number } | null>(null);
  const longPressTriggered = useRef(false);

  const clearLongPress = () => {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    longPressPoint.current = null;
  };

  const openContextMenu = (
    x: number,
    y: number,
    trigger: HTMLElement,
  ) => {
    clearLongPress();
    onContextMenu({ x, y }, trigger);
  };

  const startLongPress = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse') {
      return;
    }

    clearLongPress();
    longPressTriggered.current = false;
    longPressPoint.current = { x: event.clientX, y: event.clientY };
    const trigger = event.currentTarget;
    longPressTimer.current = window.setTimeout(() => {
      longPressTimer.current = null;
      longPressTriggered.current = true;
      openContextMenu(event.clientX, event.clientY, trigger);
      window.setTimeout(() => {
        longPressTriggered.current = false;
      }, 900);
    }, 500);
  };

  const moveLongPress = (event: React.PointerEvent<HTMLElement>) => {
    const origin = longPressPoint.current;

    if (
      !origin ||
      Math.abs(event.clientX - origin.x) > 10 ||
      Math.abs(event.clientY - origin.y) > 10
    ) {
      clearLongPress();
    }
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    openContextMenu(event.clientX, event.clientY, event.currentTarget);
  };

  return (
    <article
      className="source-manga-card"
      onContextMenu={handleContextMenu}
      onPointerDown={startLongPress}
      onPointerMove={moveLongPress}
      onPointerUp={clearLongPress}
      onPointerCancel={clearLongPress}
      onPointerLeave={clearLongPress}
      onClickCapture={(event) => {
        if (longPressTriggered.current) {
          longPressTriggered.current = false;
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <div className="source-manga-cover-wrap">
        <Link
          className="source-manga-cover"
          to={`/manga/${manga.id}`}
          state={{ origin }}
          aria-label={`${manga.title}, manga details`}
        >
          {image.objectUrl ? (
            <img src={image.objectUrl} alt="" loading="lazy" decoding="async" />
          ) : (
            <span>{manga.title.trim().charAt(0).toUpperCase() || 'M'}</span>
          )}
        </Link>
        <button
          className={`source-library-button${manga.inLibrary ? ' is-in-library' : ''}`}
          type="button"
          disabled={busy}
          aria-pressed={manga.inLibrary}
          aria-label={
            manga.inLibrary ? t('Remove from library') : t('Add to library')
          }
          title={manga.inLibrary ? t('Remove from library') : t('Add to library')}
          onClick={onToggleLibrary}
        >
          {busy ? (
            <span className="source-library-busy" aria-hidden="true">...</span>
          ) : manga.inLibrary ? (
            <IconCheck aria-hidden="true" />
          ) : (
            <span aria-hidden="true">+</span>
          )}
        </button>
      </div>
      <h2 title={manga.title}>{manga.title}</h2>
    </article>
  );
}



function MoreVerticalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <circle cx="10" cy="4.5" r="1.45" />
      <circle cx="10" cy="10" r="1.45" />
      <circle cx="10" cy="15.5" r="1.45" />
    </svg>
  );
}

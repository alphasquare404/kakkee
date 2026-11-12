import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import { useAppPath } from '../../app/useAppPath';
import {
  createSectionOrigin,
  type NavigationOrigin,
} from '../../app/navigationOrigin';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { addSearchHistory } from '../../core/preferences/searchHistory';
import type { CatalogSource } from '../../core/catalog/catalogRepository';
import { createCatalogRepository } from '../../core/catalog/catalogRepository';
import { createLoadableController } from '../../core/catalog/loadableController';
import {
  createSourceRepository,
  type SourceManga,
} from '../../core/source/sourceRepository';
import {
  createMultiSourceSearchController,
  type MultiSourceSearchState,
} from '../../core/search/multiSourceSearchController';
import { useImageResource } from '../../shared/useImageResource';
import { useSearchHistory } from '../../shared/useSearchHistory';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { useSearchPreferences } from '../../shared/useSearchPreferences';
import { useSourcePreferences } from '../../shared/useSourcePreferences';
import { languageName } from '../browse/sourceDirectory';
import { SearchCommandBar } from './SearchCommandBar';
import { SearchFilterDrawer } from './SearchFilterDrawer';
import {
  activeSearchFilterCount,
  selectedSearchSources,
} from './searchScope';

registerMessages('id', {
  Search: 'Cari',
  'Search manga': 'Cari manga',
  'Search manga across selected sources':
    'Cari manga di sumber yang dipilih',
  '{count} results': '{count} hasil',
  '{count} result': '{count} hasil',
  'Search manga...': 'Cari manga...',
  'Clear manga search': 'Hapus pencarian manga',
  'No sources selected': 'Belum ada sumber dipilih',
  'Search across the selected sources.': 'Cari di sumber yang dipilih.',
  'Open filters to choose at least one source.':
    'Buka filter untuk memilih minimal satu sumber.',
  'Searching {done}/{total} sources': 'Mencari {done}/{total} sumber',
  'Search complete': 'Pencarian selesai',
  'Some sources could not be searched': 'Sebagian sumber gagal dicari',
  '{count} sources failed': '{count} sumber gagal',
  'Search failed': 'Pencarian gagal',
  Retry: 'Coba lagi',
  'No results': 'Tidak ada hasil',
  'No manga matched "{query}".': 'Tidak ada manga yang cocok dengan "{query}".',
  'No results from {source}.': 'Tidak ada hasil dari {source}.',
  'Couldn’t search {source}.': 'Tidak dapat mencari di {source}.',
  'Try a different query or choose more sources.':
    'Coba kata kunci lain atau pilih lebih banyak sumber.',
  'Load more from {source}': 'Muat lebih banyak dari {source}',
  'Loading…': 'Memuat…',
  'More sources': 'Sumber lainnya',
  'Source results': 'Hasil per sumber',
  'All sources': 'Semua sumber',
  All: 'Semua',
  'In library': 'Di perpustakaan',
  'Not in library': 'Tidak di perpustakaan',
  '{count} unread': '{count} belum dibaca',
  'Search history': 'Riwayat pencarian',
  'Recent searches': 'Pencarian terakhir',
  'Clear history': 'Hapus riwayat',
  Sources: 'Sumber',
  'Filters': 'Filter',
  'Filter search': 'Filter pencarian',
  'Show NSFW sources': 'Tampilkan sumber NSFW',
  'NSFW sources hidden': 'Sumber NSFW disembunyikan',
  'Loading sources…': 'Memuat sumber…',
  'Couldn’t load sources': 'Tidak dapat memuat sumber',
  'The source catalog could not be loaded.': 'Katalog sumber tidak dapat dimuat.',
});

function sourceCount(
  state: MultiSourceSearchState['sources'][string] | undefined,
): string {
  if (!state) {
    return '…';
  }

  if (state.status === 'loading') {
    return '…';
  }

  if (state.status === 'error') {
    return '!';
  }

  return `${state.mangas.length}${state.hasNextPage ? '+' : ''}`;
}

function resultCount(state: MultiSourceSearchState): string {
  const loaded = Object.values(state.sources).reduce(
    (total, source) => total + source.mangas.length,
    0,
  );
  const hasMore = Object.values(state.sources).some(
    (source) => source.hasNextPage,
  );

  return `${loaded}${hasMore ? '+' : ''}`;
}

export function GlobalSearchPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <SearchContent context={state.context} />;
}

function SearchContent({ context }: { readonly context: ConnectedContext }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { pathname, search: searchString } = useAppPath();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') ?? '';
  const tabParam = searchParams.get('tab') ?? 'all';
  const [queryInput, setQueryInput] = useState(queryParam);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterButton = useRef<HTMLButtonElement>(null);
  const searchPreferences = useSearchPreferences();
  const sourcePreferences = useSourcePreferences();
  const history = useSearchHistory();
  const origin = createSectionOrigin('search', {
    pathname,
    search: searchString,
  });

  const sourceRepository = useMemo(
    () => createSourceRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const catalogRepository = useMemo(
    () => createCatalogRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const sourceController = useMemo(
    () => createLoadableController({ load: () => catalogRepository.getSources() }),
    [catalogRepository],
  );
  const sources = useSyncExternalStore(
    sourceController.subscribe,
    sourceController.getState,
  );
  const searchController = useMemo(
    () =>
      createMultiSourceSearchController({
        fetchPage: (sourceId, page, query) =>
          sourceRepository.fetchManga({
            sourceId,
            type: 'SEARCH',
            query,
            page,
          }),
      }),
    [sourceRepository],
  );
  const search = useSyncExternalStore(
    searchController.subscribe,
    searchController.getState,
  );

  useEffect(() => {
    void sourceController.load();
  }, [sourceController]);

  useEffect(() => {
    setQueryInput(queryParam);
  }, [queryParam]);

  const items = useMemo(() => sources.data?.items ?? [], [sources.data]);
  const selectedSources = useMemo(
    () =>
      selectedSearchSources(
        items,
        searchPreferences,
        sourcePreferences.showNsfw,
      ),
    [items, searchPreferences, sourcePreferences.showNsfw],
  );
  const selectedKey = selectedSources.map((source) => source.id).join('|');
  const activeFilterCount = activeSearchFilterCount(
    searchPreferences,
    sourcePreferences.showNsfw,
  );
  const sourcesReady = Boolean(sources.data) && !sources.error;

  useEffect(() => {
    if (!queryParam || selectedSources.length === 0) {
      searchController.cancel();
      return;
    }

    void searchController.start(
      queryParam,
      selectedSources.map((source) => source.id),
    );
  }, [queryParam, selectedKey, searchController, selectedSources]);

  useEffect(() => {
    if (
      tabParam !== 'all' &&
      !selectedSources.some((source) => source.id === tabParam)
    ) {
      const next = new URLSearchParams(searchParams);
      next.delete('tab');
      setSearchParams(next, { replace: true });
    }
  }, [selectedSources, setSearchParams, tabParam, searchParams]);

  const setTab = (tab: string) => {
    const next = new URLSearchParams(searchParams);

    if (tab === 'all') {
      next.delete('tab');
    } else {
      next.set('tab', tab);
    }

    setSearchParams(next, { replace: true });
  };

  const submit = () => {
    const value = queryInput.trim();

    if (!value) {
      navigate('/browse');
      return;
    }

    addSearchHistory(value);
    setSearchParams({ q: value }, { replace: false });
  };

  const closeFilters = () => {
    setFiltersOpen(false);
    filterButton.current?.focus({ preventScroll: true });
  };

  const tabSources =
    selectedSources.length <= 8
      ? selectedSources
      : selectedSources.filter((source) => {
          const result = search.sources[source.id];
          return (
            source.id === tabParam ||
            result?.status === 'error' ||
            (result?.status === 'ready' && result.mangas.length > 0)
          );
        });
  const activeTab =
    tabParam === 'all' || selectedSources.some((source) => source.id === tabParam)
      ? tabParam
      : 'all';
  const limitedTabSources =
    selectedSources.length > 8 ? tabSources.slice(0, 6) : tabSources;
  const activeTabSource =
    activeTab === 'all'
      ? null
      : selectedSources.find((source) => source.id === activeTab);
  const visibleTabSources =
    activeTabSource && !limitedTabSources.some((source) => source.id === activeTab)
      ? [...limitedTabSources, activeTabSource]
      : limitedTabSources;
  const activeSource =
    activeTab === 'all'
      ? null
      : selectedSources.find((source) => source.id === activeTab) ?? null;
  const allResults = selectedSources.flatMap((source) => {
    const result = search.sources[source.id];

    if (!result || result.status !== 'ready') {
      return [];
    }

    return result.mangas.map((manga) => ({ manga, source }));
  });
  const activeResults =
    activeTab === 'all'
      ? allResults
      : allResults.filter(({ source }) => source.id === activeTab);
  const failedSources = selectedSources.filter(
    (source) => search.sources[source.id]?.status === 'error',
  );
  const searching =
    Boolean(queryParam) &&
    selectedSources.length > 0 &&
    (search.status === 'searching' || search.query !== queryParam);
  const activeSourceState =
    activeTab === 'all' ? undefined : search.sources[activeTab];

  const handleTabKey = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }

    event.preventDefault();
    const tabs = ['all', ...visibleTabSources.map((source) => source.id)];
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const next = (index + direction + tabs.length) % tabs.length;
    const tab = tabs[next];

    if (tab) {
      setTab(tab);
      document.getElementById(`search-tab-${tab}`)?.focus();
    }
  };

  const activeCountLabel =
    activeTab === 'all'
      ? resultCount(search)
      : activeSourceState
        ? sourceCount(activeSourceState)
        : '0';
  const headerCount =
    queryParam && search.status === 'ready'
      ? t('{count} results', { count: activeCountLabel })
      : undefined;

  return (
    <div className="app-shell page-shell browse-shell sources-shell search-shell">
      <PageHeader
        title={t('Search')}
        subtitle={t('Search manga across selected sources')}
        count={headerCount}
        toolbar={
          <SearchCommandBar
            query={queryInput}
            onQueryChange={setQueryInput}
            onSubmit={submit}
            onOpenFilters={() => setFiltersOpen(true)}
            filterButtonRef={filterButton}
            activeFilterCount={activeFilterCount}
            filtersOpen={filtersOpen}
            onClear={() => navigate('/browse')}
          />
        }
      />

      <SearchFilterDrawer
        open={filtersOpen}
        sources={items}
        triggerRef={filterButton}
        onClose={closeFilters}
      />

      {queryParam && sources.isLoading && !sources.data ? (
        <div className="search-progress" role="status" aria-live="polite">
          <span>{t('Loading sources…')}</span>
        </div>
      ) : null}

      {queryParam && sources.error && !sources.data ? (
        <div className="search-empty" role="alert">
          <h2>{t('Couldn’t load sources')}</h2>
          <p>{t('The source catalog could not be loaded.')}</p>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void sourceController.load()}
          >
            {t('Retry')}
          </button>
        </div>
      ) : null}

      {queryParam && sourcesReady ? (
        <div className="search-results-toolbar">
          <div
            className="search-source-tabs"
            role="tablist"
            aria-label={t('Source results')}
          >
            <button
              id="search-tab-all"
              role="tab"
              type="button"
              aria-controls="search-results-panel"
              aria-selected={activeTab === 'all'}
              tabIndex={activeTab === 'all' ? 0 : -1}
              className={activeTab === 'all' ? 'is-active' : undefined}
              onClick={() => setTab('all')}
              onKeyDown={(event) => handleTabKey(event, 0)}
            >
              {t('All')} {resultCount(search)}
            </button>
            {visibleTabSources.map((source, index) => {
              const result = search.sources[source.id];

              return (
                <button
                  key={source.id}
                  id={`search-tab-${source.id}`}
                  role="tab"
                  type="button"
                  aria-controls="search-results-panel"
                  aria-selected={activeTab === source.id}
                  tabIndex={activeTab === source.id ? 0 : -1}
                  className={activeTab === source.id ? 'is-active' : undefined}
                  onClick={() => setTab(source.id)}
                  onKeyDown={(event) => handleTabKey(event, index + 1)}
                  title={source.displayName}
                >
                  {source.displayName} {sourceCount(result)}
                </button>
              );
            })}
          </div>

          {selectedSources.length > 8 ? (
            <label className="search-source-select">
              <span className="sr-only">{t('More sources')}</span>
              <select
                value={activeTab}
                aria-label={t('More sources')}
                onChange={(event) => setTab(event.target.value)}
              >
                <option value="all">{t('All sources')}</option>
                {selectedSources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.displayName} ({sourceCount(search.sources[source.id])})
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      ) : null}

      {searching ? (
        <div className="search-progress" role="status" aria-live="polite">
          <span>
            {t('Searching {done}/{total} sources', {
              done: search.completed,
              total: search.total,
            })}
          </span>
          <progress
            value={search.completed}
            max={Math.max(search.total, 1)}
          />
        </div>
      ) : null}

      {failedSources.length > 0 ? (
        <div className="search-failure-note" role="status">
          <strong>{t('Some sources could not be searched')}</strong>
          <span>
            {t('{count} sources failed', { count: failedSources.length })}
          </span>
        </div>
      ) : null}

      {!queryParam && sourcesReady ? (
        <div className="search-idle">
          <h2>{t('Search manga')}</h2>
          <p>
            {selectedSources.length === 0
              ? t('Open filters to choose at least one source.')
              : t('Search across the selected sources.')}
          </p>
          {history.length > 0 ? (
            <div className="search-history-list" aria-label={t('Recent searches')}>
              {history.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQueryInput(term);
                    addSearchHistory(term);
                    setSearchParams({ q: term });
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : sourcesReady && selectedSources.length === 0 ? (
        <div className="search-empty">
          <h2>{t('No sources selected')}</h2>
          <p>{t('Open filters to choose at least one source.')}</p>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setFiltersOpen(true)}
          >
            {t('Filter search')}
          </button>
        </div>
      ) : activeSource && activeSourceState?.status === 'error' ? (
        <div className="search-empty" role="alert">
          <h2>{t('Couldn’t search {source}.', { source: activeSource.displayName })}</h2>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void searchController.retrySource(activeSource.id)}
          >
            {t('Retry')}
          </button>
        </div>
      ) : activeResults.length === 0 && !searching ? (
        <div className="search-empty">
          <h2>{t('No results')}</h2>
          <p>
            {activeSource
              ? t('No results from {source}.', {
                  source: activeSource.displayName,
                })
              : t('No manga matched "{query}".', { query: queryParam })}
          </p>
          <p>{t('Try a different query or choose more sources.')}</p>
        </div>
      ) : null}

      {activeResults.length > 0 ? (
        <section
          className="search-results"
          id="search-results-panel"
          role="tabpanel"
          aria-label={t('Search results')}
        >
          <div className="search-result-grid">
            {activeResults.map(({ manga, source }) => (
              <SearchResultCard
                key={`${source.id}:${manga.id}`}
                manga={manga}
                source={source}
                origin={origin}
                resources={context.resources}
              />
            ))}
          </div>

          {activeTab !== 'all' && activeSourceState?.hasNextPage ? (
            <button
              className="button button-secondary search-load-more"
              type="button"
              disabled={activeSourceState.loadingMore}
              onClick={() => void searchController.loadMore(activeTab)}
            >
              {activeSourceState.loadingMore
                ? t('Loading…')
                : t('Load more from {source}', {
                    source: activeSource?.displayName ?? '',
                  })}
            </button>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function SearchResultCard({
  manga,
  source,
  origin,
  resources,
}: {
  readonly manga: SourceManga;
  readonly source: CatalogSource;
  readonly origin: NavigationOrigin;
  readonly resources: ConnectedContext['resources'];
}) {
  const image = useImageResource(resources, manga.thumbnailUrl);
  const { t } = useI18n();

  return (
    <Link
      className="search-manga-card search-result-card"
      to={`/manga/${manga.id}`}
      state={{ origin }}
      aria-label={`${manga.title}, ${source.displayName}, manga details`}
    >
      <span className="search-manga-cover">
        {image.objectUrl ? (
          <img src={image.objectUrl} alt="" loading="lazy" decoding="async" />
        ) : (
          <span>{manga.title.charAt(0).toUpperCase()}</span>
        )}
      </span>
      <strong title={manga.title}>{manga.title}</strong>
      <span className="search-result-source">
        {source.name} · {languageName(source.lang)}
      </span>
      <span className="search-manga-meta">
        {manga.inLibrary ? t('In library') : t('Not in library')}
      </span>
    </Link>
  );
}

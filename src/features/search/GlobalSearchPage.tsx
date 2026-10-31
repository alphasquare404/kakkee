import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import { useAppPath } from '../../app/useAppPath';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { addSearchHistory, clearSearchHistory } from '../../core/preferences/searchHistory';
import { createSearchController } from '../../core/search/searchController';
import { createSearchRepository } from '../../core/search/searchRepository';
import type { SearchManga } from '../../core/search/searchRepository';
import { createCatalogRepository } from '../../core/catalog/catalogRepository';
import { createSourceRepository } from '../../core/source/sourceRepository';
import { useImageResource } from '../../shared/useImageResource';
import { useSearchHistory } from '../../shared/useSearchHistory';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  Search: 'Cari',
  'Search manga and sources known to this server':
    'Cari manga dan source yang dikenal server ini',
  '{count} manga': '{count} manga',
  'Clear history': 'Hapus riwayat',
  'Search installed sources': 'Cari di source terpasang',
  'Searching sources {done}/{total}': 'Mencari source {done}/{total}',
  '{count} live results': '{count} hasil langsung',
  'Live source search failed.': 'Pencarian source langsung gagal.',
  'Live source results': 'Hasil source langsung',
  Source: 'Source',
  'All sources': 'Semua source',
  '{count} shown': '{count} ditampilkan',
  '{count} in library': '{count} di perpustakaan',
  'Search the server': 'Cari di server',
  'Enter a title to search manga and sources known to Suwayomi.':
    'Masukkan judul untuk mencari manga dan source yang dikenal Suwayomi.',
  'Search failed': 'Pencarian gagal',
  Retry: 'Coba lagi',
  'No results': 'Tidak ada hasil',
  Sources: 'Source',
  Manga: 'Manga',
});

export function GlobalSearchPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <SearchContent context={state.context} />;
}

function SearchContent({ context }: { readonly context: ConnectedContext }) {
  const { t } = useI18n();
  const controller = useMemo(
    () =>
      createSearchController(
        createSearchRepository({ getClient: () => context.graphQL }),
      ),
    [context.graphQL],
  );
  const search = useSyncExternalStore(controller.subscribe, controller.getState);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const appliedInitialQuery = useRef(false);
  const [query, setQuery] = useState(initialQuery);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [liveStatus, setLiveStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const [liveResults, setLiveResults] = useState<
    readonly { id: number; title: string; sourceName: string }[]
  >([]);
  const [liveProgress, setLiveProgress] = useState({ done: 0, total: 0 });
  const history = useSearchHistory();
  const catalogRepository = useMemo(
    () => createCatalogRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const sourceRepository = useMemo(
    () => createSourceRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );

  const runSearch = (value: string) => {
    const trimmed = value.trim();

    if (trimmed) {
      addSearchHistory(trimmed);
    }

    setHistoryOpen(false);
    void controller.search(trimmed);
  };

  const submit = () => {
    const trimmed = query.trim();
    setSearchParams(trimmed ? { q: trimmed } : {}, { replace: true });
    runSearch(query);
  };

  useEffect(() => {
    if (appliedInitialQuery.current) {
      return;
    }

    appliedInitialQuery.current = true;

    if (initialQuery) {
      void controller.search(initialQuery);
    }
  }, [controller, initialQuery]);

  const searchAllSources = async () => {
    const value = (query.trim() || search.query).trim();

    if (!value) {
      return;
    }

    setLiveStatus('loading');
    setLiveResults([]);
    setLiveProgress({ done: 0, total: 0 });

    try {
      const sources = await catalogRepository.getSources();
      const queue = [...sources.items];
      const found = new Map<number, { id: number; title: string; sourceName: string }>();
      let done = 0;
      setLiveProgress({ done: 0, total: sources.items.length });

      const worker = async () => {
        for (;;) {
          const source = queue.shift();

          if (!source) {
            return;
          }

          try {
            const page = await sourceRepository.fetchManga({
              sourceId: source.id,
              type: 'SEARCH',
              query: value,
              page: 1,
            });

            for (const manga of page.mangas.slice(0, 6)) {
              if (!found.has(manga.id)) {
                found.set(manga.id, {
                  id: manga.id,
                  title: manga.title,
                  sourceName: source.displayName,
                });
              }
            }
          } catch {
            // A failed source must not stop the whole search.
          }

          done += 1;
          setLiveProgress({ done, total: sources.items.length });
        }
      };

      await Promise.all(
        Array.from(
          { length: Math.min(4, sources.items.length) },
          () => worker(),
        ),
      );
      setLiveResults([...found.values()]);
      setLiveStatus('ready');
    } catch {
      setLiveStatus('error');
    }
  };

  const mangas = search.results?.mangas.nodes ?? [];
  const sources = search.results?.sources.nodes ?? [];
  const mangaSources = [
    ...new Map(
      mangas
        .filter((manga) => manga.source !== null)
        .map((manga) => [
          manga.source?.id ?? '',
          {
            id: manga.source?.id ?? '',
            displayName: manga.source?.displayName ?? '',
          },
        ]),
    ).values(),
  ].filter((source) => source.id);
  const filteredMangas =
    sourceFilter === 'all'
      ? mangas
      : mangas.filter((manga) => manga.source?.id === sourceFilter);
  const libraryCount = filteredMangas.filter((manga) => manga.inLibrary).length;

  return (
    <div className="app-shell page-shell browse-shell">
      <PageHeader
        title={t('Search')}
        subtitle={t('Search manga and sources known to this server')}
        count={
          search.status === 'ready'
            ? t('{count} manga', {
                count: search.results?.mangas.totalCount ?? 0,
              })
            : undefined
        }
      />

      <form
        className="global-search-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <input
          type="search"
          aria-label="Search all manga"
          placeholder="Search all manga and sources…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setHistoryOpen(true)}
          onClick={() => setHistoryOpen(true)}
          autoFocus
        />
        <button className="button" type="submit" disabled={!query.trim()}>
          {t('Search')}
        </button>
        {historyOpen && history.length > 0 ? (
          <div className="global-search-history" role="listbox" aria-label="Recent searches">
            {history.map((term) => (
              <button
                key={term}
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setQuery(term);
                  setSearchParams({ q: term }, { replace: true });
                  runSearch(term);
                }}
              >
                {term}
              </button>
            ))}
            <button
              className="global-search-history-clear"
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => clearSearchHistory()}
            >
              {t('Clear history')}
            </button>
          </div>
        ) : null}
      </form>

      <div className="live-source-search">
        <button
          className="button button-secondary"
          type="button"
          disabled={liveStatus === 'loading' || !(query.trim() || search.query)}
          onClick={() => void searchAllSources()}
        >
          {liveStatus === 'loading'
            ? `Searching sources ${liveProgress.done}/${liveProgress.total}…`
            : 'Search installed sources'}
        </button>
        {liveStatus === 'ready' ? (
          <span>
            {t('{count} live results', { count: liveResults.length })}
          </span>
        ) : null}
        {liveStatus === 'error' ? (
          <span role="alert">{t('Live source search failed.')}</span>
        ) : null}
      </div>

      {liveResults.length > 0 ? (
        <section className="search-section" aria-labelledby="live-search-heading">
          <div className="section-heading-row">
            <h2 id="live-search-heading">{t('Live source results')}</h2>
            <span>{t('{count} manga', { count: liveResults.length })}</span>
          </div>
          <div className="live-source-results">
            {liveResults.map((manga) => (
              <Link
                className="live-source-result"
                key={manga.id}
                to={`/manga/${manga.id}`}
                state={{ from: '/search' }}
              >
                <strong>{manga.title}</strong>
                <span>{manga.sourceName}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {mangaSources.length > 1 ? (
        <div className="search-source-filter">
          <label>
            <span>{t('Source')}</span>
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
            >
              <option value="all">{t('All sources')}</option>
              {mangaSources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.displayName}
                </option>
              ))}
            </select>
          </label>
          <span className="settings-save-state">
            {filteredMangas.length} shown · {libraryCount} in library
          </span>
        </div>
      ) : null}

      {search.status === 'idle' ? (
        <div className="library-state">
          <h2>{t('Search the server')}</h2>
          <p>
            {t(
              'Enter a title to search manga and sources known to Suwayomi.',
            )}
          </p>
        </div>
      ) : null}

      {search.status === 'loading' ? (
        <p className="settings-save-state" role="status">
          Searching…
        </p>
      ) : null}

      {search.status === 'error' ? (
        <div className="library-state" role="alert">
          <h2>{t('Search failed')}</h2>
          <button className="button button-secondary" type="button" onClick={submit}>
            {t('Retry')}
          </button>
        </div>
      ) : null}

      {search.status === 'ready' && mangas.length === 0 && sources.length === 0 ? (
        <div className="library-state">
          <h2>{t('No results')}</h2>
          <p>No manga or source matched “{search.query}”.</p>
        </div>
      ) : null}

      {sources.length > 0 ? (
        <section className="search-section" aria-labelledby="search-sources">
          <div className="section-heading-row">
            <h2 id="search-sources">{t('Sources')}</h2>
            <span>{search.results?.sources.totalCount}</span>
          </div>
          <div className="source-grid">
            {sources.map((source) => (
              <Link
                className="source-card"
                key={source.id}
                to={`/browse/${encodeURIComponent(source.id)}`}
              >
                <span className="source-mark" aria-hidden="true">
                  {source.displayName.charAt(0).toUpperCase()}
                </span>
                <div className="source-copy">
                  <h2>{source.displayName}</h2>
                  <p>
                    {source.name} · {source.lang.toUpperCase()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {filteredMangas.length > 0 ? (
        <section className="search-section" aria-labelledby="search-manga">
          <div className="section-heading-row">
            <h2 id="search-manga">{t('Manga')}</h2>
            <span>
              {filteredMangas.length} shown · {libraryCount} in library
            </span>
          </div>
          <div className="search-manga-grid">
            {filteredMangas.map((manga) => (
              <SearchMangaCard
                key={manga.id}
                manga={manga}
                resources={context.resources}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function SearchMangaCard({
  manga,
  resources,
}: {
  readonly manga: SearchManga;
  readonly resources: ConnectedContext['resources'];
}) {
  const image = useImageResource(resources, manga.thumbnailUrl);
  const { from } = useAppPath();

  return (
    <Link
      className="search-manga-card"
      to={`/manga/${manga.id}`}
      state={{ from }}
      aria-label={`${manga.title}, manga details`}
    >
      <span className="search-manga-cover">
        {image.objectUrl ? (
          <img src={image.objectUrl} alt="" loading="lazy" decoding="async" />
        ) : (
          <span>{manga.title.charAt(0).toUpperCase()}</span>
        )}
      </span>
      <strong title={manga.title}>{manga.title}</strong>
      <span className="search-manga-meta">
        {manga.inLibrary ? 'In library' : 'Not in library'}
        {manga.unreadCount > 0 ? ` · ${manga.unreadCount} unread` : ''}
      </span>
    </Link>
  );
}

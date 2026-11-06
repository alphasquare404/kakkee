import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import { useAppPath } from '../../app/useAppPath';
import {
  createSectionOrigin,
  type NavigationOrigin,
} from '../../app/navigationOrigin';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { addSearchHistory, clearSearchHistory } from '../../core/preferences/searchHistory';
import { createSearchController } from '../../core/search/searchController';
import { createSearchRepository } from '../../core/search/searchRepository';
import type { SearchManga } from '../../core/search/searchRepository';
import { useImageResource } from '../../shared/useImageResource';
import { useSearchHistory } from '../../shared/useSearchHistory';
import { PageHeader } from '../../shared/PageHeader';
import { SearchIcon } from '../../shared/SearchIcon';
import { IconExtensions } from '../library/icons';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  Browse: 'Jelajah',
  'Search manga across sources known to this server':
    'Cari manga dari sumber yang dikenal server ini',
  '{count} manga': '{count} manga',
  'Clear history': 'Hapus riwayat',
  'Search manga...': 'Cari manga...',
  'Search manga': 'Cari manga',
  'Search the server': 'Cari di server',
  'Enter a title to search manga known to Suwayomi.':
    'Masukkan judul untuk mencari manga yang dikenal Suwayomi.',
  'Search failed': 'Pencarian gagal',
  Retry: 'Coba lagi',
  'No results': 'Tidak ada hasil',
  Manga: 'Manga',
  'In library': 'Di perpustakaan',
  'Not in library': 'Tidak di perpustakaan',
  '{count} unread': '{count} belum dibaca',
  Extensions: 'Ekstensi',
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
  const { pathname, search: searchString } = useAppPath();
  const origin = createSectionOrigin('search', {
    pathname,
    search: searchString,
  });
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
  const [historyOpen, setHistoryOpen] = useState(false);
  const history = useSearchHistory();

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

    if (search.status === 'loading') {
      return;
    }

    setSearchParams(trimmed ? { q: trimmed } : {}, { replace: true });
    runSearch(trimmed);
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

  const mangas = search.results?.mangas.nodes ?? [];
  const libraryCount = mangas.filter((manga) => manga.inLibrary).length;

  return (
    <div className="app-shell page-shell browse-shell sources-shell">
      <PageHeader
        title={t('Browse')}
        subtitle={t('Search manga across sources known to this server')}
        count={
          search.status === 'ready'
            ? t('{count} manga', {
                count: search.results?.mangas.totalCount ?? 0,
              })
            : undefined
        }
      >
        <Link
          className="browse-extensions-button"
          to="/extensions"
          aria-label={t('Extensions')}
          title={t('Extensions')}
        >
          <IconExtensions />
        </Link>
      </PageHeader>

      <form
        className="global-search-form"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <input
          type="search"
          aria-label={t('Search manga')}
          placeholder={t('Search manga...')}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setHistoryOpen(true)}
          onClick={() => setHistoryOpen(true)}
          enterKeyHint="search"
          autoComplete="off"
          autoFocus
        />
        <button
          className="button search-submit-icon"
          type="submit"
          aria-label={t('Search manga')}
          title={t('Search manga')}
          disabled={!query.trim() || search.status === 'loading'}
        >
          <SearchIcon />
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

      {search.status === 'idle' ? (
        <div className="library-state">
          <h2>{t('Search the server')}</h2>
          <p>{t('Enter a title to search manga known to Suwayomi.')}</p>
        </div>
      ) : null}

      {search.status === 'loading' ? (
        <p className="settings-save-state" role="status">
          Searching...
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

      {search.status === 'ready' && mangas.length === 0 ? (
        <div className="library-state">
          <h2>{t('No results')}</h2>
          <p>
            No manga matched "{search.query}".
          </p>
        </div>
      ) : null}

      {mangas.length > 0 ? (
        <section className="search-section" aria-labelledby="search-manga">
          <div className="section-heading-row">
            <h2 id="search-manga">{t('Manga')}</h2>
            <span>
              {mangas.length} shown · {libraryCount} in library
            </span>
          </div>
          <div className="search-manga-grid">
            {mangas.map((manga) => (
              <SearchMangaCard
                key={manga.id}
                manga={manga}
                resources={context.resources}
                origin={origin}
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
  origin,
}: {
  readonly manga: SearchManga;
  readonly resources: ConnectedContext['resources'];
  readonly origin: NavigationOrigin;
}) {
  const image = useImageResource(resources, manga.thumbnailUrl);
  const { t } = useI18n();

  return (
    <Link
      className="search-manga-card"
      to={`/manga/${manga.id}`}
      state={{ origin }}
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
        {manga.inLibrary ? t('In library') : t('Not in library')}
        {manga.unreadCount > 0
          ? ` · ${t('{count} unread', { count: manga.unreadCount })}`
          : ''}
      </span>
    </Link>
  );
}

import { useMemo, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { addSearchHistory, clearSearchHistory } from '../../core/preferences/searchHistory';
import { createSearchController } from '../../core/search/searchController';
import { createSearchRepository } from '../../core/search/searchRepository';
import type { SearchManga } from '../../core/search/searchRepository';
import { useImageResource } from '../../shared/useImageResource';
import { useSearchHistory } from '../../shared/useSearchHistory';
import { PageHeader } from '../../shared/PageHeader';

export function GlobalSearchPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <SearchContent context={state.context} />;
}

function SearchContent({ context }: { readonly context: ConnectedContext }) {
  const controller = useMemo(
    () =>
      createSearchController(
        createSearchRepository({ getClient: () => context.graphQL }),
      ),
    [context.graphQL],
  );
  const search = useSyncExternalStore(controller.subscribe, controller.getState);
  const [query, setQuery] = useState('');
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
    runSearch(query);
  };

  const mangas = search.results?.mangas.nodes ?? [];
  const sources = search.results?.sources.nodes ?? [];

  return (
    <div className="app-shell page-shell browse-shell">
      <PageHeader
        title="Search"
        subtitle="Search manga and sources known to this server"
        count={
          search.status === 'ready'
            ? `${search.results?.mangas.totalCount ?? 0} manga`
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
          Search
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
              Clear history
            </button>
          </div>
        ) : null}
      </form>

      {search.status === 'idle' ? (
        <div className="library-state">
          <h2>Search the server</h2>
          <p>Enter a title to search manga and sources known to Suwayomi.</p>
        </div>
      ) : null}

      {search.status === 'loading' ? (
        <p className="settings-save-state" role="status">
          Searching…
        </p>
      ) : null}

      {search.status === 'error' ? (
        <div className="library-state" role="alert">
          <h2>Search failed</h2>
          <button className="button button-secondary" type="button" onClick={submit}>
            Retry
          </button>
        </div>
      ) : null}

      {search.status === 'ready' && mangas.length === 0 && sources.length === 0 ? (
        <div className="library-state">
          <h2>No results</h2>
          <p>No manga or source matched “{search.query}”.</p>
        </div>
      ) : null}

      {sources.length > 0 ? (
        <section className="search-section" aria-labelledby="search-sources">
          <div className="section-heading-row">
            <h2 id="search-sources">Sources</h2>
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

      {mangas.length > 0 ? (
        <section className="search-section" aria-labelledby="search-manga">
          <div className="section-heading-row">
            <h2 id="search-manga">Manga</h2>
            <span>
              {search.results?.mangas.totalCount} total, showing {mangas.length}
            </span>
          </div>
          <div className="search-manga-grid">
            {mangas.map((manga) => (
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

  return (
    <Link
      className="search-manga-card"
      to={`/manga/${manga.id}`}
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

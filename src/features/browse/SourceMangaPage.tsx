import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
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
import { SourcePreferencesSection } from './SourcePreferencesSection';

export function SourceMangaPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <SourceMangaContent context={state.context} />;
}

function SourceMangaContent({ context }: { readonly context: ConnectedContext }) {
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
  const [search, setSearch] = useState('');

  useEffect(() => {
    void controller.load(sourceId);
  }, [controller, sourceId]);

  return (
    <div className="app-shell page-shell browse-shell">
      <PageHeader
        title={source.source?.displayName ?? 'Source'}
        subtitle={source.source?.name ?? 'Source manga catalog'}
        count={source.status === 'ready' ? `${source.mangas.length} loaded` : undefined}
      >
        <Link className="button button-secondary" to="/browse">
          All sources
        </Link>
      </PageHeader>

      <div className="source-manga-controls">
        <div className="browse-filters" role="group" aria-label="Source catalog type">
          <button
            className={source.type === 'POPULAR' && !source.query ? 'is-active' : undefined}
            type="button"
            aria-pressed={source.type === 'POPULAR' && !source.query}
            onClick={() => void controller.setType('POPULAR')}
          >
            Popular
          </button>
          <button
            className={source.type === 'LATEST' ? 'is-active' : undefined}
            type="button"
            aria-pressed={source.type === 'LATEST'}
            onClick={() => void controller.setType('LATEST')}
          >
            Latest
          </button>
        </div>
        <form
          className="source-search"
          onSubmit={(event) => {
            event.preventDefault();
            void controller.search(search);
          }}
        >
          <input
            type="search"
            aria-label="Search source"
            placeholder="Search this source…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className="button" type="submit" disabled={source.status === 'loading'}>
            Search
          </button>
        </form>
      </div>

      <SourcePreferencesSection context={context} sourceId={sourceId} />

      {source.actionError ? (
        <p className="settings-inline-error" role="alert">
          Library change was rejected by the server.
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
          <h1>Couldn&apos;t load this source</h1>
          <p>The source catalog could not be loaded.</p>
          <button className="button" type="button" onClick={() => void controller.load(sourceId)}>
            Retry
          </button>
        </div>
      ) : null}

      {source.status === 'ready' && source.mangas.length === 0 ? (
        <div className="library-state">
          <h1>No manga found</h1>
          <p>Try another search or catalog type.</p>
        </div>
      ) : null}

      {source.mangas.length > 0 ? (
        <>
          <div className="source-manga-grid">
            {source.mangas.map((manga) => (
              <SourceMangaCard
                key={manga.id}
                manga={manga}
                resources={context.resources}
                busy={source.loadingMore}
                onToggleLibrary={() => void controller.toggleLibrary(manga)}
              />
            ))}
          </div>
          {source.hasNextPage ? (
            <div className="source-load-more">
              <button
                className="button button-secondary"
                type="button"
                disabled={source.loadingMore}
                onClick={() => void controller.loadMore()}
              >
                {source.loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function SourceMangaCard({
  manga,
  resources,
  busy,
  onToggleLibrary,
}: {
  readonly manga: SourceManga;
  readonly resources: ConnectedContext['resources'];
  readonly busy: boolean;
  readonly onToggleLibrary: () => void;
}) {
  const image = useImageResource(resources, manga.thumbnailUrl);

  return (
    <article className="source-manga-card">
      <Link
        className="source-manga-cover"
        to={`/manga/${manga.id}`}
        aria-label={`${manga.title}, manga details`}
      >
        {image.objectUrl ? (
          <img src={image.objectUrl} alt="" loading="lazy" decoding="async" />
        ) : (
          <span>{manga.title.trim().charAt(0).toUpperCase() || 'M'}</span>
        )}
      </Link>
      <h2 title={manga.title}>{manga.title}</h2>
      <button
        className={`source-library-button${manga.inLibrary ? ' is-in-library' : ''}`}
        type="button"
        disabled={busy}
        aria-pressed={manga.inLibrary}
        onClick={onToggleLibrary}
      >
        {manga.inLibrary ? 'In library' : 'Add to library'}
      </button>
    </article>
  );
}

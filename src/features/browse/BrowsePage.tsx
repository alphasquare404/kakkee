import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  createCatalogRepository,
  type CatalogSource,
} from '../../core/catalog/catalogRepository';
import { createLoadableController } from '../../core/catalog/loadableController';
import { PageHeader } from '../../shared/PageHeader';
import { useSourcePreferences } from '../../shared/useSourcePreferences';
import {
  markSourceUsed,
  togglePinnedSource,
  updateSourcePreferences,
} from '../../core/preferences/sourcePreferences';

const WARNING_LABEL: Record<string, string> = {
  SAFE: 'Safe',
  MIXED: 'Mixed',
  NSFW: 'NSFW',
};

interface LanguageFilter {
  readonly value: string;
  readonly label: string;
}

export function BrowsePage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <BrowseContent context={state.context} />;
}

function SourceCard({
  source,
  pinned,
  lastUsed,
  onPin,
  onOpen,
}: {
  readonly source: CatalogSource;
  readonly pinned: boolean;
  readonly lastUsed: boolean;
  readonly onPin: () => void;
  readonly onOpen: () => void;
}) {
  return (
    <article className={`source-card-shell${pinned ? ' is-pinned' : ''}`}>
      <Link
        className="source-card"
        to={`/browse/${encodeURIComponent(source.id)}`}
        aria-label={`${source.displayName}, browse source`}
        onClick={onOpen}
      >
        <span className="source-mark" aria-hidden="true">
          {source.displayName.trim().charAt(0).toUpperCase() || 'S'}
        </span>
        <div className="source-copy">
          <h2>{source.displayName}</h2>
          <p>{source.name}</p>
          <div className="source-badges">
            <span>{source.lang.toLowerCase() === 'all' ? 'Multi' : source.lang.toUpperCase()}</span>
            <span>{WARNING_LABEL[source.contentWarning] ?? source.contentWarning}</span>
            {source.supportsLatest ? <span>Latest</span> : null}
            {pinned ? <span>Pinned</span> : null}
            {lastUsed ? <span>Last used</span> : null}
          </div>
        </div>
      </Link>
      <button
        className="source-pin"
        type="button"
        aria-label={`${pinned ? 'Unpin' : 'Pin'} ${source.displayName}`}
        aria-pressed={pinned}
        onClick={onPin}
      >
        {pinned ? 'Unpin' : 'Pin'}
      </button>
    </article>
  );
}

function BrowseContent({ context }: { readonly context: ConnectedContext }) {
  const preferences = useSourcePreferences();
  const [language, setLanguage] = useState(preferences.language);
  const [preferredOnly, setPreferredOnly] = useState(false);
  const repository = useMemo(
    () => createCatalogRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const controller = useMemo(
    () => createLoadableController({ load: () => repository.getSources() }),
    [repository],
  );
  const sources = useSyncExternalStore(controller.subscribe, controller.getState);

  useEffect(() => {
    void controller.load();
  }, [controller]);

  useEffect(() => {
    updateSourcePreferences({ language });
  }, [language]);

  const items = sources.data?.items ?? [];
  const languages: LanguageFilter[] = [
    { value: 'all', label: 'All' },
    ...(items.some((source) => source.lang.toLowerCase() === 'all')
      ? [{ value: 'multi', label: 'Multi' }]
      : []),
    ...[...new Set(items.map((source) => source.lang.toLowerCase()))]
      .filter((lang) => lang !== 'all')
      .sort()
      .map((lang) => ({ value: lang, label: lang.toUpperCase() })),
  ];
  const visible =
    language === 'all'
      ? items
      : items.filter((source) =>
          language === 'multi'
            ? source.lang.toLowerCase() === 'all'
            : source.lang.toLowerCase() === language,
        );
  const filtered = preferences.showNsfw
    ? visible
    : visible.filter((source) => source.contentWarning !== 'NSFW');
  const preferred = preferredOnly
    ? filtered.filter((source) =>
        preferences.preferredLanguages.includes(source.lang.toLowerCase()),
      )
    : filtered;
  const ordered = [...preferred].sort((left, right) => {
    const leftPinned = preferences.pinned.includes(left.id) ? 1 : 0;
    const rightPinned = preferences.pinned.includes(right.id) ? 1 : 0;

    if (leftPinned !== rightPinned) {
      return rightPinned - leftPinned;
    }

    if (preferences.lastSourceId === left.id) {
      return -1;
    }

    if (preferences.lastSourceId === right.id) {
      return 1;
    }

    return 0;
  });

  return (
    <div className="app-shell page-shell browse-shell">
      <PageHeader
        title="Browse"
        subtitle="Discover the sources installed on your server"
        count={sources.data ? `${sources.data.totalCount.toLocaleString('en-US')} sources` : undefined}
      />

      <section className="browse-hero" aria-labelledby="browse-hero-title">
        <div>
          <p className="eyebrow">Source catalog</p>
          <h2 id="browse-hero-title">Your server&apos;s extensions, in one place.</h2>
          <p>
            Open a source to browse its Popular/Latest catalog, search, and add manga
            directly to your library.
          </p>
        </div>
        <span className="browse-hero-count">
          {sources.data?.totalCount.toLocaleString('en-US') ?? '—'}
          <small>installed sources</small>
        </span>
      </section>

      <div className="browse-filters" role="group" aria-label="Filter sources by language">
        {languages.map((lang) => (
          <button
            className={language === lang.value ? 'is-active' : undefined}
            key={lang.value}
            type="button"
            aria-pressed={language === lang.value}
            onClick={() => setLanguage(lang.value)}
          >
            {lang.label}
          </button>
        ))}
        <button
          className={preferences.showNsfw ? 'is-active' : undefined}
          type="button"
          aria-pressed={preferences.showNsfw}
          onClick={() =>
            updateSourcePreferences({ showNsfw: !preferences.showNsfw })
          }
        >
          NSFW
        </button>
        <button
          className={preferredOnly ? 'is-active' : undefined}
          type="button"
          aria-pressed={preferredOnly}
          disabled={preferences.preferredLanguages.length === 0}
          onClick={() => setPreferredOnly((value) => !value)}
        >
          Preferred
        </button>
      </div>

      <details className="source-preferred-languages">
        <summary>Preferred languages</summary>
        <div>
          {languages
            .filter((entry) => entry.value !== 'all' && entry.value !== 'multi')
            .map((entry) => (
              <label key={entry.value}>
                <input
                  type="checkbox"
                  checked={preferences.preferredLanguages.includes(entry.value)}
                  onChange={(event) => {
                    const current = preferences.preferredLanguages;
                    const next = event.target.checked
                      ? [...current, entry.value]
                      : current.filter((value) => value !== entry.value);
                    updateSourcePreferences({ preferredLanguages: next });
                  }}
                />
                {entry.label}
              </label>
            ))}
        </div>
      </details>

      {sources.isLoading && !sources.data ? (
        <div className="source-grid" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <div className="source-card source-card-skeleton" key={index} />
          ))}
        </div>
      ) : null}

      {sources.error && !sources.data ? (
        <div className="library-state" role="alert">
          <h1>Couldn&apos;t load sources</h1>
          <p>The source catalog could not be loaded from your server.</p>
          <button className="button" type="button" onClick={() => void controller.load()}>
            Retry
          </button>
        </div>
      ) : null}

      {!sources.isLoading && !sources.error && items.length === 0 ? (
        <div className="library-state">
          <h1>No sources installed</h1>
          <p>Install a source extension in Suwayomi Server to browse its catalog.</p>
        </div>
      ) : null}

      {ordered.length > 0 ? (
        <section className="source-section" aria-labelledby="sources-heading">
          <div className="section-heading-row">
            <h2 id="sources-heading">Sources</h2>
            <span>{ordered.length} shown</span>
          </div>
          <div className="source-grid">
            {ordered.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                pinned={preferences.pinned.includes(source.id)}
                lastUsed={preferences.lastSourceId === source.id}
                onPin={() => togglePinnedSource(source.id)}
                onOpen={() => markSourceUsed(source.id)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

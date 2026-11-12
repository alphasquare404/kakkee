import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  createCatalogRepository,
  type CatalogSource,
} from '../../core/catalog/catalogRepository';
import { createLoadableController } from '../../core/catalog/loadableController';
import { PageHeader } from '../../shared/PageHeader';
import { useSourcePreferences } from '../../shared/useSourcePreferences';
import { useSearchPreferences } from '../../shared/useSearchPreferences';
import { updateSearchPreferences } from '../../core/preferences/searchPreferences';
import {
  markSourceUsed,
  togglePinnedSource,
  updateSourcePreferences,
} from '../../core/preferences/sourcePreferences';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { useImageResource } from '../../shared/useImageResource';
import {
  groupSources,
  languageLabel,
  languageName,
  languageSummary,
  type SourceGroup,
} from './sourceDirectory';
import { SearchFilterDrawer } from '../search/SearchFilterDrawer';
import {
  activeSearchFilterCount,
  eligibleSearchSources,
} from '../search/searchScope';
import {
  IconChevron,
  IconClose,
  IconExtensions,
  IconFilter,
  IconPin,
  IconSearch,
} from '../library/icons';

registerMessages('id', {
  Browse: 'Jelajah',
  'Search manga and sources': 'Cari manga dan sumber',
  'Search manga...': 'Cari manga...',
  'Search manga': 'Cari manga',
  'All languages': 'Semua bahasa',
  'NSFW: All': 'NSFW: Semua',
  'NSFW: Hidden': 'NSFW: Disembunyikan',
  'Pinned sources': 'Sumber disematkan',
  'All sources': 'Semua sumber',
  '{count} sources': '{count} sumber',
  '{shown} of {total} sources': '{shown} dari {total} sumber',
  '{count} languages': '{count} bahasa',
  '{count} provider': '{count} penyedia',
  '{count} providers': '{count} penyedia',
  '{count} source': '{count} sumber',
  '{count} language variants': '{count} varian bahasa',
  'Show all {count} variants': 'Tampilkan semua {count} varian',
  'Show fewer variants': 'Tampilkan lebih sedikit',
  'No sources match': 'Tidak ada sumber yang cocok',
  'Try a different language or visibility filter.':
    'Coba filter bahasa atau visibilitas lain.',
  'Clear filters': 'Hapus filter',
  'Clear manga search': 'Hapus pencarian manga',
  'Couldn\'t load sources': 'Tidak dapat memuat sumber',
  'The source catalog could not be loaded from your server.':
    'Katalog sumber tidak dapat dimuat dari server Anda.',
  Retry: 'Coba lagi',
  'No sources installed': 'Belum ada sumber terpasang',
  'Install a source extension in Suwayomi Server to browse its catalog.':
    'Pasang ekstensi sumber di Suwayomi Server untuk menjelajahi katalognya.',
  Pin: 'Sematkan',
  Unpin: 'Lepas sematan',
  Extensions: 'Ekstensi',
});

function SourceIcon({
  source,
  resources,
  className = '',
}: {
  readonly source: CatalogSource;
  readonly resources: ConnectedContext['resources'];
  readonly className?: string;
}) {
  const image = useImageResource(resources, source.iconUrl || null);

  return (
    <span className={`source-icon ${className}`.trim()} aria-hidden="true">
      {image.objectUrl ? (
        <img src={image.objectUrl} alt="" loading="lazy" decoding="async" />
      ) : (
        <span>{source.displayName.trim().charAt(0).toUpperCase() || 'S'}</span>
      )}
    </span>
  );
}

function PinButton({
  source,
  pinned,
  onToggle,
  size = 'normal',
}: {
  readonly source: CatalogSource;
  readonly pinned: boolean;
  readonly onToggle: () => void;
  readonly size?: 'normal' | 'small';
}) {
  const { t } = useI18n();

  return (
    <button
      className={`source-pin-button${size === 'small' ? ' is-small' : ''}${
        pinned ? ' is-active' : ''
      }`}
      type="button"
      aria-label={`${pinned ? t('Unpin') : t('Pin')} ${source.displayName}`}
      aria-pressed={pinned}
      title={pinned ? t('Unpin') : t('Pin')}
      onClick={onToggle}
    >
      <IconPin />
    </button>
  );
}

function PinnedSourceCard({
  source,
  resources,
  pinned,
  onPin,
  onOpen,
}: {
  readonly source: CatalogSource;
  readonly resources: ConnectedContext['resources'];
  readonly pinned: boolean;
  readonly onPin: () => void;
  readonly onOpen: () => void;
}) {
  return (
    <article className="source-pinned-card">
      <Link
        className="source-pinned-main"
        to={`/browse/${encodeURIComponent(source.id)}`}
        onClick={onOpen}
      >
        <SourceIcon source={source} resources={resources} />
        <span className="source-entry-copy">
          <strong>{source.displayName}</strong>
          <small>{languageName(source.lang)}</small>
        </span>
      </Link>
      <PinButton source={source} pinned={pinned} onToggle={onPin} />
    </article>
  );
}

function SourceRow({
  source,
  resources,
  pinned,
  onPin,
  onOpen,
}: {
  readonly source: CatalogSource;
  readonly resources: ConnectedContext['resources'];
  readonly pinned: boolean;
  readonly onPin: () => void;
  readonly onOpen: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="source-row">
      <Link
        className="source-row-main"
        to={`/browse/${encodeURIComponent(source.id)}`}
        onClick={onOpen}
        aria-label={`${source.displayName}, ${t('Browse')}`}
      >
        <SourceIcon source={source} resources={resources} />
        <span className="source-entry-copy">
          <strong>{source.displayName}</strong>
          <small>
            {languageName(source.lang)}
            {source.contentWarning === 'NSFW' ? ' · NSFW' : ''}
          </small>
        </span>
      </Link>
      <span className="source-row-side">
        {pinned ? <span className="source-state-dot" aria-hidden="true" /> : null}
        <PinButton source={source} pinned={pinned} onToggle={onPin} />
      </span>
    </div>
  );
}

function VariantChip({
  source,
  pinned,
  onPin,
  onOpen,
}: {
  readonly source: CatalogSource;
  readonly pinned: boolean;
  readonly onPin: () => void;
  readonly onOpen: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className={`source-variant${pinned ? ' is-pinned' : ''}`}>
      <Link
        className="source-variant-link"
        to={`/browse/${encodeURIComponent(source.id)}`}
        onClick={onOpen}
        aria-label={`${source.displayName}, ${t('Browse')}`}
        title={source.displayName}
      >
        <span>{languageLabel(source.lang)}</span>
        <small>{languageName(source.lang)}</small>
      </Link>
      <PinButton source={source} pinned={pinned} onToggle={onPin} size="small" />
    </div>
  );
}

function ProviderGroupRow({
  group,
  resources,
  pinnedIds,
  expanded,
  allVariants,
  onToggle,
  onToggleAllVariants,
  onPin,
  onOpen,
}: {
  readonly group: SourceGroup;
  readonly resources: ConnectedContext['resources'];
  readonly pinnedIds: ReadonlySet<string>;
  readonly expanded: boolean;
  readonly allVariants: boolean;
  readonly onToggle: () => void;
  readonly onToggleAllVariants: () => void;
  readonly onPin: (sourceId: string) => void;
  readonly onOpen: (sourceId: string) => void;
}) {
  const { t } = useI18n();
  const pinnedCount = group.sources.filter((source) =>
    pinnedIds.has(source.id),
  ).length;
  const visibleVariants = allVariants
    ? group.sources
    : group.sources.slice(0, 8);
  const remaining = group.sources.length - visibleVariants.length;
  const panelId = `source-group-${group.key.replace(/[^a-z0-9]+/gi, '-')}`;

  return (
    <article className={`source-provider${expanded ? ' is-expanded' : ''}`}>
      <button
        className="source-provider-toggle"
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-label={`${group.name}, ${t('{count} language variants', {
          count: group.sources.length,
        })}`}
        onClick={onToggle}
      >
        <SourceIcon source={group.sources[0]} resources={resources} />
        <span className="source-entry-copy">
          <strong>{group.name}</strong>
          <small>{languageSummary(group.sources)}</small>
        </span>
        <span className="source-provider-side">
          {pinnedCount > 0 ? (
            <span className="source-pin-count" aria-label={`${pinnedCount} pinned`}>
              <IconPin />
              {pinnedCount}
            </span>
          ) : null}
          <span className="source-provider-count">
            {t('{count} languages', { count: group.sources.length })}
          </span>
          <IconChevron className="source-chevron" />
        </span>
      </button>

      {expanded ? (
        <div className="source-variants" id={panelId}>
          {visibleVariants.map((source) => (
            <VariantChip
              key={source.id}
              source={source}
              pinned={pinnedIds.has(source.id)}
              onPin={() => onPin(source.id)}
              onOpen={() => onOpen(source.id)}
            />
          ))}
          {group.sources.length > 8 ? (
            <button
              className="source-more-variants"
              type="button"
              onClick={onToggleAllVariants}
            >
              {remaining > 0
                ? t('Show all {count} variants', {
                    count: group.sources.length,
                  })
                : t('Show fewer variants')}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function BrowsePage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <BrowseContent context={state.context} />;
}

function BrowseContent({ context }: { readonly context: ConnectedContext }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const preferences = useSourcePreferences();
  const searchPreferences = useSearchPreferences();
  const [mangaQuery, setMangaQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [allVariants, setAllVariants] = useState<ReadonlySet<string>>(new Set());
  const filterButton = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
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

  const items = sources.data?.items ?? [];
  const pinnedSet = new Set(preferences.pinned);
  const nsfwItems = preferences.showNsfw
    ? items
    : items.filter((source) => source.contentWarning !== 'NSFW');
  const directoryItems = eligibleSearchSources(
    items,
    searchPreferences.languages,
    preferences.showNsfw,
  );
  const groups = groupSources(directoryItems);
  const entries = groups
    .map((group) =>
      group.sources.length > 1
        ? { kind: 'group' as const, group }
        : { kind: 'source' as const, source: group.sources[0] },
    )
    .sort((left, right) => {
      const leftName =
        left.kind === 'group' ? left.group.name : left.source.displayName;
      const rightName =
        right.kind === 'group' ? right.group.name : right.source.displayName;
      return leftName.localeCompare(rightName);
    });

  const pinnedSources = preferences.pinned
    .map((id) => nsfwItems.find((source) => source.id === id))
    .filter((source): source is CatalogSource => Boolean(source));
  const activeFilterCount = activeSearchFilterCount(
    searchPreferences,
    preferences.showNsfw,
  );

  const closeFilters = () => {
    setFiltersOpen(false);
    filterButton.current?.focus({ preventScroll: true });
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  const toggleAllVariants = (key: string) => {
    setAllVariants((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  const resetFilters = () => {
    updateSearchPreferences({
      languages: [],
      allSources: true,
      sourceIds: [],
    });
    updateSourcePreferences({ showNsfw: false });
  };

  const submitSearch = () => {
    const value = mangaQuery.trim();

    if (value) {
      navigate(`/search?q=${encodeURIComponent(value)}`);
    }
  };

  return (
    <div className="app-shell page-shell browse-shell sources-shell">
      <PageHeader
        title={t('Browse')}
        subtitle={t('Search manga and sources')}
        toolbar={
          <form
            id="browse-search-form"
            className={`library-search header-search-form${searchOpen ? ' is-open' : ''}`}
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
          >
            <IconSearch className="library-search-icon" />
            <span className="sr-only">{t('Search manga')}</span>
            <input
              ref={searchInput}
              type="search"
              value={mangaQuery}
              placeholder={t('Search manga...')}
              aria-label={t('Search manga')}
              enterKeyHint="search"
              autoComplete="off"
              onChange={(event) => setMangaQuery(event.target.value)}
            />
            <button
              className="library-search-submit"
              type="submit"
              aria-label={t('Search manga')}
              disabled={!mangaQuery.trim()}
            >
              <IconSearch />
            </button>
            {mangaQuery ? (
              <button
                type="button"
                className="library-search-clear"
                aria-label={t('Clear manga search')}
                onClick={() => setMangaQuery('')}
              >
                <IconClose />
              </button>
            ) : null}
          </form>
        }
      >
        <button
          className={`library-action library-search-toggle${searchOpen ? ' is-active' : ''}`}
          type="button"
          aria-label={searchOpen ? t('Close search') : t('Search manga')}
          aria-expanded={searchOpen}
          aria-controls="browse-search-form"
          onClick={() => {
            if (searchOpen) {
              setSearchOpen(false);
            } else {
              setSearchOpen(true);
              window.setTimeout(() => searchInput.current?.focus(), 0);
            }
          }}
        >
          <IconSearch />
        </button>
        <button
          ref={filterButton}
          className={`library-action${activeFilterCount > 0 ? ' is-active' : ''}`}
          type="button"
          aria-label={
            activeFilterCount > 0
              ? t('Filter search, {count} active', { count: activeFilterCount })
              : t('Filter search')
          }
          aria-haspopup="dialog"
          aria-expanded={filtersOpen}
          title={t('Filter')}
          onClick={() => setFiltersOpen(true)}
        >
          <IconFilter />
          <span className="library-action-label">{t('Filter')}</span>
          {activeFilterCount > 0 ? (
            <span className="library-action-count" aria-hidden="true">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
        <Link
          className="app-header-icon-button"
          to="/extensions"
          aria-label={t('Extensions')}
          title={t('Extensions')}
        >
          <IconExtensions />
        </Link>
      </PageHeader>

      {sources.isLoading && !sources.data ? (
        <div className="sources-directory" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="source-skeleton" key={index} />
          ))}
        </div>
      ) : null}

      {sources.error && !sources.data ? (
        <div className="library-state" role="alert">
          <h1>{t("Couldn't load sources")}</h1>
          <p>{t('The source catalog could not be loaded from your server.')}</p>
          <button className="button" type="button" onClick={() => void controller.load()}>
            {t('Retry')}
          </button>
        </div>
      ) : null}

      {!sources.isLoading && !sources.error && items.length === 0 ? (
        <div className="library-state">
          <h1>{t('No sources installed')}</h1>
          <p>{t('Install a source extension in Suwayomi Server to browse its catalog.')}</p>
        </div>
      ) : null}

      {pinnedSources.length > 0 ? (
        <section className="sources-section" aria-labelledby="pinned-sources-heading">
          <div className="sources-section-heading">
            <h2 id="pinned-sources-heading">
              <IconPin /> {t('Pinned sources')}
            </h2>
            <span>
              {pinnedSources.length === 1
                ? t('{count} source', { count: 1 })
                : t('{count} sources', { count: pinnedSources.length })}
            </span>
          </div>
          <div className="source-pinned-grid">
            {pinnedSources.map((source) => (
              <PinnedSourceCard
                key={source.id}
                source={source}
                resources={context.resources}
                pinned
                onPin={() => togglePinnedSource(source.id)}
                onOpen={() => markSourceUsed(source.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="sources-section" aria-labelledby="all-sources-heading">
        <div className="sources-section-heading sources-directory-heading">
          <h2 id="all-sources-heading">{t('All sources')}</h2>
          <div className="sources-directory-summary">
            <span>
              {directoryItems.length === items.length
                ? directoryItems.length === 1
                  ? t('{count} source', { count: 1 })
                  : t('{count} sources', { count: directoryItems.length })
                : t('{shown} of {total} sources', {
                    shown: directoryItems.length,
                    total: items.length,
                  })}
              {entries.length > 0
                ? ` · ${
                    entries.length === 1
                      ? t('{count} provider', { count: 1 })
                      : t('{count} providers', { count: entries.length })
                  }`
                : ''}
            </span>
          </div>
        </div>

        {directoryItems.length === 0 && items.length > 0 ? (
          <div className="source-empty">
            <h3>{t('No sources match')}</h3>
            <p>{t('Try a different language or visibility filter.')}</p>
            <button className="button button-secondary" type="button" onClick={resetFilters}>
              {t('Clear filters')}
            </button>
          </div>
        ) : (
          <div className="sources-directory">
            {entries.map((entry) =>
              entry.kind === 'group' ? (
                <ProviderGroupRow
                  key={entry.group.key}
                  group={entry.group}
                  resources={context.resources}
                  pinnedIds={pinnedSet}
                  expanded={expandedGroups.has(entry.group.key)}
                  allVariants={allVariants.has(entry.group.key)}
                  onToggle={() => toggleGroup(entry.group.key)}
                  onToggleAllVariants={() => toggleAllVariants(entry.group.key)}
                  onPin={(sourceId) => togglePinnedSource(sourceId)}
                  onOpen={(sourceId) => markSourceUsed(sourceId)}
                />
              ) : (
                <SourceRow
                  key={entry.source.id}
                  source={entry.source}
                  resources={context.resources}
                  pinned={pinnedSet.has(entry.source.id)}
                  onPin={() => togglePinnedSource(entry.source.id)}
                  onOpen={() => markSourceUsed(entry.source.id)}
                />
              ),
            )}
          </div>
        )}
      </section>

      <SearchFilterDrawer
        open={filtersOpen}
        sources={items}
        triggerRef={filterButton}
        onClose={closeFilters}
      />
    </div>
  );
}

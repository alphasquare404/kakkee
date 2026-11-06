import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
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
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { useImageResource } from '../../shared/useImageResource';
import {
  groupSources,
  languageLabel,
  languageName,
  languageSummary,
  sourceSearchText,
  type SourceGroup,
} from './sourceDirectory';
import {
  IconChevron,
  IconClose,
  IconFilter,
  IconPin,
  IconSearch,
} from '../library/icons';

registerMessages('id', {
  Browse: 'Jelajah',
  Sources: 'Sumber',
  'Browse and search manga from available sources':
    'Jelajah dan cari manga dari sumber yang tersedia',
  'Search sources...': 'Cari sumber...',
  'All languages': 'Semua bahasa',
  'NSFW: All': 'NSFW: Semua',
  'NSFW: Hidden': 'NSFW: Disembunyikan',
  'Sort: Name': 'Urutkan: Nama',
  'Sort: Pinned first': 'Urutkan: Disematkan dulu',
  'Sort: Recently used': 'Urutkan: Terakhir dipakai',
  Filters: 'Filter',
  'Preferred only': 'Hanya pilihan',
  'Preferred languages': 'Bahasa pilihan',
  'Pinned & recent': 'Disematkan & terakhir',
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
  'Try a different search or filter.': 'Coba pencarian atau filter lain.',
  'Clear search': 'Hapus pencarian',
  'Clear filters': 'Hapus filter',
  'Couldnâ€™t load sources': 'Tidak dapat memuat sumber',
  'The source catalog could not be loaded from your server.':
    'Katalog sumber tidak dapat dimuat dari server Anda.',
  Retry: 'Coba lagi',
  'No sources installed': 'Belum ada sumber terpasang',
  'Install a source extension in Suwayomi Server to browse its catalog.':
    'Pasang ekstensi sumber di Suwayomi Server untuk menjelajahi katalognya.',
  Pin: 'Sematkan',
  Unpin: 'Lepas sematan',
  'Last used': 'Terakhir dipakai',
});



type DirectorySort = 'name' | 'pinned' | 'recent';

interface LanguageFilter {
  readonly value: string;
  readonly label: string;
}

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
  lastUsed,
  onPin,
  onOpen,
}: {
  readonly source: CatalogSource;
  readonly resources: ConnectedContext['resources'];
  readonly pinned: boolean;
  readonly lastUsed: boolean;
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
          <small>
            {languageName(source.lang)}
            {lastUsed ? ' · Last used' : ''}
          </small>
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
  lastUsed,
  onPin,
  onOpen,
}: {
  readonly source: CatalogSource;
  readonly resources: ConnectedContext['resources'];
  readonly pinned: boolean;
  readonly lastUsed: boolean;
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
            {lastUsed ? ' · Last used' : ''}
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
        {lastUsed ? <em className="sr-only">Last used</em> : null}
      </Link>
      <PinButton source={source} pinned={pinned} onToggle={onPin} size="small" />
    </div>
  );
}

function ProviderGroupRow({
  group,
  resources,
  pinnedIds,
  lastSourceId,
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
  readonly lastSourceId: string | null;
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
              lastUsed={lastSourceId === source.id}
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
  const preferences = useSourcePreferences();
  const [language, setLanguage] = useState(preferences.language);
  const [preferredOnly, setPreferredOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<DirectorySort>('name');
  const [expandedGroups, setExpandedGroups] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [allVariants, setAllVariants] = useState<ReadonlySet<string>>(new Set());
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
      .map((lang) => ({ value: lang, label: languageLabel(lang) })),
  ];
  const pinnedSet = new Set(preferences.pinned);
  const nsfwItems = preferences.showNsfw
    ? items
    : items.filter((source) => source.contentWarning !== 'NSFW');
  const languageItems =
    language === 'all'
      ? nsfwItems
      : nsfwItems.filter((source) =>
          language === 'multi'
            ? source.lang.toLowerCase() === 'all'
            : source.lang.toLowerCase() === language,
        );
  const preferredItems = preferredOnly
    ? languageItems.filter((source) =>
        preferences.preferredLanguages.includes(source.lang.toLowerCase()),
      )
    : languageItems;
  const query = search.trim().toLowerCase();
  const filteredItems = query
    ? preferredItems.filter((source) => sourceSearchText(source).includes(query))
    : preferredItems;
  const groups = groupSources(filteredItems);
  const entries = groups
    .map((group) =>
      group.sources.length > 1
        ? { kind: 'group' as const, group }
        : { kind: 'source' as const, source: group.sources[0] },
    )
    .sort((left, right) => {
      const leftPinned =
        left.kind === 'group'
          ? left.group.sources.filter((source) => pinnedSet.has(source.id)).length
          : pinnedSet.has(left.source.id)
            ? 1
            : 0;
      const rightPinned =
        right.kind === 'group'
          ? right.group.sources.filter((source) => pinnedSet.has(source.id)).length
          : pinnedSet.has(right.source.id)
            ? 1
            : 0;

      if (sort === 'pinned' && leftPinned !== rightPinned) {
        return rightPinned - leftPinned;
      }

      if (sort === 'recent') {
        const leftRecent =
          left.kind === 'group'
            ? left.group.sources.some((source) => source.id === preferences.lastSourceId)
              ? 1
              : 0
            : left.source.id === preferences.lastSourceId
              ? 1
              : 0;
        const rightRecent =
          right.kind === 'group'
            ? right.group.sources.some((source) => source.id === preferences.lastSourceId)
              ? 1
              : 0
            : right.source.id === preferences.lastSourceId
              ? 1
              : 0;

        if (leftRecent !== rightRecent) {
          return rightRecent - leftRecent;
        }
      }

      const leftName =
        left.kind === 'group' ? left.group.name : left.source.displayName;
      const rightName =
        right.kind === 'group' ? right.group.name : right.source.displayName;
      return leftName.localeCompare(rightName);
    });

  const quickIds = [
    ...preferences.pinned,
    ...(preferences.lastSourceId ? [preferences.lastSourceId] : []),
  ];
  const quickSources = [...new Set(quickIds)]
    .map((id) => nsfwItems.find((source) => source.id === id))
    .filter((source): source is CatalogSource => Boolean(source));
  const showQuick = quickSources.length > 0;

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
    setSearch('');
    setLanguage('all');
    setPreferredOnly(false);
    setSort('name');
  };

  return (
    <div className="app-shell page-shell browse-shell sources-shell">
      <PageHeader
        title={t('Sources')}
        subtitle={t('Browse and search manga from available sources')}
      />

      <div className="sources-toolbar">
        <label className="sources-search">
          <IconSearch />
          <span className="sr-only">{t('Search sources...')}</span>
          <input
            type="search"
            value={search}
            placeholder={t('Search sources...')}
            aria-label={t('Search sources...')}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search ? (
            <button
              type="button"
              className="sources-search-clear"
              aria-label={t('Clear search')}
              onClick={() => setSearch('')}
            >
              <IconClose />
            </button>
          ) : null}
        </label>

        <label className="sources-select">
          <span className="sr-only">{t('All languages')}</span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            aria-label="Filter sources by language"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.value === 'all' ? t('All languages') : lang.label}
              </option>
            ))}
          </select>
        </label>

        <button
          className={`sources-filter-toggle${preferences.showNsfw ? ' is-active' : ''}`}
          type="button"
          aria-pressed={preferences.showNsfw}
          onClick={() =>
            updateSourcePreferences({ showNsfw: !preferences.showNsfw })
          }
        >
          {preferences.showNsfw ? t('NSFW: All') : t('NSFW: Hidden')}
        </button>

        <label className="sources-select sources-sort">
          <span className="sr-only">{t('Sort: Name')}</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as DirectorySort)}
            aria-label="Sort sources"
          >
            <option value="name">{t('Sort: Name')}</option>
            <option value="pinned">{t('Sort: Pinned first')}</option>
            <option value="recent">{t('Sort: Recently used')}</option>
          </select>
        </label>

        <details className="sources-advanced">
          <summary>
            <IconFilter />
            {t('Filters')}
            {preferredOnly ? <span>1</span> : null}
          </summary>
          <div className="sources-advanced-panel">
            <button
              className={preferredOnly ? 'is-active' : undefined}
              type="button"
              aria-pressed={preferredOnly}
              disabled={preferences.preferredLanguages.length === 0}
              onClick={() => setPreferredOnly((value) => !value)}
            >
              {t('Preferred only')}
            </button>
            <p>{t('Preferred languages')}</p>
            <div className="sources-preferred-languages">
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
          </div>
        </details>
      </div>

      {sources.isLoading && !sources.data ? (
        <div className="sources-directory" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="source-skeleton" key={index} />
          ))}
        </div>
      ) : null}

      {sources.error && !sources.data ? (
        <div className="library-state" role="alert">
          <h1>{t('Couldnâ€™t load sources')}</h1>
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

      {showQuick ? (
        <section className="sources-section" aria-labelledby="pinned-sources-heading">
          <div className="sources-section-heading">
            <h2 id="pinned-sources-heading">
              <IconPin /> {t('Pinned & recent')}
            </h2>
            <span>
              {quickSources.length === 1
                ? t('{count} source', { count: 1 })
                : t('{count} sources', { count: quickSources.length })}
            </span>
          </div>
          <div className="source-pinned-grid">
            {quickSources.map((source) => (
              <PinnedSourceCard
                key={source.id}
                source={source}
                resources={context.resources}
                pinned={pinnedSet.has(source.id)}
                lastUsed={preferences.lastSourceId === source.id}
                onPin={() => togglePinnedSource(source.id)}
                onOpen={() => markSourceUsed(source.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="sources-section" aria-labelledby="all-sources-heading">
        <div className="sources-section-heading">
          <h2 id="all-sources-heading">{t('All sources')}</h2>
          <span>
            {filteredItems.length === items.length
              ? filteredItems.length === 1
                ? t('{count} source', { count: 1 })
                : t('{count} sources', { count: filteredItems.length })
              : t('{shown} of {total} sources', {
                  shown: filteredItems.length,
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

        {filteredItems.length === 0 && items.length > 0 ? (
          <div className="source-empty">
            <h3>{t('No sources match')}</h3>
            <p>{t('Try a different search or filter.')}</p>
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
                  lastSourceId={preferences.lastSourceId}
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
                  lastUsed={preferences.lastSourceId === entry.source.id}
                  onPin={() => togglePinnedSource(entry.source.id)}
                  onOpen={() => markSourceUsed(entry.source.id)}
                />
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

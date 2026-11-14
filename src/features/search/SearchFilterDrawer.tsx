import {
  useEffect,
  useMemo,
  useState,
  type RefObject,
} from 'react';
import type { CatalogSource } from '../../core/catalog/catalogRepository';
import type { SearchPreferences } from '../../core/preferences/searchPreferences';
import { updateSearchPreferences } from '../../core/preferences/searchPreferences';
import { FilterDrawer } from '../../shared/FilterDrawer';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { useSearchPreferences } from '../../shared/useSearchPreferences';
import { useNsfwPreferences } from '../../core/preferences/nsfwPreferences';
import { groupSources, languageLabel } from '../browse/sourceDirectory';
import { IconChevron, IconSearch } from '../library/icons';
import {
  activeSearchFilterCount,
  eligibleSearchSources,
} from './searchScope';

registerMessages('id', {
  'Filter search': 'Filter pencarian',
  'Choose which languages and sources manga search should include.':
    'Pilih bahasa dan sumber yang ingin disertakan dalam pencarian manga.',
  Languages: 'Bahasa',
  'All languages': 'Semua bahasa',
  Sources: 'Sumber',
  'Search sources...': 'Cari sumber...',
  'Select all': 'Pilih semua',
  Clear: 'Kosongkan',
  'No sources match this search.': 'Tidak ada sumber yang cocok.',
  '{selected} of {total} selected': '{selected} dari {total} dipilih',
  'No sources selected': 'Belum ada sumber dipilih',
  'Hidden by NSFW setting': 'Disembunyikan oleh pengaturan NSFW',
  '{count} hidden by NSFW setting': '{count} disembunyikan oleh pengaturan NSFW',
  'Select at least one source to apply.': 'Pilih minimal satu sumber untuk menerapkan.',
  Reset: 'Reset',
  Cancel: 'Batal',
  Apply: 'Terapkan',
  Filter: 'Filter',
  'Clear filters': 'Hapus filter',
});

interface Draft {
  readonly languages: readonly string[];
  readonly selected: ReadonlySet<string>;
}

function initialDraft(
  sources: readonly CatalogSource[],
  preferences: SearchPreferences,
  showNsfw: boolean,
): Draft {
  const eligible = eligibleSearchSources(sources, preferences.languages, showNsfw);
  const selected = preferences.allSources
    ? new Set(eligible.map((source) => source.id))
    : new Set(
        preferences.sourceIds.filter((id) =>
          eligible.some((source) => source.id === id),
        ),
      );

  return {
    languages: [...preferences.languages],
    selected,
  };
}

export function SearchFilterDrawer({
  open,
  sources,
  triggerRef,
  onClose,
}: {
  readonly open: boolean;
  readonly sources: readonly CatalogSource[];
  readonly triggerRef: RefObject<HTMLButtonElement | null>;
  readonly onClose: () => void;
}) {
  const { t } = useI18n();
  const preferences = useSearchPreferences();
  const nsfw = useNsfwPreferences();
  const showNsfw = !nsfw.hideNsfw;
  const [draft, setDraft] = useState<Draft>(() =>
    initialDraft(sources, preferences, showNsfw),
  );
  const [sourceQuery, setSourceQuery] = useState('');
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    if (!open) {
      return;
    }

    const next = initialDraft(sources, preferences, showNsfw);
    setDraft(next);
    setSourceQuery('');
    setExpanded(
      new Set(
        groupSources(
          eligibleSearchSources(sources, next.languages, showNsfw),
        )
          .filter((group) => group.sources.length <= 8)
          .map((group) => group.key),
      ),
    );
    // Reinitialise only when the drawer opens, not on every preference tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sources]);

  const languages = useMemo(
    () =>
      [...new Set(sources.map((source) => source.lang.toLowerCase()))]
        .sort()
        .map((value) => ({ value, label: languageLabel(value) })),
    [sources],
  );
  const activeSources = useMemo(
    () => eligibleSearchSources(sources, draft.languages, showNsfw),
    [sources, draft.languages, showNsfw],
  );
  const hiddenByNsfw = sources.filter(
    (source) => !showNsfw && source.contentWarning === 'NSFW',
  ).length;
  const groups = useMemo(() => groupSources(activeSources), [activeSources]);
  const normalizedQuery = sourceQuery.trim().toLowerCase();
  const visibleGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          sources: normalizedQuery
            ? group.sources.filter((source) =>
                `${source.displayName} ${source.name} ${source.lang}`
                  .toLowerCase()
                  .includes(normalizedQuery),
              )
            : group.sources,
        }))
        .filter((group) => group.sources.length > 0),
    [groups, normalizedQuery],
  );
  const selectedCount = activeSources.filter((source) =>
    draft.selected.has(source.id),
  ).length;
  const filterCount = activeSearchFilterCount(preferences, false);

  const selectLanguages = (nextLanguages: readonly string[]) => {
    const eligible = new Set(
      eligibleSearchSources(sources, nextLanguages, showNsfw).map(
        (source) => source.id,
      ),
    );
    setDraft((current) => ({
      ...current,
      languages: nextLanguages,
      selected: new Set(
        [...current.selected].filter((sourceId) => eligible.has(sourceId)),
      ),
    }));
  };

  const toggleSource = (sourceId: string) => {
    setDraft((current) => {
      const next = new Set(current.selected);

      if (next.has(sourceId)) {
        next.delete(sourceId);
      } else {
        next.add(sourceId);
      }

      return { ...current, selected: next };
    });
  };

  const toggleGroup = (groupSourcesToToggle: readonly CatalogSource[]) => {
    setDraft((current) => {
      const next = new Set(current.selected);
      const allInGroup = groupSourcesToToggle.every((source) =>
        next.has(source.id),
      );

      for (const source of groupSourcesToToggle) {
        if (allInGroup) {
          next.delete(source.id);
        } else {
          next.add(source.id);
        }
      }

      return { ...current, selected: next };
    });
  };

  const resetDraft = () => {
    setDraft({
      languages: [],
      selected: new Set(
        eligibleSearchSources(sources, [], false).map((source) => source.id),
      ),
    });
    setSourceQuery('');
  };

  const apply = () => {
    if (draft.selected.size === 0) {
      return;
    }

    const activeIds = new Set(activeSources.map((source) => source.id));
    const selected = [...draft.selected].filter((id) => activeIds.has(id));
    const all = activeIds.size > 0 && selected.length === activeIds.size;

    updateSearchPreferences({
      languages: draft.languages,
      allSources: all,
      sourceIds: all ? [] : selected,
    });
    close();
  };

  const close = () => {
    onClose();
    triggerRef.current?.focus({ preventScroll: true });
  };

  return (
    <FilterDrawer
      open={open}
      title={t('Filter search')}
      description={t(
        'Choose which languages and sources manga search should include.',
      )}
      onClose={close}
      triggerRef={triggerRef}
    >
      <div className="search-filter-summary">
        <span>{t('{selected} of {total} selected', {
          selected: selectedCount,
          total: activeSources.length,
        })}</span>
        {filterCount > 0 ? (
          <span className="search-filter-active">{filterCount}</span>
        ) : null}
      </div>

      <section className="search-filter-section" aria-labelledby="search-filter-languages">
        <div className="search-filter-section-heading">
          <h3 id="search-filter-languages">{t('Languages')}</h3>
          <button
            type="button"
            className="text-button"
            onClick={() => selectLanguages([])}
          >
            {t('All languages')}
          </button>
        </div>
        <div className="search-language-grid">
          {languages.map((language) => {
            const checked = draft.languages.includes(language.value);

            return (
              <label
                key={language.value}
                className={`search-language-option${checked ? ' is-selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    selectLanguages(
                      checked
                        ? draft.languages.filter(
                            (value) => value !== language.value,
                          )
                        : [...draft.languages, language.value],
                    )
                  }
                />
                <span>{language.label}</span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="search-filter-section" aria-labelledby="search-filter-sources">
        <div className="search-filter-section-heading">
          <h3 id="search-filter-sources">{t('Sources')}</h3>
          <div className="search-filter-bulk">
            <button
              type="button"
              className="text-button"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  selected: new Set(activeSources.map((source) => source.id)),
                }))
              }
            >
              {t('Select all')}
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() =>
                setDraft((current) => ({ ...current, selected: new Set() }))
              }
            >
              {t('Clear')}
            </button>
          </div>
        </div>

        <label className="search-filter-source-search">
          <IconSearch />
          <input
            type="search"
            value={sourceQuery}
            placeholder={t('Search sources...')}
            aria-label={t('Search sources...')}
            onChange={(event) => setSourceQuery(event.target.value)}
          />
        </label>

        {hiddenByNsfw > 0 ? (
          <p className="search-filter-note">
            {t('{count} hidden by NSFW setting', { count: hiddenByNsfw })}
          </p>
        ) : null}

        {selectedCount === 0 ? (
          <p className="search-filter-warning">
            {t('Select at least one source to apply.')}
          </p>
        ) : null}

        <div className="search-source-checklist">
          {visibleGroups.map((group) => {
            const groupSelected = group.sources.filter((source) =>
              draft.selected.has(source.id),
            ).length;
            const expandedGroup = normalizedQuery
              ? true
              : expanded.has(group.key);

            return (
              <div className="search-source-group" key={group.key}>
                <div className="search-source-group-header">
                  <label>
                    <input
                      type="checkbox"
                      checked={
                        groupSelected === group.sources.length
                      }
                      ref={(element) => {
                        if (element) {
                          element.indeterminate =
                            groupSelected > 0 &&
                            groupSelected < group.sources.length;
                        }
                      }}
                      onChange={() => toggleGroup(group.sources)}
                    />
                    <span>{group.name}</span>
                  </label>
                  <span>{group.sources.length}</span>
                  {group.sources.length > 1 ? (
                    <button
                      type="button"
                      className="search-source-group-toggle"
                      aria-label={
                        expandedGroup
                          ? `Collapse ${group.name}`
                          : `Expand ${group.name}`
                      }
                      aria-expanded={expandedGroup}
                      onClick={() =>
                        setExpanded((current) => {
                          const next = new Set(current);

                          if (next.has(group.key)) {
                            next.delete(group.key);
                          } else {
                            next.add(group.key);
                          }

                          return next;
                        })
                      }
                    >
                      <IconChevron />
                    </button>
                  ) : null}
                </div>

                {expandedGroup ? (
                  <div className="search-source-group-list">
                    {group.sources.map((source) => (
                      <label
                        key={source.id}
                        className="search-source-option"
                      >
                        <input
                          type="checkbox"
                          checked={draft.selected.has(source.id)}
                          onChange={() => toggleSource(source.id)}
                        />
                        <span>{source.displayName}</span>
                        <small>{languageLabel(source.lang)}</small>
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}

          {visibleGroups.length === 0 ? (
            <p className="search-filter-note">
              {t('No sources match this search.')}
            </p>
          ) : null}
        </div>
      </section>

      <footer className="search-filter-footer">
        <button
          className="button button-secondary"
          type="button"
          onClick={resetDraft}
        >
          {t('Reset')}
        </button>
        <div>
          <button
            className="button button-secondary"
            type="button"
            onClick={close}
          >
            {t('Cancel')}
          </button>
          <button
            className="button"
            type="button"
            disabled={selectedCount === 0}
            onClick={apply}
          >
            {t('Apply')}
          </button>
        </div>
      </footer>
    </FilterDrawer>
  );
}

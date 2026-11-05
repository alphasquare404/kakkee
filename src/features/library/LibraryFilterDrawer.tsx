import { useMemo, useState, type RefObject } from 'react';
import { FilterDrawer } from '../../shared/FilterDrawer';
import { useI18n } from '../../shared/useI18n';
import type { LibraryCategory } from '../../core/library/libraryRepository';

export interface LibraryFilterOption {
  readonly value: string;
  readonly label: string;
}

export interface LibraryFilterDrawerProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly triggerRef: RefObject<HTMLElement | null>;
  readonly statusOptions: readonly LibraryFilterOption[];
  readonly selectedStatuses: readonly string[];
  readonly onToggleStatus: (value: string) => void;
  readonly quickOptions: readonly LibraryFilterOption[];
  readonly quickFilters: ReadonlySet<string>;
  readonly onToggleQuick: (value: string) => void;
  readonly sources: readonly LibraryFilterOption[];
  readonly sourceId: string | undefined;
  readonly onSelectSource: (value: string) => void;
  readonly categories: readonly LibraryCategory[];
  readonly hiddenCategoryIds: ReadonlySet<number>;
  readonly onToggleCategoryVisibility: (categoryId: number) => void;
  readonly onShowAllCategories: () => void;
  readonly onReset: () => void;
  readonly activeCount: number;
}

export function LibraryFilterDrawer({
  open,
  onClose,
  triggerRef,
  statusOptions,
  selectedStatuses,
  onToggleStatus,
  quickOptions,
  quickFilters,
  onToggleQuick,
  sources,
  sourceId,
  onSelectSource,
  categories,
  hiddenCategoryIds,
  onToggleCategoryVisibility,
  onShowAllCategories,
  onReset,
  activeCount,
}: LibraryFilterDrawerProps) {
  const { t } = useI18n();
  const [sourceQuery, setSourceQuery] = useState('');
  const filteredSources = useMemo(() => {
    const value = sourceQuery.trim().toLowerCase();

    if (!value) {
      return sources;
    }

    return sources.filter((source) => source.label.toLowerCase().includes(value));
  }, [sourceQuery, sources]);

  return (
    <FilterDrawer
      open={open}
      title={t('Library filters')}
      description={t('Refine the titles already loaded from the server')}
      onClose={onClose}
      triggerRef={triggerRef}
    >
      {categories.length > 0 ? (
        <section
          className="filter-section"
          aria-labelledby="library-filter-categories"
        >
          <div className="section-heading-row">
            <h3 className="filter-section-heading" id="library-filter-categories">
              {t('Show categories')}
            </h3>
            {hiddenCategoryIds.size > 0 ? (
              <button
                className="library-action"
                type="button"
                onClick={onShowAllCategories}
              >
                {t('Show all')}
              </button>
            ) : null}
          </div>
          <p className="filter-section-hint">
            {t('Choose which categories appear in the Library category strip.')}
          </p>
          <div className="filter-section-content filter-checkbox-list">
            {categories.map((category) => (
              <label className="filter-checkbox" key={category.id}>
                <input
                  type="checkbox"
                  checked={!hiddenCategoryIds.has(category.id)}
                  onChange={() => onToggleCategoryVisibility(category.id)}
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
        </section>
      ) : null}

      <section className="filter-section" aria-labelledby="library-filter-source">
        <div className="filter-section-content library-source-filter">
          <label className="settings-text-field">
            <span id="library-filter-source">{t('Source')}</span>
            <input
              type="search"
              value={sourceQuery}
              placeholder={t('Find a source')}
              onChange={(event) => setSourceQuery(event.target.value)}
            />
          </label>
          <div className="library-source-list" role="group" aria-label={t('Source')}>
            <button
              className={sourceId ? 'filter-option' : 'filter-option is-selected'}
              type="button"
              aria-pressed={!sourceId}
              onClick={() => onSelectSource('')}
            >
              {t('All sources')}
            </button>
            {filteredSources.map((source) => (
              <button
                className={
                  sourceId === source.value
                    ? 'filter-option is-selected'
                    : 'filter-option'
                }
                key={source.value}
                type="button"
                aria-pressed={sourceId === source.value}
                onClick={() => onSelectSource(source.value)}
              >
                {source.label}
              </button>
            ))}
            {filteredSources.length === 0 ? (
              <p className="library-note" role="status">
                {t('No matching sources')}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="filter-section" aria-labelledby="library-filter-status">
        <h3 className="filter-section-heading" id="library-filter-status">
          {t('Publication status')}
        </h3>
        <div className="filter-section-content filter-checkbox-list">
          {statusOptions.map((option) => (
            <label className="filter-checkbox" key={option.value}>
              <input
                type="checkbox"
                checked={selectedStatuses.includes(option.value)}
                onChange={() => onToggleStatus(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="filter-section" aria-labelledby="library-filter-loaded">
        <h3 className="filter-section-heading" id="library-filter-loaded">
          {t('Loaded titles')}
        </h3>
        <p className="filter-section-hint">
          {t('Applies to titles currently loaded in the library grid.')}
        </p>
        <div className="filter-section-content filter-checkbox-list">
          {quickOptions.map((option) => (
            <label className="filter-checkbox" key={option.value}>
              <input
                type="checkbox"
                checked={quickFilters.has(option.value)}
                onChange={() => onToggleQuick(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      {activeCount > 0 ? (
        <footer className="filter-drawer-footer">
          <span className="filter-drawer-status">
            {t('{count} active', { count: activeCount })}
          </span>
          <button
            className="button button-secondary"
            type="button"
            onClick={onReset}
          >
            {t('Reset filters')}
          </button>
        </footer>
      ) : null}
    </FilterDrawer>
  );
}

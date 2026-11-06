import type { FormEvent, RefObject } from 'react';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { IconClose, IconFilter, IconSearch } from '../library/icons';

registerMessages('id', {
  'Filter': 'Filter',
  'Filter search': 'Filter pencarian',
  'Filter search, {count} active': 'Filter pencarian, {count} aktif',
  'Search manga...': 'Cari manga...',
  'Search manga': 'Cari manga',
  'Clear manga search': 'Hapus pencarian manga',
});

export function SearchCommandBar({
  query,
  onQueryChange,
  onSubmit,
  onOpenFilters,
  filterButtonRef,
  activeFilterCount,
  filtersOpen,
  onClear,
}: {
  readonly query: string;
  readonly onQueryChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly onOpenFilters: () => void;
  readonly filterButtonRef: RefObject<HTMLButtonElement | null>;
  readonly activeFilterCount: number;
  readonly filtersOpen: boolean;
  readonly onClear?: () => void;
}) {
  const { t } = useI18n();
  const filterLabel =
    activeFilterCount > 0
      ? t('Filter search, {count} active', { count: activeFilterCount })
      : t('Filter search');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="search-command-row">
      <button
        ref={filterButtonRef}
        className={`search-filter-trigger${activeFilterCount > 0 ? ' is-active' : ''}`}
        type="button"
        aria-label={filterLabel}
        aria-haspopup="dialog"
        aria-expanded={filtersOpen}
        title={filterLabel}
        onClick={onOpenFilters}
      >
        <IconFilter />
        <span>{t('Filter')}</span>
        {activeFilterCount > 0 ? (
          <span className="search-filter-count" aria-hidden="true">
            {activeFilterCount}
          </span>
        ) : null}
      </button>

      <form
        className="sources-search search-command-form"
        role="search"
        onSubmit={submit}
      >
        <IconSearch />
        <span className="sr-only">{t('Search manga')}</span>
        <input
          type="search"
          value={query}
          placeholder={t('Search manga...')}
          aria-label={t('Search manga')}
          enterKeyHint="search"
          autoComplete="off"
          onChange={(event) => onQueryChange(event.target.value)}
        />
        {query ? (
          <button
            type="button"
            className="sources-search-clear"
            aria-label={t('Clear manga search')}
            onClick={() => {
              onQueryChange('');
              onClear?.();
            }}
          >
            <IconClose />
          </button>
        ) : null}
      </form>
    </div>
  );
}

import { useState } from 'react';
import type { FilterChangeInput, TriState } from '../../core/graphql/generated/graphql';

interface TextFilterData {
  readonly __typename: 'TextFilter';
  readonly name: string;
  readonly textDefault: string;
}
interface SelectFilterData {
  readonly __typename: 'SelectFilter';
  readonly name: string;
  readonly selectDefault: number;
  readonly values: readonly string[];
}
interface CheckBoxFilterData {
  readonly __typename: 'CheckBoxFilter';
  readonly name: string;
  readonly checkDefault: boolean;
}
interface TriStateFilterData {
  readonly __typename: 'TriStateFilter';
  readonly name: string;
  readonly triDefault: TriState;
}
interface SortFilterData {
  readonly __typename: 'SortFilter';
  readonly name: string;
  readonly sortDefault: { readonly index: number; readonly ascending: boolean } | null;
  readonly values: readonly string[];
}
interface HeaderFilterData {
  readonly __typename: 'HeaderFilter';
  readonly name: string;
}
interface SeparatorFilterData {
  readonly __typename: 'SeparatorFilter';
  readonly name: string;
}
export interface GroupFilterData {
  readonly __typename: 'GroupFilter';
  readonly name: string;
  readonly filters: readonly SourceFilterData[];
}
export type SourceFilterData =
  | TextFilterData
  | SelectFilterData
  | CheckBoxFilterData
  | TriStateFilterData
  | SortFilterData
  | HeaderFilterData
  | SeparatorFilterData
  | GroupFilterData;

type SourceFilter = SourceFilterData;
type FilterValue = string | number | boolean | TriState;

function createInitialValues(filters: readonly SourceFilter[]): Record<string, FilterValue> {
  const result: Record<string, FilterValue> = {};

  filters.forEach((filter, index) => {
    result[String(index)] = initialValue(filter);

    if (filter.__typename === 'GroupFilter') {
      const children = Array.isArray(filter.filters) ? filter.filters : [];

      children.forEach((child, childIndex) => {
        result[`${index}.${childIndex}`] = initialValue(child);
      });
    }
  });

  return result;
}

function initialValue(filter: SourceFilter): FilterValue {
  switch (filter.__typename) {
    case 'TextFilter':
      return filter.textDefault;
    case 'SelectFilter':
      return filter.selectDefault;
    case 'CheckBoxFilter':
      return filter.checkDefault;
    case 'TriStateFilter':
      return filter.triDefault;
    case 'SortFilter':
      return filter.sortDefault?.index ?? 0;
    default:
      return '';
  }
}

function stateFor(
  filter: SourceFilter,
  value: FilterValue,
): Omit<FilterChangeInput, 'position' | 'groupChange'> {
  switch (filter.__typename) {
    case 'TextFilter':
      return { textState: String(value) };
    case 'SelectFilter':
      return { selectState: Number(value) };
    case 'CheckBoxFilter':
      return { checkBoxState: Boolean(value) };
    case 'TriStateFilter':
      return { triState: value as TriState };
    case 'SortFilter':
      return {
        sortState: {
          index: Number(value),
          ascending:
            filter.sortDefault?.ascending ?? true,
        },
      };
    default:
      return {};
  }
}

function filterLabel(filter: SourceFilter): string {
  return 'name' in filter ? filter.name : '';
}

export function SourceFilterPanel({
  filters,
  busy,
  onApply,
  onReset,
}: {
  readonly filters: readonly SourceFilter[];
  readonly busy: boolean;
  readonly onApply: (
    changes: readonly FilterChangeInput[],
    activeCount: number,
  ) => void;
  readonly onReset?: () => void;
}) {
  const [values, setValues] = useState<Record<string, FilterValue>>(() =>
    createInitialValues(filters),
  );

  if (filters.length === 0) {
    return null;
  }

  const setValue = (key: string, value: FilterValue) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const buildChanges = (
    sourceValues: Record<string, FilterValue>,
  ): FilterChangeInput[] => {
    const changes: FilterChangeInput[] = [];

    filters.forEach((filter, index) => {
      if (filter.__typename === 'GroupFilter') {
        const children = Array.isArray(filter.filters) ? filter.filters : [];

        children.forEach((child, childIndex) => {
          const value =
            sourceValues[`${index}.${childIndex}`] ?? initialValue(child);
          changes.push({
            position: index,
            groupChange: {
              position: childIndex,
              ...stateFor(child, value),
            },
          });
        });
        return;
      }

      changes.push({
        position: index,
        ...stateFor(filter, sourceValues[String(index)] ?? initialValue(filter)),
      });
    });

    return changes;
  };

  const countActive = (sourceValues: Record<string, FilterValue>): number => {
    let count = 0;

    filters.forEach((filter, index) => {
      if (filter.__typename === 'GroupFilter') {
        const children = Array.isArray(filter.filters) ? filter.filters : [];

        children.forEach((child, childIndex) => {
          const value =
            sourceValues[`${index}.${childIndex}`] ?? initialValue(child);

          if (value !== initialValue(child)) {
            count += 1;
          }
        });
        return;
      }

      if (
        filter.__typename !== 'HeaderFilter' &&
        filter.__typename !== 'SeparatorFilter' &&
        (sourceValues[String(index)] ?? initialValue(filter)) !==
          initialValue(filter)
      ) {
        count += 1;
      }
    });

    return count;
  };

  const apply = () => {
    onApply(buildChanges(values), countActive(values));
  };

  const reset = () => {
    const initial = createInitialValues(filters);
    setValues(initial);
    onReset?.();
    onApply(buildChanges(initial), 0);
  };

  const renderFilter = (filter: SourceFilter, key: string) => {
    if (filter.__typename === 'HeaderFilter') {
      return <h3 className="source-filter-heading">{filter.name}</h3>;
    }

    if (filter.__typename === 'SeparatorFilter') {
      return <hr className="source-filter-separator" />;
    }

    const value = values[key] ?? initialValue(filter);

    if (filter.__typename === 'TextFilter') {
      return (
        <label className="settings-text-field">
          <span>{filter.name}</span>
          <input
            value={String(value)}
            onChange={(event) => setValue(key, event.target.value)}
          />
        </label>
      );
    }

    if (filter.__typename === 'SelectFilter') {
      const values = Array.isArray(filter.values) ? filter.values : [];

      return (
        <label className="settings-select-field">
          <span>{filter.name}</span>
          <select
            value={Number(value)}
            onChange={(event) => setValue(key, Number(event.target.value))}
          >
            {values.map((label, index) => (
              <option key={`${label}-${index}`} value={index}>
                {label}
              </option>
            ))}
          </select>
        </label>
      );
    }

    if (filter.__typename === 'CheckBoxFilter') {
      return (
        <label className="settings-toggle">
          <span>{filter.name}</span>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => setValue(key, event.target.checked)}
          />
        </label>
      );
    }

    if (filter.__typename === 'TriStateFilter') {
      return (
        <label className="settings-select-field">
          <span>{filter.name}</span>
          <select
            value={String(value)}
            onChange={(event) => setValue(key, event.target.value)}
          >
            <option value="UNSET">Default</option>
            <option value="INCLUDE">Include</option>
            <option value="EXCLUDE">Exclude</option>
          </select>
        </label>
      );
    }

    if (filter.__typename === 'SortFilter') {
      const values = Array.isArray(filter.values) ? filter.values : [];

      return (
        <label className="settings-select-field">
          <span>{filter.name}</span>
          <select
            value={Number(value)}
            onChange={(event) => setValue(key, Number(event.target.value))}
          >
            {values.map((label, index) => (
              <option key={`${label}-${index}`} value={index}>
                {label}
              </option>
            ))}
          </select>
        </label>
      );
    }

    return null;
  };

  return (
    <section className="source-filter-panel" aria-labelledby="source-filter-heading">
      <div className="section-heading-row">
        <h2 id="source-filter-heading">Filters</h2>
        <div className="source-filter-actions">
          <button className="library-action" type="button" disabled={busy} onClick={reset}>
            Reset
          </button>
          <button className="button" type="button" disabled={busy} onClick={apply}>
            {busy ? 'Applying…' : 'Apply filters'}
          </button>
        </div>
      </div>
      <div className="source-filter-grid">
        {filters.map((filter, index) => {
          if (filter.__typename === 'GroupFilter') {
            const children = Array.isArray(filter.filters) ? filter.filters : [];

            return (
              <details
                className="filter-section"
                key={`${filterLabel(filter)}-${index}`}
                open={index < 2}
              >
                <summary>{filter.name || 'Filters'}</summary>
                <div className="filter-section-content source-filter-group">
                  {children.map((child, childIndex) => (
                    <div key={`${filterLabel(child)}-${childIndex}`}>
                      {renderFilter(child, `${index}.${childIndex}`)}
                    </div>
                  ))}
                </div>
              </details>
            );
          }

          return (
            <div key={`${filterLabel(filter)}-${index}`}>
              {renderFilter(filter, String(index))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

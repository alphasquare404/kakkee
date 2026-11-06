import type { CatalogSource } from '../../core/catalog/catalogRepository';

export interface SourceGroup {
  readonly key: string;
  readonly name: string;
  readonly sources: readonly CatalogSource[];
}

const languageDisplayNames =
  typeof Intl.DisplayNames === 'function'
    ? new Intl.DisplayNames(['en'], { type: 'language' })
    : null;

export function languageName(lang: string): string {
  const value = lang.trim().toLowerCase();

  if (value === 'all') {
    return 'Multi-language';
  }

  if (value === 'localsourcelang') {
    return 'Local';
  }

  try {
    return languageDisplayNames?.of(value) ?? value.toUpperCase();
  } catch {
    return value.toUpperCase();
  }
}

export function languageLabel(lang: string): string {
  const value = lang.trim().toLowerCase();

  if (value === 'all') {
    return 'Multi';
  }

  if (value === 'localsourcelang') {
    return 'Local';
  }

  return value.toUpperCase();
}

const LANGUAGE_ORDER = [
  'en',
  'id',
  'ja',
  'ko',
  'zh-hant',
  'zh-hans',
  'es',
  'fr',
  'de',
  'pt-br',
  'pt',
  'ru',
  'ar',
];

function languageRank(lang: string): number {
  const index = LANGUAGE_ORDER.indexOf(lang.trim().toLowerCase());
  return index === -1 ? LANGUAGE_ORDER.length : index;
}

export function sourceSearchText(source: CatalogSource): string {
  return [
    source.displayName,
    source.name,
    source.lang,
    languageLabel(source.lang),
    languageName(source.lang),
  ]
    .join(' ')
    .toLowerCase();
}

/**
 * Groups language variants by the server-provided source name.
 *
 * `name` is the provider identity returned by the extension; `displayName`
 * carries the language suffix. Grouping never changes the source ID used for
 * navigation or pinning.
 */
export function groupSources(
  sources: readonly CatalogSource[],
): readonly SourceGroup[] {
  const groups = new Map<string, { name: string; sources: CatalogSource[] }>();

  for (const source of sources) {
    const name = source.name.trim() || source.displayName.trim();
    const key = name.toLowerCase();
    const current = groups.get(key);

    if (current) {
      current.sources.push(source);
    } else {
      groups.set(key, { name, sources: [source] });
    }
  }

  return [...groups.entries()]
    .map(([key, group]) => ({
      key,
      name: group.name,
      sources: [...group.sources].sort((left, right) => {
        const rank =
          languageRank(left.lang) - languageRank(right.lang);

        return rank !== 0
          ? rank
          : languageLabel(left.lang).localeCompare(languageLabel(right.lang));
      }),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function languageSummary(
  sources: readonly CatalogSource[],
  limit = 4,
): string {
  const languages = [
    ...new Set(sources.map((source) => languageLabel(source.lang))),
  ];

  if (languages.length <= limit) {
    return languages.join(' · ');
  }

  return `${languages.slice(0, limit).join(' · ')} +${languages.length - limit}`;
}

export type NavigationSection =
  | 'library'
  | 'browse'
  | 'search'
  | 'updates'
  | 'history'
  | 'downloads'
  | 'categories'
  | 'manga'
  | 'settings'
  | 'extensions';

export interface NavigationCrumb {
  readonly pathname: string;
  readonly search?: string;
  readonly hash?: string;
  readonly label?: string;
  readonly labelKey?: string;
}

export interface NavigationOrigin extends NavigationCrumb {
  readonly section: NavigationSection;
  readonly trail: readonly NavigationCrumb[];
}

const SECTION_META: Record<
  NavigationSection,
  { pathname: string; labelKey: string }
> = {
  library: { pathname: '/library', labelKey: 'Library' },
  browse: { pathname: '/browse', labelKey: 'Browse' },
  search: { pathname: '/search', labelKey: 'Search' },
  updates: { pathname: '/updates', labelKey: 'Updates' },
  history: { pathname: '/history', labelKey: 'History' },
  downloads: { pathname: '/downloads', labelKey: 'Downloads' },
  categories: { pathname: '/categories', labelKey: 'Categories' },
  manga: { pathname: '/library', labelKey: 'Manga' },
  settings: { pathname: '/settings', labelKey: 'Settings' },
  extensions: { pathname: '/extensions', labelKey: 'Extensions' },
};

function isCrumb(value: unknown): value is NavigationCrumb {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const crumb = value as Partial<NavigationCrumb>;
  return (
    typeof crumb.pathname === 'string' &&
    crumb.pathname.startsWith('/') &&
    !crumb.pathname.startsWith('//')
  );
}

export function isNavigationOrigin(value: unknown): value is NavigationOrigin {
  if (!isCrumb(value)) {
    return false;
  }

  const origin = value as Partial<NavigationOrigin>;
  return (
    typeof origin.section === 'string' &&
    origin.section in SECTION_META &&
    Array.isArray(origin.trail) &&
    origin.trail.every(isCrumb)
  );
}

export function getNavigationOrigin(state: unknown): NavigationOrigin | null {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const origin = (state as { origin?: unknown }).origin;
  return isNavigationOrigin(origin) ? origin : null;
}

export function getLegacyReturnPath(state: unknown): string | null {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const from = (state as { from?: unknown }).from;
  return typeof from === 'string' &&
    from.startsWith('/') &&
    !from.startsWith('//')
    ? from
    : null;
}

export function originHref(crumb: NavigationCrumb): string {
  return `${crumb.pathname}${crumb.search ?? ''}${crumb.hash ?? ''}`;
}

export function createSectionOrigin(
  section: NavigationSection,
  input: {
    readonly pathname: string;
    readonly search?: string;
    readonly hash?: string;
    readonly trail?: readonly NavigationCrumb[];
  },
): NavigationOrigin {
  const meta = SECTION_META[section];
  const search = input.search ?? '';
  const hash = input.hash ?? '';
  const trail =
    input.trail ??
    ([
      {
        pathname: meta.pathname,
        ...(section === 'search' || section === 'library' ? { search } : {}),
        labelKey: meta.labelKey,
      },
    ] satisfies readonly NavigationCrumb[]);

  return {
    section,
    pathname: input.pathname,
    search,
    hash,
    trail,
  };
}

export function originLabel(
  crumb: NavigationCrumb,
  t: (key: string) => string,
): string {
  return crumb.labelKey ? t(crumb.labelKey) : (crumb.label ?? '');
}

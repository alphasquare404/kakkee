import { useHref, useLocation } from 'react-router-dom';

/**
 * Returns the router path without the deployment basename.
 * State such as `from` must stay router-relative so `navigate()` does not
 * prepend the basename twice in subpath deployments.
 */
export function useAppPath() {
  const location = useLocation();
  const root = useHref('/');
  const basename = root === '/' ? '' : root.replace(/\/$/, '');
  const pathname =
    basename &&
    (location.pathname === basename ||
      location.pathname.startsWith(`${basename}/`))
      ? location.pathname.slice(basename.length) || '/'
      : location.pathname;

  return {
    pathname,
    search: location.search,
    hash: location.hash,
    from: `${pathname}${location.search}${location.hash}`,
  };
}

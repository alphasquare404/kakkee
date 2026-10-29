import { normalizeFrontendBasePath } from '../core/config/deployment';

/**
 * Build/deployment path for the frontend. Operators with a subpath deployment
 * set VITE_FRONTEND_BASE_PATH at build time; this is not inferred from the
 * current route.
 */
export function getFrontendBasePath(): string {
  const configured = import.meta.env.VITE_FRONTEND_BASE_PATH;

  if (!configured) {
    return '/';
  }

  try {
    return normalizeFrontendBasePath(configured);
  } catch {
    return '/';
  }
}

export function getRouterBasename(frontendBasePath: string): string {
  return frontendBasePath === '/' ? '/' : frontendBasePath.replace(/\/+$/, '');
}

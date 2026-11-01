import type { ManifestOptions } from 'vite-plugin-pwa';

const APP_NAME = 'Kakkee';
const SHORT_NAME = 'Kakkee';
const DESCRIPTION =
  'Kakkee — unofficial Suwayomi reader for your library and sources.';
const THEME_COLOR = '#0b1020';
const BACKGROUND_COLOR = '#080b12';

function iconPath(basePath: string, file: string): string {
  return `${basePath}icons/${file}`;
}

export function createPwaManifest(basePath: string): Partial<ManifestOptions> {
  return {
    id: basePath,
    name: APP_NAME,
    short_name: SHORT_NAME,
    description: DESCRIPTION,
    lang: 'id',
    start_url: basePath,
    scope: basePath,
    display: 'standalone',
    theme_color: THEME_COLOR,
    background_color: BACKGROUND_COLOR,
    icons: [
      {
        src: iconPath(basePath, 'icon-192.png'),
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: iconPath(basePath, 'icon-512.png'),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: iconPath(basePath, 'icon-512-maskable.png'),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

export function createPwaWorkbox(basePath: string) {
  const denylist = [/^\/api(?:\/|$)/];

  if (basePath !== '/') {
    const escapedBase = basePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    denylist.push(new RegExp(`^${escapedBase}api(?:/|$)`));
  }

  return {
    globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],
    globIgnores: ['**/manifest.webmanifest', '**/icons/*.png'],
    navigateFallback: `${basePath}index.html`,
    // GraphQL/API is never a navigation fallback. The second expression also
    // covers a same-origin server mounted below the frontend base.
    navigateFallbackDenylist: denylist,
    cleanupOutdatedCaches: true,
    skipWaiting: false,
    clientsClaim: false,
    runtimeCaching: [],
  };
}

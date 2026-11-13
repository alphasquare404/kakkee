import { useEffect } from 'react';
import type { ConnectionCoordinator } from '../core/server/connectionCoordinator';
import { ConnectionProvider } from './ConnectionProvider';
import { getFrontendBasePath, getRouterBasename } from './deploymentSettings';
import { AppRouter } from './AppRouter';
import { PwaUpdatePrompt } from './PwaUpdatePrompt';
import { useAppPreferences } from '../shared/useAppPreferences';

function accentContrast(hex: string): string {
  const channels = [1, 3, 5].map((offset) =>
    Number.parseInt(hex.slice(offset, offset + 2), 16) / 255,
  );
  const luminance = channels
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    )
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);

  return luminance > 0.5 ? '#0b0f18' : '#ffffff';
}

export interface AppProps {
  readonly createCoordinator?: () => ConnectionCoordinator;
  readonly frontendBasePath?: string;
}

export function App({ createCoordinator, frontendBasePath }: AppProps = {}) {
  const basePath = frontendBasePath ?? getFrontendBasePath();
  const preferences = useAppPreferences();

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        'content',
        preferences.theme === 'snow-white'
          ? '#f3f5f9'
          : preferences.theme === 'pure-black'
            ? '#000000'
            : '#0b1020',
      );
  }, [preferences.theme]);

  useEffect(() => {
    document.documentElement.lang = preferences.locale;
  }, [preferences.locale]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', preferences.accent);
    root.style.setProperty(
      '--accent-contrast',
      accentContrast(preferences.accent),
    );
    root.style.setProperty(
      '--accent-strong',
      `color-mix(in srgb, ${preferences.accent} 60%, #c4b5fd)`,
    );
    root.style.setProperty(
      '--accent-soft',
      `color-mix(in srgb, ${preferences.accent} 14%, transparent)`,
    );
    root.style.setProperty('--accent-grad', preferences.accent);
  }, [preferences.accent]);

  return (
    <ConnectionProvider
      frontendBasePath={basePath}
      createCoordinator={createCoordinator}
    >
      <AppRouter basename={getRouterBasename(basePath)} />
      <PwaUpdatePrompt />
    </ConnectionProvider>
  );
}

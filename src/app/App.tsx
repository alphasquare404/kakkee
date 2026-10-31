import { useEffect } from 'react';
import type { ConnectionCoordinator } from '../core/server/connectionCoordinator';
import { ConnectionProvider } from './ConnectionProvider';
import { getFrontendBasePath, getRouterBasename } from './deploymentSettings';
import { AppRouter } from './AppRouter';
import { PwaUpdatePrompt } from './PwaUpdatePrompt';
import { useAppPreferences } from '../shared/useAppPreferences';

export interface AppProps {
  readonly createCoordinator?: () => ConnectionCoordinator;
  readonly frontendBasePath?: string;
}

export function App({ createCoordinator, frontendBasePath }: AppProps = {}) {
  const basePath = frontendBasePath ?? getFrontendBasePath();
  const preferences = useAppPreferences();

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
  }, [preferences.theme]);

  useEffect(() => {
    document.documentElement.lang = preferences.locale;
  }, [preferences.locale]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', preferences.accent);
    root.style.setProperty(
      '--accent-strong',
      `color-mix(in srgb, ${preferences.accent} 60%, #c4b5fd)`,
    );
    root.style.setProperty(
      '--accent-soft',
      `color-mix(in srgb, ${preferences.accent} 14%, transparent)`,
    );
    root.style.setProperty(
      '--accent-grad',
      `linear-gradient(135deg, ${preferences.accent} 0%, color-mix(in srgb, ${preferences.accent} 55%, #8b5cf6) 100%)`,
    );
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

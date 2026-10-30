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

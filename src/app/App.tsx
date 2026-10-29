import type { ConnectionCoordinator } from '../core/server/connectionCoordinator';
import { ConnectionProvider } from './ConnectionProvider';
import { getFrontendBasePath, getRouterBasename } from './deploymentSettings';
import { AppRouter } from './AppRouter';

export interface AppProps {
  readonly createCoordinator?: () => ConnectionCoordinator;
  readonly frontendBasePath?: string;
}

export function App({ createCoordinator, frontendBasePath }: AppProps = {}) {
  const basePath = frontendBasePath ?? getFrontendBasePath();

  return (
    <ConnectionProvider
      frontendBasePath={basePath}
      createCoordinator={createCoordinator}
    >
      <AppRouter basename={getRouterBasename(basePath)} />
    </ConnectionProvider>
  );
}

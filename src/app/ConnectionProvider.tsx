import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  createConnectionCoordinator,
  type ConnectionCoordinator,
  type ConnectionState,
} from '../core/server/connectionCoordinator';
import {
  ConnectionContext,
  type ConnectionContextValue,
} from './useConnection';

export interface ConnectionProviderProps {
  readonly children: ReactNode;
  readonly frontendBasePath?: string;
  readonly frontendUrl?: string;
  /** Test seam; production creates one coordinator for this deployment. */
  readonly createCoordinator?: () => ConnectionCoordinator;
}

function currentFrontendUrl(): string {
  return typeof window === 'undefined' ? 'http://localhost/' : window.location.href;
}

export function ConnectionProvider({
  children,
  frontendBasePath = '/',
  frontendUrl,
  createCoordinator,
}: ConnectionProviderProps) {
  const [coordinator] = useState<ConnectionCoordinator>(
    () =>
      createCoordinator?.() ??
      createConnectionCoordinator({
        frontendUrl: frontendUrl ?? currentFrontendUrl(),
        frontendBasePath,
      }),
  );
  const [state, setState] = useState<ConnectionState>(() => coordinator.getState());
  const mounted = useRef(true);
  const disposeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mounted.current = true;

    if (disposeTimer.current !== null) {
      clearTimeout(disposeTimer.current);
      disposeTimer.current = null;
    }

    setState(coordinator.getState());
    const unsubscribe = coordinator.subscribe(setState);

    return () => {
      unsubscribe();
      mounted.current = false;
      // React StrictMode runs mount/cleanup/mount. Delay disposal so a
      // simulated cleanup does not dispose the coordinator still in use.
      disposeTimer.current = setTimeout(() => {
        if (!mounted.current) {
          void coordinator.dispose();
        }
      }, 0);
    };
  }, [coordinator]);

  const connect = useCallback((serverUrl: string) => coordinator.connect(serverUrl), [coordinator]);
  const login = useCallback(
    (username: string, password: string) => coordinator.login(username, password),
    [coordinator],
  );
  const disconnect = useCallback(() => coordinator.disconnect(), [coordinator]);

  const value = useMemo<ConnectionContextValue>(
    () => ({ state, connect, login, disconnect }),
    [state, connect, login, disconnect],
  );

  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>;
}

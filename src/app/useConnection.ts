import { createContext, useContext } from 'react';
import type { ConnectionState } from '../core/server/connectionCoordinator';

export interface ConnectionContextValue {
  readonly state: ConnectionState;
  connect(serverUrl: string): Promise<void>;
  login(username: string, password: string): Promise<void>;
  disconnect(): Promise<void>;
}

export const ConnectionContext = createContext<ConnectionContextValue | null>(null);

export function useConnection(): ConnectionContextValue {
  const value = useContext(ConnectionContext);

  if (!value) {
    throw new Error('useConnection harus dipakai di dalam ConnectionProvider.');
  }

  return value;
}

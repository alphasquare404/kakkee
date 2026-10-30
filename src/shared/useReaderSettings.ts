import { useSyncExternalStore } from 'react';
import {
  getReaderSettings,
  subscribeReaderSettings,
} from '../core/preferences/readerSettings';

export function useReaderSettings() {
  return useSyncExternalStore(subscribeReaderSettings, getReaderSettings);
}

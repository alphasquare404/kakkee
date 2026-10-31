import { useSyncExternalStore } from 'react';
import {
  getMangaReaderMode,
  subscribeMangaReaderOverrides,
} from '../core/preferences/mangaReaderOverrides';

export function useMangaReaderMode(mangaId: number) {
  return useSyncExternalStore(
    subscribeMangaReaderOverrides,
    () => getMangaReaderMode(mangaId),
  );
}

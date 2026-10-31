import { useSyncExternalStore } from 'react';
import {
  getMangaReaderOverride,
  subscribeMangaReaderOverrides,
} from '../core/preferences/mangaReaderOverrides';

export function useMangaReaderOverride(mangaId: number) {
  return useSyncExternalStore(
    subscribeMangaReaderOverrides,
    () => getMangaReaderOverride(mangaId),
  );
}

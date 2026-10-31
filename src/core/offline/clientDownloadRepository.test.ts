// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { createClientDownloadRepository } from './clientDownloadRepository';
import type { OfflineChapter, OfflineChapterRecord, OfflineStorage } from './offlineStorage';
import type { ReaderRepository } from '../reader/readerRepository';
import type { ResourceService } from '../resources/resourceService';

function createStorage() {
  const records: OfflineChapterRecord[] = [];
  const save = vi.fn(
    async (
      record: OfflineChapterRecord,
      pages: readonly Blob[],
      onProgress?: (saved: number, total: number) => void,
    ) => {
      const stored = { ...record, pageCount: pages.length, savedAt: 1 };
      records.push(stored);
      onProgress?.(pages.length, pages.length);
      return stored;
    },
  );
  const storage: OfflineStorage = {
    isSupported: () => true,
    list: async () => records,
    get: async () => null as OfflineChapter | null,
    save,
    delete: vi.fn(async () => undefined),
    deleteServer: vi.fn(async () => undefined),
    clear: vi.fn(async () => undefined),
  };

  return { storage, save, records };
}

function reader(): ReaderRepository {
  return {
    getChapter: async (chapterId: number) => ({
      __typename: 'ChapterType',
      id: chapterId,
      name: 'Chapter 1',
      pageCount: 2,
      chapterNumber: 1,
      sourceOrder: 1,
      isRead: false,
      isDownloaded: false,
      isBookmarked: false,
      lastPageRead: 0,
      manga: {
        __typename: 'MangaType',
        id: 7,
        title: 'Example',
        thumbnailUrl: '/thumb',
        inLibrary: true,
      },
    }),
    getPages: async () => ['/page/1', '/page/2'],
    getNeighbors: vi.fn(),
    getChapterList: vi.fn(),
    updateProgress: vi.fn(),
    enqueueDownload: vi.fn(),
    deleteDownload: vi.fn(),
    setBookmark: vi.fn(),
    setInLibrary: vi.fn(),
  } as unknown as ReaderRepository;
}

function resources(): ResourceService {
  return {
    loadImageResource: async (path: string) => ({
      blob: new Blob([path], { type: 'image/png' }),
      objectUrl: `blob:${path}`,
      contentType: 'image/png',
      dispose: () => undefined,
    }),
    loadResource: vi.fn(),
    dispose: vi.fn(),
    isDisposed: () => false,
  } as unknown as ResourceService;
}

describe('client download repository', () => {
  it('fetches every page and stores a chapter record', async () => {
    const { storage, save } = createStorage();
    const repository = createClientDownloadRepository({
      reader: reader(),
      resources: resources(),
      storage,
      serverBaseUrl: 'https://server.example',
    });
    const progress: number[] = [];

    const record = await repository.downloadChapter(2, (value) =>
      progress.push(value.completedPages),
    );

    expect(record.mangaId).toBe(7);
    expect(record.chapterName).toBe('Chapter 1');
    expect(record.pageCount).toBe(2);
    expect(record.serverBaseUrl).toBe('https://server.example');
    expect(save.mock.calls[0][1]).toHaveLength(2);
    expect(progress).toEqual([2]);
  });
});

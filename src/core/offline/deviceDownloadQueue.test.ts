import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClientDownloadRepository } from './clientDownloadRepository';
import type { OfflineChapterRecord } from './offlineStorage';
import {
  configureDeviceDownloads,
  enqueueDeviceDownloads,
  getDeviceDownloadState,
} from './deviceDownloadQueue';

function record(chapterId: number): OfflineChapterRecord {
  return {
    chapterId,
    mangaId: 1,
    mangaTitle: 'Manga',
    chapterName: `Chapter ${chapterId}`,
    chapterNumber: chapterId,
    pageCount: 2,
    bytes: 20,
    savedAt: 1,
    serverBaseUrl: 'https://server.example',
  };
}

beforeEach(() => {
  configureDeviceDownloads(
    {
      list: vi.fn(),
      get: vi.fn(),
      downloadChapter: vi.fn(),
      deleteChapter: vi.fn(),
      deleteAll: vi.fn(),
    } as unknown as ClientDownloadRepository,
    `test-${Math.random()}`,
  );
});

describe('device download queue', () => {
  it('keeps queued downloads outside the page component lifecycle', async () => {
    let resolveDownload: ((value: OfflineChapterRecord) => void) | undefined;
    const downloadChapter = vi.fn(
      (chapterId: number) =>
        new Promise<OfflineChapterRecord>((resolve) => {
          resolveDownload = () => resolve(record(chapterId));
        }),
    );
    configureDeviceDownloads(
      { downloadChapter } as unknown as ClientDownloadRepository,
      'test-queue',
    );

    enqueueDeviceDownloads([
      { chapterId: 4, mangaTitle: 'Manga', chapterName: 'Chapter 4' },
    ]);

    expect(getDeviceDownloadState().jobs[0]).toMatchObject({
      chapterId: 4,
      status: 'downloading',
    });

    resolveDownload?.(record(4));
    await Promise.resolve();
    await Promise.resolve();

    expect(getDeviceDownloadState().jobs[0]).toMatchObject({
      chapterId: 4,
      status: 'done',
      record: expect.objectContaining({ chapterId: 4 }),
    });
  });
});

import type { ApolloClient } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import {
  DeleteDownloadedChapterDocument,
  DequeueDownloadDocument,
  DownloadQueueDocument,
  StartDownloaderDocument,
  StopDownloaderDocument,
} from '../graphql/generated/graphql';
import { createDownloadRepository } from './downloadRepository';

function client(query: ReturnType<typeof vi.fn>, mutate: ReturnType<typeof vi.fn>) {
  return { query, mutate } as unknown as ApolloClient;
}

describe('DownloadRepository', () => {
  it('loads the queue through the generated query', async () => {
    const query = vi.fn(async () => ({
      data: {
        downloadStatus: {
          state: 'STARTED',
          queue: [
            {
              position: 0,
              progress: 0.4,
              state: 'DOWNLOADING',
              tries: 0,
              chapter: { id: 3, name: 'Chapter 3', pageCount: 20 },
              manga: { id: 1, title: 'Manga', thumbnailUrl: null },
            },
          ],
        },
      },
    }));
    const repository = createDownloadRepository({
      getClient: () => client(query, vi.fn()),
    });

    const queue = await repository.getQueue();

    expect(queue.state).toBe('STARTED');
    expect(queue.queue[0]?.chapter.id).toBe(3);
    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({ query: DownloadQueueDocument }),
    );
  });

  it('uses downloader and chapter-specific mutations', async () => {
    const mutate = vi.fn(async ({ mutation }: { mutation: unknown }) => {
      if (mutation === DequeueDownloadDocument) {
        return { data: { dequeueChapterDownload: { downloadStatus: {} } } };
      }
      if (mutation === DeleteDownloadedChapterDocument) {
        return { data: { deleteDownloadedChapter: { chapters: [] } } };
      }
      return { data: { startDownloader: { downloadStatus: {} } } };
    });
    const repository = createDownloadRepository({
      getClient: () => client(vi.fn(), mutate),
    });

    await repository.setPaused(false);
    await repository.setPaused(true);
    await repository.dequeue(3);
    await repository.deleteDownloaded(3);

    expect(mutate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ mutation: StartDownloaderDocument }),
    );
    expect(mutate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ mutation: StopDownloaderDocument }),
    );
    expect(mutate).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        mutation: DequeueDownloadDocument,
        variables: { input: { id: 3 } },
      }),
    );
    expect(mutate).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        mutation: DeleteDownloadedChapterDocument,
        variables: { input: { id: 3 } },
      }),
    );
  });
});

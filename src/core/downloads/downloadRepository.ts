import type { ApolloClient } from '@apollo/client';
import {
  DeleteDownloadedChapterDocument,
  DequeueDownloadDocument,
  DownloadQueueDocument,
  EnqueueChapterDownloadsDocument,
  StartDownloaderDocument,
  StopDownloaderDocument,
  type DownloadQueueQuery,
} from '../graphql/generated/graphql';

export type DownloadQueue = DownloadQueueQuery['downloadStatus'];
export type DownloadItem = DownloadQueue['queue'][number];

export interface DownloadRepository {
  getQueue(): Promise<DownloadQueue>;
  setPaused(paused: boolean): Promise<void>;
  dequeue(chapterId: number): Promise<void>;
  deleteDownloaded(chapterId: number): Promise<void>;
  retry(chapterIds: readonly number[]): Promise<void>;
}

export function createDownloadRepository(options: {
  readonly getClient: () => ApolloClient;
}): DownloadRepository {
  return {
    async getQueue() {
      const result = await options.getClient().query({
        query: DownloadQueueDocument,
        fetchPolicy: 'network-only',
      });

      if (!result.data?.downloadStatus) {
        throw new Error('Status download tidak tersedia.');
      }

      return result.data.downloadStatus;
    },
    async setPaused(paused) {
      const result = await options.getClient().mutate({
        mutation: paused ? StopDownloaderDocument : StartDownloaderDocument,
      });

      if (!result.data) {
        throw new Error('Status downloader tidak dapat diubah.');
      }
    },
    async dequeue(chapterId) {
      const result = await options.getClient().mutate({
        mutation: DequeueDownloadDocument,
        variables: { input: { id: chapterId } },
      });

      if (!result.data?.dequeueChapterDownload) {
        throw new Error('Chapter tidak dapat dihapus dari antrean.');
      }
    },
    async deleteDownloaded(chapterId) {
      const result = await options.getClient().mutate({
        mutation: DeleteDownloadedChapterDocument,
        variables: { input: { id: chapterId } },
      });

      if (!result.data?.deleteDownloadedChapter) {
        throw new Error('Download chapter tidak dapat dihapus.');
      }
    },
    async retry(chapterIds) {
      if (chapterIds.length === 0) {
        return;
      }

      const result = await options.getClient().mutate({
        mutation: EnqueueChapterDownloadsDocument,
        variables: { input: { ids: [...chapterIds] } },
      });

      if (!result.data?.enqueueChapterDownloads) {
        throw new Error('Download gagal tidak dapat diulang.');
      }
    },
  };
}

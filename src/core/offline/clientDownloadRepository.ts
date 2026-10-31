import type { ReaderRepository } from '../reader/readerRepository';
import type { ResourceService } from '../resources/resourceService';
import type {
  OfflineChapter,
  OfflineChapterRecord,
  OfflineStorage,
} from './offlineStorage';

export interface ClientDownloadProgress {
  readonly chapterId: number;
  readonly completedPages: number;
  readonly totalPages: number;
}

export interface ClientDownloadRepository {
  list(): Promise<readonly OfflineChapterRecord[]>;
  get(chapterId: number): Promise<OfflineChapter | null>;
  downloadChapter(
    chapterId: number,
    onProgress?: (progress: ClientDownloadProgress) => void,
  ): Promise<OfflineChapterRecord>;
  deleteChapter(chapterId: number): Promise<void>;
  deleteAll(): Promise<void>;
}

export interface ClientDownloadRepositoryOptions {
  readonly reader: ReaderRepository;
  readonly resources: ResourceService;
  readonly storage: OfflineStorage;
  readonly serverBaseUrl: string;
}

export function createClientDownloadRepository(
  options: ClientDownloadRepositoryOptions,
): ClientDownloadRepository {
  return {
    list: () => options.storage.list(options.serverBaseUrl),
    get: (chapterId) => options.storage.get(chapterId),

    async downloadChapter(chapterId, onProgress) {
      const chapter = await options.reader.getChapter(chapterId);
      const paths = await options.reader.getPages(chapterId);

      if (paths.length === 0) {
        throw new Error('Chapter tidak memiliki halaman untuk diunduh.');
      }

      const pages: Blob[] = [];

      for (const path of paths) {
        const resource = await options.resources.loadImageResource(path);

        try {
          pages.push(resource.blob);
        } finally {
          resource.dispose();
        }
      }

      return options.storage.save(
        {
          chapterId: chapter.id,
          mangaId: chapter.manga.id,
          mangaTitle: chapter.manga.title,
          chapterName: chapter.name,
          chapterNumber: chapter.chapterNumber,
          pageCount: paths.length,
          bytes: 0,
          savedAt: Date.now(),
          serverBaseUrl: options.serverBaseUrl,
        },
        pages,
        (completedPages, totalPages) =>
          onProgress?.({ chapterId, completedPages, totalPages }),
      );
    },

    deleteChapter: (chapterId) => options.storage.delete(chapterId),
    deleteAll: () => options.storage.deleteServer(options.serverBaseUrl),
  };
}

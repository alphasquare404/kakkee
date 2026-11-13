import type { ReaderRepository } from '../reader/readerRepository';
import type { ResourceService } from '../resources/resourceService';
import type {
  OfflineChapter,
  OfflineChapterRecord,
  OfflineMangaMetadata,
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
    metadata?: OfflineMangaMetadata,
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

    async downloadChapter(chapterId, onProgress, metadata) {
      const chapter = await options.reader.getChapter(chapterId);
      const paths = await options.reader.getPages(chapterId);

      if (paths.length === 0) {
        throw new Error('Chapter tidak memiliki halaman untuk diunduh.');
      }

      let coverDataUrl: string | undefined;

      if (chapter.manga.thumbnailUrl) {
        try {
          const cover = await options.resources.loadImageResource(
            chapter.manga.thumbnailUrl,
          );
          try {
            const bytes = new Uint8Array(await cover.blob.arrayBuffer());
            let binary = '';
            const chunkSize = 0x8000;

            for (let index = 0; index < bytes.length; index += chunkSize) {
              binary += String.fromCharCode(
                ...bytes.subarray(index, index + chunkSize),
              );
            }

            coverDataUrl = `data:${cover.contentType || 'image/jpeg'};base64,${btoa(binary)}`;
          } finally {
            cover.dispose();
          }
        } catch {
          coverDataUrl = undefined;
        }
      }

      async function* pageBlobs() {
        for (const path of paths) {
          const resource = await options.resources.loadImageResource(path);

          try {
            yield resource.blob;
          } finally {
            resource.dispose();
          }
        }
      }

      return options.storage.saveStream(
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
          ...metadata,
          ...(coverDataUrl ? { coverDataUrl } : {}),
        },
        pageBlobs(),
        (completedPages, totalPages) =>
          onProgress?.({ chapterId, completedPages, totalPages }),
      );
    },

    deleteChapter: (chapterId) => options.storage.delete(chapterId),
    deleteAll: () => options.storage.deleteServer(options.serverBaseUrl),
  };
}

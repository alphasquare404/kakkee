const ROOT_DIRECTORY = 'suwayomi-offline-v1';
const INDEX_FILE = 'index.json';
const MANIFEST_FILE = 'manifest.json';

export interface OfflineMangaMetadata {
  readonly mangaAuthor?: string | null;
  readonly mangaArtist?: string | null;
  readonly mangaDescription?: string | null;
  readonly mangaStatus?: string | null;
  readonly mangaGenres?: readonly string[];
  readonly mangaSourceName?: string | null;
}

export interface OfflineChapterRecord extends OfflineMangaMetadata {
  readonly chapterId: number;
  readonly mangaId: number;
  readonly mangaTitle: string;
  readonly chapterName: string;
  readonly chapterNumber: number;
  readonly pageCount: number;
  readonly bytes: number;
  readonly savedAt: number;
  readonly serverBaseUrl: string;
  readonly coverDataUrl?: string;
}

export interface OfflineChapter extends OfflineChapterRecord {
  readonly pages: readonly Blob[];
}

interface StoredManifest {
  readonly record: OfflineChapterRecord;
  readonly pageTypes: readonly string[];
}

export interface OfflineStorage {
  isSupported(): boolean;
  list(serverBaseUrl?: string): Promise<readonly OfflineChapterRecord[]>;
  get(chapterId: number): Promise<OfflineChapter | null>;
  save(
    record: OfflineChapterRecord,
    pages: readonly Blob[],
    onProgress?: (saved: number, total: number) => void,
  ): Promise<OfflineChapterRecord>;
  saveStream(
    record: OfflineChapterRecord,
    pages: AsyncIterable<Blob>,
    onProgress?: (saved: number, total: number) => void,
  ): Promise<OfflineChapterRecord>;
  delete(chapterId: number): Promise<void>;
  deleteServer(serverBaseUrl: string): Promise<void>;
  clear(): Promise<void>;
}

function directoryName(chapterId: number): string {
  return `chapter-${chapterId}`;
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'NotFoundError'
  );
}

async function getRoot(): Promise<FileSystemDirectoryHandle> {
  const storage = navigator.storage as StorageManager & {
    getDirectory?: () => Promise<FileSystemDirectoryHandle>;
  };

  if (typeof storage?.getDirectory !== 'function') {
    throw new Error('OPFS tidak didukung browser ini.');
  }

  return storage.getDirectory().then((root) => root.getDirectoryHandle(ROOT_DIRECTORY, { create: true }));
}

async function readIndex(root: FileSystemDirectoryHandle): Promise<OfflineChapterRecord[]> {
  try {
    const handle = await root.getFileHandle(INDEX_FILE);
    const file = await handle.getFile();
    const parsed: unknown = JSON.parse(await file.text());

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (entry): entry is OfflineChapterRecord =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as OfflineChapterRecord).chapterId === 'number',
    );
  } catch (error) {
    if (isNotFound(error)) {
      return [];
    }

    throw error;
  }
}

async function writeJson(
  root: FileSystemDirectoryHandle,
  name: string,
  value: unknown,
): Promise<void> {
  const handle = await root.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(value));
  await writable.close();
}

async function writeIndex(
  root: FileSystemDirectoryHandle,
  records: readonly OfflineChapterRecord[],
): Promise<void> {
  await writeJson(root, INDEX_FILE, records);
}

function uniqueRecords(records: readonly OfflineChapterRecord[]): OfflineChapterRecord[] {
  const byChapter = new Map<number, OfflineChapterRecord>();

  for (const record of records) {
    byChapter.set(record.chapterId, record);
  }

  return [...byChapter.values()].sort((left, right) => right.savedAt - left.savedAt);
}

export function isOfflineStorageSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof (navigator.storage as StorageManager & { getDirectory?: unknown })?.getDirectory ===
      'function'
  );
}

export function createOfflineStorage(): OfflineStorage {
  let queue: Promise<unknown> = Promise.resolve();

  function locked<T>(operation: () => Promise<T>): Promise<T> {
    const run = queue.then(operation, operation);
    queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async function persistPages(
    record: OfflineChapterRecord,
    pages: Iterable<Blob> | AsyncIterable<Blob>,
    onProgress?: (saved: number, total: number) => void,
  ): Promise<OfflineChapterRecord> {
    return locked(async () => {
      const root = await getRoot();
      const current = await readIndex(root);
      const name = directoryName(record.chapterId);

      try {
        await root.removeEntry(name, { recursive: true });
      } catch (error) {
        if (!isNotFound(error)) {
          throw error;
        }
      }

      const directory = await root.getDirectoryHandle(name, { create: true });
      const pageTypes: string[] = [];
      const expectedTotal = record.pageCount;
      let bytes = 0;
      let index = 0;

      try {
        for await (const page of pages) {
          const handle = await directory.getFileHandle(`page-${index}`, {
            create: true,
          });
          const writable = await handle.createWritable();
          await writable.write(await page.arrayBuffer());
          await writable.close();
          pageTypes.push(page.type);
          bytes += page.size;
          index += 1;
          onProgress?.(index, expectedTotal > 0 ? expectedTotal : index);
        }

        const total = pageTypes.length;
        const stored: OfflineChapterRecord = {
          ...record,
          pageCount: total,
          bytes,
          savedAt: Date.now(),
        };

        await writeJson(directory, MANIFEST_FILE, {
          record: stored,
          pageTypes,
        } satisfies StoredManifest);

        await writeIndex(
          root,
          uniqueRecords([
            ...current.filter((entry) => entry.chapterId !== stored.chapterId),
            stored,
          ]),
        );

        return stored;
      } catch (error) {
        await root.removeEntry(name, { recursive: true }).catch(() => undefined);
        throw error;
      }
    });
  }

  return {
    isSupported: isOfflineStorageSupported,

    async list(serverBaseUrl) {
      if (!isOfflineStorageSupported()) {
        return [];
      }

      return locked(async () => {
        const records = await readIndex(await getRoot());
        return uniqueRecords(
          serverBaseUrl
            ? records.filter((record) => record.serverBaseUrl === serverBaseUrl)
            : records,
        );
      });
    },

    async get(chapterId) {
      if (!isOfflineStorageSupported()) {
        return null;
      }

      return locked(async () => {
        try {
          const root = await getRoot();
          const directory = await root.getDirectoryHandle(directoryName(chapterId));
          const manifestHandle = await directory.getFileHandle(MANIFEST_FILE);
          const manifestFile = await manifestHandle.getFile();
          const manifest = JSON.parse(await manifestFile.text()) as StoredManifest;
          const pages: Blob[] = [];

          for (let index = 0; index < manifest.pageTypes.length; index += 1) {
            const pageHandle = await directory.getFileHandle(`page-${index}`);
            const pageFile = await pageHandle.getFile();
            const bytes = await pageFile.arrayBuffer();
            pages.push(
              new Blob([bytes], {
                type: manifest.pageTypes[index] || 'application/octet-stream',
              }),
            );
          }

          return { ...manifest.record, pages };
        } catch (error) {
          if (isNotFound(error)) {
            return null;
          }

          throw error;
        }
      });
    },

    async save(record, pages, onProgress) {
      return persistPages(record, pages, onProgress);
    },

    async saveStream(record, pages, onProgress) {
      return persistPages(record, pages, onProgress);
    },

    async delete(chapterId) {
      if (!isOfflineStorageSupported()) {
        return;
      }

      await locked(async () => {
        const root = await getRoot();

        try {
          await root.removeEntry(directoryName(chapterId), { recursive: true });
        } catch (error) {
          if (!isNotFound(error)) {
            throw error;
          }
        }

        await writeIndex(
          root,
          (await readIndex(root)).filter((record) => record.chapterId !== chapterId),
        );
      });
    },

    async deleteServer(serverBaseUrl) {
      if (!isOfflineStorageSupported()) {
        return;
      }

      await locked(async () => {
        const root = await getRoot();
        const records = await readIndex(root);
        const keep: OfflineChapterRecord[] = [];

        for (const record of records) {
          if (record.serverBaseUrl === serverBaseUrl) {
            await root
              .removeEntry(directoryName(record.chapterId), { recursive: true })
              .catch(() => undefined);
          } else {
            keep.push(record);
          }
        }

        await writeIndex(root, keep);
      });
    },

    async clear() {
      if (!isOfflineStorageSupported()) {
        return;
      }

      await locked(async () => {
        const root = await getRoot();
        const records = await readIndex(root);

        for (const record of records) {
          await root
            .removeEntry(directoryName(record.chapterId), { recursive: true })
            .catch(() => undefined);
        }

        await writeIndex(root, []);
      });
    },
  };
}

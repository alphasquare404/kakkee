import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { DownloadStatusChangedDocument } from '../../core/graphql/generated/graphql';
import {
  createCatalogRepository,
} from '../../core/catalog/catalogRepository';
import { createLoadableController } from '../../core/catalog/loadableController';
import {
  createDownloadController,
  type DownloadController,
} from '../../core/downloads/downloadController';
import {
  createDownloadRepository,
  type DownloadItem,
} from '../../core/downloads/downloadRepository';
import type { ResourceService } from '../../core/resources/resourceService';
import { createReaderRepository } from '../../core/reader/readerRepository';
import { createClientDownloadRepository } from '../../core/offline/clientDownloadRepository';
import {
  createOfflineStorage,
  isOfflineStorageSupported,
  type OfflineChapterRecord,
} from '../../core/offline/offlineStorage';
import { useImageResource } from '../../shared/useImageResource';
import { FeedRow } from '../../shared/FeedRow';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  Downloads: 'Unduhan',
  'Manage the download queue on your server':
    'Kelola antrean unduhan di server Anda',
  '{count} queued': '{count} dalam antrean',
  'Resume downloads': 'Lanjutkan unduhan',
  'Pause downloads': 'Jeda unduhan',
  Refresh: 'Muat ulang',
  'Retry failed': 'Ulangi yang gagal',
  'In queue': 'Dalam antrean',
  Downloaded: 'Terunduh',
  'Downloaded pages': 'Halaman terunduh',
  Paused: 'Dijeda',
  Running: 'Berjalan',
  Downloader: 'Pengunduh',
  'The download action failed.': 'Aksi unduhan gagal.',
  'Couldn’t load downloads': 'Tidak dapat memuat unduhan',
  'The download queue could not be loaded from your server.':
    'Antrean unduhan tidak dapat dimuat dari server Anda.',
  Retry: 'Coba lagi',
  Queue: 'Antrean',
  'The download queue is empty.': 'Antrean unduhan kosong.',
  '{count} chapters': '{count} chapter',
  'Cancel series': 'Batalkan seri',
  'Downloaded chapters': 'Chapter terunduh',
  '{shown} of {total}': '{shown} dari {total}',
  'No downloaded chapters on this server.':
    'Tidak ada chapter terunduh di server ini.',
  '{count} pages': '{count} halaman',
  Queued: 'Dalam antrean',
  Downloading: 'Mengunduh',
  Finished: 'Selesai',
  Failed: 'Gagal',
  Cancel: 'Batalkan',
  Delete: 'Hapus',
  'try {count}': 'percobaan {count}',
  'This device': 'Perangkat ini',
  'Save to device': 'Simpan ke perangkat',
  'Saving…': 'Menyimpan…',
  'Deleting…': 'Menghapus…',
  'Read offline': 'Baca offline',
  'No chapters saved to this device.': 'Belum ada chapter yang disimpan di perangkat ini.',
  'Device storage is not available in this browser.':
    'Penyimpanan perangkat tidak tersedia di browser ini.',
  'Device download failed.': 'Unduhan perangkat gagal.',
  'Loading…': 'Memuat…',
});

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const DOWNLOADED_FEED = {
  filter: { isDownloaded: { equalTo: true } },
  order: [{ by: 'UPLOAD_DATE' as const, byType: 'DESC' as const }],
  first: 100,
};

const STATE_LABEL: Record<DownloadItem['state'], string> = {
  QUEUED: 'Queued',
  DOWNLOADING: 'Downloading',
  FINISHED: 'Finished',
  ERROR: 'Failed',
};

export function DownloadsPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <DownloadsContent context={state.context} />;
}

function DownloadsContent({ context }: { readonly context: ConnectedContext }) {
  const { t } = useI18n();
  const repository = useMemo(
    () => createDownloadRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const controller = useMemo(() => createDownloadController(repository), [repository]);
  const downloads = useSyncExternalStore(controller.subscribe, controller.getState);

  const catalog = useMemo(
    () => createCatalogRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const feedController = useMemo(
    () => createLoadableController({ load: () => catalog.getFeed(DOWNLOADED_FEED) }),
    [catalog],
  );
  const downloaded = useSyncExternalStore(
    feedController.subscribe,
    feedController.getState,
  );

  useEffect(() => {
    void controller.load();
    void feedController.load();
  }, [controller, feedController]);

  const reloadTimer = useRef<number | null>(null);

  useEffect(() => {
    if (typeof context.graphQL.subscribe !== 'function') {
      return;
    }

    const subscription = context.graphQL
      .subscribe({ query: DownloadStatusChangedDocument })
      .subscribe({
        next: () => {
          if (reloadTimer.current !== null) {
            window.clearTimeout(reloadTimer.current);
          }

          reloadTimer.current = window.setTimeout(() => {
            reloadTimer.current = null;
            void controller.load();
          }, 350);
        },
        error: () => undefined,
      });

    return () => {
      subscription.unsubscribe();

      if (reloadTimer.current !== null) {
        window.clearTimeout(reloadTimer.current);
        reloadTimer.current = null;
      }
    };
  }, [context.graphQL, controller]);

  const queue = downloads.queue?.queue ?? [];
  const pages = (downloaded.data?.items ?? []).reduce(
    (total, item) => total + item.pageCount,
    0,
  );
  const isPaused = downloads.queue?.state === 'STOPPED';
  const failedCount = queue.filter((item) => item.state === 'ERROR').length;
  const groups = Array.from(
    queue
      .reduce((result, item) => {
        const group = result.get(item.manga.id);

        if (group) {
          group.items.push(item);
        } else {
          result.set(item.manga.id, { manga: item.manga, items: [item] });
        }

        return result;
      }, new Map<number, { manga: DownloadItem['manga']; items: DownloadItem[] }>())
      .values(),
  );

  const readerRepository = useMemo(
    () => createReaderRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const offlineStorage = useMemo(() => createOfflineStorage(), []);
  const clientDownloads = useMemo(
    () =>
      createClientDownloadRepository({
        reader: readerRepository,
        resources: context.resources,
        storage: offlineStorage,
        serverBaseUrl: context.config.serverBaseUrl,
      }),
    [context.config.serverBaseUrl, context.resources, offlineStorage, readerRepository],
  );
  const [deviceRecords, setDeviceRecords] = useState<
    readonly OfflineChapterRecord[]
  >([]);
  const [deviceLoading, setDeviceLoading] = useState(
    isOfflineStorageSupported(),
  );
  const [deviceBusyId, setDeviceBusyId] = useState<number | null>(null);
  const [deviceError, setDeviceError] = useState(false);

  const loadDeviceRecords = () => {
    if (!isOfflineStorageSupported()) {
      setDeviceLoading(false);
      return;
    }

    setDeviceLoading(true);
    setDeviceError(false);
    void clientDownloads
      .list()
      .then(setDeviceRecords)
      .catch(() => setDeviceError(true))
      .finally(() => setDeviceLoading(false));
  };

  useEffect(loadDeviceRecords, [clientDownloads]);

  const saveChapterToDevice = async (chapterId: number) => {
    setDeviceBusyId(chapterId);
    setDeviceError(false);

    try {
      const record = await clientDownloads.downloadChapter(chapterId);
      setDeviceRecords((current) => [
        record,
        ...current.filter((item) => item.chapterId !== chapterId),
      ]);
    } catch {
      setDeviceError(true);
    } finally {
      setDeviceBusyId(null);
    }
  };

  const removeDeviceRecord = async (chapterId: number) => {
    setDeviceBusyId(chapterId);
    setDeviceError(false);

    try {
      await clientDownloads.deleteChapter(chapterId);
      setDeviceRecords((current) =>
        current.filter((item) => item.chapterId !== chapterId),
      );
    } catch {
      setDeviceError(true);
    } finally {
      setDeviceBusyId(null);
    }
  };

  return (
    <div className="app-shell page-shell downloads-shell">
      <PageHeader
        title={t('Downloads')}
        subtitle={t('Manage the download queue on your server')}
        count={
          downloads.queue
            ? t('{count} queued', { count: queue.length })
            : undefined
        }
      >
        <button
          className="button button-secondary"
          type="button"
          disabled={downloads.isActing || !downloads.queue}
          onClick={() => void controller.togglePaused()}
        >
          {isPaused ? t('Resume downloads') : t('Pause downloads')}
        </button>
        <button
          className="button button-secondary"
          type="button"
          disabled={downloads.isLoading}
          onClick={() => void controller.load()}
        >
          {t('Refresh')}
        </button>
        <button
          className="button button-secondary"
          type="button"
          disabled={downloads.isActing || failedCount === 0}
          onClick={() => void controller.retryFailed()}
        >
          {t('Retry failed')}
          {failedCount > 0 ? ` (${failedCount})` : ''}
        </button>
      </PageHeader>

      <div className="download-stats">
        <div>
          <strong>{queue.length}</strong>
          <span>{t('In queue')}</span>
        </div>
        <div>
          <strong>{downloaded.data?.totalCount ?? '—'}</strong>
          <span>{t('Downloaded')}</span>
        </div>
        <div>
          <strong>{pages.toLocaleString('en-US')}</strong>
          <span>{t('Downloaded pages')}</span>
        </div>
        <div>
          <strong>{isPaused ? t('Paused') : t('Running')}</strong>
          <span>{t('Downloader')}</span>
        </div>
      </div>

      {downloads.actionError ? (
        <p className="alert alert-error" role="alert">
          {t('The download action failed.')}
        </p>
      ) : null}

      {downloads.error ? (
        <div className="library-state" role="alert">
          <h1>{t('Couldn’t load downloads')}</h1>
          <p>{t('The download queue could not be loaded from your server.')}</p>
          <button className="button" type="button" onClick={() => void controller.load()}>
            {t('Retry')}
          </button>
        </div>
      ) : null}

      <section className="download-section" aria-labelledby="download-queue-heading">
        <div className="section-heading-row">
          <h2 id="download-queue-heading">{t('Queue')}</h2>
          <span>{queue.length}</span>
        </div>

        {downloads.isLoading && !downloads.queue ? (
          <div className="feed-skeleton" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="feed-skeleton-row" key={index} />
            ))}
          </div>
        ) : null}

        {!downloads.isLoading && queue.length === 0 ? (
          <p className="download-empty">{t('The download queue is empty.')}</p>
        ) : null}

        <div className="download-list">
          {groups.map((group) => {
            const progress = Math.round(
              (group.items.reduce((total, item) => total + item.progress, 0) /
                group.items.length) *
                100,
            );

            return (
              <section className="download-group" key={group.manga.id}>
                <div className="download-group-heading">
                  <strong>{group.manga.title}</strong>
                  <span>
                    {t('{count} chapters', { count: group.items.length })} ·{' '}
                    {progress}%
                  </span>
                  <button
                    className="library-action"
                    type="button"
                    disabled={downloads.isActing}
                    onClick={() =>
                      void controller.dequeueMany(
                        group.items.map((item) => item.chapter.id),
                      )
                    }
                  >
                    {t('Cancel series')}
                  </button>
                </div>
                <div className="download-group-rows">
                  {group.items.map((item) => (
                    <DownloadRow
                      key={item.chapter.id}
                      item={item}
                      resources={context.resources}
                      controller={controller}
                      disabled={downloads.isActing}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="download-section" aria-labelledby="downloaded-heading">
        <div className="section-heading-row">
          <h2 id="downloaded-heading">{t('Downloaded chapters')}</h2>
          <span>
            {downloaded.data
              ? t('{shown} of {total}', {
                  shown: downloaded.data.items.length,
                  total: downloaded.data.totalCount,
                })
              : 0}
          </span>
        </div>

        {downloaded.isLoading && !downloaded.data ? (
          <div className="feed-skeleton" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="feed-skeleton-row" key={index} />
            ))}
          </div>
        ) : null}

        {!downloaded.isLoading && (downloaded.data?.items.length ?? 0) === 0 ? (
          <p className="download-empty">{t('No downloaded chapters on this server.')}</p>
        ) : null}

        {downloaded.data && downloaded.data.items.length > 0 ? (
          <div className="feed-list">
            {downloaded.data.items.map((chapter) => (
              <div className="downloaded-row" key={chapter.id}>
                <FeedRow
                  chapter={chapter}
                  resources={context.resources}
                  detail={`${t('{count} pages', { count: chapter.pageCount })} · ${t('Downloaded')}`}
                />
                {isOfflineStorageSupported() ? (
                  <button
                    className="button button-secondary"
                    type="button"
                    disabled={deviceBusyId === chapter.id}
                    onClick={() => void saveChapterToDevice(chapter.id)}
                  >
                    {deviceBusyId === chapter.id
                      ? t('Saving…')
                      : t('Save to device')}
                  </button>
                ) : null}
                <button
                  className="download-cancel"
                  type="button"
                  disabled={downloads.isActing}
                  aria-label={`Delete download for ${chapter.name}`}
                  onClick={() => void controller.deleteDownloaded(chapter.id)}
                >
                  {t('Delete')}
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="download-section" aria-labelledby="device-downloads-heading">
        <div className="section-heading-row">
          <h2 id="device-downloads-heading">{t('This device')}</h2>
          <span>
            {deviceRecords.length > 0
              ? `${deviceRecords.length} · ${formatBytes(
                  deviceRecords.reduce((total, record) => total + record.bytes, 0),
                )}`
              : 0}
          </span>
        </div>

        {!isOfflineStorageSupported() ? (
          <p className="download-empty">
            {t('Device storage is not available in this browser.')}
          </p>
        ) : null}

        {deviceLoading ? (
          <p className="settings-save-state" role="status">
            {t('Loading…')}
          </p>
        ) : null}

        {deviceError ? (
          <p className="settings-inline-error" role="alert">
            {t('Device download failed.')}
          </p>
        ) : null}

        {isOfflineStorageSupported() &&
        !deviceLoading &&
        deviceRecords.length === 0 ? (
          <p className="download-empty">
            {t('No chapters saved to this device.')}
          </p>
        ) : null}

        {deviceRecords.length > 0 ? (
          <div className="feed-list">
            {deviceRecords.map((record) => (
              <div className="downloaded-row" key={record.chapterId}>
                <div className="download-copy">
                  <strong>{record.chapterName}</strong>
                  <span className="download-meta">
                    {record.mangaTitle} ·{' '}
                    {t('{count} pages', { count: record.pageCount })} ·{' '}
                    {formatBytes(record.bytes)}
                  </span>
                </div>
                <Link
                  className="button"
                  to={`/offline/read/${record.chapterId}`}
                >
                  {t('Read offline')}
                </Link>
                <button
                  className="download-cancel"
                  type="button"
                  disabled={deviceBusyId === record.chapterId}
                  onClick={() => void removeDeviceRecord(record.chapterId)}
                >
                  {deviceBusyId === record.chapterId
                    ? t('Deleting…')
                    : t('Delete')}
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function DownloadRow({
  item,
  resources,
  controller,
  disabled,
}: {
  readonly item: DownloadItem;
  readonly resources: ResourceService;
  readonly controller: DownloadController;
  readonly disabled: boolean;
}) {
  const { t } = useI18n();
  const image = useImageResource(resources, item.manga.thumbnailUrl);
  const progress = Math.max(0, Math.min(100, Math.round(item.progress * 100)));

  return (
    <div className="download-row">
      <span className="feed-art" aria-hidden="true">
        {image.objectUrl ? (
          <img src={image.objectUrl} alt="" decoding="async" />
        ) : (
          <span>{item.manga.title.trim().charAt(0).toUpperCase() || '·'}</span>
        )}
      </span>
      <div className="download-copy">
        <div className="download-title-row">
          <span className="download-title">{item.manga.title}</span>
          <span className={`download-state is-${item.state.toLowerCase()}`}>
            {t(STATE_LABEL[item.state])}
          </span>
        </div>
        <span className="download-chapter">{item.chapter.name}</span>
        <div
          className="download-progress"
          role="progressbar"
          aria-label={`${item.chapter.name} download progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <span className="download-meta">
          {progress}% · {t('{count} pages', { count: item.chapter.pageCount })} ·{' '}
          {t('try {count}', { count: item.tries + 1 })}
        </span>
      </div>
      <button
        className="download-cancel"
        type="button"
        disabled={disabled}
        aria-label={`Cancel download for ${item.chapter.name}`}
        onClick={() => void controller.dequeue(item.chapter.id)}
      >
        {t('Cancel')}
      </button>
    </div>
  );
}

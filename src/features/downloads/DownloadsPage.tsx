import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
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
import { useImageResource } from '../../shared/useImageResource';
import { FeedRow } from '../../shared/FeedRow';
import { PageHeader } from '../../shared/PageHeader';

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

  const queue = downloads.queue?.queue ?? [];
  const pages = (downloaded.data?.items ?? []).reduce(
    (total, item) => total + item.pageCount,
    0,
  );
  const isPaused = downloads.queue?.state === 'STOPPED';
  const failedCount = queue.filter((item) => item.state === 'ERROR').length;

  return (
    <div className="app-shell page-shell downloads-shell">
      <PageHeader
        title="Downloads"
        subtitle="Manage the download queue on your server"
        count={downloads.queue ? `${queue.length} queued` : undefined}
      >
        <button
          className="button button-secondary"
          type="button"
          disabled={downloads.isActing || !downloads.queue}
          onClick={() => void controller.togglePaused()}
        >
          {isPaused ? 'Resume downloads' : 'Pause downloads'}
        </button>
        <button
          className="button button-secondary"
          type="button"
          disabled={downloads.isLoading}
          onClick={() => void controller.load()}
        >
          Refresh
        </button>
        <button
          className="button button-secondary"
          type="button"
          disabled={downloads.isActing || failedCount === 0}
          onClick={() => void controller.retryFailed()}
        >
          Retry failed{failedCount > 0 ? ` (${failedCount})` : ''}
        </button>
      </PageHeader>

      <div className="download-stats">
        <div>
          <strong>{queue.length}</strong>
          <span>In queue</span>
        </div>
        <div>
          <strong>{downloaded.data?.totalCount ?? '—'}</strong>
          <span>Downloaded</span>
        </div>
        <div>
          <strong>{pages.toLocaleString('en-US')}</strong>
          <span>Downloaded pages</span>
        </div>
        <div>
          <strong>{isPaused ? 'Paused' : 'Running'}</strong>
          <span>Downloader</span>
        </div>
      </div>

      {downloads.actionError ? (
        <p className="alert alert-error" role="alert">
          The download action failed.
        </p>
      ) : null}

      {downloads.error ? (
        <div className="library-state" role="alert">
          <h1>Couldn&apos;t load downloads</h1>
          <p>The download queue could not be loaded from your server.</p>
          <button className="button" type="button" onClick={() => void controller.load()}>
            Retry
          </button>
        </div>
      ) : null}

      <section className="download-section" aria-labelledby="download-queue-heading">
        <div className="section-heading-row">
          <h2 id="download-queue-heading">Queue</h2>
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
          <p className="download-empty">The download queue is empty.</p>
        ) : null}

        <div className="download-list">
          {queue.map((item) => (
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

      <section className="download-section" aria-labelledby="downloaded-heading">
        <div className="section-heading-row">
          <h2 id="downloaded-heading">Downloaded chapters</h2>
          <span>
            {downloaded.data
              ? `${downloaded.data.items.length} of ${downloaded.data.totalCount}`
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
          <p className="download-empty">No downloaded chapters on this server.</p>
        ) : null}

        {downloaded.data && downloaded.data.items.length > 0 ? (
          <div className="feed-list">
            {downloaded.data.items.map((chapter) => (
              <div className="downloaded-row" key={chapter.id}>
                <FeedRow
                  chapter={chapter}
                  resources={context.resources}
                  detail={`${chapter.pageCount} pages · Downloaded`}
                />
                <button
                  className="download-cancel"
                  type="button"
                  disabled={downloads.isActing}
                  aria-label={`Delete download for ${chapter.name}`}
                  onClick={() => void controller.deleteDownloaded(chapter.id)}
                >
                  Delete
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
            {STATE_LABEL[item.state]}
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
          {progress}% · {item.chapter.pageCount} pages · try {item.tries + 1}
        </span>
      </div>
      <button
        className="download-cancel"
        type="button"
        disabled={disabled}
        aria-label={`Cancel download for ${item.chapter.name}`}
        onClick={() => void controller.dequeue(item.chapter.id)}
      >
        Cancel
      </button>
    </div>
  );
}

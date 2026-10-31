import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  createCatalogRepository,
  type FeedChapter,
} from '../../core/catalog/catalogRepository';
import { createLoadableController } from '../../core/catalog/loadableController';
import { feedDay, formatRelativeTime } from '../../shared/feedTime';
import { FeedRow } from '../../shared/FeedRow';
import { PageHeader } from '../../shared/PageHeader';
import { LibrarySyncButton } from '../library/LibrarySyncButton';
import { createMangaRepository } from '../../core/manga/mangaRepository';

type FeedFilter = 'all' | 'unread' | 'read';

function groupFeed(items: readonly FeedChapter[]) {
  const groups = new Map<string, FeedChapter[]>();

  for (const item of items) {
    const day = feedDay(item.uploadDate);
    const group = groups.get(day);

    if (group) {
      group.push(item);
    } else {
      groups.set(day, [item]);
    }
  }

  return groups;
}

export function UpdatesPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <UpdatesContent context={state.context} />;
}

function UpdatesContent({ context }: { readonly context: ConnectedContext }) {
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [pendingChapterId, setPendingChapterId] = useState<number | null>(null);
  const [queuedChapters, setQueuedChapters] = useState<ReadonlySet<number>>(
    new Set(),
  );
  const [actionError, setActionError] = useState(false);
  const repository = useMemo(
    () => createCatalogRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const mangaRepository = useMemo(
    () => createMangaRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const controller = useMemo(
    () =>
      createLoadableController({
        load: () =>
          repository.getFeed({
            filter: { inLibrary: { equalTo: true } },
            order: [{ by: 'UPLOAD_DATE', byType: 'DESC' }],
          }),
      }),
    [repository],
  );
  const feed = useSyncExternalStore(controller.subscribe, controller.getState);

  useEffect(() => {
    void controller.load();
  }, [controller]);

  const items = feed.data?.items ?? [];
  const unread = items.filter((item) => !item.isRead).length;
  const read = items.length - unread;
  const visible = items.filter((item) =>
    filter === 'all' ? true : filter === 'unread' ? !item.isRead : item.isRead,
  );
  const groups = groupFeed(visible);

  return (
    <div className="app-shell page-shell feed-shell">
      <PageHeader
        title="Updates"
        subtitle="New chapters from your library"
        count={feed.data ? `Latest ${items.length} of ${feed.data.totalCount.toLocaleString('en-US')}` : undefined}
      >
        <LibrarySyncButton context={context} onComplete={() => void controller.load()} />
      </PageHeader>

      <div className="feed-toolbar">
        <div className="feed-filters" role="group" aria-label="Filter updates">
          {(
            [
              ['all', 'All', items.length],
              ['unread', 'Unread', unread],
              ['read', 'Read', read],
            ] as const
          ).map(([value, label, count]) => (
            <button
              className={filter === value ? 'is-active' : undefined}
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
            >
              {label}
              <span>{count}</span>
            </button>
          ))}
        </div>
        <span className="feed-sort">Newest first</span>
      </div>

      {feed.isLoading && !feed.data ? (
        <div className="feed-skeleton" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <div className="feed-skeleton-row" key={index} />
          ))}
        </div>
      ) : null}

      {feed.error && !feed.data ? (
        <div className="library-state" role="alert">
          <h1>Couldn&apos;t load updates</h1>
          <p>The chapter feed could not be loaded from your server.</p>
          <button className="button" type="button" onClick={() => void controller.load()}>
            Retry
          </button>
        </div>
      ) : null}

      {!feed.isLoading && !feed.error && items.length === 0 ? (
        <div className="library-state">
          <h1>No updates yet</h1>
          <p>New chapters from manga in your library will appear here.</p>
        </div>
      ) : null}

      {visible.length === 0 && items.length > 0 ? (
        <div className="library-state">
          <h1>Nothing in this filter</h1>
          <p>Try another update filter.</p>
        </div>
      ) : null}

      {[...groups.entries()].map(([day, chapters]) => (
        <section className="feed-group" key={day} aria-labelledby={`feed-${day}`}>
          <div className="feed-group-heading">
            <h2 id={`feed-${day}`}>{day}</h2>
            <span>{chapters.length}</span>
          </div>
          <div className="feed-list">
            {chapters.map((chapter) => (
              <FeedRow
                key={chapter.id}
                chapter={chapter}
                resources={context.resources}
                detail={`${formatRelativeTime(chapter.uploadDate)} · ${chapter.pageCount} pages`}
                stateLabel={chapter.isRead ? 'Read' : 'Unread'}
                actions={
                  <>
                    <button
                      className="feed-action"
                      type="button"
                      disabled={pendingChapterId === chapter.id}
                      onClick={() => {
                        setActionError(false);
                        setPendingChapterId(chapter.id);
                        void mangaRepository
                          .setChapterRead(chapter.id, !chapter.isRead)
                          .then(() => controller.load())
                          .catch(() => setActionError(true))
                          .finally(() => setPendingChapterId(null));
                      }}
                    >
                      {chapter.isRead ? 'Unread' : 'Read'}
                    </button>
                    <button
                      className="feed-action"
                      type="button"
                      disabled={
                        queuedChapters.has(chapter.id) ||
                        pendingChapterId === chapter.id
                      }
                      onClick={() => {
                        setActionError(false);
                        setPendingChapterId(chapter.id);
                        void mangaRepository
                          .enqueueDownload(chapter.id)
                          .then(() =>
                            setQueuedChapters((current) => {
                              const next = new Set(current);
                              next.add(chapter.id);
                              return next;
                            }),
                          )
                          .catch(() => setActionError(true))
                          .finally(() => setPendingChapterId(null));
                      }}
                    >
                      {queuedChapters.has(chapter.id) ? 'Queued' : 'Download'}
                    </button>
                  </>
                }
              />
            ))}
          </div>
        </section>
      ))}
      {actionError ? (
        <p className="alert alert-error" role="alert">
          Could not update this chapter.
        </p>
      ) : null}
    </div>
  );
}

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import { useAppPath } from '../../app/useAppPath';
import { createSectionOrigin } from '../../app/navigationOrigin';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  createCatalogRepository,
  type FeedChapter,
} from '../../core/catalog/catalogRepository';
import { createLoadableController } from '../../core/catalog/loadableController';
import { UpdatesContinueDocument, type UpdatesContinueQuery } from '../../core/graphql/generated/graphql';
import { feedDay, formatRelativeTime } from '../../shared/feedTime';
import { FeedRow } from '../../shared/FeedRow';
import { useImageResource } from '../../shared/useImageResource';
import { PageHeader } from '../../shared/PageHeader';
import { LibrarySyncButton } from '../library/LibrarySyncButton';
import { createMangaRepository } from '../../core/manga/mangaRepository';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  Updates: 'Update',
  'New chapters from your library': 'Chapter baru dari perpustakaan Anda',
  'Latest {shown} of {total}': 'Terbaru {shown} dari {total}',
  All: 'Semua',
  Unread: 'Belum dibaca',
  Read: 'Sudah dibaca',
  'All scanlators': 'Semua scanlator',
  'Newest first': 'Terbaru dulu',
  'Continue reading': 'Lanjut membaca',
  '{count} manga': '{count} manga',
  'Couldn’t load updates': 'Tidak dapat memuat update',
  "Couldn't load updates": 'Tidak dapat memuat update',
  'The chapter feed could not be loaded from your server.':
    'Feed chapter tidak dapat dimuat dari server Anda.',
  'No updates yet': 'Belum ada update',
  'New chapters from manga in your library will appear here.':
    'Chapter baru dari manga di perpustakaan Anda akan muncul di sini.',
  'Nothing in this filter': 'Tidak ada pada filter ini',
  'Try another update filter.': 'Coba filter update lain.',
  Download: 'Unduh',
  Queued: 'Dalam antrean',
  Manga: 'Manga',
  Today: 'Hari ini',
  Yesterday: 'Kemarin',
  Earlier: 'Sebelumnya',
});

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
  const { t } = useI18n();
  const { pathname, search } = useAppPath();
  const origin = createSectionOrigin('updates', { pathname, search });
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [scanlator, setScanlator] = useState('all');
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
  const continueController = useMemo(
    () =>
      createLoadableController({
        load: async () => {
          const result = await context.graphQL.query({
            query: UpdatesContinueDocument,
            fetchPolicy: 'network-only',
          });

          if (!result.data) {
            throw new Error('Continue reading feed is unavailable.');
          }

          return result.data;
        },
      }),
    [context.graphQL],
  );
  const continueFeed = useSyncExternalStore(
    continueController.subscribe,
    continueController.getState,
  );

  useEffect(() => {
    void controller.load();
    void continueController.load();
  }, [continueController, controller]);

  const continueItems = (continueFeed.data?.mangas.nodes ?? []).filter(
    (manga) => manga.firstUnreadChapter !== null,
  );

  const items = feed.data?.items ?? [];
  const unread = items.filter((item) => !item.isRead).length;
  const read = items.length - unread;
  const scanlators = [
    ...new Set(
      items
        .map((item) => item.scanlator)
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort();
  const visible = items.filter((item) => {
    if (scanlator !== 'all' && item.scanlator !== scanlator) {
      return false;
    }

    return filter === 'all'
      ? true
      : filter === 'unread'
        ? !item.isRead
        : item.isRead;
  });
  const groups = groupFeed(visible);

  return (
    <div className="app-shell page-shell feed-shell">
      <PageHeader
        title={t('Updates')}
        subtitle={t('New chapters from your library')}
        count={
          feed.data
            ? t('Latest {shown} of {total}', {
                shown: items.length,
                total: feed.data.totalCount.toLocaleString('en-US'),
              })
            : undefined
        }
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
              {t(label)}
              <span>{count}</span>
            </button>
          ))}
        </div>
        {scanlators.length > 0 ? (
          <label className="chapter-select">
            <span className="sr-only">Filter updates by scanlator</span>
            <select
              aria-label="Filter updates by scanlator"
              value={scanlator}
              onChange={(event) => setScanlator(event.target.value)}
            >
              <option value="all">{t('All scanlators')}</option>
              {scanlators.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <span className="feed-sort">{t('Newest first')}</span>
      </div>

      {continueItems.length > 0 ? (
        <details className="updates-continue" aria-labelledby="updates-continue-heading">
          <summary className="section-heading-row">
            <h2 id="updates-continue-heading">{t('Continue reading')}</h2>
            <span>{t('{count} manga', { count: continueItems.length })}</span>
          </summary>
          <div className="updates-continue-grid">
            {continueItems.map((manga) => (
              <ContinueCard
                key={manga.id}
                manga={manga}
                resources={context.resources}
              />
            ))}
          </div>
        </details>
      ) : null}

      {feed.isLoading && !feed.data ? (
        <div className="feed-skeleton" aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <div className="feed-skeleton-row" key={index} />
          ))}
        </div>
      ) : null}

      {feed.error && !feed.data ? (
        <div className="library-state" role="alert">
          <h1>{t('Couldn’t load updates')}</h1>
          <p>{t('The chapter feed could not be loaded from your server.')}</p>
          <button className="button" type="button" onClick={() => void controller.load()}>
            Retry
          </button>
        </div>
      ) : null}

      {!feed.isLoading && !feed.error && items.length === 0 ? (
        <div className="library-state">
          <h1>{t('No updates yet')}</h1>
          <p>{t('New chapters from manga in your library will appear here.')}</p>
        </div>
      ) : null}

      {visible.length === 0 && items.length > 0 ? (
        <div className="library-state">
          <h1>{t('Nothing in this filter')}</h1>
          <p>{t('Try another update filter.')}</p>
        </div>
      ) : null}

      {[...groups.entries()].map(([day, chapters]) => (
        <section className="feed-group" key={day} aria-labelledby={`feed-${day}`}>
          <div className="feed-group-heading">
            <h2 id={`feed-${day}`}>{t(day)}</h2>
            <span>{chapters.length}</span>
          </div>
          <div className="feed-list">
            {chapters.map((chapter) => (
              <FeedRow
                key={chapter.id}
                chapter={chapter}
                resources={context.resources}
                state={{ origin }}
                detail={`${formatRelativeTime(chapter.uploadDate)} · ${chapter.pageCount} pages`}
                actions={
                  <>
                    <button
                      className={`feed-action${chapter.isRead ? ' is-active' : ''}`}
                      type="button"
                      aria-pressed={chapter.isRead}
                      title={chapter.isRead ? 'Mark as unread' : 'Mark as read'}
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
                      {t('Read')}
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
                      {queuedChapters.has(chapter.id)
                        ? t('Queued')
                        : t('Download')}
                    </button>
                    <Link
                      className="feed-action"
                      to={`/manga/${chapter.manga.id}`}
                      state={{ origin }}
                    >
                      {t('Manga')}
                    </Link>
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

function ContinueCard({
  manga,
  resources,
}: {
  readonly manga: UpdatesContinueQuery['mangas']['nodes'][number];
  readonly resources: ConnectedContext['resources'];
}) {
  const chapter = manga.firstUnreadChapter;
  const image = useImageResource(resources, manga.thumbnailUrl);

  if (!chapter) {
    return null;
  }

  return (
    <Link
      className="updates-continue-card"
      to={`/manga/${manga.id}/chapter/${chapter.id}${
        chapter.lastPageRead > 0 ? `?page=${chapter.lastPageRead + 1}` : ''
      }`}
    >
      <span className="updates-continue-cover" aria-hidden="true">
        {image.objectUrl ? (
          <img src={image.objectUrl} alt="" loading="lazy" decoding="async" />
        ) : (
          <span>{manga.title.charAt(0).toUpperCase() || 'M'}</span>
        )}
      </span>
      <span>
        <strong>{manga.title}</strong>
        <small>{chapter.name}</small>
      </span>
    </Link>
  );
}

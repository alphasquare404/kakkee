import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import { useAppPath } from '../../app/useAppPath';
import { useHiddenCategoryIds } from '../../shared/useHiddenCategories';
import { useHiddenHistory } from '../../shared/useHiddenHistory';
import { useHistoryPreferences } from '../../shared/useHistoryPreferences';
import { hideHistoryManga } from '../../core/preferences/hiddenHistory';
import { createSectionOrigin } from '../../app/navigationOrigin';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import type { FeedChapter } from '../../core/catalog/catalogRepository';
import { createLoadableController } from '../../core/catalog/loadableController';
import { createReadingFeedRepository } from '../../core/catalog/readingFeedRepository';
import {
  createCatalogRepository,
  type FeedInput,
} from '../../core/catalog/catalogRepository';
import {
  feedDay,
  formatRelativeTime,
  formatRelativeTimeShort,
} from '../../shared/feedTime';
import { useImageResource } from '../../shared/useImageResource';
import { PageHeader } from '../../shared/PageHeader';
import { ContextMenu } from '../../shared/ContextMenu';
import { LibrarySyncButton } from '../library/LibrarySyncButton';
import { IconCheck, IconInfo } from '../library/icons';
import { createMangaRepository } from '../../core/manga/mangaRepository';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  'Continue Reading and Updates': 'Lanjut Membaca dan Update',
  Updates: 'Update',
  'Latest {shown} of {total}': 'Terbaru {shown} dari {total}',
  All: 'Semua',
  Unread: 'Belum dibaca',
  Read: 'Sudah dibaca',
  'Mark read': 'Tandai dibaca',
  'Mark unread': 'Tandai belum dibaca',
  'Continue Reading': 'Lanjut Membaca',
  '{count} manga': '{count} manga',
  'Couldn’t load updates': 'Tidak dapat memuat update',
  "Couldn't load updates": 'Tidak dapat memuat update',
  'The chapter feed could not be loaded from your server.':
    'Feed chapter tidak dapat dimuat dari server Anda.',
  'No updates yet': 'Belum ada update',
  'New chapters from manga in your library will appear here.':
    'Chapter baru dari manga di perpustakaan Anda akan muncul di sini.',
  'Nothing in this filter': 'Tidak ada pada filter ini',
  'Open library': 'Buka perpustakaan',
  'Show all updates': 'Tampilkan semua update',
  'Try another update filter.': 'Coba filter update lain.',
  'Manga details': 'Detail manga',
  'Page {page} of {total}': 'Halaman {page} dari {total}',
  'In progress': 'Sedang dibaca',
  'Load more': 'Muat lebih banyak',
  'Open manga page': 'Buka halaman manga',
  Hide: 'Sembunyikan',
  'Continue reading actions': 'Aksi lanjut membaca',
  Today: 'Hari ini',
  Yesterday: 'Kemarin',
  Earlier: 'Sebelumnya',
});

type FeedFilter = 'all' | 'unread' | 'read';

const HISTORY_FEED: FeedInput = {
  filter: { lastReadAt: { greaterThan: '0' } },
  order: [{ by: 'LAST_READ_AT', byType: 'DESC' }],
  first: 40,
};

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
  const hiddenCategoryIds = useHiddenCategoryIds();
  const hiddenHistoryIds = useHiddenHistory();
  const historyPreferences = useHistoryPreferences();
  const { pathname, search } = useAppPath();
  const origin = createSectionOrigin('updates', { pathname, search });
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [pendingChapterId, setPendingChapterId] = useState<number | null>(null);
  const continueRail = useRef<HTMLDivElement>(null);
  const continueDrag = useRef<{
    startX: number;
    startScroll: number;
    moved: boolean;
  } | null>(null);
  const suppressContinueClick = useRef(false);
  const [continueDragging, setContinueDragging] = useState(false);
  const [actionError, setActionError] = useState(false);
  const readingFeedRepository = useMemo(
    () => createReadingFeedRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const mangaRepository = useMemo(
    () => createMangaRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const controller = useMemo(
    () =>
      createLoadableController({
        load: () => readingFeedRepository.get(hiddenCategoryIds),
      }),
    [hiddenCategoryIds, readingFeedRepository],
  );
  const feed = useSyncExternalStore(controller.subscribe, controller.getState);
  const historyRepository = useMemo(
    () =>
      createCatalogRepository({
        getClient: () => context.graphQL,
      }),
    [context.graphQL],
  );
  const continueController = useMemo(
    () =>
      createLoadableController({
        load: async () => {
          const page = await historyRepository.getFeed(HISTORY_FEED);
          const seen = new Set<number>();

          return {
            items: page.items.filter((chapter) => {
              if (
                seen.has(chapter.manga.id) ||
                hiddenHistoryIds.has(chapter.manga.id) ||
                (historyPreferences.hideRead && chapter.isRead) ||
                chapter.manga.categories.nodes.some((category) =>
                  hiddenCategoryIds.has(category.id),
                )
              ) {
                return false;
              }

              seen.add(chapter.manga.id);
              return true;
            }),
            pageInfo: page.pageInfo,
          };
        },
      }),
    [
      hiddenCategoryIds,
      hiddenHistoryIds,
      historyPreferences.hideRead,
      historyRepository,
    ],
  );
  const continueFeed = useSyncExternalStore(
    continueController.subscribe,
    continueController.getState,
  );
  const [continueExtra, setContinueExtra] = useState<FeedChapter[]>([]);
  const [continueCursor, setContinueCursor] = useState<string | null>(null);
  const [continueHasMore, setContinueHasMore] = useState(false);
  const [continueLoadingMore, setContinueLoadingMore] = useState(false);
  const [continueMenu, setContinueMenu] = useState<{
    entry: FeedChapter;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    void controller.load();
    void continueController.load();
  }, [continueController, controller]);

  const continueItems = [
    ...(continueFeed.data?.items ?? []),
    ...continueExtra,
  ];

  useEffect(() => {
    setContinueExtra([]);
    setContinueCursor(continueFeed.data?.pageInfo?.endCursor ?? null);
    setContinueHasMore(continueFeed.data?.pageInfo?.hasNextPage ?? false);
  }, [continueFeed.data]);

  const items = feed.data?.items ?? [];
  const unread = items.filter((item) => !item.isRead).length;
  const read = items.length - unread;
  const visible = items.filter((item) =>
    filter === 'all' ? true : filter === 'unread' ? !item.isRead : item.isRead,
  );
  const groups = groupFeed(visible);

  const loadMoreContinue = async () => {
    if (
      !continueCursor ||
      !continueHasMore ||
      continueLoadingMore ||
      continueFeed.isLoading
    ) {
      return;
    }

    setContinueLoadingMore(true);

    try {
      const page = await historyRepository.getFeed({
        ...HISTORY_FEED,
        after: continueCursor,
      });
      const seen = new Set(continueItems.map((chapter) => chapter.manga.id));
      const additions = page.items.filter((chapter) => {
        if (
          seen.has(chapter.manga.id) ||
          hiddenHistoryIds.has(chapter.manga.id) ||
          (historyPreferences.hideRead && chapter.isRead) ||
          chapter.manga.categories.nodes.some((category) =>
            hiddenCategoryIds.has(category.id),
          )
        ) {
          return false;
        }

        seen.add(chapter.manga.id);
        return true;
      });

      setContinueExtra((current) => [...current, ...additions]);
      setContinueCursor(page.pageInfo?.endCursor ?? null);
      setContinueHasMore(page.pageInfo?.hasNextPage ?? false);
    } catch {
      // Keep the existing rail; the next click can retry.
    } finally {
      setContinueLoadingMore(false);
    }
  };

  const onContinuePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) {
      return;
    }

    const rail = continueRail.current;

    if (!rail) {
      return;
    }

    continueDrag.current = {
      startX: event.clientX,
      startScroll: rail.scrollLeft,
      moved: false,
    };
    suppressContinueClick.current = false;
    setContinueDragging(true);
    rail.setPointerCapture(event.pointerId);
  };

  const onContinuePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = continueDrag.current;
    const rail = continueRail.current;

    if (!state || !rail) {
      return;
    }

    const distance = event.clientX - state.startX;

    if (Math.abs(distance) > 4) {
      state.moved = true;
      suppressContinueClick.current = true;
      rail.scrollLeft = state.startScroll - distance;
      event.preventDefault();
    }
  };

  const endContinueDrag = () => {
    continueDrag.current = null;
    setContinueDragging(false);
  };

  return (
    <div className="app-shell page-shell feed-shell reading-shell">
      <PageHeader
        title={t('nav.updates')}
        subtitle={t('Continue Reading and Updates')}
      >
        <LibrarySyncButton
          context={context}
          iconOnly
          className="app-header-icon-button"
          onComplete={() => void controller.load()}
        />
      </PageHeader>

      {continueItems.length > 0 ? (
        <section
          className="reading-continue"
          aria-labelledby="reading-continue-heading"
        >
          <div className="section-heading-row">
            <h2 id="reading-continue-heading">{t('Continue Reading')}</h2>
          </div>
          <div
            className={`reading-continue-rail${continueDragging ? ' is-dragging' : ''}`}
            ref={continueRail}
            onPointerDown={onContinuePointerDown}
            onPointerMove={onContinuePointerMove}
            onPointerUp={endContinueDrag}
            onPointerCancel={endContinueDrag}
            onPointerLeave={endContinueDrag}
            onDragStart={(event) => event.preventDefault()}
            onClickCapture={(event) => {
              if (suppressContinueClick.current) {
                suppressContinueClick.current = false;
                event.preventDefault();
                event.stopPropagation();
              }
            }}
          >
            {continueItems.map((entry) => (
              <ContinueCard
                key={entry.id}
                entry={entry}
                origin={origin}
                resources={context.resources}
                onMenu={(x, y) => setContinueMenu({ entry, x, y })}
              />
            ))}
            {continueHasMore ? (
              <button
                className="reading-continue-more"
                type="button"
                disabled={continueLoadingMore}
                onClick={() => void loadMoreContinue()}
              >
                <span className="reading-continue-more-cover" aria-hidden="true">
                  +
                </span>
                <span className="reading-continue-more-label">
                  {continueLoadingMore ? t('Loading…') : t('Load more')}
                </span>
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      <ContextMenu
        open={continueMenu !== null}
        position={{ x: continueMenu?.x ?? 0, y: continueMenu?.y ?? 0 }}
        label={t('Continue reading actions')}
        onClose={() => setContinueMenu(null)}
      >
        {continueMenu ? (
          <>
            <Link
              className="context-menu-item"
              role="menuitem"
              to={`/manga/${continueMenu.entry.manga.id}`}
              state={{ origin }}
              onClick={() => setContinueMenu(null)}
            >
              {t('Open manga page')}
            </Link>
            <button
              className="context-menu-item"
              type="button"
              role="menuitem"
              onClick={() => {
                hideHistoryManga(continueMenu.entry.manga.id);
                setContinueMenu(null);
              }}
            >
              {t('Hide')}
            </button>
          </>
        ) : null}
      </ContextMenu>

      <section className="reading-updates" aria-labelledby="reading-updates-heading">
        <div className="reading-updates-heading">
          <h2 id="reading-updates-heading">{t('Updates')}</h2>
          {feed.data ? (
            <span>
              {t('Latest {shown} of {total}', {
                shown: items.length,
                total: feed.data.totalCount.toLocaleString('en-US'),
              })}
            </span>
          ) : null}
        </div>

        <div className="feed-toolbar">
          <div className="feed-filters" role="group" aria-label="Filter chapters">
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
        </div>
      </section>

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
          <div className="actions">
            <Link className="button" to="/library">
              {t('Open library')}
            </Link>
          </div>
        </div>
      ) : null}

      {visible.length === 0 && items.length > 0 ? (
        <div className="library-state">
          <h1>{t('Nothing in this filter')}</h1>
          <p>{t('Try another update filter.')}</p>
          <div className="actions">
            <button className="button" type="button" onClick={() => setFilter('all')}>
              {t('Show all updates')}
            </button>
          </div>
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
              <ReadingRow
                key={chapter.id}
                chapter={chapter}
                resources={context.resources}
                origin={origin}
                pending={pendingChapterId === chapter.id}
                onToggleRead={() => {
                  setActionError(false);
                  setPendingChapterId(chapter.id);
                  void mangaRepository
                    .setChapterRead(chapter.id, !chapter.isRead)
                    .then(() => controller.load())
                    .catch(() => setActionError(true))
                    .finally(() => setPendingChapterId(null));
                }}
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

function ReadingRow({
  chapter,
  resources,
  origin,
  pending,
  onToggleRead,
}: {
  readonly chapter: FeedChapter;
  readonly resources: ConnectedContext['resources'];
  readonly origin: unknown;
  readonly pending: boolean;
  readonly onToggleRead: () => void;
}) {
  const { t } = useI18n();
  const [portrait, setPortrait] = useState(false);
  const image = useImageResource(resources, chapter.manga.thumbnailUrl);
  const pageLabel =
    chapter.pageCount === 1 ? '1 page' : `${chapter.pageCount} pages`;

  return (
    <div className="reading-row-shell">
      <Link
        className="reading-row"
        to={`/manga/${chapter.manga.id}/chapter/${chapter.id}`}
        state={{ origin }}
        aria-label={`${chapter.manga.title}, ${chapter.name}`}
      >
        <span
          className={`reading-row-art${portrait ? ' is-portrait-fill' : ''}`}
          aria-hidden="true"
        >
          {image.objectUrl ? (
            <img
              src={image.objectUrl}
              alt=""
              loading="lazy"
              decoding="async"
              onLoad={(event) =>
                setPortrait(
                  event.currentTarget.naturalHeight >
                    event.currentTarget.naturalWidth,
                )
              }
            />
          ) : (
            <span>{chapter.manga.title.trim().charAt(0).toUpperCase() || '·'}</span>
          )}
        </span>
        <span className="reading-row-main">
          <strong className="reading-row-title">{chapter.manga.title}</strong>
          <span className="reading-row-meta">
            {chapter.name}
            <span aria-hidden="true"> · </span>
            {formatRelativeTime(chapter.uploadDate)}
            <span aria-hidden="true"> · </span>
            {pageLabel}
          </span>
        </span>
      </Link>

      <div className="reading-row-actions">
        <button
          className={`reading-icon-button${chapter.isRead ? ' is-active' : ''}`}
          type="button"
          aria-label={chapter.isRead ? t('Mark unread') : t('Mark read')}
          aria-pressed={chapter.isRead}
          title={chapter.isRead ? t('Mark unread') : t('Mark read')}
          disabled={pending}
          onClick={onToggleRead}
        >
          <IconCheck />
        </button>
        <Link
          className="reading-icon-button"
          to={`/manga/${chapter.manga.id}`}
          state={{ origin }}
          aria-label={t('Manga details')}
          title={t('Manga details')}
        >
          <IconInfo />
        </Link>
      </div>
    </div>
  );
}

function ContinueCard({
  entry,
  origin,
  resources,
  onMenu,
}: {
  readonly entry: FeedChapter;
  readonly origin: unknown;
  readonly resources: ConnectedContext['resources'];
  readonly onMenu: (x: number, y: number) => void;
}) {
  const [portrait, setPortrait] = useState(false);
  const image = useImageResource(resources, entry.manga.thumbnailUrl);
  const pressTimer = useRef<number | null>(null);
  const pressStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const when = formatRelativeTimeShort(entry.lastReadAt);

  const cancelLongPress = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    pressStart.current = null;
  };

  return (
    <div
      className="reading-continue-card"
      onContextMenu={(event) => {
        event.preventDefault();
        onMenu(event.clientX, event.clientY);
      }}
      onPointerDown={(event) => {
        if (event.pointerType === 'mouse' || event.button !== 0) {
          return;
        }

        cancelLongPress();
        const { clientX, clientY } = event;
        pressStart.current = { x: clientX, y: clientY };
        pressTimer.current = window.setTimeout(() => {
          suppressClick.current = true;
          onMenu(clientX, clientY);
          pressTimer.current = null;
        }, 500);
      }}
      onPointerMove={(event) => {
        const start = pressStart.current;

        if (
          start &&
          (Math.abs(event.clientX - start.x) > 8 ||
            Math.abs(event.clientY - start.y) > 8)
        ) {
          cancelLongPress();
        }
      }}
      onPointerUp={cancelLongPress}
      onPointerCancel={cancelLongPress}
      onPointerLeave={cancelLongPress}
      onClickCapture={(event) => {
        if (suppressClick.current) {
          suppressClick.current = false;
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <Link
        className="reading-continue-card-link"
        to={`/manga/${entry.manga.id}/chapter/${entry.id}${
          entry.lastPageRead > 0 ? `?page=${entry.lastPageRead + 1}` : ''
        }`}
        state={{ origin }}
        aria-label={`${entry.manga.title}, ${entry.name}${when ? `, ${when}` : ''}`}
      >
        <span className={`reading-continue-cover${portrait ? ' is-portrait-fill' : ''}`} aria-hidden="true">
          {image.objectUrl ? (
            <img
              src={image.objectUrl}
              alt=""
              loading="lazy"
              decoding="async"
              onLoad={(event) =>
                setPortrait(
                  event.currentTarget.naturalHeight >
                    event.currentTarget.naturalWidth,
                )
              }
            />
          ) : (
            <span>{entry.manga.title.trim().charAt(0).toUpperCase() || '·'}</span>
          )}
          {when ? (
            <span className="reading-continue-time-badge">{when}</span>
          ) : null}
        </span>
        <strong className="reading-continue-title">{entry.manga.title}</strong>
        <span className="reading-continue-chapter">{entry.name}</span>
      </Link>
    </div>
  );
}

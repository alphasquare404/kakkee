import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { createReaderController } from '../../core/reader/readerController';
import { createReaderRepository } from '../../core/reader/readerRepository';
import { createTrackingSyncRepository } from '../../core/tracking/trackingSyncRepository';
import { getTrackingPreferences } from '../../core/preferences/trackingPreferences';
import type { ResourceService } from '../../core/resources/resourceService';
import { useConnection } from '../../app/useConnection';
import { useImageResource } from '../../shared/useImageResource';
import { useReaderSettings } from '../../shared/useReaderSettings';
import { useMangaReaderOverride } from '../../shared/useMangaReaderOverride';
import { buildReaderFilter } from '../../core/preferences/readerSettings';
import type { CSSProperties, MouseEvent, PointerEvent } from 'react';

export function ReaderPage() {
  const { state } = useConnection();
  const { mangaId, chapterId } = useParams();
  const manga = Number(mangaId);
  const chapter = Number(chapterId);

  if (state.status !== 'connected') {
    return <Navigate to="/" replace />;
  }

  if (
    !mangaId ||
    !chapterId ||
    !Number.isSafeInteger(manga) ||
    !Number.isSafeInteger(chapter) ||
    manga <= 0 ||
    chapter <= 0
  ) {
    return <Navigate to="/library" replace />;
  }

  return (
    <ConnectedReader
      context={state.context}
      mangaId={manga}
      chapterId={chapter}
    />
  );
}

function ConnectedReader({
  context,
  mangaId,
  chapterId,
}: {
  readonly context: ConnectedContext;
  readonly mangaId: number;
  readonly chapterId: number;
}) {
  const repository = useMemo(
    () => createReaderRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const controller = useMemo(
    () => createReaderController({ repository }),
    [repository],
  );
  const trackingSync = useMemo(
    () => createTrackingSyncRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const reader = useSyncExternalStore(controller.subscribe, controller.getState);
  const globalReaderSettings = useReaderSettings();
  const mangaOverride = useMangaReaderOverride(mangaId);
  const readerSettings = mangaOverride
    ? { ...globalReaderSettings, ...mangaOverride }
    : globalReaderSettings;
  const imageFilter = buildReaderFilter(readerSettings);
  const [searchParams] = useSearchParams();
  const loadedChapter = useRef<number | null>(null);
  const preloadedNext = useRef<number | null>(null);
  const loadingExtraChapter = useRef(false);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swipeHandled = useRef(false);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [autoScrolling, setAutoScrolling] = useState(false);
  const [autoWebtoon, setAutoWebtoon] = useState(false);
  const [appended, setAppended] = useState<
    readonly { id: number; name: string; pages: readonly string[] }[]
  >([]);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [nextDownloadQueued, setNextDownloadQueued] = useState(false);
  const [pageColors, setPageColors] = useState<Record<number, string>>({});
  const progressRef = useRef({ chapterId: 0, page: 1, total: 0 });
  const syncedChapter = useRef(0);
  const deletedAfterReading = useRef(0);

  useEffect(() => {
    if (loadedChapter.current !== chapterId) {
      loadedChapter.current = chapterId;
      setCurrentPage(1);
      setAutoWebtoon(false);
      setAppended([]);
      preloadedNext.current = null;
      setNextDownloadQueued(false);
      void controller.load(chapterId);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [chapterId, controller]);

  const chapter = reader.chapter;
  const activeChapter =
    chapter && chapter.id === chapterId ? chapter : null;
  const activeChapterIndex = reader.chapters.findIndex(
    (item) => item.id === chapterId,
  );
  const railChapters =
    activeChapterIndex >= 0
      ? reader.chapters.slice(
          Math.max(0, activeChapterIndex - 3),
          Math.min(reader.chapters.length, activeChapterIndex + 4),
        )
      : [];
  const explicitPage = searchParams.has('page')
    ? Number.parseInt(searchParams.get('page') ?? '1', 10)
    : null;
  const requestedPage = Math.max(
    1,
    explicitPage && explicitPage > 0
      ? explicitPage
      : (activeChapter?.lastPageRead ?? 0) + 1,
  );
  const readingMode = autoWebtoon ? 'webtoon' : readerSettings.mode;
  const isPaged = readingMode === 'single' || readingMode === 'double';
  const safeCurrentPage = Math.min(
    Math.max(1, currentPage),
    Math.max(1, reader.pages.length),
  );
  const pageIndices = isPaged
    ? readingMode === 'single'
      ? [safeCurrentPage - 1]
      : readerSettings.direction === 'rtl'
        ? [safeCurrentPage, safeCurrentPage - 1]
        : [safeCurrentPage - 1, safeCurrentPage]
    : reader.pages.map((_, index) => index);
  const noopVisible = useCallback(() => undefined, []);

  useEffect(() => {
    const next = reader.nextChapter;

    if (
      !next ||
      preloadedNext.current === next.id ||
      reader.pages.length === 0 ||
      safeCurrentPage < reader.pages.length - 2
    ) {
      return;
    }

    preloadedNext.current = next.id;
    void controller.preload(next.id).then((pages) => {
      for (const path of pages.slice(0, 3)) {
        void context.resources
          .loadImageResource(path)
          .then((resource) => resource.dispose())
          .catch(() => undefined);
      }
    });
  }, [
    context.resources,
    controller,
    reader.nextChapter,
    reader.pages.length,
    safeCurrentPage,
  ]);

  useEffect(() => {
    const next = reader.nextChapter;

    if (
      readerSettings.autoAdvance ||
      !next ||
      appended.length > 0 ||
      reader.pages.length === 0 ||
      safeCurrentPage < reader.pages.length
    ) {
      return;
    }

    let active = true;
    void controller.preload(next.id).then((pages) => {
      if (active && pages.length > 0) {
        setAppended([{ id: next.id, name: next.name, pages }]);
      }
    });

    return () => {
      active = false;
    };
  }, [
    appended.length,
    controller,
    reader.nextChapter,
    reader.pages.length,
    readerSettings.autoAdvance,
    safeCurrentPage,
  ]);

  useEffect(() => {
    if (appended.length === 0) {
      return;
    }

    const appendNext = () => {
      if (loadingExtraChapter.current) {
        return;
      }

      const nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 700;

      if (!nearBottom) {
        return;
      }

      const last = appended[appended.length - 1];

      if (!last) {
        return;
      }

      const index = reader.chapters.findIndex((item) => item.id === last.id);
      const next = index >= 0 ? reader.chapters[index + 1] : undefined;

      if (!next || appended.some((item) => item.id === next.id)) {
        return;
      }

      loadingExtraChapter.current = true;
      void controller
        .preload(next.id)
        .then((pages) => {
          if (pages.length > 0) {
            setAppended((current) =>
              current.some((item) => item.id === next.id)
                ? current
                : [...current, { id: next.id, name: next.name, pages }],
            );
          }
        })
        .finally(() => {
          loadingExtraChapter.current = false;
        });
    };

    window.addEventListener('scroll', appendNext, { passive: true });

    return () => window.removeEventListener('scroll', appendNext);
  }, [appended, controller, reader.chapters]);
  const uniqueChapters = readerSettings.skipDuplicates
    ? [
        ...new Map(
          reader.chapters.map((chapter) => [chapter.chapterNumber, chapter]),
        ).values(),
      ]
    : null;
  const currentChapterIndex =
    uniqueChapters?.findIndex((chapter) => chapter.id === chapterId) ?? -1;
  const previousChapter =
    uniqueChapters && currentChapterIndex >= 0
      ? uniqueChapters[currentChapterIndex + 1] ?? null
      : reader.previousChapter;
  const nextChapter =
    uniqueChapters && currentChapterIndex >= 0
      ? uniqueChapters[currentChapterIndex - 1] ?? null
      : reader.nextChapter;

  useEffect(() => {
    if (
      !readerSettings.deleteAfterReading ||
      !activeChapter?.isDownloaded ||
      reader.pages.length === 0 ||
      currentPage < reader.pages.length ||
      deletedAfterReading.current === activeChapter.id
    ) {
      return;
    }

    deletedAfterReading.current = activeChapter.id;
    void controller.deleteDownload(activeChapter.id).catch(() => undefined);
  }, [
    activeChapter,
    controller,
    currentPage,
    reader.pages.length,
    readerSettings.deleteAfterReading,
  ]);

  useEffect(() => {
    if (
      !readerSettings.autoAdvance ||
      !nextChapter ||
      reader.pages.length === 0 ||
      currentPage < reader.pages.length
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      navigate(`/manga/${mangaId}/chapter/${nextChapter.id}`);
    }, 1_200);

    return () => window.clearTimeout(timer);
  }, [
    currentPage,
    mangaId,
    navigate,
    nextChapter,
    reader.pages.length,
    readerSettings.autoAdvance,
  ]);

  useEffect(() => {
    if (!readerSettings.keepScreenOn) {
      return;
    }

    const wakeLock = (
      navigator as Navigator & {
        wakeLock?: {
          request(type: 'screen'): Promise<{ release(): Promise<void> }>;
        };
      }
    ).wakeLock;

    if (!wakeLock) {
      return;
    }

    let sentinel: { release(): Promise<void> } | null = null;
    let disposed = false;

    void wakeLock
      .request('screen')
      .then((lock) => {
        if (disposed) {
          void lock.release();
          return;
        }

        sentinel = lock;
      })
      .catch(() => {
        // Wake Lock is optional and may be denied by the platform.
      });

    return () => {
      disposed = true;
      void sentinel?.release().catch(() => undefined);
    };
  }, [readerSettings.keepScreenOn]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
      return;
    }

    void document.documentElement.requestFullscreen?.().catch(() => undefined);
  };

  const shareChapter = () => {
    if (!activeChapter || !navigator.share) {
      return;
    }

    void navigator
      .share({
        title: `${activeChapter.manga.title} — ${activeChapter.name}`,
        url: window.location.href,
      })
      .catch(() => undefined);
  };

  progressRef.current = {
    chapterId: activeChapter?.id ?? 0,
    page: currentPage,
    total: reader.pages.length,
  };
  const activeChapterId = activeChapter?.id ?? 0;

  useEffect(() => {
    if (
      !activeChapterId ||
      reader.pages.length === 0 ||
      requestedPage <= 1 ||
      requestedPage > reader.pages.length
    ) {
      return;
    }

    setCurrentPage(requestedPage);
    const timer = window.setTimeout(() => {
      document
        .getElementById(`page-${requestedPage}`)
        ?.scrollIntoView({ block: 'start' });
    }, 600);

    return () => window.clearTimeout(timer);
  }, [activeChapterId, reader.pages.length, requestedPage]);

  useEffect(() => {
    if (!activeChapterId || reader.pages.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      void controller
        .saveProgress(
          activeChapterId,
          currentPage - 1,
          currentPage >= reader.pages.length,
        )
        .then(() => {
          if (
            currentPage >= reader.pages.length &&
            getTrackingPreferences().autoSync &&
            syncedChapter.current !== activeChapterId
          ) {
            syncedChapter.current = activeChapterId;
            void trackingSync.sync(mangaId).catch(() => undefined);
          }
        })
        .catch(() => undefined);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [
    activeChapterId,
    controller,
    currentPage,
    mangaId,
    reader.pages.length,
    trackingSync,
  ]);

  useEffect(
    () => () => {
      const progress = progressRef.current;

      if (progress.chapterId > 0 && progress.total > 0) {
        void controller
          .saveProgress(
            progress.chapterId,
            progress.page - 1,
            progress.page >= progress.total,
          )
          .catch(() => undefined);
      }
    },
    [controller],
  );

  const handlePageVisible = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === readerSettings.backKey) {
        event.preventDefault();

        if (chaptersOpen) {
          setChaptersOpen(false);
          return;
        }

        navigate(`/manga/${mangaId}`);
        return;
      }

      const isPrevious = event.key === readerSettings.pagePrevKey;
      const isNext = event.key === readerSettings.pageNextKey;

      if (!isPrevious && !isNext) {
        return;
      }

      if (event.key === 'PageUp' || event.key === 'PageDown' || event.key === 'Backspace') {
        event.preventDefault();
      }

      if (isPaged && !event.shiftKey) {
        const step = readingMode === 'double' ? 2 : 1;
        const delta = isNext ? step : -step;

        setCurrentPage((page) =>
          Math.min(
            Math.max(1, page + delta),
            Math.max(1, reader.pages.length),
          ),
        );
        return;
      }

      if (isPrevious && previousChapter) {
        navigate(`/manga/${mangaId}/chapter/${previousChapter.id}`);
      }

      if (isNext && nextChapter) {
        navigate(`/manga/${mangaId}/chapter/${nextChapter.id}`);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    chaptersOpen,
    isPaged,
    mangaId,
    navigate,
    nextChapter,
    reader.pages.length,
    readerSettings.backKey,
    readerSettings.pageNextKey,
    readerSettings.pagePrevKey,
    previousChapter,
    readingMode,
  ]);

  useEffect(() => {
    if (!autoScrolling) {
      return;
    }

    const timer = window.setInterval(() => {
      window.scrollBy(0, readerSettings.autoScrollSpeed);
    }, 45);

    const stop = () => setAutoScrolling(false);
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
    };
  }, [autoScrolling, readerSettings.autoScrollSpeed]);

  const selectPageFromTap = (event: MouseEvent<HTMLElement>) => {
    if (swipeHandled.current) {
      swipeHandled.current = false;
      return;
    }

    if (!isPaged) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const offset = event.clientX - rect.left;

    if (offset < rect.width / 3) {
      setCurrentPage((page) =>
        Math.max(1, page - (readingMode === 'double' ? 2 : 1)),
      );
    } else if (offset > (rect.width * 2) / 3) {
      setCurrentPage((page) =>
        Math.min(
          Math.max(1, reader.pages.length),
          page + (readingMode === 'double' ? 2 : 1),
        ),
      );
    }
  };

  const beginSwipe = (event: PointerEvent<HTMLElement>) => {
    if (!isPaged || event.pointerType === 'mouse') {
      return;
    }

    swipeStart.current = { x: event.clientX, y: event.clientY };
    swipeHandled.current = false;
  };

  const endSwipe = (event: PointerEvent<HTMLElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;

    if (!start || !isPaged) {
      return;
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    swipeHandled.current = true;
    const step = readingMode === 'double' ? 2 : 1;
    setCurrentPage((page) =>
      Math.min(
        Math.max(1, reader.pages.length),
        Math.max(1, page + (deltaX < 0 ? step : -step)),
      ),
    );
  };

  return (
    <div
      className="app-shell reader-shell"
      style={
        {
          '--reader-width': `${readerSettings.widthRem}rem`,
          '--reader-gap': `${readerSettings.gapPx}px`,
          '--reader-bg':
            (readerSettings.autoBackground
              ? pageColors[safeCurrentPage]
              : undefined) ?? readerSettings.background,
          '--reader-first-offset': `${readerSettings.firstPageOffset}px`,
        } as CSSProperties
      }
    >
      <header className="reader-header">
        <Link className="reader-back" to={`/manga/${mangaId}`}>
          ← Manga
        </Link>

        <div className="reader-title">
          <p>{activeChapter?.manga.title ?? 'Reader'}</p>
          <h1>{activeChapter?.name ?? 'Loading chapter…'}</h1>
          {activeChapter && reader.pages.length > 0 ? (
            <span className="reader-page-total">
              {safeCurrentPage} / {reader.pages.length}
            </span>
          ) : null}
        </div>

        <nav className="reader-chapter-nav" aria-label="Chapter navigation">
          {previousChapter ? (
            <Link to={`/manga/${mangaId}/chapter/${previousChapter.id}`}>
              Previous
            </Link>
          ) : (
            <span aria-disabled="true">Previous</span>
          )}
          {nextChapter ? (
            <Link to={`/manga/${mangaId}/chapter/${nextChapter.id}`}>
              Next
            </Link>
          ) : (
            <span aria-disabled="true">Next</span>
          )}
          <button
            className="reader-quick-action"
            type="button"
            onClick={() => setChaptersOpen(true)}
          >
            Chapters
          </button>
          <button
            className="reader-quick-action"
            type="button"
            disabled={!activeChapter || downloadBusy}
            title={
              downloadError
                ? 'Download action failed'
                : activeChapter?.isDownloaded
                  ? 'Delete downloaded chapter'
                  : 'Download chapter'
            }
            onClick={() => {
              if (!activeChapter) {
                return;
              }

              setDownloadError(false);
              setDownloadBusy(true);
              const action = activeChapter.isDownloaded
                ? controller.deleteDownload(activeChapter.id)
                : controller.downloadChapter(activeChapter.id);
              void action
                .catch(() => setDownloadError(true))
                .finally(() => setDownloadBusy(false));
            }}
          >
            {downloadBusy
              ? 'Working…'
              : activeChapter?.isDownloaded
                ? 'Delete download'
                : 'Download'}
          </button>
          <button
            className={`reader-quick-action${activeChapter?.isBookmarked ? ' is-active' : ''}`}
            type="button"
            disabled={!activeChapter || downloadBusy}
            onClick={() => {
              if (!activeChapter) {
                return;
              }

              setDownloadBusy(true);
              void controller
                .setBookmark(!activeChapter.isBookmarked)
                .catch(() => setDownloadError(true))
                .finally(() => setDownloadBusy(false));
            }}
          >
            {activeChapter?.isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
          <button
            className={`reader-quick-action${activeChapter?.manga.inLibrary ? ' is-active' : ''}`}
            type="button"
            disabled={!activeChapter || downloadBusy}
            onClick={() => {
              if (!activeChapter) {
                return;
              }

              setDownloadBusy(true);
              void controller
                .setInLibrary(!activeChapter.manga.inLibrary)
                .catch(() => setDownloadError(true))
                .finally(() => setDownloadBusy(false));
            }}
          >
            {activeChapter?.manga.inLibrary ? 'In library' : 'Add to library'}
          </button>
          {nextChapter ? (
            <button
              className="reader-quick-action"
              type="button"
              disabled={downloadBusy || nextDownloadQueued}
              onClick={() => {
                setDownloadError(false);
                setDownloadBusy(true);
                void controller
                  .downloadChapter(nextChapter.id)
                  .then(() => setNextDownloadQueued(true))
                  .catch(() => setDownloadError(true))
                  .finally(() => setDownloadBusy(false));
              }}
            >
              {nextDownloadQueued ? 'Next queued' : 'Download next'}
            </button>
          ) : null}
          <button
            className="reader-quick-action"
            type="button"
            onClick={toggleFullscreen}
          >
            Fullscreen
          </button>
          <button
            className={`reader-quick-action${autoScrolling ? ' is-active' : ''}`}
            type="button"
            aria-pressed={autoScrolling}
            onClick={() => setAutoScrolling((value) => !value)}
          >
            Auto-scroll
          </button>
          {typeof navigator.share === 'function' ? (
            <button
              className="reader-quick-action"
              type="button"
              onClick={shareChapter}
            >
              Share
            </button>
          ) : null}
        </nav>

        {isPaged && activeChapter && reader.pages.length > 0 ? (
          <nav className="reader-page-nav" aria-label="Page navigation">
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() =>
                setCurrentPage(
                  Math.max(1, safeCurrentPage - (readingMode === 'double' ? 2 : 1)),
                )
              }
            >
              Previous page
            </button>
            <span>
              Page {safeCurrentPage} of {reader.pages.length}
            </span>
            <button
              type="button"
              disabled={
                safeCurrentPage >=
                reader.pages.length - (readingMode === 'double' ? 1 : 0)
              }
              onClick={() =>
                setCurrentPage(
                  Math.min(
                    reader.pages.length,
                    safeCurrentPage + (readingMode === 'double' ? 2 : 1),
                  ),
                )
              }
            >
              Next page
            </button>
          </nav>
        ) : null}
      </header>

      {railChapters.length > 1 ? (
        <aside className="reader-rail" aria-labelledby="reader-rail-heading">
          <h2 id="reader-rail-heading">Chapters</h2>
          <ol>
            {railChapters.map((item) => (
              <li key={item.id}>
                <Link
                  className={item.id === chapterId ? 'is-active' : undefined}
                  to={`/manga/${mangaId}/chapter/${item.id}`}
                  aria-current={item.id === chapterId ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ol>
        </aside>
      ) : null}

      {!activeChapter && !reader.error ? (
        <p className="reader-status" role="status">
          Loading chapter…
        </p>
      ) : null}

      {reader.error ? (
        <div className="library-state reader-state" role="alert">
          <h2>Couldn&apos;t load chapter</h2>
          <p>The chapter request failed. Try again.</p>
          <div className="actions">
            <button
              className="button"
              type="button"
              onClick={() => void controller.load(chapterId)}
            >
              Retry
            </button>
            <Link className="button button-secondary" to={`/manga/${mangaId}`}>
              Back to manga
            </Link>
          </div>
        </div>
      ) : null}

      {activeChapter && reader.isLoadingPages ? (
        <div className="reader-pages" aria-busy="true" aria-label="Loading pages">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="reader-page reader-page-skeleton" key={index} />
          ))}
          <p className="reader-status" role="status">
            Loading pages…
          </p>
        </div>
      ) : null}

      {activeChapter && reader.pagesError ? (
        <div className="library-state reader-state" role="alert">
          <h2>Couldn&apos;t load pages</h2>
          <p>Chapter metadata loaded, but the page request failed.</p>
          <button
            className="button"
            type="button"
            onClick={() => void controller.retryPages()}
            disabled={reader.isLoadingPages}
          >
            Retry pages
          </button>
        </div>
      ) : null}

      {activeChapter && reader.pages.length > 0 ? (
        <main
          className={`reader-pages mode-${readingMode} scale-${readerSettings.scale}${
            readerSettings.stretchSmallPages ? ' stretch-small' : ''
          }${readerSettings.direction === 'rtl' ? ' is-rtl' : ''}`}
          aria-label={`${activeChapter.name} pages`}
          onClick={selectPageFromTap}
          onPointerDown={beginSwipe}
          onPointerUp={endSwipe}
          onPointerCancel={() => {
            swipeStart.current = null;
          }}
        >
          {pageIndices.map((index) => {
            const path = reader.pages[index];

            return path ? (
              <ReaderPageImage
                key={path}
                resources={context.resources}
                path={path}
                pageNumber={index + 1}
                eager={isPaged || Math.abs(index + 1 - safeCurrentPage) <= 1}
                filter={imageFilter}
                onVisible={isPaged ? noopVisible : handlePageVisible}
                onDimensions={(page, width, height) => {
                  if (
                    readerSettings.autoDetectWebtoon &&
                    page === 1 &&
                    width > 0 &&
                    height / width > 2.2
                  ) {
                    setAutoWebtoon(true);
                  }
                }}
                onColor={(page, color) =>
                  setPageColors((current) =>
                    current[page] === color
                      ? current
                      : { ...current, [page]: color },
                  )
                }
              />
            ) : null;
          })}
          {appended.map((extra) => (
            <section className="reader-appended" key={extra.id}>
              <div className="reader-appended-heading">
                <p>Next chapter</p>
                <h2>{extra.name}</h2>
                <Link to={`/manga/${mangaId}/chapter/${extra.id}`}>
                  Open chapter
                </Link>
              </div>
              {extra.pages.map((path, index) => (
                <ReaderPageImage
                  key={path}
                  resources={context.resources}
                  path={path}
                  pageNumber={extra.id * 1000 + index + 1}
                  eager={false}
                  filter={imageFilter}
                  onVisible={noopVisible}
                />
              ))}
            </section>
          ))}
        </main>
      ) : null}

      {activeChapter &&
      !reader.isLoadingPages &&
      !reader.pagesError &&
      reader.pages.length === 0 ? (
        <div className="library-state reader-state">
          <h2>No pages</h2>
          <p>This chapter returned no readable pages.</p>
        </div>
      ) : null}

      {activeChapter ? (
        <footer className="reader-footer">
          <nav className="reader-chapter-nav" aria-label="Chapter navigation">
            {previousChapter ? (
              <Link to={`/manga/${mangaId}/chapter/${previousChapter.id}`}>
                Previous: {previousChapter.name}
              </Link>
            ) : (
              <span aria-disabled="true">Previous</span>
            )}
            <span>{activeChapter.pageCount} pages</span>
            {nextChapter ? (
              <Link to={`/manga/${mangaId}/chapter/${nextChapter.id}`}>
                Next: {nextChapter.name}
              </Link>
            ) : (
              <span aria-disabled="true">Next</span>
            )}
          </nav>
        </footer>
      ) : null}

      {chaptersOpen && activeChapter ? (
        <div
          className="reader-chapter-overlay"
          role="presentation"
          onClick={() => setChaptersOpen(false)}
        >
          <section
            className="reader-chapter-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Chapter list"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <h2>Chapters</h2>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setChaptersOpen(false)}
              >
                Close
              </button>
            </header>
            <ol>
              {(uniqueChapters ?? reader.chapters).map((chapter) => (
                <li key={chapter.id}>
                  <Link
                    className={chapter.id === activeChapter.id ? 'is-current' : undefined}
                    to={`/manga/${mangaId}/chapter/${chapter.id}`}
                    onClick={() => setChaptersOpen(false)}
                  >
                    <span>{chapter.name}</span>
                    {chapter.isRead ? <small>Read</small> : null}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function ReaderPageImage({
  resources,
  path,
  pageNumber,
  eager = false,
  filter = 'none',
  onVisible,
  onColor,
  onDimensions,
}: {
  readonly resources: ResourceService;
  readonly path: string;
  readonly pageNumber: number;
  readonly eager?: boolean;
  readonly filter?: string;
  readonly onVisible: (pageNumber: number) => void;
  readonly onColor?: (pageNumber: number, color: string) => void;
  readonly onDimensions?: (
    pageNumber: number,
    width: number,
    height: number,
  ) => void;
}) {
  const figure = useRef<HTMLElement>(null);
  const [nearViewport, setNearViewport] = useState(pageNumber <= 2 || eager);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      onVisible(pageNumber);
      return;
    }

    const element = figure.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onVisible(pageNumber);
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [onVisible, pageNumber]);

  useEffect(() => {
    if (nearViewport) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setNearViewport(true);
      return;
    }

    const element = figure.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '1200px 0px' },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [nearViewport]);

  const image = useImageResource(resources, nearViewport ? path : null);

  return (
    <figure className="reader-page" id={`page-${pageNumber}`} ref={figure}>
      {image.objectUrl ? (
        <img
          src={image.objectUrl}
          alt={`Page ${pageNumber}`}
          loading="lazy"
          decoding="async"
          style={{ filter }}
          onLoad={(event) => {
            onDimensions?.(
              pageNumber,
              event.currentTarget.naturalWidth,
              event.currentTarget.naturalHeight,
            );

            if (!onColor) {
              return;
            }

            try {
              const canvas = document.createElement('canvas');
              canvas.width = 1;
              canvas.height = 1;
              const context = canvas.getContext('2d', {
                willReadFrequently: true,
              });

              if (!context) {
                return;
              }

              context.drawImage(event.currentTarget, 0, 0, 1, 1);
              const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
              onColor(pageNumber, `rgb(${red} ${green} ${blue})`);
            } catch {
              // Canvas sampling is best-effort.
            }
          }}
        />
      ) : image.status === 'error' ? (
        <div className="reader-page-error" role="group" aria-label={`Page ${pageNumber}`}>
          <p>Page {pageNumber} couldn&apos;t be loaded.</p>
          <button className="button button-secondary" type="button" onClick={image.retry}>
            Retry page
          </button>
        </div>
      ) : (
        <div
          className="reader-page-loading"
          role={nearViewport ? 'status' : undefined}
          aria-hidden={nearViewport ? undefined : true}
        >
          {nearViewport ? `Page ${pageNumber}` : null}
        </div>
      )}
    </figure>
  );
}

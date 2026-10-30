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
import type { ResourceService } from '../../core/resources/resourceService';
import { useConnection } from '../../app/useConnection';
import { useImageResource } from '../../shared/useImageResource';
import { useReaderSettings } from '../../shared/useReaderSettings';
import { READER_FILTER_CSS } from '../../core/preferences/readerSettings';
import type { CSSProperties, MouseEvent } from 'react';

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
  const reader = useSyncExternalStore(controller.subscribe, controller.getState);
  const readerSettings = useReaderSettings();
  const imageFilter = READER_FILTER_CSS[readerSettings.filter];
  const [searchParams] = useSearchParams();
  const loadedChapter = useRef<number | null>(null);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [autoScrolling, setAutoScrolling] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const progressRef = useRef({ chapterId: 0, page: 1, total: 0 });

  useEffect(() => {
    if (loadedChapter.current !== chapterId) {
      loadedChapter.current = chapterId;
      setCurrentPage(1);
      void controller.load(chapterId);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [chapterId, controller]);

  const chapter = reader.chapter;
  const activeChapter =
    chapter && chapter.id === chapterId ? chapter : null;
  const explicitPage = searchParams.has('page')
    ? Number.parseInt(searchParams.get('page') ?? '1', 10)
    : null;
  const requestedPage = Math.max(
    1,
    explicitPage && explicitPage > 0
      ? explicitPage
      : (activeChapter?.lastPageRead ?? 0) + 1,
  );
  const readingMode = readerSettings.mode;
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
        .catch(() => undefined);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [activeChapterId, controller, currentPage, reader.pages.length]);

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

      if (event.key === 'Escape') {
        if (chaptersOpen) {
          setChaptersOpen(false);
          return;
        }

        navigate(`/manga/${mangaId}`);
        return;
      }

      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }

      if (isPaged && !event.shiftKey) {
        const step = readingMode === 'double' ? 2 : 1;
        const delta = event.key === 'ArrowRight' ? step : -step;

        setCurrentPage((page) =>
          Math.min(
            Math.max(1, page + delta),
            Math.max(1, reader.pages.length),
          ),
        );
        return;
      }

      if (event.key === 'ArrowLeft' && reader.previousChapter) {
        navigate(`/manga/${mangaId}/chapter/${reader.previousChapter.id}`);
      }

      if (event.key === 'ArrowRight' && reader.nextChapter) {
        navigate(`/manga/${mangaId}/chapter/${reader.nextChapter.id}`);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    chaptersOpen,
    isPaged,
    mangaId,
    navigate,
    reader.nextChapter,
    reader.pages.length,
    reader.previousChapter,
    readingMode,
  ]);

  useEffect(() => {
    if (!autoScrolling) {
      return;
    }

    const timer = window.setInterval(() => {
      window.scrollBy(0, 1);
    }, 45);

    const stop = () => setAutoScrolling(false);
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchstart', stop, { passive: true });

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
    };
  }, [autoScrolling]);

  const selectPageFromTap = (event: MouseEvent<HTMLElement>) => {
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

  return (
    <div
      className="app-shell reader-shell"
      style={
        {
          '--reader-width': `${readerSettings.widthRem}rem`,
          '--reader-gap': `${readerSettings.gapPx}px`,
          '--reader-bg': readerSettings.background,
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
          {reader.previousChapter ? (
            <Link to={`/manga/${mangaId}/chapter/${reader.previousChapter.id}`}>
              Previous
            </Link>
          ) : (
            <span aria-disabled="true">Previous</span>
          )}
          {reader.nextChapter ? (
            <Link to={`/manga/${mangaId}/chapter/${reader.nextChapter.id}`}>
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
            readerSettings.direction === 'rtl' ? ' is-rtl' : ''
          }`}
          aria-label={`${activeChapter.name} pages`}
          onClick={selectPageFromTap}
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
              />
            ) : null;
          })}
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
            {reader.previousChapter ? (
              <Link to={`/manga/${mangaId}/chapter/${reader.previousChapter.id}`}>
                Previous: {reader.previousChapter.name}
              </Link>
            ) : (
              <span aria-disabled="true">Previous</span>
            )}
            <span>{activeChapter.pageCount} pages</span>
            {reader.nextChapter ? (
              <Link to={`/manga/${mangaId}/chapter/${reader.nextChapter.id}`}>
                Next: {reader.nextChapter.name}
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
              {reader.chapters.map((chapter) => (
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
}: {
  readonly resources: ResourceService;
  readonly path: string;
  readonly pageNumber: number;
  readonly eager?: boolean;
  readonly filter?: string;
  readonly onVisible: (pageNumber: number) => void;
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

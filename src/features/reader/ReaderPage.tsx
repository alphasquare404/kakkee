import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { createReaderController } from '../../core/reader/readerController';
import { createReaderRepository } from '../../core/reader/readerRepository';
import type { ResourceService } from '../../core/resources/resourceService';
import { useConnection } from '../../app/useConnection';
import { useImageResource } from '../../shared/useImageResource';

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
  const loadedChapter = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loadedChapter.current !== chapterId) {
      loadedChapter.current = chapterId;
      void controller.load(chapterId);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [chapterId, controller]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === 'Escape') {
        navigate(`/manga/${mangaId}`);
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
  }, [mangaId, navigate, reader.nextChapter, reader.previousChapter]);

  const chapter = reader.chapter;
  const activeChapter =
    chapter && chapter.id === chapterId ? chapter : null;

  return (
    <div className="app-shell reader-shell">
      <header className="reader-header">
        <Link className="reader-back" to={`/manga/${mangaId}`}>
          ← Manga
        </Link>

        <div className="reader-title">
          <p>{activeChapter?.manga.title ?? 'Reader'}</p>
          <h1>{activeChapter?.name ?? 'Loading chapter…'}</h1>
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
        </nav>
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
        <main className="reader-pages" aria-label={`${activeChapter.name} pages`}>
          {reader.pages.map((path, index) => (
            <ReaderPageImage
              key={path}
              resources={context.resources}
              path={path}
              pageNumber={index + 1}
            />
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
    </div>
  );
}

function ReaderPageImage({
  resources,
  path,
  pageNumber,
}: {
  readonly resources: ResourceService;
  readonly path: string;
  readonly pageNumber: number;
}) {
  const figure = useRef<HTMLElement>(null);
  const [nearViewport, setNearViewport] = useState(pageNumber <= 2);

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

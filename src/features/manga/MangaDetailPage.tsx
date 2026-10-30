import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  createMangaDetailController,
  type MangaDetailController,
} from '../../core/manga/mangaDetailController';
import {
  createMangaRepository,
  type MangaChapterOrder,
} from '../../core/manga/mangaRepository';
import { useConnection } from '../../app/useConnection';
import { useImageResource } from '../../shared/useImageResource';
import { AmbientArt } from '../../shared/AmbientArt';

const STATUS_LABEL: Record<string, string> = {
  UNKNOWN: 'Unknown',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  LICENSED: 'Licensed',
  PUBLISHING_FINISHED: 'Publishing finished',
  CANCELLED: 'Cancelled',
  ON_HIATUS: 'On hiatus',
};

function formatDate(value: string): string | null {
  const date = new Date(Number(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date);
}

function chapterMeta(chapter: {
  readonly lastPageRead: number;
  readonly pageCount: number;
  readonly isRead: boolean;
}): string {
  if (!chapter.isRead && chapter.lastPageRead > 0) {
    return `Page ${chapter.lastPageRead} of ${chapter.pageCount}`;
  }

  return `${chapter.pageCount} pages`;
}

export function MangaDetailPage() {
  const { state } = useConnection();
  const { mangaId } = useParams();
  const id = Number(mangaId);

  if (state.status !== 'connected') {
    return <Navigate to="/" replace />;
  }

  if (!mangaId || !Number.isSafeInteger(id) || id <= 0) {
    return <Navigate to="/library" replace />;
  }

  return <ConnectedMangaDetail context={state.context} mangaId={id} />;
}

function ConnectedMangaDetail({
  context,
  mangaId,
}: {
  readonly context: ConnectedContext;
  readonly mangaId: number;
}) {
  const repository = useMemo(
    () => createMangaRepository({ getClient: () => context.graphQL }),
    [context.graphQL],
  );
  const controller = useMemo(
    () => createMangaDetailController({ repository, mangaId }),
    [mangaId, repository],
  );
  const detail = useSyncExternalStore(controller.subscribe, controller.getState);
  const loaded = useRef<MangaDetailController | null>(null);
  const [section, setSection] = useState<'overview' | 'chapters'>('overview');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const cover = useImageResource(
    context.resources,
    detail.manga?.thumbnailUrl ?? null,
  );

  useEffect(() => {
    if (loaded.current !== controller) {
      loaded.current = controller;
      void controller.load();
    }
  }, [controller]);

  if (!detail.manga && !detail.error) {
    return (
      <div className="app-shell detail-shell">
        <div className="detail-loading" role="status">
          Loading manga…
        </div>
      </div>
    );
  }

  if (detail.error || !detail.manga) {
    return (
      <div className="app-shell detail-shell">
        <div className="library-state" role="alert">
          <h1>Couldn&apos;t load manga</h1>
          <p>The manga request failed. Try again.</p>
          <div className="actions">
            <button className="button" type="button" onClick={() => void controller.load()}>
              Retry
            </button>
            <Link className="button button-secondary" to="/library">
              Back to library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const manga = detail.manga;
  const firstChapter = detail.chapters[0] ?? null;
  const inProgressChapter =
    detail.chapters.find(
      (chapter) => !chapter.isRead && chapter.lastPageRead > 0,
    ) ?? null;
  const primaryChapter = inProgressChapter ?? firstChapter;
  const meta = [
    STATUS_LABEL[manga.status] ?? manga.status,
    manga.author ? `Author: ${manga.author}` : null,
    manga.artist ? `Artist: ${manga.artist}` : null,
    manga.source?.name ?? null,
  ].filter(Boolean);

  return (
    <div className="app-shell detail-shell">
      <AmbientArt imageUrl={cover.objectUrl} className="detail-ambient" />
      <nav className="page-nav" aria-label="Breadcrumb">
        <Link to="/library">Library</Link>
        <span aria-hidden="true">/</span>
        <span>{manga.title}</span>
      </nav>

      <main className="manga-detail">
        <header className="manga-hero" id="overview">
          <div className="manga-hero-cover">
            {cover.objectUrl ? (
              <img src={cover.objectUrl} alt="" decoding="async" />
            ) : (
              <span className="manga-hero-placeholder" aria-hidden="true">
                {manga.title.trim().charAt(0).toUpperCase() || '·'}
              </span>
            )}
          </div>

          <div className="manga-hero-body">
            <h1>{manga.title}</h1>
            <p className="manga-meta">{meta.join(' · ')}</p>

            {manga.genre.length > 0 ? (
              <ul className="manga-genres" aria-label="Genres">
                {manga.genre.map((genre) => (
                  <li key={genre}>{genre}</li>
                ))}
              </ul>
            ) : null}

            <div className="manga-actions">
              {primaryChapter ? (
                <Link
                  className="button detail-primary"
                  to={`/manga/${manga.id}/chapter/${primaryChapter.id}`}
                >
                  {inProgressChapter
                    ? 'Continue reading'
                    : detail.order === 'oldest'
                      ? 'Read first chapter'
                      : 'Read latest chapter'}
                </Link>
              ) : null}
              <Link className="button button-secondary" to="/library">
                Back to library
              </Link>
            </div>

            {manga.description ? (
              <>
                <p
                  className={`manga-description${
                    !descriptionExpanded && manga.description.length > 240
                      ? ' is-clamped'
                      : ''
                  }`}
                >
                  {manga.description}
                </p>
                {manga.description.length > 240 ? (
                  <button
                    className="description-toggle"
                    type="button"
                    aria-expanded={descriptionExpanded}
                    onClick={() => setDescriptionExpanded((value) => !value)}
                  >
                    {descriptionExpanded ? 'Show less' : 'Show more'}
                  </button>
                ) : null}
              </>
            ) : (
              <p className="manga-description manga-description-empty">
                No description.
              </p>
            )}
          </div>
        </header>

        <nav className="detail-tabs" aria-label="Manga sections">
          <button
            className={section === 'overview' ? 'is-active' : undefined}
            type="button"
            aria-current={section === 'overview' ? 'true' : undefined}
            onClick={() => {
              setSection('overview');
              document.getElementById('overview')?.scrollIntoView({ block: 'start' });
            }}
          >
            Overview
          </button>
          <button
            className={section === 'chapters' ? 'is-active' : undefined}
            type="button"
            aria-current={section === 'chapters' ? 'true' : undefined}
            onClick={() => {
              setSection('chapters');
              document.getElementById('chapters')?.scrollIntoView({ block: 'start' });
            }}
          >
            Chapters
          </button>
        </nav>

        <section className="chapter-section" id="chapters" aria-labelledby="chapters-heading">
          <div className="chapter-section-header">
            <div>
              <h2 id="chapters-heading">Chapters</h2>
              <p className="chapter-section-count">
                {detail.totalCount.toLocaleString('en-US')} chapters
              </p>
            </div>

            <label className="chapter-order">
              <span>Order</span>
              <select
                aria-label="Chapter order"
                value={detail.order}
                onChange={(event) =>
                  void controller.setOrder(event.target.value as MangaChapterOrder)
                }
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>

          {detail.chapters.length === 0 ? (
            <p className="chapter-empty">No chapters available.</p>
          ) : (
            <ol className="chapter-list">
              {detail.chapters.map((chapter) => {
                const uploaded = formatDate(chapter.uploadDate);

                return (
                  <li key={chapter.id}>
                    <Link
                      className="chapter-row"
                      to={`/manga/${manga.id}/chapter/${chapter.id}`}
                    >
                      <span className="chapter-play" aria-hidden="true">
                        ▶
                      </span>
                      <span className="chapter-row-main">
                        <span className="chapter-name">{chapter.name}</span>
                        <span className="chapter-meta">
                          {[
                            chapter.scanlator,
                            uploaded,
                            chapterMeta(chapter),
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                      <span
                        className={`chapter-state${chapter.isRead ? ' is-read' : ''}`}
                      >
                        {chapter.isRead ? 'Read' : 'Unread'}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}

          {detail.loadMoreError ? (
            <p className="alert alert-error" role="alert">
              Couldn&apos;t load more chapters.
            </p>
          ) : null}

          {detail.pageInfo.hasNextPage ? (
            <div className="chapter-load-more">
              <button
                className="button button-secondary"
                type="button"
                disabled={detail.isLoadingMore}
                onClick={() => void controller.loadMore()}
              >
                {detail.isLoadingMore ? 'Loading…' : 'Load more chapters'}
              </button>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

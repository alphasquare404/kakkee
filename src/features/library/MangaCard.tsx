import { useRef } from 'react';
import { Link } from 'react-router-dom';
import type { LibraryManga } from '../../core/library/libraryRepository';
import type { ResourceService } from '../../core/resources/resourceService';
import { useAppPath } from '../../app/useAppPath';
import { useImageResource } from '../../shared/useImageResource';

export interface MangaCardProps {
  readonly manga: LibraryManga;
  readonly resources: ResourceService;
  readonly selectable?: boolean;
  readonly selected?: boolean;
  readonly onToggle?: (shiftKey: boolean) => void;
  readonly onLongPress?: () => void;
  readonly showBadges?: boolean;
  readonly showProgress?: boolean;
}

export function MangaCard({
  manga,
  resources,
  selectable = false,
  selected = false,
  onToggle,
  onLongPress,
  showBadges = true,
  showProgress = true,
}: MangaCardProps) {
  const thumbnail = useImageResource(resources, manga.thumbnailUrl);
  const { from } = useAppPath();
  const cardState = { from };
  const progress = manga.lastReadChapter;
  const progressLabel = progress
    ? `${progress.name}${
        progress.lastPageRead > 0
          ? ` — page ${Math.min(progress.pageCount, progress.lastPageRead + 1)}`
          : ''
      }`
    : null;
  const longPressTimer = useRef<number | null>(null);
  const longPressTriggered = useRef(false);

  const clearLongPress = () => {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const startLongPress = () => {
    if (!onLongPress || selectable) {
      return;
    }

    clearLongPress();
    longPressTriggered.current = false;
    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true;
      onLongPress();
    }, 500);
  };

  const content = (
    <article className="manga-card">
      <div className="manga-card-cover">
        {thumbnail.objectUrl ? (
          <img
            className="manga-card-image"
            src={thumbnail.objectUrl}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="manga-card-initial" aria-hidden="true">
            {manga.title.trim().charAt(0).toUpperCase() || '·'}
          </span>
        )}
        {selectable ? (
          <span className="manga-card-select" aria-hidden="true">
            {selected ? '✓' : ''}
          </span>
        ) : null}
        {progress && showProgress ? (
          <span
            className="manga-card-progress"
            title={`Continue reading ${progressLabel}`}
          >
            Continue {progress.chapterNumber ? `Ch. ${progress.chapterNumber}` : ''}
            {progress.lastPageRead > 0 ? ` · p${progress.lastPageRead + 1}` : ''}
          </span>
        ) : null}
        {showBadges && (manga.unreadCount > 0 || manga.downloadCount > 0) ? (
          <div className="manga-card-badges">
            {manga.unreadCount > 0 ? (
              <span
                className="manga-card-badge is-unread"
                title={`${manga.unreadCount} unread chapters`}
              >
                {manga.unreadCount > 99 ? '99+' : manga.unreadCount}
                <span className="sr-only"> unread chapters</span>
              </span>
            ) : null}
            {manga.downloadCount > 0 ? (
              <span
                className="manga-card-badge is-downloaded"
                title={`${manga.downloadCount} downloaded chapters`}
              >
                ↓{manga.downloadCount > 99 ? '99+' : manga.downloadCount}
                <span className="sr-only"> downloaded chapters</span>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      <h2 className="manga-card-title" title={manga.title}>
        {manga.title}
      </h2>
    </article>
  );

  if (selectable) {
    return (
      <button
        className={`manga-card-link${selected ? ' is-selected' : ''}`}
        type="button"
        aria-pressed={selected}
        aria-label={`${manga.title}, ${selected ? 'selected' : 'not selected'}`}
        onClick={(event) => onToggle?.(event.shiftKey)}
      >
        {content}
      </button>
    );
  }

  const card = (
    <Link
      className="manga-card-link"
      to={`/manga/${manga.id}`}
      state={cardState}
      aria-label={`${manga.title}, manga details`}
      title={progressLabel ? `Continue reading ${progressLabel}` : undefined}
      onPointerDown={startLongPress}
      onPointerUp={clearLongPress}
      onPointerCancel={clearLongPress}
      onPointerLeave={clearLongPress}
      onClick={(event) => {
        clearLongPress();

        if (longPressTriggered.current) {
          event.preventDefault();
          longPressTriggered.current = false;
        }
      }}
    >
      {content}
    </Link>
  );

  if (!progress || !showProgress) {
    return card;
  }

  return (
    <div className="manga-card-frame">
      {card}
      <Link
        className="manga-card-continue"
        to={`/manga/${manga.id}/chapter/${progress.id}${
          progress.lastPageRead > 0 ? `?page=${progress.lastPageRead + 1}` : ''
        }`}
        aria-label={`Continue reading ${progressLabel}`}
      >
        Continue reading
      </Link>
    </div>
  );
}

export function MangaCardSkeleton() {
  return (
    <div className="manga-card manga-card-skeleton" aria-hidden="true">
      <div className="manga-card-cover" />
      <div className="skeleton-line" />
      <div className="skeleton-line skeleton-line-short" />
    </div>
  );
}

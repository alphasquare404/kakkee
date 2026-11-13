import {
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { Link } from 'react-router-dom';
import type { LibraryManga } from '../../core/library/libraryRepository';
import type { ResourceService } from '../../core/resources/resourceService';
import { useAppPath } from '../../app/useAppPath';
import { createSectionOrigin } from '../../app/navigationOrigin';
import { useImageResource } from '../../shared/useImageResource';

export interface MangaCardMenuPosition {
  readonly x: number;
  readonly y: number;
}

export interface MangaCardProps {
  readonly manga: LibraryManga;
  readonly resources: ResourceService;
  readonly selectable?: boolean;
  readonly selected?: boolean;
  readonly onToggle?: (shiftKey: boolean) => void;
  readonly onContextMenu?: (
    position: MangaCardMenuPosition,
    trigger: HTMLElement,
  ) => void;
  readonly showBadges?: boolean;
}

export function MangaCard({
  manga,
  resources,
  selectable = false,
  selected = false,
  onToggle,
  onContextMenu,
  showBadges = true,
}: MangaCardProps) {
  const thumbnail = useImageResource(resources, manga.thumbnailUrl);
  const [portrait, setPortrait] = useState(false);
  const { pathname, search } = useAppPath();
  const origin = createSectionOrigin('library', { pathname, search });
  const progress = manga.lastReadChapter;
  const progressLabel = progress
    ? `${progress.name}${
        progress.lastPageRead > 0
          ? ` — page ${Math.min(progress.pageCount, progress.lastPageRead + 1)}`
          : ''
      }`
    : null;
  const longPressTimer = useRef<number | null>(null);
  const longPressPoint = useRef<{ x: number; y: number } | null>(null);
  const longPressTriggered = useRef(false);
  const badgeTitle = [
    manga.unreadCount > 0 ? `${manga.unreadCount} unread chapters` : null,
    manga.downloadCount > 0
      ? `${manga.downloadCount} downloaded chapters`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const clearLongPress = () => {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    longPressPoint.current = null;
  };

  const openContextMenu = (
    x: number,
    y: number,
    trigger: HTMLElement,
  ) => {
    clearLongPress();
    onContextMenu?.({ x, y }, trigger);
  };

  const startLongPress = (event: PointerEvent<HTMLElement>) => {
    if (!onContextMenu || event.pointerType === 'mouse') {
      return;
    }

    clearLongPress();
    longPressTriggered.current = false;
    longPressPoint.current = { x: event.clientX, y: event.clientY };
    const trigger = event.currentTarget;
    longPressTimer.current = window.setTimeout(() => {
      longPressTimer.current = null;
      longPressTriggered.current = true;
      openContextMenu(event.clientX, event.clientY, trigger);
      window.setTimeout(() => {
        longPressTriggered.current = false;
      }, 900);
    }, 500);
  };

  const moveLongPress = (event: PointerEvent<HTMLElement>) => {
    const origin = longPressPoint.current;

    if (
      !origin ||
      Math.abs(event.clientX - origin.x) > 10 ||
      Math.abs(event.clientY - origin.y) > 10
    ) {
      clearLongPress();
    }
  };

  const handleContextMenu = (event: MouseEvent<HTMLElement>) => {
    if (!onContextMenu) {
      return;
    }

    event.preventDefault();
    openContextMenu(event.clientX, event.clientY, event.currentTarget);
  };

  const handleContextKey = (event: KeyboardEvent<HTMLElement>) => {
    if (
      !onContextMenu ||
      (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10'))
    ) {
      return;
    }

    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    openContextMenu(rect.left + 24, rect.top + 24, event.currentTarget);
  };

  const content = (
    <article className="manga-card">
      <div className={`manga-card-cover${portrait ? ' is-portrait-fill' : ''}`}>
        {thumbnail.objectUrl ? (
          <img
            className="manga-card-image"
            src={thumbnail.objectUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={(event) =>
              setPortrait(
                event.currentTarget.naturalHeight > event.currentTarget.naturalWidth,
              )
            }
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
        {showBadges && (manga.unreadCount > 0 || manga.downloadCount > 0) ? (
          <div className="manga-card-badges">
            <span className="manga-card-badge is-combined" title={badgeTitle}>
              <span aria-hidden="true">
                {manga.unreadCount > 0
                  ? manga.unreadCount > 99
                    ? '99+'
                    : manga.unreadCount
                  : null}
                {manga.unreadCount > 0 && manga.downloadCount > 0 ? (
                  <span className="manga-card-badge-separator"> · </span>
                ) : null}
                {manga.downloadCount > 0 ? (
                  <span className="manga-card-badge-download">
                    ↓
                    {manga.downloadCount > 99
                      ? '99+'
                      : manga.downloadCount}
                  </span>
                ) : null}
              </span>
              <span className="sr-only">{badgeTitle}</span>
            </span>
          </div>
        ) : null}
      </div>
      <div className="manga-card-copy">
        <h2 className="manga-card-title" title={manga.title}>
          {manga.title}
        </h2>
        <span className="manga-card-list-meta">
          {manga.unreadCount > 0
            ? `${manga.unreadCount} unread`
            : 'All read'}
          {manga.downloadCount > 0
            ? ` · ${manga.downloadCount} downloaded`
            : ''}
          {progress
            ? ` · ${progress.name}${
                progress.lastPageRead > 0
                  ? `, page ${Math.min(
                      progress.pageCount,
                      progress.lastPageRead + 1,
                    )}`
                  : ''
              }`
            : ''}
        </span>
      </div>
    </article>
  );

  if (selectable) {
    return (
      <button
        id={`library-card-${manga.id}`}
        className={`manga-card-link${selected ? ' is-selected' : ''}`}
        type="button"
        aria-pressed={selected}
        aria-haspopup="menu"
        aria-keyshortcuts="Shift+F10"
        aria-label={`${manga.title}, ${selected ? 'selected' : 'not selected'}`}
        onPointerDown={startLongPress}
        onPointerMove={moveLongPress}
        onPointerUp={clearLongPress}
        onPointerCancel={clearLongPress}
        onPointerLeave={clearLongPress}
        onContextMenu={handleContextMenu}
        onKeyDown={handleContextKey}
        onClick={(event) => {
          if (longPressTriggered.current) {
            longPressTriggered.current = false;
            return;
          }

          onToggle?.(event.shiftKey);
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      id={`library-card-${manga.id}`}
      className="manga-card-link"
      to={`/manga/${manga.id}`}
      state={{ origin }}
      aria-label={`${manga.title}, manga details`}
      aria-haspopup="menu"
      aria-keyshortcuts="Shift+F10"
      title={progressLabel ? `Continue reading ${progressLabel}` : undefined}
      onPointerDown={startLongPress}
      onPointerMove={moveLongPress}
      onPointerUp={clearLongPress}
      onPointerCancel={clearLongPress}
      onPointerLeave={clearLongPress}
      onContextMenu={handleContextMenu}
      onKeyDown={handleContextKey}
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

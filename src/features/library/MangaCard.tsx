import { Link } from 'react-router-dom';
import type { LibraryManga } from '../../core/library/libraryRepository';
import type { ResourceService } from '../../core/resources/resourceService';
import { useImageResource } from '../../shared/useImageResource';

export interface MangaCardProps {
  readonly manga: LibraryManga;
  readonly resources: ResourceService;
  readonly selectable?: boolean;
  readonly selected?: boolean;
  readonly onToggle?: (shiftKey: boolean) => void;
}

export function MangaCard({
  manga,
  resources,
  selectable = false,
  selected = false,
  onToggle,
}: MangaCardProps) {
  const thumbnail = useImageResource(resources, manga.thumbnailUrl);
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

  return (
    <Link
      className="manga-card-link"
      to={`/manga/${manga.id}`}
      aria-label={`${manga.title}, manga details`}
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

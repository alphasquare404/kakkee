import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { ResourceService } from '../core/resources/resourceService';
import type { FeedChapter } from '../core/catalog/catalogRepository';
import { useImageResource } from './useImageResource';

interface FeedRowProps {
  readonly chapter: FeedChapter;
  readonly resources: ResourceService;
  readonly detail: string;
  readonly stateLabel?: string;
  readonly to?: string;
  readonly actions?: ReactNode;
}

export function FeedRow({
  chapter,
  resources,
  detail,
  stateLabel,
  to,
  actions,
}: FeedRowProps) {
  const image = useImageResource(resources, chapter.manga.thumbnailUrl);
  const row = (
    <Link
      className="feed-row"
      to={to ?? `/manga/${chapter.manga.id}/chapter/${chapter.id}`}
      aria-label={`${chapter.manga.title}, ${chapter.name}`}
    >
      <span className="feed-art" aria-hidden="true">
        {image.objectUrl ? (
          <img src={image.objectUrl} alt="" decoding="async" />
        ) : (
          <span>{chapter.manga.title.trim().charAt(0).toUpperCase() || '·'}</span>
        )}
      </span>
      <span className="feed-main">
        <span className="feed-title">{chapter.manga.title}</span>
        <span className="feed-chapter">{chapter.name}</span>
        <span className="feed-meta">{detail}</span>
      </span>
      {stateLabel ? <span className="feed-state">{stateLabel}</span> : null}
    </Link>
  );

  if (!actions) {
    return row;
  }

  return (
    <div className="feed-row-shell">
      {row}
      <div className="feed-row-actions">{actions}</div>
    </div>
  );
}

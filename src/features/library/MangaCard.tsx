import type { LibraryManga } from '../../core/library/libraryRepository';

export interface MangaCardProps {
  readonly manga: LibraryManga;
}

export function MangaCard({ manga }: MangaCardProps) {
  const initial = manga.title.trim().charAt(0).toUpperCase();

  return (
    <article className="manga-card">
      <div className="manga-card-cover" aria-hidden="true">
        <span className="manga-card-initial">{initial || '·'}</span>
        <span className="manga-card-note">No cover</span>
      </div>
      <h2 className="manga-card-title" title={manga.title}>
        {manga.title}
      </h2>
    </article>
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

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createOfflineStorage,
  isOfflineStorageSupported,
  type OfflineChapterRecord,
} from '../../core/offline/offlineStorage';
import { BackButton } from '../../shared/BackButton';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  'Device library': 'Pustaka perangkat',
  'Back to device library': 'Kembali ke pustaka perangkat',
  'Downloaded chapters': 'Chapter terunduh',
  'No downloaded chapters for this manga.': 'Belum ada chapter terunduh untuk manga ini.',
  'Open device library': 'Buka pustaka perangkat',
  'Read offline': 'Baca offline',
  'Continue reading': 'Lanjut membaca',
  'Downloaded offline': 'Terunduh offline',
  'Manga sections': 'Bagian manga',
  'Synopsis': 'Sinopsis',
  'Details': 'Detail',
  'No description.': 'Tidak ada deskripsi.',
  'Status': 'Status',
  'Author': 'Penulis',
  'Artist': 'Ilustrator',
  'Source': 'Sumber',
  'Chapters': 'Chapter',
  'Tags': 'Tag',
  'Show more': 'Tampilkan lebih banyak',
  'Show less': 'Tampilkan lebih sedikit',
});

export function OfflineMangaDetailPage({ mangaId }: { readonly mangaId: number }) {
  const { t } = useI18n();
  const storage = useMemo(() => createOfflineStorage(), []);
  const [records, setRecords] = useState<readonly OfflineChapterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [section, setSection] = useState<'chapters' | 'overview'>('chapters');
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    let active = true;

    if (!isOfflineStorageSupported()) {
      setLoading(false);
      setError(true);
      return () => {
        active = false;
      };
    }

    void storage
      .list()
      .then((items) => {
        if (active) {
          setRecords(items.filter((item) => item.mangaId === mangaId));
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [mangaId, storage]);

  const chapters = useMemo(
    () =>
      [...records].sort(
        (left, right) =>
          (right.chapterNumber ?? 0) - (left.chapterNumber ?? 0),
      ),
    [records],
  );
  const metadata = chapters.find(
    (chapter) =>
      chapter.mangaAuthor ||
      chapter.mangaArtist ||
      chapter.mangaDescription ||
      chapter.mangaStatus,
  ) ?? chapters[0];
  const title = metadata?.mangaTitle ?? t('Device library');
  const cover = chapters.find((chapter) => chapter.coverDataUrl)?.coverDataUrl;
  const continueChapter = chapters[0];
  const description = metadata?.mangaDescription?.trim() ?? '';
  const authorLine = [
    metadata?.mangaAuthor ? `${t('Author')}: ${metadata.mangaAuthor}` : null,
    metadata?.mangaArtist ? `${t('Artist')}: ${metadata.mangaArtist}` : null,
  ]
    .filter(Boolean)
    .join('  ·  ');
  const sourceName = metadata?.mangaSourceName;

  return (
    <div className="app-shell detail-shell offline-detail-shell">
      <nav className="page-nav" aria-label="Breadcrumb">
        <BackButton
          className="detail-nav-back"
          label={t('Back to device library')}
          to="/downloads/device"
        />
        <div className="page-nav-trail">
          <Link to="/downloads/device">{t('Device library')}</Link>
          <span aria-hidden="true">/</span>
          <span className="page-nav-current">{title}</span>
        </div>
      </nav>

      <main className="manga-detail">
        {loading ? (
          <p className="settings-save-state" role="status">
            {t('Loading…')}
          </p>
        ) : null}

        {!loading && error ? (
          <div className="library-state" role="alert">
            <h1>{t('Device storage is not available in this browser.')}</h1>
            <Link className="button button-secondary" to="/downloads/device">
              {t('Back to device library')}
            </Link>
          </div>
        ) : null}

        {!loading && !error && chapters.length === 0 ? (
          <div className="library-state">
            <h1>{t('No downloaded chapters for this manga.')}</h1>
            <Link className="button button-secondary" to="/downloads/device">
              {t('Back to device library')}
            </Link>
          </div>
        ) : null}

        {chapters.length > 0 ? (
          <>
            <div className="manga-top">
              <header className="manga-hero">
                <div className="manga-hero-cover">
                  {cover ? (
                    <img src={cover} alt="" decoding="async" />
                  ) : (
                    <span className="manga-hero-placeholder" aria-hidden="true">
                      {title.trim().charAt(0).toUpperCase() || '·'}
                    </span>
                  )}
                </div>
              </header>

              <section className="manga-info-panel" aria-labelledby="offline-manga-title">
                <div className="manga-meta-row">
                  <span className="manga-status">
                    {metadata?.mangaStatus
                      ? metadata.mangaStatus.toUpperCase()
                      : t('Downloaded offline')}
                  </span>
                  <span>
                    {chapters.length === 1
                      ? t('1 chapter')
                      : t('{count} chapters', { count: chapters.length })}
                  </span>
                  {sourceName ? <span>{sourceName}</span> : null}
                </div>

                <h1 id="offline-manga-title">{title}</h1>
                {authorLine ? <p className="manga-byline">{authorLine}</p> : null}

                {description ? (
                  <>
                    <p
                      className={`manga-synopsis-preview${
                        !descriptionExpanded && description.length > 240
                          ? ' is-clamped'
                          : ''
                      }`}
                    >
                      {description}
                    </p>
                    {description.length > 240 ? (
                      <button
                        className="description-toggle"
                        type="button"
                        onClick={() => {
                          setSection('overview');
                          setDescriptionExpanded((value) => !value);
                        }}
                      >
                        {descriptionExpanded ? t('Show less') : t('Show more')}
                      </button>
                    ) : null}
                  </>
                ) : (
                  <p className="manga-synopsis-preview manga-description-empty">
                    {t('No description.')}
                  </p>
                )}

                <div className="manga-actions">
                  {continueChapter ? (
                    <Link
                      className="button detail-primary"
                      to={`/offline/read/${continueChapter.chapterId}`}
                    >
                      {t('Continue reading')}
                    </Link>
                  ) : null}
                </div>
              </section>
            </div>

            <div className="manga-sections">
              <nav className="detail-tabs" aria-label={t('Manga sections')}>
                <button
                  className={section === 'chapters' ? 'is-active' : undefined}
                  type="button"
                  aria-current={section === 'chapters' ? 'true' : undefined}
                  onClick={() => setSection('chapters')}
                >
                  {t('Chapters')}
                </button>
                <button
                  className={section === 'overview' ? 'is-active' : undefined}
                  type="button"
                  aria-current={section === 'overview' ? 'true' : undefined}
                  onClick={() => setSection('overview')}
                >
                  {t('Overview')}
                </button>
              </nav>

              {section === 'overview' ? (
                <div className="manga-overview-grid">
                  <div className="manga-overview-main">
                    <section
                      className="manga-overview-synopsis"
                      aria-labelledby="offline-synopsis-heading"
                    >
                      <h2 id="offline-synopsis-heading">{t('Synopsis')}</h2>
                      {description ? (
                        <p className="manga-description">{description}</p>
                      ) : (
                        <p className="manga-description manga-description-empty">
                          {t('No description.')}
                        </p>
                      )}
                    </section>

                    <section
                      className="manga-overview-facts"
                      aria-labelledby="offline-facts-heading"
                    >
                      <h2 id="offline-facts-heading">{t('Details')}</h2>
                      <dl>
                        <div>
                          <dt>{t('Status')}</dt>
                          <dd>{metadata?.mangaStatus ?? t('Downloaded offline')}</dd>
                        </div>
                        {metadata?.mangaAuthor ? (
                          <div>
                            <dt>{t('Author')}</dt>
                            <dd>{metadata.mangaAuthor}</dd>
                          </div>
                        ) : null}
                        {metadata?.mangaArtist ? (
                          <div>
                            <dt>{t('Artist')}</dt>
                            <dd>{metadata.mangaArtist}</dd>
                          </div>
                        ) : null}
                        {sourceName ? (
                          <div>
                            <dt>{t('Source')}</dt>
                            <dd>{sourceName}</dd>
                          </div>
                        ) : null}
                        <div>
                          <dt>{t('Chapters')}</dt>
                          <dd>
                            {chapters.length === 1
                              ? t('1 chapter')
                              : t('{count} chapters', { count: chapters.length })}
                          </dd>
                        </div>
                      </dl>
                    </section>

                    {metadata?.mangaGenres && metadata.mangaGenres.length > 0 ? (
                      <section
                        className="manga-overview-tags"
                        aria-labelledby="offline-tags-heading"
                      >
                        <h2 id="offline-tags-heading">{t('Tags')}</h2>
                        <ul className="manga-genres" aria-label="Genres">
                          {metadata.mangaGenres.map((genre) => (
                            <li key={genre}>{genre}</li>
                          ))}
                        </ul>
                      </section>
                    ) : null}
                  </div>
                </div>
              ) : (
                <section
                  className="chapter-section"
                  id="offline-chapters"
                  aria-labelledby="offline-chapters-heading"
                >
                  <div className="chapter-section-header">
                    <div>
                      <h2 id="offline-chapters-heading">{t('Chapters')}</h2>
                      <p className="chapter-section-count">
                        {chapters.length === 1
                          ? t('1 chapter')
                          : t('{count} chapters', { count: chapters.length })}
                      </p>
                    </div>
                  </div>
                  <div className="feed-list">
                    {chapters.map((chapter) => (
                      <Link
                        className="reading-row offline-detail-chapter"
                        key={chapter.chapterId}
                        to={`/offline/read/${chapter.chapterId}`}
                      >
                        <span className="reading-row-main">
                          <strong className="reading-row-title">
                            {chapter.chapterName}
                          </strong>
                          <span className="reading-row-meta">
                            {chapter.pageCount === 1
                              ? t('1 page')
                              : t('{count} pages', { count: chapter.pageCount })}
                            {' · '}
                            {t('Read offline')}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

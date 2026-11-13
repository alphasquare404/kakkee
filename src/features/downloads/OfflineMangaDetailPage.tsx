import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  createOfflineStorage,
  isOfflineStorageSupported,
  type OfflineChapterRecord,
} from '../../core/offline/offlineStorage';
import { BackButton } from '../../shared/BackButton';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  'Device library': 'Pustaka perangkat',
  'Back to device library': 'Kembali ke pustaka perangkat',
  'Downloaded chapters': 'Chapter terunduh',
  'No downloaded chapters for this manga.': 'Belum ada chapter terunduh untuk manga ini.',
  'Open device library': 'Buka pustaka perangkat',
  'Read offline': 'Baca offline',
});

export function OfflineMangaDetailPage({ mangaId }: { readonly mangaId: number }) {
  const { t } = useI18n();
  const storage = useMemo(() => createOfflineStorage(), []);
  const [records, setRecords] = useState<readonly OfflineChapterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const params = useParams();

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
  const title = chapters[0]?.mangaTitle ?? t('Device library');
  const cover = chapters.find((chapter) => chapter.coverDataUrl)?.coverDataUrl;

  return (
    <div className="app-shell page-shell offline-detail-shell">
      <PageHeader
        title={title}
        subtitle={
          chapters.length === 1
            ? t('1 downloaded chapter')
            : t('{count} downloaded chapters', { count: chapters.length })
        }
        count={chapters.length > 0 ? String(chapters.length) : undefined}
        leading={
          <BackButton
            to="/downloads/device"
            label={t('Back to device library')}
          />
        }
      />

      {loading ? (
        <p className="settings-save-state" role="status">
          {t('Loading…')}
        </p>
      ) : null}

      {!loading && error ? (
        <div className="library-state" role="alert">
          <h1>{t('Device storage is not available in this browser.')}</h1>
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
        <div className="offline-detail-layout">
          <div className="offline-detail-cover">
            {cover ? (
              <img src={cover} alt="" loading="lazy" decoding="async" />
            ) : (
              <span>{title.trim().charAt(0).toUpperCase() || '·'}</span>
            )}
          </div>
          <section className="offline-detail-chapters" aria-labelledby="offline-chapters-heading">
            <div className="section-heading-row">
              <h2 id="offline-chapters-heading">{t('Downloaded chapters')}</h2>
              <span>{chapters.length}</span>
            </div>
            <div className="feed-list">
              {chapters.map((chapter) => (
                <Link
                  className="reading-row offline-detail-chapter"
                  key={chapter.chapterId}
                  to={`/offline/read/${chapter.chapterId}`}
                  state={{ from: `/manga/${params.mangaId}` }}
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
        </div>
      ) : null}
    </div>
  );
}

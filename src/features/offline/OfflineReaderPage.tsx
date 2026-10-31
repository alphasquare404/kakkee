import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  createOfflineStorage,
  type OfflineChapter,
  type OfflineChapterRecord,
} from '../../core/offline/offlineStorage';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  'Offline reader': 'Reader offline',
  'Offline downloads': 'Unduhan offline',
  'Chapter not stored on this device.': 'Chapter tidak tersimpan di perangkat ini.',
  'Back to offline downloads': 'Kembali ke unduhan offline',
  'Loading…': 'Memuat…',
  Previous: 'Sebelumnya',
  Next: 'Berikutnya',
});

export function OfflineReaderPage() {
  const { t } = useI18n();
  const { chapterId: chapterIdParam = '' } = useParams();
  const chapterId = Number(chapterIdParam);
  const navigate = useNavigate();
  const storage = useMemo(() => createOfflineStorage(), []);
  const [chapter, setChapter] = useState<OfflineChapter | null>(null);
  const [siblings, setSiblings] = useState<readonly OfflineChapterRecord[]>([]);
  const [urls, setUrls] = useState<readonly string[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let active = true;
    let created: string[] = [];

    void storage
      .get(chapterId)
      .then(async (value) => {
        if (!active) {
          return;
        }

        if (!value) {
          setStatus('error');
          return;
        }

        created = value.pages.map((page) => URL.createObjectURL(page));
        const all = await storage.list(value.serverBaseUrl);

        if (!active) {
          created.forEach((url) => URL.revokeObjectURL(url));
          return;
        }

        setChapter(value);
        setUrls(created);
        setSiblings(all.filter((item) => item.mangaId === value.mangaId));
        setStatus('ready');
      })
      .catch(() => {
        if (active) {
          setStatus('error');
        }
      });

    return () => {
      active = false;
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [chapterId, storage]);

  const ordered = [...siblings].sort(
    (left, right) => left.chapterNumber - right.chapterNumber,
  );
  const index = ordered.findIndex((item) => item.chapterId === chapterId);
  const previous = index > 0 ? ordered[index - 1] : undefined;
  const next = index >= 0 ? ordered[index + 1] : undefined;

  if (status === 'loading') {
    return (
      <div className="app-shell page-shell">
        <p className="settings-save-state" role="status">
          {t('Loading…')}
        </p>
      </div>
    );
  }

  if (status === 'error' || !chapter) {
    return (
      <div className="app-shell page-shell">
        <div className="library-state" role="alert">
          <h1>{t('Chapter not stored on this device.')}</h1>
          <Link className="button" to="/offline">
            {t('Back to offline downloads')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="offline-reader">
      <header className="reader-header">
        <Link className="reader-back" to="/offline">
          ← {t('Offline downloads')}
        </Link>
        <div className="reader-title">
          <p>{chapter.mangaTitle}</p>
          <h1>{chapter.chapterName}</h1>
          <span className="reader-page-total">{urls.length}</span>
        </div>
        <nav className="reader-chapter-nav">
          {previous ? (
            <button
              className="reader-quick-action"
              type="button"
              onClick={() => navigate(`/offline/read/${previous.chapterId}`)}
            >
              {t('Previous')}
            </button>
          ) : null}
          {next ? (
            <button
              className="reader-quick-action"
              type="button"
              onClick={() => navigate(`/offline/read/${next.chapterId}`)}
            >
              {t('Next')}
            </button>
          ) : null}
        </nav>
      </header>
      <main className="reader-pages offline-reader-pages">
        {urls.map((url, pageIndex) => (
          <div className="reader-page" key={url}>
            <img
              src={url}
              alt={`${chapter.chapterName} page ${pageIndex + 1}`}
              loading={pageIndex < 3 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
        ))}
      </main>
    </div>
  );
}

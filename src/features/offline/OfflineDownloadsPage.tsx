import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createOfflineStorage,
  isOfflineStorageSupported,
  type OfflineChapterRecord,
} from '../../core/offline/offlineStorage';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  'Offline downloads': 'Unduhan offline',
  'Chapters stored in this browser with OPFS': 'Chapter yang disimpan di browser ini dengan OPFS',
  'Device storage is not available in this browser.': 'Penyimpanan perangkat tidak tersedia di browser ini.',
  'No device downloads yet': 'Belum ada unduhan di perangkat',
  'Download chapters from Manga Detail with the This device target.': 'Unduh chapter dari Manga Detail dengan target Perangkat ini.',
  'Read offline': 'Baca offline',
  'Delete device download': 'Hapus unduhan perangkat',
  'Delete all device downloads': 'Hapus semua unduhan perangkat',
  'Delete all downloads stored in this browser?': 'Hapus semua unduhan yang tersimpan di browser ini?',
  Confirm: 'Konfirmasi',
  Cancel: 'Batal',
  'Could not load device downloads.': 'Tidak dapat memuat unduhan perangkat.',
  'This device': 'Perangkat ini',
  Back: 'Kembali',
  'Loading…': 'Memuat…',
  Retry: 'Coba lagi',
  Delete: 'Hapus',
});

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function OfflineDownloadsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const storage = useMemo(() => createOfflineStorage(), []);
  const supported = isOfflineStorageSupported();
  const [records, setRecords] = useState<readonly OfflineChapterRecord[]>([]);
  const [loading, setLoading] = useState(supported);
  const [error, setError] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    void storage
      .list()
      .then(setRecords)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [storage]);

  const totalBytes = records.reduce((total, record) => total + record.bytes, 0);
  const groups = records.reduce<Map<number, OfflineChapterRecord[]>>(
    (result, record) => {
      const group = result.get(record.mangaId);

      if (group) {
        group.push(record);
      } else {
        result.set(record.mangaId, [record]);
      }

      return result;
    },
    new Map(),
  );

  return (
    <div className="app-shell page-shell">
      <PageHeader
        title={t('Offline downloads')}
        subtitle={t('Chapters stored in this browser with OPFS')}
        count={records.length > 0 ? `${records.length} · ${formatBytes(totalBytes)}` : undefined}
      >
        <Link className="button button-secondary" to="/">
          {t('Back')}
        </Link>
      </PageHeader>

      {!supported ? (
        <div className="library-state">
          <h1>{t('Device storage is not available in this browser.')}</h1>
        </div>
      ) : null}

      {supported && loading ? (
        <p className="settings-save-state" role="status">
          {t('Loading…')}
        </p>
      ) : null}

      {supported && error ? (
        <div className="library-state" role="alert">
          <h1>{t('Could not load device downloads.')}</h1>
          <button className="button" type="button" onClick={load}>
            {t('Retry')}
          </button>
        </div>
      ) : null}

      {supported && !loading && records.length === 0 ? (
        <div className="library-state">
          <h1>{t('No device downloads yet')}</h1>
          <p>{t('Download chapters from Manga Detail with the This device target.')}</p>
        </div>
      ) : null}

      {records.length > 0 ? (
        <>
          <div className="settings-actions">
            {confirmClear ? (
              <>
                <button
                  className="button button-danger"
                  type="button"
                  onClick={() => {
                    void storage.clear().then(() => {
                      setConfirmClear(false);
                      load();
                    });
                  }}
                >
                  {t('Confirm')}
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => setConfirmClear(false)}
                >
                  {t('Cancel')}
                </button>
              </>
            ) : (
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setConfirmClear(true)}
              >
                {t('Delete all device downloads')}
              </button>
            )}
          </div>

          {[...groups.entries()].map(([mangaId, chapters]) => (
            <section className="settings-section" key={mangaId}>
              <div className="section-heading-row">
                <h2>{chapters[0]?.mangaTitle}</h2>
                <span>{chapters.length}</span>
              </div>
              <div className="feed-list">
                {chapters.map((chapter) => (
                  <div className="downloaded-row" key={chapter.chapterId}>
                    <div className="download-copy">
                      <strong>{chapter.chapterName}</strong>
                      <span className="download-meta">
                        {chapter.pageCount} · {formatBytes(chapter.bytes)}
                      </span>
                    </div>
                    <button
                      className="button"
                      type="button"
                      onClick={() =>
                        navigate(`/offline/read/${chapter.chapterId}`)
                      }
                    >
                      {t('Read offline')}
                    </button>
                    <button
                      className="download-cancel"
                      type="button"
                      onClick={() => {
                        void storage.delete(chapter.chapterId).then(load);
                      }}
                    >
                      {t('Delete')}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </>
      ) : null}
    </div>
  );
}

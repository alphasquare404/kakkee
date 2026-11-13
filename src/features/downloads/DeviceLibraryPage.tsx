import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import { useAppPath } from '../../app/useAppPath';
import { createSectionOrigin } from '../../app/navigationOrigin';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  createOfflineStorage,
  isOfflineStorageSupported,
  type OfflineChapterRecord,
} from '../../core/offline/offlineStorage';
import { BackButton } from '../../shared/BackButton';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { PageHeader } from '../../shared/PageHeader';

registerMessages('id', {
  'Device Downloaded Library': 'Pustaka Terunduh di Perangkat',
  'Manga with chapters stored on this device': 'Manga dengan chapter tersimpan di perangkat ini',
  'Loading device library…': 'Memuat pustaka perangkat…',
  'No manga downloaded to this device.': 'Belum ada manga yang diunduh ke perangkat ini.',
  'Device storage is not available in this browser.':
    'Penyimpanan perangkat tidak tersedia di browser ini.',
  '{count} downloaded chapters': '{count} chapter terunduh',
  '1 downloaded chapter': '1 chapter terunduh',
  'Downloaded chapters': 'Chapter terunduh',
  'Read offline': 'Baca offline',
  'Choose a chapter': 'Pilih chapter',
  'Close chapter list': 'Tutup daftar chapter',
  Back: 'Kembali',
});

interface DeviceManga {
  readonly id: number;
  readonly title: string;
  readonly chapters: readonly OfflineChapterRecord[];
}

export function DeviceLibraryPage() {
  const { state } = useConnection();

  return (
    <DeviceLibraryContent
      context={state.status === 'connected' ? state.context : null}
    />
  );
}

function DeviceLibraryContent({
  context,
}: {
  readonly context: ConnectedContext | null;
}) {
  const { t } = useI18n();
  const { pathname, search } = useAppPath();
  const origin = createSectionOrigin('downloads', { pathname, search });
  const storage = useMemo(() => createOfflineStorage(), []);
  const supported = isOfflineStorageSupported();
  const [records, setRecords] = useState<readonly OfflineChapterRecord[]>([]);
  const [loading, setLoading] = useState(supported);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!supported) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    void storage
      .list(context?.config.serverBaseUrl)
      .then((items) => {
        if (active) {
          setRecords(items);
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
  }, [context?.config.serverBaseUrl, storage, supported]);

  const manga = useMemo(() => {
    const grouped = new Map<number, DeviceManga>();

    for (const record of records) {
      const current = grouped.get(record.mangaId);

      if (current) {
        grouped.set(record.mangaId, {
          ...current,
          chapters: [...current.chapters, record],
        });
      } else {
        grouped.set(record.mangaId, {
          id: record.mangaId,
          title: record.mangaTitle,
          chapters: [record],
        });
      }
    }

    return [...grouped.values()];
  }, [records]);

  return (
    <div className="app-shell page-shell">
      <PageHeader
        title={t('Device Downloaded Library')}
        subtitle={t('Manga with chapters stored on this device')}
        count={manga.length > 0 ? String(manga.length) : undefined}
        leading={
          context ? (
            <BackButton to="/downloads?tab=device" label={t('Back')} />
          ) : undefined
        }
      />

      {!supported ? (
        <div className="library-state">
          <h1>{t('Device storage is not available in this browser.')}</h1>
        </div>
      ) : null}

      {supported && loading ? (
        <p className="settings-save-state" role="status">
          {t('Loading device library…')}
        </p>
      ) : null}

      {supported && error ? (
        <div className="library-state" role="alert">
          <h1>{t('Device storage is not available in this browser.')}</h1>
        </div>
      ) : null}

      {supported && !loading && !error && manga.length === 0 ? (
        <div className="library-state">
          <h1>{t('No manga downloaded to this device.')}</h1>
          {context ? (
            <Link className="button button-secondary" to="/downloads?tab=device">
              {t('Back')}
            </Link>
          ) : null}
        </div>
      ) : null}

      {manga.length > 0 ? (
        <div className="manga-grid">
          {manga.map((item) => (
            <DeviceMangaCard
              key={item.id}
              manga={item}
              origin={origin}
            />
          ))}
        </div>
      ) : null}

    </div>
  );
}

function DeviceMangaCard({
  manga,
  origin,
}: {
  readonly manga: DeviceManga;
  readonly origin: unknown;
}) {
  const { t } = useI18n();
  const count = manga.chapters.length;
  const cover =
    manga.chapters.find((chapter) => chapter.coverDataUrl)?.coverDataUrl ??
    `/api/v1/manga/${manga.id}/thumbnail`;

  const card = (
    <article className="manga-card">
      <div className="manga-card-cover">
        <img
          className="manga-card-image"
          src={cover}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
        <span className="manga-card-initial" aria-hidden="true">
          {manga.title.trim().charAt(0).toUpperCase() || '·'}
        </span>
        <div className="manga-card-badges">
          <span className="manga-card-badge is-downloaded">{count}</span>
        </div>
      </div>
      <h2 className="manga-card-title" title={manga.title}>
        {manga.title}
      </h2>
    </article>
  );

  return (
    <Link
      className="manga-card-link"
      to={`/manga/${manga.id}`}
      state={{ origin }}
      aria-label={`${manga.title}, ${count === 1 ? t('1 downloaded chapter') : t('{count} downloaded chapters', { count })}`}
    >
      {card}
    </Link>
  );
}

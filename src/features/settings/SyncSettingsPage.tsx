import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { createSyncController } from '../../core/sync/syncController';
import { createSyncRepository } from '../../core/sync/syncRepository';
import type { EditableSyncSettings } from '../../core/sync/syncRepository';
import {
  SyncStatusChangedDocument,
  type SyncStatusChangedSubscription,
} from '../../core/graphql/generated/graphql';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  Sync: 'Sinkronisasi',
  'Server and Yomi synchronization': 'Sinkronisasi server dan Yomi',
  'All settings': 'Semua pengaturan',
  'Start sync': 'Mulai sinkronisasi',
  'Sync pushes selected server data to the configured Yomi host.':
    'Sinkronisasi mengirim data server terpilih ke host Yomi yang dikonfigurasi.',
  'Sync started': 'Sinkronisasi dimulai',
  'Sync is already in progress': 'Sinkronisasi sedang berjalan',
  'Sync is disabled in server settings':
    'Sinkronisasi dinonaktifkan di pengaturan server',
  'Live sync status': 'Status sinkronisasi langsung',
  State: 'Status',
  Started: 'Dimulai',
  Finished: 'Selesai',
  Error: 'Error',
  'Sync action failed.': 'Aksi sinkronisasi gagal.',
  'Data selection': 'Pilihan data',
  'Yomi sync enabled': 'Sinkronisasi Yomi aktif',
  'Yomi API key': 'Kunci API Yomi',
  'Sync interval': 'Interval sinkronisasi',
  'Yomi host': 'Host Yomi',
  'Not configured': 'Belum dikonfigurasi',
  Categories: 'Kategori',
  Chapters: 'Chapter',
  History: 'Riwayat',
  Manga: 'Manga',
  Tracking: 'Tracking',
});

type SyncStatus = SyncStatusChangedSubscription['syncStatusChanged'];

const SYNC_RESULT_LABEL: Record<string, string> = {
  SUCCESS: 'Sync started',
  SYNC_IN_PROGRESS: 'Sync is already in progress',
  SYNC_DISABLED: 'Sync is disabled in server settings',
};

const DATA_TOGGLES: ReadonlyArray<{
  key: keyof EditableSyncSettings;
  label: string;
}> = [
  { key: 'syncDataCategories', label: 'Categories' },
  { key: 'syncDataChapters', label: 'Chapters' },
  { key: 'syncDataHistory', label: 'History' },
  { key: 'syncDataManga', label: 'Manga' },
  { key: 'syncDataTracking', label: 'Tracking' },
];

export function SyncSettingsPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <SyncContent context={state.context} />;
}

function SyncContent({ context }: { readonly context: ConnectedContext }) {
  const { t } = useI18n();
  const controller = useMemo(() => {
    const repository = createSyncRepository({
      getClient: () => context.graphQL,
    });

    return createSyncController(repository);
  }, [context.graphQL]);
  const sync = useSyncExternalStore(controller.subscribe, controller.getState);
  const [liveStatus, setLiveStatus] = useState<SyncStatus | null>(null);
  const [apiKeyDraft, setApiKeyDraft] = useState('');

  useEffect(() => {
    void controller.load();
  }, [controller]);

  useEffect(() => {
    if (sync.settings) {
      setApiKeyDraft(
        typeof sync.settings.syncYomiApiKey === 'string'
          ? sync.settings.syncYomiApiKey
          : '',
      );
    }
  }, [sync.settings]);

  useEffect(() => {
    if (typeof context.graphQL.subscribe !== 'function') {
      return;
    }

    const subscription = context.graphQL
      .subscribe({ query: SyncStatusChangedDocument })
      .subscribe({
        next: (result) => {
          if (result.data?.syncStatusChanged) {
            setLiveStatus(result.data.syncStatusChanged);
          }
        },
        error: () => undefined,
      });

    return () => subscription.unsubscribe();
  }, [context.graphQL]);

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader
        title={t('Sync')}
        subtitle={t('Server and Yomi synchronization')}
      >
        <Link className="button button-secondary" to="/settings">
          {t('All settings')}
        </Link>
      </PageHeader>

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="sync-start">
          <div className="section-heading-row">
            <h2 id="sync-start">{t('Start sync')}</h2>
          </div>
          <p className="settings-save-state">
            {t('Sync pushes selected server data to the configured Yomi host.')}
          </p>
          <div className="settings-actions">
            <button
              className="button"
              type="button"
              disabled={sync.busy || !sync.settings}
              onClick={() => void controller.start()}
            >
              {sync.busy ? 'Working…' : 'Start sync'}
            </button>
          </div>
          {sync.result ? (
            <p className="settings-save-state" role="status">
              {t(SYNC_RESULT_LABEL[sync.result] ?? sync.result)}
            </p>
          ) : null}
          {liveStatus ? (
            <dl className="settings-rows" aria-label={t('Live sync status')}>
              <div>
                <dt>{t('State')}</dt>
                <dd>{liveStatus.state}</dd>
              </div>
              {liveStatus.startDate ? (
                <div>
                  <dt>{t('Started')}</dt>
                  <dd>{liveStatus.startDate}</dd>
                </div>
              ) : null}
              {liveStatus.endDate ? (
                <div>
                  <dt>{t('Finished')}</dt>
                  <dd>{liveStatus.endDate}</dd>
                </div>
              ) : null}
              {liveStatus.errorMessage ? (
                <div>
                  <dt>{t('Error')}</dt>
                  <dd>{liveStatus.errorMessage}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          {sync.error ? (
            <p className="settings-inline-error" role="alert">
              {t('Sync action failed.')}
            </p>
          ) : null}
        </section>

        <section className="settings-section" aria-labelledby="sync-data">
          <div className="section-heading-row">
            <h2 id="sync-data">{t('Data selection')}</h2>
          </div>
          {sync.settings ? (
            <div className="settings-toggle-list">
              {DATA_TOGGLES.map((toggle) => (
                <label className="settings-toggle" key={toggle.key}>
                  <span>{t(toggle.label)}</span>
                  <input
                    type="checkbox"
                    checked={sync.settings?.[toggle.key] === true}
                    disabled={sync.busy}
                    onChange={(event) =>
                      void controller.update({
                        [toggle.key]: event.target.checked,
                      })
                    }
                  />
                </label>
              ))}
              <label className="settings-toggle">
                <span>{t('Yomi sync enabled')}</span>
                <input
                  type="checkbox"
                  checked={sync.settings.syncYomiEnabled}
                  disabled={sync.busy}
                  onChange={(event) =>
                    void controller.update({
                      syncYomiEnabled: event.target.checked,
                    })
                  }
                />
              </label>
              <label className="settings-text-field">
                <span>{t('Yomi API key')}</span>
                <input
                  type="password"
                  autoComplete="off"
                  value={apiKeyDraft}
                  disabled={sync.busy}
                  onChange={(event) => setApiKeyDraft(event.target.value)}
                  onBlur={() => {
                    if (apiKeyDraft !== sync.settings?.syncYomiApiKey) {
                      void controller.update({ syncYomiApiKey: apiKeyDraft });
                    }
                  }}
                />
              </label>
            </div>
          ) : (
            <p className="settings-save-state" role="status">
              Loading sync settings…
            </p>
          )}
          {sync.settings ? (
            <dl className="settings-rows">
              <div>
                <dt>{t('Sync interval')}</dt>
                <dd>{sync.settings.syncInterval}</dd>
              </div>
              <div>
                <dt>{t('Yomi host')}</dt>
                <dd className="settings-endpoint">
                  {sync.settings.syncYomiHost || t('Not configured')}
                </dd>
              </div>
            </dl>
          ) : null}
        </section>
      </div>
    </div>
  );
}

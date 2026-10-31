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
  const controller = useMemo(() => {
    const repository = createSyncRepository({
      getClient: () => context.graphQL,
    });

    return createSyncController(repository);
  }, [context.graphQL]);
  const sync = useSyncExternalStore(controller.subscribe, controller.getState);
  const [liveStatus, setLiveStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    void controller.load();
  }, [controller]);

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
      <PageHeader title="Sync" subtitle="Server and Yomi synchronization">
        <Link className="button button-secondary" to="/settings">
          All settings
        </Link>
      </PageHeader>

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="sync-start">
          <div className="section-heading-row">
            <h2 id="sync-start">Start sync</h2>
          </div>
          <p className="settings-save-state">
            Sync pushes selected server data to the configured Yomi host.
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
              {SYNC_RESULT_LABEL[sync.result] ?? sync.result}
            </p>
          ) : null}
          {liveStatus ? (
            <dl className="settings-rows" aria-label="Live sync status">
              <div>
                <dt>State</dt>
                <dd>{liveStatus.state}</dd>
              </div>
              {liveStatus.startDate ? (
                <div>
                  <dt>Started</dt>
                  <dd>{liveStatus.startDate}</dd>
                </div>
              ) : null}
              {liveStatus.endDate ? (
                <div>
                  <dt>Finished</dt>
                  <dd>{liveStatus.endDate}</dd>
                </div>
              ) : null}
              {liveStatus.errorMessage ? (
                <div>
                  <dt>Error</dt>
                  <dd>{liveStatus.errorMessage}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
          {sync.error ? (
            <p className="settings-inline-error" role="alert">
              Sync action failed.
            </p>
          ) : null}
        </section>

        <section className="settings-section" aria-labelledby="sync-data">
          <div className="section-heading-row">
            <h2 id="sync-data">Data selection</h2>
          </div>
          {sync.settings ? (
            <div className="settings-toggle-list">
              {DATA_TOGGLES.map((toggle) => (
                <label className="settings-toggle" key={toggle.key}>
                  <span>{toggle.label}</span>
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
                <span>Yomi sync enabled</span>
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
            </div>
          ) : (
            <p className="settings-save-state" role="status">
              Loading sync settings…
            </p>
          )}
          {sync.settings ? (
            <dl className="settings-rows">
              <div>
                <dt>Sync interval</dt>
                <dd>{sync.settings.syncInterval}</dd>
              </div>
              <div>
                <dt>Yomi host</dt>
                <dd className="settings-endpoint">
                  {sync.settings.syncYomiHost || 'Not configured'}
                </dd>
              </div>
            </dl>
          ) : null}
        </section>
      </div>
    </div>
  );
}

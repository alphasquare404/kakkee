import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { createBackupController } from '../../core/backup/backupController';
import { createBackupRepository } from '../../core/backup/backupRepository';
import type { BackupSettings } from '../../core/backup/backupRepository';
import type { PartialBackupFlagsInput } from '../../core/graphql/generated/graphql';
import { PageHeader } from '../../shared/PageHeader';

const FLAGS: ReadonlyArray<{
  key: keyof PartialBackupFlagsInput;
  autoKey: keyof BackupSettings;
  label: string;
}> = [
  { key: 'includeCategories', autoKey: 'autoBackupIncludeCategories', label: 'Categories' },
  { key: 'includeChapters', autoKey: 'autoBackupIncludeChapters', label: 'Chapters' },
  { key: 'includeClientData', autoKey: 'autoBackupIncludeClientData', label: 'Client data' },
  { key: 'includeHistory', autoKey: 'autoBackupIncludeHistory', label: 'History' },
  { key: 'includeManga', autoKey: 'autoBackupIncludeManga', label: 'Manga' },
  {
    key: 'includeServerSettings',
    autoKey: 'autoBackupIncludeServerSettings',
    label: 'Server settings',
  },
  { key: 'includeTracking', autoKey: 'autoBackupIncludeTracking', label: 'Tracking' },
];

export function BackupSettingsPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <BackupContent context={state.context} />;
}

function BackupContent({ context }: { readonly context: ConnectedContext }) {
  const controller = useMemo(() => {
    const repository = createBackupRepository({
      getClient: () => context.graphQL,
      getGraphqlUrl: () => context.config.graphqlHttpUrl,
      getAccessToken: () => context.authService?.getAccessToken() ?? null,
    });

    return createBackupController(repository);
  }, [context.authService, context.config.graphqlHttpUrl, context.graphQL]);
  const backup = useSyncExternalStore(controller.subscribe, controller.getState);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [flags, setFlags] = useState<PartialBackupFlagsInput>({
    includeCategories: true,
    includeChapters: true,
    includeClientData: true,
    includeHistory: true,
    includeManga: true,
    includeServerSettings: true,
    includeTracking: true,
  });

  useEffect(() => {
    void controller.load();
  }, [controller]);

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader title="Backup" subtitle="Server backup and restore data">
        <Link className="button button-secondary" to="/settings">
          All settings
        </Link>
      </PageHeader>

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="backup-create">
          <div className="section-heading-row">
            <h2 id="backup-create">Create backup</h2>
          </div>
          <div className="settings-toggle-list">
            {FLAGS.map((flag) => (
              <label className="settings-toggle" key={flag.key}>
                <span>{flag.label}</span>
                <input
                  type="checkbox"
                  checked={flags[flag.key] === true}
                  onChange={(event) =>
                    setFlags((current) => ({
                      ...current,
                      [flag.key]: event.target.checked,
                    }))
                  }
                />
              </label>
            ))}
          </div>
          <div className="settings-actions">
            <button
              className="button"
              type="button"
              disabled={backup.creating}
              onClick={() => void controller.create(flags)}
            >
              {backup.creating ? 'Creating backup…' : 'Create backup'}
            </button>
          </div>

          {backup.createdUrl ? (
            <p className="settings-save-state" role="status">
              Backup created:{' '}
              <a href={backup.createdUrl} target="_blank" rel="noreferrer">
                open backup file
              </a>
            </p>
          ) : null}

          {backup.error && backup.lastAction === 'create' ? (
            <p className="settings-inline-error" role="alert">
              Backup could not be created. Check server logs.
            </p>
          ) : null}
        </section>

        <section className="settings-section" aria-labelledby="backup-restore">
          <div className="section-heading-row">
            <h2 id="backup-restore">Restore backup</h2>
          </div>
          <p className="settings-save-state">
            Upload a backup archive to the server. This may replace server data.
          </p>
          <input
            type="file"
            accept=".gz,.backup,application/gzip"
            aria-label="Backup file"
            onChange={(event) =>
              setRestoreFile(event.target.files?.[0] ?? null)
            }
          />
          <div className="settings-actions">
            <button
              className="button button-secondary"
              type="button"
              disabled={!restoreFile || backup.validating}
              onClick={() => {
                if (restoreFile) {
                  void controller.validate(restoreFile);
                }
              }}
            >
              {backup.validating ? 'Validating…' : 'Validate backup'}
            </button>
            <button
              className="button button-danger"
              type="button"
              disabled={!restoreFile || backup.restoring}
              onClick={() => {
                if (restoreFile) {
                  void controller.restore(restoreFile, flags);
                }
              }}
            >
              {backup.restoring ? 'Restoring…' : 'Restore backup'}
            </button>
          </div>
          {backup.validation ? (
            <div className="settings-save-state" role="status">
              {backup.validation.missingSources.length === 0 &&
              backup.validation.missingTrackers.length === 0 ? (
                <span>Backup validation passed.</span>
              ) : (
                <>
                  {backup.validation.missingSources.length > 0 ? (
                    <p>
                      Missing sources:{' '}
                      {backup.validation.missingSources
                        .map((source) => source.name)
                        .join(', ')}
                    </p>
                  ) : null}
                  {backup.validation.missingTrackers.length > 0 ? (
                    <p>
                      Missing trackers:{' '}
                      {backup.validation.missingTrackers
                        .map((tracker) => tracker.name)
                        .join(', ')}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
          {backup.restoredId ? (
            <p className="settings-save-state" role="status">
              Restore started: {backup.restoredId}
            </p>
          ) : null}
          {backup.error && backup.lastAction === 'restore' ? (
            <p className="settings-inline-error" role="alert">
              Backup restore failed. Check server logs.
            </p>
          ) : null}
        </section>

        <section className="settings-section" aria-labelledby="backup-auto">
          <div className="section-heading-row">
            <h2 id="backup-auto">Automatic backup</h2>
          </div>
          {backup.status === 'loading' && !backup.settings ? (
            <p className="settings-save-state" role="status">
              Loading backup settings…
            </p>
          ) : null}
          {backup.settings ? (
            <dl className="settings-rows">
              <div>
                <dt>Backup path</dt>
                <dd className="settings-endpoint">
                  {backup.settings.backupPath || 'Not configured'}
                </dd>
              </div>
              <div>
                <dt>Interval</dt>
                <dd>{backup.settings.backupInterval} hours</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{backup.settings.backupTime}</dd>
              </div>
              <div>
                <dt>Retention</dt>
                <dd>{backup.settings.backupTTL} backups</dd>
              </div>
              <div>
                <dt>Included data</dt>
                <dd>
                  {FLAGS.filter(
                    (flag) => backup.settings?.[flag.autoKey] === true,
                  )
                    .map((flag) => flag.label)
                    .join(', ') || 'None'}
                </dd>
              </div>
            </dl>
          ) : null}
          <p className="settings-save-state">
            Automatic backup flags can be changed in Server settings.
          </p>
          <p className="settings-save-state">
            Restore backup upload is not implemented yet.
          </p>
        </section>
      </div>
    </div>
  );
}

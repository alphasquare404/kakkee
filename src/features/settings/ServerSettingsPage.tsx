import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import {
  createServerSettingsController,
  type ServerSettingsController,
} from '../../core/settings/serverSettingsController';
import {
  createServerSettingsRepository,
  type EditableServerSettings,
} from '../../core/settings/serverSettingsRepository';
import { PageHeader } from '../../shared/PageHeader';

export function ServerSettingsPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <ServerSettingsContent context={state.context} />;
}

function ServerSettingsContent({ context }: { readonly context: ConnectedContext }) {
  const controller = useMemo(() => {
    const repository = createServerSettingsRepository({
      getClient: () => context.graphQL,
    });

    return createServerSettingsController(repository);
  }, [context.graphQL]);
  const settings = useSyncExternalStore(controller.subscribe, controller.getState);

  useEffect(() => {
    void controller.load();
  }, [controller]);

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader
        title="Server settings"
        subtitle="Server behavior stored by Suwayomi"
      >
        <Link className="button button-secondary" to="/settings">
          All settings
        </Link>
      </PageHeader>

      <div className="settings-content">
        {settings.status === 'loading' && !settings.settings ? (
          <p className="library-state" role="status">
            Loading server settings…
          </p>
        ) : null}

        {settings.status === 'error' ? (
          <div className="library-state" role="alert">
            <h2>Couldn&apos;t load server settings</h2>
            <button className="button button-secondary" type="button" onClick={() => void controller.retry()}>
              Retry
            </button>
          </div>
        ) : null}

        {settings.settings ? (
          <ServerSettingsForm controller={controller} settings={settings.settings} />
        ) : null}
      </div>
    </div>
  );
}

function ServerSettingsForm({
  controller,
  settings,
}: {
  readonly controller: ServerSettingsController;
  readonly settings: NonNullable<ReturnType<ServerSettingsController['getState']>['settings']>;
}) {
  const update = (patch: Partial<EditableServerSettings>) => {
    void controller.update(patch);
  };

  return (
    <>
      {controller.getState().saveError ? (
        <p className="settings-inline-error" role="alert">
          The server rejected the last change. The previous value is still shown.
        </p>
      ) : null}
      <p className="settings-save-state" role="status">
        {controller.getState().saving ? 'Saving…' : 'Changes save automatically'}
      </p>

      <section className="settings-section" aria-labelledby="server-updates">
        <div className="section-heading-row">
          <h2 id="server-updates">Library updates</h2>
        </div>
        <div className="settings-toggle-list">
          <Toggle
            label="Update library automatically"
            checked={settings.updateMangas}
            onChange={(value) => update({ updateMangas: value })}
          />
          <Toggle
            label="Exclude completed manga"
            checked={settings.excludeCompleted}
            onChange={(value) => update({ excludeCompleted: value })}
          />
          <Toggle
            label="Exclude not-started manga"
            checked={settings.excludeNotStarted}
            onChange={(value) => update({ excludeNotStarted: value })}
          />
          <Toggle
            label="Exclude manga with unread chapters"
            checked={settings.excludeUnreadChapters}
            onChange={(value) => update({ excludeUnreadChapters: value })}
          />
          <Toggle
            label="Exclude entries with unread chapters"
            checked={settings.excludeEntryWithUnreadChapters}
            onChange={(value) => update({ excludeEntryWithUnreadChapters: value })}
          />
        </div>
        <div className="settings-field-grid">
          <NumberField
            label="Global update interval (hours)"
            value={settings.globalUpdateInterval}
            min={0}
            step={0.5}
            onCommit={(value) => update({ globalUpdateInterval: value })}
          />
        </div>
      </section>

      <section className="settings-section" aria-labelledby="server-downloads">
        <div className="section-heading-row">
          <h2 id="server-downloads">Downloads</h2>
        </div>
        <div className="settings-toggle-list">
          <Toggle
            label="Download new chapters automatically"
            checked={settings.autoDownloadNewChapters}
            onChange={(value) => update({ autoDownloadNewChapters: value })}
          />
          <Toggle
            label="Download as CBZ archive"
            checked={settings.downloadAsCbz}
            onChange={(value) => update({ downloadAsCbz: value })}
          />
        </div>
        <div className="settings-field-grid">
          <NumberField
            label="Automatic download limit"
            value={settings.autoDownloadNewChaptersLimit}
            min={0}
            step={1}
            onCommit={(value) => update({ autoDownloadNewChaptersLimit: value })}
          />
          <NumberField
            label="Max sources in parallel"
            value={settings.maxSourcesInParallel}
            min={1}
            step={1}
            onCommit={(value) => update({ maxSourcesInParallel: value })}
          />
        </div>
        <dl className="settings-rows">
          <div>
            <dt>Downloads path</dt>
            <dd className="settings-endpoint">
              {settings.downloadsPath || 'Not configured'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="settings-section" aria-labelledby="server-opds">
        <div className="section-heading-row">
          <h2 id="server-opds">OPDS</h2>
        </div>
        <div className="settings-toggle-list">
          <Toggle
            label="Mark chapters as read on download"
            checked={settings.opdsMarkAsReadOnDownload ?? false}
            onChange={(value) => update({ opdsMarkAsReadOnDownload: value })}
          />
          <Toggle
            label="Show only downloaded chapters"
            checked={settings.opdsShowOnlyDownloadedChapters ?? false}
            onChange={(value) => update({ opdsShowOnlyDownloadedChapters: value })}
          />
          <Toggle
            label="Show only unread chapters"
            checked={settings.opdsShowOnlyUnreadChapters ?? false}
            onChange={(value) => update({ opdsShowOnlyUnreadChapters: value })}
          />
          <Toggle
            label="Enable page read progress"
            checked={settings.opdsEnablePageReadProgress ?? false}
            onChange={(value) => update({ opdsEnablePageReadProgress: value })}
          />
          <Toggle
            label="Skip chapter metadata feed"
            checked={settings.opdsSkipChapterMetadataFeed ?? false}
            onChange={(value) => update({ opdsSkipChapterMetadataFeed: value })}
          />
          <Toggle
            label="Use binary file sizes"
            checked={settings.opdsUseBinaryFileSizes ?? false}
            onChange={(value) => update({ opdsUseBinaryFileSizes: value })}
          />
        </div>
        <div className="settings-field-grid">
          <SelectField
            label="CBZ media type"
            value={settings.opdsCbzMimetype ?? 'COMPATIBLE'}
            options={['MODERN', 'LEGACY', 'COMPATIBLE']}
            onChange={(value) =>
              update({ opdsCbzMimetype: value as EditableServerSettings['opdsCbzMimetype'] })
            }
          />
          <SelectField
            label="Chapter sort order"
            value={settings.opdsChapterSortOrder ?? 'ASC'}
            options={['ASC', 'DESC']}
            onChange={(value) =>
              update({
                opdsChapterSortOrder:
                  value as EditableServerSettings['opdsChapterSortOrder'],
              })
            }
          />
          <NumberField
            label="Items per page"
            value={settings.opdsItemsPerPage ?? 20}
            min={1}
            step={1}
            onCommit={(value) => update({ opdsItemsPerPage: value })}
          />
        </div>
      </section>

      <section className="settings-section" aria-labelledby="server-koreader">
        <div className="section-heading-row">
          <h2 id="server-koreader">KOReader sync</h2>
        </div>
        <div className="settings-field-grid">
          <SelectField
            label="Checksum method"
            value={settings.koreaderSyncChecksumMethod ?? 'BINARY'}
            options={['BINARY', 'FILENAME']}
            onChange={(value) =>
              update({
                koreaderSyncChecksumMethod:
                  value as EditableServerSettings['koreaderSyncChecksumMethod'],
              })
            }
          />
          <SelectField
            label="Conflict strategy (forward)"
            value={settings.koreaderSyncStrategyForward ?? 'PROMPT'}
            options={['PROMPT', 'KEEP_LOCAL', 'KEEP_REMOTE', 'DISABLED']}
            onChange={(value) =>
              update({
                koreaderSyncStrategyForward:
                  value as EditableServerSettings['koreaderSyncStrategyForward'],
              })
            }
          />
          <SelectField
            label="Conflict strategy (backward)"
            value={settings.koreaderSyncStrategyBackward ?? 'PROMPT'}
            options={['PROMPT', 'KEEP_LOCAL', 'KEEP_REMOTE', 'DISABLED']}
            onChange={(value) =>
              update({
                koreaderSyncStrategyBackward:
                  value as EditableServerSettings['koreaderSyncStrategyBackward'],
              })
            }
          />
          <NumberField
            label="Percentage tolerance"
            value={settings.koreaderSyncPercentageTolerance ?? 0}
            min={0}
            step={0.1}
            onCommit={(value) => update({ koreaderSyncPercentageTolerance: value })}
          />
        </div>
      </section>

      <section className="settings-section" aria-labelledby="server-system">
        <div className="section-heading-row">
          <h2 id="server-system">System</h2>
        </div>
        <div className="settings-toggle-list">
          <Toggle
            label="Enable debug logs"
            checked={settings.debugLogsEnabled}
            onChange={(value) => update({ debugLogsEnabled: value })}
          />
        </div>
        <dl className="settings-rows">
          <div>
            <dt>Backup path</dt>
            <dd className="settings-endpoint">
              {settings.backupPath || 'Not configured'}
            </dd>
          </div>
          <div>
            <dt>Backup interval</dt>
            <dd>
              {settings.backupInterval}{' '}
              {settings.backupInterval === 1 ? 'hour' : 'hours'}
            </dd>
          </div>
          <div>
            <dt>Authentication mode</dt>
            <dd>{settings.authMode === 'NONE' ? 'No authentication' : settings.authMode}</dd>
          </div>
          <div>
            <dt>Database</dt>
            <dd>{settings.databaseType}</dd>
          </div>
        </dl>
      </section>

      <section className="settings-section" aria-labelledby="server-webui">
        <div className="section-heading-row">
          <h2 id="server-webui">WebUI</h2>
        </div>
        <dl className="settings-rows">
          <div>
            <dt>Channel</dt>
            <dd>{settings.webUIChannel}</dd>
          </div>
          <div>
            <dt>Flavor</dt>
            <dd>{settings.webUIFlavor}</dd>
          </div>
          <div>
            <dt>Interface</dt>
            <dd>{settings.webUIInterface}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (value: boolean) => void;
}) {
  return (
    <label className="settings-toggle">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly options: readonly string[];
  readonly onChange: (value: string) => void;
}) {
  return (
    <label className="settings-select-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll('_', ' ')}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  step,
  onCommit,
}: {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly step: number;
  readonly onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const parsed = Number(draft);

    if (!Number.isFinite(parsed) || parsed < min) {
      setDraft(String(value));
      return;
    }

    if (parsed !== value) {
      onCommit(parsed);
    }
  };

  return (
    <label className="settings-number">
      <span>{label}</span>
      <input
        type="number"
        value={draft}
        min={min}
        step={step}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            commit();
            event.currentTarget.blur();
          }
        }}
      />
    </label>
  );
}

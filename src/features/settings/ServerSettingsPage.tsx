import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import { BackButton } from '../../shared/BackButton';

registerMessages('id', {
  'Server settings': 'Pengaturan server',
  'Connection and server behavior':
    'Koneksi dan perilaku server',
  Connection: 'Koneksi',
  Connected: 'Terhubung',
  Server: 'Server',
  Version: 'Versi',
  Endpoint: 'Endpoint',
  'No authentication': 'Tanpa autentikasi',
  'UI login': 'Login UI',
  Compatibility: 'Kompatibilitas',
  'Stable baseline {version}': 'Baseline stabil {version}',
  'Disconnect server': 'Putuskan server',
  'All settings': 'Semua pengaturan',
  'Couldn’t load server settings':
    'Tidak dapat memuat pengaturan server',
  Retry: 'Coba lagi',
  'The server rejected the last change. The previous value is still shown.':
    'Server menolak perubahan terakhir. Nilai sebelumnya tetap ditampilkan.',
  'Saving…': 'Menyimpan…',
  'Changes save automatically': 'Perubahan disimpan otomatis',
  'Library updates': 'Update perpustakaan',
  Downloads: 'Unduhan',
  'Image conversions': 'Konversi gambar',
  OPDS: 'OPDS',
  'KOReader sync': 'Sinkronisasi KOReader',
  Authentication: 'Autentikasi',
  Database: 'Database',
  System: 'Sistem',
  WebUI: 'WebUI',
  'Image cache': 'Cache gambar',
  Mode: 'Mode',
  Username: 'Username',
  Password: 'Password',
  Type: 'Tipe',
  URL: 'URL',
  'Backup path': 'Lokasi cadangan',
  'Backup interval': 'Interval cadangan',
  'Backup interval value': 'Interval cadangan',
  Channel: 'Kanal',
  Flavor: 'Varian',
  Interface: 'Antarmuka',
  'Downloads path': 'Lokasi unduhan',
  Target: 'Target',
  'MIME type': 'Tipe MIME',
  'Cached pages': 'Halaman ter-cache',
  'Cached thumbnails': 'Thumbnail ter-cache',
  'Downloaded thumbnails': 'Thumbnail terunduh',
  'Update library automatically': 'Perbarui perpustakaan otomatis',
  'Exclude completed manga': 'Kecualikan manga tamat',
  'Exclude not-started manga': 'Kecualikan manga belum dimulai',
  'Exclude manga with unread chapters':
    'Kecualikan manga dengan chapter belum dibaca',
  'Exclude entries with unread chapters':
    'Kecualikan entri dengan chapter belum dibaca',
  'Global update interval (hours)': 'Interval update global (jam)',
  'Download new chapters automatically':
    'Unduh chapter baru secara otomatis',
  'Download as CBZ archive': 'Unduh sebagai arsip CBZ',
  'Automatic download limit': 'Batas unduhan otomatis',
  'Max sources in parallel': 'Maksimal source paralel',
  'Mark chapters as read on download':
    'Tandai chapter dibaca saat diunduh',
  'Show only downloaded chapters': 'Tampilkan hanya chapter terunduh',
  'Show only unread chapters': 'Tampilkan hanya chapter belum dibaca',
  'Enable page read progress': 'Aktifkan progres baca halaman',
  'Skip chapter metadata feed': 'Lewati feed metadata chapter',
  'Use binary file sizes': 'Gunakan ukuran file biner',
  'CBZ media type': 'Tipe media CBZ',
  'Chapter sort order': 'Urutan chapter',
  'Items per page': 'Item per halaman',
  'Checksum method': 'Metode checksum',
  'Conflict strategy (forward)': 'Strategi konflik (maju)',
  'Conflict strategy (backward)': 'Strategi konflik (mundur)',
  'Percentage tolerance': 'Toleransi persentase',
  'Enable debug logs': 'Aktifkan log debug',
  'Clear cached pages or thumbnails stored by the server.':
    'Hapus halaman atau thumbnail ter-cache yang disimpan server.',
  'Clear selected caches': 'Hapus cache terpilih',
  'Selected image caches cleared.': 'Cache gambar terpilih dihapus.',
  'Image cache could not be cleared.':
    'Cache gambar tidak dapat dihapus.',
});

export function ServerSettingsPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <ServerSettingsContent context={state.context} />;
}

function ServerSettingsContent({ context }: { readonly context: ConnectedContext }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { disconnect } = useConnection();
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
        title={t('Server settings')}
        subtitle={t('Connection and server behavior')}
        leading={<BackButton to="/settings" label={t('Back')} />}
      />

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="server-connection">
          <div className="section-heading-row">
            <h2 id="server-connection">{t('Connection')}</h2>
            <span className="settings-badge">{t('Connected')}</span>
          </div>
          <dl className="settings-rows">
            <div>
              <dt>{t('Server')}</dt>
              <dd>{context.serverInfo.name}</dd>
            </div>
            <div>
              <dt>{t('Version')}</dt>
              <dd>
                {context.serverInfo.version} · {context.serverInfo.buildType}
              </dd>
            </div>
            <div>
              <dt>{t('Endpoint')}</dt>
              <dd className="settings-endpoint">{context.config.serverBaseUrl}</dd>
            </div>
            <div>
              <dt>{t('Authentication')}</dt>
              <dd>
                {context.authMode === 'NONE'
                  ? t('No authentication')
                  : t('UI login')}
              </dd>
            </div>
            <div>
              <dt>{t('Compatibility')}</dt>
              <dd>
                {context.compatibility.status === 'compatible'
                  ? t('Stable baseline {version}', {
                      version: context.compatibility.baseline,
                    })
                  : (context.compatibility.warning ??
                    context.compatibility.status)}
              </dd>
            </div>
          </dl>
          <div className="settings-actions">
            <button
              className="button button-secondary is-danger"
              type="button"
              onClick={() => {
                void disconnect().then(() => navigate('/', { replace: true }));
              }}
            >
              {t('Disconnect server')}
            </button>
          </div>
        </section>

        {settings.status === 'loading' && !settings.settings ? (
          <p className="library-state" role="status">
            Loading server settings…
          </p>
        ) : null}

        {settings.status === 'error' ? (
          <div className="library-state" role="alert">
            <h2>{t('Couldn’t load server settings')}</h2>
            <button className="button button-secondary" type="button" onClick={() => void controller.retry()}>
              {t('Retry')}
            </button>
          </div>
        ) : null}

        {settings.settings ? (
          <ServerSettingsForm controller={controller} settings={settings.settings} />
        ) : null}
        <ImageCacheSection context={context} />
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
  const { t } = useI18n();
  const [conversionTarget, setConversionTarget] = useState('');
  const [conversionMime, setConversionMime] = useState('image/webp');
  const update = (patch: Partial<EditableServerSettings>) => {
    void controller.update(patch);
  };

  return (
    <>
      {controller.getState().saveError ? (
        <p className="settings-inline-error" role="alert">
          {t('The server rejected the last change. The previous value is still shown.')}
        </p>
      ) : null}
      <p className="settings-save-state" role="status">
        {controller.getState().saving ? 'Saving…' : 'Changes save automatically'}
      </p>

      <section className="settings-section" aria-labelledby="server-updates">
        <div className="section-heading-row">
          <h2 id="server-updates">{t('Library updates')}</h2>
        </div>
        <div className="settings-toggle-list">
          <Toggle
            label={t('Update library automatically')}
            checked={settings.updateMangas}
            onChange={(value) => update({ updateMangas: value })}
          />
          <Toggle
            label={t('Exclude completed manga')}
            checked={settings.excludeCompleted}
            onChange={(value) => update({ excludeCompleted: value })}
          />
          <Toggle
            label={t('Exclude not-started manga')}
            checked={settings.excludeNotStarted}
            onChange={(value) => update({ excludeNotStarted: value })}
          />
          <Toggle
            label={t('Exclude manga with unread chapters')}
            checked={settings.excludeUnreadChapters}
            onChange={(value) => update({ excludeUnreadChapters: value })}
          />
          <Toggle
            label={t('Exclude entries with unread chapters')}
            checked={settings.excludeEntryWithUnreadChapters}
            onChange={(value) => update({ excludeEntryWithUnreadChapters: value })}
          />
        </div>
        <div className="settings-field-grid">
          <NumberField
            label={t('Global update interval (hours)')}
            value={settings.globalUpdateInterval}
            min={0}
            step={0.5}
            onCommit={(value) => update({ globalUpdateInterval: value })}
          />
        </div>
      </section>

      <section className="settings-section" aria-labelledby="server-downloads">
        <div className="section-heading-row">
          <h2 id="server-downloads">{t('Downloads')}</h2>
        </div>
        <div className="settings-toggle-list">
          <Toggle
            label={t('Download new chapters automatically')}
            checked={settings.autoDownloadNewChapters}
            onChange={(value) => update({ autoDownloadNewChapters: value })}
          />
          <Toggle
            label={t('Download as CBZ archive')}
            checked={settings.downloadAsCbz}
            onChange={(value) => update({ downloadAsCbz: value })}
          />
        </div>
        <div className="settings-field-grid">
          <NumberField
            label={t('Automatic download limit')}
            value={settings.autoDownloadNewChaptersLimit}
            min={0}
            step={1}
            onCommit={(value) => update({ autoDownloadNewChaptersLimit: value })}
          />
          <NumberField
            label={t('Max sources in parallel')}
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

      <section className="settings-section" aria-labelledby="server-conversions">
        <div className="section-heading-row">
          <h2 id="server-conversions">{t('Image conversions')}</h2>
        </div>
        <p className="settings-save-state">
          Convert downloaded or served images through the server.
        </p>
        <div className="settings-field-grid">
          <label className="settings-number">
            <span>Target</span>
            <input
              value={conversionTarget}
              placeholder="webp"
              onChange={(event) => setConversionTarget(event.target.value)}
            />
          </label>
          <label className="settings-number">
            <span>MIME type</span>
            <input
              value={conversionMime}
              onChange={(event) => setConversionMime(event.target.value)}
            />
          </label>
        </div>
        <div className="settings-actions">
          <button
            className="button button-secondary"
            type="button"
            disabled={!conversionTarget.trim() || !conversionMime.trim()}
            onClick={() => {
              const conversion = {
                __typename: 'SettingsDownloadConversionType' as const,
                target: conversionTarget.trim(),
                mimeType: conversionMime.trim(),
                compressionLevel: null,
              };
              update({
                downloadConversions: [...settings.downloadConversions, conversion],
              });
              setConversionTarget('');
            }}
          >
            Add download conversion
          </button>
          <button
            className="button button-secondary"
            type="button"
            disabled={!conversionTarget.trim() || !conversionMime.trim()}
            onClick={() => {
              const conversion = {
                __typename: 'SettingsDownloadConversionType' as const,
                target: conversionTarget.trim(),
                mimeType: conversionMime.trim(),
                compressionLevel: null,
              };
              update({
                serveConversions: [...settings.serveConversions, conversion],
              });
              setConversionTarget('');
            }}
          >
            Add serve conversion
          </button>
        </div>
        {(['downloadConversions', 'serveConversions'] as const).map((key) => (
          <div className="settings-rows" key={key}>
            <div>
              <dt>{key === 'downloadConversions' ? 'Download' : 'Serve'}</dt>
              <dd>
                {settings[key].length === 0 ? (
                  'None'
                ) : (
                  <ul className="conversion-list">
                    {settings[key].map((conversion, index) => (
                      <li key={`${conversion.target}-${conversion.mimeType}-${index}`}>
                        <span>
                          {conversion.target} · {conversion.mimeType}
                        </span>
                        <button
                          className="library-action"
                          type="button"
                          onClick={() =>
                            update({
                              [key]: settings[key].filter(
                                (_item, itemIndex) => itemIndex !== index,
                              ),
                            })
                          }
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </dd>
            </div>
          </div>
        ))}
      </section>

      <section className="settings-section" aria-labelledby="server-opds">
        <div className="section-heading-row">
          <h2 id="server-opds">{t('OPDS')}</h2>
        </div>
        <div className="settings-toggle-list">
          <Toggle
            label={t('Mark chapters as read on download')}
            checked={settings.opdsMarkAsReadOnDownload ?? false}
            onChange={(value) => update({ opdsMarkAsReadOnDownload: value })}
          />
          <Toggle
            label={t('Show only downloaded chapters')}
            checked={settings.opdsShowOnlyDownloadedChapters ?? false}
            onChange={(value) => update({ opdsShowOnlyDownloadedChapters: value })}
          />
          <Toggle
            label={t('Show only unread chapters')}
            checked={settings.opdsShowOnlyUnreadChapters ?? false}
            onChange={(value) => update({ opdsShowOnlyUnreadChapters: value })}
          />
          <Toggle
            label={t('Enable page read progress')}
            checked={settings.opdsEnablePageReadProgress ?? false}
            onChange={(value) => update({ opdsEnablePageReadProgress: value })}
          />
          <Toggle
            label={t('Skip chapter metadata feed')}
            checked={settings.opdsSkipChapterMetadataFeed ?? false}
            onChange={(value) => update({ opdsSkipChapterMetadataFeed: value })}
          />
          <Toggle
            label={t('Use binary file sizes')}
            checked={settings.opdsUseBinaryFileSizes ?? false}
            onChange={(value) => update({ opdsUseBinaryFileSizes: value })}
          />
        </div>
        <div className="settings-field-grid">
          <SelectField
            label={t('CBZ media type')}
            value={settings.opdsCbzMimetype ?? 'COMPATIBLE'}
            options={['MODERN', 'LEGACY', 'COMPATIBLE']}
            onChange={(value) =>
              update({ opdsCbzMimetype: value as EditableServerSettings['opdsCbzMimetype'] })
            }
          />
          <SelectField
            label={t('Chapter sort order')}
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
            label={t('Items per page')}
            value={settings.opdsItemsPerPage ?? 20}
            min={1}
            step={1}
            onCommit={(value) => update({ opdsItemsPerPage: value })}
          />
        </div>
      </section>

      <section className="settings-section" aria-labelledby="server-koreader">
        <div className="section-heading-row">
          <h2 id="server-koreader">{t('KOReader sync')}</h2>
        </div>
        <div className="settings-field-grid">
          <SelectField
            label={t('Checksum method')}
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
            label={t('Conflict strategy (forward)')}
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
            label={t('Conflict strategy (backward)')}
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
            label={t('Percentage tolerance')}
            value={settings.koreaderSyncPercentageTolerance ?? 0}
            min={0}
            step={0.1}
            onCommit={(value) => update({ koreaderSyncPercentageTolerance: value })}
          />
        </div>
      </section>

      <section className="settings-section" aria-labelledby="server-auth">
        <div className="section-heading-row">
          <h2 id="server-auth">{t('Authentication')}</h2>
        </div>
        <p className="settings-inline-warning">
          Changing authentication can require a reconnect. BASIC_AUTH uses HTTP
          Basic credentials; SIMPLE_LOGIN uses the server session; UI_LOGIN uses
          the JWT login form.
        </p>
        <div className="settings-field-grid">
          <label className="settings-select-field">
            <span>{t('Mode')}</span>
            <select
              value={settings.authMode}
              onChange={(event) =>
                update({
                  authMode: event.target
                    .value as EditableServerSettings['authMode'],
                })
              }
            >
              <option value="NONE">{t('No authentication')}</option>
              <option value="UI_LOGIN">{t('UI login')}</option>
            </select>
          </label>
          <label className="settings-text-field">
            <span>{t('Username')}</span>
            <input
              defaultValue={settings.authUsername}
              autoComplete="off"
              onBlur={(event) => update({ authUsername: event.target.value })}
            />
          </label>
          <label className="settings-text-field">
            <span>{t('Password')}</span>
            <input
              type="password"
              defaultValue={settings.authPassword}
              autoComplete="new-password"
              onBlur={(event) => update({ authPassword: event.target.value })}
            />
          </label>
        </div>
      </section>

      <section className="settings-section" aria-labelledby="server-database">
        <div className="section-heading-row">
          <h2 id="server-database">{t('Database')}</h2>
        </div>
        <div className="settings-field-grid">
          <label className="settings-select-field">
            <span>{t('Type')}</span>
            <select
              value={settings.databaseType}
              onChange={(event) =>
                update({
                  databaseType: event.target
                    .value as EditableServerSettings['databaseType'],
                })
              }
            >
              <option value="H2">H2</option>
              <option value="POSTGRESQL">PostgreSQL</option>
            </select>
          </label>
          <label className="settings-text-field">
            <span>{t('URL')}</span>
            <input
              defaultValue={settings.databaseUrl}
              autoComplete="off"
              onBlur={(event) => update({ databaseUrl: event.target.value })}
            />
          </label>
          <label className="settings-text-field">
            <span>{t('Username')}</span>
            <input
              defaultValue={settings.databaseUsername}
              autoComplete="off"
              onBlur={(event) =>
                update({ databaseUsername: event.target.value })
              }
            />
          </label>
          <label className="settings-text-field">
            <span>{t('Password')}</span>
            <input
              type="password"
              defaultValue={settings.databasePassword}
              autoComplete="new-password"
              onBlur={(event) =>
                update({ databasePassword: event.target.value })
              }
            />
          </label>
        </div>
      </section>

      <section className="settings-section" aria-labelledby="server-system">
        <div className="section-heading-row">
          <h2 id="server-system">{t('System')}</h2>
        </div>
        <div className="settings-toggle-list">
          <Toggle
            label={t('Enable debug logs')}
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
        </dl>
      </section>

      <section className="settings-section" aria-labelledby="server-webui">
        <div className="section-heading-row">
          <h2 id="server-webui">{t('WebUI')}</h2>
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

function ImageCacheSection({ context }: { readonly context: ConnectedContext }) {
  const { t } = useI18n();
  const [cachedPages, setCachedPages] = useState(true);
  const [cachedThumbnails, setCachedThumbnails] = useState(true);
  const [downloadedThumbnails, setDownloadedThumbnails] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const clear = () => {
    if (!cachedPages && !cachedThumbnails && !downloadedThumbnails) {
      return;
    }

    setBusy(true);
    setFailed(false);
    setMessage(null);
    const repository = createServerSettingsRepository({
      getClient: () => context.graphQL,
    });

    void repository
      .clearCachedImages({
        cachedPages,
        cachedThumbnails,
        downloadedThumbnails,
      })
      .then(() => setMessage(t('Selected image caches cleared.')))
      .catch(() => setFailed(true))
      .finally(() => setBusy(false));
  };

  return (
    <section className="settings-section" aria-labelledby="server-image-cache">
      <div className="section-heading-row">
        <h2 id="server-image-cache">{t('Image cache')}</h2>
      </div>
      <p className="settings-save-state">
        {t('Clear cached pages or thumbnails stored by the server.')}
      </p>
      <div className="settings-toggle-list">
        <label className="settings-toggle">
          <span>{t('Cached pages')}</span>
          <input
            type="checkbox"
            checked={cachedPages}
            disabled={busy}
            onChange={(event) => setCachedPages(event.target.checked)}
          />
        </label>
        <label className="settings-toggle">
          <span>{t('Cached thumbnails')}</span>
          <input
            type="checkbox"
            checked={cachedThumbnails}
            disabled={busy}
            onChange={(event) => setCachedThumbnails(event.target.checked)}
          />
        </label>
        <label className="settings-toggle">
          <span>{t('Downloaded thumbnails')}</span>
          <input
            type="checkbox"
            checked={downloadedThumbnails}
            disabled={busy}
            onChange={(event) => setDownloadedThumbnails(event.target.checked)}
          />
        </label>
      </div>
      <div className="settings-actions">
        <button
          className="button"
          type="button"
          disabled={
            busy ||
            (!cachedPages && !cachedThumbnails && !downloadedThumbnails)
          }
          onClick={clear}
        >
          {busy ? t('Saving…') : t('Clear selected caches')}
        </button>
      </div>
      {message ? (
        <p className="settings-save-state" role="status">
          {message}
        </p>
      ) : null}
      {failed ? (
        <p className="settings-inline-error" role="alert">
          {t('Image cache could not be cleared.')}
        </p>
      ) : null}
    </section>
  );
}

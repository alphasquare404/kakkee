import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import type { ConnectedContext } from '../../core/server/connectionCoordinator';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  Settings: 'Pengaturan',
  'Application and server information': 'Informasi aplikasi dan server',
  Connection: 'Koneksi',
  Manage: 'Kelola',
  Connected: 'Terhubung',
  Server: 'Server',
  Version: 'Versi',
  Endpoint: 'Endpoint',
  Authentication: 'Autentikasi',
  'No authentication': 'Tanpa autentikasi',
  'UI login': 'Login UI',
  Compatibility: 'Kompatibilitas',
  'Stable baseline {version}': 'Baseline stabil {version}',
  Appearance: 'Tampilan',
  'Theme, accent, and layout': 'Tema, aksen, dan tata letak',
  Library: 'Perpustakaan',
  'Density, badges, and continue reading':
    'Kepadatan, badge, dan lanjut membaca',
  Reading: 'Membaca',
  'Reader modes, filters, and profiles': 'Mode, filter, dan profil Reader',
  'Server & data': 'Server & data',
  'Server settings': 'Pengaturan server',
  'Authentication, database, OPDS, and KOReader':
    'Autentikasi, database, OPDS, dan KOReader',
  'Backup & restore': 'Cadangan & pemulihan',
  'Schedule, retention, and restore': 'Jadwal, retensi, dan pemulihan',
  Tracking: 'Tracking',
  'Services, binding, and score sync': 'Layanan, binding, dan sinkronisasi skor',
  Sync: 'Sinkronisasi',
  'Yomi, interval, and data selection': 'Yomi, interval, dan pilihan data',
  History: 'Riwayat',
  'Retention and client hide-read': 'Retensi dan sembunyikan yang dibaca',
  'Device & about': 'Perangkat & tentang',
  'Device info': 'Info perangkat',
  'Network, storage, and browser capabilities':
    'Jaringan, penyimpanan, dan kemampuan browser',
  'About & updates': 'Tentang & update',
  'Version, WebUI channel, and updates': 'Versi, channel WebUI, dan update',
  'Disconnect server': 'Putuskan server',
  'Manage settings': 'Kelola pengaturan',
});

const DIRECTORY = [
  {
    group: 'Experience',
    items: [
      {
        to: '/settings/appearance',
        title: 'Appearance',
        description: 'Theme, accent, and layout',
      },
      {
        to: '/settings/library',
        title: 'Library',
        description: 'Density, badges, and continue reading',
      },
      {
        to: '/settings/reader',
        title: 'Reading',
        description: 'Reader modes, filters, and profiles',
      },
    ],
  },
  {
    group: 'Server & data',
    items: [
      {
        to: '/settings/server',
        title: 'Server settings',
        description: 'Authentication, database, OPDS, and KOReader',
      },
      {
        to: '/settings/backup',
        title: 'Backup & restore',
        description: 'Schedule, retention, and restore',
      },
      {
        to: '/settings/tracking',
        title: 'Tracking',
        description: 'Services, binding, and score sync',
      },
      {
        to: '/settings/sync',
        title: 'Sync',
        description: 'Yomi, interval, and data selection',
      },
      {
        to: '/settings/history',
        title: 'History',
        description: 'Retention and client hide-read',
      },
    ],
  },
  {
    group: 'Device & about',
    items: [
      {
        to: '/settings/device',
        title: 'Device info',
        description: 'Network, storage, and browser capabilities',
      },
      {
        to: '/about',
        title: 'About & updates',
        description: 'Version, WebUI channel, and updates',
      },
    ],
  },
] as const;

export function SettingsPage() {
  const { state } = useConnection();

  if (state.status !== 'connected') {
    return null;
  }

  return <SettingsContent context={state.context} />;
}

function SettingsContent({ context }: { readonly context: ConnectedContext }) {
  const { t } = useI18n();
  const { disconnect } = useConnection();
  const navigate = useNavigate();
  const location = useLocation();
  const activeAnchor = location.hash.replace(/^#/, '') || 'connection';

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader
        title={t('Settings')}
        subtitle={t('Application and server information')}
      />

      <div className="settings-layout">
        <nav className="settings-nav" aria-label={t('Settings')}>
          <a
            className={activeAnchor === 'connection' ? 'is-active' : undefined}
            href="#connection"
          >
            {t('Connection')}
          </a>
          <a
            className={activeAnchor === 'manage' ? 'is-active' : undefined}
            href="#manage"
          >
            {t('Manage')}
          </a>
        </nav>

        <div className="settings-content">
          <section
            className="settings-section"
            id="connection"
            aria-labelledby="settings-connection"
          >
            <div className="section-heading-row">
              <h2 id="settings-connection">{t('Connection')}</h2>
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

          <section
            className="settings-section settings-directory"
            id="manage"
            aria-labelledby="settings-manage"
          >
            <div className="section-heading-row">
              <h2 id="settings-manage">{t('Manage settings')}</h2>
            </div>
            {DIRECTORY.map((group) => (
              <div className="settings-directory-group" key={group.group}>
                <h3>{t(group.group)}</h3>
                <div className="settings-directory-grid">
                  {group.items.map((item) => (
                    <Link
                      className="settings-directory-link"
                      key={item.to}
                      to={item.to}
                    >
                      <strong>{t(item.title)}</strong>
                      <span>{t(item.description)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}

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
  Appearance: 'Tampilan',
  Reading: 'Membaca',
  About: 'Tentang',
  Connected: 'Terhubung',
  Server: 'Server',
  Version: 'Versi',
  Endpoint: 'Endpoint',
  Authentication: 'Autentikasi',
  'No authentication': 'Tanpa autentikasi',
  'UI login': 'Login UI',
  Compatibility: 'Kompatibilitas',
  'Stable baseline {version}': 'Baseline stabil {version}',
  'Server settings': 'Pengaturan server',
  'Backup settings': 'Pengaturan cadangan',
  'Tracking settings': 'Pengaturan tracking',
  'Sync settings': 'Pengaturan sinkronisasi',
  'History settings': 'Pengaturan riwayat',
  'Device info': 'Info perangkat',
  'About & updates': 'Tentang & update',
  'Disconnect server': 'Putuskan server',
  Theme: 'Tema',
  'Cinematic dark': 'Gelap sinematik',
  Accent: 'Aksen',
  'Blue-violet': 'Biru-ungu',
  Layout: 'Tata letak',
  'Responsive with desktop navigation and mobile tab bar':
    'Responsif dengan navigasi desktop dan bilah tab seluler',
  'Appearance settings': 'Pengaturan tampilan',
  Library: 'Perpustakaan',
  'Grid density': 'Kepadatan grid',
  'Compact or comfortable poster grid': 'Grid poster ringkas atau nyaman',
  Selection: 'Seleksi',
  'Bulk category assignment and library removal':
    'Penetapan kategori massal dan penghapusan dari perpustakaan',
  'Library settings': 'Pengaturan perpustakaan',
  'Reader mode': 'Mode reader',
  'Vertical continuous': 'Vertikal berkelanjutan',
  'Page loading': 'Pemuatan halaman',
  'Lazy, authenticated through ResourceService':
    'Lazy, terautentikasi melalui ResourceService',
  'Progress sync': 'Sinkronisasi progres',
  'Last page and read state are written when you read':
    'Halaman terakhir dan status baca ditulis saat Anda membaca',
  'Reader settings': 'Pengaturan reader',
  Application: 'Aplikasi',
  'API baseline': 'Baseline API',
  'Server platform': 'Platform server',
});

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
          <a className={activeAnchor === 'connection' ? 'is-active' : undefined} href="#connection">{t('Connection')}</a>
          <a className={activeAnchor === 'appearance' ? 'is-active' : undefined} href="#appearance">{t('Appearance')}</a>
          <a className={activeAnchor === 'library' ? 'is-active' : undefined} href="#library">{t('Library')}</a>
          <a className={activeAnchor === 'reading' ? 'is-active' : undefined} href="#reading">{t('Reading')}</a>
          <a className={activeAnchor === 'about' ? 'is-active' : undefined} href="#about">{t('About')}</a>
        </nav>

        <div className="settings-content">
          <section className="settings-section" id="connection" aria-labelledby="settings-connection">
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
                <dd>{context.serverInfo.version} · {context.serverInfo.buildType}</dd>
              </div>
              <div>
                <dt>{t('Endpoint')}</dt>
                <dd className="settings-endpoint">{context.config.serverBaseUrl}</dd>
              </div>
              <div>
                <dt>{t('Authentication')}</dt>
                <dd>{context.authMode === 'NONE' ? t('No authentication') : t('UI login')}</dd>
              </div>
              <div>
                <dt>{t('Compatibility')}</dt>
                <dd>
                  {context.compatibility.status === 'compatible'
                    ? t('Stable baseline {version}', {
                        version: context.compatibility.baseline,
                      })
                    : context.compatibility.warning ?? context.compatibility.status}
                </dd>
              </div>
            </dl>
            <div className="settings-actions">
              <Link className="button button-secondary" to="/settings/server">
                {t('Server settings')}
              </Link>
              <Link className="button button-secondary" to="/settings/backup">
                {t('Backup settings')}
              </Link>
              <Link className="button button-secondary" to="/settings/tracking">
                {t('Tracking settings')}
              </Link>
              <Link className="button button-secondary" to="/settings/sync">
                {t('Sync settings')}
              </Link>
              <Link className="button button-secondary" to="/settings/history">
                {t('History settings')}
              </Link>
              <Link className="button button-secondary" to="/settings/device">
                {t('Device info')}
              </Link>
              <Link className="button button-secondary" to="/about">
                {t('About & updates')}
              </Link>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => {
                  void disconnect().then(() => navigate('/', { replace: true }));
                }}
              >
                {t('Disconnect server')}
              </button>
            </div>
          </section>

          <section className="settings-section" id="appearance" aria-labelledby="settings-appearance">
            <div className="section-heading-row">
              <h2 id="settings-appearance">{t('Appearance')}</h2>
            </div>
            <dl className="settings-rows">
              <div>
                <dt>{t('Theme')}</dt>
                <dd>{t('Cinematic dark')}</dd>
              </div>
              <div>
                <dt>{t('Accent')}</dt>
                <dd>
                  <span className="settings-swatch" aria-hidden="true" />
                  {t('Blue-violet')}
                </dd>
              </div>
              <div>
                <dt>{t('Layout')}</dt>
                <dd>{t('Responsive with desktop navigation and mobile tab bar')}</dd>
              </div>
            </dl>
            <div className="settings-actions">
              <Link className="button button-secondary" to="/settings/appearance">
                {t('Appearance settings')}
              </Link>
            </div>
          </section>

          <section className="settings-section" id="library" aria-labelledby="settings-library">
            <div className="section-heading-row">
              <h2 id="settings-library">{t('Library')}</h2>
            </div>
            <dl className="settings-rows">
              <div>
                <dt>{t('Grid density')}</dt>
                <dd>{t('Compact or comfortable poster grid')}</dd>
              </div>
              <div>
                <dt>{t('Selection')}</dt>
                <dd>{t('Bulk category assignment and library removal')}</dd>
              </div>
            </dl>
            <div className="settings-actions">
              <Link className="button button-secondary" to="/settings/library">
                {t('Library settings')}
              </Link>
            </div>
          </section>

          <section className="settings-section" id="reading" aria-labelledby="settings-reading">
            <div className="section-heading-row">
              <h2 id="settings-reading">{t('Reading')}</h2>
            </div>
            <dl className="settings-rows">
              <div>
                <dt>{t('Reader mode')}</dt>
                <dd>{t('Vertical continuous')}</dd>
              </div>
              <div>
                <dt>{t('Page loading')}</dt>
                <dd>{t('Lazy, authenticated through ResourceService')}</dd>
              </div>
              <div>
                <dt>{t('Progress sync')}</dt>
                <dd>{t('Last page and read state are written when you read')}</dd>
              </div>
            </dl>
            <div className="settings-actions">
              <Link className="button button-secondary" to="/settings/reader">
                {t('Reader settings')}
              </Link>
            </div>
          </section>

          <section className="settings-section" id="about" aria-labelledby="settings-about">
            <div className="section-heading-row">
              <h2 id="settings-about">{t('About')}</h2>
            </div>
            <dl className="settings-rows">
              <div>
                <dt>{t('Application')}</dt>
                <dd>Suwayomi React Frontend</dd>
              </div>
              <div>
                <dt>{t('API baseline')}</dt>
                <dd>Suwayomi Server stable v2.4.2366</dd>
              </div>
              <div>
                <dt>{t('Server platform')}</dt>
                <dd>
                  {context.serverInfo.platformInfo.os.name} ·{' '}
                  {context.serverInfo.platformInfo.jvm.javaVersion}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

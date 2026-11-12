import { Link } from 'react-router-dom';
import { useConnection } from '../../app/useConnection';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';

registerMessages('id', {
  Settings: 'Pengaturan',
  'Preferences and server management': 'Preferensi dan pengelolaan server',
  Appearance: 'Tampilan',
  'Theme, accent, and layout': 'Tema, aksen, dan tata letak',
  Library: 'Perpustakaan',
  'Density, badges, and continue reading':
    'Kepadatan, badge, dan lanjut membaca',
  Categories: 'Kategori',
  'Organize your library': 'Atur perpustakaan Anda',
  Reading: 'Membaca',
  'Reader modes, filters, and profiles': 'Mode, filter, dan profil Reader',
  'Server & data': 'Server & data',
  'Server settings': 'Pengaturan server',
  'Connection, authentication, database, OPDS, and KOReader':
    'Koneksi, autentikasi, database, OPDS, dan KOReader',
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
  'Settings directory': 'Daftar pengaturan',
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
        to: '/settings/categories',
        title: 'Categories',
        description: 'Organize your library',
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
        description: 'Connection, authentication, database, OPDS, and KOReader',
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

  return <SettingsContent />;
}

function SettingsContent() {
  const { t } = useI18n();

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader
        title={t('Settings')}
        subtitle={t('Preferences and server management')}
      />

      <div className="settings-content">
        <section
          className="settings-section settings-directory"
          aria-labelledby="settings-directory"
        >
          <div className="section-heading-row">
            <h2 id="settings-directory">{t('Settings directory')}</h2>
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
  );
}

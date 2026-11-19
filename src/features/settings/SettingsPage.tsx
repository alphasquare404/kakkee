import { useEffect, useMemo, useState } from 'react';
import {
  updateNsfwPreferences,
  useNsfwPreferences,
} from '../../core/preferences/nsfwPreferences';
import { Link } from 'react-router-dom';
import { GhostIcon } from '../../shared/GhostIcon';
import { setGhostMode, useGhostMode } from '../../core/preferences/ghostMode';
import { useConnection } from '../../app/useConnection';
import { createNsfwDefaultRepository } from '../../core/preferences/nsfwDefault';
import { PageHeader } from '../../shared/PageHeader';
import { useI18n } from '../../shared/useI18n';
import { registerMessages } from '../../shared/i18n';
import {
  IconDownload,
  IconFilter,
  IconGrid,
  IconInfo,
  IconList,
  IconSearch,
  IconSync,
} from '../library/icons';

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
  'Settings sections': 'Bagian pengaturan',
  'Hide NSFW': 'Sembunyikan NSFW',
  'Show NSFW': 'Tampilkan NSFW',
  'SFW mode': 'Mode SFW',
  'NSFW mode': 'Mode NSFW',
  'Ghost mode': 'Mode ghost',
  'Ghost Mode Activated': 'Mode Ghost Aktif',
  'Ghost Mode Deactivated': 'Mode Ghost Nonaktif',
});

const DIRECTORY = [
  {
    group: 'Experience',
    items: [
      {
        to: '/settings/appearance',
        title: 'Appearance',
        description: 'Theme, accent, and layout',
        icon: IconGrid,
      },
      {
        to: '/settings/library',
        title: 'Library',
        description: 'Density, badges, and continue reading',
        icon: IconList,
      },
      {
        to: '/settings/categories',
        title: 'Categories',
        description: 'Organize your library',
        icon: IconFilter,
      },
      {
        to: '/settings/reader',
        title: 'Reading',
        description: 'Reader modes, filters, and profiles',
        icon: IconSearch,
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
        icon: IconInfo,
      },
      {
        to: '/settings/backup',
        title: 'Backup & restore',
        description: 'Schedule, retention, and restore',
        icon: IconDownload,
      },
      {
        to: '/settings/tracking',
        title: 'Tracking',
        description: 'Services, binding, and score sync',
        icon: IconSync,
      },
      {
        to: '/settings/sync',
        title: 'Sync',
        description: 'Yomi, interval, and data selection',
        icon: IconSync,
      },
      {
        to: '/settings/history',
        title: 'History',
        description: 'Retention and client hide-read',
        icon: IconList,
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
        icon: IconInfo,
      },
      {
        to: '/about',
        title: 'About & updates',
        description: 'Version, WebUI channel, and updates',
        icon: IconInfo,
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
  const { state } = useConnection();
  const { t } = useI18n();
  const nsfwDefaultRepository = useMemo(
    () =>
      state.status === 'connected'
        ? createNsfwDefaultRepository({ getClient: () => state.context.graphQL })
        : null,
    [state],
  );
  const base = import.meta.env.BASE_URL;
  const [activeGroup, setActiveGroup] = useState<string>(DIRECTORY[0].group);
  const nsfw = useNsfwPreferences();
  const ghostMode = useGhostMode();
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);

  const toggleGhostMode = () => {
    const next = !ghostMode;
    setGhostMode(next);
    setSettingsNotice(
      next ? 'Ghost Mode Activated' : 'Ghost Mode Deactivated',
    );
  };

  const toggleNsfwMode = () => {
    const next = !nsfw.hideNsfw;
    updateNsfwPreferences({ hideNsfw: next });
    void nsfwDefaultRepository?.setDefault(next).catch(() => undefined);
    setSettingsNotice(
      next ? 'NSFW Mode Deactivated' : 'NSFW Mode Activated',
    );
  };

  useEffect(() => {
    if (!settingsNotice) {
      return;
    }

    const timer = window.setTimeout(() => setSettingsNotice(null), 3_200);
    return () => window.clearTimeout(timer);
  }, [settingsNotice]);

  return (
    <div className="app-shell page-shell settings-shell">
      <PageHeader
        title={t('Settings')}
        subtitle={t('Preferences and server management')}
      >
        <button
          className={`settings-nsfw-action${!nsfw.hideNsfw ? ' is-active' : ''}`}
          type="button"
          aria-label={nsfw.hideNsfw ? t('SFW mode') : t('NSFW mode')}
          title={nsfw.hideNsfw ? t('SFW mode') : t('NSFW mode')}
          aria-pressed={!nsfw.hideNsfw}
          onClick={toggleNsfwMode}
        >
          <span
            className="settings-mode-icon"
            aria-hidden="true"
            style={{
              maskImage: `url("${base}icons/${
                nsfw.hideNsfw ? 'sfw-mode-mask.png' : 'nsfw-mode-mask.png'
              }")`,
              WebkitMaskImage: `url("${base}icons/${
                nsfw.hideNsfw ? 'sfw-mode-mask.png' : 'nsfw-mode-mask.png'
              }")`,
            }}
          />
        </button>
        <button
          className={`settings-ghost-action${ghostMode ? ' is-active' : ''}`}
          type="button"
          aria-label={t('Ghost mode')}
          title={t('Ghost mode')}
          aria-pressed={ghostMode}
          onClick={toggleGhostMode}
        >
          <GhostIcon />
        </button>
      </PageHeader>

      {settingsNotice ? (
        <div className="ghost-mode-notice" role="status" aria-live="polite">
          {settingsNotice}
        </div>
      ) : null}

      <div className="settings-content settings-directory-content">
        <section className="settings-section settings-directory">
          <nav
            className="category-tabs settings-tabs"
            aria-label={t('Settings sections')}
          >
            {DIRECTORY.map((group) => (
              <button
                className="category-tab"
                type="button"
                aria-pressed={activeGroup === group.group}
                key={group.group}
                onClick={() => setActiveGroup(group.group)}
              >
                {t(group.group)}
              </button>
            ))}
          </nav>

          {DIRECTORY.map((group) => {
            const selected = activeGroup === group.group;

            return (
              <div
                className="settings-directory-group"
                hidden={!selected}
                key={group.group}
              >
                <h3>{t(group.group)}</h3>
                <div className="settings-directory-grid">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        className="settings-directory-link"
                        key={item.to}
                        to={item.to}
                      >
                        <span className="settings-directory-icon" aria-hidden="true">
                          <Icon />
                        </span>
                        <span className="settings-directory-copy">
                          <strong>{t(item.title)}</strong>
                          <span>{t(item.description)}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

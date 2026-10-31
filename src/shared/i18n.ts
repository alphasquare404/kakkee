import type { Locale } from '../core/preferences/appPreferences';

type MessageKey =
  | 'nav.library'
  | 'nav.updates'
  | 'nav.browse'
  | 'nav.search'
  | 'nav.extensions'
  | 'nav.categories'
  | 'nav.history'
  | 'nav.downloads'
  | 'nav.settings'
  | 'common.allSettings'
  | 'appearance.title'
  | 'appearance.subtitle'
  | 'appearance.theme'
  | 'appearance.language'
  | 'appearance.languageHint';

const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
  en: {
    'nav.library': 'Library',
    'nav.updates': 'Updates',
    'nav.browse': 'Browse',
    'nav.search': 'Search',
    'nav.extensions': 'Extensions',
    'nav.categories': 'Categories',
    'nav.history': 'History',
    'nav.downloads': 'Downloads',
    'nav.settings': 'Settings',
    'common.allSettings': 'All settings',
    'appearance.title': 'Appearance',
    'appearance.subtitle': 'Theme and application surface',
    'appearance.theme': 'Theme',
    'appearance.language': 'Language',
    'appearance.languageHint': 'Interface language for translated screens',
  },
  id: {
    'nav.library': 'Perpustakaan',
    'nav.updates': 'Update',
    'nav.browse': 'Jelajah',
    'nav.search': 'Cari',
    'nav.extensions': 'Ekstensi',
    'nav.categories': 'Kategori',
    'nav.history': 'Riwayat',
    'nav.downloads': 'Unduhan',
    'nav.settings': 'Pengaturan',
    'common.allSettings': 'Semua pengaturan',
    'appearance.title': 'Tampilan',
    'appearance.subtitle': 'Tema dan permukaan aplikasi',
    'appearance.theme': 'Tema',
    'appearance.language': 'Bahasa',
    'appearance.languageHint': 'Bahasa antarmuka untuk layar yang sudah diterjemahkan',
  },
};

export function translate(locale: Locale, key: MessageKey): string {
  return MESSAGES[locale][key] ?? MESSAGES.en[key];
}

export type { MessageKey };

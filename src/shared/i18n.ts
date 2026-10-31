import type { Locale } from '../core/preferences/appPreferences';

const EN: Record<string, string> = {
  'nav.library': 'Library',
  'nav.updates': 'Updates',
  'nav.browse': 'Browse',
  'nav.search': 'Search',
  'nav.extensions': 'Extensions',
  'nav.categories': 'Categories',
  'nav.history': 'History',
  'nav.downloads': 'Downloads',
  'nav.settings': 'Settings',
  'nav.more': 'More',
  'common.allSettings': 'All settings',
  'appearance.title': 'Appearance',
  'appearance.subtitle': 'Theme and application surface',
  'appearance.theme': 'Theme',
  'appearance.language': 'Language',
  'appearance.languageHint': 'Interface language for translated screens',
};

const ID: Record<string, string> = {
  'nav.library': 'Perpustakaan',
  'nav.updates': 'Update',
  'nav.browse': 'Jelajah',
  'nav.search': 'Cari',
  'nav.extensions': 'Ekstensi',
  'nav.categories': 'Kategori',
  'nav.history': 'Riwayat',
  'nav.downloads': 'Unduhan',
  'nav.settings': 'Pengaturan',
  'nav.more': 'Lainnya',
  'common.allSettings': 'Semua pengaturan',
  'appearance.title': 'Tampilan',
  'appearance.subtitle': 'Tema dan permukaan aplikasi',
  'appearance.theme': 'Tema',
  'appearance.language': 'Bahasa',
  'appearance.languageHint': 'Bahasa antarmuka untuk layar yang sudah diterjemahkan',
};

export type MessageKey = string;

export function translate(
  locale: Locale,
  key: MessageKey,
  params?: Readonly<Record<string, string | number>>,
): string {
  const dictionary = locale === 'id' ? ID : EN;
  let value = dictionary[key] ?? EN[key] ?? key;

  if (params) {
    for (const [name, replacement] of Object.entries(params)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
  }

  return value;
}

export function registerMessages(
  locale: Locale,
  messages: Readonly<Record<string, string>>,
): void {
  Object.assign(locale === 'id' ? ID : EN, messages);
}

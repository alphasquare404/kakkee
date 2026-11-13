# Snow White visual audit

Tanggal: 14 November 2026

## Cakupan

Audit dilakukan pada 390×844, 820×1180, 1180×820, 1366×768, dan
1920×1080 untuk halaman Reading/Updates, History, Downloads, Extensions,
Library, dan seluruh subpage Settings.

## Perbaikan

- Reading/Updates dan History memakai card penuh; tombol read, detail, dan
  menu More berada di dalam card yang sama.
- Judul dan chapter feed memakai `var(--text)` sehingga terbaca pada Snow
  White.
- Tombol Browse library dihapus dari empty state Downloads.
- Downloaded chapter dan queue row memakai card sendiri; action download/delete
  berada di dalam card.
- Search box Library, Browse, Search, Extensions, Source, dan filter drawer
  memakai surface tema.
- Sort menu Library memakai surface tema dan tetap terbaca.
- Checkbox/radio memakai `accent-color: var(--accent)`.
- Extension card memakai surface tema.
- Device Downloaded Library memakai aksen; hover memakai aksen yang lebih
  gelap dan teks memiliki kontras.
- Settings directory tidak lagi memiliki heading duplikat; kartu memakai
  surface yang sama dengan tema.
- Appearance: preview Snow White selalu terlihat, accent rows dan Display
  mengikuti surface tema.
- Grid density preview dibatasi 3.2rem sehingga tidak lagi keluar dari card.
- Tracker card dan Category card memakai surface tema.
- Seluruh halaman diaudit tanpa horizontal overflow pada lima viewport.

## Bukti

- `visual-audit/fixed-updates-snow-1280.png`
- `visual-audit/fixed-updates-snow-390.png`
- `visual-audit/fixed-history-snow-1280.png`
- `visual-audit/fixed-history-snow-390.png`
- `visual-audit/fixed-downloads-snow-1280.png`
- `visual-audit/fixed-downloads-snow-390.png`
- `visual-audit/fixed-downloads-device-snow-1280.png`
- `visual-audit/fixed-extensions-snow-1280.png`
- `visual-audit/fixed-extensions-snow-390.png`
- `visual-audit/fixed-settings-snow-1280.png`
- `visual-audit/fixed-settings-snow-390.png`
- `visual-audit/fixed-appearance-snow-1280.png`
- `visual-audit/fixed-appearance-snow-390.png`
- `visual-audit/fixed-library-settings-snow-1280.png`
- `visual-audit/fixed-library-settings-snow-390.png`
- `visual-audit/fixed-library-sort-snow-1280.png`
- `visual-audit/audit-tracking-snow-fixed-390.png`
- `visual-audit/audit-categories-snow-fixed-390.png`

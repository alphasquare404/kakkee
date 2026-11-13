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


## Detail and hover pass

- Detail no longer renders the blurred cover ambient or the top gradient overlay;
  the page uses the theme background with a contained hero surface on desktop.
- Mobile detail restores the back, bookmark, and More controls as readable
  contrast pills over the cover.
- Chapter play markers use theme surfaces instead of a dark fixed circle.
- Library card hover no longer lifts the card or brightens the image; buttons no
  longer apply a hover brightness filter.
- Collapsed 761–1100px sidebar uses the K mark at 1.9rem instead of clipping the
  full wordmark.
- Verified detail at 1920×1080, 1366×768, 1180×820, 820×1180, and 390×844.

## Final detail pass

- Downloaded/read card hover no longer leaves a white row inside a gray shell.
  The row background is transparent so the whole card hovers together.
- Desktop chapter list is contained in a bordered surface card; rows keep only
  separators and their play marker.
- Overview is split into surface cards for Synopsis, Details, Tags, Tracking,
  Notes, and Reader override. Synopsis text uses normal theme text and tag chips
  use the theme surface.
- Verified chapter and overview layouts at all five target viewports.

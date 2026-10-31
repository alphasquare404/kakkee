# UI consistency audit

Tanggal: 1 November 2026  
Status: **Goal 4 complete**  
Cakupan: tombol, icon button, menu, dropdown, chip/filter, badge, tab, card, section, hover/pressed/selected/focus/disabled, empty/error state.

## Prinsip

Konsistensi bukan berarti semua layar identik. Yang harus setara:

- konsep yang sama memakai treatment yang sama;
- aksi berisiko memakai bahasa visual berisiko;
- state aktif dapat dikenali tanpa menebak;
- keyboard focus selalu terlihat;
- label dan pola interaksi tidak berganti-ganti tanpa alasan.

## Temuan

### 1. Dua pola jumlah filter

**Sebelum:** Library memakai badge angka; Source memakai teks `Filters (2)`.  
**Sesudah:** keduanya memakai badge angka dan accessible name eksplisit `Filters, 2 active`.  
**Root cause:** dua fitur dikembangkan pada waktu berbeda.

### 2. Aksi destruktif tampil netral

**Sebelum:**

- `Uninstall` extension memakai tombol secondary biasa;
- `Cancel series` dan `Remove` store memakai `library-action` netral;
- `Delete` kategori hanya berwarna danger di dalam menu.

**Sesudah:**

- `Uninstall` memakai `button-secondary is-danger`;
- `Cancel series` dan `Remove` store memakai `library-action is-danger`;
- `.button.is-danger` dan `.button-secondary.is-danger` memiliki border/color danger yang konsisten;
- hover danger tidak berubah menjadi accent.

### 3. Focus state tidak konsisten pada komponen baru

Komponen drawer/filter (`filter-option`, checkbox, source search), `ActionMenu` summary, dan category overflow belum punya focus style eksplisit.

**Sesudah:** semua memakai `outline: 2px solid var(--accent)` dengan offset, sama seperti menu item dan tab.

### 4. Badge dan count

- `category-tab-count`, `library-action-count`, dan `settings-badge` tetap berbeda karena konteksnya berbeda (tab, tombol, status).
- `library-action-count` sekarang dipakai di Library Filter dan Source Filters.
- `read` state memakai `aria-pressed` konsisten pada chapter row dan Updates.

### 5. Label aksi yang mirip navigasi

- `Prev` tidak lagi menjadi tombol teks di row; menjadi item overflow `Mark earlier as read`.
- `Read` adalah state toggle dengan `aria-pressed`, bukan dua tombol state+action.

### 6. Pola menu

- Menu Library/Sort memakai `LibraryMenu` dengan roving focus.
- Menu overflow memakai `ActionMenu` dengan Escape/outside click/focus return.
- Category memakai `ActionMenu` dengan trigger yang mengikuti ukuran tombol kartu.
- Filter memakai `FilterDrawer` modal, bukan menu.
- Ini tetap berbeda karena konteksnya berbeda (menu kecil vs dialog filter), tetapi semua punya close, focus, dan trigger return.

## Matriks konsistensi

| Pattern | Canonical treatment | Exception yang dibenarkan |
| --- | --- | --- |
| Primary button | `.button` | Hero Manga memakai `.detail-primary` |
| Secondary button | `.button-secondary` | Compact toolbar memakai `.library-action` |
| Icon-only | `aria-label` + ukuran minimal | Chapter actions lebih kecil karena density |
| Destructive | `is-danger` atau `.button-danger` | Delete confirmation memakai `button-danger` |
| Active filter | `aria-pressed` + accent | Drawer memakai checkbox native |
| Active tab | `aria-current`/`aria-pressed` + underline | Category tab memakai count |
| Overflow | `ActionMenu` | Chapter row memakai trigger `⋯` |
| Filter surface | `FilterDrawer` | Sort tetap `LibraryMenu` karena hanya 2 pilihan |
| Empty state | `.library-state` atau pesan ringkas | Feed empty memakai heading + copy |
| Error | `role=alert` + pesan manusiawi | Detail teknis tidak ditampilkan |

## Sisa concerns

1. Beberapa empty/error state masih memakai class berbeda (`library-state`, `settings-inline-error`, `alert alert-error`). Goal 9/10 akan menyeragamkan treatment tanpa menyamakan konteks.
2. Pluralisasi `1 chapters`, `1 manga` belum konsisten. Goal 17.
3. Beberapa tombol kecil di category/chapter memakai ukuran berbeda; touch target diperiksa Goal 11.
4. `alert alert-error` dan `settings-inline-error` punya warna yang sama tetapi struktur berbeda; disatukan bila polanya benar-benar sama.
5. Focus trap `FilterDrawer` sudah ada; menu `ActionMenu` bukan modal sehingga Tab keluar secara native.

## Validasi

- `typecheck`, `lint`.
- Browser review setelah build Goal 4/5.

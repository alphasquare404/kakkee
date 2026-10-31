# Content and copy audit

Tanggal: 1 November 2026  
Status: **Goal 17 complete**

## Prinsip

- Copy menjelaskan aksi, bukan implementasi.
- Istilah yang sama untuk konsep yang sama.
- Error tidak menampilkan detail mentah.
- Plural dan state tidak ambigu.
- Istilah upstream yang sudah dikenal dipertahankan bila menggantinya menimbulkan kebingungan.

## Temuan dan perbaikan

### 1. Mojibake di source

Banyak string user-facing masih mengandung encoding rusak:

```text
â€¦  â€™  Â·  Loadingâ€¦  Couldnâ€™t  Checkingâ€¦
```

Diperbaiki di:

- SourceMangaPage;
- SourcePreferencesSection;
- CategoriesPage;
- ExtensionsPage;
- LibraryPage dan test;
- MangaTrackingSection;
- ServerSettingsPage.

Sekarang memakai `…`, `’`, `·`, `Couldn't`, `Loading…`, `Checking…`.

### 2. Pluralization

Diperbaiki untuk:

- `1 chapter` / `n chapters` (Manga Detail, Downloads, Tracking, scan result);
- `1 page` / `n pages` (Downloads, History, Reader, Updates, chapter meta);
- `1 extension` / `n extensions`.

`manga` tetap dipakai untuk singular/plural karena istilah pinjaman yang lazim.

### 3. Terminology

| Konsep | Istilah |
| --- | --- |
| Koleksi user | Library / perpustakaan |
| Katalog | Source |
| Paket server | Extension |
| Item baca | Manga |
| Status baca | Read / Unread (filter) atau Read toggle (state) |
| Keanggotaan | Add to library / In library / Remove from library |
| Unduhan server | Download |
| Unduhan perangkat | Save to device |
| Offline | Offline library / This device |

`Read` sebagai filter dan `Read` sebagai toggle dibedakan oleh konteks: filter berada di toolbar/feed filter, toggle berada di row dengan `aria-pressed`.

### 4. Browse copy

Sebelum: hero menyebut “Your server’s extensions, in one place”, padahal halaman Browse menampilkan source catalog.

Sesudah: **“Your sources, in one place.”** Deskripsi tetap menjelaskan Popular/Latest, search, dan add to library.

### 5. HTML metadata

- Meta description tidak lagi menyebut “Phase 0: koneksi dan login”; sekarang menjelaskan jelajah, baca, dan kelola perpustakaan.
- Title menjadi `Kakkee — Suwayomi Frontend`.

### 6. Error copy

Tidak ditemukan stack trace/GraphQL mentah sebagai pesan utama. Pesan generik tetap manusiawi: “The chapter request failed. Try again.”, “Couldn't load pages”, dan seterusnya.

## Sisa concerns

1. Aplikasi masih campuran English dan Indonesia pada beberapa label; locale default mengikuti preferensi, tetapi string yang belum diterjemahkan akan fallback English.
2. `Read` filter vs toggle masih kata yang sama; `aria-pressed` dan konteks membantu, tetapi dapat dipertimbangkan label `Read state` pada filter.
3. Istilah teknis `OPFS`, `JAR`, `KOReader`, `WebUI`, dan `OPDS` dipertahankan karena merupakan istilah upstream.
4. `.filter-section` copy “Loaded titles” jujur bahwa filter hanya berlaku pada halaman termuat; ini teknis tetapi penting.
5. Beberapa count server memakai `manga` invarian; sesuai terminology.
6. Title aplikasi “Kakkee — Suwayomi Frontend” memperkenalkan dua nama; brand shell tetap Suwayomi.

## Validasi

- Pencarian mojibake di `src` menghasilkan nol.
- Library/Manga/Reader/Parity tests 78 passed.
- Typecheck/lint.
- Build setelah perubahan copy.

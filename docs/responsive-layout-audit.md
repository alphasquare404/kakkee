# Responsive and adaptive layout audit

Tanggal: 1 November 2026  
Status: **Goal 5 complete**  
Viewport: `1280×900`, `1180×820`, `820×1180`, `390×844`.

## Prinsip

Setiap form factor adalah komposisi, bukan desktop yang diperkecil:

- desktop: sidebar penuh, konten lebar, action di header;
- tablet landscape: ruang lebih pendek, kontrol harus wrap tanpa memotong konten;
- tablet portrait: icon rail, konten satu kolom dominan;
- phone: bottom navigation, kontrol 44px, action per item tidak boleh memenuhi layar.

## Temuan

### Phone 390×844

| Area | Temuan | Perbaikan |
| --- | --- | --- |
| Library | Search benar-benar collapsed menjadi icon; action row muat; category tabs horizontal overflow di dalam container | Tidak ada page overflow; category tabs tetap scroll container |
| Source | Result grid satu/dua kolom; filter drawer full-screen | Drawer `width:100%`, footer sticky |
| Manga Detail | Cover dan judul berdampingan, judul memakai banyak baris; tiga action hero menjadi full-width stack | Dipertahankan; primary tetap dominan dan tidak ada overflow |
| Reader | Header memiliki back, judul, page count, Previous/Next/Chapters/More | Konten tetap dominan; tidak ada overflow |
| Downloads | `Save to device` dan `Delete` dirender sejajar dengan feed row; tombol global `.button { width:100% }` membuat tombol menyempitkan judul | Pada ≤720px, feed row mengambil satu baris penuh; action download di baris berikutnya; tombol kembali ke lebar konten. Di desktop, tombol diberi `white-space: nowrap` agar tidak pecah dua baris |
| Extensions | Global mobile `.button { width:100% }` membuat tombol Update/Uninstall melebar 330px dan menutupi metadata | `.extension-card > .button` kembali ke lebar konten; card align-start |
| Updates | Feed actions (Read, Download, Manga) berada di bawah setiap row | tetap; tidak ada overflow, tetapi tinggi row tinggi dicatat untuk Goal 15 |
| Settings | Directory satu kolom, Connection tetap terbaca, Disconnect danger | sudah baik |
| Categories | Card satu kolom, flags dan actions wrap | sudah baik |

**Root cause utama:** aturan mobile global `.button { width:100% }` ditujukan untuk form/page action, tetapi diterapkan juga pada tombol berulang di card/row. Perbaikannya harus scoped, bukan menghapus aturan global.

### Tablet portrait 820×1180

- Sidebar menjadi icon rail.
- Library header: title + search + actions tersusun tanpa tabrakan.
- Manga hero: primary action full width, secondary actions satu baris.
- Chapter toolbar: Select, search, filter, More dalam satu baris.
- Tidak ada horizontal page overflow; hanya ambient art yang memang keluar batas dan di-clip.

### Tablet landscape 1180×820

- Sidebar penuh, konten 5 kolom poster.
- Downloads: action `Save to device` dapat terpotong menjadi dua baris pada judul panjang; diperbaiki dengan `flex: 0 0 auto; white-space: nowrap`.
- Extensions: row actions tidak overflow.
- Tidak ada horizontal page overflow.

### Desktop 1280×900

- Library filter drawer 31rem, source list scrollable.
- Manga hero, chapter row, Settings directory, Source drawer sesuai.
- Tidak ada overflow.

## Perubahan CSS

- Scoped mobile override untuk tombol di `.extension-card` dan `.downloaded-row`.
- Downloaded row wrap: feed row full-width, actions below on phone.
- Extension card alignment start pada phone.
- `.downloaded-row > .button` tidak boleh shrink/wrap.

## Yang tidak diubah

- Tidak mengubah breakpoint shell.
- Tidak mengubah lebar sidebar atau bottom nav.
- Tidak menyembunyikan action penting hanya untuk memenuhi layar.
- Tidak membuat desktop dan phone memakai layout yang identik.

## Sisa concerns

1. Touch target beberapa icon chapter (bookmark/download/read) masih di bawah 44px; Goal 11.
2. Category tab overflow belum punya affordance scroll yang jelas; Goal 11/15.
3. Judul manga sangat panjang di phone masih mendorong hero tinggi; Goal 18.
4. Reader header pada phone cukup padat; Goal 12.
5. Landscape 820×600 belum diuji; target minimum saat ini empat viewport di atas.

## Validasi

- Browser audit 390×844, 820×1180, 1180×820.
- `scrollWidth === innerWidth` untuk semua route utama; hanya ambient art yang intentionally overflow dan tidak menyebabkan scroll.
- `typecheck`, `lint`, `build`.

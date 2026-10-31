# Action hierarchy audit

Tanggal: 1 November 2026  
Status: **Goal 3 complete**  
Cakupan: page headers, manga hero, chapter rows, Reader, Downloads, Updates, Extensions, Source, Categories, Library, Settings.

## Aturan yang dipakai

- **Primary** — satu aksi yang paling mungkin menjadi tujuan user di layar itu.
- **Secondary** — aksi pendukung yang sering dipakai tetapi tidak boleh mengalahkan primary.
- **Tertiary** — aksi jarang, maintenance, atau konfigurasi; masuk menu/disclosure.
- **Contextual** — hanya muncul setelah ada konteks, misalnya selection atau error.
- **Destructive** — menghapus atau memutus; harus jelas dan tidak boleh tampil sebagai aksi netral.

Primary tidak boleh disembunyikan hanya untuk membuat layar terlihat bersih. Aksi yang sering dipakai tetap terlihat.

## Matriks

| Surface | Primary | Secondary | Tertiary | Contextual | Destructive |
| --- | --- | --- | --- | --- | --- |
| Library header | Buka manga / search | Filter, Sort | Grid/List, More | Selection bar setelah memilih | Remove from library di selection |
| Library More | — | Select, Sync | Fuzzy, Duplicates, Save defaults, Reset | Reset hanya saat ada refinement | — |
| Category tabs | Pindah kategori | — | — | — | — |
| Browse | Buka source | Search source, Language | NSFW, Preferred | Pin per source | — |
| Source results | Buka manga / Add to library | Popular/Latest, Search | Filters, More, Source preferences | Remove from library setelah ditambahkan | — |
| Manga hero | Continue reading | In library | More (Refresh, Share) | — | — |
| Chapter row | Buka chapter | Download, Bookmark | Read state toggle, Mark earlier | Queue/delete download mengikuti state | Delete download |
| Chapter toolbar | — | Search chapter, Filter state | More (scan, hide duplicates, target, scanlator) | Bulk bar setelah selection | Hapus download di bulk |
| Reader | Baca halaman | Previous, Next, Chapters | More (download, bookmark, fullscreen, auto-scroll, share) | Page nav untuk mode paged | Delete download |
| Updates | Buka chapter | Filter All/Unread/Read | Sync library | Row Read toggle | — |
| Downloads | Pause/Resume | Refresh | — | Retry failed hanya jika ada failure | Delete downloaded |
| Extensions | Check for updates | Update/Install | Stores, Add store, JAR | — | Uninstall (danger) |
| Categories | Create | Rename | More (move, set default) | Rename form / delete confirm | Delete |
| Settings | Disconnect? bukan primary; Connection adalah informasi | Manage directory | Subpage actions | — | Disconnect server (danger) |
| Global search | Search | Search installed sources | Source filter | Live results | — |

## Perubahan

### Categories

Sebelum: setiap card menampilkan `Rename`, `Move up`, `Move down`, `Set default`, dan `Delete` sebagai lima tombol kecil yang sama kuat.

Sesudah:

- `Rename` tetap terlihat karena aksi pengelolaan paling sering;
- Move up/down, Set default, dan Delete masuk menu **More** per kategori;
- Delete tetap diberi warna danger di dalam menu;
- delete confirmation tetap terlihat setelah Delete dipilih.

Root cause: semua item action dirender sebagai tombol datar tanpa mempertimbangkan frekuensi dan risiko.

### Chapter row

- Aksi `Prev` dipindahkan ke overflow per chapter dengan label **Mark earlier as read**; sebelumnya terlalu mirip navigasi halaman dan membuat row melebar/terpotong.
- Read state tetap satu toggle `Read` dengan `aria-pressed`.
- Delete download tetap destruktif dan mengikuti state.

### Extensions

- `Uninstall` sekarang memakai gaya danger, bukan tombol secondary netral.
- `Update`/`Install` tetap primary per item.

### Sebelumnya sudah diperbaiki

- Manga hero 5 aksi → 3.
- Reader 9 aksi → 4 terlihat.
- Library 9 aksi → 5.
- Source preferences keluar dari Filters.
- Retry failed conditional.

## Yang tidak diubah

- `Sync library` di Updates tetap terlihat karena halaman tidak punya CTA lain dan action ini penting untuk feed; diklasifikasikan secondary, bukan tertiary.
- `In library` di manga hero tetap terlihat karena merupakan state/action yang sering dipakai.
- Chapter download/bookmark tetap per baris karena termasuk aksi baca yang sering.
- Bulk actions tetap hanya muncul setelah selection.

## Sisa concerns

1. Delete download di chapter row masih satu klik tanpa dialog; perlu diuji pada Goal 9/11.
2. Per-row chapter actions pada phone masih padat; Goal 5 akan memeriksa touch target dan wrapping.
3. `Sync library` di Updates bersaing dengan filter; pantau pada Goal 15.
4. Uninstall extension belum memakai confirmation; destructive styling saja. Goal 9 akan mengevaluasi recovery.
5. Per-row overflow sekarang menampung `Mark earlier as read`; panel perlu diperiksa pada viewport phone di Goal 5.

# UI density and information-hierarchy audit

Tanggal audit: 31 Oktober 2026  
Baseline server: Suwayomi stable `v2.4.2366`  
Cakupan: seluruh shell React, semua route utama, panel filter, menu, selection toolbar, serta empty/error/loading state.

## Tujuan

Audit ini mencari masalah hierarchy, bukan kekurangan fitur. Prinsip yang dipakai:

1. Satu layar punya satu primary task yang jelas.
2. Kontrol yang selalu dipakai tetap terlihat; kontrol sesekali masuk menu/drawer/disclosure.
3. Filter besar tidak boleh mendorong konten utama ke bawah lipatan.
4. Bulk action hanya muncul sebagai selection toolbar setelah user memilih item.
5. Chip filter yang panjang diganti selector atau disclosure; chip genre tidak memenuhi hero.
6. Desktop, tablet, dan phone punya keputusan sendiri, bukan satu layout yang dipaksa.
7. Semua fitur yang sudah ada tetap dapat dicapai; tidak ada fitur yang dihapus.
8. Pola yang sama dipakai ulang: `ActionMenu`, `FilterDrawer`, `details.filter-section`.

Breakpoint yang dipakai shell:

- Desktop: `>1100px`, sidebar penuh.
- Tablet: `761–1100px`, icon rail.
- Phone: `≤760px`, bottom navigation dan kontrol satu baris yang wrap.

## Ringkasan perubahan

| Pola | Sebelum | Sesudah |
| --- | --- | --- |
| Library header | 9 kontrol sejajar: Select, Fuzzy, Duplicates, Grid, List, Filter, Sort, Save defaults, Sync, Reset | Search, Grid/List, Filter, Sort, More. Select/Fuzzy/Duplicates/Reset/Save/Sync ada di More |
| Source catalog | Preferensi source dan seluruh filter tampil inline | Tombol Filters dengan jumlah filter aktif; drawer berisi result filters, preferensi source, dan filter source |
| Manga Detail | 5 aksi hero sejajar, 13 chip genre, semua tool terbuka, tab tidak berfungsi | Continue reading, In library, More; tag di disclosure; tab Overview/Chapters benar-benar mengganti konten |
| Chapter toolbar | 7 kontrol sejajar | Select, search, filter state, More (scan, hide duplicates, download target, scanlator) |
| Reader header | 9 aksi sejajar | Previous, Next, Chapters, More |
| Downloads | Retry failed selalu terlihat walau tidak ada yang gagal | Retry failed hanya muncul saat `failedCount > 0` |
| Settings | 8 tombol link sejajar dan semua section terbuka | Connection ringkas + direktori “Manage settings” berkelompok |
| Browse/Extensions | Puluhan chip bahasa | Satu selector bahasa + aksi sekunder |
| Updates | Continue reading memenuhi layar sebelum feed | Continue reading menjadi disclosure dengan jumlah manga |

## Matriks per layar

| Screen | Primary task | Always-visible controls | Progressive controls | Problems found | Changes |
| --- | --- | --- | --- | --- | --- |
| Connection | Menghubungkan ke server dan melihat status | Server URL, auth fields, Connect, status/error | Advanced compatibility info | Form sudah fokus; status dan error tidak bercampur dengan kontrol lain | Tidak diubah strukturnya; tetap satu primary action |
| Library | Menemukan dan membuka manga | Search, Grid/List, Filter, Sort, More; category tabs; selection toolbar hanya saat memilih | Select, Fuzzy, Duplicates, Reset, Save defaults, Sync library di More; filter/sort popover | 9 kontrol header sama kuat; mode seleksi dan maintenance bercampur dengan pencarian | Header 9 → 5 kontrol; maintenance masuk `ActionMenu`; view menjadi satu toggle; Reset hanya muncul saat ada refinement |
| Browse | Memilih source | Search source (di halaman source), language selector, NSFW, Preferred, source cards | Preferred languages disclosure; per-source pin | Puluhan chip bahasa memenuhi baris filter; 106 kartu source tetap padat | Chip bahasa → selector; filter lain tetap terlihat karena murah |
| Source results | Menjelajah katalog source dan menambah ke library | Popular/Latest, search, Filters (dengan count), All sources | Result filters, source preferences, filter source di `FilterDrawer`; group filter sebagai `details.filter-section` | Preferensi bahasa dan filter source inline mendorong hasil ke bawah; Apply jauh dari kontrol | Drawer kanan (desktop) / penuh (phone), focus trap, Escape, Apply/Reset, active count, trigger focus kembali |
| Search | Mencari lintas source | Query, source scope, Search all sources, hasil | Recent searches, per-result add-to-library | Tidak ada ledakan kontrol; state kosong/error sudah terpisah | Tidak ada perubahan struktural; memakai pola filter/selection yang sama |
| Manga Detail | Membaca chapter | Cover, title, Continue reading, In library, More, tabs Overview/Chapters | Tags, chapters tools (scan/hide duplicates/download target/scanlator), tracking/notes/categories/reader settings di Overview | 5 aksi hero sama kuat; 13 chip genre; tab tidak mengganti konten; semua tool terbuka | Hero 3 aksi; tag disclosure; tab berfungsi dan default Chapters; tool chapters masuk More; Overview memuat tool sekunder saja |
| Reader | Membaca halaman dan pindah chapter | Back, judul, page count, Previous, Next, Chapters, More | Download, Bookmark, In library, Fullscreen, Auto-scroll, Share, Download next | 9 aksi header sama kuat; aksi destruktif/sekali pakai bercampur navigasi | Navigasi dan Chapters tetap; aksi lain masuk `ActionMenu`; page nav tetap terpisah |
| Updates | Melihat chapter baru | Filter All/Unread/Read, scanlator, Sync library, feed | Continue reading disclosure | Continue reading 21 kartu mendorong feed utama ke bawah | Continue reading menjadi `details` dengan count; feed menjadi fokus pertama |
| History | Melihat dan membuka riwayat | Filter status, hide-read preference, daftar | Per-entry actions | Toolbar kecil; tidak ada duplikasi besar | Tidak diubah; tetap satu baris filter |
| Categories | Mengelola kategori | Create, daftar kategori, rename/delete | Bulk assignment dari Library | Form dan daftar bercampur tetapi masih satu task | Tidak diubah selain mengikuti pola action/menu bersama |
| Extensions | Memasang/memperbarui extension | Search, language selector, Updates only, Check for updates | Update/Uninstall per baris; detail extension | Ratusan kartu dan chip bahasa; kontrol per baris wajar | Chip bahasa → selector; kontrol katalog tetap karena itu task utama |
| Downloads | Mengelola queue dan unduhan | Pause/Resume, Refresh, stats queue/downloaded/pages/downloader, queue rows, downloaded rows | Save to device, Delete, Open offline library | Retry failed selalu tampil walau kosong; 4 stat card besar | Retry failed conditional; stat dipertahankan karena informasi operasional; Delete tetap per baris dengan label aksesibel |
| Settings | Mengubah konfigurasi | Connection info, Disconnect server, direktori Manage settings | Semua subpage: Appearance, Library, Reader, Server, Backup, Tracking, Sync, History, Device, About | 8 tombol link sejajar dan semua section informatif terbuka; sebagian info diduplikasi subpage | Landing menjadi Connection + direktori berkelompok; link punya deskripsi; info yang sudah ada di subpage tidak diulang |
| Tracking settings | Menghubungkan layanan tracking | Status layanan, Connect/Logout | Form kredensial per layanan | Halaman satu task; tabel layanan sudah jelas | Tidak ada perubahan struktural; memakai header/action yang sama |
| Migration | Menjalankan migrasi dari source lain | Source asal, target, mulai migrasi | Pilihan kategori/chapter | Form panjang tetapi satu alur; belum ada bukti masalah hierarchy baru | Tidak ada perubahan struktural pada audit ini |
| Backup & restore | Membuat/memulihkan backup | Create backup, daftar backup, restore | Include options dan retention | Banyak opsi include; berpotensi menjadi form panjang | Opsi tetap terlihat karena memengaruhi hasil backup; tidak ditambahkan drawer baru tanpa bukti |
| Sync settings | Mengatur sinkronisasi | Status sync, Start sync, interval/pilihan data | Data selection | Satu task; kontrol status dan konfigurasi sudah terpisah | Tidak ada perubahan struktural |
| Offline | Membuka unduhan di perangkat | Daftar offline, storage info | Hapus file per item | Hampir tanpa kontrol; empty state jelas | Tidak diubah |
| Menus & popovers | Mengakses aksi sekunder | Trigger yang jelas | Isi menu | Beberapa menu lama berada di stacking context yang sama dengan konten sehingga bisa tertutup | `ActionMenu` reusable, Escape/outside click, focus kembali; header Library dinaikkan di atas konten |
| Selection | Melakukan aksi massal | Selection toolbar hanya setelah memilih | Mark read/unread, bookmark, download, category, delete | Bulk control lama selalu terlihat | Dipertahankan sebagai contextual toolbar; tidak ada bulk control permanen |
| Empty / error / loading | Memulihkan atau menunggu | Satu pesan, satu retry/primary action | Detail teknis tidak ditampilkan | Beberapa state punya kontrol ganda | State yang disentuh audit tetap satu aksi; skeleton tidak menampilkan kontrol palsu |

## Keputusan responsive

- Desktop `1280×900`: drawer filter selebar `31rem` di kanan; menu overflow rata kanan; direktori Settings 3 kolom untuk grup Experience dan 3/2 kolom untuk Server & data.
- Tablet `820×1180`: sidebar menjadi icon rail; filter drawer tetap kanan tetapi lebih sempit dari viewport; Library header turun ke dua baris bila perlu.
- Landscape `1180×820`: tinggi viewport lebih penting; drawer memakai `100dvh` dan body scroll sendiri; chapter toolbar wrap.
- Phone `390×844`: drawer menjadi full-screen sheet; Library search toggle dan More tetap satu baris; selection toolbar horizontal scroll; tag dan chapter tool disclosures menghindari chip soup.

## Validasi runtime

Dihitung pada desktop 1280×900 dengan data server nyata:

| Route | Kontrol sebelum | Kontrol sesudah | Catatan |
| --- | --- | --- | --- |
| Library | 113 | 112 | Header 9 → 5; jumlah total didominasi kartu dan category tabs |
| Source results | 242 | 119 | Preferensi/filter pindah ke drawer; angka sesudah dihitung saat drawer tertutup |
| Browse | 279 | 212 | Chip bahasa menjadi selector |
| Manga Detail | 48 | 32 | Aksi hero, tag, dan tool chapters diringkas |
| Settings | 29 | 26 | Section informatif diganti direktori |
| Reader | 10 | 10 | Jumlah kontrol sama, tetapi hanya 4 yang terlihat di header |
| Extensions | 1049 | 1027 | Sebagian besar kontrol berasal dari 500 kartu extension |

Screenshot review dilakukan pada `1280×900`, `820×1180`, `1180×820`, dan `390×844` dengan build produksi dan data server nyata. Pemeriksaan mencakup Library, menu Library, Manga Detail, tag disclosure, chapter toolbar, Settings, Source results, filter drawer, serta variasi mobile/tablet. Tidak ada horizontal overflow yang terlihat pada keempat viewport.

## Yang sengaja tidak diubah

- Tidak ada redesign visual menyeluruh; warna, tipografi, dan permukaan tetap.
- Tidak ada fitur yang dihapus. Semua aksi lama tetap dapat dicapai lewat More, drawer, atau disclosure.
- Tidak menambah dependency UI baru.
- Migration, backup, tracking, dan sync tidak dipaksa memakai drawer tanpa bukti bahwa form-nya memerlukan progressive disclosure.
- Count kontrol bukan target tersendiri. Targetnya adalah kontrol yang terlihat dan bersaing dengan primary task.

## Follow-up

- Audit keyboard untuk `ActionMenu` di Safari/Firefox nyata; jsdom sudah menguji Escape dan trigger focus.
- Ukur tinggi drawer pada phone dengan keyboard virtual terbuka.
- Bila source filter makin banyak, pertimbangkan pencarian filter di dalam drawer, bukan menambah chip di halaman.

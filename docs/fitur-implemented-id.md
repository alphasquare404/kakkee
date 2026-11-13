# 136 Fitur yang Sudah Diimplementasikan

Dokumen ini menjelaskan fitur yang sudah tersedia di frontend dalam bahasa Indonesia. Fokusnya adalah **apa yang bisa dilakukan pengguna**, bukan detail teknis per baris matrix.

## Ringkasan

```text
158 baris matrix
136 Implemented
0 Partial
0 Missing
19 Blocked by server
3 Platform limitation
```

| Area | Jumlah | Inti |
|---|---:|---|
| Koneksi, login, shell | 13 | Menghubungkan server, login, navigasi, PWA, offline |
| Library | 20 | Koleksi manga, pencarian, filter, seleksi, bulk action |
| Manga Detail | 13 | Informasi manga, chapter, tracker, catatan, pengaturan baca |
| Chapters | 10 | Daftar chapter, filter, bookmark, unduh, aksi massal |
| Reader | 27 | Mode baca, navigasi, tampilan, preload, kontrol |
| Updates, History, Downloads | 13 | Feed update, riwayat baca, antrean unduhan |
| Browse, Sources, Extensions | 9 | Jelajah source, pencarian, kelola ekstensi |
| Tracking dan Categories | 7 | Tracker dan kategori perpustakaan |
| Backup, Sync, Settings, Global | 24 | Cadangan, sinkronisasi, pengaturan, pencarian global |

---

## 1. Koneksi, Login, dan Shell Aplikasi — 13

- **Hubungkan ke server** dengan URL Suwayomi, lengkap dengan validasi alamat dan pemeriksaan kompatibilitas versi.
- **Login NONE**: langsung terhubung tanpa autentikasi.
- **Login UI**: username/password, penyimpanan token, refresh sesi, dan logout.
- **HTTP Basic**: form login Basic untuk server dengan `BASIC_AUTH`.
- **Simple login**: login memakai sesi cookie server untuk `SIMPLE_LOGIN`.
- **Ingat server dan sesi**: URL server dan sesi opsional dapat dipakai lagi setelah reload atau membuka PWA.
- **Navigasi desktop dan mobile**: sidebar di desktop, bottom tab di mobile, serta menu More untuk halaman tambahan.
- **Badge navigasi**: jumlah antrean unduhan dan update ekstensi.
- **Informasi update**: pemberitahuan update WebUI/server dan prompt update PWA.
- **Pilihan bahasa**: English dan Bahasa Indonesia.
- **PWA**: bisa dipasang, mendukung safe area, route fallback, dan cache app shell.
- **Offline reading**: unduhan device disimpan di OPFS dan bisa dibaca tanpa server.
- **Native share**: bagikan manga atau chapter dari Reader/Detail.

## 2. Library — 20

- **Tampilan koleksi**: grid poster, tampilan list, serta pilihan compact/comfortable.
- **Thumbnail terautentikasi**: gambar library tetap aman mengikuti sesi login.
- **Kategori**: tab kategori, jumlah manga per kategori, dan kategori default.
- **Pencarian**: cari manga berdasarkan judul.
- **Fuzzy search lokal**: toleransi salah ketik pada data yang sudah dimuat.
- **Riwayat pencarian**: saran pencarian terakhir dan tombol hapus riwayat.
- **Reset filter**: mengembalikan semua filter ke kondisi awal.
- **Filter lengkap**: status, source, tracker, unread, started, downloaded, dan bookmarked.
- **Filter AND/OR**: menggabungkan beberapa filter dengan mode AND atau OR.
- **Filter default tersimpan**: pengaturan filter bisa dipakai lagi.
- **Sorting**: urutkan koleksi sesuai pilihan yang tersedia.
- **Shuffle lokal**: acak manga dari halaman yang sudah dimuat.
- **Continue reading**: tombol dan tooltip untuk melanjutkan chapter terakhir.
- **Seleksi manga**: klik, shift-click untuk rentang, dan long-press di perangkat sentuh.
- **Aksi massal**: unduh, hapus unduhan, tandai sudah/belum dibaca.
- **Kategori massal**: masukkan banyak manga ke kategori sekaligus.
- **Hapus dari library**: satu manga atau banyak manga sekaligus.
- **Deteksi duplikat**: kelompokkan judul serupa dan pindai seluruh library.
- **Sinkronisasi library**: trigger update library dengan progress.
- **Badge dan jumlah**: badge unread/download serta jumlah item per tab.

## 3. Manga Detail — 13

- **Informasi manga**: cover, judul, author/artist, status, source, genre, dan deskripsi.
- **Library dan kategori**: tambah/hapus dari library serta pilih kategori.
- **Lanjut membaca**: membuka chapter yang sedang dibaca pada halaman terakhir.
- **Mulai dari awal atau chapter terbaru**.
- **Catatan manga**: catatan pribadi yang disimpan di server.
- **Share**: bagikan halaman manga.
- **Refresh metadata/chapter**: ambil ulang data dari source.
- **Tracker**: binding, status, score, dan progres tracking.
- **Filter chapter**: status baca, scanlator, dan pencarian judul chapter.
- **Indikator chapter hilang**: menandai celah nomor chapter.
- **Tab Overview/Chapters**: memisahkan ringkasan dan daftar chapter.
- **Pengaturan Reader per manga**: override mode, lebar, background, filter, arah, dan skala.
- **Tandai chapter sebelumnya**: tandai semua chapter sebelum chapter tertentu sebagai sudah dibaca.

## 4. Chapters — 10

- **Daftar chapter**: nama, tanggal, jumlah halaman, status baca, dan status unduhan.
- **Pagination**: tombol load more untuk chapter tambahan.
- **Seleksi chapter**: satu, banyak, atau rentang dengan shift-click.
- **Bookmark**: tandai atau hapus tanda chapter.
- **Status baca**: tandai sudah/belum dibaca dan tandai chapter sebelumnya.
- **Unduh/hapus unduhan**: download server atau device sesuai target.
- **Aksi massal**: baca, bookmark, unduh, dan hapus unduhan sekaligus.
- **Scanlator dan duplikat**: filter scanlator dan sembunyikan chapter duplikat.
- **Separator chapter hilang**: pemisah visual untuk chapter yang tidak ada.
- **Preferensi tampilan**: urutan, filter, scanlator, dan hide duplicate disimpan per manga.

## 5. Reader — 27

- **Mode vertikal**: membaca chapter secara berurutan ke bawah.
- **Chrome Reader**: header, judul, navigasi, dan kontrol yang responsif di desktop/mobile.
- **Mode single page**: satu halaman per layar.
- **Mode double page**: dua halaman berdampingan.
- **Mode horizontal**: membaca ke samping.
- **Mode webtoon**: halaman panjang tanpa jarak, dengan deteksi otomatis.
- **Arah baca**: kiri-ke-kanan atau kanan-ke-kiri.
- **Skala halaman**: fit width, fit height, fit screen, atau ukuran asli.
- **Stretch halaman kecil**: memperlebar halaman sempit tanpa merusak rasio.
- **Lebar kustom, gap, offset halaman pertama, dan safe area**.
- **Default per mode**: pengaturan berbeda untuk tiap mode baca.
- **Profil per device**: preferensi Reader tersimpan di perangkat.
- **Progress dan status baca**: halaman terakhir dan status selesai disimpan.
- **Resume**: membuka kembali di halaman terakhir.
- **Navigasi chapter**: previous/next dan daftar chapter.
- **Infinite scroll vertical/webtoon**: halaman chapter berikutnya disambung di bawah; chapter aktif, URL, progress, dan indikator ikut berpindah saat pembaca menyeberang. Mode paged/horizontal tetap transisi eksplisit.
- **Skip chapter duplikat**.
- **Preload**: halaman sekitar dan chapter berikutnya disiapkan lebih awal.
- **Filter gambar**: brightness, contrast, saturation, grayscale, sepia, invert, high contrast.
- **Retry gambar gagal**: mencoba ulang halaman yang gagal dimuat.
- **Auto-scroll**: gulir otomatis dengan kecepatan yang bisa diatur.
- **Keybinding kustom**: tombol previous/next/back bisa diganti.
- **Tap zone dan swipe**: navigasi halaman lewat sentuhan.
- **Auto background**: warna latar menyesuaikan halaman.
- **Unduh chapter berikutnya / hapus setelah dibaca**.
- **Bookmark dan library dari Reader**.
- **Overlay daftar chapter**: pindah chapter tanpa keluar Reader.

## 6. Updates, History, dan Downloads — 13

- **Feed update**: chapter terbaru dari manga di library.
- **Filter update**: unread/read, scanlator, dan status.
- **Aksi dari feed**: mark read/unread, download, buka chapter, buka manga.
- **Sync dan refresh**: update library dan muat ulang feed.
- **Riwayat baca**: daftar chapter yang pernah dibaca.
- **Chapter terakhir per manga/hari**: riwayat dikelompokkan dan dideduplikasi.
- **Resume dari riwayat**: langsung ke chapter/halaman terakhir.
- **Hide read**: sembunyikan entri yang sudah dibaca di client.
- **Antrean unduhan server**: status queued, downloading, finished, failed.
- **Kontrol unduhan**: pause/resume, retry, cancel, delete.
- **Grouping dan bulk**: kelompokkan per manga dan batalkan satu seri.
- **Daftar chapter terunduh**.
- **Conversion**: daftar konversi download/serve.

## 7. Browse, Sources, dan Extensions — 9

- **Katalog source**: daftar source yang terpasang dan filter bahasa.
- **Jelajah source**: popular/latest, pencarian, filter dinamis, dan pagination.
- **Preferensi source**: pin, last used, preferred language, dan visibilitas NSFW.
- **Filter hasil source**: hide in-library, quick add/remove, dan cek duplikat.
- **Saved search dan global search**: riwayat pencarian source serta pencarian lintas server.
- **Kelola extension**: installed/available, store, filter bahasa.
- **Aksi extension**: install, uninstall, update, external JAR, dan obsolete handling.
- **Badge dan detail extension**: update badge dan halaman detail.
- **Source preferences**: pengaturan khusus yang disediakan source.

## 8. Tracking dan Categories — 7

- **Daftar tracker**: service, status login, token, dan logout.
- **Binding manga**: cari manga di tracker, bind, unbind, dan private binding.
- **Progress tracking**: score, status, progress, reading dates, dan sync.
- **Daftar kategori**: kategori server beserta jumlah manga.
- **Kelola kategori**: create, rename, reorder, delete dengan konfirmasi.
- **Assignment dan default**: pilih kategori manga dan jadikan default.
- **Flag kategori**: include in update dan include in download.

## 9. Backup, Sync, Settings, dan Global — 24

- **Backup**: buat backup dengan pilihan data.
- **Restore/validate**: upload, validasi, dan restore backup.
- **Backup otomatis**: path, interval, waktu, retensi, dan data yang disertakan.
- **Sync Yomi**: mulai sync, status live, interval, host, dan API key.
- **Info server/koneksi**: nama, versi, build, platform, endpoint, auth, dan kompatibilitas.
- **Tampilan**: dark, pure black, custom accent, dan tema.
- **Preferensi Reader**: default mode, filter, hotkey, dan perilaku baca.
- **Preferensi Library**: density, badge, continue reading, dan layout.
- **Preferensi download/cache**: path, limit, dan pembersihan cache gambar.
- **Preferensi browse/extension**: bahasa, NSFW, dan store.
- **Hide read**: preferensi riwayat di client.
- **Tracking settings**: service, auto-sync, dan kredensial.
- **Server settings**: auth, database, update, download, OPDS, KOReader, WebUI.
- **Info device**: platform, layar, network, service worker, Wake Lock, dan Web Share.
- **Global search**: cari manga/source dan live search ke semua source.
- **Riwayat pencarian lokal**.
- **Hotkey aplikasi/Reader** yang bisa dikonfigurasi.
- **Backdrop artwork dinamis**.
- **About dan update action**: versi, build, cek update WebUI/server.
- **Persistensi server/session**.
- **UI terjemahan** English/Indonesia.
- **Aksesibilitas**: keyboard, fokus, label, skip link, dan Escape pada menu.

---

## Yang Tidak Termasuk 136

- **19 Blocked by server**: migration, fuzzy server-wide, autocomplete, random server, clear history, retensi history, download speed, image processing, related manga, dan device management. API-nya tidak ada di stable maupun preview.
- **3 Platform limitation**: Wake Lock, Fullscreen, dan WebView/open-in-WebView.

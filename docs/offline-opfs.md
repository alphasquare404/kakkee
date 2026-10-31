# OPFS Offline Downloads

## Tujuan

Menyediakan unduhan chapter di sisi klien yang bisa dibaca tanpa koneksi, terpisah dari download queue server.

## Batas penyimpanan

- Hanya chapter yang dipilih pengguna dengan target **This device**.
- Data disimpan di Origin Private File System (OPFS) pada direktori `suwayomi-offline-v1`.
- Gambar/halaman privat **tidak** masuk CacheStorage atau service worker.
- Setiap record menyimpan `serverBaseUrl`; daftar dapat difilter per server.
- OPFS terikat pada origin dan memerlukan secure context (HTTPS atau localhost).

## Struktur

```text
suwayomi-offline-v1/
  index.json
  chapter-<id>/
    manifest.json
    page-0
    page-1
    ...
```

`manifest.json` menyimpan metadata chapter dan MIME type setiap halaman. `index.json` menyimpan ringkasan untuk daftar unduhan.

## Alur unduh

1. `Manga Detail` memilih target `Server` atau `This device`.
2. Target device memakai `ReaderRepository.getChapter` dan `fetchChapterPages`.
3. Setiap halaman diambil lewat `ResourceService` (Basic/Bearer/cookie sesuai mode auth).
4. Blob ditulis ke OPFS, lalu manifest dan index diperbarui.
5. `Downloads` menampilkan ukuran, progress, dan tombol hapus/baca.

## Offline reading

- Route `/offline` mendaftar chapter yang tersimpan.
- Route `/offline/read/:chapterId` membuat object URL dari blob OPFS dan menampilkan reader vertikal.
- Halaman offline tidak memakai GraphQL, jadi tetap bisa dibuka saat server tidak terjangkau.
- Service worker hanya menyediakan app shell dan route chunk; data chapter tetap di OPFS.

## Privasi dan pembersihan

- Unduhan device bertahan sampai pengguna menghapusnya atau membersihkan data situs.
- Tidak ada token/kredensial yang disimpan di OPFS.
- Nama server disimpan untuk memisahkan unduhan antar server, bukan untuk autentikasi.

## Bukti

- Unit test `clientDownloadRepository.test.ts`.
- Verifikasi headless Chrome: OPFS write/read, route `/offline`, service worker control, lalu `/offline/read/999` saat jaringan dimatikan; gambar terbaca dengan `naturalWidth = 1`.
- E2E server nyata `https://suwayomi.alphasquare.my.id` (stable v2.4.2366, auth NONE): manga 60 chapter 1621, 60 halaman, 28.278.865 byte tersimpan di OPFS. Setelah service worker aktif dan jaringan dimatikan, `/offline/read/1621` menampilkan tiga gambar pertama dengan `naturalWidth = 1280` dari blob OPFS.

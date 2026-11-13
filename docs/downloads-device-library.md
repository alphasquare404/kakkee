# Downloads tabs, device library, and reader priority

Tanggal: 13 November 2026

## Downloads tabs

- Tab Server/Device sekarang memakai segmented control yang sama dengan
  Chapters/Overview:
  - lebar maksimum 27rem, centered di desktop;
  - penuh dari kiri-ke-kanan di mobile;
  - active tab memakai accent dan contrast text.
- Tab Device menyediakan tombol **Device Downloaded Library**.

## Device Downloaded Library

- Route: `/downloads/device`.
- Isinya grid manga seperti Library, tetapi hanya manga yang punya chapter
  tersimpan di OPFS perangkat untuk server aktif.
- Setiap card menampilkan cover, judul, dan jumlah chapter yang tersimpan.
- Card membuka Manga Detail; chapter yang dibuka dari sana mengikuti prioritas
  Reader di bawah.
- Halaman lama `/offline` (Offline Downloads) dihapus. Offline Reader tetap
  tersedia di `/offline/read/:chapterId`, dengan back ke Device Library.

## Reader priority

Saat chapter dibuka:

1. jika chapter tersedia di perangkat, Reader diarahkan ke Offline Reader;
2. jika tidak, Reader memakai download server;
3. jika tidak ada download, Reader memuat online.

Pemeriksaan perangkat menggunakan OPFS untuk server yang sedang terhubung.

## Bulk chapter actions

- Download pada selection rail sekarang membuka pilihan:
  - Download server
  - Download device
- Delete pada selection rail membuka pilihan:
  - Delete server download
  - Delete device download
- Rail tetap icon-only dan scrollable.

## Server download deletion

- Menghapus download server langsung memuat ulang feed downloaded chapters.
- Subscription `DownloadStatusChanged` juga memuat ulang queue dan feed,
  sehingga chapter hilang tanpa berpindah halaman.

## Continuous next chapter

Pada mode `vertical` dan `webtoon`, halaman chapter berikutnya dimuat di bawah
chapter aktif tanpa reload. Saat pembaca masuk ke halaman appended:

- judul dan URL berubah ke chapter appended;
- page indicator memakai halaman lokal chapter appended;
- progress disimpan untuk chapter appended;
- scrolling kembali ke atas memulihkan chapter semula;
- chapter list menandai chapter appended sebagai current.

Mode paged (single/double) dan horizontal tetap memakai transisi eksplisit.

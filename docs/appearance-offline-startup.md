# Appearance, offline startup, and app icon

Tanggal: 13 November 2026

## Settings

- Settings directory cards dipadatkan menjadi grid card 12.5rem dengan padding
  lebih kecil.
- Setiap card memiliki icon section dari icon family Library.
- Setting subpages tetap memakai section yang sama; perubahan hanya pada
  kepadatan directory.

## Themes

- Menambahkan **Snow white**:
  - surface putih;
  - background `#f3f5f9`;
  - teks gelap;
  - border dan status colors yang disesuaikan.
- Card, cover, chapter row, settings directory, menu panel, download card,
  reader rail, dan tracking card memakai surface tema.
- Accent tetap mengikuti Appearance settings.
- Tema default mengikuti `prefers-color-scheme`: perangkat dark memakai
  Pure black, perangkat light memakai Snow white. Pilihan tema tersimpan tetap
  diutamakan.
- ConnectionPage memakai surface, teks, border, dan theme-color dari tema aktif;
  tidak lagi memakai panel gelap hardcoded.

## Flat actions

- Accent gradient diganti warna accent solid.
- Box shadow, text shadow, action gradient, dan glow dihapus.
- Gradient background halaman/body dihapus.
- Efek hover yang tersisa hanya perubahan warna/border.

## Startup

- Saat `autoConnect` aktif dan last server tersedia, aplikasi langsung menuju
  `/library` dan menampilkan skeleton Library selama koneksi berjalan.
- ConnectionPage tidak lagi menampilkan panel Connected/Open library/Disconnect.
- Halaman yang sebelumnya terlihat adalah **auto-connect ConnectionPage**;
  sekarang tahap itu tidak lagi berupa halaman koneksi terpisah.

## Offline device library

- Route `/downloads/device` dapat dirender saat koneksi terputus.
- `/` mengarah ke Device Downloaded Library saat browser offline.
- ConnectionPage selalu menyediakan tombol **Open device library** sehingga
  Device Downloaded Library tetap dapat dibuka ketika server tidak dapat
  dijangkau meskipun browser melaporkan status online.
- Device library memakai OPFS untuk:
  - metadata manga;
  - daftar chapter;
  - cover data URL yang disimpan saat chapter diunduh;
  - halaman chapter untuk Offline Reader.
- Bila cover lama tidak memiliki data URL, card memakai fallback inisial.
- Device Library hanya menampilkan grid manga; daftar chapter tidak diulang di
  halaman ini. Daftar downloaded chapter dikelola di tab Device halaman
  Downloads.
- Card manga membuka halaman detail `/manga/:id`. Saat offline, halaman detail
  dirender dari record OPFS: cover, judul, dan chapter yang tersimpan. Chapter
  di halaman detail membuka `/offline/read/:chapterId`.

## App icon

- Icon PWA/favicon/apple-touch diganti dengan logo K dari referensi.
- Border hitam luar dihapus dengan crop ke dalam tile dan mask rounded.
- Maskable icon memakai bidang putih penuh tanpa border hitam.

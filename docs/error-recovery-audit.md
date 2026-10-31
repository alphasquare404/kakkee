# Error recovery audit

Tanggal: 1 November 2026  
Status: **Goal 9 complete**  
Cakupan: koneksi, auth, GraphQL, thumbnail, Reader image, source, extension, manga/chapter hilang, download, offline, deep link.

## Prinsip

Pesan error harus:

- menjelaskan apa yang gagal dalam bahasa manusia;
- memberi aksi berikutnya: Retry, Back, reconnect, atau buka halaman lain;
- tidak menampilkan stack trace, GraphQL error mentah, atau URL internal;
- tidak menghapus konteks yang masih bisa dipakai.

## Matriks recovery

| Surface | Error | Recovery saat ini | Status |
| --- | --- | --- | --- |
| Connection | server tidak terjangkau / auth gagal | pesan + form tetap; Connect ulang | Baik |
| Auth expiry | request ditolak | pesan umum dari halaman; belum ada re-login prompt | Concern |
| Library | query awal gagal | state + Retry | Baik |
| Library categories | query kategori gagal | All tetap dapat dipakai + catatan | Baik |
| Source list | source gagal dimuat | state + Retry | Baik |
| Source filters | apply gagal | inline alert; filter drawer tetap | Baik |
| Source preferences | load gagal | alert + Retry baru | Baik |
| Source preferences save | save gagal | alert; nilai tetap terlihat | Baik |
| Manga Detail | manga gagal / hilang | heading, pesan, Retry, Back ke origin | Baik |
| Manga action | library/refresh gagal | alert inline dekat aksi | Baik |
| Chapter action | read/download/bookmark gagal | alert inline | Baik |
| Reader chapter | metadata gagal | header + Retry + Back | Baik |
| Reader pages | page metadata gagal | Retry pages | Baik |
| Reader image | satu gambar gagal | `Page n couldn't be loaded` + Retry page | Baik |
| Thumbnail | image gagal | fallback inisial/placeholder | Baik |
| Extension catalog | gagal | state + Retry | Baik |
| Extension action | ditolak server | alert; daftar tetap | Baik |
| Downloads | queue gagal | state + Retry | Baik |
| Download action | gagal | alert; aksi berikutnya tetap | Baik |
| Offline | storage tidak didukung | tombol device disembunyikan / pesan | Baik |
| Malformed deep link | route tidak dikenal | redirect ke Library/Connection | Aman, tetapi tidak informatif |
| Malformed manga id | query gagal | error generik + Back | Concern copy |

## Perbaikan

### Source preferences retry

Sebelum: load gagal hanya menampilkan alert dan tidak ada cara mencoba lagi selain reload halaman.

Sesudah:

- status error memiliki `Retry`;
- retry menaikkan token dan menjalankan ulang effect;
- status kembali loading selama retry.

### Reader image

Sudah memiliki fallback per halaman dan tombol Retry; tidak diubah, tetapi diverifikasi di kode dan dimasukkan matriks.

### Manga Detail

Error state sudah memiliki Retry dan Back. Back memakai origin/history sehingga tidak terjebak di halaman rusak.

## Sisa concerns

1. **Auth expiry** belum memicu prompt login ulang atau reconnect terarah. Pesan generik bisa membingungkan.
2. **Malformed deep link** hanya redirect; tidak ada halaman “route tidak ditemukan” yang menjelaskan.
3. **Manga ID invalid** menampilkan error generik; copy “Manga not found” akan lebih tepat.
4. **Offline runtime** tidak dapat dipastikan lewat headless test karena shell/PWA cache dapat menahan navigasi; perlu uji perangkat.
5. Beberapa error memakai `settings-inline-error`, beberapa `alert alert-error`, beberapa `library-state`; Goal 10/11 akan menyeragamkan bila polanya sama.
6. Retry mutation individual belum ada untuk semua aksi; user harus mengulang aksi.

## Validasi

- Source preferences error retry ditambahkan.
- Existing error states diperiksa di kode.
- `typecheck`, `lint`, `build`.
- Offline browser probe tidak menghasilkan error state yang dapat dibaca karena shell tetap aktif; dicatat sebagai keterbatasan pengujian.

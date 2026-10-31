# Final product coherence audit

Tanggal: 1 November 2026  
Status: **Goal 21 complete**  
Metode: memakai aplikasi sebagai produk pada desktop, tablet portrait, dan phone; bukan membaca kode terlebih dahulu.

## Pertanyaan produk

| Pertanyaan | Jawaban |
| --- | --- |
| Apakah terasa sebagai satu aplikasi? | Ya. Shell, tipografi, permukaan, tombol, menu, dan drawer konsisten. |
| Apakah pengguna baru dapat memahami alur? | Ya untuk connect → library/browse → manga → chapter → reader. Filter dan More memiliki label yang jelas. |
| Apakah aksi penting mudah ditemukan? | Ya. Primary CTA Manga, search, filter, chapter, dan download terlihat; aksi sekunder di More. |
| Apakah ada layar yang terasa seperti admin/debug UI? | Settings server masih teknis, tetapi berada di Settings. Tidak ada JSON/error mentah di UI utama. |
| Apakah ada halaman yang terasa lebih tua? | Extensions dan Updates paling padat; keduanya masih memakai pola visual yang sama. Extensions 500 kartu terasa panjang. |
| Apakah ada konvensi yang tidak dijelaskan? | `⋯` pada chapter row memiliki aria-label; `More` pada hero/header adalah disclosure. |
| Apakah ada dead end? | Tidak ditemukan pada Library, Manga, Reader, Updates, History, Downloads, Source, Search. |
| Apakah WebUI resmi masih diperlukan untuk fitur yang didukung? | Migration tidak memiliki route di shell. Fitur lain yang diaudit memiliki jalur UI; klaim parity penuh tidak dibuat. |

## Temuan signifikan

### PWA shell-ready notice mengganggu dan dapat muncul ulang

Notice “The app shell is ready. Server data still requires a connection.” adalah pesan teknis, menutup konten bawah, dan dapat muncul kembali setelah navigasi.

**Perbaikan:**

- notice teknis shell-ready dihapus dari UI;
- update prompt tetap persisten sampai user memilih update/close;
- tidak ada lagi toast yang menutup konten bawah atau muncul ulang setelah navigasi.

Ini membuat pengalaman pertama lebih tenang tanpa menghilangkan update prompt.

### Temuan lain yang sudah diperbaiki sepanjang program

- hierarchy Library, Source, Manga, Reader, Settings;
- filter drawer dan source preferences;
- state/read semantics;
- empty states dan recovery;
- copy/mojibake/plural;
- touch target, focus, PWA base path;
- lazy extension icons dan content-visibility.

## Sisa masalah yang tidak diperbaiki

1. Extensions 500 kartu membuat halaman sangat panjang; virtualisasi/pagination adalah pekerjaan lanjutan.
2. Updates feed row memiliki tiga action kecil dan tinggi baris besar.
3. Reader header sticky dua baris; mobile thumb reach belum optimal.
4. Migration tidak memiliki route; tidak dapat diklaim setara WebUI.
5. Auth expiry belum memicu re-login terarah.
6. Route terakhir tidak dipulihkan setelah relaunch; auto-connect hanya memulihkan koneksi.
7. Cross-route state bergantung pada remount/network query; tidak ada event bus global.
8. Kontras warna belum diukur dengan tool, screen reader nyata belum dijalankan.
9. Nama produk di shell tetap “Suwayomi”; title memakai “Kakkee — Suwayomi Frontend”.
10. Bundle utama 644 kB (gzip 171 kB) masih memicu warning; route lazy dan lazy icons sudah ada.

## Penilaian akhir

Aplikasi sekarang terasa lebih dewasa:

- satu primary action per layar;
- filter tidak menyamar sebagai navigation;
- aksi berisiko terlihat berisiko;
- empty/error state memberi jalan keluar;
- form factor tidak dipaksa memakai layout desktop;
- motion tenang dan fungsional.

Ini bukan klaim parity penuh dengan WebUI resmi. Ini adalah peningkatan koherensi produk di atas fitur yang sudah diimplementasikan, dengan batasan server/platform yang dicatat.

## Validasi

- Build produksi.
- Browser 1280×900, 820×1180, 390×844.
- Library/Manga/Settings/Extensions final screenshots.
- PWA toast auto-dismiss verified.
- Full suite, typecheck, lint, codegen, build pada laporan akhir.

# Extreme data and stress audit

Tanggal: 1 November 2026  
Status: **Goal 18 complete**  
Data nyata: 500 extensions, 107 sources, 39 manga, 100 downloaded rows, feed 40, chapter list paginated.

## Uji ekstrem

| Kasus | Metode | Hasil |
| --- | --- | --- |
| Judul manga 260+ karakter tanpa spasi | Inject ke card/h1, ukur scrollWidth | Tidak overflow; wrap di dalam card/hero |
| Nama source 200+ karakter | Inject ke page title | Tidak overflow |
| 107 source di filter drawer | Buka drawer | List 240px, scrollHeight ~3977px, scroll internal |
| 500 extension cards | Load halaman | 500 cards, tinggi dokumen ~51.786px, `content-visibility:auto` aktif |
| 100 downloaded rows | Data server | Wrap phone/desktop, tidak overflow |
| 39 manga grid | Data server | Tidak overflow |
| 40 updates | Data server | Feed stabil |
| 1 chapter | Data server | Plural `1 chapter` |

## Perbaikan

1. **Long unbroken labels**: `overflow-wrap:anywhere` pada page title, manga hero title, manga card title, source manga title, extension title.
2. **Large repeated lists**: `content-visibility:auto` + `contain-intrinsic-size:auto 72px` pada chapter item, downloaded row, extension card. Ini mengurangi biaya layout/paint untuk ribuan baris.
3. **Large source filter**: daftar source sudah memiliki tinggi terbatas + scroll + pencarian; 107 opsi tidak memperpanjang halaman.
4. **Thousands of chapters**: list tetap dipaginasi; `Scan all` dapat memuat seluruh daftar, tetapi setiap row sekarang memakai content-visibility.

## Temuan yang belum diperbaiki

1. Extensions tetap merender 500 DOM cards (walaupun ringan secara paint). Virtualisasi/pagination adalah follow-up bila katalog melebihi ~1000.
2. `Scan all chapters` pada manga dengan ribuan chapter masih menambah ribuan DOM; content-visibility membantu render, tetapi belum ada virtual list.
3. Judul panjang tetap membuat hero tinggi; wrap benar, tetapi line count tidak dibatasi. Line clamp 2–3 baris dapat dipertimbangkan untuk card, bukan hero.
4. Banyak kategori belum diuji dengan 50+ kategori nyata; grid CSS diperkirakan wrap, tetapi perlu data server.
5. Banyak scanlator dirender sebagai native `<select>`; aman untuk ratusan opsi, tetapi pencarian tidak tersedia.
6. Banyak tracker record belum diuji dengan akun nyata.
7. `content-visibility` tidak didukung sebagian browser lama; fallback tetap normal.
8. Large feed 2761 chapters tidak dirender sekaligus; pagination/headless limit melindungi.

## Validasi

- Browser 1280×900: long title, long source, 500 extensions, 107 sources, no page overflow.
- `scrollWidth <= innerWidth` untuk semua kasus; hanya ambient art yang intentionally keluar dan tidak menimbulkan scroll.
- `content-visibility:auto` terdeteksi pada extension card.
- Typecheck/lint/build.

# Reader UX audit

Tanggal: 1 November 2026  
Status: **Goal 12 complete**  
Fokus: Reader sebagai produk inti, bukan sekadar route.

## Chrome dan hierarchy

Reader sekarang memiliki:

- **Primary:** konten halaman;
- **Secondary:** Back, Previous/Next chapter, Chapters;
- **Tertiary:** More (download, bookmark, library, settings, fullscreen, auto-scroll, share, download next).

Advanced configuration tidak lagi di header. `Reader settings` dibuka dari More sebagai tab baru (`/settings/reader`, `target=_blank`) agar posisi baca tidak hilang.

## Checklist

| Area | Temuan | Status |
| --- | --- | --- |
| Masuk Reader | state origin + fromManga; back label benar | Baik |
| Keluar Reader | history Back bila dari Manga/feed; direct fallback Manga | Baik |
| Chapter switch | Previous/Next + drawer Chapters; `readerState` dipertahankan | Baik |
| Progress | page count, `safeCurrentPage`, progress write saat membaca | Baik; server timing perlu Goal 20 |
| Page loading | skeleton per page, intersection observer | Baik |
| Prev/next page | page nav untuk mode paged; keyboard | Baik |
| Controls hierarchy | header 4 elemen; More untuk aksi lain | Baik |
| Disappearing chrome | header sticky, tidak auto-hide | Concern |
| Mobile thumb reach | Previous/Next/Chapters/More berada di atas | Concern |
| Keyboard | Arrow/PageUp/PageDown/Backspace, Back key, Escape drawer | Baik |
| Scroll behavior | webtoon/paged/horizontal; auto-scroll | Baik |
| Long chapters | lazy image via IntersectionObserver, rootMargin 1200px | Baik |
| Page failure | per-page error + Retry | Baik |
| Preloading | near viewport/eager around current page | Baik |
| Fullscreen | Fullscreen API, fallback no-op | Baik |
| Reader settings | link di More, tidak menutupi konten | Baik |
| State persistence | reader settings/prefs localStorage; chapter position server | Baik, perlu verifikasi Goal 20 |
| Appended next chapter | dihapus; transisi chapter eksplisit | Diganti |

## Perubahan

- Menambahkan **Reader settings** ke More, dibuka di tab baru agar tidak mengorbankan posisi baca.
- Memastikan More tetap satu-satunya tempat aksi sekunder.
- Test baru memastikan link settings ada di overflow dan tidak berada sebagai kontrol header utama.

## Temuan yang belum diperbaiki

1. **Header sticky dua baris** memakan ruang di phone. Auto-hide chrome saat scroll ke bawah dapat membantu, tetapi membutuhkan affordance untuk memunculkan kembali; belum diterapkan agar tidak menghilangkan navigasi tanpa alternatif.
2. **Thumb reach**: navigasi chapter berada di atas. Footer chapter nav ada setelah konten, tidak sticky. Belum diubah.
3. **Reader settings** membuka tab baru; di PWA standalone tab baru bisa terasa keluar dari aplikasi. Alternatif drawer settings akan lebih baik pada Goal 14/16.
4. Progress sync failure tidak memiliki retry khusus; error hanya terlihat bila controller melaporkan.
5. Mode fullscreen tidak memiliki indikator state di menu (label tetap Fullscreen).
6. Preload hanya berbasis viewport, belum adaptif terhadap kecepatan jaringan.

## Validasi

- Reader tests 11 passed, termasuk overflow settings link.
- Keyboard dan page failure sudah diuji kode.
- Typecheck/lint.
- Browser Reader phone 390×844 dari Goal 5; build Goal 12 perlu screenshot final.

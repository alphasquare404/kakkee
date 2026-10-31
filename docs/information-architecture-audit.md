# Information architecture audit

Tanggal: 1 November 2026  
Status: **Goal 2 complete**  
Cakupan: navigasi utama, filter, katalog source, Library, Manga Detail, Search, Downloads, Extensions, Settings, dan halaman konfigurasi.

## Pertanyaan audit

- Apakah ini navigasi, filter, sorting, view, konfigurasi, atau item action?
- Apakah fitur berada di halaman yang tepat?
- Apakah tab ini sebenarnya halaman?
- Apakah halaman ini sebenarnya filter?
- Apakah konsep yang tidak berhubungan tercampur?
- Apakah konsep yang berhubungan dipisahkan tanpa alasan?

## Keputusan IA

### Library

- **Kategori adalah navigasi.** Kategori adalah koleksi tersimpan, bukan predicate sementara. Category tabs tetap.
- **Publication status dan loaded predicates adalah filter.** Keduanya dipindahkan ke filter surface; bukan navigation.
- **Filter source tidak lagi berupa daftar 107 radio di popover.** Filter sekarang drawer dengan:
  - pencarian source;
  - daftar source yang bisa di-scroll;
  - publication status;
  - loaded-title predicates;
  - Reset dan Done yang sticky.
- **Sort tetap menu kecil** karena hanya dua keputusan.
- **View Grid/List tetap toggle** karena hanya mengubah representasi.
- **Selection dan maintenance tetap di More**, bukan header utama.

**Root cause:** popover menu yang awalnya cukup untuk 5–10 source tidak diskalakan saat server memiliki 106 source. Filter juga mencampur tiga tingkat keputusan dalam satu menu.

### Source results

- **Filters** dan **Source preferences** dipisahkan.
  - Filters berisi result filter dan source filter.
  - Source preferences adalah konfigurasi source, dibuka dari More di page header.
- Ini menghindari drawer “filter” yang diam-diam menyimpan pengaturan secara otomatis, sementara filter lain memerlukan Apply.
- Source preferences tetap kontekstual di source, bukan dipindahkan ke Settings global, karena nilainya spesifik per source.

### Manga Detail

- Tab **Overview/Chapters** sekarang benar-benar halaman konten, bukan tab dekoratif.
- Chapters adalah default karena task utama halaman adalah membaca.
- Overview memuat tool sekunder: tracking, notes, categories, reader override.
- Chapter toolbar memisahkan filter chapter dan aksi download. **Sisa concern:** pilihan `Download target` masih berada di kelompok filter/tool chapter dan perlu dipisahkan lebih tegas pada Goal 3/4.

### Search

- Search server dan “Search installed sources” adalah dua model hasil yang berbeda dalam satu halaman.
- **Sisa concern:** hasil live source muncul di atas hasil server tanpa pemisahan tab yang tegas. Ini masuk Goal 7 (task flow) karena pengguna perlu memahami kapan harus memakai mode yang mana.

### Downloads

- Queue, downloaded chapters, dan file “This device” adalah tiga konsep berbeda dan dipisahkan dengan section.
- Offline library adalah halaman terpisah karena task-nya membuka file lokal, bukan mengelola server queue.
- **Sisa concern:** ukuran dan status device download masih bercampur dengan server stats pada header; masuk Goal 8/15.

### Extensions

- Section Updates available, Installed, Available, Stores, dan Add store sudah merupakan pengelompokan yang benar.
- Updateable extension tidak lagi muncul di dua section.
- Stores adalah konfigurasi katalog, tetap di halaman Extensions karena hanya relevan di sana.

### Settings

- Settings landing adalah **connection status + direktori pengaturan**. Ini lebih tepat daripada menampilkan semua isi konfigurasi sekaligus.
- Subpage tetap menjadi tempat perubahan; landing tidak menduplikasi field.
- Tracking dan Reader override tetap kontekstual di Manga Detail; pengaturan globalnya tetap di Settings.

### About, Backup, Sync, Tracking, Migration

- Semua berada di Settings karena merupakan konfigurasi lintas konten.
- Migration bukan Settings; ia adalah task satu kali. Saat ini belum ada route migration yang terlihat di shell; ini masuk Goal 7/10 bila akan diaktifkan.

## Perubahan yang tidak dilakukan

- Tidak memindahkan kategori ke filter global; kategori tetap navigasi.
- Tidak memindahkan source preferences ke Settings; scope-nya per source.
- Tidak menjadikan semua filter sebagai drawer; sort dan source language tetap select/menu kecil.
- Tidak menggabungkan History dan Updates; keduanya menjawab pertanyaan berbeda.

## Validasi

- `LibraryPage.test.tsx` diperbarui untuk drawer: dialog, source search, checkbox status, Escape, Done, focus return.
- Typecheck dan lint lulus.
- Browser 1280×900: drawer filter dengan 107 source, pencarian source, publication status, loaded titles, Reset/Done.
- Browser 390×844: drawer menjadi full-screen; footer sticky tetap terlihat.
- Browser source page: source preferences terbuka di drawer terpisah, bukan di dalam Filters.

## Sisa concerns

1. Search: dua model hasil (server vs live sources) perlu pemisahan task flow.
2. Chapter toolbar: download target masih bercampur dengan filter chapter.
3. Downloads: stats server dan device perlu hierarki yang lebih jelas.
4. Migration route belum terlihat di shell; konfirmasi cakupan.
5. Source preferences sekarang drawer terpisah; perlu empty/loading state yang jelas (sudah ditambahkan).

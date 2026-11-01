# Implementation review — hasil dan kesimpulan

**Sumber:** `kakkee-implementation-review.json` dari reviewer **AlphaSquare**  
**Diekspor:** 2026-11-01 15:39 UTC  
**Review date:** 2026-10-31  
**Cakupan:** 136 fitur  
**Snapshot:** [implementation-review-filled.json](implementation-review-filled.json)

## Ringkasan angka

| Kategori | Jumlah |
|---|---:|
| Ditandai `aman` | 79 |
| Komentar di luar `aman` | 43 |
| Belum diberi komentar | 14 |
| Total | 136 |

Angka 43 **bukan berarti 43 bug**. Di dalamnya ada permintaan perubahan, pertanyaan klarifikasi, laporan bug, dan beberapa komentar positif/typo. 14 fitur yang belum dikomentari harus ditinjau terpisah; reviewer menyatakan akan melanjutkannya nanti.

## Kesimpulan utama

1. **Model interaksi Library harus diubah, bukan sekadar dirapikan.**  
   Reviewer tidak menemukan selection mode, dan meminta selection dihapus sepenuhnya. Sebagai gantinya: context menu pada kartu manga melalui klik kanan di desktop dan long-press di touchscreen, berisi View Details, Continue Reading, Remove from category, Remove from library, Mark read/unread, dan aksi lain.

2. **Library saat ini punya fitur yang tidak terlihat.**  
   Selection mode sebenarnya ada di More > Select dan long-press, tetapi tidak ditemukan. Density comfortable/compact ada di Settings, tetapi di Library hanya terlihat Grid/List. Ini masalah discoverability, bukan semata-missing code.

3. **Reader adalah area paling bermasalah dan perlu audit tersendiri.**  
   Page scale modes dilaporkan broken. Chrome desktop/tablet/mobile, page gap, first-page offset, safe area, default per mode, device profiles, auto-scroll, dan resume dari History perlu direproduksi dan diperbaiki bersama.

4. **Pagination harus diganti dengan auto-load.**  
   Reviewer secara eksplisit menolak tombol Load more untuk chapter list dan source manga. Daftar berikutnya harus dimuat saat scroll mendekati akhir.

5. **Ada bug/alur yang menghalangi tugas inti.**  
   Basic auth menghasilkan “session is not valid”, History tidak membuka halaman yang benar, tracker tidak bisa terhubung, menu chapter terhalang, dan tombol Read from start tidak ada.

6. **Feature parity belum boleh dianggap selesai.**  
   Bahasa belum sepadan dengan WebUI, extension/installed data perlu klarifikasi client vs server, dan 14 fitur belum direview.

## Temuan per area

### Connection dan authentication

- **#1:** Reviewer tidak ingin halaman compatibility check; setelah connect langsung masuk Library.
- **#4:** Basic auth/simple login gagal dengan pesan `Server requires authentication, but the session is not valid.` Ini harus direproduksi pada server yang memakai auth; server baseline saat ini `NONE`, sehingga failure mungkin berasal dari alur sesi Basic/SIMPLE_LOGIN.

### Shell dan badge

- **#8:** Badge tidak muncul di mobile. Kode saat ini hanya menaruh badge pada sidebar desktop; trigger More di mobile hanya membawa badge download, tidak membawa badge extension-update. Primary mobile items (Library, Updates, Browse, Search) tidak memiliki badge.
- **#32:** Reviewer meminta badge jumlah download **di device** ditambahkan pada kartu manga.

### Bahasa

- **#10:** Bahasa harus disamakan ketersediaannya dengan WebUI. Saat ini UI hanya English dan Indonesia; ini bukan parity penuh.

### Library

- **#15:** Hanya ada List dan Grid. Density comfortable/compact ada sebagai preferensi Settings, tetapi tidak terekspos di toolbar Library.
- **#18:** Fuzzy filter diminta dihapus.
- **#19:** Riwayat pencarian dianggap aman; reviewer menanyakan berapa banyak item yang ditampilkan.
- **#20:** Reset all filters di More diminta dihapus; Reset di panel filter sudah cukup.
- **#22:** Mode AND/OR tidak ditemukan/dipahami.
- **#24:** Local loaded-page shuffle tidak dipahami; perlu dijelaskan atau dihapus.
- **#25:** Tombol Continue reading pada card diminta dihapus. General comment tetap menginginkan Continue Reading sebagai item context menu.
- **#26:** Selection manga tidak ditemukan; reviewer ingin selection dihapus sepenuhnya.
- **#28:** Bulk category assignment tidak diperlukan jika selection dihapus.
- **#29:** Remove from library boleh untuk single; bulk tidak diperlukan.
- **#30,#31:** Duplicate detection dan Sync button dianggap OK.
- **#35:** Cara memilih kategori tidak jelas.
- **#121:** Preferensi layout di Settings dianggap aman, tetapi ilustrasi layoutnya keluar dari card/terpotong.

### Manga Detail dan chapters

- **#37:** Tombol Read from start tidak ada. Kode saat ini hanya memilih in-progress chapter atau chapter pertama dalam urutan yang tersedia; tidak ada CTA kedua untuk mulai dari chapter pertama ketika urutan terbaru aktif.
- **#46:** Mark all previous chapters tidak dapat dipastikan karena menu chapter terhalang.
- **#48:** Load more chapter harus diganti auto-load saat scroll.
- **#50,#51:** Bookmark dan mark read/unread dianggap aman.

### Reader

- **#58:** Reviewer akan mengaudit chrome UI Reader.
- **#64:** Page scale modes (width/height/screen/original) masih broken di desktop, tablet, dan mobile.
- **#65:** Stretch small pages dan custom width perlu audit.
- **#66:** Page gap, first-page offset, dan safe-area inset perlu audit.
- **#67,#120:** Default per mode perlu audit.
- **#68:** Per-device profiles perlu audit.
- **#77:** Cara mengatur kecepatan dan jarak auto-scroll tidak ditemukan.
- **#90:** Resume dari History tidak membuka halaman yang tercatat.
- **#91:** Cara memakai client hide-read filter tidak ditemukan.

### Downloads, Source, Extensions, Tracking, Categories

- **#96:** Maksud “download/serve conversion lists” tidak jelas; perlu dijelaskan atau dihapus dari matrix.
- **#98:** Source manga juga tidak boleh memakai tombol Load more; harus auto-load saat scroll.
- **#101:** Maksud saved source searches/global search tidak jelas.
- **#102:** Reviewer bertanya apakah daftar extension terpasang berasal dari client atau server.
- **#105:** Source configuration tidak ditemukan; fitur ada di balik More > Source preferences, jadi ini masalah discoverability.
- **#106,#107,#108:** Tracker tidak bisa terhubung; seluruh alur auth/config/bind/score perlu diaudit.
- **#111:** Assignment dan default-category behavior tidak dipahami.
- **#4:** Basic auth error juga termasuk blocker koneksi.

## Positif yang perlu dipertahankan

- Duplicate detection/overview.
- Sync button.
- Bookmark/unbookmark.
- Mark read/unread dan mark previous read.
- Sebagian besar fitur lain (79 baris) ditandai `aman`.

## 14 fitur yang belum direview

Fitur berikut belum punya komentar dan tidak boleh dianggap sudah diverifikasi:

- Browse/source/extension-store settings
- Client hide-read preference
- Tracking settings
- Server settings, authentication, database, OPDS/KOReader
- WebUI channel/flavor/update settings
- Local device information
- Search all sources, global source filter, library counts
- Local search history
- Configurable app/reader hotkeys
- Dynamic manga artwork backdrop, custom themes
- About route with versions/update actions
- Persist server URL/session
- Translated UI
- Keyboard/focus/labels on implemented screens

## Catatan penting: komentar reviewer vs bukti kode

- **Selection “tidak ada”** bukan berarti tidak ada kode: selection mode ada di More dan long-press. Reviewer tidak menemukannya. Sesuai permintaan, fitur ini akan dihapus, bukan hanya diperbaiki labelnya.
- **Density “hanya list/grid”** bukan berarti density tidak ada: density ada di Settings. Masalahnya tidak terekspos di Library.
- **Read from start** memang tidak ada sebagai CTA terpisah; ini gap nyata.
- **Load more** memang ada sebagai tombol; ini bukan salah persepsi.
- **Tracker tidak bisa terhubung** perlu dibuktikan di server/service tracker sebelum dianggap bug frontend.
- **Page scale broken** perlu reproduksi visual di 1280/1180/820/390 sebelum perbaikan.

## Dampak jika selection dihapus

Menghapus selection berarti:

- menghapus entry Select di More;
- menghapus bulk category assignment;
- menghapus bulk remove/read/download/delete;
- menghapus selection bar dan long-press selection;
- memindahkan capability single-item ke context menu kartu;
- memperbarui test selection dan dokumentasi parity.

Ini perubahan produk yang lebih besar daripada sekadar menghapus tombol.

# Feature parity remediation plan

**Sumber temuan:** [implementation-review-report.md](implementation-review-report.md) dan [implementation-review-filled.json](implementation-review-filled.json)  
**Baseline:** Suwayomi-WebUI v20260929.01 (r3518), server stable v2.4.2366  
**Status:** rencana; belum ada implementasi yang dimulai dari daftar ini.

## Prinsip eksekusi

1. Jangan mengejar “semua 136 baris” tanpa memisahkan bug, pertanyaan, permintaan desain, dan fitur yang belum direview.
2. Perbaiki correctness dan discoverability sebelum menambah fitur baru.
3. Pertahankan capability saat menghapus kontrol: context menu menggantikan selection, bukan sekadar menghilangkan aksi.
4. Setiap goal harus memiliki bukti runtime di 1280, 1180, 820, 430, dan 390 px serta test yang relevan.
5. Jangan mengubah matriks parity menjadi `Implemented` sebelum alur nyata terbukti.

## Urutan prioritas

### P0 — correctness dan blocker

- Connection langsung ke Library.
- Basic auth/session error.
- Badge mobile.
- Read from start.
- Chapter menu terhalang.
- History resume page.
- Layout illustration di Settings.

### P1 — model interaksi Library

- Context menu kartu dan penghapusan selection.
- Category filter.
- Density tiga mode.
- Penghapusan fuzzy/Reset all/Continue reading yang redundan.

### P1 — Reader

- Audit menyeluruh scale/chrome/gap/safe/profiles/auto-scroll/resume.

### P2 — loading, tracker, localization

- Infinite loading chapter/source.
- Tracker auth/bind/sync.
- Source/extension discoverability.
- Language parity.
- 14 fitur yang belum direview.

## Goals

### Goal 1 — Connection, authentication, and navigation correctness

**Outcome:** koneksi tidak berhenti di layar compatibility yang tidak perlu; auth failure dapat ditindaklanjuti; badge mobile terlihat; History membuka halaman yang benar.

**Scope**

- Setelah connect sukses, navigasi langsung ke `/library`; compatibility check tetap sebagai validasi internal, bukan halaman perantara.
- Reproduksi Basic auth/simple login `session is not valid`; perbaiki alur sesi/cookie atau tampilkan recovery yang benar. Bila server tidak mendukung mode tersebut, tandai `Blocked by server` dengan bukti.
- Mobile More trigger dan isi More menampilkan badge Downloads dan Extensions; primary mobile items yang relevan juga diberi badge bila ruang memungkinkan.
- History resume memakai chapter + page + mode yang tersimpan; test URL dan posisi halaman.

**Acceptance**

- Connect NONE → Library dalam satu langkah.
- Auth gagal menampilkan alasan dan jalur retry/login yang bisa dipakai.
- Badge download/extension terlihat di mobile tanpa membuka menu.
- History entry membuka `?page=` yang sesuai dan halaman yang sama setelah reload.
- Test: connection, auth error, mobile badges, history resume.
- Runtime: 390, 820, 1280.

**Risk:** Basic/SIMPLE_LOGIN bergantung pada cookie/CORS deployment; bisa menjadi blocker server, bukan bug UI.

### Goal 2 — Library interaction model: context menu replaces selection

**Outcome:** tidak ada selection mode; semua aksi kartu tersedia lewat context menu yang jelas dan accessible.

**Scope**

- Hapus `Select` dari More, selection bar, shift-click, dan long-press selection.
- Hapus bulk category, bulk remove/read/download/delete.
- Context menu kartu:
  - View Details
  - Continue Reading
  - Add to category / Remove from category
  - Remove from library
  - Mark read / Mark unread
  - Download / Delete download
  - Bookmark/unbookmark jika relevan
- Trigger:
  - right-click desktop;
  - long-press touchscreen;
  - keyboard `ContextMenu`/`Shift+F10`;
  - overflow affordance yang fokusable untuk screen reader dan touch yang tidak menemukan long-press.
- Hapus tombol Continue reading yang selalu terlihat di card; aksi tetap ada di context menu.
- Hapus Fuzzy filter dan Reset all dari More; Reset filter di panel tetap.
- Tambah Category filter di panel filter Library.
- Tambah badge jumlah download device pada card.
- Density compact/comfortable/grid/list terekspos di Library, bukan hanya Settings.
- Perbaiki ilustrasi density yang keluar dari card.

**Acceptance**

- Tidak ada selection state, checkbox selection, shift range, atau bulk bar.
- Context menu bekerja dengan mouse, touch, dan keyboard; Escape menutup; focus kembali.
- Semua aksi single-item tetap dapat dilakukan dan memiliki test.
- Category filter aktif terlihat di filter count dan Reset hanya muncul saat ada filter.
- Tiga density tampil dengan preview yang tidak terpotong.
- Tidak ada regresi aksesibilitas: menu punya nama, item destruktif memakai wording eksplisit dan konfirmasi.

**Dependency:** harus selesai sebelum menghapus test selection/bulk.

**Risk:** context menu pada card yang juga link memerlukan pencegahan navigasi yang benar; jangan membuat nested interactive element.

### Goal 3 — Chapter list and source pagination

**Outcome:** daftar chapter dan source memuat berikutnya secara otomatis saat scroll; menu chapter tidak terhalang; Read from start tersedia.

**Scope**

- Ganti tombol `Load more chapters` dengan IntersectionObserver sentinel; pertahankan error/retry dan jangan kehilangan posisi scroll.
- Ganti `Load more` source manga dengan auto-load.
- Perbaiki ActionMenu chapter yang terpotong oleh row/overflow; gunakan portal/positioning yang tidak terhalang.
- Tambah CTA `Read from start` ketika primary CTA adalah chapter terbaru/in-progress, tanpa menghilangkan `Read latest chapter`.
- Pastikan `Mark previous as read` tetap dapat dijangkau.

**Acceptance**

- Scroll ke akhir memuat halaman berikutnya satu kali, tidak dobel, dan tidak reset.
- Tidak ada tombol load more yang terlihat; loading indicator tetap ada.
- Chapter menu tampil penuh di 390/820/1280.
- Read from start dan read latest sama-sama tersedia saat relevan.
- Test pagination, error retry, dan menu placement.

### Goal 4 — Reader end-to-end audit and repair

**Outcome:** Reader dapat dipercaya di desktop, tablet, dan phone; scale, chrome, gap, safe area, profile, auto-scroll, dan resume konsisten.

**Scope**

- Reproduksi dan perbaiki fit-width, fit-height, screen, original, stretch small pages, custom width.
- Audit header/footer/canvas di 1280×900, 1180×820, 820×1180, 430×932, 390×844.
- Pastikan page gap, first-page offset, dan safe-area inset sesuai.
- Perjelas kontrol auto-scroll (kecepatan, jarak/step) dan simpan pref.
- Audit per-mode defaults dan per-device profiles; bedakan default global vs profile mode.
- Perbaiki History resume agar halaman yang dibuka sama dengan entry.
- Pertahankan page content edge-to-edge; kontrol aman.
- Dokumentasikan batas zoom: viewport aplikasi terkunci; Reader belum punya explicit content zoom.

**Acceptance**

- Empat scale mode menghasilkan ukuran yang berbeda dan benar di tiap viewport.
- Tidak ada clipping/overflow pada header, halaman, atau kontrol.
- Profil mode dan device bertahan setelah reload.
- Auto-scroll bisa diatur dan berhenti dengan jelas.
- History resume pixel/page benar pada dua entry berbeda.
- Screenshot before/after per viewport.

**Risk:** perubahan scale menyentuh layout Reader global; jangan mengubah perilaku safe-area PWA.

### Goal 5 — Tracking, source, and extension reliability

**Outcome:** alur tracker dan source configuration dapat ditemukan/dijalankan; pertanyaan client/server dijawab dengan bukti.

**Scope**

- Reproduksi koneksi tracker dengan kredensial uji; audit auth, service list, bind/unbind, private binding, score/progress/status, sync.
- Bila server tidak menyediakan service yang dimaksud, tandai `Blocked by server` dan tampilkan pesan jelas, bukan form yang tampak berfungsi.
- Buat Source preferences mudah ditemukan dari Source page (bukan hanya More).
- Jelaskan/verifikasi daftar installed/available extensions berasal dari server; jangan menampilkan data client sebagai server.
- Klarifikasi saved source searches/global search dan conversion lists di dokumentasi; hapus baris yang tidak didukung.
- Perjelas category assignment/default-category behavior dan hide-read location.

**Acceptance**

- Tracker yang didukung server dapat login, bind, sync, dan error-nya benar.
- Source preferences terlihat tanpa membuka More.
- Extension source-of-truth terdokumentasi dan teruji.
- Fitur yang tidak didukung tidak diklaim `Implemented`.

### Goal 6 — Language parity

**Outcome:** daftar bahasa dan kualitas terjemahan sesuai keputusan parity WebUI, tanpa mengklaim bahasa yang belum diterjemahkan.

**Scope**

- Enumerasi locale upstream yang benar-benar didukung pada baseline.
- Tentukan bahasa prioritas berdasarkan permintaan reviewer/WebUI.
- Tambah katalog terjemahan dan fallback yang aman; jangan mesin-terjemah diam-diam.
- Audit label form, error, empty state, Reader, Settings, PWA.
- Perbarui language selector dan test.

**Acceptance**

- Bahasa yang ditampilkan benar-benar tersedia dan dapat diganti.
- Tidak ada string kunci/Indonesia bocor pada locale lain.
- Fallback jelas untuk string yang belum diterjemahkan.
- Matriks parity mencatat bahasa yang masih missing.

**Risk:** parity bahasa adalah pekerjaan terjemahan besar; bisa dipecah per locale. Jangan menunda Goal 1–5 karenanya.

### Goal 7 — Complete review and parity documentation

**Outcome:** 14 fitur yang belum direview ditinjau; matriks parity diperbarui dengan bukti; semua goal ditutup atau ditandai blocked.

**Scope**

- Review 14 baris kosong: browse/source settings, hide-read, tracking settings, server settings, WebUI channel, device info, search all sources, local search history, hotkeys, dynamic backdrop, About, persistence, translations, keyboard/focus.
- Update `suwayomi-webui-feature-parity.md` hanya setelah runtime evidence.
- Catat blocked-by-server vs missing-frontend.
- Regression matrix dan screenshot akhir.
- Perbarui `implementation-review-report.md` dengan status per temuan.

**Acceptance**

- Tidak ada baris review yang kosong.
- Setiap status parity memiliki bukti kode/runtime/server.
- Semua test, lint, typecheck, codegen, build lulus.
- Dokumen commit dan tidak ada klaim yang belum diuji.

## Rekomendasi mulai

Mulai dari **Goal 1 (P0)** karena kecil, terukur, dan memperbaiki blocker navigasi/auth/badge/resume. Setelah itu **Goal 2** karena perubahan model Library akan menghapus banyak kode dan test; jangan mencampurnya dengan perbaikan Reader.

**Jangan mulai dari Goal 6 (bahasa)** sebelum model interaksi dan Reader stabil; perubahan string akan terus terjadi.

## Definition of done

- Selection/bulk benar-benar dihapus dan digantikan context menu.
- Semua aksi single-item tetap dapat dilakukan tanpa mouse.
- Auto-load chapter/source bekerja tanpa tombol load more.
- Reader scale/chrome/profile/resume lolos matriks viewport.
- Tracker/source/extension claims sesuai bukti.
- 14 fitur yang belum direview sudah ditutup.
- Parity matrix tidak memuat klaim `Implemented` tanpa bukti.
- Validation lengkap dan commit lokal; tidak push sampai diminta.

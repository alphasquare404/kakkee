# Cross-feature state coherence audit

Tanggal: 1 November 2026  
Status: **Goal 20 complete**

## Sumber kebenaran

| State | Sumber | Konsumen |
| --- | --- | --- |
| Library membership | Server | Library, Source, Manga Detail, Search, Reader |
| Chapter read/bookmark/progress | Server | Manga Detail, Reader, Updates, History, Library counts |
| Category membership | Server | Library tabs, Categories, Manga Detail category picker |
| Downloads | Server/OPFS | Manga Detail, Downloads, Offline |
| Tracking | Server + tracker service | Manga Detail, Settings Tracking |
| Extension state | Server | Extensions, Extension Detail, Browse |
| Source preferences | Server | Source results |

Tidak ada store global duplikat untuk data server. UI memakai controller per halaman + Apollo cache; setelah route mount ulang, query network-only memuat state terbaru.

## Temuan dan perbaikan

### 1. Category counts tidak ikut berubah setelah bulk mutation

**Sebelum:** remove from library, add to category, dan remove from category mengubah items/totalCount Library, tetapi tab kategori tetap menampilkan jumlah lama sampai reload.

**Sesudah:** setelah mutation berhasil, `categoryController.load()` dipanggil untuk menyegarkan hitungan kategori. Ini menjaga:
- All count (dari Library controller);
- per-category count (dari category controller);
- state tab aktif tetap.

**Root cause:** dua controller (library dan categories) memiliki lifecycle sendiri; mutation hanya memperbarui salah satunya.

### 2. Read state

- Reader menulis progress/read ke server.
- Kembali ke Manga Detail me-remount dan memuat ulang query.
- Library/Updates/History memuat ulang saat mount.
- Bulk Mark read memperbarui `unreadCount` item secara lokal; category total tidak berubah (benar, karena total manga tidak berubah).

### 3. Library membership

- Source card toggle memperbarui item Source secara lokal.
- Manga Detail toggle memperbarui detail.
- Library dimuat ulang saat mount; tidak mencoba menyinkronkan semua halaman sekaligus.
- Category counts sekarang disegarkan setelah bulk remove.

### 4. Bookmarks

Reader mengubah bookmark pada chapter aktif; Manga Detail memuat ulang saat dibuka. Tidak ada badge bookmark global yang perlu disinkronkan langsung.

### 5. Downloads

- Queue dan downloaded state berasal dari server.
- Manga Detail menandai queued secara lokal; Downloads memuat server saat mount.
- Delete download di Library memperbarui `downloadCount` item secara lokal.

### 6. Tracking

Tracking record dimiliki `MangaTrackingSection`. Tidak ada tampilan tracking global yang harus segera berubah. Settings Tracking mengelola akun, bukan record manga.

### 7. Extension state

Extension detail dan catalog memuat ulang saat mount. Install/uninstall tidak memengaruhi Library sampai manga dari source ditambahkan.

## Batas konsistensi yang disengaja

- Halaman yang sedang tidak aktif tidak menerima push invalidation; state diperbarui saat mount.
- Apollo cache tidak dipakai sebagai satu-satunya sumber; query network-only menghindari data basi.
- Bulk operation mengubah UI setelah server sukses, bukan optimistically.
- Category counts adalah pengecualian yang harus disegarkan eksplisit karena dua controller.

## Sisa concerns

1. Search results yang sudah dimuat dapat menampilkan `inLibrary` lama bila halaman tidak di-remount; belum ada cache invalidation lintas route.
2. Source page dan Library memakai salinan state masing-masing; perubahan dari tab lain tidak real-time.
3. Tracking record yang diubah di tempat lain tidak memicu refresh Manga Detail yang sedang terbuka.
4. Download progress subscription hanya di Downloads; badge Library memakai query saat mount.
5. Tidak ada event bus global; ini konsisten dengan arsitektur, tetapi berarti real-time coherence terbatas pada subscription yang ada.
6. Category count refresh menambah satu request setelah bulk mutation; dapat dibatch bila perlu.

## Validasi

- `typecheck`, `lint`.
- Existing Library controller tests mencakup local item updates.
- Category refresh ditambahkan pada tiga jalur bulk.
- Browser:
  - source add/remove library (Goal 7);
  - Updates → Reader → Updates (Goal 7);
  - selection bar (Goal 7);
  - category count belum diuji dengan mutation nyata karena data user.

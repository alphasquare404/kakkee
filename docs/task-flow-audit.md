# User task flow audit

Tanggal: 1 November 2026  
Status: **Goal 7 complete**  
Pendekatan: menguji task lengkap, bukan halaman terisolasi.

## Workflow dan hasil

### 1. Library reading

**Alur:** Connect → Library → filter/search → Manga → chapter → Reader.

- Search Library mengirim query ke server dan dapat dibuka dari URL.
- Filter drawer mengubah filter tanpa kehilangan konteks halaman.
- Manga membuka chapter list; chapter membuka Reader.
- Reader Back mengembalikan ke Manga; browser Back berikutnya kembali ke Library.
- Tidak ada langkah tambahan atau dead end.

**Temuan:** filter drawer langsung menerapkan perubahan; user harus menekan Done untuk menutup. Ini intentional karena Apply/Reset tidak diperlukan, tetapi footer memberi status “n active”.

### 2. Discovery

**Alur:** Browse/source/search → Manga → add to library → read.

- Source card menampilkan `Add to library`; setelah sukses berubah menjadi `In library` dengan `aria-pressed=true` dan title `Remove from library`.
- Click kedua mengembalikan ke `Add to library`; state server terlihat.
- Search result membuka Manga dengan provenance Search.
- Live source search menghasilkan link Manga dengan origin Search.

**Temuan:** label `In library` adalah state; title menjelaskan aksi removal. Ini konsisten dengan hero Manga.

**Sisa concern:** belum ada toast; feedback hanya perubahan label/state. Goal 8 akan mengevaluasi apakah itu cukup.

### 3. Reading from feed

**Alur:** Updates/History → Reader → next chapter → return.

- Updates feed row membuka Reader dengan back label `← Updates`.
- Klik `← Updates` mengembalikan ke `/updates`.
- Reader Next/Previous mempertahankan Reader state.
- History origin harus kembali ke History; belum diulang runtime setelah perubahan Reader chrome, masuk Goal 12.

**Temuan:** feed row adalah link chapter, bukan link Manga. Ini benar karena task feed adalah melanjutkan chapter.

### 4. Download

**Alur:** pilih chapter → download → queue → downloaded state → offline/read.

- Chapter row memiliki download toggle; state queued/downloaded ditampilkan lewat ikon.
- Download target server/device dipilih di chapter More.
- Downloads menampilkan queue, downloaded chapters, dan device files.
- Offline library adalah halaman terpisah.

**Temuan:** tidak ada dialog konfirmasi untuk menghapus download; aksi destruktif kecil. Goal 9/11.

**Sisa concern:** tidak ada link langsung dari chapter “queued” ke Downloads; user harus membuka Downloads. Ini dapat diterima, tetapi perlu feedback yang lebih jelas pada Goal 8.

### 5. Tracking

**Alur:** Manga → Overview → Tracking → search tracker → bind → update progress.

- Tracking section tersedia di Overview.
- Form search/bind ada; empty copy sebelumnya salah mengatakan “search-and-bind is not implemented” padahal form tersedia.
- Sync progress muncul jika ada record.

**Perbaikan:** copy empty state diganti menjadi “Search for it below or log in to a tracker in Settings.”
**Sisa concern:** runtime bind membutuhkan tracker login; tidak diuji dengan akun nyata. Goal 9/20.

### 6. Management

**Alur:** Library → Select → pilih item → bulk action.

- Selection bar hanya muncul setelah selection.
- Bulk actions: category, remove, read/unread, download, delete download, clear.
- Source long-press selection tersedia.

**Temuan:** bulk bar memiliki 8 tombol; ini contextual dan hanya muncul saat dibutuhkan, tetapi pada phone perlu diuji Goal 15.

## Perbaikan yang dibuat

- Source card action memiliki `title` yang menjelaskan removal saat sudah di library.
- Tracking empty copy tidak lagi menyatakan fitur belum ada.
- Label `Mark earlier as read` dipindahkan ke overflow per chapter agar flow baca tidak terganggu aksi bulk yang jarang.

## Task flow yang belum diuji runtime

- Tracking bind dengan akun tracker nyata.
- Download sampai file offline dibuka di perangkat.
- Migration/backup/sync flow (memerlukan data server dan konfigurasi).
- Retry setelah kegagalan jaringan pada setiap mutation.

## Sisa concerns

1. Feedback mutation masih bergantung pada perubahan state lokal; belum semua mutation punya status pending/success yang eksplisit. Goal 8.
2. Reader History origin perlu diuji ulang. Goal 12.
3. Empty states belum menawarkan next action yang konsisten. Goal 10.
4. Download failure recovery belum diuji. Goal 9.
5. Bulk bar phone layout dan touch target. Goal 15/11.

## Validasi

- Browser 1280×900: Add/remove library dari Source; Updates → Reader → Updates; selection bar.
- `typecheck`, `lint`, `build`.

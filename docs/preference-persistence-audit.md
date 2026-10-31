# Preference persistence audit

Tanggal: 1 November 2026  
Status: **Goal 19 complete**

## Kategori state

| Kategori | Contoh | Storage | Alasan |
| --- | --- | --- | --- |
| Persistent device preference | theme, accent, locale, library view/density/badges/continue, download target | `localStorage` | bertahan reload/browser/PWA relaunch |
| Persistent connection | last server URL, auto-connect, opt-in refresh token | `localStorage` | memungkinkan reconnect |
| Persistent library defaults | category, status/statuses, sort | `localStorage` | hanya saat user memilih Save defaults |
| Persistent reader | reader settings, manga override, chapter view filter | `localStorage` | preferensi baca jangka panjang |
| Persistent local history | search history, source search history, tracking prefs | `localStorage` | kenyamanan lokal |
| Server-side preference | source preferences, library membership, progress, tracking | Server | sumber kebenaran lintas device |
| Transient route | query search, category aktif, filter drawer, sort saat ini, selection | URL/memory | tidak boleh mengotori preferensi |

## Storage keys

```text
suwayomi.app-preferences.v1
suwayomi.library-preferences.v1
suwayomi.reader-settings.v1
suwayomi.manga-reader-overrides.v1
suwayomi.chapter-view-preferences.v1
suwayomi.history-preferences.v1
suwayomi.source-preferences.v1
suwayomi.tracking-preferences.v1
suwayomi.library-search-history.v1
suwayomi.source-search-history.v1
suwayomi.last-server.v1
suwayomi.auto-connect.v1
suwayomi.remembered-session.v1
```

## Keputusan dan temuan

### Library view

Grid/List adalah preferensi perangkat. Toggle langsung memanggil `updateAppPreferences`; bertahan reload.

### Library defaults

Category, status/statuses, dan sort **tidak otomatis** menjadi default saat berubah. User harus `Save defaults`. Ini memisahkan eksperimen filter dari preferensi permanen.

### Library filter aktif

Search ada di URL; category dan filter di memory/controller. Reload kembali ke default. Ini intentional agar link tidak membawa state filter yang tidak diinginkan.

### Reader

Reader settings dan override per manga disimpan lokal. Progress halaman disimpan server, bukan localStorage. Fullscreen/auto-scroll tidak dipersist karena merupakan state sesi.

### Server URL dan session

- Server URL disimpan setelah connect.
- Auto-connect opt-in.
- Refresh token disimpan **hanya jika** user memilih “Remember login on this device”; access token tetap di memori.
- Logout/ganti server menghapus refresh token tersimpan.
- Tradeoff XSS/local device sudah dicatat di architecture; password tidak pernah disimpan.
- Ini bukan token di URL/log/cache SW.

### Source preferences

Disimpan server, bukan localStorage; karena itu tersedia lintas device dan mengikuti source.

### Search history

Library dan source search history disimpan lokal; dapat dihapus dari UI. Tidak berisi kredensial.

## Perbaikan dokumentasi

- PWA audit sebelumnya mengatakan token tidak dipersist ke localStorage. Ini tidak akurat: refresh token **opt-in** dapat disimpan. Dokumentasi dikoreksi untuk membedakan access token (memori) dan refresh token (opt-in localStorage).

## Sisa concerns

1. Route terakhir tidak dipulihkan setelah relaunch; user dengan auto-connect tetap kembali ke halaman awal.
2. Current sort/category Library tidak otomatis dipertahankan; hanya default tersimpan.
3. Preference localStorage tidak disinkronkan antar tab; tab kedua baru membaca saat load.
4. `remembered-session` localStorage adalah tradeoff keamanan; perlu policy device bersama.
5. PWA iOS dapat membersihkan storage; user harus reconnect.
6. Belum ada tombol “hapus semua preferensi lokal” terpusat selain logout/clear history.

## Validasi

- Audit key dan lifecycle pada modul preferences.
- Test preference yang ada (`appPreferences`, `libraryPreferences`, `readerSettings`, dsb.).
- Typecheck/lint/build.

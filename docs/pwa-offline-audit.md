# PWA and offline audit

Tanggal: 1 November 2026  
Status: **Goal 14 complete**  
Fokus: installability, standalone, relaunch, safe area, service worker, offline shell, offline downloads, cache safety, iOS.

## Konfigurasi

- `display: standalone`
- `id`, `start_url`, `scope` mengikuti `basePath`
- ikon 192, 512, dan maskable
- theme/background color sesuai visual gelap
- `viewport-fit=cover` dan safe-area padding
- service worker `registerType: prompt`, `skipWaiting: false`, `clientsClaim: false`
- update prompt tersedia (`PwaUpdatePrompt`)
- precache hanya asset shell (`js/css/html/png/svg/ico/webmanifest`)
- `navigateFallback` ke index, dengan `/api` denylist
- `runtimeCaching: []` sehingga GraphQL/API/gambar privat tidak di-cache oleh SW

## Temuan dan perbaikan

### 1. Icon HTML tidak base-aware

**Sebelum:** `index.html` memakai `/icons/favicon-32.png` dan `/icons/apple-touch-icon.png`. Saat aplikasi di-deploy di `/app/`, icon mengarah ke root domain.

**Sesudah:** memakai `%BASE_URL%icons/...`. Build `/app/` menghasilkan `/app/icons/...`; manifest juga `/app/`.

### 2. Relaunch / reload

- Auto-connect bersifat opt-in (`Reconnect automatically on this device`).
- Tanpa auto-connect, reload/relaunch kembali ke Connection; ini perilaku yang disengaja, bukan kegagalan provenance.
- Dengan auto-connect, server URL dipulihkan; token login tetap mengikuti aturan session storage, bukan cache SW.
- Route Manga yang sedang dibuka tidak dipulihkan bila koneksi belum siap; user harus membuka ulang dari history/browser. Ini concern Goal 19.

### 3. Offline shell

- SW menyajikan shell statis saat offline.
- API tidak di-fallback ke HTML.
- Data server tetap memerlukan koneksi.
- PwaUpdatePrompt membedakan “shell siap” dari “data server siap”; copy tidak menjanjikan data offline.

### 4. Offline downloads

- OPFS menyimpan chapter + manifest di perangkat.
- Hanya tersedia pada secure context (HTTPS/localhost); HTTP LAN tidak dapat memakai OPFS/Service Worker.
- `isOfflineStorageSupported` menyembunyikan aksi device dan menampilkan pesan dukungan.
- Offline reader memakai blob lokal, bukan request server.

### 5. Cache safety

- SW tidak menyimpan response `/api`, GraphQL, thumbnail, halaman reader, atau token.
- Object URL untuk media privat dibuat dan direvoke oleh `useImageResource`/ResourceService.
- `dispose` pada pergantian server membersihkan resource.

### 6. Safe area dan standalone

- `viewport-fit=cover`, padding `env(safe-area-inset-*)` pada shell, header, bottom nav.
- Mobile bottom nav dan drawer full-screen sudah diuji pada 390×844.
- Status bar iOS memakai `black-translucent` dengan permukaan gelap.

## Batasan platform

- iOS WebKit: install lewat Share sheet, tidak ada `beforeinstallprompt`; OPFS/SW tergantung versi dan secure context.
- Tidak dapat menguji instalasi nyata/PWA launch di perangkat dari headless Chrome.
- Update prompt hanya dapat dipicu oleh SW baru; tidak diuji dengan deploy bertahap.
- Offline shell tidak menyediakan data perpustakaan; hanya file yang telah disimpan ke device.

## Sisa concerns

1. Route restoration setelah relaunch dengan auto-connect belum diimplementasikan.
2. Tidak ada banner “offline” global; status terlihat dari error/connection.
3. Tidak ada uji perangkat iOS/Android nyata.
4. Manifest `lang: id` tetapi default UI dapat English; Goal 17.
5. Cache shell ~989 kB; tradeoff offline.
6. Token login tidak dipersist ke localStorage; konsisten dengan keamanan, tetapi sesi UI_LOGIN berakhir setelah relaunch. Perlu keputusan produk pada Goal 19.

## Validasi

- Build root: icon `/icons/...`.
- Build subpath `/app/`: icon `/app/icons/...`, start_url `/app/`.
- PWA config tests (scope, icon paths, workbox denylist, no runtime caching).
- Browser PWA update prompt sudah terlihat pada screenshot sebelumnya.
- Typecheck/lint/build.

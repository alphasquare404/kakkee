# Arsitektur frontend Suwayomi

Status: **Phase 0 COMPLETE** — fondasi Step 1–10 tervalidasi. Phase 1 memiliki reference-driven shell dan top-level pages: Library, Updates, Browse, Categories, History, Downloads, Settings, Manga Detail, dan vertical Reader. Functional baseline resmi dipin pada Suwayomi-WebUI `v20260929.01` (r3518); progress write, source browsing/extension management, download queue, migration, tracking, sync, backup, dan full Settings parity masih parity work. Target minimum server: stable v2.4.2366. Bukti ada di [phase-0-validation.md](phase-0-validation.md), [phase-1-library-ui.md](phase-1-library-ui.md), [phase-1-manga-reader.md](phase-1-manga-reader.md), [phase-1-visual-redesign.md](phase-1-visual-redesign.md), dan [suwayomi-webui-feature-parity.md](suwayomi-webui-feature-parity.md).

## Tujuan

Satu aplikasi React untuk desktop, mobile, dan PWA iOS/Android. Frontend baru berkomunikasi dengan Suwayomi Server yang sudah ada; tidak mengganti atau mengubah server. Fase awal menghasilkan alur koneksi → autentikasi bila diperlukan → Connected; Phase 1 menambahkan shell visual dan fitur membaca. Functional parity target berasal dari WebUI resmi, sedangkan arah visual berasal dari `Refrence/`.

## Pembagian tanggung jawab

```text
Pengguna / Browser / PWA
          |
React UI + Router (form, status, informasi server)
          |
Connection coordinator (alur koneksi dan pergantian server)
          |
  +-------+----------------+------------------+
  |                        |                  |
Auth service         GraphQL clients    Resource service
(sesi bersama)       HTTP + WebSocket    (fetch/Blob/cleanup)
  |                        |                  |
  +----------- Server URL resolver -----------+
                           |
                  Suwayomi stable server

Schema stable -> Codegen -> operasi dan tipe terverifikasi
PWA shell membungkus aplikasi; tidak menyimpan konten manga offline
```

UI seperti loket: menerima input dan menampilkan hasil. Services mengurus aturan koneksi, sesi, dan resource agar setiap komponen tidak mengulang logika yang sama. Resolver adalah satu tempat untuk membentuk alamat server. Codegen memeriksa bahwa pertanyaan yang dikirim memang dikenal server.

## Modul yang direncanakan

| Lokasi | Tanggung jawab |
| --- | --- |
| `src/app/` | Bootstrap, provider, router, konfigurasi aplikasi |
| `src/core/config/` | Konfigurasi frontend base dan server base |
| `src/core/server/` | Normalisasi URL, resolver, kompatibilitas, coordinator |
| `src/core/auth/` | Sesi, adapter NONE/UI_LOGIN, perubahan sesi |
| `src/core/graphql/` | Apollo HTTP, graphql-ws, error transport, generated types |
| `src/core/resources/` | Resource terautentikasi, Blob/object URL, lifecycle |
| `src/core/library/` | Repository/controller Library, pagination/filter/state, category navigation |
| `src/core/catalog/` | Chapter feeds dan read-only source/category catalog |
| `src/core/manga/` | Repository/controller Manga Detail dan chapter pagination |
| `src/core/reader/` | Chapter metadata, neighbor navigation, page-path controller |
| `src/features/connection/` | Form koneksi/login, status dan aboutServer |
| `src/features/library/` | Library screen, category/search/filter/sort, grid |
| `src/features/updates/` | Latest library chapter feed |
| `src/features/activity/` | Shared chapter feed untuk History/Downloads |
| `src/features/browse/` | Source catalog |
| `src/features/categories/` | Category overview |
| `src/features/settings/` | Connection/server/app information |
| `src/features/manga/` | Manga Detail dan chapter list |
| `src/features/reader/` | Vertical Reader dan resource lifecycle |
| `src/shared/` | `useImageResource`, `AmbientArt`, `FeedRow`, `PageHeader`, utilitas umum |
| `graphql/` | Snapshot stable, metadata, operasi yang diverifikasi |
| `tests/` | Integrasi lintas modul dan skenario deployment |

Ini lokasi yang diharapkan, bukan perintah membuat semua folder kosong. Modul dibuat ketika langkah implementasi membutuhkannya. Detail nama file dapat disesuaikan dengan alasan yang dicatat; batas tanggung jawab tetap berlaku.

React state cukup untuk input/form. Apollo menyimpan data server. Zustand belum dibutuhkan sampai terbukti ada state lokal bersama yang sulit dikelola. Versi dependency dan runtime tercatat di `package.json` dan README. GraphQL Code Generator, `graphql`, Apollo Client, `graphql-ws`, `react-router-dom`, `vite-plugin-pwa`, dan typed document node sudah terpasang. UI library belum dipasang.

## Dua alamat yang berbeda

`frontendBasePath` adalah tempat frontend dipasang. Router, asset, manifest, start URL, dan service worker mengikuti alamat ini. `serverBaseUrl` adalah tempat Suwayomi berada. GraphQL, WebSocket, dan resource mengikuti alamat server tersebut.

| Contoh | Frontend | Server | GraphQL |
| --- | --- | --- | --- |
| Custom WebUI | `https://manga.example.com/` | `https://manga.example.com` | `https://manga.example.com/api/graphql` |
| Standalone | `https://reader.example.com/` | `https://manga.example.com` | `https://manga.example.com/api/graphql` |
| Subpath terpisah | `https://reader.example.com/app/` | `https://example.com/suwayomi` | `https://example.com/suwayomi/api/graphql` |

Resource `/api/v1/...` pada contoh terakhir menjadi `https://example.com/suwayomi/api/v1/...`. Menggabungkan URL secara biasa dengan slash awal bisa membuang `/suwayomi`; resolver harus secara eksplisit mempertahankan prefix. Scheme WebSocket mengikuti HTTPS→WSS atau HTTP→WS.

Resolver yang diimplementasikan ada di `src/core/server/serverUrl.ts`, dengan komposisi deployment di `src/core/config/deployment.ts`. Canonical `serverBaseUrl` tidak memakai trailing slash; canonical `frontendBasePath` selalu memakai leading dan trailing slash. Resource relative selalu digabung dengan prefix server; absolute URL hanya diterima jika origin dan prefix cocok. Cross-origin, protocol-relative, traversal, dan credentials ditolak. Same-origin berarti origin sama, bukan path sama.

Deteksi otomatis hanya memakai konfigurasi deployment yang dapat dipercaya. Jika prefix server tidak diketahui, minta URL melalui form koneksi. Jangan menebak dari route halaman. Reverse proxy harus mendukung history fallback frontend dan upgrade WebSocket; standalone membutuhkan CORS yang sesuai untuk HTTP/resource. Pengaturan itu didokumentasikan sebagai kebutuhan operator, tanpa memodifikasi Suwayomi-Server.

## Kontrak, sesi, dan keamanan data

Sebelum menulis operasi, ambil schema dari baseline stable yang identitas versinya terverifikasi. Snapshot dan metadata disimpan bersama proyek agar semua AI memakai kontrak yang sama. Tidak ada schema atau selection set rekaan dalam dokumen ini. Upgrade schema merupakan perubahan terpisah dengan diff dan pemeriksaan kompatibilitas.

Auth service memberikan access token aktif ke HTTP, WebSocket, dan resource service. Snapshot stable dan probe runtime sudah memverifikasi login/refresh, Bearer pada HTTP, serta token mentah pada `connectionParams.Authorization`. Dukungan auth kini mencakup NONE, UI_LOGIN, BASIC_AUTH (header HTTP Basic), dan SIMPLE_LOGIN (cookie sesi server). SIMPLE_LOGIN tidak dapat dideteksi dari API karena endpoint `/api` sengaja terbuka; probe `settings.authMode` membedakannya. Detail bukti dan gap ada di [suwayomi-backend-notes.md](suwayomi-backend-notes.md). UI tidak mengetahui cara menyimpan token. Token UI_LOGIN tetap di memori; kredensial Basic hanya disimpan di sesi memori.

Implementasi Step 5 memisahkan `NONE` sebagai mode sesi nyata dari `UI_LOGIN` unauthenticated/authenticated, menyimpan access dan refresh token hanya di memori, membaca `exp` JWT tanpa verifikasi signature, dan memakai generation guard untuk menolak respons async dari sesi lama. Logout lokal tidak mengklaim revokasi server; refresh tidak merotasi refresh token. Step 5 menyediakan session/lifecycle dan kontrak `AuthTransport`; implementasi fetch login/refresh ada di Step 6.

Implementasi Step 6 menambahkan Apollo Client HTTP, auth link, error link dengan refresh single-flight, dan `graphql-ws` subscription. HTTP memakai Bearer hanya pada UI_LOGIN; WebSocket memakai token mentah di `connectionParams.Authorization`. Refresh maksimal satu kali, Forbidden/NONE tidak memicu refresh, dan hasil stale ditolak oleh generation `AuthService`. Client menyediakan `dispose()`, `clearCache()`, dan `restartWebSocket()`; restart membuat koneksi/link baru dan tidak otomatis me-resubscribe subscription yang sudah aktif.

Implementasi Step 7 menambahkan `ResourceService` untuk resource REST non-GraphQL. Path melalui `DeploymentConfig.resolveResource`; NONE tanpa Authorization, UI_LOGIN memakai Bearer. Fetch memakai `redirect: 'manual'`, `credentials: 'omit'`, validasi origin/prefix pada `response.url`, dan menolak redirect. `AbortSignal` didukung; generation diambil saat request mulai dan dicek sebelum object URL dibuat, sehingga logout/reset tidak menghasilkan handle aktif. `LoadedResource.dispose()` merevoke object URL; `ResourceService.dispose()` membatalkan request dan mencabut semua handle. Tidak ada cache persisten atau deduplikasi.

Implementasi Step 8 menambahkan `ConnectionCoordinator` sebagai owner satu koneksi. Coordinator memegang deployment config, AuthService internal, GraphQL transport, WebSocket/Apollo lifecycle, dan ResourceService; UI hanya menerima context read-only. Alur connect menjalankan `aboutServer`, compatibility gate, lalu protected `AuthProbe`. Probe sukses menjadi NONE; unauthorized menjadi login-required; Basic challenge menjadi unsupported-auth. Login UI_LOGIN memakai `AuthTransport` dan hanya menjadi connected setelah probe ulang berhasil. Generation coordinator menolak hasil connect/login lama setelah switch/disconnect. `dispose()` menutup seluruh service. Versi `v2.4.<revision>` di bawah baseline ditolak; preview/unknown hanya berjalan dengan warning dan operasi baseline yang berhasil.

Implementasi Step 9 menambahkan React boundary `ConnectionProvider`/`useConnection`. Provider membuat satu coordinator per deployment, subscribe ke state, dan men-dispose setelah benar-benar unmount. UI hanya menerima state dan aksi connect/login/disconnect; AuthService, Apollo, WebSocket, ResourceService, dan token tidak diekspos. Router memakai `react-router-dom` dengan basename dari `frontendBasePath` (`VITE_FRONTEND_BASE_PATH`), satu route koneksi, dan fallback. Layar menangani disconnected, connecting, login-required, authenticating, connected, unsupported-auth, dan failed dengan form native, `aria-live`, dan pesan error manusiawi. Server URL dan password hanya React state; tidak ada persistensi. Keputusan persistensi sesi kemudian diperbarui: opt-in **Remember login on this device** menyimpan refresh token di `localStorage`, sementara access token tetap di memori. Sesi dipulihkan lewat `refreshToken`, dan logout/ganti server menghapus token tersimpan. Tradeoff: token tersimpan rentan terhadap XSS/akses device; karena itu opt-in, per-device, dan tidak pernah masuk URL/log.

Implementasi Step 10 menambahkan PWA shell dengan `vite-plugin-pwa`. Manifest memakai `frontendBasePath` untuk `start_url`/`scope`/icon, `display: standalone`, dan icon netral sementara (192/512/maskable). `generateSW` hanya mem-precache `index.html`, JS/CSS shell, icon, dan manifest; `runtimeCaching` kosong dan `/api` dikecualikan dari navigation fallback. Update memakai `registerType: 'prompt'` dan `PwaUpdatePrompt`; SW menangani `SKIP_WAITING`. `skipWaiting`/`clientsClaim` false sehingga update tidak mencampur versi secara otomatis. Viewport/Apple meta/safe-area disiapkan; offline hanya membuka shell, bukan data server. CacheStorage diperiksa setelah connect/login.

Coordinator memiliki state konseptual: belum terhubung, menghubungkan, perlu login, terhubung, gagal, dan mode tidak didukung. Timeout/network/CORS, GraphQL error, dan kredensial ditolak ditampilkan secara berbeda sejauh bukti browser memungkinkan; kegagalan jaringan tidak otomatis berarti password salah. HTTP sukses saja belum berarti Connected: operasi aboutServer terverifikasi harus berhasil. WebSocket memiliki status sendiri; jangan mengklaim subscriptions teruji dari HTTP.

Ganti server/logout harus menutup koneksi lama dan membersihkan cache serta resource. Respons terlambat dari sesi lama tidak boleh mengisi sesi baru. Resource berheader autentikasi dapat dimuat melalui fetch → Blob → object URL; object URL harus dicabut saat tidak dipakai. Tidak ada token di URL/log dan tidak ada kredensial dikirim ke origin lain dari resource/redirect tak tervalidasi.

Implementasi visual/parity menambahkan `src/core/catalog/` untuk chapter feed dan source/category catalog, serta top-level pages Updates/Browse/Categories/History/Downloads/Settings. Shell responsif memakai sidebar desktop dan tab bar mobile; Reader memakai shell tanpa navigasi aplikasi. Semua resource gambar tetap melalui `ResourceService`; hook hanya memiliki lifecycle Blob/object URL. Tidak ada token atau authenticated fetch di UI.

## PWA dan pengujian

Shell menyediakan manifest, ikon, standalone display, viewport, dan safe area. Router serta PWA scope mengikuti frontend base, bukan server base. Service worker hanya menyimpan asset statis yang disetujui; API, auth, dan konten pribadi tidak masuk cache service worker. Unduhan offline eksplisit memakai OPFS (`suwayomi-offline-v1`) dan hanya chapter yang dipilih pengguna; data ini tidak pernah masuk CacheStorage.

Unit test membuktikan aturan URL/sesi/resource. Integration test membuktikan kerja antarbagian dan server stable nyata. Uji browser membuktikan koneksi, login, deep links, dan deployment. Pemeriksaan perangkat diperlukan untuk klaim iOS/Android PWA; hasil desktop atau mock saja tidak mencukupi. Kriteria lengkap ada di rencana Phase 0.

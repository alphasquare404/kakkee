# Phase 0 Final Validation

Tanggal validasi: **29 Oktober 2026**

Baseline: **Suwayomi Server stable v2.4.2366**
Status: **COMPLETE** untuk foundation Phase 0.

Dokumen ini adalah bukti akhir Phase 0. Implementasi fitur manga/library/reader/downloads/tracking belum dimulai.

## 1. Baseline dan artefak

| Item | Nilai |
| --- | --- |
| Server | Suwayomi Server stable `v2.4.2366` |
| Tag | `v2.4.2366` |
| Commit server | `40bc5da57820324ed0ae724cbbc020cc4673b594` |
| JAR SHA-256 | `af9feb20af9d7ebe9e30769e6c6ebc7fc7ab1c447388d42e0280b1da5fe07bfd` |
| Schema | `graphql/schema/stable-v2.4.2366.graphql` |
| Schema SHA-256 | `c7b154383d684e69bc1947aad10fdfbc4f717008f61c755536a3857eecdff749` |
| Node | `v26.4.0` |
| npm | `11.17.0` |
| Browser smoke | Chrome `156.0.8078.48`, headless |

Checksum schema dihitung ulang dengan SHA-256 dan cocok dengan metadata. File schema tidak berubah sejak commit baseline `d6e6b09`.

## 2. Arsitektur final

```text
React UI + Router
       ↓
ConnectionProvider / useConnection
       ↓
ConnectionCoordinator
   ├── AuthService
   ├── GraphQL transport
   │    ├── Apollo HTTP
   │    └── graphql-ws
   └── ResourceService
            ↓
   DeploymentConfig / Server URL resolver
            ↓
   Suwayomi stable server
```

Ownership:

- React UI hanya menerima state dan aksi `connect`, `login`, `disconnect`.
- AuthService dan token tidak diekspos ke UI.
- Apollo Client, WebSocket client, dan ResourceService hanya dimiliki coordinator.
- Semua URL server dibentuk resolver; UI tidak menyusun `/api/graphql` atau URL resource sendiri.
- Generated document adalah satu-satunya sumber operasi GraphQL aplikasi.

Audit boundary:

- `src/features/connection` hanya mengimpor provider/hook dan tipe state/error.
- Tidak ada `fetch`, `new ApolloClient`, `new WebSocket`, `AuthService`, atau `ResourceService` di UI.
- Authorization hanya dibentuk di `createClient.ts` dan `resourceService.ts`.
- Tidak ada token di URL, localStorage, sessionStorage, atau cookie aplikasi.
- Service worker hanya menangani shell statis.

**Hasil: PASS.**

## 3. Commit range dan milestone

| Commit | Milestone |
| --- | --- |
| `d6e6b09` | Baseline Phase 0 dan stable schema |
| `5b09c6d` | GraphQL codegen lokal |
| `d4df29c` | Deployment/server URL resolver |
| `2ee225d` | Auth/session foundation |
| `2fe370d` | GraphQL HTTP/WebSocket transport |
| `0063cca` | Authenticated resource service |
| `90c42ae` | Connection coordinator |
| `d427ecf` | Connection/login UI |
| `f49f97d` | Installable PWA shell |
| final validation commit | Dokumentasi validasi akhir Phase 0 |

## 4. Perintah validasi

Dijalankan pada root repository:

```text
npm run codegen
npm run codegen:check
npm run lint
npm run typecheck
npm run test
npm run build
VITE_FRONTEND_BASE_PATH=/app/ npm run build
```

Hasil:

| Command | Hasil |
| --- | --- |
| `codegen` | PASS |
| `codegen:check` | PASS, exit 0 |
| `lint` | PASS |
| `typecheck` | PASS |
| `test` | PASS, 143 test / 20 files |
| root `build` | PASS |
| subpath `build` | PASS |

Test suite mencakup 7 integration test runtime stable (GraphQL transport, resource service, connection coordinator). Runtime browser/PWA checks dijalankan terpisah.

## 5. Runtime matrix

Status: **PASS** = dijalankan dan berhasil; **PARTIAL** = bukti tidak lengkap; **NOT TESTED** = belum dijalankan.

| Area | Kasus | Status | Bukti |
| --- | --- | --- | --- |
| Root NONE | invalid URL → failed | PASS | UI menampilkan “Alamat server tidak valid” |
| Root NONE | connect/aboutServer/probe/Connected | PASS | Connected, `v2.4.2366`, Stable, NONE |
| Root NONE | protected resource | PASS | `GET /api/v1/track/1/thumbnail` 200 image/png |
| Root UI_LOGIN | connect → login-required | PASS | Login screen tampil |
| Root UI_LOGIN | wrong password | PASS | tetap login-required, error invalid credentials |
| Root UI_LOGIN | correct password → Connected | PASS | UI_LOGIN, `v2.4.2366` |
| Root UI_LOGIN | protected query | PASS | probe after login berhasil |
| Root UI_LOGIN | protected resource | PASS | browser fetch dengan Bearer hasil 200 image/png |
| BASIC_AUTH | challenge unsupported | PASS | unsupported-auth, 0 password field |
| Root PWA | manifest/SW/installability | PASS | manifest errors kosong, installabilityErrors kosong |
| `/app/` | app load/router/deep-link | PASS | deep link `/app/unknown` → `/app`, form tampil |
| `/app/` | manifest/scope/SW | PASS | start/scope `/app/`, SW scope `/app/` |
| `/app/` | NONE connect | PASS | Connected, resource 200 |
| `/app/` | mobile viewport | PASS | 390×844, satu kolom, tanpa overflow fatal |
| Same-origin | UI proxy → UI server | PASS | UI_LOGIN connected |
| Cross-origin | UI 8092 → server 4567 | PASS | NONE connected |
| Cross-origin | UI 8093 → server 4568 | PASS | UI_LOGIN connected, Bearer resource 200 |
| Offline | shell reload | PASS | form shell tampil |
| Offline | connect | PASS | “Server tidak dapat dijangkau”, bukan data stale |
| PWA update | waiting SW prompt | PASS | prompt muncul; update/reload berhasil |
| iOS/Android device | install/safe-area | NOT TESTED | tidak ada perangkat fisik |
| Safari/Firefox | browser smoke | NOT TESTED | hanya Chrome |

## 6. Same-origin / cross-origin

- Same-origin: root UI disajikan melalui proxy lokal dan server target berada pada origin yang sama; UI_LOGIN berhasil.
- Cross-origin NONE: frontend `http://127.0.0.1:8092` → server `http://127.0.0.1:4567`; Connected.
- Cross-origin UI_LOGIN: frontend `/app/` `http://127.0.0.1:8093` → server `http://127.0.0.1:4568`; Connected dan resource Bearer 200.
- Preflight `OPTIONS /api/graphql` dengan `Origin` dan `Access-Control-Request-Headers: authorization,content-type`:
  - HTTP `200`
  - `Access-Control-Allow-Origin` mencerminkan origin frontend
  - `Access-Control-Allow-Methods: POST`
  - `Access-Control-Allow-Headers: authorization,content-type`
  - `Access-Control-Allow-Credentials: true`
  - `Vary: Origin`

Ini hasil server test lokal; reverse proxy/TLS/CORS deployment pengguna belum diuji.

## 7. PWA dan cache hygiene

Root build:

- `manifest.webmanifest`: `name=Suwayomi Frontend (Unofficial)`, `short_name=Suwayomi UI`, `start_url=/`, `scope=/`, `id=/`, `display=standalone`.
- Icon: `/icons/icon-192.png`, `/icons/icon-512.png`, `/icons/icon-512-maskable.png`.
- Service worker `/sw.js` aktif, scope `/`.
- `Page.getAppManifest` errors: kosong.
- `Page.getInstallabilityErrors`: kosong.
- CacheStorage `workbox-precache-v2-http://127.0.0.1:8092/` berisi 10 entry: `index.html`, JS/CSS shell, `workbox-window`, lima icon, dan `manifest.webmanifest`.

`/app/` build:

- `start_url=/app/`, `scope=/app/`, `id=/app/`.
- Icon `/app/icons/...`.
- Service worker `/app/sw.js`, scope `/app/`.
- CacheStorage 10 entry, semuanya di bawah `/app/`.
- Installability errors kosong.
- `sw.js` precache memuat semua icon shell.

Tidak ada di CacheStorage:

- `/api/graphql`
- GraphQL/auth response
- access/refresh token
- tracker/manga/chapter image
- server-specific response
- Apollo data
- private resource

PWA cache hanya shell. **PASS.**

## 8. Offline behavior

- Dengan shell sudah pernah dimuat, reload offline tetap membuka app shell.
- Form koneksi tampil; tidak ada Connected state lama.
- Connect offline menghasilkan:
  - “Koneksi gagal”
  - “Server tidak dapat dijangkau. Periksa alamat server, jaringan, dan konfigurasi CORS.”
- Tidak ada data server lama yang ditampilkan sebagai live.
- Tidak ada offline manga/chapter reader.

## 9. Version compatibility

| Kasus | Hasil |
| --- | --- |
| `< v2.4.2366` | incompatible-server |
| `v2.4.2366` Stable | compatible |
| Stable lebih baru | compatible |
| Preview/non-Stable lebih baru | warning `preview`, hanya operasi baseline |
| Versi tidak dapat diparse | warning `unknown`, tidak crash |

Runtime baseline v2.4.2366 berhasil. Kasus versi lain dibuktikan unit test; tidak ada server versi berbeda untuk runtime.

## 10. Security/privacy

- Password hanya berada di React state sementara; dikosongkan segera setelah submit dan pada kegagalan.
- Password tidak masuk state coordinator, URL, cache, atau error.
- Access/refresh token hanya di memori `AuthService`.
- Tidak ada localStorage/sessionStorage/cookie aplikasi.
- Logout lokal membersihkan session; tidak mengklaim revokasi server.
- Token tidak ditampilkan ke UI dan tidak masuk CacheStorage.
- Resource authenticated tetap same-origin/prefix server; cross-origin, protocol-relative, traversal, dan redirect ditolak.
- Service worker tidak memiliki runtime cache API/private.
- Java stack trace dan raw exception tidak ditampilkan ke UI.
- Tidak ditemukan secret/token/JAR/private key di tracked files atau history.

## 11. Browser/UI sanity

Desktop 1280×900 dan mobile 390×844:

- disconnected
- connecting
- login-required
- invalid credentials
- authenticating
- connected
- unsupported-auth
- failed
- PWA update/offline-ready prompt

Tidak ditemukan overflow horizontal fatal. Validasi ini bukan final visual design review.

## 12. Supported dan unsupported

**Didukung penuh Phase 0:**

- `NONE`
- `UI_LOGIN`
- HTTP GraphQL
- WebSocket subscription transport
- authenticated REST resource
- root deployment
- `/app/` subpath
- PWA shell/installability di Chrome yang diuji

**Tidak didukung:**

- `BASIC_AUTH` login; hanya deteksi unsupported
- `SIMPLE_LOGIN`
- token persistence
- offline reading
- library/manga/chapter/reader/source/extension/download/tracking UI
- push notification/background sync

## 13. Known limitations

- iOS dan Android physical device belum diuji.
- Safari/Firefox belum diuji.
- Production TLS/reverse proxy/CORS/deep-link hosting belum diuji.
- PWA update diuji dengan mutasi `dist/sw.js` lokal, bukan CDN/proxy rollout.
- Install Android/iOS nyata belum dilakukan.
- Expiry token aktual dan logout server-side belum diuji; stable tidak memiliki logout mutation.
- Thumbnail/page manga/chapter belum diuji; tracker thumbnail adalah resource test.
- Resource redirect sengaja ditolak.
- Subscription aktif setelah restart WebSocket perlu di-resubscribe consumer.
- Icon/nama PWA masih placeholder netral.
- `skipWaiting`/`clientsClaim` false berarti halaman pertama belum dikontrol SW sampai reload; update memakai prompt.

## 14. Deployment requirements

- HTTPS untuk PWA (kecuali localhost development).
- SPA history fallback untuk `/` atau `/app/`.
- `VITE_FRONTEND_BASE_PATH` harus sesuai lokasi build frontend.
- Service worker scope tidak boleh mencakup server API privat; API tetap network-only.
- CORS harus mengizinkan origin frontend, method POST, dan header `authorization`/`content-type` untuk standalone.
- Reverse proxy harus meneruskan upgrade WebSocket pada `/api/graphql`.
- MIME `application/manifest+json` untuk manifest.
- Jangan cache API/auth/resource pribadi di service worker atau reverse proxy.

## 15. Kriteria Phase 0 complete

Phase 0 dinyatakan **COMPLETE** karena:

- seluruh test suite lulus;
- codegen check lulus;
- schema checksum dan versi baseline cocok;
- root dan `/app/` production build lulus;
- runtime NONE/UI_LOGIN/BASIC_AUTH terverifikasi;
- PWA manifest/scope/SW/installability terverifikasi;
- CacheStorage hanya berisi shell;
- offline shell tidak menampilkan data stale;
- tidak ada auth/token leak;
- tidak ada boundary violation;
- working tree bersih setelah final commit.

Device/deployment gaps yang tercantum di atas adalah warning non-blocker untuk Phase 1, bukan bukti kompatibilitas penuh.

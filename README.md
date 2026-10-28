# Suwayomi Frontend

Frontend React baru untuk Suwayomi Server. Proyek ini bukan fork Suwayomi-WebUI dan tidak mengubah Suwayomi Server.

Status saat ini: **Phase 0 — Step 5 selesai**. Fondasi aplikasi, quality gates, schema stable, codegen, resolver deployment/server URL, dan auth/session in-memory untuk `NONE`/`UI_LOGIN` sudah tersedia. Belum ada koneksi server, transport GraphQL, React UI, atau fitur domain.

## Lingkup Step 1

- Bootstrap React + TypeScript + Vite.
- TypeScript strict.
- ESLint, Vitest, dan production build.
- Shell aplikasi minimal untuk membuktikan bootstrap berhasil.
- Satu lockfile npm.

Di luar scope Step 1: GraphQL, Apollo Client, `graphql-ws`, autentikasi, `aboutServer`, resolver server, resource/gambar, PWA, library, manga, chapter, reader, sources, extensions, downloads, dan tracking.

## Lingkup Step 3

- GraphQL Code Generator memakai snapshot lokal, tanpa server atau jaringan.
- Satu operasi `aboutServer` dengan selection set dari schema stable.
- Generated TypeScript document node di `src/core/graphql/generated/`.
- Script `codegen` dan `codegen:check` untuk CI.
- Tidak ada Apollo Client, HTTP client, WebSocket client, auth, atau UI koneksi.

## Lingkup Step 4

- Pemisahan `frontendBasePath` dan `serverBaseUrl`.
- Normalisasi server URL dan validasi input.
- Helper GraphQL HTTP, GraphQL WebSocket, dan resource server.
- Deteksi same-origin tanpa menyamakan origin dengan path.
- Resolver resource yang menolak cross-origin, protocol-relative, dan traversal.
- Tidak ada network request, Apollo, auth, router, atau resource fetch.

## Lingkup Step 5

- Operasi `Login` dan `RefreshToken` tervalidasi terhadap schema stable.
- Session model eksplisit untuk `NONE` dan `UI_LOGIN`.
- Access dan refresh token hanya di memori.
- JWT `exp` dibaca tanpa verifikasi signature, hanya untuk metadata.
- Generation guard untuk menolak respons async dari sesi lama.
- Auth service tidak bergantung pada React dan belum melakukan fetch.

## GraphQL baseline

- Versi: **Suwayomi Server stable v2.4.2366**.
- Tag: `v2.4.2366`.
- Commit: `40bc5da57820324ed0ae724cbbc020cc4673b594`.
- Schema: `graphql/schema/stable-v2.4.2366.graphql`.
- Metadata: `graphql/schema/stable-v2.4.2366.metadata.json`.
- SHA-256 schema: `c7b154383d684e69bc1947aad10fdfbc4f717008f61c755536a3857eecdff749`.
- Metode: introspection `POST /api/graphql` dari jar resmi v2.4.2366, dicetak ke SDL dengan `graphql-js` 16.11.0.

Snapshot ini adalah kontrak API untuk codegen dan integrasi berikutnya. Codegen membaca file lokal ini; tidak ada akses jaringan atau schema live. Belum ada operasi auth atau runtime Apollo pada Step 3.

## Runtime dan package manager

- Node.js: `v26.4.0` saat bootstrap.
- npm: `11.17.0`.
- Engine yang dinyatakan proyek: `^22.12.0 || ^24.0.0 || >=26.0.0`.
- Package manager: **npm** dengan `package-lock.json`. Tidak ada lockfile lain.

Di Windows PowerShell lingkungan ini, `npm.ps1` diblokir Execution Policy. Gunakan `npm.cmd` bila mengalami hal yang sama:

```powershell
npm.cmd install
npm.cmd run dev
```

## Menjalankan proyek

```bash
npm install
npm run dev
```

Build produksi dan pratinjau:

```bash
npm run build
npm run preview
```

## Scripts

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Vite development server |
| `npm run build` | Typecheck project references lalu build produksi ke `dist/` |
| `npm run codegen` | Generate tipe dan document node dari schema + operasi lokal |
| `npm run codegen:check` | Dry-run CI check; gagal jika generated output tidak sinkron |
| `npm run preview` | Menyajikan hasil build produksi |
| `npm run lint` | ESLint untuk source dan konfigurasi |
| `npm run typecheck` | `tsc -b` dengan TypeScript strict |
| `npm run test` | Vitest satu kali |
| `npm run test:watch` | Vitest watch mode |

## Struktur saat ini

```text
.
├─ docs/
│  ├─ architecture.md
│  ├─ phase-0.md
│  └─ suwayomi-backend-notes.md
├─ graphql/
│  ├─ schema/
│  │  ├─ stable-v2.4.2366.graphql
│  │  └─ stable-v2.4.2366.metadata.json
│  └─ operations/
│     ├─ aboutServer.graphql
│     ├─ login.graphql
│     └─ refreshToken.graphql
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ App.test.tsx
│  │  └─ app.css
│  ├─ core/
│  │  ├─ auth/
│  │  │  ├─ authError.ts
│  │  │  ├─ authService.ts
│  │  │  ├─ authService.test.ts
│  │  │  ├─ session.ts
│  │  │  ├─ token.ts
│  │  │  └─ token.test.ts
│  │  ├─ config/
│  │  │  ├─ deployment.ts
│  │  │  └─ deployment.test.ts
│  │  ├─ graphql/
│  │  │  ├─ aboutServer.generated.test.ts
│  │  │  └─ generated/
│  │  │     ├─ fragment-masking.ts
│  │  │     ├─ gql.ts
│  │  │     ├─ graphql.ts
│  │  │     └─ index.ts
│  │  └─ server/
│  │     ├─ serverUrl.ts
│  │     └─ serverUrl.test.ts
│  ├─ main.tsx
│  └─ vite-env.d.ts
├─ codegen.ts
├─ index.html
├─ eslint.config.js
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ vitest.config.ts
├─ package.json
└─ package-lock.json
```

Folder `src/core` saat ini berisi resolver deployment/server dan generated GraphQL. `src/features`, `src/shared`, dan runtime GraphQL belum dibuat karena belum ada implementasi yang membutuhkannya.

## Keputusan dependency

| Dependency | Versi | Alasan |
| --- | --- | --- |
| `react`, `react-dom` | `19.3.1` | Fondasi UI yang disepakati; versi React 19 stabil saat bootstrap. |
| `vite` | `8.3.5` | Build tool yang disepakati; mendukung Node 26. |
| `@vitejs/plugin-react` | `6.1.2` | Plugin React resmi untuk Vite 8; tidak memerlukan plugin SWC tambahan. |
| `typescript` | `6.0.3` | TypeScript strict; masih didukung `typescript-eslint` 8.x. |
| `@graphql-codegen/cli` | `7.4.6` | Menjalankan codegen dan `--check` dari CLI. |
| `@graphql-codegen/client-preset` | `6.2.3` | Menghasilkan tipe, typed document node, dan helper client modern. |
| `graphql` | `17.0.2` | Parser/schema engine yang dibutuhkan codegen. |
| `graphql-sock` | `1.0.1` | Peer dependency wajib `client-preset`. |
| `@graphql-typed-document-node/core` | `3.2.0` | Tipe `TypedDocumentNode` yang diimpor generated code. |
| `eslint` + `@eslint/js` | `10.13.0` / `10.0.1` | Lint dasar untuk TypeScript/React. |
| `typescript-eslint` | `8.72.1` | Parser dan aturan TypeScript untuk ESLint. |
| `eslint-plugin-react-hooks` | `7.1.1` | Aturan hooks React. |
| `eslint-plugin-react-refresh` | `0.5.7` | Menjaga batas export komponen untuk HMR. |
| `globals` | `17.13.0` | Global browser/Node untuk konfigurasi ESLint. |
| `vitest` | `5.0.5` | Test runner ringan yang memakai pipeline Vite. |
| `@types/react`, `@types/react-dom` | `19.3.0` | Tipe React. |

Dependency yang belum dipasang dengan sengaja: Apollo Client, `graphql-ws`, Zustand, React Router, dan `vite-plugin-pwa`. Semuanya menunggu langkah implementasi yang membutuhkannya.

## GraphQL Codegen

Konfigurasi ada di `codegen.ts`:

- Schema: `graphql/schema/stable-v2.4.2366.graphql` (lokal).
- Documents: `graphql/operations/**/*.graphql`.
- Output: `src/core/graphql/generated/`.
- Preset: `client`.

Scalar mapping:

| Scalar | TypeScript |
| --- | --- |
| `LongString` | `string` |
| `Cursor` | `string` |
| `Duration` | `string` |
| `Upload` | `File` |

`Upload` dipetakan ke `File` karena input browser yang natural adalah `File` dari `<input type="file">`; Apollo Upload Client juga menerima `File`/`Blob`. Mapping ini belum dipakai oleh operasi Step 3.

Operasi yang dibuat: `aboutServer`, `Login`, dan `RefreshToken`; field `revision` yang deprecated tidak dipakai. Operasi auth memakai generated `LoginMutation` dan `RefreshTokenMutation`.

`codegen:check` memakai mode `--check` bawaan GraphQL Code Generator. Mode ini melakukan generate secara dry-run dan keluar dengan status non-zero jika ada file stale, tanpa menulis ulang output. Ini sudah diverifikasi dengan injeksi drift sementara.

## Deployment dan URL

Dua alamat dipisahkan secara eksplisit:

| Konsep | Canonical | Dipakai untuk |
| --- | --- | --- |
| `frontendBasePath` | `/` atau `/app/` (leading dan trailing slash) | router, asset, manifest, service worker, start URL |
| `serverBaseUrl` | `https://example.com` atau `https://example.com/suwayomi` (tanpa trailing slash) | GraphQL HTTP, GraphQL WebSocket, resource |

`serverBaseUrl` adalah **input runtime**, bukan nilai build-time yang dipaksakan. Tidak ada alamat server pribadi yang di-commit. `frontendBasePath` adalah konfigurasi deployment frontend dan tidak diturunkan dari route halaman atau dari path server.

Contoh:

| Frontend | Server | GraphQL HTTP | GraphQL WS |
| --- | --- | --- | --- |
| `https://example.com/` | `https://example.com` | `https://example.com/api/graphql` | `wss://example.com/api/graphql` |
| `https://example.com/app/` | `https://example.com` | `https://example.com/api/graphql` | `wss://example.com/api/graphql` |
| `https://example.com/` | `https://example.com/suwayomi` | `https://example.com/suwayomi/api/graphql` | `wss://example.com/suwayomi/api/graphql` |
| `https://reader.example.com/app/` | `https://manga.example.com/suwayomi` | `https://manga.example.com/suwayomi/api/graphql` | `wss://manga.example.com/suwayomi/api/graphql` |

Aturan keamanan resource:

- Relative path seperti `/api/v1/test` dan `api/v1/test` selalu digabung dengan prefix server.
- Absolute URL hanya diterima jika origin dan prefix sesuai `serverBaseUrl`; cross-origin ditolak.
- Protocol-relative `//host/...`, traversal `../`, encoded traversal, backslash, dan URL dengan credentials ditolak.
- Absolute URL di luar prefix server, termasuk `https://example.com/suwayomi2/...`, ditolak.
- Resolver ini belum mengirim request atau token; aturan tersebut mencegah token dikirim ke origin arbitrer pada step berikutnya.

Same-origin berarti **origin** sama, bukan path sama. Frontend `https://example.com/app/` dan server `https://example.com/suwayomi` adalah same-origin meskipun path-nya berbeda.

Semua konsumen nanti harus memakai `createDeploymentConfig`; tidak boleh membentuk URL server sendiri di komponen atau service.

## Auth dan session

`AuthService` adalah satu-satunya pemilik state sesi. Model sesi membedakan:

- `disconnected` — belum ada konteks server.
- `none` — server mode NONE; tidak memiliki token. Status ini belum berarti `connected` sampai connection layer membuktikannya nanti.
- `unauthenticated` — UI_LOGIN memerlukan login, kredensial salah, sesi expired, atau refresh gagal.
- `authenticated` — UI_LOGIN dengan access token, refresh token, dan metadata `exp`.
- `refreshing` — refresh sedang berjalan; access token lama tetap tersedia sampai hasil refresh diterima.
- `failed` — kegagalan non-kredensial yang tidak secara otomatis berarti sesi valid.

Kebijakan Step 5:

- Access dan refresh token hanya disimpan di memori. Tidak ada `localStorage`, `sessionStorage`, cookie, atau persistence lain.
- Logout lokal hanya membersihkan session; tidak mengklaim server mencabut token. Stable tidak memiliki mutation logout auth.
- Refresh hanya mengganti access token. Refresh token lama dipertahankan dan tidak dirotasi.
- JWT payload boleh dibaca untuk `exp`, tetapi tidak diverifikasi signature-nya. Token malformed dianggap invalid.
- `isSessionAccessTokenExpired` dan `isSessionAccessTokenNearExpiry` tersedia; tidak ada refresh otomatis pada Step 5.
- Setiap perubahan sesi atau mulai login/refresh menaikkan generation. Hasil async dengan generation lama ditolak, termasuk setelah logout atau ganti server.
- `AuthError` tidak memuat token atau stack trace mentah server.

Fetch login/refresh **ditunda ke Step 6**. `AuthService` menyediakan kontrak `AuthTransport` berbasis generated types; Step 5 hanya membuktikan state/lifecycle dan stale-response protection, bukan transport.

`NONE` bukan fallback ketika mode auth tidak diketahui. Mode harus ditentukan oleh connection layer; `UI_LOGIN` yang belum terautentikasi tetap `unauthenticated`.

## Validasi

Dijalankan pada 29 Oktober 2026:

```text
npm run codegen        lulus
npm run codegen:check  lulus
npm run lint           lulus
npm run typecheck      lulus
npm run test           lulus (55 test)
npm run build          lulus
```

Validasi schema Step 2:

- Schema dapat diparse dengan `graphql-js` 16.11.0.
- SHA-256 schema cocok dengan metadata.
- Query `aboutServer`, `AuthMode`, `login`, `refreshToken`, `Subscription`, dan custom scalar diperiksa terhadap snapshot.
- Tipe preview/master yang tidak ada di stable dipastikan tidak ikut masuk.
- WebSocket `graphql-transport-ws` diuji pada server v2.4.2366; `connection_ack` dan pesan `next` diterima.

Validasi codegen Step 3:

- Operasi valid menghasilkan `AboutServerDocument`.
- Test unit memastikan document node yang dihasilkan adalah query `AboutServer`.
- Field fiktif sementara menyebabkan codegen gagal dengan `Cannot query field ...`; fixture dihapus setelah test.
- Drift sementara pada generated output terdeteksi oleh `codegen:check` dengan status non-zero; output dipulihkan dengan `npm run codegen`.
- Folder generated di-ignore dari ESLint, tetapi tetap diperiksa TypeScript strict.

Validasi resolver Step 4:

- Normalisasi server root, subpath, trailing slash, port, localhost, IPv4, dan IPv6.
- Penolakan input invalid, credentials, query, hash, scheme non-HTTP, traversal, dan encoded traversal.
- GraphQL HTTP/WS dan WSS untuk root/subpath/port.
- Resource relative dan absolute same-server; penolakan cross-origin, protocol-relative, di luar prefix, dan traversal.
- Same-origin dibedakan dari same-path.
- Kombinasi frontend `/`, `/app/`, server root, server `/suwayomi`, dan origin berbeda.

Validasi auth Step 5:

- NONE session tanpa token, clear/reset.
- UI_LOGIN authenticated dengan access/refresh/expiry.
- Refresh hanya mengganti access token dan mempertahankan refresh token.
- JWT `exp` valid, expired, future, tanpa `exp`, dan malformed.
- Respons lama ditolak setelah logout, reset ke NONE, atau login baru.
- Invalid credentials, refresh failure, network failure, dan session expired dipetakan ke state berbeda.
- Error string tidak memuat token.

Smoke test build produksi:

- `GET /` menghasilkan HTTP 200.
- `<title>Suwayomi Frontend</title>` dan `<div id="root"></div>` ditemukan.
- Asset JS dan CSS hasil build dapat diambil dengan HTTP 200.

## Batasan dan unknown

- Snapshot schema stable v2.4.2366, generated `aboutServer`, resolver deployment/server, dan auth session foundation tersedia; belum ada runtime Apollo, transport fetch, atau resource fetch.
- Server v2.4.2366 hanya dijalankan untuk ekstraksi schema dan probe kontrak; belum ada koneksi dari aplikasi frontend.
- Repository Git sudah diinisialisasi; baseline Step 1–2 serta commit Step 3–5 dibuat terpisah.
- Belum ada PWA, routing, login UI, resource loader, atau koneksi server dari aplikasi.
- Pengujian browser/perangkat, CORS, subpath runtime, dan deployment belum dilakukan.
- `serverBaseUrl` belum diuji terhadap server nyata pada Step 4–5; Step 5 hanya membuktikan state/lifecycle auth.
- Token persistence belum dipilih; saat ini hanya memori.
- `package-lock.json` adalah satu-satunya lockfile; jangan menambahkan lockfile lain tanpa keputusan eksplisit.

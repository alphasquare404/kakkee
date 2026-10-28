# Suwayomi Frontend

Frontend React baru untuk Suwayomi Server. Proyek ini bukan fork Suwayomi-WebUI dan tidak mengubah Suwayomi Server.

Status saat ini: **Phase 0 — Step 3 selesai**. Fondasi aplikasi, quality gates, snapshot schema stable v2.4.2366, dan pipeline GraphQL Codegen untuk `aboutServer` sudah tersedia. Belum ada koneksi server dari aplikasi, autentikasi, resource loader, PWA, atau fitur domain.

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
│     └─ aboutServer.graphql
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ App.test.tsx
│  │  └─ app.css
│  ├─ core/
│  │  └─ graphql/
│  │     ├─ aboutServer.generated.test.ts
│  │     └─ generated/
│  │        ├─ fragment-masking.ts
│  │        ├─ gql.ts
│  │        ├─ graphql.ts
│  │        └─ index.ts
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

Folder `src/core` saat ini hanya berisi generated GraphQL dan satu test document node. `src/features`, `src/shared`, dan runtime GraphQL belum dibuat karena belum ada implementasi yang membutuhkannya.

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

Operasi yang dibuat hanya `aboutServer`; field `revision` yang deprecated tidak dipakai.

`codegen:check` memakai mode `--check` bawaan GraphQL Code Generator. Mode ini melakukan generate secara dry-run dan keluar dengan status non-zero jika ada file stale, tanpa menulis ulang output. Ini sudah diverifikasi dengan injeksi drift sementara.

## Validasi

Dijalankan pada 29 Oktober 2026:

```text
npm run codegen        lulus
npm run codegen:check  lulus
npm run lint           lulus
npm run typecheck      lulus
npm run test           lulus (2 test)
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

Smoke test build produksi:

- `GET /` menghasilkan HTTP 200.
- `<title>Suwayomi Frontend</title>` dan `<div id="root"></div>` ditemukan.
- Asset JS dan CSS hasil build dapat diambil dengan HTTP 200.

## Batasan dan unknown

- Snapshot schema stable v2.4.2366 dan generated `aboutServer` tersedia; belum ada runtime Apollo, operasi auth, atau integrasi aplikasi.
- Server v2.4.2366 hanya dijalankan untuk ekstraksi schema dan probe kontrak; belum ada koneksi dari aplikasi frontend.
- Repository Git sudah diinisialisasi; baseline Step 1–2 dan commit Step 3 dibuat terpisah.
- Belum ada PWA, routing, autentikasi, resource loader, atau koneksi server dari aplikasi.
- Pengujian browser/perangkat, CORS, subpath, dan deployment belum dilakukan.
- `package-lock.json` adalah satu-satunya lockfile; jangan menambahkan lockfile lain tanpa keputusan eksplisit.

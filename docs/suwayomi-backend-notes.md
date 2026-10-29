# Catatan backend dan status bukti

Tanggal verifikasi schema: 29 Oktober 2026. Baseline proyek: **Suwayomi Server stable v2.4.2366**, bukan klaim tentang rilis stable terbaru.

Snapshot kontrak API sekarang tersedia di repository:

- `graphql/schema/stable-v2.4.2366.graphql`
- `graphql/schema/stable-v2.4.2366.metadata.json`

Dokumen ini memisahkan fakta stable yang sudah diverifikasi dari pengamatan preview/master dan hal yang belum diuji runtime.

## Sumber dan identitas baseline

| Item | Nilai |
| --- | --- |
| Tag | `v2.4.2366` |
| Commit | `40bc5da57820324ed0ae724cbbc020cc4673b594` |
| Release | [v2.4.2366](https://github.com/Suwayomi/Suwayomi-Server/releases/tag/v2.4.2366) |
| Artefak | `Suwayomi-Server-v2.4.2366.jar` |
| SHA-256 artefak | `af9feb20af9d7ebe9e30769e6c6ebc7fc7ab1c447388d42e0280b1da5fe07bfd` |
| Build type | `Stable` |
| Schema SHA-256 | `c7b154383d684e69bc1947aad10fdfbc4f717008f61c755536a3857eecdff749` |

`Suwayomi-Server` tidak menyimpan schema SDL di repository. Schema dibuat saat runtime dari kode Kotlin. Karena itu snapshot diperoleh dengan menjalankan jar resmi v2.4.2366 dan melakukan GraphQL introspection ke `POST /api/graphql`, bukan dengan mengambil schema dari master/preview atau dari generated WebUI.

Server dijalankan dengan data directory sementara, `authMode = NONE`, `webUIEnabled = false`, `kcefEnabled = false`, dan `headless = true`. Tidak ada data pengguna yang dipakai.

## Fakta stable yang terverifikasi

### Endpoint dan transport HTTP

- GraphQL HTTP endpoint: `POST /api/graphql`.
- `GET /api/graphql` mengembalikan GraphQL Playground HTML, bukan hasil query. Ini diverifikasi pada server v2.4.2366.
- Respons GraphQL dapat berupa HTTP 200 walaupun berisi `errors`. Contoh: query yang dilindungi `@requireAuth` tanpa sesi mengembalikan HTTP 200 dengan error `UnauthorizedException`, bukan HTTP 401.
- Error GraphQL pada build stable dapat memuat stack trace Java lengkap di dalam `message`. UI tidak boleh menampilkan pesan mentah tersebut.
- Schema memiliki directive `@requireAuth`. Directive `@requirePermissions` tidak muncul di snapshot stable; yang ada adalah `@requireAuth`.
- CORS preflight pada server test: `OPTIONS /api/graphql` dengan `Origin: http://127.0.0.1:8080` mengembalikan HTTP 200, `Access-Control-Allow-Origin` yang mencerminkan origin tersebut, `Access-Control-Allow-Methods: POST`, `Access-Control-Allow-Headers: content-type`, `Access-Control-Allow-Credentials: true`, dan `Vary: Origin`. Cross-origin browser smoke ke server test berhasil. Ini belum membuktikan semua konfigurasi deployment/proxy.

### `aboutServer`

`aboutServer` tersedia di `Query` dan dapat dipanggil tanpa token pada `NONE` maupun `UI_LOGIN`. Field yang terverifikasi:

```graphql
type AboutServerPayload {
  buildTime: LongString!
  buildType: String!
  discord: String!
  github: String!
  name: String!
  platformInfo: PlatformInfo!
  revision: String! @deprecated(reason: "The version includes the revision as the patch number")
  version: String!
}
```

`PlatformInfo` berisi `arch`, `headless`, `jvm { javaVersion vmName vmVersion vmVendor }`, dan `os { build name version }`.

Respons runtime yang diperoleh:

```json
{
  "name": "Suwayomi-Server",
  "version": "v2.4.2366",
  "revision": "r2366",
  "buildType": "Stable",
  "buildTime": "1790737255",
  "github": "https://github.com/Suwayomi/Suwayomi-Server",
  "discord": "https://discord.gg/DDZdqZWaHA"
}
```

`buildTime` bertipe `LongString` dan berisi epoch detik, bukan milidetik.

### Mode autentikasi

Enum yang tersedia:

```graphql
enum AuthMode {
  NONE
  BASIC_AUTH
  SIMPLE_LOGIN
  UI_LOGIN
}
```

Schema stable **tidak** memuat tipe user account, `userSettings`, atau mutation manajemen user. Hal-hal itu adalah preview/master dan bukan bagian kontrak v2.4.2366.

Perilaku runtime challenge:

- Pada `BASIC_AUTH`, request tanpa kredensial Basic menghasilkan HTTP 401 dengan header `WWW-Authenticate: Basic`. Ini terverifikasi pada Step 8.
- Coordinator dapat membedakan challenge tersebut dan melaporkannya sebagai mode unsupported; tidak ada form/dialog Basic Auth.
- SIMPLE_LOGIN tidak diuji dan tidak dapat dibedakan secara aman dari protected endpoint generik tanpa probe khusus. Jangan mengklaim deteksi SIMPLE_LOGIN.

### Login dan refresh

Mutation yang tersedia:

```graphql
login(input: LoginInput!): LoginPayload!
refreshToken(input: RefreshTokenInput!): RefreshTokenPayload!
```

Input/output yang terverifikasi:

```graphql
input LoginInput {
  clientMutationId: String
  password: String!
  username: String!
}

type LoginPayload {
  accessToken: String!
  clientMutationId: String
  refreshToken: String!
}

input RefreshTokenInput {
  clientMutationId: String
  refreshToken: String!
}

type RefreshTokenPayload {
  accessToken: String!
  clientMutationId: String
}
```

Tidak ada mutation logout sesi/auth. `logoutKoSyncAccount` dan `logoutTracker` yang ada di schema adalah logout layanan eksternal, bukan logout sesi Suwayomi.

Perilaku runtime:

- Pada `NONE`, mutation `login` mengembalikan error `"Cannot login while already logged-in"` karena context sudah dianggap admin.
- Pada `UI_LOGIN`, login dengan kredensial valid mengembalikan access token dan refresh token.
- Access token yang diperiksa memiliki claim `iss`, `aud`, `token_type = access`, dan `exp`.
- `refreshToken` dengan refresh token valid mengembalikan access token baru. Payload tidak memuat refresh token baru; tidak ada rotasi refresh token pada kontrak ini.
- `settings` dengan `Authorization: Bearer <accessToken>` berhasil.
- `settings` tanpa token mengembalikan HTTP 200 dengan GraphQL error `UnauthorizedException`.
- `aboutServer` tetap dapat diakses tanpa token pada `UI_LOGIN`.

### Settings yang relevan untuk auth

`SettingsType` memuat field berikut:

```graphql
authMode: AuthMode
authUsername: String
authPassword: String
jwtAudience: String
jwtRefreshExpiry: Duration
jwtTokenExpiry: Duration
```

Nilai runtime pada server uji `UI_LOGIN`:

```json
{
  "authMode": "UI_LOGIN",
  "authUsername": "audit-admin",
  "jwtAudience": "suwayomi-server-api",
  "jwtTokenExpiry": "PT5M",
  "jwtRefreshExpiry": "PT1440H"
}
```

`webUISubpath` **tidak** muncul di `SettingsType` stable, walaupun key `server.webUISubpath` ada di file konfigurasi server. Jangan menganggap setting tersebut dapat dibaca/ditulis lewat GraphQL pada baseline ini.

### Subscription

Tipe `Subscription` stable memiliki enam field:

```graphql
type Subscription {
  downloadChanged: DownloadStatus! @deprecated(...)
  downloadStatusChanged(input: DownloadChangedInput!): DownloadUpdates!
  webUIUpdateStatusChange: WebUIUpdateStatus!
  syncStatusChanged: SyncStatus!
  libraryUpdateStatusChanged(input: LibraryUpdateStatusChangedInput!): UpdaterUpdates!
  updateStatusChanged: UpdateStatus! @deprecated(...)
}
```

Transport yang terverifikasi runtime:

- WebSocket pada path yang sama, `/api/graphql`.
- Subprotocol `graphql-transport-ws`.
- Pesan `connection_init` dibalas `connection_ack`.
- Subscription `downloadStatusChanged(input: {})` mengirim pesan `next` dengan state awal.
- Pada `NONE`, subscription berjalan tanpa token.
- Pada `UI_LOGIN`, token dikirim sebagai `connectionParams.Authorization` tanpa prefix `Bearer`; handshake dan subscription berhasil.

`graphql-transport-ws` bukan REST dan bukan `subscriptions-transport-ws` lama. Endpoint subscription tidak terpisah dari endpoint HTTP.

### Resource REST

Endpoint resource yang dipakai untuk verifikasi Step 7:

```text
GET /api/v1/track/{trackerId}/thumbnail
```

- Route memanggil `requireUser()`; pada `UI_LOGIN` tanpa token hasilnya HTTP 401.
- Pada `NONE`, endpoint mengembalikan HTTP 200 dengan `content-type: image/png`.
- Pada `UI_LOGIN` dengan Bearer valid, endpoint mengembalikan HTTP 200 `image/png`.
- Tracker ID 1–5 tersedia pada server test dan mengembalikan PNG; ini bukan data pengguna.
- Endpoint ini dipakai hanya untuk menguji resource transport, bukan fitur tracking UI.

Path manga/chapter thumbnail dan page belum diverifikasi dengan data manga nyata. Jangan mengklaim semua image endpoint memiliki perilaku auth yang sama hanya dari tracker thumbnail.

### Scalar custom

Schema stable memuat scalar:

- `LongString` — angka 64-bit sebagai string, juga dipakai untuk `buildTime` dan ID panjang.
- `Cursor` — cursor pagination sebagai string opaque.
- `Duration` — durasi ISO-8601, misalnya `PT5M`, `PT1440H`.
- `Upload` — input file multipart.

Tidak ada scalar tambahan yang perlu ditebak untuk Phase 0.

### Preview/master yang tidak termasuk baseline

Snapshot stable **tidak** memuat:

- `UserType`, `UserSettingsType`, `MangaUserType`, `ChapterUserType`
- `Query.user`, `Query.users`, `Query.userSettings`, `Query.userCodes`
- `Mutation.register`, `Mutation.setPassword`, `Mutation.updateUser`
- mutation recovery/registration code
- field `MangaType.user` dan `ChapterType.user`
- `SettingsType.webUISubpath`

Semua itu hanya boleh dipakai setelah ada compatibility gate dan bukti dukungan versi. Jangan mencampurkannya ke operasi Phase 0 yang ditargetkan ke v2.4.2366.

## Status klaim audit sebelumnya

| Klaim | Status |
| --- | --- |
| GraphQL di `/api/graphql`, HTTP POST | Terverifikasi pada stable v2.4.2366 |
| Subscription pada path sama, `graphql-transport-ws` | Terverifikasi runtime |
| `NONE` dan `UI_LOGIN` tersedia | Terverifikasi dari enum dan runtime |
| Deteksi NONE/UI_LOGIN via aboutServer + protected probe | Terverifikasi runtime Step 8 |
| BASIC_AUTH challenge `WWW-Authenticate: Basic` | Terverifikasi runtime Step 8 |
| CORS preflight origin UI → server test | Terverifikasi runtime Step 9; deployment lain belum |
| `UI_LOGIN` memakai JWT | Terverifikasi; access + refresh token |
| Bearer pada HTTP | Terverifikasi dengan `settings` |
| `connectionParams.Authorization` pada WS | Terverifikasi dengan token mentah tanpa `Bearer` |
| `aboutServer` untuk connection test | Field dan respons terverifikasi; alur UI belum diuji |
| Thumbnail/page berupa relative path | Field schema ada; nilai path aktual belum diuji pada baseline ini |
| Image terautentikasi perlu fetch + Blob | Terverifikasi untuk tracker thumbnail; manga/page belum |
| Tracker thumbnail REST | Terverifikasi NONE 200 dan UI_LOGIN 401 tanpa token / 200 dengan Bearer |
| `webUISubpath` | Ada sebagai config server; tidak ada di `SettingsType` stable |

## Belum diverifikasi / masih unknown

- Perilaku setelah access token benar-benar expired; refresh baru diuji sebelum expiry.
- Apakah refresh token masih valid setelah perubahan password atau restart server.
- Perilaku logout yang sebenarnya; schema hanya menunjukkan tidak ada mutation logout auth.
- Login dengan kredensial salah dan pesan error yang tepat.
- Deteksi mode auth dari client tanpa mencoba query yang dilindungi.
- `aboutWebUI` saat `webUIEnabled = false`; kemungkinan gagal karena tidak ada file `revision`.
- BASIC_AUTH dan SIMPLE_LOGIN; keduanya di luar dukungan penuh awal. BASIC_AUTH challenge sudah terdeteksi, tetapi login Basic tidak diimplementasikan; SIMPLE_LOGIN belum diuji.
- Reconnect WebSocket, expiry token saat koneksi aktif, dan perilaku subscription setelah token diganti.
- Path thumbnail/page manga dan chapter, kebutuhan Bearer pada image tersebut, redirect, dan CORS resource.
- Deployment same-origin/standalone, subpath, reverse proxy, TLS, dan CORS. CORS localhost sudah diuji; deployment dengan proxy/TLS/kebijakan origin lain belum.
- PWA scope, service worker, dan perilaku perangkat iOS/Android.
- Perilaku multi-user/preview; bukan target baseline.

## Prosedur pembaruan bukti

1. Catat tag/commit/artefak stable yang digunakan.
2. Jalankan server resmi dengan data directory terisolasi dan config yang dicatat.
3. Lakukan introspection; simpan SDL dan metadata dengan checksum.
4. Validasi schema dapat diparse dan periksa field yang dipakai Phase 0.
5. Pisahkan fakta stable dari pengamatan preview/master.
6. Upgrade snapshot sebagai perubahan terpisah dengan diff dan pengujian ulang.

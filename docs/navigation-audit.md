# Navigation Audit

Audit date: 2026-11-01 (Asia/Bangkok)

Scope: every route, link, navigation action, back path, deep link, and
responsive navigation composition in the Kakkee/Suwayomi frontend.

## Navigation provenance model

The previous audit incorrectly treated Manga Detail as structurally owned by
Library. Runtime disproved that: a manga that is not in Library opened from
Search rendered `Library / One Piece (Color)`.

Navigation provenance is now a typed value in `src/app/navigationOrigin.ts`:

```ts
type NavigationOrigin = {
  section: 'library' | 'browse' | 'search' | 'updates' | 'history' |
    'downloads' | 'categories' | 'manga' | 'settings' | 'extensions';
  pathname: string;
  search?: string;
  hash?: string;
  trail: Array<{
    pathname: string;
    search?: string;
    hash?: string;
    labelKey?: string; // translated section label
    label?: string;    // dynamic source/manga label
  }>;
};
```

Links pass `state={{ origin }}`. The origin is never inferred from
`inLibrary`, category membership, or the destination route type.

Rules:

- **Breadcrumb**: structural or provenance, never mixed. Manga Detail renders
  `origin.trail` only. Direct links render the title alone.
- **Back**: `originHref(origin)`; if the origin is the immediately previous
  history entry, custom Back uses `history.back()` semantics instead of
  pushing a duplicate page.
- **Active primary nav**: for Manga Detail, uses `origin.section`; a direct
  Manga URL has no primary active item rather than a fabricated Library active.
- **Reload**: browser navigation state is not treated as durable. If provenance
  is gone after reload, the breadcrumb collapses to the title and Back falls
  back to Library. No false origin is created.
- **New tab/direct URL**: no state, no invented origin.
- **Reader**: Manga-origin chapters pass `fromManga: true` plus the Manga origin;
  Reader Back navigates directly to the Manga detail entry, never to a previous
  reader chapter entry. Reader opened directly from History/Updates/Downloads
  returns to that origin. Direct Reader falls back to Manga.

## Provenance matrix (runtime, final code)

Tested against LAN backend through the same-origin proxy.

| Manga state | Origin | Breadcrumb | Back destination | Active nav |
|---|---|---|---|---|
| In Library | Library | `Library / title` | `/library` | Library |
| In Library | Search | `Search / title` | `/search?q=...` | Search |
| In Library | Browse (Weeb Central) | `Browse / Weeb Central / title` | `/browse/213...?q=...` | Browse |
| Not in Library | Search (One Piece (Color)) | `Search / One Piece (Color)` | `/search?q=one%20piece` | Search |
| Not in Library | Browse (8Muses) | `Browse / 8Muses (EN) / title` | `/browse/180...` | Browse |
| Either | Updates | `Updates / title` | `/updates` | Updates |
| Either | History (Reader) | Reader shows `← History` | `/history` | History |
| Either | Direct `/manga/:id` | title only | `/library` fallback | none |
| Either | Direct Reader | Reader back to Manga | Manga (title only) | none |
| Either | Reload after in-app origin | title only (state dropped) | `/library` fallback | none |

`One Piece (Color)` (ID 1115, `inLibrary: false`) was the exact regression case:
runtime result was `Search / One Piece (Color)`, not `Library / ...`.

## Breadcrumb audit

| Screen | Model | Rule and direct-link behavior |
|---|---|---|
| Manga Detail | Provenance | Render `origin.trail`; title only when no origin. Never Library by default. |
| Reader | Context label | Back label is Manga when entered from Manga, otherwise actual origin (History/Updates/Downloads). Not a fake breadcrumb. |
| Source listing (`/browse/:id`) | Structural | `Browse` ancestor; Back to all sources. Direct link starts at source name, no invented previous source. |
| Extension detail | Structural | Extensions ancestor; Back to extensions. |
| Settings subsections | Structural | Settings ancestor; Back to Settings. |
| About | Structural | Settings ancestor; Settings remains active. |
| Offline list/reader | Structural | Offline list ancestor; Back to Downloads or connection fallback. |
| Updates/History/Downloads | Page heading | No breadcrumb; items are leaf destinations. |
| Categories | Page heading | Management page; no Manga Detail breadcrumb path exists. |

## Back and active-nav audit

- Manga Back uses origin URL and, when the origin is the previous history entry,
  history Back so it does not push a duplicate Manga page.
- Reader Back uses history Back when entered from Manga or a known feed origin;
  direct Reader falls back to Manga.
- Back labels are `Back to library`, `Back`, `← Manga`, or the actual origin
  label; they are not all derived from a single parent route.
- Active primary navigation is structural for normal routes.
- For Manga Detail, active state is `origin.section`; a direct Manga URL has no
  active primary item rather than a fabricated Library item.
- Browser Back/Forward was exercised on the final code; custom Back and browser
  Back agree on the Library → Manga → Reader → Manga → Library chain.

## Route inventory

| Route | Purpose | Desktop entry | Tablet entry | Mobile entry | Direct/reload | Back behavior | Status |
|---|---|---|---|---|---|---|---|
| `/` | Connect, login, server status | Root, server account link | Root, rail account | Root, server account | Yes | No parent | OK |
| `/library` | Library collection | Sidebar | Rail | Bottom Library | Yes | Browser history; scroll restored | OK |
| `/updates` | Library updates | Sidebar | Rail | Bottom Updates | Yes | Browser history; scroll restored | OK |
| `/browse` | Source catalog | Sidebar | Rail | Bottom Browse | Yes | Browser history | OK |
| `/browse/:sourceId` | Source manga listing | Source card | Source card | Source card | Yes | All sources + browser back | OK |
| `/extensions` | Installed/available extensions | Sidebar | Rail | More → Extensions | Yes | Browser history | OK |
| `/extensions/:pkgName` | Extension detail/settings | Extension card | Extension card | Extension card | Yes | Extensions + browser back | OK |
| `/search` | Global search / live source search | Sidebar | Rail | Bottom Search | Yes, supports `?q=` | Browser history; query restored | OK |
| `/categories` | Category management | Sidebar | Rail | More → Categories | Yes | Browser history | OK |
| `/history` | Reading history | Sidebar | Rail | More → History | Yes | Resume reader or browser back | OK |
| `/downloads` | Server queue + device downloads | Sidebar | Rail | More → Downloads | Yes | Browser history; offline library back | OK |
| `/settings` | Settings landing | Sidebar | Rail | More → Settings | Yes, hash anchors | Browser history; anchors | OK |
| `/settings/reader` | Reader defaults | Settings → Reading | Settings → Reading | Settings → Reading | Yes | All settings + browser back | OK |
| `/settings/appearance` | Theme/accent | Settings → Appearance | Settings → Appearance | Settings → Appearance | Yes | All settings + browser back | OK |
| `/settings/library` | Library preferences | Settings → Library | Settings → Library | Settings → Library | Yes | All settings + browser back | OK |
| `/settings/server` | Server settings | Settings → Server | Settings → Server | Settings → Server | Yes | All settings + browser back | OK |
| `/settings/backup` | Backup settings | Settings → Backup | Settings → Backup | Settings → Backup | Yes | All settings + browser back | OK |
| `/settings/tracking` | Tracker settings | Settings → Tracking | Settings → Tracking | Settings → Tracking | Yes | All settings + browser back | OK |
| `/settings/sync` | Sync settings | Settings → Sync | Settings → Sync | Settings → Sync | Yes | All settings + browser back | OK |
| `/settings/history` | History preferences | Settings → History | Settings → History | Settings → History | Yes | All settings + browser back | OK |
| `/settings/device` | Local device information | Settings → Device | Settings → Device | Settings → Device | Yes | All settings + browser back | OK |
| `/about` | Build/update information | Settings → About | Settings → About | Settings → About | Yes | All settings + browser back; Settings stays active | OK |
| `/manga/:mangaId` | Manga detail | Origin-aware card/feed/search/source | Same | Same | Yes; provenance survives in history state until reload | Origin Back; fallback Library; no fabricated breadcrumb | OK |
| `/manga/:mangaId/chapter/:chapterId` | Reader | Chapter row, Continue, history, updates | Same | Same | Yes; direct ID reconstructs | Manga when from Manga; actual origin when entered from feed; browser Back verified | OK |
| `/offline` | Device/OPFS downloads | Downloads → Open offline library | Same | Same | Yes | State-aware Back (`/downloads` or `/`) | OK |
| `/offline/read/:chapterId` | Device/OPFS reader | Offline list / device chapter | Same | Same | Yes | Offline list | OK |
| `/settings/*` | Unknown Settings subsection | Redirect | Redirect | Redirect | Yes | Settings landing | OK |
| `*` | Unknown route | Fallback | Fallback | Fallback | Yes | Library when connected, connection when disconnected | OK |

## Navigation hierarchy

### Primary, persistent

- Library
- Updates
- Browse
- Search
- Extensions
- Categories
- History
- Downloads
- Settings

Desktop: persistent sidebar. Tablet: compact icon rail with tooltips. Phone:
four bottom destinations plus a **More** menu containing Extensions,
Categories, History, Downloads, and Settings.

### Secondary

- Settings subsection pages (`/settings/*`) and About.
- Source listing (`/browse/:sourceId`).
- Extension detail (`/extensions/:pkgName`).
- Device/offline library (`/offline`).
- Manga detail (`/manga/:mangaId`).
- Reader (`/manga/:mangaId/chapter/:chapterId`).

### Contextual

- Library card → Manga detail.
- Library Continue → Reader.
- Updates row → Reader; Updates “Manga” action → Manga detail.
- History row → Reader at last page.
- Downloads row → Reader; device download → offline reader.
- Source card → Manga detail.
- Search result → Manga detail.
- Extension card → Extension detail.
- Manga chapter row → Reader.
- Reader previous/next/chapter list.
- Settings rows → subsection pages.

## Devices

### Desktop (> 1100 px)

Persistent full sidebar with labels, active indicator, download badge, extension
update badge, and server account. Content is a normal document column.

### Tablet (761–1100 px)

Independent compact rail: 76 px wide, icon-only, labels visually hidden but
available through `aria-label` and `title`. All nine primary destinations remain
present. Library header stacks title, search, and actions so controls never
overlap. At 1180 px landscape the full desktop sidebar is used.

### Phone (≤ 760 px)

Bottom navigation with Library, Updates, Browse, Search, More. More is a dialog
with Extensions, Categories, History, Downloads, Settings; it focuses its first
link on open, closes on outside click or Escape, and returns focus to the More
trigger on Escape. Safe-area padding is retained. Library header actions wrap
instead of clipping; Settings navigation becomes a horizontally scrollable row
with stacked full-width action buttons.

## Fixes

1. **`/about` blank page** — replaced `useQuery` without an `ApolloProvider` with
   a query through the connected Apollo client. `/about` now renders and keeps
   Settings active.
2. **Extensions unreachable on phone** — Extensions was excluded from both the
   bottom bar and More. It is now in More.
3. **Wrong active states** — Browse now covers `/browse/:sourceId`, Extensions
   covers `/extensions/:pkgName`, and Settings covers `/about`.
4. **Deep-link loss on connect** — protected routes pass a relative `from` to
   the connection screen; after connect/login the user returns to the intended
   route. Reader also preserves this state.
5. **Always-Library Manga Back** — Manga detail uses `state.from` with a safe
   `/library` fallback and shows “Back” instead of the misleading “Back to
   library” when returning elsewhere.
6. **Scroll reset on Back** — scroll is stored per pathname in sessionStorage and
   restored on POP navigation, with retries while async content grows. Reload
   resets to the top.
7. **Subpath deployments** — active matching and `state.from` now use a
   route-relative path helper, preventing missing active states and doubled
   `/app/app/...` links.
8. **Tablet composition** — added compact rail for 761–1100 px; tablet portrait
   no longer reuses the phone bottom bar.
9. **Phone Library controls clipped** — title/search/actions stack and actions
   wrap. Search, Select, Fuzzy, Duplicates, Grid/List, Filter, Sort, Save
   defaults, and Sync library are all reachable at 390 px.
10. **Landscape Library header overlap** — at 861–1360 px the header uses three
    rows so the title, search, and action strip cannot overlap.
11. **Settings mobile squeeze** — settings navigation and content stack; nav is
    horizontally scrollable and action buttons are full width.
12. **Settings anchor active state** — anchor clicks update the active item
    instead of permanently highlighting Connection.
13. **Offline library orphan entry** — Downloads now has “Open offline library”;
    offline page returns to Downloads when that is where the user came from.
14. **Unknown route dead end** — connected unknown URLs fall back to Library;
    disconnected ones fall back to the connection screen. Unknown Settings
    subsections return to `/settings`.
15. **Search and source query state** — `/library?q=&fuzzy=`, `/search?q=`, and
    `/browse/:id?q=` now restore their input and results across Back/deep links.
16. **Manga tabs** — Overview/Chapters is represented by `?section=chapters`, so
    it survives reload and browser Back.
17. **Route-change focus** — focus moves to `#main-content` after path changes;
    navigation controls are links, actions remain buttons, and active links use
    `aria-current="page"`.
18. **False Library breadcrumb** — Manga Detail no longer hardcodes
    `Library / title`; it renders only `origin.trail`. Direct URLs show title
    only.
19. **False Library active state** — Manga Detail active primary nav follows
    `origin.section`; direct Manga URLs have no fabricated Library active.
20. **Reader provenance chain** — Manga-origin Reader passes `fromManga` and
    origin; Reader Back uses history Back to the existing Manga entry. Feed
    Reader uses its actual origin label and returns there.

## State preservation

- Library: search and fuzzy mode in URL; category, filters, and sort remain
  available through saved library preferences; scroll restored per path.
- Browse: source ID in path, search query in URL; source filter values and
  loaded pagination are not URL-encoded, so returning to a source keeps its
  query but not arbitrary filter/pagination state.
- Global search: query in URL and local search history restored.
- Manga detail: Overview/Chapters tab in URL; Back keeps the originating URL,
  including search/hash and source query.
- Reader: current chapter/page in URL; progress remains server-written.
- Updates/History/Downloads: scroll restored on Back; item routes remain stable.
- Settings: hash anchors address sections; subpage back returns to Settings.

## Deep linking tested

- `/settings` while disconnected, then connect → returns to `/settings`.
- `/library?q=Artwork`, `/browse/:id?q=Artwork`, `/search?q=one piece`.
- `/search?q=one%20piece` then One Piece (Color) (not in Library).
- `/manga/427`, `/manga/427?section=chapters`.
- `/manga/427/chapter/42`, `/manga/427/chapter/43`.
- `/about`, `/offline`, `/offline/read/:chapterId`.
- Unknown `/unknown/path` while connected → `/library`.
- Invalid manga/chapter IDs → Library, never a blank page.

## Reader

Chapter rows, Continue reading, history resume, and Updates open
`/manga/:mangaId/chapter/:chapterId`. Reader previous/next updates the URL to the
new chapter, reloads pages, resets page index, scroll, appended chapters, and
preload state.

Back behavior is provenance-aware:

- Manga to Reader: `← Manga`, history Back returns to the existing Manga entry,
  then Manga Back returns to the original Search/Browse/Updates context.
- History/Updates/Downloads to Reader: label shows that origin and back returns
  there, without inventing a Manga stop.
- Direct Reader: no state; back opens Manga with a title-only breadcrumb.
- Browser Back after the custom Reader Back returns to the previous route, not
  a duplicate Reader/Manga loop.

Reader deliberately hides the app shell, so no unrelated primary destination is
highlighted.

## Authentication and guards

- No server configured: `/` connection screen.
- Protected route while disconnected: redirect to `/` with relative `from`.
- Successful connect/login: return to `from`; otherwise stay on connection
  screen with Open library.
- Auth expiry on a protected page: same guard and return flow.
- Reader has its own guard because it renders outside the app shell.
- Logout/disconnect returns to `/`.
- No redirect loop observed.

## Accessibility

- Sidebar, rail, bottom bar, and More use links with accessible names.
- Active destination has `aria-current="page"`.
- More trigger has `aria-expanded` and `aria-controls`; dialog focuses its first
  link; Escape closes and restores trigger focus.
- Skip link targets `#main-content`; route change focuses main content.
- Buttons remain buttons; navigation remains links. No `href="#"` or clickable
  navigation divs.
- Focus outlines are preserved; reduced-motion CSS remains in force.

## Tests

Added:

- `navigationOrigin.test.ts`: full URL preservation, source trail, malformed
  origin rejection, legacy return validation.
- `MangaDetailPage.test.tsx`: direct Manga has no Library breadcrumb; Browse and
  Search provenance; in-Library but Browse origin; actual Library origin;
  Updates Back.
- `AppLayout.test.tsx`: Manga active nav follows origin, direct Manga has no
  active item, source/extension/About active states, subpath, mobile More,
  Escape focus.
- `ReaderPage.test.tsx`: Reader back label/return for History origin and
  `fromManga` origin.
- `App.test.tsx`: return to intended protected route after connecting.
- `LibraryPage.test.tsx`: URL query restoration and fuzzy URL state.
- `AboutPage.test.tsx`: direct `/about` render and Settings link.

Full suite result is recorded in the final validation section below.

## Browser audit

Final code was exercised against a real Suwayomi stable `v2.4.2366` at
`http://192.168.2.3:4568`, through a temporary HTTPS same-origin proxy. Actual
data included `One Piece (Color)` (ID 1115, `inLibrary: false`) and library
manga IDs 3111, 1114, 427, 2726, and 5209.

Viewports:

- Desktop 1280×900.
- Tablet portrait 820×1180 (76 px rail, no bottom bar, no overflow).
- Tablet/desktop landscape 1180×820 (full sidebar, no overlap).
- Phone 390×844 (bottom bar, More menu, all controls within viewport).

Flows and observed results:

- Library → Manga 3111: `Library / title`, Back `/library`, active Library.
- Browse 8Muses → Manga 5209 (not in Library): `Browse / 8Muses (EN) / Artwork 2`,
  Back source, active Browse.
- Browse Weeb Central → Manga 1114 (in Library): `Browse / Weeb Central (EN) /
  One Piece`, Back source, active Browse.
- Search `one piece` → Manga 1115 `One Piece (Color)`: `Search / One Piece
  (Color)`, Back `/search?q=one%20piece`, active Search. This is the exact
  regression case.
- Search `one piece` → Manga 1114: `Search / One Piece`, active Search.
- Updates → Manga 2726: `Updates / title`, Back `/updates`, active Updates.
- History → Reader → Back: Reader label `← History`, returns `/history`;
  no false Manga or Library breadcrumb.
- Search → Manga 3111 → Reader → Reader Back: returns Manga with `Search /
  ...` still intact; Browser Back then returns Search, not duplicated Reader.
- Browser Back/Forward: Library → Manga → Reader → Reader Back → Manga →
  Browser Back → Library; Forward restores Manga with origin.
- Direct `/manga/9`: breadcrumb is only the title, no active primary item,
  Back falls back to `/library`.
- Direct Reader `/manga/9/chapter/3009`: Reader back opens Manga; Manga
  breadcrumb is title only.
- Reload at `/manga/1115` after Search origin: state is dropped, breadcrumb
  becomes title only, no false origin, no active primary item.
- Source scroll 800 px → Manga → Back: source query and scroll 800 restored.
- Mobile 390 and tablet 820: `Search / One Piece (Color)`, active Search,
  Back label, no overflow.
- No console exceptions in the final runtime flows.

## Validation

```text
npm.cmd run codegen:check  PASS
npm.cmd run lint           PASS
npm.cmd run typecheck      PASS
npm.cmd run test           PASS
npm.cmd run build          PASS
```

Exact test counts:

```text
Test Files  78 passed | 3 skipped (81)
Tests       415 passed | 7 skipped (422)
```

## Remaining limitations

- `/offline` and `/offline/read/:chapterId` intentionally render without the
  authenticated app shell because they must work offline. They are reached from
  Downloads and from the connection screen.
- 19 server-blocked capabilities remain unavailable by API; they are not
  navigation defects.
- WebView/open-in-WebView, native fullscreen, and Wake Lock vary by browser and
  remain platform limitations.
- Source filter values, source pagination, and Library filter/sort are not all
  URL-encoded; search text, source query, and scroll are preserved, while
  arbitrary filter/pagination state may reset. This is a deliberate limit, not
  a hidden success claim.
- Navigation provenance lives in React Router history state. Reload drops it;
  the UI then shows a title-only breadcrumb and uses Library as an explicit Back
  fallback. It never invents a Library origin.
- A direct Manga URL intentionally has no active primary nav item. It is not
  treated as Library just because the route is Manga.
- Related/recommendation Manga navigation is not implemented, so Manga A → B
  chains are not present to test. History and Downloads open Reader directly,
  not Manga Detail; their Reader Back returns to History/Downloads.
- The temporary public tunnel and LAN backend are runtime aids, not product
  deployment guarantees. The recorded runtime evidence is from the final code
  built in this workspace.


## Post-change verification (Goal 6)

Runtime dilakukan ulang setelah perubahan semantics, IA, action hierarchy, dan responsive.

| Skenario | Hasil | Status |
| --- | --- | --- |
| Library → Manga 3111 | breadcrumb berawal `Library`; Back `Back to library`; active nav Library | Lulus |
| Manga → chapter 3171 | Reader menampilkan `← Manga`; browser Back kembali ke Manga yang sama | Lulus |
| Reader → browser Back → Manga → browser Back | kembali ke Library tanpa membuat entri Manga ganda | Lulus |
| Direct `/manga/1115` | breadcrumb hanya judul; tidak ada active primary nav; Back fallback `/library` | Lulus |
| Search → Manga 1148 | breadcrumb `Search / ...`; Back `/search?q=one%20piece`; active Search | Lulus |
| Browse source → Manga 5656 | breadcrumb `Browse / Comick ... / title`; Back kembali ke source; active Browse | Lulus |
| Updates → feed row | feed row membuka Reader, bukan Manga; Reader Back menampilkan origin feed | Lulus secara struktur; runtime feed row belum diulang setelah perubahan |
| Manga tab Overview | URL `?section=overview`; tab Overview active; Chapters tidak dirender | Lulus |
| Manga tab Chapters | URL tanpa `section`; Chapters active; Overview tool tidak dirender | Lulus |
| Reload setelah origin Library | halaman kembali ke Connection karena sesi server belum auto-connect, bukan karena provenance salah | Concern Goal 14/19 |
| Reload halaman Manga tanpa state | setelah reconnect, breadcrumb harus title-only dan active nav kosong; tidak ada origin rekaan | Diverifikasi oleh test dan desain state |

### Catatan provenance

- Provenance tidak diambil dari `inLibrary`; Manga non-Library dari Search tetap menampilkan Search.
- Category/filter state tidak dipakai untuk menebak asal.
- `origin.trail` hanya berisi jalur yang benar-benar dilalui user.
- Back tetap memakai history Back jika origin adalah entri sebelumnya; jika tidak, memakai `originHref`.
- Reload menghapus navigation state secara intentional. Konsekuensinya adalah title-only breadcrumb setelah koneksi dipulihkan; issue sesi adalah domain Goal 14/19.

### Sisa concerns

1. Auto-connect/session restoration setelah reload belum memulihkan route Manga; ini bukan bug provenance, tetapi UX recovery.
2. Feed row Updates/History langsung membuka Reader; test runtime Back feed perlu diulang pada Goal 12.
3. Back link dan breadcrumb sama-sama tampil; keduanya berbeda (history vs konteks), tetapi perlu dijaga agar tidak terasa duplikat di phone.
4. Scroll restoration untuk daftar panjang belum diukur pada data ekstrem; Goal 18.

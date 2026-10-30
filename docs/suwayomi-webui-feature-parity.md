# Suwayomi-WebUI Feature Parity

Living specification for functional parity with the official Suwayomi-WebUI.
Visual design remains governed by [`Refrence/`](../Refrence) and is intentionally
**not** derived from Suwayomi-WebUI.

## Pinned upstream baseline

| Field | Value |
|---|---|
| Repository | https://github.com/Suwayomi/Suwayomi-WebUI |
| Release | **v20260929.01 (r3518)** |
| Tag commit | `41443eaba44bcbdf45d666fe27471b50d41fd994` |
| Release date | **2026-09-29** |
| Published | 2026-09-29T21:17:23Z |
| Inspected | shallow clone at the tag, plus README, CHANGELOG, `AppRoute.constants.ts`, `App.tsx`, feature modules, settings modules, and server stable schema `v2.4.2366` |

This baseline is fixed for this implementation cycle. Do not track `master`
implicitly. Advance it only during a deliberate parity audit.

Product rule:

- **Official Suwayomi-WebUI decides WHAT users can do.**
- **This repository's architecture and stable server schema decide HOW it is implemented.**
- **`Refrence/` decides HOW it looks.**

No upstream source code, components, CSS, or MUI patterns are copied into this
frontend.

## Status legend

- `Implemented` — usable end-to-end on desktop and mobile
- `Partial` — some real functionality exists, but important official behavior is missing
- `Missing` — no implementation yet
- `Blocked by server` — pinned server contract cannot support it
- `Platform limitation` — browser/PWA platform cannot support the full behavior
- `Not applicable` — verified irrelevant to the supported product; requires a concrete reason

## Matrix

### Authentication, connection, shell

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Connection | Server URL, connect, compatibility check | `Implemented` | AboutServer + protected probe | Memory-only config; no persistence |
| Authentication | NONE | `Implemented` | Yes | |
| Authentication | UI login, token refresh, logout | `Implemented` | Yes | |
| Authentication | Basic auth / simple login modes | `Missing` | Yes | ConnectionCoordinator currently exposes NONE/UI_LOGIN only |
| Connection | Persist server URL and session across reload/PWA relaunch | `Missing` | Client concern | Deliberately deferred; architecture requires a storage decision |
| Shell | Desktop sidebar + mobile bottom navigation | `Partial` | Client concern | All seven top-level pages now have routes; mobile uses seven compact tabs |
| Shell | Mobile "More" overflow destination | `Partial` | Client concern | We expose all pages directly instead of an overflow sheet |
| Navigation | Download queue badge and extension-update badge | `Missing` | DownloadStatus + extensions | |
| App updates | Inform about WebUI/server updates | `Partial` | WebUI update query + subscriptions | PWA shell update prompt exists; server/WebUI update checker does not |
| Localization | Upstream translations and language selection | `Missing` | Client concern | Current UI is English |
| PWA | Installable shell, safe areas, route fallback | `Implemented` | Client concern | Shell-only cache; no private resources |
| PWA | Offline reading/downloads | `Missing` | Server downloads | No offline reader/cache |
| Sharing | Native share of manga/reader | `Partial` | Client concern | Reader chapter share when Web Share API exists; manga share absent |

### Library

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Library | Poster grid with authenticated thumbnails | `Implemented` | Yes | Real ResourceService thumbnails |
| Library | List / comfortable grid / compact grid | `Partial` | Client concern | Poster grid only |
| Library | Categories and category counts | `Partial` | Yes | Category tabs and counts on Categories page; library tab counts not shown |
| Library | Search | `Implemented` | Yes | Server-side search |
| Library | Fuzzy search | `Missing` | Client-side/upstream metadata | |
| Library | Search autocomplete and search history | `Missing` | Client-side | |
| Library | Reset all filters | `Implemented` | Client concern | Resets search, status, category, random mode, and default sort |
| Library | Status, source, tracker, unread, started, downloaded, bookmarked filters | `Partial` | Yes | Status filter implemented; source/tracker/unread/started/downloaded/bookmarked missing |
| Library | Filter AND/OR mode and saved defaults | `Missing` | Metadata/settings | |
| Library | Sorting | `Implemented` | Yes | Title/date/ID/direction; no random sort |
| Library | Random manga / random sort | `Partial` | Client concern | Shuffles loaded cards; not a server-wide random query |
| Library | Continue-reading button / tooltip | `Missing` | Reading progress | No progress writer |
| Library | Manga selection, shift-click, long-press | `Implemented` | Client concern | Selection mode, shift range, and 500 ms long-press on posters |
| Library | Bulk download, delete downloads, mark read/unread | `Implemented` | Yes | All four bulk actions implemented with confirmation for delete |
| Library | Bulk category assignment | `Partial` | Yes | Add-to-category only; remove/clear absent |
| Library | Bulk migrate | `Missing` | Yes | |
| Library | Remove from library (single/bulk) | `Partial` | Yes | Single-manga toggle on Detail; bulk removal on Library with confirmation |
| Library | Library duplicate detection/overview | `Missing` | Client-side | |
| Library | Sync button | `Missing` | StartSync mutation | |
| Library | Show unread/download badges | `Implemented` | Yes | Unread and downloaded chapter counts from `MangaType` |
| Library | Tab item counts | `Implemented` | Yes | All total plus per-category manga counts |

### Manga Detail

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Manga | Cover, title, author/artist, status, source, genres, description | `Implemented` | Yes | Ambient hero from real cover |
| Manga | Library add/remove and category picker | `Partial` | Yes | Detail has an in-library toggle; category picker and bulk actions absent |
| Manga | Continue reading from last page | `Implemented` | Reading progress | Detail links the in-progress chapter with `?page=`; reader resumes that page |
| Manga | Read from start/latest chapter | `Implemented` | Yes | Primary CTA uses actual first loaded chapter |
| Manga | Manga notes | `Missing` | Manga meta mutations | |
| Manga | Share | `Missing` | Client concern | |
| Manga | Refresh metadata/chapters from source | `Missing` | Yes | |
| Manga | Migration entry point | `Missing` | Yes | |
| Manga | Tracker binding/score/status | `Missing` | Yes | |
| Manga | Chapter filters and scanlator filter | `Implemented` | Yes | Search, read/download/bookmark filter, scanlator, newest/oldest; saved preferences absent |
| Manga | Missing-chapter indicators | `Partial` | Client-side/server data | Gap separators for loaded chapter range; cross-page gaps absent |
| Manga | Page/tab organization (overview, chapters, related) | `Partial` | Client concern | Overview/Chapters anchor tabs; no related/recommendations |
| Manga | Per-manga reader settings | `Missing` | Client concern | |
| Manga | Mark all previous chapters read | `Missing` | Yes | |

### Chapters

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Chapters | Chapter list with state, date, page count | `Implemented` | Yes | |
| Chapters | Chapter pagination / load more | `Implemented` | Yes | |
| Chapters | Select single/multiple/range chapters | `Partial` | Client concern | Multi-select with shift-click range; long-press absent |
| Chapters | Bookmark/unbookmark | `Partial` | Yes | Per-chapter toggle on Manga Detail; bulk/bookmark filters absent |
| Chapters | Mark read/unread and mark previous read | `Partial` | Yes | Single chapter toggle on Manga Detail; mark-previous/bulk absent |
| Chapters | Download/delete download | `Partial` | Yes | Enqueue/delete per chapter on Detail; queue is in Downloads |
| Chapters | Bulk chapter actions | `Partial` | Yes | Bulk read/unread, bookmark, download, and delete with confirmation; other bulk actions absent |
| Chapters | Scanlator filter and duplicate handling | `Missing` | Yes | |
| Chapters | Missing-chapter separators | `Partial` | Client-side | Gap separators between loaded chapter numbers; unloaded boundaries absent |
| Chapters | Saved sort/filter preferences | `Missing` | Metadata/settings | |

### Reader

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Reader | Vertical continuous reader | `Implemented` | Yes | Current reader |
| Reader | Desktop/mobile chrome | `Partial` | Client concern | Distraction-free shell, previous/next, page count; no chapter rail |
| Reader | Single page mode | `Partial` | Client-side | Single-page layout and page controls; no double-spread pairing logic |
| Reader | Double page mode | `Partial` | Client-side | Two-page layout and page controls |
| Reader | Horizontal continuous mode | `Partial` | Client-side | Horizontal scroll-snap canvas |
| Reader | Webtoon mode + auto detection | `Partial` | Client-side | Webtoon layout exists; auto detection absent |
| Reader | Reading direction (LTR/RTL) | `Partial` | Client-side | Direction setting applied to double-page order and horizontal flow |
| Reader | Page scale modes (width/height/screen/original) | `Partial` | Client-side | Fit width, fit height, and original size |
| Reader | Stretch/scale small pages and custom width | `Partial` | Client-side | Reader width/gap/background preferences exist |
| Reader | Page gap, first-page offset, safe-area inset | `Missing` | Client-side | |
| Reader | Reader defaults per mode | `Missing` | Client metadata | |
| Reader | Per-device reader profiles | `Missing` | Metadata/settings | |
| Reader | Progress write / read state | `Partial` | UpdateChapter mutation | Writes `lastPageRead`; marks read on final page. Live round-trip verified on chapter 2820 (`lastPageRead` persisted) |
| Reader | Resume at last page | `Implemented` | Reading progress | Resumes explicit `?page=` and stored `lastPageRead` for the vertical reader |
| Reader | Previous/next chapter navigation | `Implemented` | Yes | Number-based neighbors |
| Reader | Infinite chapter scrolling and transition pages | `Missing` | Client-side | |
| Reader | Skip duplicate chapters | `Missing` | Client-side | |
| Reader | Preload pages and next chapter | `Partial` | Client-side | Near-viewport page loading only |
| Reader | Image filters (brightness/contrast/etc.) | `Partial` | Client-side | Grayscale, sepia, invert, and high-contrast presets; per-channel sliders absent |
| Reader | Failed-image retry | `Implemented` | Client-side | Per-page retry |
| Reader | Auto-scroll and custom scroll amount | `Partial` | Client-side | Auto-scroll toggle with wheel/touch stop; speed control absent |
| Reader | Custom keybindings | `Partial` | Client-side | Basic arrows/Escape |
| Reader | Tap zones and touch drag scrolling | `Partial` | Client-side | Left/right tap zones in paged modes; drag scrolling not customized |
| Reader | Keep screen on | `Partial` | Platform | Wake Lock where supported; denial is non-fatal |
| Reader | Auto background color | `Missing` | Client-side | |
| Reader | Fullscreen | `Partial` | Platform limitation on iOS | Browser Fullscreen API; iOS Safari has no equivalent |
| Reader | Download next chapter / delete after reading | `Missing` | Yes | |
| Reader | Bookmark/library actions from reader | `Missing` | Yes | |
| Reader | Chapter list overlay/sidebar | `Partial` | Yes | Right-side chapter dialog with active/read markers; sidebar variant absent |

### Updates / History / Downloads

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Updates | Latest chapters from library | `Partial` | Yes | ChapterFeed grouped by day; no "first unread per manga" semantics |
| Updates | Unread/read filters, scanlator, state | `Partial` | Yes | All/Unread/Read; no scanlator filter |
| Updates | Chapter/manga actions | `Missing` | Yes | |
| Updates | Sync button and refresh | `Missing` | StartSync | |
| History | Reading history entries | `Partial` | Yes | Real lastReadAt feed; new reader progress writes feed it |
| History | Last chapter per manga / per day | `Implemented` | Client-side | Dedupes to newest chapter per manga and groups Today/Yesterday |
| History | Resume / clear / remove history | `Partial` | Yes | Resume link includes saved page; clear/remove unsupported by current contract |
| History | Hide history setting | `Partial` | Metadata | Client-side hide-read filter; server history recording unchanged |
| Downloads | Download queue, active/queued/failed states | `Partial` | DownloadStatus + subscriptions | Queue, state, progress, tries, and pause/resume/cancel are implemented; live subscriptions/grouping absent |
| Downloads | Pause/resume, retry, cancel, delete | `Partial` | Yes | Pause/resume, cancel, and delete are implemented; retry-all-failed is absent |
| Downloads | Grouping, bulk series actions, progress/speed | `Partial` | Yes | Progress and per-row actions; no grouping/bulk/speed |
| Downloads | List downloaded chapters | `Partial` | Yes | Real `isDownloaded` feed |
| Downloads | Download/conversion/image settings | `Missing` | Yes | |

### Browse / Sources / Extensions

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Browse | Source catalog and language filter | `Partial` | Yes | Real source list; cannot open source catalog yet |
| Browse | Source manga browsing, search, filters, pagination | `Partial` | Yes | Popular/Latest, search, and pagination; source filters absent |
| Browse | Pinned/last-used sources, preferred languages, NSFW visibility | `Missing` | Metadata | |
| Browse | Hide in-library manga, quick add/remove, duplicate check | `Partial` | Yes | Quick add/remove library implemented; hide/duplicate checks absent |
| Browse | Saved source searches and global search | `Missing` | Client metadata + server | |
| Browse | WebView/open-in-WebView | `Missing` | Platform/server | |
| Extensions | Installed/available extensions, stores, language filters | `Partial` | Yes | Catalog, installed/available sections, language filter, store list; advanced filters absent |
| Extensions | Install/uninstall/update, external JAR, obsolete handling | `Partial` | Yes | Install/uninstall/update and obsolete badge; external JAR upload absent |
| Extensions | Update badges/info pages | `Partial` | Yes | Update section and badge; detail pages absent |
| Sources | Source configure/preferences | `Missing` | Yes | |

### Migration / Tracking / Categories

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Migration | Select manga/source/destination | `Missing` | Yes | |
| Migration | Bulk search, manual search, match include/exclude | `Missing` | Yes | |
| Migration | Missing/outdated match filters, local source | `Missing` | Yes | |
| Migration | Resume/abort via Web Locks | `Missing` | Platform/secure context | |
| Migration | Client data migration options | `Missing` | Yes | |
| Tracking | Tracker auth/config and services | `Partial` | Yes | Tracking settings lists services, login links, and logout; credential/OAuth callback handling absent |
| Tracking | Manga search, bind/unbind, private binding | `Missing` | Yes | |
| Tracking | Score/progress/status and sync behavior | `Missing` | Yes | |
| Categories | List categories and counts | `Partial` | Yes | Read-only category page |
| Categories | Create/rename/reorder/delete with confirmation | `Partial` | Yes | Create, rename, move up/down, and delete with confirmation; default category cannot be deleted |
| Categories | Assignment and default-category behavior | `Missing` | Yes | |
| Categories | Category update/download inclusion flags | `Missing` | Yes | |

### Backup / Sync / Settings / Global behavior

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Backup | Create backup and select data | `Partial` | Yes | Create backup with include flags and returned URL; restore absent |
| Backup | Restore/validate backup | `Missing` | Yes | Upload/restore UI absent |
| Backup | Automatic backup settings | `Partial` | Yes | Auto-backup summary shown; editing remains in Server settings |
| Sync | Sync button and sync status | `Partial` | Yes | Start sync and result state; live progress/subscription absent |
| Sync | Sync settings (Yomi, intervals, data selection) | `Partial` | Yes | Data toggles, Yomi enablement/host, and interval shown; API key editing absent |
| Settings | Real server/connection information | `Partial` | Yes | Current Settings page shows actual server data |
| Settings | Appearance/themes/custom themes/pure black | `Partial` | Client concern | Dark and pure-black themes persist per device; custom themes/accent editing absent |
| Settings | Reader defaults and device profiles | `Partial` | Client metadata | `/settings/reader` stores width, gap, background per device; modes/profiles absent |
| Settings | Library preferences (fuzzy, badges, layout, continue reading) | `Partial` | Metadata | Compact/comfortable grid density implemented; other library prefs absent |
| Settings | Download preferences and image processing | `Partial` | Yes | Server download toggles/limits and CBZ setting; image processing absent |
| Settings | Browse/source/extension-store settings | `Missing` | Yes | |
| Settings | History preferences | `Partial` | Metadata | Hide-read preference stored per device; retention/server history settings absent |
| Settings | Tracking settings | `Partial` | Yes | `/settings/tracking` lists services and supports logout; binding/score controls absent |
| Settings | Server settings, authentication, database, OPDS/KOReader | `Partial` | Yes | `/settings/server` reads and writes safe update/download/system settings; auth/database/OPDS/KOReader editing absent |
| Settings | WebUI channel/flavor/update settings | `Partial` | Yes | Channel, flavor, and interface displayed; update controls absent |
| Settings | Device management | `Partial` | Metadata | `/settings/device` shows platform, display, PWA, Wake Lock, and share capabilities; no remote device management |
| Global search | Search all sources, global source filter, library counts | `Missing` | Yes | |
| Global search | Search history/suggestions | `Missing` | Client metadata | |
| Hotkeys | Configurable app/reader hotkeys | `Partial` | Client concern | Arrow page paging, Shift+Arrow chapter navigation, Escape back; not configurable |
| Themes | Dynamic manga artwork backdrop, custom themes | `Partial` | Client concern | Ambient art exists; no theme system |
| About | About route with versions/update actions | `Partial` | Yes | About data is inside Settings; no `/about` route |
| Server config | Persist server URL/session | `Missing` | Client concern | |
| Localization | Translated UI | `Missing` | Client concern | |
| Accessibility | Keyboard/focus/labels on implemented screens | `Partial` | Client concern | Core screens audited; new parity screens still need audits |

## Immediate implementation order

1. Finish the current visual shell and the seven real pages (Library, Updates,
   Browse, Categories, History, Downloads, Settings) with honest real-data states.
2. Add state-changing core actions: manga library toggle/categories, chapter
   read/bookmark/download actions, exact page resume, and continue-reading in
   Library.
3. Reader parity: modes, settings, filters, preload/resume, keybinds.
4. Downloads queue and controls.
5. Sources/extensions and Browse source search.
6. Migration and tracking.
7. Backup, sync, and full Settings parity.
8. Global search, themes, localization, hotkeys, app update checks, and polish.

## Audit notes

- The upstream release adds fuzzy library search, search autocomplete/history,
  per-manga notes, retry-all-failed downloads, reader fullscreen, library filter
  reset, tracker filter AND/OR, sync buttons, and extension-search suggestions.
  These are included above.
- Upstream uses MUI and its own navigation/layout. This frontend deliberately
  does not copy those choices; our shell, surfaces, density, and motion come from
  the local `Refrence/` images.
- The stable server schema exposes the mutations and queries needed by the
  missing areas above (manga/chapter/category updates, downloads, extensions,
  migration/source metadata, trackers, backup/restore, sync, settings). No
  blanket "blocked by server" claim is justified.
- Platform limitations are explicit: iOS fullscreen behavior, Wake Lock
  availability, secure-context share, Web Locks for migration resume, and native
  WebView/Electron flows.

## Verification policy

Every change that moves a row from `Missing`/`Partial` to `Implemented` must:

1. cite the official behavior inspected;
2. cite the stable schema operation used;
3. add/modify tests through the project architecture;
4. update this matrix in the same commit;
5. receive desktop and mobile visual checks where a screen changed.

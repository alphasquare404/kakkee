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
| Connection | Persist server URL and session across reload/PWA relaunch | `Implemented` | Client storage | Opt-in refresh-token persistence plus server URL/auto-connect; access token stays in memory |
| Shell | Desktop sidebar + mobile bottom navigation | `Partial` | Client concern | All seven top-level pages now have routes; mobile uses seven compact tabs |
| Shell | Mobile "More" overflow destination | `Partial` | Client concern | We expose all pages directly instead of an overflow sheet |
| Navigation | Download queue badge and extension-update badge | `Implemented` | Yes | Download subscription, periodic extension-update refresh, and route-change refresh |
| App updates | Inform about WebUI/server updates | `Implemented` | WebUI update query + subscriptions | PWA update prompt, WebUI update check, and server update check on `/about` |
| Localization | Upstream translations and language selection | `Partial` | Client concern | English/Indonesian locale selection; upstream message catalogs absent |
| PWA | Installable shell, safe areas, route fallback | `Implemented` | Client concern | Shell-only cache; no private resources |
| PWA | Offline reading/downloads | `Missing` | Server downloads | No offline reader/cache |
| Sharing | Native share of manga/reader | `Implemented` | Client concern | Reader chapter share and manga share with clipboard fallback |

### Library

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Library | Poster grid with authenticated thumbnails | `Implemented` | Yes | Real ResourceService thumbnails |
| Library | List / comfortable grid / compact grid | `Implemented` | Client concern | Grid/list toggle plus compact/comfortable density |
| Library | Categories and category counts | `Partial` | Yes | Category tabs and counts on Categories page; library tab counts not shown |
| Library | Search | `Implemented` | Yes | Server-side search |
| Library | Fuzzy search | `Partial` | Client-side/upstream metadata | Token/subsequence fuzzy filter over loaded titles; not a server-wide fuzzy query |
| Library | Search autocomplete and search history | `Partial` | Client-side | Recent-search suggestions and history stored per device; remote autocomplete absent |
| Library | Reset all filters | `Implemented` | Client concern | Resets search, status, category, random mode, and default sort |
| Library | Status, source, tracker, unread, started, downloaded, bookmarked filters | `Partial` | Yes | Status, source, unread, started, and downloaded filters; tracker/bookmarked filters absent |
| Library | Filter AND/OR mode and saved defaults | `Implemented` | Yes | Status OR set, AND with source/category, saved defaults include the OR set |
| Library | Sorting | `Implemented` | Yes | Title/date/ID/direction; no random sort |
| Library | Random manga / random sort | `Partial` | Client concern | Shuffles loaded cards; not a server-wide random query |
| Library | Continue-reading button / tooltip | `Implemented` | Reading progress | Progress chip, tooltip, and direct resume button with saved page |
| Library | Manga selection, shift-click, long-press | `Implemented` | Client concern | Selection mode, shift range, and 500 ms long-press on posters |
| Library | Bulk download, delete downloads, mark read/unread | `Implemented` | Yes | All four bulk actions implemented with confirmation for delete |
| Library | Bulk category assignment | `Implemented` | Yes | Add to and remove from a selected category for selected manga |
| Library | Bulk migrate | `Blocked by server` | No | No migration API in stable schema; single/bulk migration impossible without inventing mutations |
| Library | Remove from library (single/bulk) | `Implemented` | Yes | Single-manga toggle on Detail and bulk removal on Library with confirmation |
| Library | Library duplicate detection/overview | `Partial` | Client-side | Normalized title groups over loaded library items; server-wide scan absent |
| Library | Sync button | `Implemented` | Yes | Starts `updateLibrary` and shows live job progress via subscription |
| Library | Show unread/download badges | `Implemented` | Yes | Unread and downloaded chapter counts from `MangaType` |
| Library | Tab item counts | `Implemented` | Yes | All total plus per-category manga counts |

### Manga Detail

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Manga | Cover, title, author/artist, status, source, genres, description | `Implemented` | Yes | Ambient hero from real cover |
| Manga | Library add/remove and category picker | `Partial` | Yes | In-library toggle and category picker; bulk library actions absent |
| Manga | Continue reading from last page | `Implemented` | Reading progress | Detail links the in-progress chapter with `?page=`; reader resumes that page |
| Manga | Read from start/latest chapter | `Implemented` | Yes | Primary CTA uses actual first loaded chapter |
| Manga | Manga notes | `Implemented` | Manga meta mutations | Notes stored in manga meta with save/clear |
| Manga | Share | `Implemented` | Client concern | Web Share API with clipboard fallback |
| Manga | Refresh metadata/chapters from source | `Implemented` | Yes | Refresh button calls fetchMangaAndChapters and reloads detail |
| Manga | Migration entry point | `Blocked by server` | No | Stable v2.4.2366 schema exposes no migration mutation/query |
| Manga | Tracker binding/score/status | `Implemented` | Yes | Search/bind/unbind with private option, status and score editing |
| Manga | Chapter filters and scanlator filter | `Implemented` | Yes | Search, read/download/bookmark filter, scanlator, newest/oldest; saved preferences absent |
| Manga | Missing-chapter indicators | `Partial` | Client-side/server data | Gap separators for loaded chapter range; cross-page gaps absent |
| Manga | Page/tab organization (overview, chapters, related) | `Partial` | Client concern | Overview/Chapters anchor tabs; no related/recommendations |
| Manga | Per-manga reader settings | `Partial` | Client concern | Per-manga reading-mode override; other reader settings remain global |
| Manga | Mark all previous chapters read | `Implemented` | Yes | Per-chapter Prev action marks older unread chapters read |

### Chapters

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Chapters | Chapter list with state, date, page count | `Implemented` | Yes | |
| Chapters | Chapter pagination / load more | `Implemented` | Yes | |
| Chapters | Select single/multiple/range chapters | `Partial` | Client concern | Multi-select with shift-click range; long-press absent |
| Chapters | Bookmark/unbookmark | `Implemented` | Yes | Per-chapter and bulk bookmark toggles plus bookmarked filter |
| Chapters | Mark read/unread and mark previous read | `Implemented` | Yes | Single toggle, bulk read/unread, and per-chapter mark-previous |
| Chapters | Download/delete download | `Implemented` | Yes | Per-chapter and bulk enqueue/delete, plus Downloads queue and Reader actions |
| Chapters | Bulk chapter actions | `Partial` | Yes | Bulk read/unread, bookmark, download, and delete with confirmation; other bulk actions absent |
| Chapters | Scanlator filter and duplicate handling | `Implemented` | Yes | Scanlator filter plus hide-duplicate chapter numbers toggle |
| Chapters | Missing-chapter separators | `Partial` | Client-side | Gap separators between loaded chapter numbers; unloaded boundaries absent |
| Chapters | Saved sort/filter preferences | `Implemented` | Client metadata | Per-manga order, filter, and scanlator restored from device storage |

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
| Reader | Page gap, first-page offset, safe-area inset | `Implemented` | Client-side | Gap, first-page offset, safe-area padding, and per-mode layout defaults |
| Reader | Reader defaults per mode | `Implemented` | Client metadata | Save layout per mode and restore on mode switch |
| Reader | Per-device reader profiles | `Implemented` | Metadata/settings | Per-mode layouts stored per device |
| Reader | Progress write / read state | `Implemented` | UpdateChapter mutation | Writes `lastPageRead`; marks read on final page. Live round-trip verified on chapter 2820 (`lastPageRead` persisted) |
| Reader | Resume at last page | `Implemented` | Reading progress | Resumes explicit `?page=` and stored `lastPageRead` for the vertical reader |
| Reader | Previous/next chapter navigation | `Implemented` | Yes | Number-based neighbors |
| Reader | Infinite chapter scrolling and transition pages | `Partial` | Client-side | Optional auto-advance to next chapter after last page; inline scroll append absent |
| Reader | Skip duplicate chapters | `Partial` | Client-side | Deduplicates loaded chapter numbers for overlay and navigation; unloaded boundaries fall back to server |
| Reader | Preload pages and next chapter | `Partial` | Client-side | Current ±1 pages eager-loaded plus near-viewport loading; next chapter not preloaded |
| Reader | Image filters (brightness/contrast/etc.) | `Partial` | Client-side | Grayscale, sepia, invert, and high-contrast presets; per-channel sliders absent |
| Reader | Failed-image retry | `Implemented` | Client-side | Per-page retry |
| Reader | Auto-scroll and custom scroll amount | `Partial` | Client-side | Auto-scroll toggle with wheel/touch stop; speed control absent |
| Reader | Custom keybindings | `Partial` | Client-side | Basic arrows/Escape |
| Reader | Tap zones and touch drag scrolling | `Partial` | Client-side | Left/right tap zones in paged modes; drag scrolling not customized |
| Reader | Keep screen on | `Partial` | Platform | Wake Lock where supported; denial is non-fatal |
| Reader | Auto background color | `Implemented` | Client-side | Samples the current page and tints the Reader background when enabled |
| Reader | Fullscreen | `Partial` | Platform limitation on iOS | Browser Fullscreen API; iOS Safari has no equivalent |
| Reader | Download next chapter / delete after reading | `Implemented` | Yes | Active chapter download/delete, download next chapter, and opt-in delete-after-reading |
| Reader | Bookmark/library actions from reader | `Implemented` | Yes | Bookmark toggle and add/remove library from Reader |
| Reader | Chapter list overlay/sidebar | `Partial` | Yes | Right-side chapter dialog with active/read markers; sidebar variant absent |

### Updates / History / Downloads

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Updates | Latest chapters from library | `Partial` | Yes | ChapterFeed grouped by day; no "first unread per manga" semantics |
| Updates | Unread/read filters, scanlator, state | `Partial` | Yes | All/Unread/Read; no scanlator filter |
| Updates | Chapter/manga actions | `Partial` | Yes | Mark read/unread and download from feed; broader manga actions absent |
| Updates | Sync button and refresh | `Implemented` | Yes | Starts library update, shows live progress, and refreshes feed on completion |
| History | Reading history entries | `Implemented` | Yes | Real lastReadAt feed; reader progress writes populate it |
| History | Last chapter per manga / per day | `Implemented` | Client-side | Dedupes to newest chapter per manga and groups Today/Yesterday |
| History | Resume / clear / remove history | `Partial` | Yes | Resume link includes saved page; clear/remove unsupported by current contract |
| History | Hide history setting | `Partial` | Metadata | Client-side hide-read filter; server history recording unchanged |
| Downloads | Download queue, active/queued/failed states | `Partial` | DownloadStatus + subscriptions | Queue, state, progress, tries, and pause/resume/cancel are implemented; live subscriptions/grouping absent |
| Downloads | Pause/resume, retry, cancel, delete | `Implemented` | Yes | Pause/resume, cancel, delete, and retry-all-failed via bulk enqueue |
| Downloads | Grouping, bulk series actions, progress/speed | `Partial` | Yes | Manga grouping, series cancel, and progress; speed absent |
| Downloads | List downloaded chapters | `Implemented` | Yes | Real `isDownloaded` feed with delete action |
| Downloads | Download/conversion/image settings | `Partial` | Yes | Download/serve conversion list editor; image processing settings absent |

### Browse / Sources / Extensions

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Browse | Source catalog and language filter | `Implemented` | Yes | Real source list with language filter and source catalog navigation |
| Browse | Source manga browsing, search, filters, pagination | `Partial` | Yes | Popular/Latest, search, and pagination; source filters absent |
| Browse | Pinned/last-used sources, preferred languages, NSFW visibility | `Partial` | Metadata | Pin/last-used, saved language filter, and NSFW toggle; multi-language preference list absent |
| Browse | Hide in-library manga, quick add/remove, duplicate check | `Partial` | Yes | Quick add/remove library implemented; hide/duplicate checks absent |
| Browse | Saved source searches and global search | `Partial` | Client metadata + server | Per-source search history and `/search` page; live search across all sources absent |
| Browse | WebView/open-in-WebView | `Platform limitation` | Platform/server | Browser frontend cannot host the server-side WebView integration |
| Extensions | Installed/available extensions, stores, language filters | `Partial` | Yes | Catalog, installed/available sections, language filter, store add/remove; advanced filters absent |
| Extensions | Install/uninstall/update, external JAR, obsolete handling | `Implemented` | Yes | Catalog install/uninstall/update, external JAR upload, and obsolete badge |
| Extensions | Update badges/info pages | `Implemented` | Yes | Update section/badge and per-extension detail page with install/update/uninstall |
| Sources | Source configure/preferences | `Implemented` | Yes | Checkbox, switch, edit-text, list, and multi-select preferences editable |

### Migration / Tracking / Categories

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Migration | Select manga/source/destination | `Blocked by server` | No | No migration API in stable schema |
| Migration | Bulk search, manual search, match include/exclude | `Blocked by server` | No | No source-search migration endpoint in stable schema |
| Migration | Missing/outdated match filters, local source | `Blocked by server` | No | No migration/match API in stable schema |
| Migration | Resume/abort via Web Locks | `Blocked by server` | No | Depends on absent migration job API |
| Migration | Client data migration options | `Blocked by server` | No | No migration API in stable schema |
| Tracking | Tracker auth/config and services | `Partial` | Yes | Tracking settings lists services, login links, and logout; credential/OAuth callback handling absent |
| Tracking | Manga search, bind/unbind, private binding | `Implemented` | Yes | Tracker search, bind, private option, unlink, status/score editing |
| Tracking | Score/progress/status and sync behavior | `Implemented` | Yes | Score/status, reading dates, manual sync, and optional auto-sync after finishing a Reader chapter |
| Categories | List categories and counts | `Implemented` | Yes | Categories page with real manga counts |
| Categories | Create/rename/reorder/delete with confirmation | `Implemented` | Yes | Create, rename, move up/down, set default, and delete with confirmation; default is protected |
| Categories | Assignment and default-category behavior | `Implemented` | Yes | Per-manga category picker plus Set default action |
| Categories | Category update/download inclusion flags | `Implemented` | Yes | Per-category include in updates/downloads toggles |

### Backup / Sync / Settings / Global behavior

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Backup | Create backup and select data | `Implemented` | Yes | Create backup with include flags and returned URL |
| Backup | Restore/validate backup | `Implemented` | Yes | Multipart validate and restore with auth; missing sources/trackers shown before restore |
| Backup | Automatic backup settings | `Implemented` | Yes | Editable auto-backup path/interval/time/TTL and include flags |
| Sync | Sync button and sync status | `Implemented` | Yes | Start sync, result state, and live `syncStatusChanged` status |
| Sync | Sync settings (Yomi, intervals, data selection) | `Partial` | Yes | Data toggles, Yomi enablement/host, and interval shown; API key editing absent |
| Settings | Real server/connection information | `Implemented` | Yes | Settings shows actual server, version, and capability data |
| Settings | Appearance/themes/custom themes/pure black | `Partial` | Client concern | Dark and pure-black themes persist per device; custom themes/accent editing absent |
| Settings | Reader defaults and device profiles | `Implemented` | Client metadata | `/settings/reader` stores width, gap, background, and per-mode profiles per device |
| Settings | Library preferences (fuzzy, badges, layout, continue reading) | `Partial` | Metadata | Compact/comfortable grid density implemented; other library prefs absent |
| Settings | Download preferences and image processing | `Partial` | Yes | Server download toggles/limits, CBZ, conversion lists, and cache clearing; image processing absent |
| Settings | Browse/source/extension-store settings | `Implemented` | Yes | Extension stores add/remove and per-source preference editing |
| Settings | History preferences | `Partial` | Metadata | Hide-read preference stored per device; retention/server history settings absent |
| Settings | Tracking settings | `Partial` | Yes | `/settings/tracking` lists services and supports logout; binding/score controls absent |
| Settings | Server settings, authentication, database, OPDS/KOReader | `Partial` | Yes | Update/download/system plus OPDS and KOReader sync editing; auth/database remain read-only |
| Settings | WebUI channel/flavor/update settings | `Partial` | Yes | Channel, flavor, and interface displayed; update controls absent |
| Settings | Device management | `Partial` | Metadata | `/settings/device` shows platform, display, PWA, Wake Lock, and share capabilities; no remote device management |
| Global search | Search all sources, global source filter, library counts | `Partial` | Yes | `/search` queries server-known manga and matching sources; live fetch across every source and source filter absent |
| Global search | Search history/suggestions | `Partial` | Client metadata | Recent global searches stored per device; remote suggestions absent |
| Hotkeys | Configurable app/reader hotkeys | `Partial` | Client concern | Arrow page paging, Shift+Arrow chapter navigation, Escape back; not configurable |
| Themes | Dynamic manga artwork backdrop, custom themes | `Partial` | Client concern | Ambient art exists; no theme system |
| About | About route with versions/update actions | `Implemented` | Yes | `/about` shows versions, checks server/WebUI updates, starts WebUI update, and displays live status |
| Server config | Persist server URL/session | `Implemented` | Client storage | Server URL, opt-in auto-connect, and opt-in refresh-token session restore |
| Localization | Translated UI | `Partial` | Client concern | Navigation and Appearance strings translated; remaining screens still English |
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

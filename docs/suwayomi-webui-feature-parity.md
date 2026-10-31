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
| Shell | Desktop sidebar + mobile bottom navigation | `Implemented` | Client concern | Desktop sidebar plus five primary mobile tabs and a More sheet |
| Shell | Mobile "More" overflow destination | `Implemented` | Client concern | More sheet contains Categories, History, Downloads, and Settings with badges/active state |
| Navigation | Download queue badge and extension-update badge | `Implemented` | Yes | Download subscription, periodic extension-update refresh, and route-change refresh |
| App updates | Inform about WebUI/server updates | `Implemented` | WebUI update query + subscriptions | PWA update prompt, WebUI update check, and server update check on `/about` |
| Localization | Language selection | `Implemented` | Client concern | English/Indonesian locale selection stored per device; no upstream catalog dependency |
| PWA | Installable shell, safe areas, route fallback | `Implemented` | Client concern | Shell-only cache; no private resources |
| PWA | Offline reading/downloads | `Missing` | Server downloads | No offline reader/cache |
| Sharing | Native share of manga/reader | `Implemented` | Client concern | Reader chapter share and manga share with clipboard fallback |

### Library

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Library | Poster grid with authenticated thumbnails | `Implemented` | Yes | Real ResourceService thumbnails |
| Library | List / comfortable grid / compact grid | `Implemented` | Client concern | Grid/list toggle plus compact/comfortable density |
| Library | Categories and category counts | `Implemented` | Yes | Category tabs in Library and the Categories page both show real manga counts |
| Library | Search | `Implemented` | Yes | Server-side search |
| Library | Local fuzzy title filter | `Implemented` | Client-side | Token/subsequence fuzzy filter over loaded titles |
| Library | Server-wide fuzzy search | `Blocked by server` | Server metadata | Stable title filter exposes includesInsensitive only; no fuzzy ranking endpoint |
| Library | Local search history and suggestions | `Implemented` | Client-side | Recent-search suggestions and history stored per device |
| Library | Remote search autocomplete | `Blocked by server` | Server metadata | No autocomplete/suggestion endpoint in the stable schema |
| Library | Reset all filters | `Implemented` | Client concern | Resets search, status, category, random mode, and default sort |
| Library | Status, source, tracker, unread, started, downloaded, bookmarked filters | `Implemented` | Yes | Status, source, tracked, unread, started, downloaded, and bookmarked filters |
| Library | Filter AND/OR mode and saved defaults | `Implemented` | Yes | Status OR set, AND with source/category, saved defaults include the OR set |
| Library | Sorting | `Implemented` | Yes | Title/date/ID/direction; no random sort |
| Library | Local loaded-page shuffle | `Implemented` | Client concern | Shuffles loaded cards for the Random sort |
| Library | Server-wide random order | `Blocked by server` | Server metadata | MangaOrderBy has no random value |
| Library | Continue-reading button / tooltip | `Implemented` | Reading progress | Progress chip, tooltip, and direct resume button with saved page |
| Library | Manga selection, shift-click, long-press | `Implemented` | Client concern | Selection mode, shift range, and 500 ms long-press on posters |
| Library | Bulk download, delete downloads, mark read/unread | `Implemented` | Yes | All four bulk actions implemented with confirmation for delete |
| Library | Bulk category assignment | `Implemented` | Yes | Add to and remove from a selected category for selected manga |
| Library | Bulk migrate | `Blocked by server` | No | No migration API in stable schema; single/bulk migration impossible without inventing mutations |
| Library | Remove from library (single/bulk) | `Implemented` | Yes | Single-manga toggle on Detail and bulk removal on Library with confirmation |
| Library | Library duplicate detection/overview | `Implemented` | Client-side | On-demand full-library pagination scan groups normalized duplicate titles |
| Library | Sync button | `Implemented` | Yes | Starts `updateLibrary` and shows live job progress via subscription |
| Library | Show unread/download badges | `Implemented` | Yes | Unread and downloaded chapter counts from `MangaType` |
| Library | Tab item counts | `Implemented` | Yes | All total plus per-category manga counts |

### Manga Detail

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Manga | Cover, title, author/artist, status, source, genres, description | `Implemented` | Yes | Ambient hero from real cover |
| Manga | Library add/remove and category picker | `Implemented` | Yes | In-library toggle, category picker, and Library bulk add/remove/category actions |
| Manga | Continue reading from last page | `Implemented` | Reading progress | Detail links the in-progress chapter with `?page=`; reader resumes that page |
| Manga | Read from start/latest chapter | `Implemented` | Yes | Primary CTA uses actual first loaded chapter |
| Manga | Manga notes | `Implemented` | Manga meta mutations | Notes stored in manga meta with save/clear |
| Manga | Share | `Implemented` | Client concern | Web Share API with clipboard fallback |
| Manga | Refresh metadata/chapters from source | `Implemented` | Yes | Refresh button calls fetchMangaAndChapters and reloads detail |
| Manga | Migration entry point | `Blocked by server` | No | Stable v2.4.2366 schema exposes no migration mutation/query |
| Manga | Tracker binding/score/status | `Implemented` | Yes | Search/bind/unbind with private option, status and score editing |
| Manga | Chapter filters and scanlator filter | `Implemented` | Yes | Search, read/download/bookmark filter, scanlator, newest/oldest; saved preferences absent |
| Manga | Missing-chapter indicators | `Implemented` | Client-side/server data | Full chapter scan loads every page before computing gap separators |
| Manga | Overview/Chapters tab organization | `Implemented` | Client concern | Anchor tabs for Overview and Chapters |
| Manga | Related/recommendations | `Blocked by server` | Server metadata | Stable schema exposes no related or recommendation query |
| Manga | Per-manga reader settings | `Implemented` | Client concern | Per-manga mode, width, background, filter, scale, and direction overrides |
| Manga | Mark all previous chapters read | `Implemented` | Yes | Per-chapter Prev action marks older unread chapters read |

### Chapters

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Chapters | Chapter list with state, date, page count | `Implemented` | Yes | |
| Chapters | Chapter pagination / load more | `Implemented` | Yes | |
| Chapters | Select single/multiple/range chapters | `Implemented` | Client concern | Selection mode, shift-click range, and 500 ms long-press selection |
| Chapters | Bookmark/unbookmark | `Implemented` | Yes | Per-chapter and bulk bookmark toggles plus bookmarked filter |
| Chapters | Mark read/unread and mark previous read | `Implemented` | Yes | Single toggle, bulk read/unread, and per-chapter mark-previous |
| Chapters | Download/delete download | `Implemented` | Yes | Per-chapter and bulk enqueue/delete, plus Downloads queue and Reader actions |
| Chapters | Bulk chapter actions | `Implemented` | Yes | Bulk read/unread, bookmark, download, and delete with confirmation |
| Chapters | Scanlator filter and duplicate handling | `Implemented` | Yes | Scanlator filter plus hide-duplicate chapter numbers toggle |
| Chapters | Missing-chapter separators | `Implemented` | Client-side | Full chapter scan removes pagination boundaries before gap detection |
| Chapters | Saved sort/filter preferences | `Implemented` | Client metadata | Per-manga order, filter, and scanlator restored from device storage |

### Reader

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Reader | Vertical continuous reader | `Implemented` | Yes | Current reader |
| Reader | Desktop/mobile chrome | `Implemented` | Client concern | Distraction-free shell, previous/next, page count, and desktop chapter rail |
| Reader | Single page mode | `Implemented` | Client-side | Single-page layout with tap, swipe, and keyboard page controls |
| Reader | Double page mode | `Implemented` | Client-side | Two-page layout with direction-aware pairing and page controls |
| Reader | Horizontal continuous mode | `Implemented` | Client-side | Horizontal scroll-snap canvas with page tracking |
| Reader | Webtoon mode + auto detection | `Implemented` | Client-side | Webtoon layout plus optional first-page height/width auto detection |
| Reader | Reading direction (LTR/RTL) | `Implemented` | Client-side | Direction setting applied to double-page order and horizontal flow |
| Reader | Page scale modes (width/height/screen/original) | `Implemented` | Client-side | Fit width, fit height, fit screen, and original size |
| Reader | Stretch/scale small pages and custom width | `Implemented` | Client-side | Custom reading width, gap, background, and stretch-small-pages toggle |
| Reader | Page gap, first-page offset, safe-area inset | `Implemented` | Client-side | Gap, first-page offset, safe-area padding, and per-mode layout defaults |
| Reader | Reader defaults per mode | `Implemented` | Client metadata | Save layout per mode and restore on mode switch |
| Reader | Per-device reader profiles | `Implemented` | Metadata/settings | Per-mode layouts stored per device |
| Reader | Progress write / read state | `Implemented` | UpdateChapter mutation | Writes `lastPageRead`; marks read on final page. Live round-trip verified on chapter 2820 (`lastPageRead` persisted) |
| Reader | Resume at last page | `Implemented` | Reading progress | Resumes explicit `?page=` and stored `lastPageRead` for the vertical reader |
| Reader | Previous/next chapter navigation | `Implemented` | Yes | Number-based neighbors |
| Reader | Infinite chapter scrolling and transition pages | `Implemented` | Client-side | Inline next-chapter append with transition headings and chained scroll loading when auto-advance is off |
| Reader | Skip duplicate chapters | `Implemented` | Client-side | Full chapter scan deduplicates numbers across pagination boundaries |
| Reader | Preload pages and next chapter | `Implemented` | Client-side | Current ±1 eager pages, next chapter manifest prefetch, and first three next-chapter images prefetched |
| Reader | Image filters (brightness/contrast/etc.) | `Implemented` | Client-side | Presets plus brightness, contrast, and saturation sliders |
| Reader | Failed-image retry | `Implemented` | Client-side | Per-page retry |
| Reader | Auto-scroll and custom scroll amount | `Implemented` | Client-side | Auto-scroll toggle with 1–10× speed, wheel/touch stop |
| Reader | Custom keybindings | `Implemented` | Client-side | Configurable previous/next page and back keys, with Shift chapter navigation |
| Reader | Tap zones and touch drag scrolling | `Implemented` | Client-side | Left/right tap zones plus horizontal swipe paging in paged modes |
| Reader | Keep screen on | `Platform limitation` | Wake Lock API availability | Wake Lock is used where supported; denial or missing API is non-fatal |
| Reader | Auto background color | `Implemented` | Client-side | Samples the current page and tints the Reader background when enabled |
| Reader | Fullscreen | `Platform limitation` | Browser Fullscreen API availability | Fullscreen API used where available; iOS Safari has no equivalent |
| Reader | Download next chapter / delete after reading | `Implemented` | Yes | Active chapter download/delete, download next chapter, and opt-in delete-after-reading |
| Reader | Bookmark/library actions from reader | `Implemented` | Yes | Bookmark toggle and add/remove library from Reader |
| Reader | Chapter list overlay/sidebar | `Implemented` | Yes | Right-side chapter overlay with active/read markers and chapter navigation |

### Updates / History / Downloads

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Updates | Latest chapters from library | `Implemented` | Yes | Day-grouped ChapterFeed plus a Continue reading section driven by firstUnreadChapter |
| Updates | Unread/read filters, scanlator, state | `Implemented` | Yes | All/Unread/Read filters plus scanlator filter derived from the feed |
| Updates | Chapter/manga actions | `Implemented` | Yes | Mark read/unread, download, open chapter, and open Manga Detail from the feed |
| Updates | Sync button and refresh | `Implemented` | Yes | Starts library update, shows live progress, and refreshes feed on completion |
| History | Reading history entries | `Implemented` | Yes | Real lastReadAt feed; reader progress writes populate it |
| History | Last chapter per manga / per day | `Implemented` | Client-side | Dedupes to newest chapter per manga and groups Today/Yesterday |
| History | Resume history entry | `Implemented` | Yes | Resume link includes the saved page |
| History | Clear/remove history | `Blocked by server` | Server metadata | Stable schema exposes no clear/remove-history mutation |
| History | Client hide-read filter | `Implemented` | Metadata | Client-side hide-read filter stored per device |
| History | Server-side hidden history | `Blocked by server` | Server metadata | No setting or mutation to prevent server history recording |
| Downloads | Download queue, active/queued/failed states | `Implemented` | DownloadStatus + subscriptions | Queue, state, progress, tries, pause/resume/cancel, grouping, and live subscription refresh |
| Downloads | Pause/resume, retry, cancel, delete | `Implemented` | Yes | Pause/resume, cancel, delete, and retry-all-failed via bulk enqueue |
| Downloads | Grouping, bulk series actions, progress | `Implemented` | Yes | Manga grouping, series cancel, and progress |
| Downloads | Download speed | `Blocked by server` | Server metadata | DownloadStatus/DownloadType expose no speed field |
| Downloads | List downloaded chapters | `Implemented` | Yes | Real `isDownloaded` feed with delete action |
| Downloads | Download/serve conversion lists | `Implemented` | Yes | Download and serve conversion list editor |
| Downloads | Image processing settings | `Blocked by server` | Server metadata | Stable schema exposes no image-processing settings |

### Browse / Sources / Extensions

| Area | Official WebUI feature | New frontend status | Server/API support | Notes |
|---|---|---|---|---|
| Browse | Source catalog and language filter | `Implemented` | Yes | Real source list with language filter and source catalog navigation |
| Browse | Source manga browsing, search, filters, pagination | `Implemented` | Yes | Popular/Latest, search, pagination, and dynamic text/select/checkbox/tri-state/sort filters including one group level |
| Browse | Pinned/last-used sources, preferred languages, NSFW visibility | `Implemented` | Metadata | Pin/last-used, multi-language preference list, saved language filter, and NSFW toggle |
| Browse | Hide in-library manga, quick add/remove, duplicate check | `Implemented` | Yes | Quick add/remove plus hide-in-library and duplicate-only filters |
| Browse | Saved source searches and global search | `Implemented` | Client metadata + server | Per-source history, `/search`, and on-demand live search across installed sources |
| Browse | WebView/open-in-WebView | `Platform limitation` | Platform/server | Browser frontend cannot host the server-side WebView integration |
| Extensions | Installed/available extensions, stores, language filters | `Implemented` | Yes | Catalog, installed/available sections, language filter, name/package search, updates-only filter, store add/remove |
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
| Tracking | Tracker auth/config and services | `Implemented` | Yes | OAuth login links, username/password login mutation, token state, and logout |
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
| Sync | Sync settings (Yomi, intervals, data selection) | `Implemented` | Yes | Data toggles, Yomi enablement/host, interval, and API key editing |
| Settings | Real server/connection information | `Implemented` | Yes | Settings shows actual server, version, and capability data |
| Settings | Appearance/themes/custom themes/pure black | `Implemented` | Client concern | Dark and pure-black themes plus persisted custom accent color |
| Settings | Reader defaults and device profiles | `Implemented` | Client metadata | `/settings/reader` stores width, gap, background, and per-mode profiles per device |
| Settings | Library preferences (fuzzy, badges, layout, continue reading) | `Implemented` | Metadata | Density, grid/list, badges, continue-reading visibility, and fuzzy filter |
| Settings | Download preferences and cache | `Implemented` | Yes | Download toggles/limits, CBZ, conversion lists, and cache clearing |
| Settings | Image processing settings | `Blocked by server` | Server metadata | Stable schema exposes no image-processing settings |
| Settings | Browse/source/extension-store settings | `Implemented` | Yes | Extension stores add/remove and per-source preference editing |
| Settings | Client hide-read preference | `Implemented` | Metadata | Hide-read preference stored per device |
| Settings | Server history retention | `Blocked by server` | Server metadata | No retention/history-recording setting in the stable schema |
| Settings | Tracking settings | `Implemented` | Yes | Service auth/login/logout, auto-sync, and per-manga binding/score controls on Manga Detail |
| Settings | Server settings, authentication, database, OPDS/KOReader | `Implemented` | Yes | Update/download/system, auth mode/credentials, database, OPDS, and KOReader sync editing |
| Settings | WebUI channel/flavor/update settings | `Implemented` | Yes | Channel/flavor/interface shown plus WebUI update action and live status on About |
| Settings | Local device information | `Implemented` | Metadata | `/settings/device` shows platform, display, PWA, Wake Lock, and share capabilities |
| Settings | Remote device management | `Blocked by server` | Server metadata | Stable schema exposes no device-management query or mutation |
| Global search | Search all sources, global source filter, library counts | `Implemented` | Yes | Server-known results plus on-demand live source search, source filter, and in-library counts |
| Global search | Local search history | `Implemented` | Client metadata | Recent global searches stored per device |
| Global search | Remote search suggestions | `Blocked by server` | Server metadata | No suggestion/autocomplete endpoint in the stable schema |
| Hotkeys | Configurable app/reader hotkeys | `Implemented` | Client concern | Reader page/back keys configurable; Shift preserves chapter navigation |
| Themes | Dynamic manga artwork backdrop, custom themes | `Implemented` | Client concern | Ambient artwork plus dark/pure-black themes and persisted custom accent |
| About | About route with versions/update actions | `Implemented` | Yes | `/about` shows versions, checks server/WebUI updates, starts WebUI update, and displays live status |
| Server config | Persist server URL/session | `Implemented` | Client storage | Server URL, opt-in auto-connect, and opt-in refresh-token session restore |
| Localization | Translated UI | `Partial` | Client concern | Most screens translated; Reader Settings, Server Settings toggles, Connection, and shared states still mixed |
| Accessibility | Keyboard/focus/labels on implemented screens | `Implemented` | Client concern | Skip-to-content, main landmark, focus-visible styles, locale lang, labelled controls, and Escape-closable More menu |

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

# Navigation Audit

Audit date: 2026-11-01 (Asia/Bangkok)

Scope: every route, link, navigation action, back path, deep link, and
responsive navigation composition in the Kakkee/Suwayomi frontend.

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
| `/manga/:mangaId` | Manga detail | Library/feed/search/source card | Same | Same | Yes | Context-aware Back; fallback Library | OK |
| `/manga/:mangaId/chapter/:chapterId` | Reader | Chapter row, Continue, history, updates | Same | Same | Yes | Manga detail; browser back | OK |
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

## State preservation

- Library: search and fuzzy mode in URL; category, filters, and sort remain
  available through saved library preferences; scroll restored per path.
- Browse: source ID in path, search query in URL; source filter state remains
  session-local.
- Global search: query in URL and local search history restored.
- Manga detail: Overview/Chapters tab in URL; Back keeps the originating URL.
- Reader: current chapter/page in URL; progress remains server-written.
- Updates/History/Downloads: scroll restored on Back; item routes remain stable.
- Settings: hash anchors address sections; subpage back returns to Settings.

## Deep linking tested

- `/settings` while disconnected, then connect → returns to `/settings`.
- `/library?q=Artwork`, `/browse/:id?q=Artwork`, `/search?q=one piece`.
- `/manga/427`, `/manga/427?section=chapters`.
- `/manga/427/chapter/42`, `/manga/427/chapter/43`.
- `/about`, `/offline`, `/offline/read/:chapterId`.
- Unknown `/unknown/path` while connected → `/library`.
- Invalid manga/chapter IDs → Library, never a blank page.

## Reader

Chapter rows, Continue reading, history resume, and Updates open
`/manga/:mangaId/chapter/:chapterId`. Reader previous/next updates the URL to the
new chapter, reloads pages, resets page index, scroll, appended chapters, and
preload state. Reader Back goes to its manga. Browser Back returns to the prior
chapter or detail. Direct reader URLs reconstruct the chapter; malformed IDs
fall back to Library. Reader deliberately hides the app shell, so no unrelated
primary destination is highlighted.

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

- `AppLayout.test.tsx`: source active state, extension active state, About
  Settings state, subpath active state, mobile More Extensions, Escape focus.
- `App.test.tsx`: return to intended protected route after connecting.
- `MangaDetailPage.test.tsx`: context-aware Back from Updates.
- `LibraryPage.test.tsx`: URL query restoration and fuzzy URL state.
- `AboutPage.test.tsx`: direct `/about` render and Settings link.

Full suite result is recorded in the final validation section below.

## Browser audit

Real browser, connected to `https://suwayomi.alphasquare.my.id`:

- Desktop 1280×900.
- Tablet portrait 820×1180 (76 px rail, no bottom bar, no overflow).
- Tablet/desktop landscape 1180×820 (full sidebar, three-row Library header,
  no overlap).
- Phone 390×844 (bottom bar, More menu, all controls within viewport).

Flows: connection → Library; Library card → Detail; Back/Forward; Detail →
Reader; Reader Back; Reader Next and Previous; Settings → Reader settings →
Settings; Browse source → Manga → Back to source; Extensions via mobile More;
Updates Manga → Back to Updates; History/Downloads/offline entry; About; unknown
route; direct deep link after connect. No console exceptions were observed.

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
Test Files  77 passed | 3 skipped (80)
Tests       404 passed | 7 skipped (411)
```

## Remaining limitations

- `/offline` and `/offline/read/:chapterId` intentionally render without the
  authenticated app shell because they must work offline. They are reached from
  Downloads and from the connection screen.
- 19 server-blocked capabilities remain unavailable by API; they are not
  navigation defects.
- WebView/open-in-WebView, native fullscreen, and Wake Lock vary by browser and
  remain platform limitations.
- Source filter values (not just search text) and Library filter/sort state are
  session-local unless saved as preferences; this avoids excessive global
  persistence.
- A final re-smoke after the last query-state build was attempted, but both
  `kakkee.alphasquare.my.id` and `suwayomi.alphasquare.my.id` timed out at that
  moment. The browser flows above were completed against the preceding build;
  the final delta was URL query synchronization and is covered by automated
  tests.

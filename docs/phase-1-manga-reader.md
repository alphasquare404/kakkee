# Phase 1 — Manga Detail and Reader

Tanggal: **30 Oktober 2026**
Status: **implemented**; authenticated thumbnails, manga detail, chapter list, and vertical reader are available.

## User journey

```text
Library
  → click manga card
  → Manga Detail (metadata, cover, chapters)
  → click chapter
  → Reader (vertical pages)
  → Previous/Next chapter
  → back to Manga / Library
```

Routes:

- `/library`
- `/manga/:mangaId`
- `/manga/:mangaId/chapter/:chapterId`

All routes redirect to `/` when the connection is not connected.

## GraphQL operations

Verified against `stable-v2.4.2366.graphql`:

### `MangaDetail`

Uses:

- `Query.manga(id)`
- `MangaType`: `id`, `title`, `author`, `artist`, `description`, `status`, `thumbnailUrl`, `thumbnailUrlLastFetched`, `genre`, `inLibrary`, `source { id name }`
- `Query.chapters(condition: { mangaId }, first, after, order)`
- `ChapterType`: `id`, `name`, `chapterNumber`, `pageCount`, `isRead`, `lastPageRead`, `scanlator`, `uploadDate`, `sourceOrder`
- `ChapterNodeList.pageInfo.endCursor/hasNextPage`, `totalCount`

Chapter order uses `SOURCE_ORDER`; default `DESC` (newest first), switchable to `ASC`.

### `ReaderChapter` / `ReaderNeighbors`

- `Query.chapter(id)` for chapter metadata and parent manga.
- Two aliased `Query.chapters` calls for previous/next by `chapterNumber`:
  - `previous`: `chapterNumber.lessThan`, `CHAPTER_NUMBER DESC`, `first: 1`
  - `next`: `chapterNumber.greaterThan`, `CHAPTER_NUMBER ASC`, `first: 1`

### `FetchChapterPages`

Uses the stable mutation:

```graphql
fetchChapterPages(input: { chapterId: Int! }) {
  chapter { id pageCount }
  pages
}
```

`pages` are relative REST paths such as:

```text
/api/v1/manga/1114/chapter/1185/page/0
```

### `UpdateChapterProgress`

```graphql
updateChapter(input: { id: Int!, patch: { lastPageRead, isRead } }) {
  chapter { id isRead lastPageRead }
}
```

The reader debounces `lastPageRead` updates (0-based page index) and sends
`isRead: true` when the final page becomes visible. Detail refetches chapter state
on navigation, so read/in-progress state reflects the server.

They are loaded through `ResourceService`; the reader never constructs resource URLs itself.

## Repository/controller boundaries

- `src/core/manga/mangaRepository.ts`
  - current Apollo client per request
  - `network-only`
  - 50 chapters per page default
  - generated `MangaDetailDocument`
- `src/core/manga/mangaDetailController.ts`
  - first-page load
  - chapter load-more with cursor
  - sort order reset/generation guard
  - preserves existing chapters on load-more error
- `src/core/reader/readerRepository.ts`
  - chapter metadata
  - previous/next neighbors
  - page path mutation
- `src/core/reader/readerController.ts`
  - chapter + pages loading
  - stale chapter generation guard
  - retry pages without losing chapter metadata
  - separate `error` (chapter) and `pagesError` (pages)

No UI imports Apollo, AuthService, token, GraphQL string, or server URL builder.

## Resource handling

`src/shared/useImageResource.ts` is the React adapter over the existing `ResourceService`.

Behavior:

- `loadImageResource(path, { signal })` only.
- ResourceService supplies authentication and resolves the validated server URL.
- Blob → object URL stays inside the hook/consumer.
- Object URL is revoked on:
  - unmount;
  - path replacement;
  - retry;
  - controller/server resource replacement.
- AbortController cancels in-flight loads on cleanup.
- Stale result after unmount is disposed immediately.
- No token in DOM, URL, or `<img src>`; only the Blob object URL is used.
- No service worker/private resource cache.

Used by:

- Library `MangaCard` thumbnails.
- Manga detail cover.
- Reader page images.

## Library cards

- Real authenticated thumbnail via ResourceService.
- Placeholder initial remains for missing/failed thumbnail.
- The whole card is a `Link` to `/manga/:id`.
- Hover/focus states remain subtle; no separate click handler.
- Missing server thumbnail is displayed as placeholder, not a broken image.

## Manga Detail

- Real cover, title, status, author, artist, source, genres, description.
- Chapter count and list.
- Newest/oldest order.
- Read/unread and last-page state from `ChapterType`.
- Chapter link to reader.
- Load more chapters (50/page).
- Initial loading, initial error + retry, empty chapter list, load-more error.
- Back to Library via breadcrumb and explicit button.

## Reader

- Vertical continuous reading, appropriate for both desktop and touch.
- Page paths fetched via `fetchChapterPages`; pages rendered in returned order.
- Lazy page resource loading:
  - first 2 pages load immediately;
  - remaining pages observe intersection with `rootMargin: 1200px`;
  - images use `loading="lazy"` and are only fetched when near viewport.
- Header contains chapter/manga title, Previous/Next chapter, and back to Manga.
- Footer repeats chapter navigation.
- Keyboard:
  - `ArrowLeft` → previous chapter
  - `ArrowRight` → next chapter
  - `Escape` → back to Manga
- Chapter navigation uses stable previous/next queries; no next/prev buttons when absent.
- Loading, no-pages, chapter error + retry, page-level error + retry.
- Object URLs are disposed when pages/chapter unmount.

## Runtime proof

Real server `https://suwayomi.alphasquare.my.id`, auth `NONE`, v2.4.2366:

- Library: 40 cards, 39 thumbnails rendered, one server-missing thumbnail fell back to placeholder.
- One Piece detail: cover loaded, 50 chapters initially, 1,186 total.
- Chapter 1185: 17 pages, page images loaded through ResourceService.
- Reader progress round-trip: after scrolling, `UpdateChapterProgress` persisted `lastPageRead: 7` for chapter 2820; `isRead` remains false until the final page.
- Next: `/manga/1114/chapter/2821`; Previous: `/manga/1114/chapter/2819`.
- Browser back to detail worked; real breadcrumb click returned to `/library`.
- 390×844 detail and reader: `scrollWidth = 390`, no horizontal overflow.
- Reader header ~81 px; touch navigation available.
- Console errors: 0.
- Failed network requests: 0 (one missing thumbnail was an HTTP response, handled as placeholder).

## Validation

```text
npm run codegen:check  PASS
npm run lint           PASS
npm run typecheck      PASS
npm run test           PASS — 302 passed, 7 skipped (309 total)
npm run build          PASS
```

Build code-splits Manga Detail, Reader, and secondary pages. Main JS 540.98 kB (gzip 157.87 kB), CSS 57.05 kB (gzip 10.96 kB), detail 17.34 kB, reader 10.59 kB, downloads 7.17 kB, server settings 7.11 kB, categories 6.65 kB, reader settings 5.36 kB, appearance 1.81 kB, library settings 2.08 kB. Vite emits the standard >500 kB main-chunk warning; no functional blocker.

PWA production preview at root:

- manifest errors: none
- installability errors: none
- CacheStorage only Workbox shell (27 entries): index, JS/CSS, workbox-window, icons, manifest, dynamic route chunks
- private entries (`/api`, GraphQL, thumbnail/page): none
- console errors: none

## Limitations

- Reader writes `lastPageRead` and marks the chapter read on the last page, but it
  still opens at the top of a chapter instead of resuming the exact page.
- Manga Detail selects an in-progress chapter for Continue reading; Library has no
  continue-reading shortcut yet.
- No downloads/offline reading.
- No paged reader mode; vertical only.
- No source filter metadata UI.
- No settings screen; connection remains the server-management entry point.
- Session/server config is not persisted across reloads; reconnect is required after reload/PWA relaunch.
- iOS/Android physical PWA install and Safari/Firefox validation remain unperformed.

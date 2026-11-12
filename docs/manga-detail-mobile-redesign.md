# Manga Detail mobile redesign

**Date:** 2026-11-13  
**Reference:** `Refrence/Detail reference.png` and the supplied Crimson Blade mobile capture.  
**Scope:** Manga Detail composition only.

## Structure

Mobile uses the requested top-to-bottom composition:

1. Full-bleed cover hero with safe-area-aware Back, Add to Library, and More controls. Controls are icon-only without circular backgrounds or backdrop blur.
2. Rounded dark information panel overlapping the hero. Portrait covers use a taller hero (62vh at phone widths) than wide covers (46vh).
3. Compact metadata row, title, author/artist, and three-line synopsis preview.
4. A single full-width Continue/Read action on phones. Add to Library and More live in the top bar; the duplicate bottom actions were removed.
5. Rounded Chapters / Overview segmented control without the legacy underline.
6. Tab content in the normal document flow.

The action is not sticky or fixed. On tablet/desktop, Back sits beside the breadcrumb and the
Add to Library/More controls sit in the same top row rather than inside the cover.

## Real data only

- Title, author, artist, status, source, chapter count, unread count, genres, and description come
  from the existing Manga Detail query.
- No ratings, view counts, likes, or invented authors were added.
- The top bookmark icon reflects library membership because the stable Manga schema has no separate
  bookmark field. Its accessible name is Add to Library / Remove from Library.
- Chapter thumbnails are not rendered because the backend exposes no chapter image asset. The
  existing play/state controls remain.

## Preserved behavior

- Reading route/state, page progress, Back provenance, and browser history.
- Library toggle, Refresh metadata, Share, reader mode, tracking, notes, category picker.
- Chapter sorting, search, state/scanlator filters, duplicate hiding, long-press/card-menu selection,
  read/bookmark toggles, server/device downloads, queued-download cancel, and Load more.
- URL `section=overview` behavior and tab state.

## Responsive behavior

- **Mobile (≤760px):** edge-to-edge hero, rounded overlapping panel, one full-width primary action,
  segmented tabs, rounded chapter cards. Portrait covers get a taller hero; wide covers keep the
  shorter one.
- **Tablet (761–1100px):** cover and information panel become a two-column composition; Back and the
  top controls sit in the breadcrumb row.
- **Desktop (>1100px):** retains the wider cover + information composition, breadcrumb, and dense
  chapter list.

## Visual verification

- `visual-audit/manga-final7-1920x1080.png`
- `visual-audit/manga-final7-820x1180.png`
- `visual-audit/manga-final7-390x844.png`
- `visual-audit/manga-final7-chapters-390x844.png`
- `visual-audit/manga-final8-search-390x844.png`
- `visual-audit/manga-final7-bulk-390x844.png`
- `visual-audit/manga-final7-bookmark-390x844.png`
- `visual-audit/manga-final5-toolbar-menu-390x844.png`
- `visual-audit/manga-final5-card-menu-390x844.png`
- `visual-audit/manga-final6-showmore-390x844.png`

Checked for clipping, safe-area placement, tab/action overflow, chapter card density, and horizontal
overflow. No horizontal overflow was found at the five target sizes.

## Validation

```text
codegen:check   PASS
lint            PASS
typecheck       PASS
test            462 passed, 7 skipped
build           PASS
```

## Chapter controls

- Search, Sort, More/filter, and Download are icon buttons in the right side of the Chapters title
  box, using the Library icon family.
- Search expands a rounded-rectangle field below the Chapters header (not a pill).
- Sort exposes Newest first / Oldest first.
- More contains all/unread/read/downloaded/bookmarked filters, duplicate hiding, scan-all, and
  scanlator filtering.
- Download always exposes Download server / Download device. With no selected chapters it also
  offers Select chapters.
- Select was removed from the toolbar. Selection starts from a long press or the card More menu.
- Card actions are download (or × to cancel a queued download), borderless Unread/Read, and More.
- Delete downloaded chapter is not shown on chapter cards.
- Card menus contain Select, conditional Bookmark/Remove bookmark, and Mark earlier as read.
- Selection uses a horizontal action rail with a fixed × at the right. It shows only contextual
  actions: Mark read or Mark unread, Bookmark or Remove bookmark. Mixed selections show both of
  each pair. Download, Delete download, and Clear were removed from the rail.
- The top bookmark control opens category choices. The current/default category is checked and the
  selection can be changed; choosing a category adds the manga to the library.
- All ActionMenu popovers now use viewport-fixed positioning, flip above the trigger when needed,
  clamp horizontally, and scroll internally instead of leaving the screen.
- Show more scrolls to the tabs with `scroll-margin-top` accounting for the safe area.

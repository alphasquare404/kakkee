# Manga Detail mobile redesign

**Date:** 2026-11-13  
**Reference:** `Refrence/Detail reference.png` and the supplied Crimson Blade mobile capture.  
**Scope:** Manga Detail composition only.

## Structure

Mobile uses the requested top-to-bottom composition:

1. Full-bleed cover hero with safe-area-aware translucent Back, Bookmark, and More controls.
2. Rounded dark information panel overlapping the hero.
3. Compact metadata row, title, author/artist, and three-line synopsis preview.
4. Inline Read/Continue, Add to Library, and More actions.
5. Rounded Chapters / Overview segmented control.
6. Tab content in the normal document flow.

The actions are not sticky or fixed. The More control in the action row is separate from the
upper-right overflow menu only by position; both preserve Refresh/Share.

## Real data only

- Title, author, artist, status, source, chapter count, unread count, genres, and description come
  from the existing Manga Detail query.
- No ratings, view counts, likes, or invented authors were added.
- Bookmark reflects library membership because the stable Manga schema has no separate bookmark
  field. The Add to Library action uses the same state.
- Chapter thumbnails are not rendered because the backend exposes no chapter image asset. The
  existing play/state controls remain.

## Preserved behavior

- Reading route/state, page progress, Back provenance, and browser history.
- Library toggle, Refresh metadata, Share, reader mode, tracking, notes, category picker.
- Chapter sorting, search, state/scanlator filters, duplicate hiding, bulk selection, read/bookmark
  toggles, server/device downloads, delete confirmation, and Load more.
- URL `section=overview` behavior and tab state.

## Responsive behavior

- **Mobile (≤760px):** edge-to-edge hero, rounded overlapping panel, three inline actions, segmented
  tabs, rounded chapter cards.
- **Tablet (761–1100px):** cover and information panel become a two-column composition; actions stay
  horizontal.
- **Desktop (>1100px):** retains the wider cover + information composition, breadcrumb, and dense
  chapter list.

## Visual verification

- `visual-audit/manga-final-1920x1080.png`
- `visual-audit/manga-final-1366x768.png`
- `visual-audit/manga-final-1180x820.png`
- `visual-audit/manga-final-820x1180.png`
- `visual-audit/manga-final-390x844.png`
- `visual-audit/manga-final-chapters-390x844.png`
- `visual-audit/manga-final-overview-390x844.png`
- `visual-audit/manga-final-overview-1920x1080.png`

Checked for clipping, safe-area placement, tab/action overflow, chapter card density, and horizontal
overflow. No horizontal overflow was found at the five target sizes.

## Validation

```text
codegen:check   PASS
lint            PASS
typecheck       PASS
test            461 passed, 7 skipped
build           PASS
```

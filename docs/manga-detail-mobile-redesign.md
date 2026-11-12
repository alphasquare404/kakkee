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
- `visual-audit/manga-final7-1366x768.png`
- `visual-audit/manga-final7-1180x820.png`
- `visual-audit/manga-final7-820x1180.png`
- `visual-audit/manga-final7-390x844.png`
- `visual-audit/manga-final8-search-390x844.png`
- `visual-audit/manga-final10-rail-390x844.png`
- `visual-audit/manga-final10-download-menu-390x844.png`
- `visual-audit/manga-final11-card-menu-390x844.png`
- `visual-audit/manga-final13-badges-390x844.png`
- `visual-audit/manga-bookmark-multi-390x844.png`
- `visual-audit/manga-reader-off-390x844.png`
- `visual-audit/manga-reader-switch-390x844.png`
- `visual-audit/manga-reader-on-390x844.png`
- `visual-audit/manga-tracking-compact-390x844.png`
- `visual-audit/manga-tracking-labels-390x844.png`
- `visual-audit/manga-filter-menu-final-390x844.png`
- `visual-audit/manga-final11-card-download-390x844.png`
- `visual-audit/manga-final7-bookmark-390x844.png`
- `visual-audit/manga-final5-toolbar-menu-390x844.png`
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
- Download exposes Server / This device checkboxes (both can be active) and the scopes Download all,
  Download unread, and Next chapter. It no longer offers Select chapters.
- Card More has a Download row with a chevron. Pressing it replaces the row with Download server /
  Download device.
- Select was removed from the toolbar. Selection starts from a long press or the card More menu.
- Card actions are an Unread/Read icon and More only.
- Server/device download state is shown by compact success-colored icons immediately before the
  read icon: a server drive icon for server downloads, a phone icon for device downloads, and both
  when present. Each group has an accessible label.
- Delete downloaded chapter is not shown on chapter cards.
- Card menus contain Select, Download (with a submenu arrow and server/device choices), conditional
  Bookmark/Remove bookmark, and Mark earlier as read.
- Selection uses an unboxed, horizontally scrollable icon rail with a fixed × at the right. It
  shows contextual read/bookmark icons plus Download and Delete downloads. Mixed selections show
  both of each contextual pair. There are no text buttons or bordered icon boxes in the rail.
- Server download status refreshes after DownloadStatusChanged events so the server badge appears
  once the queue completes.
- The top bookmark control opens multi-select category choices. Current/default categories are
  checked, several can be selected, and Save updates the library categories. Saving with no
  categories selected removes the manga from the library.
- The Categories picker was removed from Overview; category management lives only in the top
  bookmark menu.
- All ActionMenu popovers now use viewport-fixed positioning, flip above the trigger when needed,
  clamp horizontally, and scroll internally instead of leaving the screen.
- Show more scrolls to the tabs with `scroll-margin-top` accounting for the safe area.
- The filter menu has a divider before Hide duplicates and no longer contains Scan all chapters.
- Chapters load automatically from a scroll sentinel; the manual Load more button is gone.

## Download indicators

| State | Indicator |
|---|---|
| Downloaded on server | Server drive with download arrow |
| Saved on device | Phone with download arrow |
| Both | Both icons |
| Neither | No indicator |

Indicators sit before the read icon in the chapter action cluster and do not add per-chapter API
requests. Device state comes from OPFS records; server state comes from `isDownloaded` and is
refreshed by the existing download-status subscription.

## Overview compact controls

- Reader section shows only **Use Custom Reader** and a switch. Settings stay hidden while off.
  Enabling it snapshots the current global reader settings, then shows per-manga mode, width,
  filter, scale, direction, and background controls.
- Tracking uses a compact row with visible compact labels for Status, Rating (with the tracker's
  actual scale, e.g. 0–10), Started, and Finished, plus an icon-only sync action. The redundant
  tracking-settings CTA is hidden once a tracker is linked.

- Mobile information panel and bottom navigation are opaque; the cover does not bleed through.

- Section tabs are centered horizontally on tablet and desktop at a 27rem maximum width. On
  mobile they run full width from the same left/right margins as Continue reading.

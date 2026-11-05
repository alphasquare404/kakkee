# Library interaction revision

**Date:** 2026-11-05  
**Scope:** Library category tabs, per-category visibility, manga-card context menu, selection menu, card artwork, merged badges.  
**Status:** implemented and validated.

## Changes

### 1. Category tab counts

- Category labels and counts now use a centered inline-flex layout.
- Counts render in a compact pill, vertically centered with the label.
- The first tab no longer has asymmetric left padding; **All 35** is centered inside its own tab instead of sitting against the left edge.
- Hidden category preferences do not affect the All count.

### 2. Per-category visibility

- The Library filter drawer now starts with **Show categories**.
- **All** has its own checkbox. Hiding it removes the All tab and selects the first visible category; **Show all** restores it.
- Each category has a checkbox controlling whether its tab appears in the Library strip.
- Hidden category IDs and the All-tab preference persist in `suwayomi.library-preferences.v1`.
- **Show all** appears when at least one category or All is hidden.
- If the currently selected category is hidden, the Library returns to All.
- This controls category-strip visibility. It does not replace the existing single-category tab filter.

### 3. Manga-card context menu

The card Continue reading button was removed. The same capability remains in a context menu:

- **View Details**
- **Continue reading**
- **Select**
- **Remove from library**

Triggers:

- right-click on desktop;
- long press (500 ms) on touch/pen;
- keyboard `ContextMenu` key;
- keyboard `Shift+F10`.

The menu is portaled, viewport-clamped, focusable, supports Escape, outside click, arrow keys, Home/End and Tab cycling. The card exposes `aria-haspopup="menu"` and `aria-keyshortcuts="Shift+F10"`.

`Select` enters selection mode with that card selected. `Remove from library` is a single-item action and refreshes category counts; failures are shown as a Library warning. `Continue reading` is disabled when no progress exists.

The duplicate `Select` entry in Library More was removed. Selection now starts from the card context menu.

The **Continue Ch.** progress chip was removed from the card. Continue reading now exists only as a context-menu action and as the card title tooltip. The now-unused **Show reading progress on cards** setting and its preference were removed as well.

### 4. Selection menu

When cards are selected:

- removed **Mark read**
- removed **Mark unread**
- removed **Download**
- removed **Delete download**
- removed the `N selected` text
- removed the outer boxed container (transparent background, no border)
- Clear is now an **X** icon with `aria-label="Clear selection"` and `title`
- X clears the selection and exits selection mode
- category assignment, remove-from-category, remove-from-library confirmation and action status remain
- category select, Apply category, Remove from category and Remove from library sit in one horizontal scroll rail
- the rail does not wrap; on narrow screens it scrolls horizontally
- **X stays outside the rail**, fixed on the right, but remains on the same row as the rail
- the selection bar has a 12px gap below the category tabs
- the rail uses a small right-edge fade to show that more controls continue off-screen

### 5. Card artwork fitting

The card cover keeps its 2:3 frame.

- **Portrait artwork fills the frame.** It is scaled with `object-fit: cover` so the small empty bands around the image are removed. Small portrait images may be enlarged and edges may be cropped.
- **Landscape artwork stays fitted.** It uses `object-fit: contain` with natural automatic height, so the full landscape image is visible without enlargement or cropping. The empty bands above and below are intentional.
- Both orientations are centered.
- Orientation is detected from `naturalWidth`/`naturalHeight` at image load.
- The portrait fill uses an absolutely positioned image inside the cover so it fills the border box's content area.

### 6. Merged badges

Unread and downloaded badges are one pill:

- only unread: `12`
- only downloaded: `ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬Å“1`
- both: `12 Ãƒâ€šÃ‚Â· ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬Å“1`
- counts above 99 use `99+`
- tooltip is combined, e.g. `12 unread chapters Ãƒâ€šÃ‚Â· 1 downloaded chapters`
- visual numbers are `aria-hidden`; a single hidden label exposes the combined meaning

## Tests

Added/updated Library tests for:

- context menu on long press;
- context menu on right click;
- keyboard context menu (`Shift+F10`);
- menu actions including Continue reading href and Select;
- no Continue-reading link in the card;
- selection mode entered from the context menu;
- removed Mark read/unread/Download/Delete controls and no `N selected` text;
- X clears selection and exits selection mode;
- merged badge title and exactly one badge;
- category visibility checkbox hiding a tab and Show all restoring it;
- persistent hidden category IDs in preferences.

Final suite: **426 passed, 7 skipped**.

## Validation

```text
npm run codegen:check   PASS
npm run lint            PASS
npm run typecheck       PASS
npm run test            80 files passed, 3 skipped
                        426 tests passed, 7 skipped
npm run build           PASS
```

Build after final changes:

```text
main JS   650.35 kB (gzip 172.63 kB)
CSS       105.09 kB (gzip  18.20 kB)
precache   48 entries / ~1005 KiB
```

## Runtime screenshots

- `visual-audit/library-revision-final-phone.png`
- `visual-audit/library-revision-filter-top-phone.png`
- `visual-audit/library-revision-final-selection-phone.png`
- `visual-audit/library-revision-final-820.png`
- `visual-audit/library-revision-final-1280.png`
- `visual-audit/library-final-context-phone.png`
- `visual-audit/library-fit-phone.png`
- `visual-audit/library-all-centered-phone.png`
- `visual-audit/library-all-filter-phone.png`
- `visual-audit/library-all-hidden-phone.png`
- `visual-audit/library-selection-rail-final-phone.png`\n- `visual-audit/library-no-continue-chip-phone.png`

## Remaining concerns

1. The progress chip (`Continue Ch. ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦`) remains as a non-interactive status overlay. The card button and footer CTA are gone; the context menu owns the action.
2. `Show categories` controls category-strip visibility, not a multi-category content filter. Server-side filtering still supports the existing single-category selection through the category tabs.
3. Right-click/long-press is the requested primary discovery path. Keyboard and screen-reader support exists through `aria-haspopup`, `Shift+F10`, and the context-menu key, but there is no permanent visible overflow button on the card.
4. Some server thumbnails loaded slowly during runtime capture; this is separate from the fitted-artwork rule.

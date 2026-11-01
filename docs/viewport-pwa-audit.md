# Mobile and PWA viewport audit

**Date:** 2026-11-01  
**Scope:** application-level viewport behavior, iOS input zoom, root width, text autosizing, safe areas, and Reader zoom boundaries.  
**Runtime:** production preview at `http://127.0.0.1:4174` proxied to Suwayomi Server `v2.4.2366`.  
**Browser:** headless Chromium via CDP; safe-area insets simulated.  
**Physical iOS:** not tested. Chromium emulation cannot prove Safari/WebKit behavior.

## Root cause

The old viewport was:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

It enabled the edge-to-edge canvas but placed no upper bound on page scale and did not opt out of user scaling. There was also no application touch-action policy, so the installed app still exposed the normal browser pinch/double-tap canvas. This matches the reported behavior: a PWA that feels slightly zoomed and can still be moved like a webpage.

A second, independent zoom trigger was input typography. At phone width, many editable controls computed below 16 px:

- source search: 13 px
- chapter search: 13 px
- chapter order/filter/scanlator selects: 13 px
- settings selects: 13 px
- library search: 15 px
- connection URL: 15 px

iOS Safari/WebKit zooms a focused text field whose computed font size is below 16 px. That can leave a standalone PWA at an unexpected zoom after using search or settings.

There was no root-width bug. `html`, `body`, `#root`, and the page shells did not widen the document at any tested viewport. The category strip intentionally overflows inside its own scroll container.

## Final viewport configuration

```html
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
/>
```

`viewport-fit=cover` is preserved, so the existing safe-area tokens continue to work.

## Input typography

At phone widths, every editable text/select/textarea control is normalized to a 16 px computed size:

```css
@media (max-width: 720px) {
  html body input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='color']):not([type='file']):not([type='hidden']),
  html body select:not([disabled]),
  html body textarea:not([disabled]) {
    font-size: 16px;
  }

  html body .action-menu-panel .chapter-select select {
    font-size: 16px;
  }
}
```

Checkboxes, radios, color inputs, ranges, and file pickers are excluded because they are not keyboard text entry surfaces. Buttons retain their hierarchy-driven sizes.

Verified computed sizes:

- Connection URL: **16 px**
- Library search: **16 px**
- Source search: **16 px**
- Chapter search: **16 px**
- Chapter order: **16 px**
- Chapter filter: **16 px**
- Download target: **16 px**
- Filter by scanlator: **16 px**
- Reader settings selects: **16 px** for all seven
- Server settings text, number, password inputs: **16 px**
- Backup/sync/tracking inputs: **16 px**
- Search page: **16 px**

## Text autosizing

```css
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
```

Computed `textSizeAdjust` is `100%` at runtime. This prevents WebKit’s automatic text inflation in landscape without globally freezing user text preferences.

## Root width and overflow

Measured at every tested viewport:

| Viewport | innerWidth | visualViewport.width | scale | documentElement.scrollWidth | scrollX |
|---|---:|---:|---:|---:|---:|
| 390×844 | 390 | 390 | 1 | 390 | 0 |
| 430×932 | 430 | 430 | 1 | 430 | 0 |
| 844×390 | 844 | 844 | 1 | 844 | 0 |
| 820×1180 | 820 | 820 | 1 | 820 | 0 |

Audited routes: Connection, Library, Manga Detail, Reader, Browse, Source result, Search, Downloads, Settings. All agreed with `innerWidth`.

At 430 px the category tab buttons extend beyond the viewport inside `.category-tabs`, which is an intentional horizontal scroll region. `documentElement.scrollWidth` remains 430, and `scrollX` remains 0. No structural overflow was found, and no `overflow-x: hidden` workaround was added.

At 844×390 and 820×1180 the overflow probe returned no unrelated elements.

## Touch-action policy

```css
html,
body {
  touch-action: pan-x pan-y;
}
```

This is deliberately not `touch-action: none`.

- Vertical page scrolling remains available.
- Horizontal category strips and any explicitly scrollable rail remain available.
- Drawers and fixed chrome continue to receive taps.
- Browser pinch/double-tap canvas zoom is removed.
- Native form controls, tap targets, and focus behavior are unchanged.

The policy is evaluated on the document boundary, not on every feature. If Reader gains an explicit gesture zoom later, that image surface can override `touch-action` locally without unlocking the app canvas.

## Reader behavior

There is currently **no explicit Reader image-zoom implementation** in the codebase. Reader supports vertical/paged reading, fit settings, and page navigation, but no content-scale controls.

Given the requirement not to fake content zoom with browser pinch:

- application pinch zoom is locked;
- Reader intentionally inherits the locked canvas;
- no CSS/transform fake zoom was added;
- Reader page content remains edge-to-edge with safe chrome;
- this is documented as a remaining Reader capability gap.

Reader runtime at 390×844 still measured scale 1 and document width 390 after a synthetic pinch gesture. A future Reader zoom must scale only `.reader-page` content, keep header/navigation/safe insets fixed, and reset to its fit mode.

## Safe-area regression

The viewport change does not alter the safe-area tokens or their consumers.

At 390×844 with a 47 px simulated top inset:

- Library heading top: **47 px**
- Filter drawer header: **47 px**
- Filter drawer footer bottom padding: **42 px**
- Mobile nav bottom padding: **34 px**
- Reader header content remains below the top inset; Reader page content remains edge-to-edge.

At 844×390 and 820×1180, document widths and safe insets matched the audit values. No safe-area regression was observed.

## Runtime interaction checks

- Fresh launch and full reload at 390×844, then connection field focus: scale 1, width 390, scrollWidth 390.
- Connect, open Library: scale 1, width 390, scrollWidth 390.
- Focus Library search: scale 1; no document pan.
- Open Library filters and focus a filter input: scale 1; body lock only while the drawer is open.
- Open a source and focus its search: scale 1; search font 16 px.
- Navigate Library → Manga → Reader → Browse → Settings: scale 1 at every route.
- Open Reader and attempt a synthetic pinch: scale 1; scrollWidth 390.
- Resize to 430×932, 844×390, and 820×1180: scale 1 and no document-level horizontal pan at each size.
- Synthetic horizontal pan at Library: `scrollX` remained 0.
- The category row still scrolls internally by design.

Chromium headless does not emulate iOS Safari input autozoom, so the input fix is validated by computed typography and standards behavior, not by observing an iPhone focus animation.

## Accessibility decision

Kakkee intentionally uses an app-like locked viewport:

- browser pinch/double-tap canvas zoom is disabled;
- OS-level accessibility zoom and screen magnification remain outside the app’s control;
- text inputs are 16 px to avoid accidental focus zoom;
- text autosizing is fixed at 100%;
- Reader has no explicit content zoom yet.

This is a deliberate tradeoff. It should be revisited when Reader gains a controlled zoom surface, because locked browser zoom removes an accessibility fallback for users who magnify the whole interface.

## Limitations

- No physical iPhone/iPad or Safari/WebKit device was available. Chromium approximations cannot prove iOS gesture behavior.
- `user-scalable=no` and `touch-action` behavior differs by iOS version; Safari may preserve accessibility zoom outside the PWA canvas.
- Installed-PWA standalone display was simulated with viewport metrics and safe-area insets, not a real home-screen installation.
- Reader explicit image zoom does not exist; browser pinch is now intentionally unavailable.
- Color contrast, reduced-motion, and assistive-technology behavior were not re-audited here.

## Validation

```text
npm run codegen:check   PASS
npm run lint            PASS
npm run typecheck       PASS
npm run test            80 files passed, 3 skipped
                        423 tests passed, 7 skipped
npm run build           PASS
```

Production output:

```text
main JS   644.70 kB (gzip 171.12 kB)
CSS       102.45 kB (gzip  17.84 kB)
precache   48 entries / ~997 KiB
```

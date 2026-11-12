# Shared BackButton

## Reference

Inspected the actual Nuvio Web implementation from
[orochibraru/nuvio-web](https://github.com/orochibraru/nuvio-web):

- `src/routes/(protected)/(app)/settings/+layout.svelte`
- `src/routes/(protected)/(app)/addons/+page.svelte`

The reference back action is a compact, transparent, rounded pill with a
Lucide `chevron-left`, a subtle active press (`active:scale-95`), and no
underline or decorative border. Kakkee reproduces the icon, stroke, geometry,
and interaction, using an icon-only target beside the page title.

## Component

`src/shared/BackButton.tsx`

```tsx
<BackButton to="/settings" label="Back" />
```

- 20px Lucide chevron, 2px stroke.
- 40px desktop / 44px phone hit target.
- Transparent rounded-full background.
- Subtle hover surface, active press scale, accent focus ring.
- Accessible name and tooltip from `label` (default `Back`).
- Caller owns `to` fallback, `state`, and optional `onClick` history handling.

## Header integration

`PageHeader` now accepts `leading`. The leading action is a sibling of the
title block, not nested inside the title row:

```text
[‹] Extensions
    Sources installed through your server
```

The subtitle stays under the title block. The header keeps a horizontal row
on phone, so the back action never wraps above or below the title.

## Applied to

- Extensions and Extension Detail.
- Manga Detail and Reader.
- Source catalog pages.
- Settings subsections.
- Offline Downloads and Offline Reader.

Existing provenance, fallback destinations, browser history, and reader/manga
relationships are preserved through each caller’s existing `to`/`onClick`
behavior.

## Visual verification

Verified against the real local app at 390×844, 820×1180, 1180×820, and 1280×900:

- `visual-audit/backbtnlocal-extensions-390x844.png`
- `visual-audit/backbtnlocal-extensions-820x1180.png`
- `visual-audit/backbtnlocal-extensions-1180x820.png`
- `visual-audit/backbtnlocal-extensions-1280x900.png`
- `visual-audit/backbtnlocal-settings-reader-390x844.png`
- `visual-audit/backbtnlocal-manga-detail-390x844.png`

The measured 390px header keeps the 44px back target and title on one row;
title/subtitle share the same left edge. At 1180px the icon and title centers
align at 44px, with the subtitle below the title.

## Validation

- `src/shared/BackButton.test.tsx` covers fallback navigation, accessible name,
  click interception, chevron markup, and header structure.
- Reader tests updated for the icon-only accessible names.
- Full validation: 458 tests passed, 7 skipped; lint, typecheck, build pass.

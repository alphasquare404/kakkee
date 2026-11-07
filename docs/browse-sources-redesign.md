> **Superseded for Browse header/search behavior:** see
> [`browse-search-ux.md`](browse-search-ux.md). The source-directory,
> pinned-source, provider-grouping, and extension-pagination decisions below
> remain valid; the single-language header filter and Search-title details are
> replaced by the shared filter/search implementation.

# Browse sources + search + extensions

**Date:** 2026-11-06  
**Scope:** Browse page and the source/extension/search surfaces reachable from it. No Library, Reading, Manga Detail, Reader, Downloads, or Settings redesign.

## Final product decisions

- The navigation tab and page title are **Browse**.
- There is no separate **Search** tab.
- There is no separate **Extensions** tab.
- Browse search is a **manga search**, not a source filter.
- Submitting the Browse search opens the manga search view at `/search?q=…`; that view also has the Browse title and keeps Browse active.
- Extensions are opened from the **Extensions icon button at the top-right of Browse**; the icon is the same puzzle icon previously used by the Extensions tab.
- The Browse grid/grouping remains, but only **pinned** sources are promoted. Last-used/recent is no longer shown.
- The separate Preferred filter and Preferred-languages editor were removed. Language filtering remains in the language select.
- Extension loading now pages through the complete extension catalog instead of stopping at the first 500 rows.

## Source directory

### Pinned

- Only `preferences.pinned` sources appear under **Pinned sources**.
- A source is pinned per source ID, including individual language variants inside a provider group.
- Unpinning removes the pinned card immediately.
- The directory still contains all sources.

### Provider groups

- Variants are grouped by the exact server-provided `source.name`.
- A group appears only when the active filters leave at least two variants.
- Group rows show provider icon, name, language summary, count, and pinned count.
- Expanding shows language chips; **Show all N variants** reveals the rest.
- Every chip links to `/browse/:sourceId`; no source IDs are merged or rewritten.

### Filters

- Language select: all installed source languages.
- NSFW visibility.
- Alphabetical directory order.
- There is no source search field and no Preferred filter.
- The source count makes filtering explicit, for example `65 of 79 sources`.

## Manga search

- Browse search field placeholder and accessible name are **Search manga**.
- Source name/code search was removed.
- Submitting the form navigates to the existing search route with `?q=`.
- The search view:
  - has the **Browse** title;
  - only displays manga results;
  - does not display sources;
  - does not offer “Search installed sources”;
  - keeps Browse active in desktop and mobile navigation.
- The GraphQL `GlobalSearch` operation no longer requests source nodes.

## Extensions

- Extensions remain a full management page, opened from Browse's top-right icon.
- Browse stays active while `/extensions` is open.
- The Extensions catalog query now uses cursor pagination and reads every page.
- Current live result: **1,470 extensions**, including MangaDex, Manga18fx, ToonGod, and Web Central in Installed.
- Previously the query stopped after 500 rows, so some installed extensions were absent.

## Navigation

Desktop sidebar now contains:

```text
Library
Reading
Browse
Categories
History
Downloads
Settings
```

Mobile primary navigation now contains:

```text
Library
Reading
Browse
More
```

Search and Extensions are removed from primary and More navigation. Their routes remain as views inside the Browse section.

## Visual verification

Browse:

- `visual-audit/browse-v4-browse-1280x900.png`
- `visual-audit/browse-v4-browse-390x844.png` — pinned section, top-right extension icon
- `visual-audit/browse-v3-browse-1280x900.png` — pinned state
- `visual-audit/browse-v2-browse-pinned-1280x900.png`

Manga search:

- `visual-audit/browse-v4-search-1280x900.png` — Browse title, manga-only results, extension icon
- `visual-audit/browse-v2-search-1280x900.png`

Extensions:

- `visual-audit/browse-v4-extensions-1280x900.png` — 1,470 extensions loaded, 10 installed
- `visual-audit/browse-v4-extensions-390x844.png`
- `visual-audit/browse-v2-extensions-1280x900.png` — MangaDex/Manga18fx present after pagination fix

Before:

- `visual-audit/browse-before-1280x900.png`
- `visual-audit/browse-before-1180x820.png`
- `visual-audit/browse-before-820x1180.png`
- `visual-audit/browse-before-430x932.png`
- `visual-audit/browse-before-390x844.png`

## Functional and regression checks

- 65 of 79 sources visible at default NSFW=Hidden; 79 with NSFW=All.
- MangaDex remains a 61-variant provider group.
- Individual source links keep their exact IDs.
- Pinning/unpinning and pinned section state.
- Language filter.
- NSFW visibility.
- Manga search submit and results.
- Search page contains no source section and no source-search action.
- Extension pagination across multiple pages.
- Browse active on `/search` and `/extensions`.
- Search/Extensions absent from navigation.
- Extension icon top-right at desktop and 390px.
- No horizontal overflow at 390px.

## Validation

```text
npm run codegen:check   PASS
npm run lint            PASS
npm run typecheck       PASS
npm run test            83 files passed, 3 skipped
                        441 tests passed, 7 skipped
npm run build           PASS
```

## Limitations

- The search route still exists as a Browse subview even though it has no tab.
- Server-known manga search is used; the previous live “search installed sources” action was removed to honor the manga-only requirement.
- Extension pagination reads up to 20 × 500 rows; larger catalogs would need a stricter virtualized/paged UI.
- The extension page renders the complete 1,470-row catalog; virtualization is not implemented.
- Source grouping still relies on `SourceType.name`.
- Preferred-language metadata remains in storage for compatibility but is no longer exposed as a separate filter.

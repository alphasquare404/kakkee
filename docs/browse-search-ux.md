# Browse & Search UX redesign

**Date:** 2026-11-07  
**Scope:** Browse header, shared search/filter controls, language/source selection, multi-source manga search, source result tabs, result metadata, and search navigation. Pinned Sources and the All Sources rows remain the approved presentation.

## Browse header

Previous composition:

- Large page title and persistent subtitle.
- Separate source controls for language, NSFW, and sort.
- Search was a source-directory filter, not a manga search.
- Several vertical rows before Pinned/All Sources.

New composition:

```text
Browse                              [Extensions]
[Filter] [Search manga........................]
Pinned sources
All sources                         count
```

- The title is compact and has no persistent subtitle.
- The page-header divider was removed.
- Filter is immediately left of search.
- On phone, Filter is icon-first with an active-count badge; search fills the rest of one row.
- No large submit button; Enter/Search submits the form.
- Extensions remains reachable through the top-right puzzle icon.

## Shared search and filters

Browse, Search, and Extensions use the same Library-style header controls: a search field inside the header toolbar, a Filter icon action in the header actions, and a mobile search toggle. They provide:

- one semantic `role="search"` form;
- `type="search"` and `enterKeyHint="search"`;
- clear control;
- Filter trigger with accessible name and active count;
- no keystroke-triggered source requests.

`SearchFilterDrawer` is shared by both pages and uses the existing focus-trapping `FilterDrawer`.

### Filter model

- **Languages:** actual installed source languages, multi-select checkboxes.
- **Sources:** searchable provider checklist with per-variant checkboxes and provider group select-all.
- **NSFW:** visibility preference, separate from source selection.
- **Apply:** commits language/source/NSFW changes.
- **Reset:** restores defaults in the draft; user still applies.
- **Cancel/close:** discards draft changes.
- **Active count:** number of active filter groups shown on the trigger and in the drawer.

Search-scope preferences are persisted in `suwayomi.search-preferences.v1`:

```text
languages: []
allSources: true
sourceIds: []
```

Default policy:

- All eligible sources are selected by default, where eligible means matching the selected languages and NSFW visibility.
- Source selection is independent of pinning.
- Search requests run only after explicit query submission, never per keystroke.
- Requests use bounded concurrency (4 workers).
- A custom source selection persists across sessions and routes.

Language and NSFW also filter the All Sources directory, so the approved directory still has its previous filtering functionality. The source-directory sort control was removed; sources stay alphabetical.

## Search results

Route: existing `/search?q=...&tab=...`.

- Page title: **Search**, with a result count when complete.
- Filter + search row is identical to Browse.
- Source tabs appear below the row and above results.
- `All` aggregates every loaded source result.
- Individual source tabs filter already-loaded results.
- Switching tabs changes only `?tab`, never restarts the search.
- Result cards show:
  - cover;
  - title;
  - `source.name Â· language`;
  - library state.
- Duplicate titles from different sources remain distinguishable.
- Source metadata comes from the source catalog already loaded for search scope; no per-result source lookup.

### Counts and pagination

- Tab counts are loaded-result counts.
- A `+` suffix means that source has another page; it is not presented as a total.
- Page header count uses the active tab count with the same `+` qualifier.
- Per-source tabs support **Load more from â€¦** with independent pagination.
- The All tab aggregates loaded pages; source tabs are used for further pagination.
- Successful source results remain when another source fails.
- Failed sources show `!` and a retry action; a compact banner reports the failure count.
- Empty sources show a dedicated zero-result state.

### Many sources

- With more than eight selected sources, the tab row shows at most six result sources.
- A **More sources** select lists all selected sources, including zero-result and failed sources.
- Source tabs scroll horizontally and support arrow-key navigation.
- The source selection is never hidden entirely.

## Navigation and state

- Browse search navigates to `/search?q=...`.
- Submitting a new query resets the tab to All.
- Tab changes use `replace` and preserve the query.
- The active search route keeps Browse active in navigation.
- Manga links use the exact returned manga ID and carry a search origin containing query and tab.
- Back from Manga Detail returns to the search URL with query/tab intact.
- Filters and selected sources are restored from storage on reload.
- Clearing the search returns to Browse without clearing source-directory preferences.

## Visual QA

Browse:

- `visual-audit/search-ux5-browse-1280x900.png`
- `visual-audit/search-ux5-browse-820x1180.png`
- `visual-audit/search-ux5-browse-430x932.png`
- `visual-audit/search-ux5-browse-390x844.png`

Filter drawer:

- `visual-audit/search-ux5-filters-1280x900.png`
- `visual-audit/search-ux5-filters-390x844.png`

Search:

- `visual-audit/search-ux5-search-all-1280x900.png`
- `visual-audit/search-ux5-search-all-820x1180.png`
- `visual-audit/search-ux5-search-all-430x932.png`
- `visual-audit/search-ux5-search-all-390x844.png`
- `visual-audit/search-ux5-search-source-1280x900.png`
- `visual-audit/search-ux5-search-source-390x844.png`
- `visual-audit/search-ux5-search-zero-390x844.png`

Findings/fixes during QA:

- Initial Browse phone layout wrapped All Sources heading; constrained heading and count to one row.
- Source tabs initially exposed too many equal MangaDex variants; limited visible tabs and added the all-source selector.
- Header total implied completeness while pages remained; changed to loaded count with `+`.
- Source-line text truncated in narrow cards; allowed a second line for source identity.

## Tests

New/updated coverage:

- shared Library-style header search and filter composition;
- Enter submission from Browse and Search;
- source tabs and source identity;
- duplicate titles across sources;
- tab switching without additional requests;
- source multi-selection and persistence;
- filter apply and reset;
- NSFW and language filtering;
- multi-language scope helper;
- per-source pagination;
- partial source failure with successful results retained;
- stale-query generation guard;
- existing pinned and All Sources behavior.

Final suite: **453 passed, 7 skipped**.

## Validation

```text
npm run codegen:check   PASS
npm run lint            PASS
npm run typecheck       PASS
npm run test            85 files passed, 3 skipped
                        453 tests passed, 7 skipped
npm run build           PASS
```

## Limitations

- First search with default all sources can issue many requests. It only runs after explicit submit, uses four concurrent workers, and shows progress; a custom source selection is persisted to reduce later work.
- Cancellation is generation-based; in-flight source requests are not aborted at the network layer.
- Search result counts are loaded counts, not server totals; `+` qualifies sources with another page.
- Pagination is available on individual source tabs; All only aggregates loaded pages.
- Manga search does not preserve scroll position when returning from Manga Detail.
- Source failures are represented in the UI but are not independently reproducible in deterministic visual fixtures.
- No automated screen-reader audit was run.


# Page header consistency

**Date:** 2026-11-13  
**Scope:** Shared header composition across Kakkee pages.

## Pattern

Every page header now follows the same hierarchy:

```text
[Back] Title [count]                 [page actions]
       Subtitle
[Search] [Filter]                    (when the page has search)
```

- Title and subtitle use the shared `page-title-row` / `page-subtitle` styles.
- Header actions stay at the top-right.
- Search and filter controls belong to the header, not a disconnected row.
- A divider closes the header before page content.
- Library category tabs have a small gap below the header and no underline of their own.
- BackButton, when present, is a sibling of the title block and does not affect subtitle alignment.

## Implementations

- `PageHeader` gained an optional `toolbar` slot rendered inside `<header>`.
- Browse, Search, and Extensions use the same Library-style header search field and Filter icon action.
- On phone, the search field is hidden until the search icon action is pressed; tablet/desktop show it below the title.
- Library keeps its custom interactive search/history/filter controls with the same title/subtitle hierarchy, header border, and header placement.
- Extension count text was removed so its title/subtitle height matches Browse.
- Reading, Categories, History, Downloads, Settings, Extension Detail, Source pages, and Offline pages retain their existing PageHeader title/subtitle pattern.

All page headers now show a subtitle. Added:

- Library: “Manga and progress”
- Browse: “Search manga and sources”
- Search: “Search selected sources”
- Extensions: “Installed sources”

## Visual verification

- `visual-audit/header3-library-390x844.png`
- `visual-audit/header2-browse-390x844-closed.png`
- `visual-audit/header2-browse-390x844-open.png`
- `visual-audit/header2-extensions-390x844-closed.png`
- `visual-audit/header2-extensions-820x1180.png`
- `visual-audit/header4-search-390x844.png`
- `visual-audit/header-uniform-library-390x844.png`
- `visual-audit/header-uniform-library-820x1180.png`
- `visual-audit/header-uniform-library-1280x900.png`
- `visual-audit/header-uniform-browse-390x844.png`
- `visual-audit/header-uniform-browse-1280x900.png`
- `visual-audit/header-uniform-extensions-390x844.png`
- `visual-audit/header-uniform-extensions-820x1180.png`
- `visual-audit/header-uniform-reading-390x844.png`
- `visual-audit/header-uniform-search-390x844.png`

## Validation

```text
codegen:check   PASS
lint            PASS
typecheck       PASS
test            458 passed, 7 skipped
build           PASS
```

# Category visibility across pages

**Date:** 2026-11-06  
**Status:** implemented and validated.

## Behavior

A category unchecked in **Library → Filter → Show categories** is hidden globally:

- Library All view: manga assigned to that category are removed from the loaded cards;
- Continue Reading: manga assigned to that category are removed;
- Reading → Updates: manga assigned to that category are removed;
- History: chapters from that category are removed.

Checking the category again, or pressing **Show all**, restores its manga everywhere.

**All** and **Default** are different:

- All is a synthetic aggregate view;
- Default is a real category with server ID 0; its members are mangas whose `categoryId` is null, so Library reads it with `categoryId.isNull: true` rather than `equalTo: 0`.

## Data

`hiddenCategoryIds` remains in `suwayomi.library-preferences.v1`. It is read through the shared `useHiddenCategoryIds` hook.

To evaluate category membership without extra per-page requests, the relevant queries now select `categories { nodes { id } }`:

- `LibraryMangas`;
- `ChapterFeed`;
- `ReadingFeed`;
- `RecentlyRead`.

Filtering occurs before grouping, deduplication, and pagination-take decisions:

- Reading feed filters each manga before producing its single latest-chapter row;
- Continue Reading filters chapters before selecting 24 unique manga;
- History filters chapters before dedupe and day grouping;
- Library filters loaded manga before fuzzy/quick filters and display.

## Counts

The Reading feed total is now the number of visible manga after hidden-category filtering, so the header becomes e.g. `Latest 13 of 13` when a large category is hidden.

Library and History still receive their global totals from the server; hidden rows are removed from the rendered content.

## Library pagination note

Library loads pages of 40 manga. Hidden-category filtering applies to the loaded page. With more than one page, loading more may be needed to fill the grid. Reading and History query their respective feeds and filter every returned page.

## Runtime verification

With category **NFSW** (27 manga) hidden:

```text
Library cards : 35 → 13
Reading rows  : 35 → 13
Continue      : 16 → 3
History rows  : 30 → 9
Show all      : 35 restored
```

## Tests

- Library hides a manga assigned to a hidden category from All;
- Reading feed repository excludes hidden-category manga;
- Recently Read repository excludes hidden-category manga;
- History excludes chapters from hidden categories.

Final suite: **436 passed, 7 skipped**.

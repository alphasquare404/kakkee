# Reading: Continue Reading

**Date:** 2026-11-06  
**Status:** implemented and validated.

## Semantics

The client presents this page as **Reading** (Indonesian: **Bacaan**), while the route remains `/updates` so existing links and installed PWAs keep working. The Continue Reading section is a **recently read manga** list, not a list of every manga with an unread chapter.

A manga is shown only when:

1. at least one of its chapters has `lastReadAt > 0`;
2. it has not been fully read;
3. a resumable target exists.

The target is:

| Latest read chapter | Target |
|---|---|
| Unfinished | The same chapter, at `lastPageRead + 1` |
| Finished, next unread exists | The first unread chapter |
| Finished, no unread chapter | Not shown |

The list is ordered by the latest `lastReadAt` of the **last read chapter**, not by manga ID, upload date, or `inLibraryAt`.

## Query

`graphql/operations/recentlyRead.graphql`:

```graphql
query RecentlyRead($first: Int!, $after: Cursor) {
  chapters(
    filter: { inLibrary: { equalTo: true }, lastReadAt: { greaterThan: "0" } }
    order: [{ by: LAST_READ_AT, byType: DESC }]
    first: $first
    after: $after
  ) {
    nodes {
      id
      name
      chapterNumber
      isRead
      lastReadAt
      lastPageRead
      pageCount
      manga {
        id
        title
        thumbnailUrl
        firstUnreadChapter {
          id
          name
          chapterNumber
          lastPageRead
          pageCount
        }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
```

The query is validated against the pinned stable schema and generated through GraphQL Code Generator.

## Grouping

Implemented in `src/core/catalog/recentlyReadRepository.ts`.

- chapters are consumed in `LAST_READ_AT DESC` order;
- the first chapter seen for a manga becomes its last-read chapter;
- duplicate chapters for the same manga are ignored;
- if that chapter is finished, `manga.firstUnreadChapter` becomes the target;
- finished manga without `firstUnreadChapter` is omitted;
- the result is capped at 24 unique manga by default;
- pages of 100 chapters are requested until 24 unique manga are collected, or 10 pages have been consumed.

The 10-page cap protects against pathological libraries where one manga has thousands of read chapters. It is not expected to be reached for normal libraries.

## Latest chapters

The **Updates** section is the library chapter feed.

- Source: `mangas(condition: {inLibrary: true})`
- Each manga contributes exactly one row: `latestUploadedChapter`.
- Rows are sorted by the latest chapter's `uploadDate` descending.
- A manga never appears twice, even when several chapters share the same upload date.
- All/Unread/Read filters apply to the latest chapter of each manga. The scanlator selector was removed.
- The page count is now a **manga count**: `Latest 35 of 35`, not a chapter count.
- The feed paginates the manga list in pages of 200, with a safety cap of 20 pages.

A manga with no chapters is omitted from the rows but remains part of the library total.

## Layout

- Page header: **Reading** with subtitle **Continue Reading and Updates**; sync is an icon-only button at the right.
- Continue Reading: a horizontal rail of cards sized like Library cards. Covers follow the same rule as Library: portrait fill, landscape fit.
- Updates: heading with a **manga-level** count (`Latest 35 of 35`).
- Filters: All / Unread / Read only; scanlator selector removed.
- Feed rows: adaptive small cover (64 px on phone, 84 px on tablet), title, `Chapter · relative time · pages`, and icon actions for read and Manga details.
- Download action removed from Updates rows.

## Filter independence

The Continue Reading controller is separate from the Updates feed controller. The `All/Unread/Read` filters only affect the Updates feed. They do not change the Continue Reading query or its contents.

## Runtime verification

On the connected server:

```text
Continue reading — 16 manga
```

Examples:

- finished chapter with a next chapter: `Kimi wa Midara na Boku no Joou` → `Next: Chapter 9.5`;
- unfinished chapter: `Mob Psycho 100` → resumes `Chapter 3` at page 12;
- unread-only manga were not included.

Screenshots: `visual-audit/updates-continue-true-phone.png`, `visual-audit/reading-rename-phone.png`, `visual-audit/reading-latest-per-manga-phone.png`, `visual-audit/reading-final-layout-phone.png`, `visual-audit/reading-layout-final-820.png`.

## Tests

`src/core/catalog/recentlyReadRepository.test.ts` covers:

- deduplication by manga using the newest read chapter;
- unfinished chapter resuming itself;
- finished chapter advancing to `firstUnreadChapter`;
- fully read manga being omitted;
- pagination until enough unique manga are collected;
- query document, network-only policy, and variables.

Final suite: **433 passed, 7 skipped**.

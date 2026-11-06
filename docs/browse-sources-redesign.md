# Browse Sources redesign

**Date:** 2026-11-06  
**Scope:** Sources section of Browse only. No Library, Reading, Manga Detail, Reader, Downloads, Extensions, Settings, or navigation redesign.

## Root causes of the old UI

- 65 visible sources were rendered as nearly identical small cards in a four-column grid.
- MangaDex alone had 61 visible language variants, producing dozens of repetitive rows.
- Every row repeated language, content-warning, and `Latest` chips with equal visual weight.
- Source icons were not used; every provider became a letter tile.
- Pinning was a text button in the card corner and competed with the source name.
- There was no local source search, no grouping, and no distinction between provider and variant.
- The large source hero consumed the first viewport before users reached a source.

## Patterns considered

1. Keep the card grid but enlarge cards.
2. Group all providers with expandable language variants.
3. Hybrid pinned/recent strip plus a searchable directory.
4. A table-like directory with inline language columns.

The chosen design is the **hybrid pinned/recent + grouped directory**. A larger card grid still repeats MangaDex 61 times. A table is too administrative. Provider groups are reliable because the server exposes the extension provider name in `SourceType.name`; variants remain independent sources with their own IDs.

## Chosen interaction model

### Pinned / recent

- Pinned sources appear in a compact **Pinned & recent** section.
- The last-used source is included even if it is not pinned.
- Pinned cards show source icon, display name, language, and an icon-only pin control.
- The directory still contains every source, so an unpinned variant is never hidden.

### Provider groups

- Variants are grouped by the exact server-provided `source.name` (provider identity), never by fuzzy string matching.
- A group is used only when the current search/filter leaves at least two variants.
- Group rows show provider icon, provider name, a common-language summary, a language count, and an accessible expand button.
- Expanding reveals real variants as language chips. Each chip links to `/browse/:sourceId`; pinning is a separate control.
- The first eight variants are shown; **Show all N variants** reveals the rest.
- No source ID is rewritten, merged, or used as a group ID.

### Search and filters

- Local search is immediate and matches display name, provider name, language code, and language name.
- Language filter, NSFW visibility, preferred only, and preferred languages are preserved.
- Sort options are Name, Pinned first, and Recently used.
- Advanced preferred-language controls live behind a compact **Filters** disclosure.
- There is no submit button.

## Visual result

- Page title is **Sources** with a short subtitle; the large hero was removed.
- Source rows use real server icons and readable provider/language hierarchy.
- Pinned cards are compact and use the accent without glow or gradients.
- Language chips replace repeated metadata cards.
- Desktop uses one broad directory column; tablet keeps the same scan direction; phone uses full-width rows and two-column language chips.

## Screenshots

Before:

- `visual-audit/browse-before-1280x900.png`
- `visual-audit/browse-before-1180x820.png`
- `visual-audit/browse-before-820x1180.png`
- `visual-audit/browse-before-430x932.png`
- `visual-audit/browse-before-390x844.png`

After:

- `visual-audit/browse-after2-1280x900.png`
- `visual-audit/browse-after2-1180x820.png`
- `visual-audit/browse-after2-820x1180.png`
- `visual-audit/browse-after2-430x932.png`
- `visual-audit/browse-after2-390x844.png`
- `visual-audit/browse-final-1280x900.png` (3 pinned sources + expanded MangaDex)
- `visual-audit/browse-final-390x844.png` (phone pinned rail + expanded variants)
- `visual-audit/browse-final-390x844-filters.png` (advanced filter panel)
- `visual-audit/browse-after2-search-1280x900.png`
- `visual-audit/browse-final2-empty-1280x900.png`
- `visual-audit/browse-final2-empty-390x844.png`
- `visual-audit/browse-final2-filters-390x844.png`

## Runtime verification

```text
Before: 65 identical cards, 0 source icons, 0 groups
After : 65 source variants, 5 provider entries at default NSFW=Hidden
        MangaDex: 61 variants in one expandable provider group
        Real icons loaded for all visible provider entries
        Expanded variants expose EN, ID, JA, KO, ZH-HANT, ZH-HANS, ES, FR first
        Search empty: 0 sources + Clear filters action
        No horizontal overflow at 390px
```

## Tests

- `src/features/browse/sourceDirectory.test.ts`: grouping by provider name, source IDs preserved, language labels, search text.
- `ParityPages.test.tsx`: source rows render; provider group expands; EN/JA links resolve to `/browse/en` and `/browse/ja`; pin/unpin state; search empty/clear; language filter.
- Existing source catalog/test coverage remains.

Final suite: **440 passed, 7 skipped**.

## Validation

```text
npm run codegen:check  PASS
npm run lint           PASS
npm run typecheck      PASS
npm run test           83 files passed, 3 skipped
                       440 passed, 7 skipped
npm run build          PASS
```

## Limitations

- Provider grouping uses `SourceType.name`; it intentionally does not merge providers that lack a shared server name.
- The source directory filters variants before grouping, so a language-filtered MangaDex group can collapse into a single individual row.
- The local search is client-side; it does not add a server search API.
- There is no historical frequency counter; "recent" means the persisted `lastSourceId`, not a ranked usage history.
- The pinned section can contain a pinned source that does not match the current language filter; this is intentional so pinned access remains available.

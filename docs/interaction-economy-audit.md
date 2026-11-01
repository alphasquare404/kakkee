# Interaction economy and control necessity audit

**Date:** 2026-11-01  
**Runtime:** production preview at `http://127.0.0.1:4174`, proxied to Suwayomi Server `v2.4.2366`.  
**Data:** 38 library entries, 500 extensions, 106 sources, real source catalogs, 2,761 downloaded chapters.  
**Viewports tested:** 390Ã—844, 430Ã—932, 820Ã—1180, 1180Ã—820, 1280Ã—900.  
**Method:** real Chromium interactions plus rendered screenshot review. Unit tests cover the changed submit and dismiss flows.

## Principle used

Each persistent control was classified as **Necessary**, **Useful shortcut**, **Contextual**, or **Redundant**. A control was removed when the same action remained natural through Enter, native form submission, direct row navigation, Escape/backdrop, an existing state toggle, or an existing scoped menu.

Safety friction was not removed: delete, uninstall, bulk removal, cache clearing, backup/restore, and download deletion remain explicit.

## Findings and changes

| Screen | Previous interaction | Redundancy | New interaction | Actions saved | Reason |
|---|---|---|---|---|---|
| Global Search | Large `Search` button plus subtitle | Enter and mobile Search key already submit; subtitle repeated placeholder/empty copy | Compact 43 px search icon, `role="search"`, `enterKeyHint="search"`; Enter submits | 1 keyboard action; ~20 px vertical copy | Search remains discoverable by icon and keyboard without a large duplicate CTA |
| Source results search | Large text `Search source` button reduced field to 213 px | Enter already submits; button consumed 134 px | Compact 43 px icon; field grows to 304 px; `role="search"` and Search key | 1 keyboard action; 91 px field width | Same capability with better field priority and pointer fallback |
| Library filter drawer | `Done` plus header X plus backdrop/Escape all dismissed | Four dismiss paths, one with no distinct semantics | `Done` removed; X, backdrop and Escape remain | One duplicate control | Filters already apply immediately; one close model is enough |
| Library filter empty state | Footer showed `0 active`, `Reset filters`, `Done` | All controls were no-ops when no filter was active | Footer omitted when `activeCount === 0` | Dead footer removed | A filter surface should not advertise zero state as actions |
| Library filter active state | Footer had Reset and Done | Done duplicated close | Footer shows active count and Reset only | Duplicate dismiss removed | Reset is meaningful only when active; close remains in header |
| Search page empty state | Disabled `Search installed sources` button present | Button could not do anything until a query existed | Rendered only when a query exists | Dead control removed | Live source search is an expensive explicit action and should not be offered with no input |
| Browse header | Header count `106 sources` plus hero `106 installed sources`; subtitle repeated hero copy | Count and explanation repeated in the same first screen | Header count and subtitle removed; hero count/copy remains | Two duplicate content blocks | One clear source explanation remains |
| Downloads header | Header `0 queued` plus KPI `0 In queue` | Same queue count twice | Header count removed; KPI remains | Duplicate count removed | KPI is the more useful queue summary |
| Downloads empty queue | Pause/Resume shown even when it could not affect any queued item | No-op control while running with an empty queue | Hidden when running and queue is empty; shown when globally paused | No-op control removed | Paused state is real state and remains visible via Resume |
| Library utility bar | Title, count, search, then action row; phone labels | Five controls split across rows and labels filled width | Title and icon actions share one row; count hidden on phone; Grid/Filter/Sort labels hidden; access names/tooltips retained | ~43 px vertical chrome | Category â€œAll 38â€ already carries the phone count; familiar icons remain labeled for assistive tech |
| Library desktop/tablet | Title, search, actions in three rows from 861â€“1360 px | Breakpoint composition wasted a row | Title/actions row, full-width search row | ~47 px at 1280, ~43 px at 820 | Content begins in 182 px instead of 229 px on 1280 |
| Library view control | Text `Grid`/`List` button | Mutually exclusive state but no icon | Icon + text on desktop/tablet; icon-only with `Current viewâ€¦` label on phone | No extra control; compact | Grid/list is familiar, low-risk, and state is announced |
| Library filter/sort | Icon + text on phone | Labels consumed the compact bar | Icons only under 720 px, with aria-label and title; count/dot indicators retained | No extra control; compact | Familiar utilities; desktop/tablet keep labels for scanability |
| Updates read action | `Read` button that actually toggled read state | `Read` read like navigation and duplicated the rowâ€™s link affordance | `Mark read` / `Mark unread`, with `aria-pressed` | 0; semantic correction | Row click opens; state action is now explicit |
| Manga chapter read toggle | Visible `Read`, static accessible name `Read Chapter` | Same ambiguity against row navigation | Dynamic accessible name â€œMark Chapter â€¦ as read/unreadâ€; title retained | 0; semantic correction | Visible state stays compact while assistive tech hears the action |
| Search/Browse subtitles | Page heading plus explanatory subtitle plus placeholder/hero | Repetition of obvious context | Subtitles removed on Search and Browse | ~20 px each | Empty state/hero already explains the screen |

## Controls removed entirely

- Library filter `Done` button.
- Empty library-filter footer and its `0 active` / no-op Reset.
- Disabled `Search installed sources` button when no query exists.
- Empty-queue Pause/Resume when the downloader is running.
- Global Search large `Search` text button.
- Source results large `Search source` text button.
- Browse PageHeader source count (hero count remains).
- Downloads PageHeader queue count (KPI remains).
- Search and Browse subtitles that repeated the title/placeholder/hero.
- Duplicate header/hero source count and duplicate queue count.

No capability was removed. Compact search icons preserve a pointer/touch submit affordance and guarantee native implicit form submission; Enter remains the primary keyboard path.

## Search audit

| Surface | Submission | Final behavior |
|---|---|---|
| Library search | Form `role="search"`, Enter, icon submit | Field/icon inside the expandable search bar; Clear appears only with text |
| Source search | Form `role="search"`, Enter, icon submit, Search key | Full 304 px field at 390; no large CTA |
| Global Search | Form `role="search"`, Enter, icon submit, Search key | Compact icon; live source search hidden until query exists |
| Library filter source search | Live filtering | No submit button; typing filters 107 sources immediately |
| Source filter searches | Live filtering | No submit; Apply belongs to the complex filter transaction |
| Chapter search | Live filtering | No submit; row list filters as typed |
| Recent-search entries | Direct button per term | Selecting a term runs the search; history remains a shortcut, not a second field |

Search forms guard against duplicate submission while the controller is loading. Empty Enter on Global Search still clears the query/results intentionally.

## Apply, Save, and confirmation audit

### Removed

- Library filter `Done` â€” changed filters already apply immediately; it only dismissed.
- Empty filter footer actions â€” no effect when no filter is active.

### Intentionally retained

| Control | Why it remains |
|---|---|
| Source filter `Apply filters` + `Reset` | 107 dynamic fields plus parent result toggles; deferred apply avoids a request per keystroke and makes resetting a composed state deliberate |
| `Search installed sources` | Searches every installed source live; expensive and explicit, now offered only with a query |
| Reader `Save layout for this mode` | Saves a reusable per-mode profile; current settings auto-save separately |
| `Save note` / `Clear` in Manga notes | Multi-word server transaction; Clear is destructive text content |
| `Save categories` | Multi-select transaction |
| Category Rename/Cancel/Save | Rename is a real form with a meaningful commit |
| Backup create/validate, cache clear, download deletion, uninstall, bulk remove | Destructive or server-wide operations; protective friction is intentional |
| `Refresh` on Downloads | No automatic polling; manual refresh is the only way to reconcile an external queue change |
| Resume when globally paused with an empty queue | The paused state is global and must remain reversible |
| `Retry failed` | Conditional and only appears when failures exist |
| PWA `Update and reload` / `Close` | Update and dismiss are distinct |

## Icon-first conversions

Only familiar, low-risk actions become icon-only on phones:

- Search
- Grid/List
- Filter
- Sort
- Compact search submit

Kept as text or icon + text:

- More
- Mark read / Mark unread
- Download
- Delete
- Rename
- Save/Cancel
- Reader navigation
- Extension install/update/uninstall
- Settings labels

All icon-only controls have an explicit accessible name. The Library view uses `Current view: grid. Switch to list view`; Filter and Sort retain accessible names and active/count indicators; source/global submit icons have localized `Search` names.

## Native interaction improvements

- Search forms are semantic `role="search"` forms; Enter submits.
- Source and Global search use `enterKeyHint="search"`; connection uses `go`; login uses `next`/`go`.
- Global Search guards duplicate submission while loading and preserves empty-query reset.
- Search submit icons are real `type="submit"` controls, not decorative glyphs.
- Escape/backdrop close drawers; focus returns to the trigger.
- Manga/chapter/history/search rows remain semantic links; no separate Open buttons were added.
- Updates and Manga read toggles use `aria-pressed` and explicit action names.
- Category create/rename remain native forms with Submit/Cancel.

## Toolbar consolidation

### Library

Before at 390:

```text
Library        38 manga
Search row
Grid   Filter   Sort   More
Category strip
Grid starts at ~211 px
```

After at 390:

```text
Library                              [search] [grid] [filter] [sort] More
Category strip (All 38)
Grid starts at ~168 px
```

At 820 and 1280 the labels return (`Grid`, `Filter`, `Sort`) and title/actions share one row; search gets a full row. Desktop grid begins at **182 px** instead of **229 px**.

### Search

Before: title + subtitle + field + large Search CTA + disabled live-search CTA.  
After: title + full field + compact icon; live search appears only with a query.

### Source results

Before: field 213 px + 134 px `Search source` button.  
After: field 304 px + 43 px icon.

### Browse

Before: repeated header count/subtitle plus hero count/copy.  
After: hero count/copy only.

### Downloads

Before: header queue count plus KPI queue count; Pause shown with empty queue.  
After: KPI only; Pause conditional.

## Native form and keyboard behavior

Verified:

- Enter submits Global Search and Source search.
- Enter in Library search still controls the library query.
- Search/Go keys are exposed through `enterKeyHint`.
- Escape closes Library filter.
- X/backdrop/Escape remain valid dismiss paths.
- Search history rows are `type="button"` and do not accidentally submit.
- Search icon buttons are disabled while loading/empty as appropriate.
- No double-submit path remains while the controller reports loading.

## Task-flow measurements

| Task | Before | After | Change |
|---|---|---|---|
| Global search after typing | Tap/click large Search; or Enter | Enter or compact icon | Keyboard: 2â†’1 action; pointer retains 2 but field is wider |
| Source search after typing | Tap/click large Search | Enter or compact icon | Keyboard: 2â†’1; field gains 91 px |
| Library filter: no filters | Open â†’ inspect empty footer | Open â†’ no dead actions | 2 no-op controls removed |
| Library filter: active | Open â†’ change â†’ Done/Reset | Open â†’ change â†’ X/Escape/backdrop; Reset when active | Duplicate close removed |
| Sort | Sort â†’ choose | Sort â†’ choose | Immediate/results; no Apply added |
| Open manga | Tap card/title | Tap card/title | 1 |
| Read chapter | Tap chapter/row | Tap chapter/row | 1 |
| Mark read on Updates | Tap ambiguous `Read` | Tap `Mark read` | 1, clearer |
| Download chapter | Tap download | Tap download | 1 |
| Reader setting | Settings â†’ adjust | Settings â†’ adjust (auto-saved) | 2; explicit profile save is separate |
| Live source search | Button present before query | Query â†’ button appears â†’ run | Dead state removed; expensive action remains explicit |

## Runtime verification

At 390Ã—844:

- Library: title at 52, actions at 47, grid at **168**; count hidden; all three action labels hidden; accessible names present.
- Filter empty: no footer, no Done; active filter: `1 active Reset filters`, no Done.
- Source: input **304 px**, 43 px submit icon; typing `elf` + Enter produced `?q=elf`.
- Global empty: live-source button absent; results query `one` + Enter produced `?q=one` and the live-source button appeared.
- Downloads: real queue is paused/empty, so `Resume downloads` and `Refresh` remain; Pause is hidden only when running with no queue.
- Updates: actions read `Mark unread`, `Download`, `Mark read`; row itself remains the chapter link.

At 430Ã—932:

- Same compact header; title/actions share the row; no overflow.

At 820Ã—1180:

- Labels and count return; title/actions share a row; search gets a full row; no document overflow.

At 1180Ã—820 and 1280Ã—900:

- Title/actions share a row; full-width search; labeled controls retained; grid begins at **182 px**; no horizontal overflow.

## Accessibility

- Library view/filter/sort icons have accessible names and titles; the view label announces current and target view.
- Source/Global search icons have localized accessible names and are real submit buttons.
- Hidden action text is CSS-only; accessible names are explicit on the button.
- Library count is hidden only on phone, where category â€œAll 38â€ remains visible and in the accessibility tree.
- Updates and chapter read toggles keep `aria-pressed` and dynamic accessible names.
- Search forms remain labeled and operable without the removed large CTA.
- Focus return on drawer close remains.
- Destructive controls retain explicit wording and confirmation.
- No labels were removed from ambiguous/destructive actions.

## Tests

Added/updated coverage:

- Enter submits Global Search.
- Enter submits Source search and sends `SEARCH` with the query.
- Source compact search button has an accessible name.
- Library filter empty state has no `0 active`, Reset or Done controls.
- Library filter closes from its header close control and returns focus.
- Live-source button is absent before a query and present after one.
- Icon-only Library view control keeps its accessible name.
- Updates exposes `Mark read` for an unread chapter.
- Manga read toggle exposes the dynamic action name.

## Validation

```text
npm run codegen:check   PASS
npm run lint            PASS
npm run typecheck       PASS
npm run test            80 files passed, 3 skipped
                        423 tests passed, 7 skipped
npm run build           PASS
```

Build output:

```text
main JS   645.50 kB (gzip 171.27 kB)
CSS       102.81 kB (gzip  17.90 kB)
precache   48 entries / ~999 KiB
```

The existing >500 kB chunk warning remains.

## Screenshot artifacts

New/updated untracked captures in `visual-audit/`:

- `economy-matrix-library-phone.png`
- `economy-matrix-search-empty-phone.png`
- `economy-matrix-source-phone.png`
- `economy-matrix-downloads-phone.png`
- `economy-matrix-updates-phone.png`
- `economy-matrix-library-430.png`
- `economy-matrix-search-430.png`
- `economy-matrix-library-820.png`
- `economy-matrix-search-820.png`
- `economy-matrix-source-820.png`
- `economy-matrix-library-1180.png`
- `economy-matrix-search-1180.png`
- `economy-final-library-1280.png`
- `economy-matrix-search-1280.png`
- `economy-final-filter-phone.png`

## Remaining interaction inefficiencies

1. Source â€œAll sourcesâ€ remains a contextual back shortcut even though Browse navigation also reaches the same screen. It is retained for local orientation.
2. Source filters still require explicit Apply/Reset because the form can contain many conditions and parent-level result toggles.
3. â€œSearch installed sourcesâ€ is a second, expensive search action. It is now conditional but still separate from server search.
4. Library selection remains a horizontal strip; some destructive actions require a swipe to reveal.
5. Reader has no bottom Previous/Next controls; chapter navigation remains in the header and at the end of the page.
6. Resume/Pause remains visible when the downloader is paused with an empty queue because the pause is a global state.
7. `Duplicates (0)` remains in Library More because the panel can scan the server for duplicates; zero in the loaded page is not proof that no duplicate exists.
8. Category Rename remains a visible shortcut in addition to the category More menu; it avoids a menu hop for a common task.
9. The update feed still has three trailing actions per row (Mark read, Download, Manga); each has a distinct destination or effect.
10. No physical iOS/Android device was used; Chromium runtime and screenshots only.


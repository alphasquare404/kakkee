# Mobile and tablet visual audit

**Date:** 2026-11-01  
**Runtime:** local production preview (`http://127.0.0.1:4174`) proxying the LAN Suwayomi server `v2.4.2366`.  
**Browser:** headless Chromium via CDP, device metrics plus `Emulation.setSafeAreaInsetsOverride`.  
**Reference:** images in `Refrence/` were inspected before changing composition. The reference was used for density, hierarchy, navigation, artwork prominence, and tablet balance; fictional content was not copied.

This audit was performed from rendered screenshots and real interactions. CSS/DOM checks were used only to confirm measurements after visual inspection.

## Scope and method

- Captured and inspected screenshots at 390x844, 430x932, 820x1180, 1180x820, 844x390 (phone landscape), and 1280x900 reference desktop.
- Used real server data: 38 library entries, 2,761 downloaded chapters, 500 extensions, 106 sources, long manga titles, long source names, and 107 source-filter options.
- Performed navigation, filter, search, tab, reader, selection, settings, overflow, orientation, and safe-area checks.
- Safe-area simulation used top 47 px and bottom 34 px for phones, 24/20 px for tablet portrait, and left/right 47 px for phone landscape. This is an emulation of the environment variables, not a physical notch.
- The QA output directory is `visual-audit/` and is intentionally untracked.

## Screen coverage

| Screen | Phone findings and fixes | Tablet portrait | Tablet landscape | Verified |
|---|---|---|---|---|
| Connection | Safe top now begins below the simulated sensor area; form remains single-column with a reachable primary action. | Form centered, no stretched desktop columns. | Form remains centered with safe left/right. | Screenshot + submit |
| Library | Safe top was overridden to 12.8 px by later padding rules; corrected to 47 px. Three-column grid starts after a compact title, search, actions, and category strip. Category strip has a scroll fade; card shortcut raised from 25 px to 44 px. Selection toolbar reduced from three wrapped rows to a 63 px horizontal action strip. | Four-column grid, compact rail, readable 160 px posters, controls remain on two rows. | Full sidebar at 1180 px; five-column grid, 180 px posters, content still comfortable. | Screenshots, filter, sort, selection |
| Updates | Safe top corrected. Header, filters, Continue reading disclosure, and feed rows fit. Feed actions raised to 40 px touch targets. Rows remain scan-friendly. | Single readable feed column. | Wider feed rows do not stretch metadata excessively. | Screenshot |
| Browse | Filter row was clipped ("Preferre"). Mobile language label hidden and select narrowed; Language, NSFW, and Preferred now sit on one 36 px row. Hero remains the main content block. | Source list changed from one wide column to two columns; 65 shown count and pins use the width. | Source search/list remains usable; category filters visible. | Screenshots, filter toggle |
| Source result | Search input was only 110 px because the global phone button rule forced the Search button to 219 px. Button now auto-width: input 213 px, button 134 px, placeholder readable. Filters open a full-height, safe-area drawer. | Four poster columns; filter/search row fits. | Five poster columns; source title and filters remain above the fold. | Screenshots, filter drawer |
| Global Search | Safe top, field, recent searches, and result rows; no horizontal overflow. | Results use available width. | Results use available width. | Screenshot |
| Manga Detail | Desktop metadata order was not preserved. Description and tags moved into Overview. Hero actions were still constrained to the right cover column at 208 px; the hero now uses `display: contents` on the body so the primary CTA spans 355 px and secondary actions form one 2-up row. Breadcrumb title truncates to one line. Chapter count now singular ("1 chapter"). Order select is inline with the chapter heading on phone. | CTA spans the content width; tabs and chapters are visible without the desktop metadata stack. | Horizontal hero remains balanced; tabs, chapter tools, and first chapter remain visible. | Screenshots, Overview/Chapters |
| Reader | Header safe top respected; left/right padding order was reversed and fixed. Page remains edge-to-edge. Controls raised to 44 px. Chapters was a top-right dialog with a giant full-width Close button; rebuilt as a bottom sheet with a compact 44 px Close and safe bottom padding. | Full-width page, no app navigation; controls remain usable. | App sidebar is hidden for Reader; page uses the full 1180 px width, controls inset left/right. | Screenshots, Chapters sheet, landscape |
| History | Safe top corrected; dense rows, timestamps, and page counts remain readable. | Comfortable list width. | Comfortable list width. | Screenshot |
| Downloads | Safe top corrected; Resume/Refresh, four compact stats, empty queue, and downloaded rows fit. Save/Delete actions remain reachable and readable. | List uses tablet width without oversized rows. | List uses landscape width. | Screenshot |
| Categories | Cards stack on phone, use two columns on tablet; per-card overflow remains reachable. | Two-column category cards. | Multiple columns. | Screenshot |
| Extensions | Safe top corrected. Duplicate "Update" badge inside update cards removed; cards now show one action. Buttons raised to 40 px on touch layouts. 500-item catalog remains readable. | Cards changed from one full-width column to two columns; Install/Update/Uninstall remain aligned. | Two-column cards at 1180 px. | Screenshots, 500-item data |
| Extension Detail | Safe top, package name wrap, metadata rows, and full-width update action. | Metadata remains grouped. | Metadata remains grouped. | Screenshot |
| Settings landing | Server details were five tall stacked label/value rows; now a compact two-column grid, bringing Manage settings into the first screen. Tabs and directory cards remain. | Directory cards use three columns; no compressed desktop sidebar. | Settings directory uses the available width. | Screenshot |
| Appearance settings | Theme cards were oversized one-column cards; now two columns at 390 px with aligned previews. | Preview cards use the width. | Preview cards use the width. | Screenshot |
| Library settings | Density preview cards were huge unaligned cards; fixed-height 104 px previews align Compact and Comfortable; cards are 197 px high, two-up. | Two/four-up choice cards without stretching. | Choice cards remain aligned. | Screenshot + measured |
| Reader settings | Labels and sliders use a compact two-column rhythm; controls stay within 390 px and above the nav. | Sliders retain useful width. | Sliders retain useful width. | Screenshot |
| Server settings | Toggle rows remain scannable; safe top; no horizontal overflow. | Same compact grouping. | Same grouping with more width. | Screenshot |
| Backup / Restore | File input button raised to 44 px; form remains one column; destructive restore copy visible. | Form uses available width. | Form uses available width. | Screenshot |
| Tracking / Sync / History settings | Safe top; grouped rows; no compressed desktop sidebar. | Grouped rows. | Grouped rows. | Screenshots |
| About / Offline | Safe top; readable empty state and Back action; offline reader pages use safe bottom padding. | Readable. | Readable. | Screenshots |
| Library filters | Full-height sheet; header now 47 px safe top, footer 42 px safe bottom; Reset/Done remain above the home indicator. | Sheet fits tablet width. | Sheet remains modal. | Screenshot + measured |
| Source filters | Apply/Reset stay in the sticky source-filter heading; all 107 filter options scroll in the sheet. | Sheet uses tablet width. | Sheet remains readable. | Screenshot |
| Selection mode | Desktop bulk bar wrapped into three rows on phone. Now a single 63 px horizontal action strip with a fade and 44 px actions; destructive actions remain available by swipe and screen readers see all buttons. | Bulk actions wrap naturally at tablet width. | Bulk actions fit one/two rows. | Screenshot + interaction |
| Overflow menus | Library and Manga overflow panels fit 390 px, close on outside/Escape, and return focus. Mobile More menu sits above nav and safe bottom. | Panels remain anchored. | Panels remain anchored. | Interaction |
| PWA update prompt | Previously a tall blocking stack; now 90 px high, actions side-by-side with `min-width: 0`, positioned above bottom navigation and safe area. Copy no longer says "shell". | Prompt remains compact. | Prompt remains compact. | Component test + injected CSS measurement |

## Phone findings

1. **Safe-area padding was not actually reaching several shells.** `.library-shell` and `.detail-shell` were later overridden by `padding-top: 0.8rem/1.35rem`, and `.page-shell` by `0.85rem` under 860 px. Computed top padding was 12.8-13.6 px despite a simulated 47 px safe inset. Fixed all late overrides and centralized `--safe-*` tokens.
2. **Filter drawer header was 14.4 px at the top.** The mobile drawer override used fixed 0.9rem padding. It now honors `max(0.9rem, var(--safe-top))` and is 47 px.
3. **Reader header left/right safe padding was swapped.** The four-value shorthand used left inset as right padding and vice versa. Fixed; landscape controls now sit inside the left/right safe area while the page remains edge-to-edge.
4. **Reader chapter list was not a mobile interaction.** A top-right dialog with a full-width Close button looked like a desktop popover. It is now a bottom sheet, full-width, with 44 px Close and safe bottom padding.
5. **Manga Detail prioritised desktop metadata over chapters.** Description and tags came before tabs, and the CTA was confined to the right column. Moved secondary information into Overview, made the CTA full-width, kept secondary actions in one row, and compacted the chapter header.
6. **Manga title stress was handled but still expensive.** A five-line title leaves little room for chapters at 390 px. Breadcrumb truncation and the removed metadata stack recover about 70 px; the remaining limitation is documented below.
7. **Library cards had a 25 px shortcut.** The whole card is a large target, but the visible "Continue reading" shortcut was too small; raised to 44 px.
8. **Library selection controls wrapped into three rows.** Replaced with a horizontal action strip; the strip is 63 px high and scrollable.
9. **Browse source filters clipped the Preferred control.** Hidden redundant "Language" label and narrowed the select so all three filters fit on one row.
10. **Source search was starved by the phone-wide button rule.** The Search button now auto-sizes; the field is 213 px and the placeholder is readable.
11. **Settings server details consumed the first viewport.** Compact two-column rows reduced five tall rows and brought the directory into view sooner.
12. **Density choices were oversized and misaligned.** Fixed-height previews give Compact and Comfortable equal cards.
13. **PWA prompt could cover the bottom nav and stack two huge buttons.** Compacted, placed above nav, and actions now share the width.
14. **Extension cards repeated an Update badge and an Update button.** Removed the redundant badge.
15. **The 844x390 phone landscape rail sat under the left notch inset.** Rail/sidebar width and padding now include `--safe-left`; brand starts at x69 and nav at x56 with a 47 px inset.

## Tablet portrait findings

- Library is an intentional four-column grid with the compact icon rail; it is not a stretched phone list.
- Browse and Extensions were one full-width card column despite 820 px of width. Both now use two columns. Source results use four poster columns.
- Manga Detail uses the extra width for a larger cover and title, but the CTA and tabs no longer depend on the desktop metadata stack.
- Settings directory is a usable three-column card directory, not a compressed sidebar.
- Reader is full-width with no app chrome.
- Safe top is 24 px and controls remain inside it.

## Tablet landscape findings

- At 1180 px the full sidebar is acceptable because content remains 936 px wide after safe left/right and five poster columns fit comfortably.
- Reader hides the app sidebar entirely, so the manga page gets the full canvas instead of a desktop sidebar squeeze.
- Manga Detail keeps the horizontal hero, tabs, chapter tools, and first chapter visible.
- Settings has a full-width directory and grouped rows; the connection block no longer forces a long empty first screen.
- Extension cards use two columns at 1180 px, matching portrait density instead of one very wide card per row.
- Safe left/right insets are applied to the sidebar width and padding, not only to page content.

## Phone landscape (844x390)

- The rail is 123 px wide including the 47 px left inset; brand and nav controls are outside the notch zone.
- Manga hero uses a 6 rem cover and a single 46 px action row. Tabs start at 272 px and Chapters at 351 px, so chapter access is visible in a 390 px viewport.
- Reader hides app navigation; the page is edge-to-edge while header controls respect left/right insets.
- Library header, actions, and first poster row remain usable; content scrolls vertically.

## Before and after recompositions

- **Manga Detail:** desktop cover + metadata + description + CTA stack → identity first, full-width reading CTA, tabs, then content. Overview holds description, tags, tracking, and secondary data.
- **Reader chapter picker:** top-right desktop dialog → bottom sheet for touch, compact header, safe bottom.
- **Library selection:** wrapped three-row toolbar → one-row scrollable contextual strip.
- **Browse filters:** clipped single row → compact single row with hidden redundant label and a narrower select.
- **Tablet source/extensions:** stretched one-column lists → two-column card compositions.
- **Settings density:** oversized preview cards → aligned two-column cards with fixed preview height.
- **Safe area:** ad-hoc `env()` values and late overrides → shared tokens and explicit component boundaries.

## Safe area audit

### Viewport configuration

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

The PWA manifest uses `display: standalone`, `start_url: /`, scope `/`, theme `#0b1020`, background `#080b12`, and Kakkee icon/name metadata.

### Shared system

```css
--safe-top: env(safe-area-inset-top, 0px);
--safe-right: env(safe-area-inset-right, 0px);
--safe-bottom: env(safe-area-inset-bottom, 0px);
--safe-left: env(safe-area-inset-left, 0px);
```

All shell and chrome rules now consume these tokens. `env()` remains only in the token definitions.

### Components and behavior

| Surface | Top | Bottom | Left/right | Notes |
|---|---|---|---|---|
| App/page shells | `max(base, --safe-top)` | clearance includes nav + `--safe-bottom` | max(base, safe sides) | Library, detail, page, and settings shells corrected |
| Bottom navigation | material extends to viewport edge | content above home indicator | safe left/right | 48 px items; background reaches bottom |
| Scroll clearance | — | `2rem + nav + safe-bottom` = 136 px at 390 | — | last rows are not hidden by nav |
| Mobile More menu | — | above nav + safe bottom | safe right | closes when leaving phone layout |
| Reader header | 44 px controls | — | correct left/right order | content edge-to-edge |
| Reader page | — | 0.75rem + safe bottom | no inset on page image | interactive controls only are inset |
| Reader chapter sheet | overlay starts below safe top | list padding + safe bottom | full width | bottom sheet |
| Filter drawers | header `max(1.5rem, safe-top)` = 47 px | body + footer safe bottom | full width | close 44 px |
| PWA update | — | above nav + safe bottom | safe sides | 90 px tall |
| Sidebar / rail | existing top padding | height 100dvh | width + padding include safe left | controls outside landscape notch |
| Offline reader | reader header | pages safe bottom | full width | — |

### Top behavior

At 390x844 with a 47 px simulated top inset, Library, page shells, detail, filter drawer header, Reader header, and Settings all begin at or below 47 px. The previous 12.8-14.4 px starts were confirmed by computed style and screenshots.

### Bottom behavior

At 390x844 with a 34 px simulated bottom inset, the bottom navigation's content ends above the inset while its background continues to the viewport edge. Page clearance is 136 px. Filter footer content ends at 42 px above the bottom; selection and reader sheet controls remain above the home indicator.

### Landscape behavior

At 844x390 with left/right 47 px, sidebar width becomes 123 px and its controls start at x56/x69. Reader content is edge-to-edge but header controls are inset. At 1180x820 with 24 px left/right, the full sidebar is 244 px and the content canvas remains comfortable.

### Reader behavior

Manga images intentionally remain edge-to-edge on phones. Header and sheet controls are safe; the page is not given artificial side padding. The bottom of the page has safe padding, and the chapter sheet's last item is above the home indicator.

### Browser vs installed PWA

- Normal browser: safe env values are 0; minimum component padding remains; no fake device padding.
- Installed/standalone: `viewport-fit=cover` + `black-translucent` status bar expose real insets; the shared tokens consume them.
- Emulation: `Emulation.setSafeAreaInsetsOverride` produced computed 47/34 and 24/20 values. A physical iPhone/iPad install was not available; this remains an unverified platform limitation.
- PWA install name changed from "Suwayomi UI" to "Kakkee" in both the manifest and Apple meta tag.

## Stress testing

- 38 library cards across 3/4/5 columns.
- 500 extensions; two-column tablet layout; icon lazy-loading retained.
- 107 source-filter options in a searchable sheet.
- Long manga title wraps to five lines at 390; breadcrumb truncates with ellipsis; cards clamp titles.
- Long source name wraps to two lines and remains beside the loaded count.
- Large download numbers (3,496 pages, 2,761 downloaded) fit KPI cards.
- Multiple category tabs scroll horizontally with a mask.
- Selection with multiple IDs; bulk confirmation states remain intact.
- Long chapter titles were not present in the available server data; the row uses truncation but this remains untested with a real long chapter name.

## Touch and accessibility

- Library visible controls: 36 measured; only six "Continue reading" shortcuts were under 40 px before the fix; they are now 44 px high.
- Reader visible controls: all interactive controls are at least 40 px; Reader quick actions and chapter sheet Close are 44 px. The only smaller visible control was the keyboard-only skip link (37 px).
- Extension actions: 40 px on touch layouts; feed actions: 40 px; primary buttons: ~46 px; filter close: 44 px; selection actions: 44 px.
- Focus trapping and focus return remain in the drawer; Reader sheet retains dialog semantics.
- No color-contrast measurement was performed; this remains outstanding.

## Interaction testing

Performed in the rendered app:

- connected to the live server through the connection form;
- moved between Library, Updates, Browse, Search, History, Downloads, Categories, Extensions, Settings, and Reader with bottom navigation and sidebar;
- opened mobile More;
- opened Library filters and Source filters;
- switched Manga Overview/Chapters;
- opened and closed the Reader chapter sheet;
- selected a manga and exercised the bulk toolbar;
- changed orientation from 390x844 to 820x1180 with More open; More closed and did not reappear as a stale layer;
- resized 820x1180 to 1180x820; sidebar/rail and card columns recomposed without stale classes;
- checked browser Back after Manga/Reader.

## Screenshot artifacts

Untracked `visual-audit/` contains the captures, including:

`connection-phone.png`, `library-phone.png`, `library-phone-wide.png`, `library-phone-landscape.png`, `library-tablet-portrait.png`, `library-tablet-landscape.png`, `library-filter-phone.png`, `library-selection-phone.png`, `library-more-phone.png`, `updates-phone.png`, `browse-phone.png`, `browse-tablet-portrait.png`, `source-phone.png`, `source-filter-phone.png`, `source-tablet-portrait.png`, `search-phone.png`, `manga-detail-phone.png`, `manga-overview-phone.png`, `manga-chapters-phone.png`, `manga-detail-phone-landscape.png`, `manga-detail-tablet-portrait.png`, `manga-detail-tablet-landscape.png`, `reader-phone.png`, `reader-chapters-phone.png`, `reader-phone-landscape.png`, `reader-tablet-portrait.png`, `reader-tablet-landscape.png`, `history-phone.png`, `downloads-phone.png`, `categories-phone.png`, `extensions-phone.png`, `extensions-tablet-portrait.png`, `extension-detail-phone.png`, `settings-phone.png`, `appearance-phone.png`, `library-settings-phone.png`, `reader-settings-phone.png`, `server-settings-phone.png`, `backup-phone.png`, `sync-phone.png`, `tracking-phone.png`, `device-settings-phone.png`, `about-phone.png`, `offline-phone.png`, `mobile-more-phone.png`, `pwa-update-phone.png`, `reader-settings-phone.png`, `settings-tablet-portrait.png`, `settings-tablet-landscape.png`, `library-desktop.png`, and contact sheets.

## Remaining visual concerns

1. Long Manga titles still push Chapter rows below the first 390 px viewport. The composition is now identity → CTA → tabs → chapters, but a five-line title is inherently tall.
2. The chapter toolbar still uses two rows on a 390 px phone (order is inline, but search and filters remain separate). First chapter is visible after a short scroll.
3. Library selection uses a horizontal strip; destructive actions require a swipe and are indicated by a fade rather than a visible More button.
4. Source filter Apply/Reset live in a sticky top heading inside the filter panel, not a bottom action bar. They are reachable but not thumb-anchored.
5. Updates rows remain dense with three trailing actions.
6. Reader has no fixed bottom chapter navigation; Previous/Next remain in the top header.
7. Settings landscape has a noticeable gap between connection details and the Manage directory.
8. Safe-area behavior was verified with CDP insets, not on physical iOS hardware.
9. Color contrast, VoiceOver/TalkBack, and real WebKit rendering were not measured.
10. The 500-extension catalog remains unpaginated/unvirtualized; two-column layout improves scanability but not DOM cost.
11. A real installed PWA was not launched; normal browser and simulated standalone insets only.
12. Migration is not exposed in this frontend; it was not visually reviewable.


## Validation

Run after the final visual corrections:

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
main JS   644.70 kB (gzip 171.13 kB)
CSS       102.06 kB (gzip  17.74 kB)
precache   48 entries / ~997 KiB
```

The main-bundle size warning remains; no new dependencies were added for this audit.

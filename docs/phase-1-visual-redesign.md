# Phase 1 — Reference-Driven Visual Redesign

## Reference mapping

All seven images in `Refrence/` were inspected before implementation.

| Screen | Reference | Use |
|---|---|---|
| Library | `Library reference.png` | Desktop sidebar, ambient header, poster grid, search density, category tabs, mobile 3-column grid and bottom navigation |
| Manga Detail | `Detail reference.png` | Ambient cover hero, poster/title composition, primary reading CTA, chapter-row density, mobile hero |
| Reader | `Reader Reference.png` | Distraction-free canvas, glass top chrome, previous/next navigation, mobile readability |
| Updates | `Updates reference.png` | Grouped feed rows, unread state, compact metadata, date grouping |
| Browse | `Browse reference.png` | Page header, source/filter chips, discover-style surface hierarchy |
| Downloads | `Downloads Dashboard reference.png` | Dense activity list, summary metrics, neutral row surfaces |
| Settings | `Settings reference.png` | Section navigation, grouped key/value rows, restrained controls |
| Connection | None | Inferred from the shared ambient dark surface and product identity |

The reference mockup data is never copied. All cards/rows use real server data.
Controls not backed by the current stable server/schema or implemented behavior
are omitted or represented as honest empty/unsupported states.

## Shared visual system

Semantic tokens in `src/app/app.css`:

- `--bg`, `--bg-deep`, `--surface`, `--surface-elevated`, `--surface-glass`
- `--text`, `--muted`, `--faint`
- `--accent`, `--accent-strong`, `--accent-grad`, `--accent-soft`
- `--success`, `--warning`, `--danger` with soft variants
- radius: 7/8/10/12/18px depending on control/surface scale
- spacing: `--sp-1` through `--sp-6`
- type: display, page title, body, metadata, labels
- `--shadow`, `--shadow-pop`, `--shadow-card`
- `--dur-fast` 150ms, `--dur-base` 220ms, native-like `--ease-out`

Material rules:

- glass only for navigation, menus, popovers, reader chrome, connection surface
- content rows/cards remain mostly opaque
- ambient artwork is a blurred, tinted object-URL layer behind bright content
- accent is reserved for active navigation, primary CTA, selected filters, focus,
  progress and unread/in-progress state

## Shell and routes

Implemented responsive shell:

- desktop persistent sidebar (Library, Updates, Browse, Categories, History,
  Downloads, Settings)
- account/server link at the sidebar bottom
- mobile seven-item compact bottom tab bar
- Reader route intentionally hides app navigation and uses full-width chrome
- route scroll-to-top and protected-route redirects

Top-level routes:

```text
/                                  Connection / server management
/library                           Library
/updates                           Latest library chapters
/browse                            Source catalog
/categories                        Categories and manga counts
/history                           Server-provided reading history
/downloads                         Download queue + downloaded chapters
/settings                          Server/application information
/settings/appearance               Theme selection
/settings/library                  Grid density
/settings/server                   Server behavior settings
/settings/reader                   Reader layout preferences
/manga/:mangaId                    Manga Detail
/manga/:mangaId/chapter/:chapterId Reader
```

## Screen decisions

### Library

- Real authenticated covers, no fake chapter/status metadata.
- 1280px desktop shows six poster columns; 390px mobile shows three.
- Ambient top layer uses a real library thumbnail, with gradient fallback.
- Search remains server-side; Filter/Sort remain actual controls.
- Category pills are real server categories.

### Manga Detail

- Cover-derived ambient hero with readability gradient.
- Read CTA is derived from the first chapter in the currently loaded order.
- Long descriptions clamp with Show more/less.
- Overview/Chapters anchor tabs.
- Chapter rows use a play affordance because chapter thumbnails are not available
  in the current server contract.

### Reader

- No app navigation on reader routes.
- Full-width dark canvas, 62rem page column, glass top controls.
- Real page count, previous/next chapter, per-page retry.
- Reader settings: width, gap, background, mode (vertical, webtoon, single,
  double, horizontal), and image filter presets.

### Updates / History / Downloads

- Real chapter feeds from supported chapter filters.
- Date groups, unread/read state, scanlator/page metadata, cover resources.
- Downloads now shows the real server queue state/progress/tries, pause/resume,
  cancel, and delete actions, plus the real downloaded-chapter feed.
- Honest partial-state labels (“Latest 40 of …” / “100 of 2762”) because cursor
  pagination for these feeds is not implemented yet.

### Browse / Categories

- Browse lists real installed sources with language/NSFW/latest metadata; source
  manga browsing is explicitly marked unavailable in this frontend.
- Categories lists real names, counts, and default status read-only; mutations
  are still in the parity backlog.

### Settings

- Real server name, version, build type, endpoint, auth mode, compatibility, and
  platform/JVM data.
- Disconnect uses the existing ConnectionCoordinator.
- Cosmetic toggles are not presented as functional settings; real official
  settings parity is tracked in `docs/suwayomi-webui-feature-parity.md`.

## Motion and accessibility

- restrained route enter, menu/popover, hover, focus, filter, and nav transitions
- reduced-motion media query disables non-essential transitions/animations
- semantic headings, links, buttons, menus, pressed/expanded/current states
- reader keyboard arrows/Escape retained
- authenticated images remain ResourceService-backed; no direct token use

## Visual checks

Real server, logged out (auth `NONE`), viewport checks:

- `1280×900` desktop and `390×844` mobile for Library, Updates, Browse,
  Categories, History, Downloads, Settings, Manga Detail
- Reader desktop/mobile
- no horizontal overflow on checked mobile routes (`scrollWidth=390`)
- no console or page errors during the final all-page pass

Known reference differences:

- no fake chapter badges on Library cards
- no source manga grid on Browse yet
- no chapter thumbnails in Manga Detail because the API does not expose them
- no desktop reader chapter rail because the current reader controller does not
  load the full chapter list
- seven mobile tabs versus five in the references, because this frontend exposes
  all seven implemented top-level pages

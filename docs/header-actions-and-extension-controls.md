# Header actions and extension controls

**Date:** 2026-11-07  
**Scope:** Browse header separator, shared header icon action, and Extensions page controls.

## Shared header action

Browse, Reading sync, and Extensions refresh now use the same
`.app-header-icon-button` treatment:

- square icon-only action;
- bordered surface with the same radius, color, and focus ring;
- 40px desktop / 44px phone target;
- same disabled/busy treatment.

Reading passes this class through `LibrarySyncButton`.

## Extensions refresh

- “Check for updates” is now an icon-only sync button.
- It keeps an accessible label and title (`Check for updates` / `Checking…`).
- `aria-busy` tracks the refresh state.
- The sync icon spins while refreshing.
- The button is placed top-right like the Reading sync action.

## Extensions header and controls

- A plain `<` back control precedes the Extensions title and links to `/browse`.
- The language filter is now a Discover-style **Filter** button with a funnel
  icon, active-count badge, and a language drawer.
- The Filter button and extension search share one compact row with
  Discover-style heights and search-field composition.

## Browse separator

Browse now uses the same header separator rhythm as Reading, below the title
and extension action.

## Screenshots

- `visual-audit/extfilter-extensions-390x844.png`
- `visual-audit/extfilter-filter-390x844.png`
- `visual-audit/extui-browse-390x844.png`
- `visual-audit/extui-reading-390x844.png`

## Validation

```text
codegen:check   PASS
lint            PASS
typecheck       PASS
test            454 passed, 7 skipped
build           PASS
```

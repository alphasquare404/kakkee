# Kakkee product improvement program

Program otonom 21 goal untuk meningkatkan kualitas produk tanpa mengubah identitas visual atau arsitektur.

Status: `Pending` · `In Progress` · `Complete`

## Ringkasan status

| # | Goal | Status | Audit | Commit |
| --- | --- | --- | --- | --- |
| 1 | Interaction semantics | Complete | [interaction-semantics-audit.md](interaction-semantics-audit.md) | `Goal 1` |
| 2 | Information architecture | Complete | [information-architecture-audit.md](information-architecture-audit.md) | `Goal 2` |
| 3 | Action hierarchy | Complete | [action-hierarchy-audit.md](action-hierarchy-audit.md) | `Goal 3` |
| 4 | UI consistency | Complete | [ui-consistency-audit.md](ui-consistency-audit.md) | `Goal 4` |
| 5 | Responsive/adaptive layout | Complete | [responsive-layout-audit.md](responsive-layout-audit.md) | `Goal 5` |
| 6 | Navigation regression/context | Complete | [navigation-audit.md](navigation-audit.md) | `Goal 6` |
| 7 | User task flows | Complete | [task-flow-audit.md](task-flow-audit.md) | `Goal 7` |
| 8 | State and feedback | Complete | [state-feedback-audit.md](state-feedback-audit.md) | `Goal 8` |
| 9 | Error recovery | Complete | [error-recovery-audit.md](error-recovery-audit.md) | `Goal 9` |
| 10 | Empty states | Complete | [empty-state-audit.md](empty-state-audit.md) | `Goal 10` |
| 11 | Accessibility | Complete | [accessibility-audit.md](accessibility-audit.md) | `Goal 11` |
| 12 | Reader UX | Complete | [reader-ux-audit.md](reader-ux-audit.md) | `Goal 12` |
| 13 | Performance/resources | Complete | [performance-audit.md](performance-audit.md) | `Goal 13` |
| 14 | PWA/offline | Complete | [pwa-offline-audit.md](pwa-offline-audit.md) | `Goal 14` |
| 15 | Visual hierarchy | In Progress | — | — |
| 16 | Motion/microinteractions | Pending | — | — |
| 17 | Content/copy | Pending | — | — |
| 18 | Extreme data/stress | Pending | — | — |
| 19 | Preference persistence | Pending | — | — |
| 20 | Cross-feature coherence | Pending | — | — |
| 21 | Final product coherence | Pending | — | — |

## Goal 1 — Interaction semantics

- **Status:** Complete
- **Findings:** loaded-title predicates were a permanent single-select row; publication status had duplicate single and OR controls; Read state and Unread action conflicted; updateable extensions were listed twice; `Updates only` duplicated the Updates section; irrelevant `Retry failed` had already been fixed in the prior density pass.
- **Fixes:** predicates moved into Filter as multi-select AND filters; one multi-select publication status; one stateful `Read` toggle in chapter rows and Updates; disjoint extension sections; removed redundant extension toggle; Filter active count.
- **Tests:** updated Library filter tests; added read-toggle assertion.
- **Runtime:** browser review pending until Goal 2 checkpoint (Goal 1 changed only menu contents and row toggles).
- **Runtime:** 1280×900 browser: filter menu groups, active count, and read toggle verified against live server. Source group has 107 options and needs IA/stress follow-up.
- **Remaining concerns:** source preference auto-save vs Apply; menu initial focus; `Prev` label; 107-option source filter.

## Goal 2 — Information architecture

- **Status:** Complete
- **Findings:** 107-option source filter inside a popover; filter surface mixed filters with auto-saving source preferences; source preferences were hidden under Filters; Search mixes server and live-source result models.
- **Fixes:** Library filter drawer with searchable source list, status/loaded predicates, Reset/Done, focus return; source preferences moved to a contextual Source actions drawer; empty/loading/error states for preferences.
- **Tests:** Library filter drawer tests (dialog, checkboxes, source search, Escape, Done, focus return); typecheck/lint.
- **Runtime:** 1280×900: Library filter drawer shows searchable 107-source list, status, loaded filters, sticky Reset/Done; source search reduced list to 2. 390×844: full-screen drawer verified. Source preferences open in their own contextual drawer.
- **Remaining concerns:** Search result models, chapter download target placement, Downloads stats hierarchy, migration route visibility.

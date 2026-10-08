---
deliverable: 10-development-ready-prototype
project_number: 6
status: draft
owner: designer
updated: 2026-10-08
depends_on: [01-project-alignment, 01-project-alignment-risks, 03-user-personas, 05-information-architecture, 06-feature-prioritization, 07-technical-solution-proposal]
feeds: []
decisions: [D-010, D-026, D-027, D-028, D-029, D-030, D-031, D-032, D-033]
---

# Development-ready prototype

Fictional client, created for an internal DECODE exercise.

The manifest for `prototype/`. The prototype is the discovery's main deliverable,
and this file is what puts it in the dependency graph.

Any change under `prototype/` moves `updated` here in the same pull request. That
date is how a change to the IA, or to a decision, reaches the prototype.

Build starts once the IA is confirmed. Each feature has a standalone file under
`features/` and a rules page under `rules/`. `CHANGELOG.md` is versioned and tagged
at each client review.

## Status

Version 0.7.0. F-01 sign-in, F-02 my pets, F-03 the record, F-04 vaccinations, F-05
booking, F-06 moving or cancelling, and F-10 the reception web view are built and
verified in the browser, with rules pages under `rules/`. Open `index.html` or serve
this folder and open a feature.

Design system: the shadcn/ui kit for structure and Lumen's brand for colour, type and
corners, snapshotted in `tokens.css` (D-007). Values the brand does not set are marked
unconfirmed there.

Next: F-07, reminders by push and email, and the Home screen.

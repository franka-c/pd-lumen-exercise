---
deliverable: 10-development-ready-prototype
project_number: 6
status: draft
owner: designer
updated: 2026-10-03
depends_on: [01-project-alignment, 01-project-alignment-risks, 03-user-personas, 05-information-architecture, 06-feature-prioritization, 07-technical-solution-proposal]
feeds: []
decisions: [D-008]
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

Design foundations in progress on the Figma board. No features built yet. Build
starts the week of 5 October with F-05, booking.

---
deliverable: 10-development-ready-prototype
project_number: 6
status: draft
owner: designer
updated: 2026-10-08
depends_on: [01-project-alignment, 01-project-alignment-risks, 03-user-personas, 05-information-architecture, 06-feature-prioritization, 07-technical-solution-proposal]
feeds: []
decisions: [D-010, D-026, D-027, D-028, D-029, D-030, D-031, D-032, D-033, D-034, D-035, D-036]
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

Version 1.0.0. Every MVP feature in 06 is built and verified in the browser, with a
rules page under `rules/`: F-01 sign-in, F-02 my pets, F-03 the record, F-04
vaccinations, F-05 booking, F-06 moving or cancelling, F-07 Home and reminders, F-08
and F-09 repeat prescriptions, F-10 the reception web view, F-13 reception messages.
Open `index.html` or serve this folder and open a feature.

Design system: the shadcn/ui kit for structure and Lumen's brand for colour, type and
corners, snapshotted in `tokens.css` (D-007). Values the brand does not set are marked
unconfirmed there.

Next: the team and Lumen review D-027 to D-036 and the open questions Q-010 to Q-022.
The Future features in 06 (F-11, F-12) are not built.

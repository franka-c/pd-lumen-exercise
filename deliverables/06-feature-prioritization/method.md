---
deliverable: 06-feature-prioritization
project_number: 4
status: confirmed
owner: pm
updated: 2026-10-09
confirmed_with_client: 2026-10-03
depends_on: [05-information-architecture]
feeds: [07-technical-solution-proposal, 10-development-ready-prototype]
decisions: [D-002, D-004, D-006, D-009, D-010, D-011, D-012]
---

# Feature prioritization

Fictional client, created for an internal DECODE exercise.

`features.csv` is the source. The branded workbook is generated from it at release.

## Method

Every feature from the IA is scored 1 to 5 on user value (from the personas and the
kickoff), development effort (Iva's estimate, where 5 is the most effort) and
technical dependency (1 means no dependency, 5 means it leans entirely on an open
question). Score is value times two, minus effort, minus dependency. MVP above 3,
Future from 0 to 3, Discard below 0 unless a decision overrides.

## Result

Thirteen features. Nine MVP, three Future, one Discard. The three Future items all
depend on Q-001 or on reception messaging, which was parked at the time. Marta
confirmed the split on 3 October with one change: rescheduling moved from Future to
MVP because moving appointments is most of reception's phone load.

## After the IA workshop, 8 October

- F-08 and F-09 move from the Prescriptions module to My pets, because repeat
  prescriptions now live inside the pet's record (D-009, D-010). Scores unchanged.
- Reception messaging was added to the first version at the IA workshop (D-011).
  F-13, reception messages an owner, moves from Future to MVP by decision. Its score
  of 1 stays as set while messaging was parked, the same way F-05 is MVP by
  decision. Owners cannot reply (D-012).
- The split is now eleven MVP and two Future.

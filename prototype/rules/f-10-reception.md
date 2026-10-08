---
kind: rules
feature: f-10-reception
status: draft
decisions: [D-004, D-005, D-010, D-024, D-025, D-028, D-029]
covers: [states, long-text, data-shape, interaction, breakpoints]
---

# F-10 reception web view rules

Fictional client, created for an internal DECODE exercise.

Prototype: `prototype/features/f-10-reception/index.html`, version 0.3.0.
`?role=reception|vet` picks the user, `?state=<id>` the state, `?long=1` long content,
`?text=200` double text size. The mock "now" is Tuesday 20 October 2026, 10:00, and
the prototype panel moves it forward five minutes at a time.

## Purpose

A page in a browser on the reception computer, nothing installed (D-005). Marta at
kickoff: "A list of requests coming in, approve or reject, and if they reject, why."
Sanja wants a list she can clear between calls, approval in two clicks, and a reason
the owner actually reads. Vets approve repeat prescriptions in the same web view,
with the last consultation and last dispensed date in front of them (D-004).

## Flows

- **Appointment request.** A booking (F-05), move or cancellation (F-06) arrives with
  15 minutes to act (D-024, D-028). Reception approves (confirmed at once, owner gets a
  push) or rejects with a reason (owner gets a push). Untouched, VetDesk confirms it
  after 15 minutes and the row turns grey.
- **Prescription request.** A renewal request (F-09) arrives. The vet sets the pickup
  date and approves, or rejects with a reason. Reception can reject only for
  administrative reasons.
- **Messages.** The third tab is F-13 (D-025), not built here.

## States

| Role | State | `?state=` |
| --- | --- | --- |
| Reception | Appointment requests, four active and two auto-confirmed | `appts` |
| Reception | No new requests | `appts-empty` |
| Reception | Loading | `appts-loading` |
| Reception | List failed, with retry | `appts-error` |
| Reception | Detail of a move, old and new time | `appts-detail` |
| Reception | Rejecting a cancellation within 24 hours | `appts-reject` |
| Reception | Approving, button pending | `appts-sending` |
| Reception | Approval failed, retry | `appts-approve-error` |
| Reception | Already handled: VetDesk confirmed meanwhile | `appts-already-handled` |
| Reception | Prescription requests, no approve | `rx` |
| Reception | Prescription detail, owner not registered here | `rx-detail` |
| Reception | Administrative rejection | `rx-reject` |
| Reception | Messages, points to F-13 | `messages` |
| Vet | Prescription requests | `rx` |
| Vet | No prescription requests | `rx-empty` |
| Vet | Approval detail with pickup date | `rx-detail` |
| Vet | Rejecting with a reason | `rx-reject` |
| Vet | Approval failed, retry | `rx-approve-error` |

While a list is loading or failed, the tab counts and the browser tab title show no
number. An empty list shows none.

## Long-text behaviour

| Element | Rule | Tested with |
| --- | --- | --- |
| Owner name in a list row | one line, ellipsis. In full in the detail | "Ana-Marija Kovačević-Horvat Šimunović" at 1024 px and 200% text |
| Vet name, time, move "old → new" | wrap | "dr. med. vet. Ana-Marija Kovačević-Horvat" |
| Minutes left, "Potvrđeno automatski" | wrap inside a 140 px column, never clipped | at 200% text |
| Message to the owner on rejection | the field grows, no limit set | a 175-character text |
| Detail values | wrap in full | |

## Data shape

`appointment_request`

| Field | Type | Required | Nullable | Values and format | Source |
| --- | --- | --- | --- | --- | --- |
| `kind` | enum | yes | no | `new`, `move`, `cancel` | D-024, D-028 |
| `pet`, `owner`, `vet_id`, `type` | as F-05 | yes | no | | F-05 |
| `slot_start` | datetime | yes | no | the booked time, for a move the current one | F-05 |
| `new_slot_start` | datetime | for a move | no | the requested time | D-028 |
| `requested_at` | datetime | yes | no | actionable until + 15 minutes, then "Potvrđeno automatski" | D-024, D-029 |
| `dismissed` | boolean | yes | no | an auto-confirmed row removed by reception. Per user or per clinic is **unconfirmed** | D-029 |

`prescription_request`

| Field | Type | Required | Nullable | Values and format | Source |
| --- | --- | --- | --- | --- | --- |
| `pet`, `species`, `owner` | string | yes | no | | |
| `medicine`, `dose` | string | yes | no | as VetDesk holds them | D-013 |
| `last_consultation` | {date, vet_id, note} | yes | yes | null shows "Nema pregleda u kartoteci" | D-004 |
| `last_dispensed` | date | yes | yes | null shows "Nije izdavan" | D-004 |
| `pickup_from` | date | on approval | no | set by the vet, default today, never in the past. Shown as 20. 10. 2026., not in the browser's format | D-029 |
| `registered_here` | boolean | yes | no | false marks the row "Provjeriti vlasnika" | IA |

Reasons: appointment `vet_unavailable`, `call_first`, `other`; cancellation
`late_cancellation`, `other`; vet on a prescription `needs_checkup`, `other`. All
**unconfirmed placeholders** (Q-010). Reception on a prescription, administrative only:
`owner_not_registered`, `pet_not_on_file`, from the IA.

## Interaction rules

- Two roles, each with its own sign-in (D-029). Reception sees Zahtjevi za termine,
  Zahtjevi za recepte and Poruke. The vet sees Zahtjevi za recepte only.
- Each tab shows its count of active requests. The browser tab title shows the total,
  for example "(4) Lumen recepcija". No sound.
- Appointment requests are one list, the one expiring first on top. A row shows kind,
  pet and type, owner, time (old → new for a move), vet and minutes left.
- A row opens its detail in a 400 px panel on the right. Below 1024 px it opens over
  the list.
- "Odobri" confirms at once and the owner gets a push (D-029). "Odbij" is disabled until
  a reason is picked. The message is optional. Rejecting cannot be undone, and the
  owner gets a push.
- After 15 minutes the row turns grey, "Potvrđeno automatski", with "Ukloni s liste".
  "Ukloni sve automatski potvrđene" clears the section (D-029).
- If VetDesk confirmed while reception was deciding, sending shows "Ovaj zahtjev je već
  obrađen" and both buttons disable.
- A cancellation within 24 hours of the start shows "Otkazivanje manje od 24 sata prije
  termina" in the detail, and offers the late-cancellation reason.
- The vet sets "Preuzimanje od" (default today, never in the past) and approves, or
  rejects with a reason. Reception has no approve, only "Odbij (administrativno)".

## Breakpoints

| Width | What changes |
| --- | --- |
| 1280 px and up (design target, checked at 1280 and 1440) | list and a 400 px detail side by side |
| 1024 px (checked) | the same, narrower list |
| below 1024 px (checked at 900) | the detail opens over the list, the owner column drops from the row and is read in the detail |
| 200% text (checked at 1024 and 1280) | no sideways scrolling, nothing clipped |

## Decisions

Made in the prototype design session for F-10 on 8 October 2026 and logged as D-029.
To confirm with Marta and Petra at the next review.

| Decision | Alternatives considered | Why |
| --- | --- | --- |
| Reception and vets use the same web view, each with their own sign-in | a shared computer with the vet picking their name; ask Petra first | it is clear who approved a medicine |
| "Odobri" confirms at once and the owner gets a push | no approve, only reject; approve only marks as seen | the owner does not wait 15 minutes for a decision already made. Depends on Q-013 |
| An untouched request stays, grey, "Potvrđeno automatski", until reception removes it | disappears; moves to a "today" section | nothing slips past reception |
| The vet sets the pickup date on approval | reception sets it after; next working day as a rule | the vet knows whether the medicine has to be ordered |
| Lists, counts, side panel, the vet sees only prescriptions, "Ukloni sve", states | | proposed in the spec, confirmed by the designer |
| "Provjeriti vlasnika" marker, "then VetDesk confirms by itself" line | | added in the build, approved by the designer |

Components: none added. The kit's Tabs, Badge, Card, Alert, Radio Group, Input,
Textarea and Skeleton cover F-10.

## Open

| # | Question | Owner | Blocks |
| --- | --- | --- | --- |
| Q-013 | Can our backend confirm a pending VetDesk write early, which "Odobri" needs? Also the move and cancellation parts | Iva | F-06, F-10 |
| Q-015 | Sign-in and accounts for reception and vets | Iva | F-10, F-01 |
| Q-010 | All reasons except the two administrative ones | Marta | F-05, F-06, F-10 |

## Deferred

- Messages, sending from the third tab, is F-13.
- Sign-in itself is not built here (Q-015).

---
kind: rules
feature: f-06-move-cancel
status: draft
decisions: [D-005, D-013, D-019, D-024, D-027, D-028]
covers: [states, long-text, data-shape, interaction, breakpoints]
---

# F-06 move or cancel rules

Fictional client, created for an internal DECODE exercise.

Prototype: `prototype/features/f-06-move-cancel/index.html`, version 0.2.0. Every
state below opens with `?state=<id>`. `?long=1` loads long content and `?text=200`
doubles the text size. The mock "now" is Tuesday 20 October 2026, 10:00.

## Purpose

An owner moves or cancels a confirmed appointment without calling. Moving
appointments is most of reception's phone load (Marta, 3 October, in 06), and
Ivana's job in the personas is to "book and move a check-up without calling". The IA
gives the rule: "Move or cancel a confirmed upcoming appointment. Cancellation inside
24 hours shows the clinic's policy text."

## Flows

- **Move.** A Confirmed card, "Promijeni ili otkaži", "Promijeni termin", then a new
  day and time, then "Pošalji zahtjev za promjenu". The card keeps the old time and
  shows the pending move. Within 15 minutes reception rejects it (old time stays,
  push) or VetDesk confirms it (new time, push). Enters from F-05's Confirmed card.
  Crosses into F-10, where reception sees the move request.
- **Withdraw a move.** While a move is pending, "Odustani od promjene" removes it and
  the old time stays.
- **Cancel.** A Confirmed card, "Promijeni ili otkaži", "Otkaži termin", then the
  confirmation, with the policy text inside 24 hours. The card shows the pending
  cancellation. Within 15 minutes reception rejects it (appointment stands, push) or
  it completes (card removed, push). Crosses into F-10.
- **Too late to change.** From 15 minutes before the start, the card offers the
  clinic's phone number instead.

## States

| State | When | `?state=` |
| --- | --- | --- |
| List: more than 24 hours away, within 24 hours, inside the cut-off, move pending, cancellation pending | default | `list` |
| Change or cancel sheet | owner taps "Promijeni ili otkaži" | `actions-sheet` |
| Move: no day chosen | after "Promijeni termin" | `move` |
| Move: free times loading | after choosing a day | `move-loading` |
| Move: no free times that day, with "next free day" | the chosen day is full | `move-no-slots-day` |
| Move: no free times in 4 weeks, with the clinic's phone | the vet is fully booked | `move-fully-booked` |
| Move: free times failed, with retry | the read failed | `move-slots-error` |
| Move: time chosen, send enabled | | `move-ready` |
| Move: sending | after "Pošalji zahtjev za promjenu" | `move-sending` |
| Move: time just taken | VetDesk rejected the write | `move-slot-taken` |
| Move: send failed, with retry | network or server error | `move-send-error` |
| Move: discard confirmation | closing after a time is chosen | `move-discard` |
| Cancel confirmation, more than 24 hours away | | `cancel-confirm` |
| Cancel confirmation with the policy text | within 24 hours | `cancel-confirm-late` |
| Cancel sending | after "Otkaži termin" | `cancel-sending` |
| Cancel send failed, with retry | network or server error | `cancel-error` |
| Push: move confirmed | VetDesk confirmed the new time | `push-move-confirmed` |
| Push: move rejected | reception rejected within 15 minutes | `push-move-rejected` |
| Push: cancellation completed | 15 minutes passed | `push-cancel-confirmed` |
| Push: cancellation rejected | reception rejected within 15 minutes | `push-cancel-rejected` |

## Long-text behaviour

| Element | Rule | Tested with |
| --- | --- | --- |
| Pet name and type on a card | up to two lines, then clamped | "Gospodin Mrvica od Trešnjevke" |
| Vet name | wraps, never truncates | "dr. med. vet. Ana-Marija Kovačević-Horvat" |
| Pending line on a card | wraps in full | "Premještanje na …, čeka potvrdu klinike" at 360 px and 200% text |
| Policy text | wraps in full, never clamped, because it is the clinic's terms | at 360 px and 200% text |
| Push notification body | wraps in full | the move-rejected push with the reason |

## Data shape

`booking`, the fields F-06 adds or reads

| Field | Type | Required | Nullable | Values and format | Source |
| --- | --- | --- | --- | --- | --- |
| `status` | enum | yes | no | F-06 acts only on `confirmed`. A completed cancellation sets `cancelled` | D-019, D-027, D-028 |
| `pending_change` | object | no | yes | `null`, `{kind: "move", slot_start, requested_at}` or `{kind: "cancel", requested_at}`. At most one at a time | D-028 |
| `pending_change.slot_start` | datetime | for a move | no | ISO 8601 with offset, Europe/Zagreb. The booking's own `slot_start` keeps the old time until VetDesk confirms | D-028, Q-013 |
| `pending_change.requested_at` | datetime | yes | no | reception can reject until `requested_at` + 15 minutes | D-024, D-028 |
| `reject_reason_code` | enum | on a rejected change | yes | **Unconfirmed placeholders:** `vet_unavailable`, `late_cancellation`, `other` | D-005, Q-010 |

Settings: `cancellation_policy`, one text for all of Lumen. **Unconfirmed
placeholder:** "Otkazivanje manje od 24 sata prije termina može se naplatiti." (Q-014).
`clinic.phone` as in F-05, numbers are mock.

## Interaction rules

- "Promijeni ili otkaži" shows only on a Confirmed appointment with no pending
  change and more than 15 minutes before the start. It opens a sheet with "Promijeni
  termin", "Otkaži termin" and "Natrag" (D-028).
- From 15 minutes before the start, the card shows "Za promjene nazovite kliniku" and
  the clinic's phone number instead (D-028).
- A move changes only the day and time. Pet, clinic, vet and type stay. The
  appointment's own time, and times within the cut-off, are not offered. Four weeks
  of free times (D-027, D-028).
- "Pošalji zahtjev za promjenu" is disabled until a day and time are chosen. While
  sending it reads "Šaljem…" and cannot be pressed again.
- After a move is sent, the card keeps the old time and shows "Premještanje na …,
  čeka potvrdu klinike". The toast reads "Zahtjev za promjenu je poslan" (D-028).
- While a move is pending, the card offers only "Odustani od promjene". It removes the
  request at once, keeps the old time and shows "Promjena je povučena" (D-028).
- Move confirmed: the card shows the new time and a push reads "Termin je premješten".
  Move rejected: the old time stays and a push reads "Promjena termina nije
  prihvaćena" with the reason (D-028).
- Cancel asks "Otkazati termin?". Within 24 hours of the start it also shows the
  policy text (IA). Moves never show it (IA).
- After a cancellation is sent, the card shows "Otkazivanje zatraženo, čeka potvrdu
  klinike" and offers nothing. Completed: the card disappears and a push reads
  "Termin je otkazan". Rejected: the appointment stands and a push reads
  "Otkazivanje nije prihvaćeno" with the reason (D-028).
- Time taken and send failure behave as in F-05. Closing the move after a time is
  chosen asks "Odbaciti promjenu?" (D-028).

## Breakpoints

As F-05: three columns of times below 375 px, four up to 767 px, five from 768 px in a
centred 560 px column. Checked at 360, 390 and 768 px and at 200% text. Nothing is
dropped and nothing scrolls sideways.

## Decisions

Made in the prototype design session for F-06 on 8 October 2026 and logged as D-028.
To confirm with Marta at the next review.

| Decision | Alternatives considered | Why |
| --- | --- | --- |
| The old appointment stands until the new time is confirmed | release the old time at once; ask Iva first | a rejected move never costs the owner their slot. Depends on Q-013 |
| Cancelling is pending for 15 minutes and reception can reject it | immediate; pending only inside 24 hours | reception can hold a late cancellation to the policy |
| One Lumen-wide policy text, placeholder | a text per clinic; a neutral placeholder | shows how a real text reads. Lumen supplies it (Q-014) |
| The policy shows only when cancelling | also on moves; no moves inside 24 hours | follows the IA |
| No changes from 15 minutes before the start | none; one hour | every request settles before the appointment starts |
| A sheet with two actions | | proposed in the spec, confirmed by the designer |
| A move changes only day and time | change vet or type too | proposed, confirmed. Anything else is cancel and book again |
| Only "withdraw" while a move is pending, nothing while a cancellation is pending | | proposed, confirmed |
| Withdraw is immediate, the discard confirmation, two explanatory lines | | added in the build, approved by the designer |

Components: none added. The kit's Card, Alert, Drawer, Toggle Group and Sonner cover
F-06.

## Notes for F-10, reception

- Reception's lists need move and cancellation requests as well as new bookings
  (D-028). D-025 names three lists and does not say where these sit.
- The rejection reasons (Q-010) now apply to moves and cancellations. The
  placeholder "Kasno otkazivanje prema pravilima klinike" was added for cancellations.

## Open

| # | Question | Owner | Blocks |
| --- | --- | --- | --- |
| Q-013 | Can VetDesk hold the old slot while a move is pending, and does a pending cancellation complete by itself after 15 minutes? | Iva | F-06 |
| Q-014 | The cancellation policy text | Marta | F-06 |
| Q-010 | Rejection reasons, now also for moves and cancellations | Marta | F-05, F-06, F-10 |
| Q-011 | The Croatian wording | Marta | F-05, F-06 |

## Deferred

- Past appointments are not in F-06.
- Changing the vet, clinic or type of an existing appointment. The owner cancels and
  books again (F-05).

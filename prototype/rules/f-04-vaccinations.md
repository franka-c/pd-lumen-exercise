---
kind: rules
feature: f-04-vaccinations
status: draft
decisions: [D-006, D-013, D-014, D-015, D-031, D-033]
covers: [states, long-text, data-shape, interaction, breakpoints]
---

# F-04 vaccinations rules

Fictional client, created for an internal DECODE exercise.

Prototype: `prototype/features/f-04-vaccinations/index.html`, version 0.7.0. Every
state opens with `?state=<id>`. `?long=1` loads long content and `?text=200` doubles
the text size. The mock "today" is 20 October 2026.

## Purpose

Marta at kickoff: "Tell me when my dog is due for something." The app shows what
VetDesk returns as due and calculates nothing itself (D-014). Reception sets the rules
in VetDesk (D-015). Petra: reminders come from the record, not a calendar.

## Flows

- **Pet to vaccinations.** "Cijepljenja" on the pet's page (F-02).
- **Due item to booking.** "Rezerviraj" opens F-05 with the pet, type Cijepljenje and
  the item's clinic.

## States

| State | `?state=` |
| --- | --- |
| One overdue, two upcoming, history | `list` |
| Already booked | `due-booked` |
| Nothing due | `none-due` |
| Nothing due and no history | `empty` |
| Loading | `loading` |
| Failed, retry | `error` |
| VetDesk not answering, last saved data | `stale` |
| Pet that has died, history only | `deceased` |

## Long-text behaviour

Vaccine names wrap in full, in the due card and the history. Tested with "Kombinirano
cjepivo protiv štenećaka, zarazne upale jetre, parvoviroze i parainfluence (DHPPi)" at
360 px and 200% text.

## Data shape

`due`, read from VetDesk (D-014)

| Field | Type | Required | Nullable | Notes |
| --- | --- | --- | --- | --- |
| `type` | string | yes | no | as VetDesk names it |
| `due_date` | date | yes | no | before today: "Dospjelo 3. rujna", otherwise "Dospijeva …". The year shows when it is not this year. **Whether VetDesk returns future dates is unconfirmed** (Q-019) |
| `clinic_id` | string | yes | no | passed to F-05 |

`history`, read from VetDesk (D-013): `name`, `date`, `vet_id`, `clinic_id`, newest
first.

## Interaction rules

- "Dospijeva" lists everything VetDesk returns, sorted by date, so overdue items come
  first. Calm and neutral: no red, no warning (D-033). No "soon" window is calculated
  (D-014).
- "Rezerviraj" opens `../f-05-booking/index.html?state=book&pet=<id>&type=vaccination&clinic=<id>`.
- If the pet already has a requested or confirmed vaccination appointment in the
  future, each due item shows "Termin rezerviran: …" instead of the button.
- Nothing due: "Nema dospjelih cijepljenja." No history: "Još nema cijepljenja u
  kartonu."
- A pet that has died shows its history only (D-031).
- VetDesk not answering shows the last saved data with a notice, as F-02.

## Breakpoints

As F-05: checked at 360, 390 and 768 px and at 200% text. Nothing scrolls sideways.

## Decisions

Made in the prototype design session for F-04 on 8 October 2026 and logged as D-033.

| Decision | Alternatives considered | Why |
| --- | --- | --- |
| Overdue first, calm and neutral | highlighted in red; neutral, with a note after 30 days | the brand's calm tone, and the owner is not scolded |
| The two sections, booking from a due item, "already booked", the states | | proposed in the spec, confirmed by the designer |

F-05's mock data was aligned so Rex is due in both features. The F-05 warning for a
vaccination that is not due now uses Mica.

Components: none added.

## Open

| # | Question | Owner | Blocks |
| --- | --- | --- | --- |
| Q-019 | Does VetDesk return only what is due now, or the next dates ahead too? F-05's warning needs the next date | Iva | F-04, F-05, F-07 |

## Deferred

- The Home due card and the reminders themselves are F-07.

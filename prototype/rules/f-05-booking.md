---
kind: rules
feature: f-05-booking
status: draft
decisions: [D-002, D-005, D-013, D-014, D-016, D-017, D-019, D-020, D-023, D-024, D-027]
covers: [states, long-text, data-shape, interaction, breakpoints]
---

# F-05 booking rules

Fictional client, created for an internal DECODE exercise.

Prototype: `prototype/features/f-05-booking/index.html`, version 0.1.0. Every state
below opens with `?state=<id>`. `?long=1` loads long content and `?text=200` doubles
the text size.

## Purpose

An owner books an appointment for their pet with the vet they usually see, at their
usual clinic (D-002). Reception has 15 minutes to reject the request, after which
VetDesk confirms it (D-013, D-024). This replaces the VetDesk widget, which offered
every vet at every clinic and could not see the pet's record (kickoff, Marta and
Petra).

## Flows

- **Book.** Termini, "Rezerviraj termin", then pet, clinic, vet, type, day and time,
  then "Pošalji zahtjev". The owner lands on Termini with a Requested card on top.
  Within 15 minutes reception rejects it (Not confirmed, push) or VetDesk confirms it
  (Confirmed, push). The rejection side crosses into F-10, the reception lists.
- **Pick another time.** From a Not confirmed card, booking opens with the same pet
  and clinic (D-020) and the same vet and type (D-027).
- **Cancel a request.** From a Requested card, after a confirmation. Exits to F-10,
  where the request disappears from reception's list.
- **Move or cancel a confirmed appointment.** The Confirmed card links to F-06, which
  is not built yet.

## States

| State | When | `?state=` |
| --- | --- | --- |
| List, with a Requested, a Not confirmed and a Confirmed card | default | `list` |
| No upcoming appointments | nothing booked | `list-empty` |
| List loading, skeleton cards | first load | `list-loading` |
| List failed, with retry | the read failed | `list-error` |
| Cancel request confirmation | owner taps "Otkaži zahtjev" | `dialog-cancel-request` |
| Push, confirmed | VetDesk confirmed after 15 minutes | `push-confirmed` |
| Push, not confirmed | reception rejected within 15 minutes | `push-rejected` |
| Booking, one pet, defaults filled | default | `book` |
| Booking, several pets, none selected | owner has more than one pet | `book-multi` |
| No pets | the clinic has added none | `book-no-pets` |
| Pet with no usual vet, nothing preselected | new patient, or the vet left | `book-no-usual-vet` |
| Free times loading, skeleton buttons | after choosing a day, vet or type | `book-loading-slots` |
| No free times that day, with "next free day" | the chosen day is full | `book-no-slots-day` |
| No free times in 4 weeks, with the clinic's phone | the vet is fully booked | `book-fully-booked` |
| Free times failed, with retry | the read failed | `book-slots-error` |
| Everything chosen, send enabled | | `book-ready` |
| Sending, button pending | after "Pošalji zahtjev" | `book-sending` |
| Time just taken | VetDesk rejected the write | `book-slot-taken` |
| Send failed, with retry | network or server error | `book-send-error` |
| Emergency notice with call button | type is Hitni slučaj | `book-emergency` |
| Vaccination warning, next due date | type is Cijepljenje and nothing is due | `book-vaccination-not-due` |
| Discard confirmation | closing after a time is chosen | `dialog-discard` |
| Pick another time, prefilled | from a Not confirmed card | `pick-another` |

The Past tab shows an empty note. Past appointments are not part of F-05.

## Long-text behaviour

| Element | Rule | Tested with |
| --- | --- | --- |
| Pet name in the booking pickers | one line, ellipsis | "Gospodin Mrvica od Trešnjevke" at 360 px and 200% text |
| Pet name and type on a card | up to two lines, then clamped | same |
| Vet name | wraps, never truncates | "dr. med. vet. Ana-Marija Kovačević-Horvat", two lines at 360 px |
| Reception's rejection text | three lines, then "Više" shows the rest | a 230-character reason |
| Status badges | wrap inside the card rather than overflow | "Zatraženo, čeka potvrdu klinike" at 200% text |
| Buttons and labels | no fixed widths, room for about 30% longer text | Slovenian follows (D-017) |

## Data shape

`booking`

| Field | Type | Required | Nullable | Values and format | Source |
| --- | --- | --- | --- | --- | --- |
| `id` | string | yes | no | VetDesk appointment id | D-013 |
| `pet_id` | string | yes | no | | D-002 |
| `clinic_id` | string | yes | no | default `pet.usual_clinic_id` | D-002, IA |
| `vet_id` | string | yes | no | default `pet.usual_vet_id`, any vet at the clinic | D-002, D-027 |
| `appointment_type` | enum | yes | no | `check-up`, `vaccination`, `surgery`, `dental`, `emergency`, limited to `clinic.types`. All bookable online | `clinics.csv`, D-027 |
| `slot_start` | datetime | yes | no | ISO 8601 with offset, Europe/Zagreb. Only the start is shown | D-027 |
| `status` | enum | yes | no | `requested`, `not_confirmed`, `confirmed`, `cancelled` | D-019, D-020, D-024, D-027 for `cancelled` |
| `created_at` | datetime | yes | no | reception can reject until `created_at` + 15 minutes | D-024 |
| `reject_reason_code` | enum | when `not_confirmed` | yes | **Unconfirmed placeholders:** `vet_unavailable`, `call_first`, `other` | D-005, D-020, Q-010 |
| `reject_reason_text` | string | no | yes | reception's free text | D-005 |

Also read: `pet.usual_clinic_id` and `pet.usual_vet_id` (nullable), `clinic.types`,
`clinic.phone` (new, the numbers in the prototype are mock), free times per vet, type
and day for 4 weeks (D-027), and the vaccination due list VetDesk returns (D-014).

## Interaction rules

- One pet is preselected. With several pets none is, and the owner picks one.
- Clinic and vet default to the pet's usual ones (D-002). The usual vet is listed
  first, labelled "Vaš veterinar". With no usual vet, nothing is preselected.
- Changing the pet resets clinic and vet to that pet's usual ones and clears type,
  day and time.
- Changing the clinic clears vet, type, day and time, because each clinic has its own
  types. Changing the vet or the type clears the time.
- "Pošalji zahtjev" is disabled until pet, clinic, vet, type, day and time are all set.
  While sending it reads "Šaljem…" and cannot be pressed again.
- On success the owner lands on Termini, scrolled to the top, with the new Requested
  card first and the toast "Zahtjev je poslan".
- If VetDesk rejects the time, "Ovaj termin je upravo zauzet. Odaberite drugi." The
  time is cleared and the free times reload. Everything else is kept.
- If sending fails, the error shows above the button, choices are kept, and the button
  reads "Pokušaj ponovno".
- Type Hitni slučaj shows "Za hitne slučajeve nazovite kliniku" and a call button
  above the send button. The request can still be sent (D-027).
- Type Cijepljenje, when VetDesk returns nothing due but a next due date, shows when
  the next one is due. The request can still be sent. With no date, no warning (D-027).
- "Otkaži zahtjev" asks "Otkazati zahtjev?" and cannot be undone. The card disappears
  and the toast reads "Zahtjev je otkazan" (D-019, D-027).
- Closing the booking after a time is chosen asks "Odbaciti rezervaciju?". Before a
  time is chosen it just closes (D-027).
- A push notification is sent when VetDesk confirms the booking (D-027) and when
  reception rejects it (D-020). Tapping it opens Termini.

## Breakpoints

| Width | What changes |
| --- | --- |
| below 375 px (checked at 360) | three columns of times |
| 375 to 767 px (checked at 390, the design target) | four columns of times |
| 768 px and up | the app sits in a centred 560 px column, five columns of times |
| 200% text (checked at 360) | everything wraps, no sideways scrolling, badges wrap |

Nothing is dropped at any width.

## Decisions

Made in the prototype design session for F-05 on 8 October 2026 and logged as D-027.
To confirm with Marta at the next review.

| Decision | Alternatives considered | Why |
| --- | --- | --- |
| Croatian text throughout, English in the developer panel | English to match the IA | Lumen launches in Croatian only (D-016) |
| Every type the clinic offers is bookable | only check-up, vaccination, dental | the designer's call. No input restricts online booking by type |
| The vet can be changed within the clinic, usual vet first | vet fixed; or changeable only when the usual vet is full | narrows D-002 without locking the owner in |
| Emergency: same flow plus a call notice | no notice; ask Petra first | an owner with a sick animal should not wait 15 minutes unprompted |
| Vaccination: a warning when nothing is due | no check; block the type | Petra's kickoff complaint about the widget, without blocking travel vaccinations |
| Push on confirmation | none; only when the app is closed | every booking ends in a notification |
| Four-week horizon | two weeks; whatever VetDesk returns | covers most planned visits, bounded VetDesk reads (R-2) |
| Cancelling a request keeps the record as `cancelled` | delete it | proposed in the spec so the record is not deleted, confirmed by the designer |
| "Pick another time" also keeps vet and type | only clinic and pet, as D-020 says | proposed in the spec, confirmed by the designer. D-020 does not rule it out |
| Discard confirmation only after a time is chosen | always; never | proposed in the spec, confirmed by the designer |
| Times show the start only | start and end | no input gives appointment length. Proposed, confirmed by the designer |

Components: none added to the design system. The shadcn kit already has Tabs, Alert,
Sonner, Card, Skeleton, Toggle Group and Drawer, and the prototype uses those.

## Open

| # | Question | Owner | Blocks |
| --- | --- | --- | --- |
| Q-010 | Lumen's list of rejection reasons. The prototype uses three placeholders | Marta | F-05, F-10 |
| Q-011 | The Croatian wording. Lumen agreed the strings in English, so ours are translations | Marta | F-05 |
| Q-012 | The main button colour. The brand keeps Coral for calls to action, but white on Coral is about 3:1. The prototype uses Teal | Luka | every feature |

Also for Iva, under R-2: the backend has to detect VetDesk's automatic confirmation
after 15 minutes to send the confirmation push, and read four weeks of free times per
vet, within 60 requests a minute.

## Deferred

- Moving or cancelling a confirmed appointment is F-06. The card's button links there.
- Past appointments are not in F-05.
- Adding a pet is F-12, Future. The no-pets state says the clinic adds pets.
- A language setting comes with Slovenian (D-022).

---
kind: rules
feature: f-07-home
status: draft
decisions: [D-006, D-010, D-014, D-015, D-018, D-031, D-033, D-034]
covers: [states, long-text, data-shape, interaction, breakpoints]
---

# F-07 Home and reminders rules

Fictional client, created for an internal DECODE exercise.

Prototype: `prototype/features/f-07-home/index.html`, version 0.8.0. Every state
opens with `?state=<id>`. `?long=1` loads long content and `?text=200` doubles the
text size. The mock "today" is 20 October 2026.

## Purpose

Marta at kickoff: reminders have to be push notifications and email, because older
owners do not open apps (D-006). Petra: reminders come from the record (D-014). The
IA puts on Home the next appointment, anything due, reception messages and the
renewal card, with one action per card.

## Flows

- **Reminder to Home.** A push opens Home on the card it is about.
- **Home to booking.** "Rezerviraj" on a due card opens F-05 with pet, type and
  clinic. "Rezerviraj termin" on an empty Home opens F-05.
- **Home to change.** "Promijeni ili otkaži" on the next appointment opens F-06.
- **Email to app.** "Otvori u aplikaciji", or the clinic's phone for owners who do not
  use the app.

## States

| State | `?state=` |
| --- | --- |
| Next appointment, two due items, places for F-13 and F-09 | `home` |
| Next appointment still requested | `home-requested` |
| Nothing new | `home-empty` |
| Loading | `home-loading` |
| Failed, retry | `home-error` |
| VetDesk not answering, last saved data | `home-stale` |
| Push: vaccination due in 14 days | `push-vacc-14` |
| Push: vaccination due today | `push-vacc-day` |
| Push: appointment tomorrow | `push-appt` |
| Email: vaccination reminder | `email-vacc` |
| Email: appointment reminder | `email-appt` |

## Long-text behaviour

Pet names, vaccine names, vet names and email text wrap in full. Tested with "Gospodin
Mrvica od Trešnjevke" and a 95-character vaccine name at 360 px and 200% text.
Pet names are never declined ("Rex: …", not "Rexu"), because the app cannot decline
every name correctly.

## Data shape

Home reads the next appointment (F-05, F-06) and what VetDesk returns as due (D-014,
F-04). Reminders are scheduled by the backend:

| Reminder | When | Channel | Stops when | Source |
| --- | --- | --- | --- | --- |
| Vaccination due | **14 days before the due date** (needs future dates, Q-019), and on the due date at 08:00 | push and email | a vaccination appointment is requested or confirmed, or the pet has died. Nothing after the due date | D-034, D-031 |
| Booked appointment | push the day before at 18:00, **email the same day at 07:00, unconfirmed** | push and email | the appointment is cancelled | D-034, Q-020 |

**Quiet hours, unconfirmed:** no push between 21:00 and 08:00. What falls in them waits
until 08:00 (Q-020).

## Interaction rules

- Home, top to bottom: "Dobar dan, <first name>", the next appointment, one card per
  due item with overdue first and calm (D-033), then "Od vaše klinike" (F-13) and the
  renewal card (F-09).
- The next appointment's one action is "Promijeni ili otkaži" (F-06), or "Pogledaj" if
  it is still requested.
- A due card's one action is "Rezerviraj" (F-05).
- Nothing at all: "Nema ništa novo. Kad vašem ljubimcu nešto dospije, vidjet ćete to
  ovdje." with "Rezerviraj termin".
- Each push shows when it would arrive. Tapping it opens Home with that card marked.
- An email has a subject, the reminder, "Otvori u aplikaciji", the clinic's phone and
  "Primate ovu poruku jer ste klijent klinike Lumen." **No unsubscribe link while F-11
  is out of scope, unconfirmed** (Q-020).
- A pet that has died gets no reminders (D-031).

## Breakpoints

Home as F-05: 360, 390 and 768 px and 200% text. The email is checked at 360 px and in
its 600 px column. Nothing scrolls sideways.

## Decisions

Made in the prototype design session for F-07 on 8 October 2026 and logged as D-034.
To confirm with Marta at the next review.

| Decision | Alternatives considered | Why |
| --- | --- | --- |
| Vaccination reminders 14 days before and on the day, none once booked | once when VetDesk returns it; per a VetDesk setting | in time to book, and stops nagging once booked |
| Appointment reminders, the day before | only due items, as the IA; push only | fewer missed appointments, and email reaches older owners. Outside the IA, so Marta confirms |
| Home order, empty Home, push and email content, quiet hours, no unsubscribe link for now | | proposed in the spec, confirmed by the designer |
| Names not declined, the on-the-day reminder at 08:00 | | added in the build, approved by the designer |

Components: none added.

## Open

| # | Question | Owner | Blocks |
| --- | --- | --- | --- |
| Q-019 | Future due dates from VetDesk, which the 14-day reminder needs | Iva | F-04, F-07 |
| Q-020 | Appointment reminders outside the IA, quiet hours, the email time, and an unsubscribe link in reminder emails (GDPR) | Marta | F-07 |

## Deferred

- "Od vaše klinike" is F-13, the renewal card F-09.
- Choosing channels is F-11, Future.

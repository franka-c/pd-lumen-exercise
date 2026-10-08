---
deliverable: 05-information-architecture
project_number: 3
status: in-review
owner: designer
updated: 2026-10-08
depends_on: [01-project-alignment, 03-user-personas]
feeds: [06-feature-prioritization, 07-technical-solution-proposal, 10-development-ready-prototype]
decisions: [D-002, D-004, D-005, D-006, D-009, D-010, D-011, D-012]
figma: https://www.figma.com/file/EXERCISE/lumen-ia-board
figma_checked: 2026-10-01
---

# Information architecture

Fictional client, created for an internal DECODE exercise.

The written mirror of the IA board. Four top-level areas in the owner app and one
reception web view (D-010).

In review after the IA workshop on 8 October. Lumen confirmed the five-area version
on 2 October. The workshop moved repeat prescriptions under the pet (D-009), cut the
app to four areas (D-010) and brought reception messaging into the first version
(D-011, D-012). Where messages sit is open (Q-004), and Luka takes the structure
back to Lumen the week of 12 October. The Figma board still shows five areas.

## Owner app

### Home

The next appointment, anything due (vaccination, check-up, prescription renewal),
and one action per card. Pulls from Appointments and My pets. No content of its own.

A repeat prescription due for renewal shows as a card, for example "Rex's insulin is
due for renewal". One tap opens the request inside the pet's record (D-009).

### Appointments

- Upcoming and past.
- Book: pick the pet, the clinic (defaults to usual), the vet (defaults to usual,
  D-002), the appointment type from the clinic's list, then a slot.
- Move or cancel an upcoming appointment. Cancellation inside 24 hours shows the
  clinic's policy text.
- Status: requested, confirmed, declined with reason (D-005).

### My pets

- One card per pet: name, species, breed, date of birth, usual clinic, usual vet.
- The record: consultations in reverse order, each with date, vet, notes as released
  by the vet, and documents.
- Vaccinations and due dates, read from VetDesk (D-006).
- Repeat prescriptions, inside the pet's record (D-009).
  - Active repeat prescriptions: medicine, dose, last dispensed, next eligible date.
  - Request a renewal. Confirmation shows what the vet will see (D-004).
  - Status per request: requested, approved with collection date, declined with
    reason.
  - History.
- Add a pet is a request to the clinic, not self-service, because the record lives
  in VetDesk.

### Account

Owner details, notification preferences (push, email, D-006), language (Q-003),
sign out. An inbox for reception messages is proposed here, pending Q-004.

## Reception web view

Two lists, Appointment requests and Prescription requests (D-010), filtered to the
clinic the receptionist is signed in to. Each row opens a detail with approve and reject.
Reject requires a reason from a short list plus free text (D-005). Prescription
approvals are for vets; reception sees the queue and can reject on behalf of a vet
only for administrative reasons (owner not registered at this clinic, pet not on
file).

### Reception messages

Reception sends one-way messages to an owner, from a short list of templates plus a
free text field. The owner gets a push notification and sees the message in the app
(D-011). The owner cannot reply in the app (D-012). Proposed placement: a third list,
Messages, on this page, and an inbox under Account in the app. Open, Q-004.

## Out of the structure

Payments, owner-to-vet chat (D-006). Owner replies to reception messages (D-012).

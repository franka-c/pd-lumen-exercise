---
deliverable: 05-information-architecture
project_number: 3
status: confirmed
owner: designer
updated: 2026-10-01
confirmed_with_client: 2026-10-02
depends_on: [01-project-alignment, 03-user-personas]
feeds: [06-feature-prioritization, 07-technical-solution-proposal, 10-development-ready-prototype]
decisions: [D-002, D-003, D-004, D-005, D-006, D-008]
figma: https://www.figma.com/file/EXERCISE/lumen-ia-board
figma_checked: 2026-10-01
---

# Information architecture

Fictional client, created for an internal DECODE exercise.

The written mirror of the IA board. Five top-level areas in the owner app and one
reception web view (D-008).

## Owner app

### Home

The next appointment, anything due (vaccination, check-up, prescription renewal),
and one action per card. Pulls from Appointments, My pets and Prescriptions. No
content of its own.

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
- Add a pet is a request to the clinic, not self-service, because the record lives
  in VetDesk.

### Prescriptions

Top-level area (D-003).

- Active repeat prescriptions per pet: medicine, dose, last dispensed, next eligible
  date.
- Request a renewal. Confirmation shows what the vet will see (D-004).
- Status per request: requested, approved with collection date, declined with
  reason.
- History.

### Account

Owner details, notification preferences (push, email, D-006), language (Q-003),
sign out.

## Reception web view

Two lists, Appointment requests and Prescription requests, filtered to the clinic
the receptionist is signed in to. Each row opens a detail with approve and reject.
Reject requires a reason from a short list plus free text (D-005). Prescription
approvals are for vets; reception sees the queue and can reject on behalf of a vet
only for administrative reasons (owner not registered at this clinic, pet not on
file).

## Out of the structure

Payments, owner-to-vet chat (D-006). Reception-to-owner messaging, parked at kickoff.

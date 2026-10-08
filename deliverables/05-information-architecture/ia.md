---
deliverable: 05-information-architecture
project_number: 3
status: confirmed
owner: designer
updated: 2026-10-08
confirmed_with_client: 2026-10-15
depends_on: [01-project-alignment, 03-user-personas]
feeds: [06-feature-prioritization, 07-technical-solution-proposal, 10-development-ready-prototype]
decisions: [D-002, D-004, D-005, D-006, D-009, D-010, D-011, D-012, D-014, D-015, D-016, D-017, D-018, D-019, D-020, D-022, D-023, D-024, D-025, D-026]
figma: https://www.figma.com/file/EXERCISE/lumen-ia-board
figma_checked: 2026-10-01
---

# Information architecture

Fictional client, created for an internal DECODE exercise.

The written mirror of the IA board. Four top-level areas in the owner app and one
reception web view (D-010).

Confirmed with Lumen on 15 October (D-026). Marta: "Yes. Confirmed. Start the
prototype." Petra confirmed from her side. Lumen had confirmed a five-area version on
2 October. The IA workshop on 8 October moved repeat prescriptions under the pet
(D-009), cut the app to four areas (D-010) and brought reception messaging into the
first version (D-011, D-012). Lumen then placed messages on Home (D-018) and gave
reception a third list to send them from (D-025).

## Owner app

Croatian only at launch (D-016). Every screen leaves room for the longer Slovenian
strings that follow in the next release (D-017).

### Home

The next appointment, anything due, reception messages, and one action per card.
Due items pull from Appointments and My pets. Messages are the only content Home
holds of its own (D-018).

- Due items are the reminders VetDesk returns as due for each pet: type, due date
  and clinic. The app calculates none itself (D-014).
- A repeat prescription due for renewal shows as a card, for example "Rex's insulin
  is due for renewal". One tap opens the request inside the pet's record (D-009).
- **From your clinic.** Reception messages, newest first. A message about a pet or
  an appointment links to it. A push notification opens the message directly. No
  reply (D-012, D-018).

### Appointments

- Upcoming and past.
- Book: pick the pet, the clinic (defaults to usual), the vet (defaults to usual,
  D-002), the appointment type from the clinic's list, then a slot.
- Move or cancel a confirmed upcoming appointment. Cancellation inside 24 hours
  shows the clinic's policy text.
- Status per booking (D-005, confirmed by Lumen in D-023):
  - **Requested.** The card reads "Requested, waiting for the clinic", with date,
    time and pet. The owner can cancel the request but not change it (D-019).
    Reception has 15 minutes to reject it (D-024).
  - **Not confirmed.** Reception rejected it within the 15 minutes. Push
    notification. The card shows "Not confirmed" with the reason reception picked,
    and "Pick another time" opens booking at the same clinic with the same pet
    selected (D-020).
  - **Confirmed.** After 15 minutes without a rejection, VetDesk confirms the
    booking, and the owner sees it as confirmed (D-024). There is no 24-hour
    pending state.

### My pets

- One card per pet: name, species, breed, date of birth, usual clinic, usual vet.
- The record: consultations in reverse order, each with date, vet, notes as released
  by the vet, and documents.
- Vaccinations and due dates, as VetDesk returns them (D-006, D-014).
- Repeat prescriptions, inside the pet's record (D-009).
  - Active repeat prescriptions: medicine, dose, last dispensed, next eligible date.
  - Request a renewal. Confirmation shows what the vet will see (D-004).
  - Status per request: requested, approved with collection date, declined with
    reason.
  - History.
- Add a pet is a request to the clinic, not self-service, because the record lives
  in VetDesk.

### Account

Owner details, notification preferences (push, email, D-006), sign out. No language
setting at launch. It goes here when Slovenian comes (D-016, D-022).
No reminder settings: reminder rules are managed only in VetDesk (D-015).

## Reception web view

Three lists, Appointment requests, Prescription requests and Messages (D-010, D-025),
filtered to the clinic the receptionist is signed in to. Each request opens a detail
with approve and reject. An appointment request can be rejected for 15 minutes, after
which VetDesk confirms it (D-024).
Reject requires a reason from a short list plus free text (D-005). Prescription
approvals are for vets; reception sees the queue and can reject on behalf of a vet
only for administrative reasons (owner not registered at this clinic, pet not on
file).

### Reception messages

Reception sends one-way messages to an owner, from a short list of templates plus a
free text field. The owner gets a push notification and sees the message on Home
(D-011, D-018). The owner cannot reply in the app (D-012). Reception sends from the
Messages list, which also shows what it has sent (D-025).

## Out of the structure

Payments, owner-to-vet chat (D-006). Owner replies to reception messages (D-012).
An inbox under Account (D-018). Editing reminder rules (D-015).

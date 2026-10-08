# Decisions

Numbered and append-only. A decision is never edited. When it changes, add a new
one that names the decision it supersedes. The history of the thinking is worth
as much as the current answer.

Every deliverable cites the decisions it rests on, in its front-matter.

---

## D-001

**Decision.** The first version is a pet owner app for companion animals. Farm
clients are out of scope.

**Why.** Farm clients are a different business with different workflows. Petra and
Marta both said so.

**Source.** `log/calls/2026-09-21-kickoff.md`, said by Petra, confirmed by Marta.

**Supersedes.** None.

## D-002

**Decision.** Owners book and move appointments in the app, with the vet they
usually see, at their usual clinic.

**Why.** The VetDesk widget failed because it offered every vet at every clinic.
Knowing the pet and the usual vet is the whole point.

**Source.** `log/calls/2026-09-21-kickoff.md`, said by Marta.

**Supersedes.** None.

## D-003

**Decision.** Repeat prescriptions are a module of their own in the app, separate
from the pet's record.

**Why.** Marta wants them prominent because they drive call volume. Petra accepted,
on the condition in D-004.

**Source.** `log/calls/2026-09-21-kickoff.md`, said by Marta.

**Supersedes.** None.

## D-004

**Decision.** Every repeat prescription request is approved by a vet before anything
is dispensed, and the approval screen shows the last consultation and the last
dispensed date.

**Why.** A repeat prescription is a medical decision. Petra's veto.

**Source.** `log/calls/2026-09-21-kickoff.md`, said by Petra.

**Supersedes.** None.

## D-005

**Decision.** Reception uses a browser page, not an installed app, to approve or
reject requests, with a reason on rejection.

**Why.** Reception will not install anything. One shared computer per desk.

**Source.** `log/calls/2026-09-21-kickoff.md`, said by Marta.

**Supersedes.** None.

## D-006

**Decision.** Reminders come from due dates already in VetDesk, and go out as push
notifications and email. No payments and no owner-to-vet chat in the first version.

**Why.** Due dates exist in the record already. Older owners read email, not apps.
Payments stay at the clinic. Chat would drown the vets.

**Source.** `log/calls/2026-09-21-kickoff.md`, said by Petra and Marta.

**Supersedes.** None.

## D-007

**Decision.** DECODE builds the design foundations (components, spacing, iconography)
during the discovery, from the Lumen brand guidelines, and it is in scope.

**Why.** The guidelines cover print and the website only. A prototype needs more.

**Source.** `deliverables/01-project-alignment/alignment.md`, confirmed by Marta on
25 September 2026.

**Supersedes.** None.

## D-008

**Decision.** The app has five top-level areas: Home, Appointments, My pets,
Prescriptions, Account. The reception page is a separate web view with two lists,
Appointment requests and Prescription requests.

**Why.** Each area maps to one of the owner jobs from the kickoff. Prescriptions is
top level because of D-003.

**Source.** `log/calls/2026-09-30-ia-review.md`, agreed by Marta and Petra.

**Supersedes.** None.

## D-009

**Decision.** Repeat prescriptions live inside the pet's record, with a renewal card
on Home.

**Why.** Both owners in the test looked for the repeat prescription under the pet.
The card on Home keeps the prominence Marta wanted because of call volume.

**Source.** `log/calls/2026-10-08-ia-workshop.md`, said by Marta.

**Supersedes.** D-003.

## D-010

**Decision.** The app has four top-level areas: Home, Appointments, My pets,
Account. The reception page keeps its two lists, Appointment requests and
Prescription requests, until Q-004 is settled.

**Why.** Prescriptions moved under the pet (D-009), so the fifth area is no longer
needed.

**Source.** `log/calls/2026-10-08-ia-workshop.md`, proposed by Luka, agreed by Marta
and Petra.

**Supersedes.** D-008.

## D-011

**Decision.** Reception can send one-way messages to owners in the first version,
from a short list of templates plus a free text field. The owner gets a push
notification and sees the message in the app.

**Why.** Forty calls a day at Trešnjevka are reception telling an owner something,
not booking. Both receptionists in the test asked for it unprompted.

**Source.** `log/calls/2026-10-08-ia-workshop.md`, said by Marta.

**Supersedes.** None. Reception messaging was parked at kickoff, not decided.

## D-012

**Decision.** Owners cannot reply to reception messages in the app.

**Why.** Two-way messaging is chat, which D-006 keeps out of the first version.
Petra's veto.

**Source.** `log/calls/2026-10-08-ia-workshop.md`, said by Petra.

**Supersedes.** None.

## D-013

**Decision.** VetDesk accepts appointment writes through the partner API, so the
technical proposal uses Design A. Prescriptions stay read-only in VetDesk, so the
prescription approval flow stays on our side.

**Why.** VetDesk support confirmed to Tomislav that the partner API creates and
updates appointments under a key issued per practice group, and that Lumen qualifies
as one group. The same call confirmed that prescriptions can only be read, so the
approval flow D-004 requires cannot live in VetDesk.

**Not decided here.** Tomislav's email says the approval outcome "has to" be written
back as a note on the record. That is the requirement we have, not a capability
VetDesk confirmed. Whether the partner API writes notes is Q-006. The rate limit of
60 requests per minute for one key across all 14 clinics, against 07's two-minute
availability rule, is open as well. It is R-2 in the 01 risk register and Iva sizes
it.

**Source.** `client/2026-10-08-vetdesk-api-answer/email.md`, email from Tomislav
Jurić to Iva Marić, 8 October 2026. Closes Q-001.

**Supersedes.** None.

## D-014

**Decision.** The app shows the reminders VetDesk returns as due for each pet, and
calculates none itself.

**Why.** The reminder rules live in VetDesk and the partner API does not expose them.
It returns the result instead: for each pet, the reminders that are due, with the
type, the due date and the clinic, on a read-only endpoint. This is how D-006 works
in practice.

**Source.** `client/2026-10-09-vetdesk-reminders/email.md`, email from Tomislav Jurić
to Iva Marić, dated 9 October 2026. Closes Q-002.

**Supersedes.** None.

## D-015

**Decision.** Reminder rules are managed only in VetDesk, by reception. Neither the
app nor the reception web view edits them.

**Why.** Reception sets the rules per species and per vaccine in VetDesk, and the app
picks up a change on its next read.

**Source.** `client/2026-10-09-vetdesk-reminders/email.md`, email from Tomislav Jurić
to Iva Marić, dated 9 October 2026.

**Supersedes.** None.

## D-016

**Decision.** Lumen launches in Croatian only. Slovenian comes in the release after.

**Why.** Marta ties Slovenian to the Ljubljana clinic being on VetDesk. Whether a
clinic is not on VetDesk yet is Q-007.

**Source.** `client/2026-10-13-language-and-messages/email.md`, email from Marta Kos,
dated 13 October 2026. Closes Q-003.

**Supersedes.** None.

## D-017

**Decision.** Screens are designed so Slovenian text fits later without redesign.

**Why.** Slovenian follows in the next release (D-016), and Lumen does not want the
screens redone for it.

**Source.** `client/2026-10-13-language-and-messages/email.md`, email from Marta Kos,
dated 13 October 2026.

**Supersedes.** None.

## D-018

**Decision.** Reception messages sit on Home in a "From your clinic" list, newest
first, with no new tab. A message about a pet or an appointment links to it, and a
push notification opens the message directly.

**Why.** Luka walked Lumen through the options and Marta chose his second option.
Petra agrees as long as owners still cannot reply (D-012).

**Not decided here.** Where reception sends messages from on the reception web view.
That is Q-008.

**Source.** `client/2026-10-13-language-and-messages/email.md`, email from Marta Kos,
dated 13 October 2026. Closes Q-004 for the owner app.

**Supersedes.** None.

## D-019

**Decision.** While a booking waits for reception, the appointment card shows
"Requested, waiting for the clinic", with the date, time and pet. The owner can cancel
the request but not change it.

**Why.** It answers the first half of Q-005: what the owner sees while the request is
pending.

**Source.** `research/booking-pending-state/notes.md`, team decision by Luka, dated 14
October 2026. The note records it as accepted by Iva. To confirm with Marta at the next
review.

**Supersedes.** None.

## D-020

**Decision.** When reception rejects a request, the owner gets a push notification.
The card shows "Not confirmed" with the reason reception picked, and "Pick another
time" opens booking at the same clinic with the same pet selected.

**Why.** It answers the second half of Q-005: what happens when reception rejects the
request. The reason comes from the list D-005 gives reception.

**Source.** `research/booking-pending-state/notes.md`, team decision by Luka, dated 14
October 2026. The note records it as accepted by Iva. To confirm with Marta at the next
review. With D-019, closes Q-005.

**Supersedes.** None.

## D-021

**Decision.** A request reception has not answered in 24 hours stays pending, and the
card adds "The clinic will call you". It is never cancelled automatically.

**Why.** The note gives no reason beyond not cancelling a request the owner made.

**Not decided here.** VetDesk confirms a pending write by itself after 15 minutes if
the slot is still free (D-013). How a request can stay pending for 24 hours under that
is Q-009.

**Source.** `research/booking-pending-state/notes.md`, team decision by Luka, dated 14
October 2026. The note records it as accepted by Iva. To confirm with Marta at the next
review.

**Supersedes.** None.

## D-022

**Decision.** There is no language setting at launch. It goes in Account when
Slovenian comes.

**Why.** Lumen launches in Croatian only (D-016), so there is nothing to switch.

**Source.** `log/calls/2026-10-15-ia-review.md`, said by Marta.

**Supersedes.** None.

## D-023

**Decision.** Lumen confirms the booking states in D-019 and D-020: the requested card,
and what the owner sees when reception rejects a request.

**Why.** Both were the team's own decisions, waiting for Marta.

**Source.** `log/calls/2026-10-15-ia-review.md`, said by Marta.

**Supersedes.** None.

## D-024

**Decision.** Reception has 15 minutes to reject a booking request. After that VetDesk
confirms it, and the owner sees it as confirmed. There is no 24-hour pending state.

**Why.** VetDesk confirms a pending write by itself after 15 minutes if the slot is
still free (D-013), so a request cannot stay pending for 24 hours. Booking is not
clinical, so Petra raises no veto.

**Source.** `log/calls/2026-10-15-ia-review.md`, said by Marta, with Tomislav. Closes
Q-009.

**Supersedes.** D-021.

## D-025

**Decision.** Reception sends messages from a third list, Messages, next to Appointment
requests and Prescription requests, and sees there what it has sent.

**Why.** It settles the reception half of Q-004, and the two lists D-010 kept until
then.

**Source.** `log/calls/2026-10-15-ia-review.md`, said by Marta. Closes Q-008.

**Supersedes.** None.

## D-026

**Decision.** Lumen confirms the IA as shown on 15 October: four areas in the owner
app, and the reception web view with three lists. The prototype starts.

**Why.** Marta: "Yes. Confirmed. Start the prototype." Petra confirmed from her side.

**Source.** `log/calls/2026-10-15-ia-review.md`, said by Marta and Petra.

**Supersedes.** None.

## D-027

**Decision.** F-05 booking behaves as follows, beyond D-002 and D-019 to D-024:

- Owners can book every appointment type their clinic offers, including surgery
  and emergency.
- The vet defaults to the pet's usual vet and can be changed to any vet at the
  selected clinic. The usual vet is listed first. A pet with no usual vet gets no
  preselection.
- Choosing an emergency shows "call the clinic" with the clinic's phone number. The
  request can still be sent.
- Choosing a vaccination when VetDesk returns nothing due shows the next due date.
  The request can still be sent.
- The owner gets a push notification when VetDesk confirms the booking, as well as
  when reception rejects it (D-020).
- Owners see and book free times up to four weeks ahead.
- A cancelled request is kept as `cancelled`, not deleted. "Pick another time" also
  keeps the vet and type. Closing the booking after a time is chosen asks first. Times
  show the start only.
- The app's text is in Croatian.

**Why.** None of the inputs settled these, and the prototype cannot be built without
them. The emergency notice and the vaccination warning answer Petra's kickoff
complaint that the VetDesk widget could not see the pet's record, without blocking
an owner who has a reason the app cannot know.

**Source.** `prototype/rules/f-05-booking.md`, prototype design session for F-05, 8
October 2026, decided by Antonija (design). To confirm with Marta at the next review.
The emergency notice touches a clinical case, so Petra should see it too.

**Supersedes.** None.

## D-028

**Decision.** F-06, moving or cancelling a confirmed appointment, behaves as follows:

- A move is a request. The old appointment stands until VetDesk confirms the new
  time. If reception rejects the move within 15 minutes, the old time stays and the
  owner gets a push notification with the reason.
- A cancellation is a request too. It completes after 15 minutes unless reception
  rejects it, for example a late cancellation under the policy. The owner gets a
  push notification either way.
- Cancelling within 24 hours of the start shows one Lumen-wide policy text. Moving
  does not, as the IA says.
- No changes in the app from 15 minutes before the start. The card shows the
  clinic's phone number instead.
- A move changes only the day and time. While a move is pending the owner can only
  withdraw it, which is immediate. While a cancellation is pending the owner can do
  nothing.

**Why.** The IA says only that owners move or cancel a confirmed appointment and that
cancelling within 24 hours shows the policy. VetDesk puts every write into a pending
state for 15 minutes (D-013), so each change needed an answer for that window. The
owner never loses a slot to a rejected move, and every request settles before the
appointment starts.

**Not decided here.** Whether VetDesk can hold the old slot while a move is pending,
and whether a pending cancellation completes by itself, is Q-013. The policy text is
Q-014.

**Source.** `prototype/rules/f-06-move-cancel.md`, prototype design session for F-06,
8 October 2026, decided by Antonija (design). To confirm with Marta at the next review.

**Supersedes.** None.

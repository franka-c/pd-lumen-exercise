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

## D-029

**Decision.** F-10, the reception web view, behaves as follows:

- Reception and vets use the same web view, each with their own sign-in. Vets see
  only prescription requests.
- "Odobri" on an appointment request, move or cancellation confirms it at once, and
  the owner gets a push notification.
- A request reception does not answer within 15 minutes is confirmed by VetDesk and
  stays in the list, grey, marked "Potvrđeno automatski", until reception removes it.
- The vet sets the pickup date when approving a repeat prescription. The default is
  today, and it cannot be in the past.

**Why.** The IA gives each request approve and reject, and D-004 has a vet approve
every prescription, but neither says how the vet reaches it, what approve means when
VetDesk confirms by itself after 15 minutes, or who sets the pickup date the owner
sees. Own sign-ins show who approved a medicine. Approving at once spares the owner a
wait for a decision already made.

**Not decided here.** Whether our backend can confirm a pending VetDesk write early is
part of Q-013. Sign-in and accounts are Q-015.

**Source.** `prototype/rules/f-10-reception.md`, prototype design session for F-10,
8 October 2026, decided by Antonija (design). To confirm with Marta and Petra at the
next review.

**Supersedes.** None.

## D-030

**Decision.** F-01, owner sign-in, works as follows:

- The invitation link opens the app, and the owner sets a password. Afterwards they
  sign in with their email address or phone number and the password.
- A forgotten password is reset by a link to the email address or a code by SMS to
  the phone number, whichever the owner signs in with.
- An owner without an invitation can request one in the app with an email address or
  phone number. The reply is always the same, so the app never reveals who is a
  client.
- One account per person, across clinics.

**Why.** 06 has the clinic invite owners by email or SMS from the VetDesk owner
record, but nothing says how they sign in afterwards. A password is familiar to
owners. Signing in with a phone number keeps owners with no email address in the
app (A-2).

**Not decided here.** The password rule, how long an invitation and a password link
are valid, and the attempt limit are Q-016.

**Source.** `prototype/rules/f-01-sign-in.md`, prototype design session for F-01, 8
October 2026, decided by Antonija (design). To confirm with Marta at the next review.

**Supersedes.** None.

## D-031

**Decision.** F-02, my pets, works as follows:

- A pet VetDesk marks as having died moves to a separate "Preminuli" section at the
  end of the list. It has no booking, reminders, prescriptions or notifications, and
  its record is read only.
- The owner can add a photo of each pet from the camera or gallery. Until then the
  pet's first letter shows. The photo is held by the app, not VetDesk.

**Why.** Nothing in the IA covers pets that have died, and showing one as alive would
send reminders for it. The brand guidelines ask for real photos of pets, and VetDesk
is not known to hold any.

**Not decided here.** Whether VetDesk marks a pet that has died, how photos are
stored, and whether "Preminuli" is the right word are Q-017.

**Source.** `prototype/rules/f-02-pets.md`, prototype design session for F-02, 8
October 2026, decided by Antonija (design). To confirm with Marta and Petra at the
next review.

**Supersedes.** None.

## D-032

**Decision.** In F-03, the pet's record, the owner sees only the consultation notes and
documents the vet marked as visible to the owner. A consultation with nothing marked
shows its date, type and vet, and says the notes are not available in the app.

**Why.** The IA says "notes as released by the vet". Applying the same marker to
documents means an owner never reads a lab result before the vet can explain it.
Reception announces results with a message (F-13).

**Not decided here.** Whether VetDesk has such a marker and returns it is Q-018.

**Source.** `prototype/rules/f-03-record.md`, prototype design session for F-03, 8
October 2026, decided by Antonija (design). To confirm with Marta and Petra at the
next review.

**Supersedes.** None.

## D-033

**Decision.** In F-04, vaccinations, an overdue vaccination is listed first, with
"Dospjelo" and its date in the normal text colour, and a booking button. No red, no
warning.

**Why.** The brand's tone is calm, with no exclamation marks, and the owner should
not feel scolded. Listing it first keeps it from being missed.

**Source.** `prototype/rules/f-04-vaccinations.md`, prototype design session for F-04,
8 October 2026, decided by Antonija (design). To confirm with Petra at the next
review.

**Supersedes.** None.

## D-034

**Decision.** F-07 sends reminders as follows, by push notification and email:

- A vaccination VetDesk returns as due: 14 days before the due date, and again on the
  due date if nothing is booked. No reminder once a vaccination appointment is
  requested or confirmed, and none after the due date.
- A booked appointment: a push the day before at 18:00 and an email on the morning of
  the appointment.

**Why.** D-006 sets the channels and D-014 the source, but not when reminders go out.
Fourteen days leaves time to book. Stopping once booked avoids nagging. Appointment
reminders cut missed appointments, and the email reaches owners who do not open the
app.

**Not decided here.** Appointment reminders go beyond the IA, which names only due
items, so Marta confirms them. Quiet hours, the email time and an unsubscribe link
are Q-020. The 14-day reminder needs future due dates from VetDesk (Q-019).

**Source.** `prototype/rules/f-07-home.md`, prototype design session for F-07, 8
October 2026, decided by Antonija (design). To confirm with Marta at the next review.

**Supersedes.** None.

## D-035

**Decision.** In F-08 and F-09, repeat prescriptions:

- The owner can request a renewal from 7 days before the prescription's next eligible
  date. Before that the button is disabled and says from when.
- The owner can add a one-way note to the vet, up to 300 characters. The vet sees it
  in F-10 and cannot reply to it.

**Why.** The IA gives a next eligible date but not whether it limits requests. A week
ahead means an owner of a diabetic or epileptic pet never runs out while waiting for
approval, without stockpiling. The note lets the vet learn what changed, without the
owner-to-vet chat D-006 rules out.

**Not decided here.** Where the next eligible date comes from, the 7 days and whether
the note is acceptable are Q-021.

**Source.** `prototype/rules/f-08-f-09-prescriptions.md`, prototype design session for
F-08 and F-09, 8 October 2026, decided by Antonija (design). To confirm with Petra at
the next review.

**Supersedes.** None.

## D-036

**Decision.** F-13, reception messages, works as follows:

- Reception picks the owner by searching name, pet or phone in the Messages list, or
  sends from a request's detail in F-10 with owner and pet chosen.
- Reception sees each message's status: sent, and read with the time. A message
  unread after 24 hours suggests a call.
- An owner without the app gets the message by email, if the clinic has one.
  Reception sees "Šalje se e-mailom" before sending, and there is no read status. An
  owner with neither cannot be messaged, and reception is told to call.

**Why.** D-011, D-018 and D-025 set the channel, the place and the list, but not how
reception picks a recipient or whether it knows a message arrived. Reading status
tells Sanja when to call after all. Email keeps the message from vanishing for owners
who never activate the app.

**Not decided here.** Email extends D-011, so Marta confirms it. The two extra
templates, the 500-character limit, the 24 hours and read receipts in the privacy
notice are Q-022.

**Source.** `prototype/rules/f-13-messages.md`, prototype design session for F-13, 8
October 2026, decided by Antonija (design). To confirm with Marta at the next review.

**Supersedes.** None.

## D-037

**Decision.** Home uses the "Ljubimci na vrhu" layout: a row of pet photos with a ring
on any pet that needs something, filtering Home by pet; a Lumen Teal card for the next
appointment with a countdown; then "Treba napraviti" and "Od vaše klinike". The
prototype also gets a connected version, `prototype/flow/`, where the owner, reception
and the vet share one state.

**Why.** The owner thinks of their pet first, and the ring shows at a glance which pet
needs something. The connected prototype shows the client how the features work
together, while the feature pages stay the specification developers build from.

**Source.** `prototype/rules/f-07-home.md`, prototype design session, 8 October 2026,
decided by Antonija (design). The alternatives were a timeline and a summary sentence
with swipeable cards. To show Marta at the next review. It changes how Home looks, not
when reminders go out.

**Supersedes.** None.

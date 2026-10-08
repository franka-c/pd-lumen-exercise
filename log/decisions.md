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

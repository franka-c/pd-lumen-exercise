---
kind: material
topic: vetdesk-api-answer
added_by: stella
added: 2026-10-08
source: email from Tomislav Jurić to Iva Marić, 8 October 2026, after his call with VetDesk support. Partner API documentation in Drive (Lumen / VetDesk / partner-api-v3.pdf)
status: worked-in
feeds: [07-technical-solution-proposal]
---

Fictional client, created for an internal DECODE exercise.

VetDesk support's answer to Q-001, the question the technical proposal has carried
two designs for since kickoff. The partner API accepts appointment writes, so Design
A ships. Prescriptions can only be read, so the approval flow stays on our side.

Worked into `log/decisions.md` as D-013. The email is in `email.md`. The
documentation PDF stays in Drive.

Three constraints in the email that the technical proposal still has to absorb: a
partner key issued per practice group, a rate limit of 60 requests per minute per
key, and a pending state on every write until a staff member confirms it or 15
minutes pass with the slot still free.

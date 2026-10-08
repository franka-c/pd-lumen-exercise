---
kind: material
topic: vetdesk-api-answer
added_by: stella
added: 2026-10-08
source: email from Tomislav Jurić to Iva Marić, 8 October 2026, after his call with VetDesk support. Partner API documentation in Drive (Lumen / VetDesk / partner-api-v3.pdf)
status: raw
feeds: [07-technical-solution-proposal]
---

Fictional client, created for an internal DECODE exercise.

VetDesk support's answer to Q-001, the question the technical proposal has carried
two designs for since kickoff. The partner API accepts appointment writes, so Design
A ships. Prescriptions can only be read, so the approval flow stays on our side.

The decision is in `log/decisions.md` as D-013. The email is in `email.md`. The
documentation PDF stays in Drive.

It stays `raw` because this material feeds 07, and 07 has not absorbed it. The
integration chapter still carries both designs, and the three constraints below are
not in it. Flip this to `worked-in` in the pull request that rewrites 07.

Three constraints the technical proposal has to absorb: a partner key issued per
practice group, a rate limit of 60 requests per minute per key, and a pending state
on every write until a staff member confirms it or 15 minutes pass with the slot
still free.

The rate limit is one key for all 14 clinics, and 07 promises availability no older
than two minutes under Design A. Iva sizes the two against each other. This is R-2
in the 01 risk register.

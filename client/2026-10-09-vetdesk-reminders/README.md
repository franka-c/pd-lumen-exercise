---
kind: material
topic: vetdesk-reminders
added_by: franka
added: 2026-10-08
source: email from Tomislav Jurić to Iva Marić, dated 9 October 2026, reply on reminder rules in VetDesk
status: raw
feeds: [05-information-architecture, 07-technical-solution-proposal]
---

Fictional client, created for an internal DECODE exercise.

Tomislav's answer to Q-002. The reminder rules live in VetDesk, set by reception per
species and per vaccine, and the partner API does not expose them. It exposes the
result instead: for each pet, the reminders that are due, with the type, the due
date and the clinic, on a read-only endpoint. The email is in `email.md`.

It feeds 05, which shows what is due on Home and in the pet's record, and 07, which
reads the reminders from VetDesk.

It stays `raw` until 07 describes the reminders endpoint. Flip it to `worked-in` in
the pull request that does.

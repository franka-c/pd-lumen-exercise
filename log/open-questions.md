# Open questions

Every question has an owner and names what it blocks. Closed questions move to
`log/decisions.md` as a numbered decision, they are not deleted.

| # | Question | Owner | Blocks | Raised | Status |
| --- | --- | --- | --- | --- | --- |
| Q-001 | Does the VetDesk partner API allow writing appointments, or only reading? | Tomislav | 07 | 2026-09-21 | closed 2026-10-08 by D-013, writes are allowed and the proposal uses Design A |
| Q-002 | Which reminder rules (vaccination intervals, check-up cadence) live in VetDesk, and can we read them? | Iva | 05, 07 | 2026-09-21 | closed 2026-10-08 by D-014, the app shows what VetDesk returns as due |
| Q-003 | Does Lumen want Slovenian and Croatian at launch, or one language first? | Marta | 05 | 2026-09-30 | closed 2026-10-08 by D-016, Croatian at launch, Slovenian in the release after |
| Q-004 | Where do reception messages sit: a third Messages list on the reception page, and an inbox under Account in the app? | Luka | 05 | 2026-10-08 | closed 2026-10-08 by D-018 for the owner app, messages on Home. The reception web view is Q-008 |
| Q-005 | What does the owner see while a booking is pending for up to 15 minutes, and what happens if reception rejects it in that window? | Luka | 05, 10 | 2026-10-08 | closed 2026-10-08 by D-019 and D-020, to confirm with Marta. How it fits VetDesk's 15-minute confirmation is Q-009 |
| Q-006 | Does the VetDesk partner API allow writing a note on the record, which the prescription approval outcome depends on? | Iva | 07 | 2026-10-08 | open, check partner-api-v3.pdf or the sandbox key due next week |
| Q-007 | Is a Lumen clinic not on VetDesk yet? Marta ties Slovenian to "the Ljubljana clinic" being on VetDesk, and 01 says all 14 clinics run it. | Tomislav | 01, 07 | 2026-10-08 | open, raised by D-016 |
| Q-008 | Where does reception send messages from on the reception web view: a third Messages list, or elsewhere? | Luka | 05 | 2026-10-08 | closed 2026-10-08 by D-025, a third Messages list |
| Q-009 | How does a request that stays pending for 24 hours (D-021) fit VetDesk confirming a pending write by itself after 15 minutes (D-013)? | Iva | 07, 10 | 2026-10-08 | closed 2026-10-08 by D-024, reception has 15 minutes, then VetDesk confirms |
| Q-010 | What reasons can reception pick when it rejects an appointment request, a move or a cancellation (D-005, D-028)? The prototype uses placeholders. | Marta | 10 | 2026-10-08 | open, raised by F-05, widened by F-06 |
| Q-011 | Does Lumen accept the Croatian wording in the prototype? Lumen agreed the booking strings in English (D-019, D-020). | Marta | 10 | 2026-10-08 | open, raised by F-05 |
| Q-012 | Which colour is the main button: Coral, which the brand keeps for calls to action but fails contrast with white text (about 3:1), or Teal? | Luka | 10 | 2026-10-08 | open, the prototype uses Teal |
| Q-013 | Can VetDesk hold the old slot while a move is pending, does a pending cancellation complete by itself after 15 minutes, and can our backend confirm a pending write early? D-028 and D-029 depend on these. | Iva | 07, 10 | 2026-10-08 | open, raised by F-06, widened by F-10 |
| Q-014 | What does Lumen's cancellation policy say? The prototype shows a placeholder when cancelling within 24 hours. | Marta | 10 | 2026-10-08 | open, raised by F-06 |
| Q-015 | How do reception and vets sign in to the reception web view, and who creates their accounts? D-029 gives each their own sign-in. | Iva | 07, 10 | 2026-10-08 | open, raised by F-10 |
| Q-016 | What are the password rule, invitation validity, password link validity and attempt limit for owner sign-in, and does every owner have an email or phone number at the clinic (A-2)? The prototype uses 8 characters, 7 days, 1 hour, and 5 attempts then 15 minutes. | Marta, Iva | 10 | 2026-10-08 | open, raised by F-01 |
| Q-017 | Does the VetDesk API mark a pet that has died, where are owner photos of pets stored and how large may they be, and is "Preminuli" the right word for owners? D-031 depends on these. | Iva, Petra | 10 | 2026-10-08 | open, raised by F-02 |
| Q-018 | Does VetDesk mark consultation notes and documents as visible to the owner, and does the partner API return that marker? D-032 depends on it, and Petra should confirm the rule. | Iva, Petra | 10 | 2026-10-08 | open, raised by F-03 |
| Q-019 | Does the VetDesk reminders endpoint return only what is due now, or also the next due dates ahead? F-04 shows both and F-05's vaccination warning needs the next date. | Iva | 10 | 2026-10-08 | open, raised by F-04 |
| Q-020 | Does Lumen want appointment reminders (outside the IA), quiet hours from 21:00 to 08:00, the reminder email at 07:00, and an unsubscribe link in reminder emails while notification preferences (F-11) are out of scope? | Marta | 10 | 2026-10-08 | open, raised by F-07 |
| Q-021 | Does VetDesk return a prescription's next eligible date, or must it be calculated from the last dispensed date and quantity? And does Petra accept requests from 7 days before it, and a one-way owner note to the vet (D-035)? | Iva, Petra | 10 | 2026-10-08 | open, raised by F-08 and F-09 |

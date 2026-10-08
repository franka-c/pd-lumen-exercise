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

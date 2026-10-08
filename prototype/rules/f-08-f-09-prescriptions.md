---
kind: rules
feature: f-08-f-09-prescriptions
status: draft
decisions: [D-004, D-006, D-009, D-013, D-029, D-031, D-035]
covers: [states, long-text, data-shape, interaction, breakpoints]
---

# F-08 and F-09 repeat prescription rules

Fictional client, created for an internal DECODE exercise.

Prototype: `prototype/features/f-08-f-09-prescriptions/index.html`, version 0.9.0.
Every state opens with `?state=<id>`. `?long=1` loads long content and `?text=200`
doubles the text size. The mock "today" is 20 October 2026. F-08 (see active
prescriptions) and F-09 (request a renewal) share one folder and this one rules page,
because they are two halves of the same screen.

## Purpose

Repeat prescriptions drive call volume (Marta, D-003, then D-009). Owners of a
diabetic cat or an epileptic dog need medicine every month and today they call. A vet
approves every request, with the last consultation and last dispensed date in front of
them (Petra, D-004). Prescriptions are read from VetDesk; the request and the approval
are ours (D-013).

## Flows

- **Pet to prescriptions.** "Recepti" on the pet's page (F-02).
- **Renewal.** "Zatraži obnovu", the request showing what the vet sees, an optional
  note, "Pošalji zahtjev". The vet decides in F-10 (D-029). The owner gets a push
  either way.
- **Home.** From 7 days before the next eligible date a renewal card shows on Home
  (F-07). One tap opens the request. An approved prescription stays on Home until the
  pickup day has passed.
- **Withdraw.** While requested, "Povuci zahtjev" after a confirmation.

## States

| State | `?state=` |
| --- | --- |
| Two prescriptions, one can be renewed, history | `rx` |
| Requested | `rx-requested` |
| Approved with pickup date | `rx-approved` |
| Declined with reason | `rx-declined` |
| No prescriptions | `rx-none` |
| Loading / failed / VetDesk not answering | `rx-loading`, `rx-error`, `rx-stale` |
| Withdraw confirmation | `withdraw-sheet` |
| Request / with a note / note at the limit / sending / failed | `request`, `request-note`, `request-note-long`, `request-sending`, `request-error` |
| Home renewal card / approved on Home | `home-card`, `home-approved` |
| Push approved / declined | `push-approved`, `push-declined` |

## Long-text behaviour

Medicine, dose and the vet's text wrap in full. Tested with "Caninsulin 40 IU/ml
suspenzija za injekciju za pse i mačke, bočica od 10 ml" and a 105-character dose at
360 px and 200% text. The note stops at 300 characters, with a live count in the
right Croatian plural ("Još 285 znakova").

## Data shape

`prescription`, read from VetDesk (D-013)

| Field | Type | Notes | Source |
| --- | --- | --- | --- |
| `medicine`, `dose` | string | | IA |
| `last_dispensed` | date | | IA, D-004 |
| `next_eligible` | date | **from VetDesk or calculated, unconfirmed** (Q-021) | IA |

`renewal_request`, held by our backend

| Field | Type | Notes | Source |
| --- | --- | --- | --- |
| `status` | enum | `requested`, `approved`, `declined`, `withdrawn` | IA, D-035 |
| `owner_note` | string, nullable | at most 300 characters, shown to the vet in F-10, one way | D-035 |
| `pickup_from` | date | set by the vet | D-029 |
| `reason`, `vet_text` | enum, string | **reasons are placeholders** (Q-010) | D-029 |

## Interaction rules

- "Zatraži obnovu" is enabled from **7 days before** `next_eligible` (**unconfirmed**,
  Q-021). Before that it is disabled, with "Obnovu možete zatražiti od 13. studenoga."
- One open request per prescription. While requested, the card shows "Zatraženo, čeka
  veterinara" and "Povuci zahtjev", which asks "Povući zahtjev?".
- The request shows exactly what the vet sees: pet, medicine, dose, last consultation,
  last dispensed (D-004). Then "Napomena za veterinara (nije obavezno)" and "Veterinar
  ne može odgovoriti na napomenu."
- "Recept odobrava veterinar. Odgovor obično stiže isti dan." The second sentence is
  **not from Lumen**.
- Approved: "Preuzimanje od … u klinici …", push. Declined: the reason and the vet's
  text, push, "Zatraži ponovno" while the window is open.
- A pet that has died has no prescriptions (D-031).

## Breakpoints

As F-05: checked at 360, 390 and 768 px and at 200% text. Nothing scrolls sideways.

## Decisions

Made in the prototype design session for F-08 and F-09 on 8 October 2026 and logged as
D-035. To confirm with Petra at the next review.

| Decision | Alternatives considered | Why |
| --- | --- | --- |
| Requests from 7 days before the next eligible date | any time, the vet decides; only from the date | the owner never runs out of insulin waiting for approval, without stockpiling |
| A one-way note to the vet, up to 300 characters | no note; a yes/no "has anything changed" | the vet learns what matters, without the chat D-006 rules out |
| Screen sections, the request as the vet sees it, statuses, one open request, the Home card, the states | | proposed in the spec, confirmed by the designer |

Also changed: F-10 shows the owner's note to the vet. F-02's "Recepti" opens this
screen. F-07's renewal place is now the card.

Components: none added.

## Open

| # | Question | Owner | Blocks |
| --- | --- | --- | --- |
| Q-021 | Where the next eligible date comes from (Iva); the 7 days and the owner's note (Petra) | Iva, Petra | F-08, F-09 |
| Q-006 | Whether VetDesk can store the approval as a note on the record | Iva | F-09, F-10 |

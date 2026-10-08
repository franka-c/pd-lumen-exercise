---
kind: rules
feature: f-03-record
status: draft
decisions: [D-018, D-031, D-032]
covers: [states, long-text, data-shape, interaction, breakpoints]
---

# F-03 pet's record rules

Fictional client, created for an internal DECODE exercise.

Prototype: `prototype/features/f-03-record/index.html`, version 0.6.0. Every state
opens with `?state=<id>`. `?long=1` loads long content and `?text=200` doubles the text
size. All notes are invented.

## Purpose

Marta at kickoff: "Show me the record so I stop calling to ask what the vet said."
The IA: consultations in reverse order, each with date, vet, notes as released by the
vet, and documents. The owner sees only what the vet marked visible (D-032).

## Flows

- **Pet to record.** "Karton" on the pet's page (F-02) opens the record. For a pet that
  has died it is read only (D-031).
- **Record to consultation** to a **document**, which opens in a viewer with share and
  download.
- **Results.** The app sends no push for a newly visible note. Reception announces
  results with a message that links to the consultation (F-13, D-018).

## States

| State | `?state=` |
| --- | --- |
| First 20 consultations, by year, with "Prikaži starije" | `record` |
| All consultations | `record-all` |
| No consultations | `record-empty` |
| Loading | `record-loading` |
| Failed, retry | `record-error` |
| VetDesk not answering, last saved data | `record-stale` |
| Pet that has died, read only | `record-deceased` |
| Consultation with note and documents | `consult` |
| Consultation with nothing released | `consult-no-note` |
| Consultation without documents | `consult-no-docs` |
| PDF in the viewer | `doc-pdf` |
| Image in the viewer | `doc-image` |
| Document could not be opened | `doc-error` |

## Long-text behaviour

| Element | Rule | Tested with |
| --- | --- | --- |
| Note in a record row | one line, ellipsis | a 700-character note |
| Note on the consultation | in full, line breaks kept | same |
| Document name | two lines, then clamped | "Potvrda o cijepljenju protiv bjesnoće za putovnicu kućnog ljubimca, EU" at 360 px and 200% text |
| Vet name | wraps | "dr. med. vet. Ana-Marija Kovačević-Horvat" |

## Data shape

`consultation`, read from VetDesk

| Field | Type | Required | Nullable | Notes | Source |
| --- | --- | --- | --- | --- | --- |
| `id`, `date`, `type` | string, date, string | yes | no | newest first, grouped by year | IA |
| `vet_id`, `clinic` | string | yes | no | | IA |
| `note` | text | no | yes | only a note marked visible to the owner. Null shows the "not available" text | IA, D-032 |
| `documents[]` | {id, name, kind, date} | no | no | only documents marked visible. `kind`: `pdf`, `image` | IA, D-032 |
| `visible_to_owner` | boolean | | | **the VetDesk marker per note and document, unconfirmed** (Q-018) | D-032 |

## Interaction rules

- The record shows the first 20 consultations, newest first, grouped by year.
  "Prikaži starije" adds 20 more and disappears when all are shown.
- A row shows date, type, vet and clinic, the note's first line and the number of
  documents with the Croatian plural ("2 dokumenta").
- A consultation shows the full note and its documents. With no released note:
  "Bilješke za ovaj pregled nisu dostupne u aplikaciji. Za pitanja se javite klinici."
  With no documents, the section is left out.
- A document opens in an in-app viewer with "Podijeli" (the system share sheet) and
  "Preuzmi". If it cannot open: "Dokument nije moguće otvoriti. Pokušajte ponovno."
- No push for a newly released note.
- VetDesk not answering shows the last saved data with a notice and retry, as F-02.

## Breakpoints

As F-05: checked at 360, 390 and 768 px and at 200% text. Nothing scrolls sideways.

## Decisions

Made in the prototype design session for F-03 on 8 October 2026 and logged as D-032.
To confirm with Marta and Petra at the next review.

| Decision | Alternatives considered | Why |
| --- | --- | --- |
| The vet marks which notes the owner sees | a separate owner summary; ask Petra first | reads "notes as released by the vet" in the IA literally, with no extra writing for the vet |
| Documents follow the same marker | all visible at once; by document type | the owner never reads a result before the vet can explain it |
| Year groups, 20 at a time, the viewer, no push, the states | | proposed in the spec, confirmed by the designer |

Components: none added. The kit's Card, Badge, Alert, Button and Skeleton cover F-03.

## Open

| # | Question | Owner | Blocks |
| --- | --- | --- | --- |
| Q-018 | Does VetDesk mark notes and documents as visible to the owner, and does the API return it? Petra to confirm the rule | Iva, Petra | F-03 |

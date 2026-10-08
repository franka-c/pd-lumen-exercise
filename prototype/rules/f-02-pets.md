---
kind: rules
feature: f-02-pets
status: draft
decisions: [D-002, D-010, D-031]
covers: [states, long-text, data-shape, interaction, breakpoints]
---

# F-02 my pets rules

Fictional client, created for an internal DECODE exercise.

Prototype: `prototype/features/f-02-pets/index.html`, version 0.5.0. Every state opens
with `?state=<id>`. `?long=1` loads long content and `?text=200` doubles the text size.
The mock "today" is 20 October 2026. The photo in the photo states is a drawn
placeholder, not a photo.

## Purpose

The owner sees their pets, as VetDesk holds them (06, F-02), and reaches each pet's
record, vaccinations and prescriptions from one place (IA, My pets; D-009). The pet's
clinic and vet are F-05's booking defaults (D-002).

## Flows

- **List to pet.** A card opens the pet's page.
- **Pet to booking.** "Rezerviraj termin" opens F-05.
- **Pet to its sections.** Karton (F-03), Cijepljenja (F-04), Recepti (F-08, F-09).
- **Photo.** Add from camera or gallery, change, remove after a confirmation.

## States

| State | `?state=` |
| --- | --- |
| Three pets and one deceased | `list` |
| One pet | `list-one` |
| With photos | `list-photos` |
| No pets, with the clinics' phone numbers | `list-empty` |
| Loading | `list-loading` |
| Failed with nothing saved, retry | `list-error` |
| VetDesk not answering, last saved data shown | `list-stale` |
| Pet page, no photo | `pet` |
| Pet page with a photo | `pet-photo` |
| Saving a photo | `pet-saving` |
| Photo not saved | `pet-photo-error` |
| Remove photo confirmation | `pet-remove-photo` |
| Deceased pet | `pet-deceased` |

## Long-text behaviour

| Element | Rule | Tested with |
| --- | --- | --- |
| Pet name on a card | two lines, then clamped | "Gospodin Mrvica od Trešnjevke" at 360 px and 200% text |
| Species and breed on a card | one line, ellipsis | "kavalir King Charles španijel, križanac s malteškim psićem" |
| Name and details on the pet's page | wrap in full | same, at 360 px and 200% text |

## Data shape

`pet`, read from VetDesk

| Field | Type | Required | Nullable | Notes | Source |
| --- | --- | --- | --- | --- | --- |
| `id` | string | yes | no | VetDesk pet id | 06 |
| `name` | string | yes | no | | IA |
| `species` | string | yes | no | as VetDesk holds it | IA |
| `breed` | string | no | yes | | IA |
| `born` | date | yes | no | age in months under one year, then years, with Croatian plurals | IA |
| `clinic_id`, `vet_id` | string | yes | `vet_id` yes | | IA, D-002 |
| `deceased_on` | date | no | yes | **the VetDesk marker for a pet that has died, unconfirmed** (Q-017) | D-031 |

`pet_photo`, held by the app, not VetDesk: one per pet, cropped to a square at the
centre, shown as a circle. **Storage, size limit and deletion with the account are
unconfirmed** (Q-017).

## Interaction rules

- Living pets sorted by name, then a "Preminuli" section (D-031).
- A card shows the photo or the first letter, name, species and breed, and age and
  clinic. A deceased pet's card shows the years, for example "2009. – 2025.".
- The pet's page shows species, breed, date of birth and age, clinic and vet, with
  "Podatke vodi klinika. Za ispravak se javite klinici."
- "Dodaj fotografiju" picks from camera or gallery. With a photo: "Promijeni" and
  "Ukloni", which asks "Ukloniti fotografiju?". A failed save shows "Fotografija nije
  spremljena. Pokušajte ponovno."
- A deceased pet has no booking, no reminders, no prescriptions and no
  notifications. Its record is read only. Its photo stays and cannot be changed
  (D-031). The text is gender neutral: "Preminuli · 2. prosinca 2025.".
- When VetDesk does not answer, the last saved data shows with "Podaci od 10:02.
  Osvježavanje nije uspjelo." and retry, because 07 caches VetDesk data for display.
- A pet VetDesk moves off this owner disappears without a special state.

## Breakpoints

As F-05: checked at 360, 390 and 768 px and at 200% text. Nothing scrolls sideways.

## Decisions

Made in the prototype design session for F-02 on 8 October 2026 and logged as D-031.
To confirm with Marta and Petra at the next review.

| Decision | Alternatives considered | Why |
| --- | --- | --- |
| A separate "Preminuli" section, record read only, nothing else | hide deceased pets; ask Petra first | the owner keeps the record without reminders for a pet that has died |
| The owner adds a photo, the first letter until then | no photo; a VetDesk photo if any | the brand asks for real photos of pets |
| Card and page contents, the empty, stale and removed-pet behaviour | | proposed in the spec, confirmed by the designer |
| Gender-neutral dates, years on a deceased pet's card, automatic square crop | | added in the build, approved by the designer |

Components: none added. The kit's Card, Avatar, Button, Alert, Drawer and Skeleton
cover F-02.

## Open

| # | Question | Owner | Blocks |
| --- | --- | --- | --- |
| Q-017 | Does VetDesk mark a pet that has died, where are owner photos stored and how large, and is "Preminuli" the right word? | Iva, Petra | F-02, F-07 |

## Deferred

- Adding a pet is F-12, Future.
- Manual photo cropping.

---
deliverable: 01-project-alignment
project_number: 1
status: confirmed
owner: pm
updated: 2026-09-24
confirmed_with_client: 2026-09-25
depends_on: []
feeds: [01-project-alignment-risks, 03-user-personas, 05-information-architecture, 10-development-ready-prototype]
decisions: [D-001, D-002, D-004, D-005, D-006, D-007]
---

# Project alignment

Fictional client, created for an internal DECODE exercise.

## The client

Lumen Veterinary runs 14 companion-animal clinics, nine in Croatia and five in
Slovenia, with around 60,000 active pets. All clinics run VetDesk as practice
management software. Marta Kos, operations director, is the decision maker. Dr.
Petra Novak, head vet, holds a veto on anything clinical. Tomislav Jurić looks after
IT one day a week and is the only person who knows VetDesk from the inside.

## The problem

Reception at every clinic spends the first three hours of the day on the phone
booking and moving appointments. The VetDesk booking widget was meant to absorb
this and failed, because it knows nothing about the pet: it offers every vet at
every clinic and lets an owner book a vaccination the pet had two weeks ago. Half
the clinics have switched it off. Repeat prescriptions for chronic conditions add a
second stream of calls, each one needing a vet's sign-off between consultations.

## What we are building

A pet owner app for iOS and Android, and a browser page for reception. Greenfield.

The owner can book and move an appointment with the usual vet at the usual clinic
(D-002), see reminders drawn from the due dates VetDesk already holds (D-006), read
the pet's record, and request a repeat prescription. Every prescription
request is approved by a vet, who sees the last consultation and last dispensed date
before approving (D-004). Reception approves or rejects appointment and prescription
requests from a browser page, with a reason on rejection (D-005).

Not in the first version: payments, owner-to-vet chat, farm clients (D-001, D-006).
Noted for later: reception messaging owners.

## Project type and shape

Greenfield, companion app plus light back office, integrating with one system of
record (VetDesk). Classified as a two-surface integration project. The prototype is
the main deliverable; development implements from it.

## What the client has

Brand guidelines from the 2025 rebrand, covering print and the website. No design
system, no component library, no app, no API documentation. DECODE builds the design
foundations during the discovery and it is in scope (D-007).

## Deliverables in scope

Project alignment with assumptions and risks (01), user personas (03), information
architecture (05), feature prioritization (06), technical solution proposal (07),
and the development-ready prototype (10). Market research, user research, visual
identity, UI design write-up, timeline and handover are covered by other agreements
and are not part of this repository.

## Timeline

Eight weeks from 21 September 2026. Prototype ready for development by 27 November
2026. IA review in week two, prioritization in week three, prototype build from
week four, client reviews every Friday.

## How we work with Lumen

One 45-minute call per week with Marta, Petra joins when anything clinical is on
the agenda. Tomislav on call for VetDesk questions. Two owners and two receptionists
available for interviews in week two.

## Success

Reception phone time between 07:00 and 10:00 drops by half within three months of
launch, measured by the phone system. Eighty percent of repeat prescription requests
arrive through the app within six months. Marta's own test: she books her dog's
check-up without calling.

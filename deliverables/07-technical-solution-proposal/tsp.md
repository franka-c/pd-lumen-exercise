---
deliverable: 07-technical-solution-proposal
project_number: 5
status: in-review
owner: architect
updated: 2026-10-03
depends_on: [05-information-architecture, 06-feature-prioritization]
feeds: [10-development-ready-prototype]
decisions: [D-002, D-004, D-005, D-006, D-008]
---

# Technical solution proposal

Fictional client, created for an internal DECODE exercise.

Draft. In review with Ana and Luka. Not yet confirmed with Lumen because Q-001 is
open and the integration chapter has two versions.

## Integrations

VetDesk is the system of record for owners, pets, appointments, vaccinations and
prescriptions. The app holds no clinical data of its own. Everything the owner sees
is read from VetDesk through the partner API, cached for display only.

Writing is the open question (Q-001). Two designs are carried until it is answered.

**Design A, VetDesk accepts writes.** The app creates and moves appointments
directly. Reception sees them in VetDesk as they would any other booking. The
reception page handles prescription requests and the rare appointment the API
rejects.

**Design B, VetDesk is read-only.** Every booking is a request. The reception page
shows it, reception books it in VetDesk by hand, and the app polls VetDesk until the
appointment appears, then marks the request confirmed. Owners get the same
experience with a delay. Reception's load drops less.

Either way the prescription approval flow is ours (D-004): request, vet view with
last consultation and last dispensed date, approve or decline, and a write of the
outcome to VetDesk as a note on the record.

## Non-functional requirements

- Availability shown to owners must be no older than two minutes (Design A) or
  state its age (Design B).
- Clinical data is never stored on the device beyond the session cache.
- Notifications: push through the platform services, email through the provider
  Lumen already uses for the website. Both from VetDesk due dates (D-006).
- Two languages ready in the build, one may ship first (Q-003).

## Stack

React Native for the owner app, one codebase for iOS and Android. A thin backend
in Node that owns the VetDesk integration, the request queue and notifications, so
no VetDesk credential ever reaches a phone. The reception page is a web app on the
same backend (D-005). Postgres for requests, queues and audit. Hosted in the EU.

## Solution architecture

Three parts: the owner app, the backend, and the reception web app. The backend
talks to VetDesk through one adapter module, so the choice between Design A and
Design B changes one module and not the app. The request queue is the backbone of
the reception page and of the prescription flow, and exists in both designs.

## What Q-001 decides

Which of the two integration designs ships, the realistic reception time saving,
and about three weeks of backend effort either way.

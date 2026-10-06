---
deliverable: 01-project-alignment-risks
project_number: 1
status: confirmed
owner: pm
updated: 2026-09-24
confirmed_with_client: 2026-09-25
depends_on: [01-project-alignment]
feeds: [10-development-ready-prototype]
decisions: [D-004, D-006]
---

# Assumptions and risks

Fictional client, created for an internal DECODE exercise.

## Assumptions

- A-1. The VetDesk partner API exposes pets, owners, appointments, vaccination due
  dates and prescriptions for reading. Tomislav believes so, unverified.
- A-2. Owners already have an email address or phone number on file at the clinic
  that can be used to invite them to the app.
- A-3. Vets will approve prescription requests from the same reception page, or from
  a vet view of it, within one working day.
- A-4. One language at launch is acceptable if Q-003 resolves that way.

## Risks

| # | Risk | Likelihood | Impact | What we do |
| --- | --- | --- | --- | --- |
| R-1 | The VetDesk API does not allow writing appointments | medium | high | Q-001, answer by week two. Fallback: the app sends a request and reception books it in VetDesk by hand. Halves the value for reception, keeps it for owners. |
| R-2 | VetDesk rate limits or data model block near-real-time availability | medium | medium | Iva asks for API documentation and a sandbox in week one. |
| R-3 | Clinical safety of repeat prescriptions | low | high | D-004 is a hard rule. Every request approved by a vet with the last consultation and dispensed date in view. |
| R-4 | Older owners do not adopt the app | high | medium | Reminders by email as well as push (D-006). Phone booking stays. |
| R-5 | Brand guidelines are too thin for an app | high | low | Design foundations built in scope (D-007). |

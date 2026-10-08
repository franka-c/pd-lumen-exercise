// Mock data for F-10. Invented for the prototype: no real Lumen data.
// Shapes follow the data contract in the developer panel and prototype/rules/f-10-reception.md.
window.MOCK = {
  now: "2026-10-20T10:00:00+02:00",     // fixed "now"; the panel can move it forward
  clinic: { id: "c-tresnjevka", name: "Lumen Trešnjevka" },
  users: {
    reception: { name: "Sanja", role: "reception" },
    vet: { name: "dr. Ivana Horvat", role: "vet", vet_id: "v-horvat" }
  },
  vets: { "v-horvat": "dr. Ivana Horvat", "v-babic": "dr. Marko Babić", "v-long": "dr. med. vet. Ana-Marija Kovačević-Horvat" },
  types: { "check-up": "Pregled", "vaccination": "Cijepljenje", "surgery": "Operacija", "dental": "Stomatologija", "emergency": "Hitni slučaj" },
  longOwner: "Ana-Marija Kovačević-Horvat Šimunović",
  longReject: "Dr. Babić je taj tjedan na godišnjem odmoru, a zamjena ne radi stomatološke zahvate. Molimo odaberite termin nakon 2. studenoga ili nas nazovite pa ćemo zajedno naći rješenje.",

  // kind: new | move | cancel. Reception can act until requested_at + 15 min (D-024, D-028).
  appointmentRequests: [
    { id: "r1", kind: "new", pet: "Rex", owner: "Ivana Kovač", vet_id: "v-horvat", type: "check-up",
      slot_start: "2026-10-22T10:30:00+02:00", requested_at: "2026-10-20T09:48:00+02:00" },
    { id: "r2", kind: "move", pet: "Zara", owner: "Branko Šimić", vet_id: "v-long", type: "dental",
      slot_start: "2026-11-04T15:00:00+01:00", new_slot_start: "2026-11-05T09:00:00+01:00", requested_at: "2026-10-20T09:52:00+02:00" },
    { id: "r3", kind: "cancel", pet: "Luna", owner: "Petar Marić", vet_id: "v-babic", type: "vaccination",
      slot_start: "2026-10-21T08:00:00+02:00", requested_at: "2026-10-20T09:57:00+02:00" },
    { id: "r4", kind: "new", pet: "Bobi", owner: "Maja Radić", vet_id: "v-babic", type: "emergency",
      slot_start: "2026-10-20T11:30:00+02:00", requested_at: "2026-10-20T09:59:00+02:00" },
    { id: "r5", kind: "new", pet: "Mrvica", owner: "Ivana Kovač", vet_id: "v-horvat", type: "vaccination",
      slot_start: "2026-10-27T16:00:00+01:00", requested_at: "2026-10-20T09:30:00+02:00" },   // already auto-confirmed
    { id: "r6", kind: "move", pet: "Medo", owner: "Branko Šimić", vet_id: "v-horvat", type: "check-up",
      slot_start: "2026-10-23T09:00:00+02:00", new_slot_start: "2026-10-24T10:00:00+02:00", requested_at: "2026-10-20T09:20:00+02:00" }
  ],

  // D-004: the vet sees the last consultation and the last dispensed date.
  prescriptionRequests: [
    { id: "p1", pet: "Medo", species: "pas", owner: "Branko Šimić", medicine: "Fenobarbital 60 mg", dose: "1 tableta dvaput dnevno",
      last_consultation: { date: "2026-09-02", vet_id: "v-horvat", note: "Kontrola epilepsije, stanje stabilno." },
      last_dispensed: "2026-09-22", requested_at: "2026-10-20T08:40:00+02:00", registered_here: true },
    { id: "p2", pet: "Maza", species: "mačka", owner: "Ivana Kovač", medicine: "Caninsulin 40 IU/ml", dose: "2 IU dvaput dnevno",
      last_consultation: { date: "2026-07-14", vet_id: "v-babic", note: "Dijabetes, kontrola glukoze za 3 mjeseca." },
      last_dispensed: "2026-09-25", requested_at: "2026-10-20T09:10:00+02:00", registered_here: true },
    { id: "p3", pet: "Fluffy", species: "mačka", owner: "Tena Jurić", medicine: "Meloksikam 0,5 mg/ml", dose: "0,1 ml dnevno",
      last_consultation: null, last_dispensed: null, requested_at: "2026-10-20T09:40:00+02:00", registered_here: false }
  ],

  reasons: {
    // UNCONFIRMED placeholders (Q-010).
    appointment: [
      { code: "vet_unavailable", hr: "Veterinar tada nije dostupan" },
      { code: "call_first", hr: "Za ovu vrstu pregleda prvo nazovite" },
      { code: "other", hr: "Ostalo" }
    ],
    cancellation: [
      { code: "late_cancellation", hr: "Kasno otkazivanje prema pravilima klinike" },
      { code: "other", hr: "Ostalo" }
    ],
    prescriptionVet: [
      { code: "needs_checkup", hr: "Potreban je pregled" },
      { code: "other", hr: "Ostalo" }
    ],
    // From the IA: reception rejects a prescription only for administrative reasons.
    prescriptionAdmin: [
      { code: "owner_not_registered", hr: "Vlasnik nije registriran u ovoj klinici" },
      { code: "pet_not_on_file", hr: "Ljubimac nije u kartoteci" }
    ]
  }
};

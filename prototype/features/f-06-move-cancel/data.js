// Mock data for F-06. Invented for the prototype: no real Lumen data.
// Shapes follow the data contract in the developer panel and prototype/rules/f-06-move-cancel.md.
window.MOCK = {
  // Fixed "now" so the 24-hour and 15-minute rules render the same on every day.
  now: "2026-10-20T10:00:00+02:00",
  today: "2026-10-20",

  clinics: [
    { id: "c-tresnjevka", name: "Lumen Trešnjevka", phone: "01 234 5678",  // phone: MOCK
      hours: { weekday: ["07:00", "20:00"], saturday: ["08:00", "14:00"] } },
    { id: "c-maksimir", name: "Lumen Maksimir", phone: "01 345 6789",
      hours: { weekday: ["07:00", "20:00"], saturday: ["08:00", "14:00"] } }
  ],
  vets: [
    { id: "v-horvat", clinic_id: "c-tresnjevka", name: "dr. Ivana Horvat" },
    { id: "v-long", clinic_id: "c-tresnjevka", name: "dr. med. vet. Ana-Marija Kovačević-Horvat" },
    { id: "v-peric", clinic_id: "c-maksimir", name: "dr. Maja Perić" }
  ],
  pets: [
    { id: "p-rex", name: "Rex" },
    { id: "p-mica", name: "Mica" },
    { id: "p-zara", name: "Zara" }
  ],
  longPetName: "Gospodin Mrvica od Trešnjevke",

  types: {
    "check-up": "Pregled", "vaccination": "Cijepljenje", "surgery": "Operacija",
    "dental": "Stomatologija", "emergency": "Hitni slučaj"
  },

  // UNCONFIRMED: one Lumen-wide placeholder. Lumen has not given the text (Q-014).
  cancellation_policy: "Otkazivanje manje od 24 sata prije termina može se naplatiti.",

  // UNCONFIRMED placeholders (Q-010), now also for moves and cancellations.
  rejectReasons: [
    { code: "vet_unavailable", hr: "Veterinar tada nije dostupan" },
    { code: "late_cancellation", hr: "Kasno otkazivanje prema pravilima klinike" },
    { code: "other", hr: "Ostalo" }
  ],

  // Confirmed bookings. pending_change: null, {kind: "move", slot_start, requested_at} or {kind: "cancel", requested_at}.
  bookings: [
    { id: "b-10", pet_id: "p-rex", clinic_id: "c-tresnjevka", vet_id: "v-horvat", appointment_type: "check-up",
      slot_start: "2026-10-22T10:30:00+02:00", status: "confirmed", pending_change: null },
    { id: "b-11", pet_id: "p-mica", clinic_id: "c-maksimir", vet_id: "v-peric", appointment_type: "vaccination",
      slot_start: "2026-10-21T08:00:00+02:00", status: "confirmed", pending_change: null },        // inside 24 hours
    { id: "b-12", pet_id: "p-zara", clinic_id: "c-tresnjevka", vet_id: "v-long", appointment_type: "dental",
      slot_start: "2026-10-20T10:10:00+02:00", status: "confirmed", pending_change: null },        // inside the 15-minute cut-off
    { id: "b-13", pet_id: "p-rex", clinic_id: "c-tresnjevka", vet_id: "v-horvat", appointment_type: "vaccination",
      slot_start: "2026-11-04T15:00:00+01:00", status: "confirmed",
      pending_change: { kind: "move", slot_start: "2026-11-05T09:00:00+01:00", requested_at: "2026-10-20T09:52:00+02:00" } },
    { id: "b-14", pet_id: "p-mica", clinic_id: "c-maksimir", vet_id: "v-peric", appointment_type: "check-up",
      slot_start: "2026-11-10T11:00:00+01:00", status: "confirmed",
      pending_change: { kind: "cancel", requested_at: "2026-10-20T09:55:00+02:00" } }
  ]
};

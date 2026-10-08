// Mock data for F-05. Invented for the prototype: no real Lumen data.
// Shapes follow the data contract in the developer panel and prototype/rules/f-05-booking.md.
window.MOCK = {
  // Fixed "today" so every state renders the same on every day.
  today: "2026-10-20",

  clinics: [
    { id: "c-tresnjevka", name: "Lumen Trešnjevka", phone: "01 234 5678",  // phone: MOCK
      types: ["check-up", "vaccination", "surgery", "dental", "emergency"],
      hours: { weekday: ["07:00", "20:00"], saturday: ["08:00", "14:00"] } },
    { id: "c-maksimir", name: "Lumen Maksimir", phone: "01 345 6789",
      types: ["check-up", "vaccination", "surgery", "dental"],
      hours: { weekday: ["07:00", "20:00"], saturday: ["08:00", "14:00"] } },
    { id: "c-dubrava", name: "Lumen Dubrava", phone: "01 456 7890",
      types: ["check-up", "vaccination", "dental"],
      hours: { weekday: ["08:00", "19:00"], saturday: ["08:00", "13:00"] } }
  ],

  vets: [
    { id: "v-horvat", clinic_id: "c-tresnjevka", name: "dr. Ivana Horvat" },
    { id: "v-babic", clinic_id: "c-tresnjevka", name: "dr. Marko Babić" },
    { id: "v-long", clinic_id: "c-tresnjevka", name: "dr. med. vet. Ana-Marija Kovačević-Horvat" },
    { id: "v-peric", clinic_id: "c-maksimir", name: "dr. Maja Perić" },
    { id: "v-kos", clinic_id: "c-maksimir", name: "dr. Davor Kos" },
    { id: "v-matic", clinic_id: "c-dubrava", name: "dr. Sven Matić" }
  ],

  pets: [
    { id: "p-rex", name: "Rex", species: "pas", usual_clinic_id: "c-tresnjevka", usual_vet_id: "v-horvat" },
    { id: "p-mica", name: "Mica", species: "mačka", usual_clinic_id: "c-maksimir", usual_vet_id: "v-peric" }
  ],
  longPetName: "Gospodin Mrvica od Trešnjevke",

  // What VetDesk returns as due, per pet (D-014). null next_due = VetDesk returned no date.
  vaccinationDue: {
    "p-rex": { due_now: true, next_due: "2026-09-03" },     // rabies overdue, as in F-04
    "p-mica": { due_now: false, next_due: "2027-03-05" }
  },

  types: {
    "check-up":    { hr: "Pregled",       en: "Check-up" },
    "vaccination": { hr: "Cijepljenje",   en: "Vaccination" },
    "surgery":     { hr: "Operacija",     en: "Surgery" },
    "dental":      { hr: "Stomatologija", en: "Dental" },
    "emergency":   { hr: "Hitni slučaj",  en: "Emergency" }
  },

  // UNCONFIRMED placeholders. D-005 says "a short list"; Lumen has not given it (Q-010).
  rejectReasons: [
    { code: "vet_unavailable", hr: "Veterinar tada nije dostupan", en: "The vet is not available then" },
    { code: "call_first",      hr: "Za ovu vrstu pregleda prvo nazovite", en: "This type needs a call first" },
    { code: "other",           hr: "Ostalo", en: "Other" }
  ],

  // Existing bookings on the Appointments list.
  bookings: [
    { id: "b-1", pet_id: "p-rex", clinic_id: "c-tresnjevka", vet_id: "v-horvat", appointment_type: "check-up",
      slot_start: "2026-10-22T10:30:00+02:00", status: "requested", created_at: "2026-10-20T09:02:00+02:00",
      reject_reason_code: null, reject_reason_text: null },
    { id: "b-2", pet_id: "p-mica", clinic_id: "c-maksimir", vet_id: "v-peric", appointment_type: "vaccination",
      slot_start: "2026-10-23T08:00:00+02:00", status: "not_confirmed", created_at: "2026-10-19T17:40:00+02:00",
      reject_reason_code: "vet_unavailable", reject_reason_text: "Dr. Perić je taj dan na edukaciji." },
    { id: "b-3", pet_id: "p-rex", clinic_id: "c-tresnjevka", vet_id: "v-horvat", appointment_type: "dental",
      slot_start: "2026-11-04T15:00:00+01:00", status: "confirmed", created_at: "2026-10-12T11:15:00+02:00",
      reject_reason_code: null, reject_reason_text: null }
  ],
  longRejectText: "Dr. Perić je taj tjedan na stručnoj edukaciji u Ljubljani, a zamjena ne radi cijepljenja mačaka. Molimo odaberite termin nakon 2. studenoga ili kod drugog veterinara u klinici Maksimir, koji će imati pristup Micinom kartonu."
};

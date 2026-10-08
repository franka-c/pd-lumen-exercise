// Mock data for F-04. Invented for the prototype: no real Lumen data.
// "due" is what VetDesk returns for the pet (D-014). Whether it includes future dates is Q-019.
window.MOCK = {
  today: "2026-10-20",
  cachedAt: "10:02",
  pet: { id: "p-rex", name: "Rex", deceased_on: null },
  deceasedPet: { id: "p-bobi", name: "Bobi", deceased_on: "2025-12-02" },
  clinics: { "c-tresnjevka": "Lumen Trešnjevka", "c-maksimir": "Lumen Maksimir" },
  vets: { "v-horvat": "dr. Ivana Horvat", "v-babic": "dr. Marko Babić" },
  due: [
    { type: "Kombinirano cjepivo (DHPPi)", due_date: "2027-03-03", clinic_id: "c-tresnjevka" },
    { type: "Bjesnoća", due_date: "2026-09-03", clinic_id: "c-tresnjevka" },          // overdue
    { type: "Leptospiroza", due_date: "2026-11-10", clinic_id: "c-tresnjevka" }
  ],
  history: [
    { name: "Bjesnoća", date: "2025-09-03", vet_id: "v-babic", clinic_id: "c-tresnjevka" },
    { name: "Leptospiroza", date: "2025-11-10", vet_id: "v-horvat", clinic_id: "c-tresnjevka" },
    { name: "Kombinirano cjepivo (DHPPi)", date: "2026-03-03", vet_id: "v-horvat", clinic_id: "c-tresnjevka" }
  ],
  longName: "Kombinirano cjepivo protiv štenećaka, zarazne upale jetre, parvoviroze i parainfluence (DHPPi)",
  // A future vaccination booking for this pet (F-05), for the "already booked" state.
  booking: { slot_start: "2026-10-22T10:30:00+02:00", status: "confirmed" }
};

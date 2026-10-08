// Mock data for F-07. Invented for the prototype: no real Lumen data.
window.MOCK = {
  today: "2026-10-20",
  cachedAt: "10:02",
  owner: { first_name: "Ivana", email: "ivana.kovac@example.com" },
  clinics: { "c-tresnjevka": { name: "Lumen Trešnjevka", phone: "01 234 5678" }, "c-maksimir": { name: "Lumen Maksimir", phone: "01 345 6789" } },  // phones: MOCK
  vets: { "v-horvat": "dr. Ivana Horvat", "v-peric": "dr. Maja Perić" },
  pets: [{ id: "p-rex", name: "Rex", needs: true }, { id: "p-mica", name: "Mica", needs: true }],
  nextAppointment: { pet: "Rex", type: "Pregled", slot_start: "2026-10-22T10:30:00+02:00", clinic_id: "c-tresnjevka", vet_id: "v-horvat", status: "confirmed" },
  // What VetDesk returns as due (D-014), per pet.
  due: [
    { pet_id: "p-mica", pet: "Mica", type: "Cijepljenje protiv bjesnoće", due_date: "2026-11-03", clinic_id: "c-maksimir" },
    { pet_id: "p-rex", pet: "Rex", type: "Cijepljenje protiv bjesnoće", due_date: "2026-09-03", clinic_id: "c-tresnjevka" }
  ],
  longPet: "Gospodin Mrvica od Trešnjevke",
  longType: "Kombinirano cjepivo protiv štenećaka, zarazne upale jetre, parvoviroze i parainfluence (DHPPi)"
};

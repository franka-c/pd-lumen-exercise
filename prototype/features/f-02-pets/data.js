// Mock data for F-02. Invented for the prototype: no real Lumen data.
window.MOCK = {
  today: "2026-10-20",
  cachedAt: "10:02",
  clinics: {
    "c-tresnjevka": { name: "Lumen Trešnjevka", phone: "01 234 5678" },   // phones: MOCK
    "c-maksimir": { name: "Lumen Maksimir", phone: "01 345 6789" }
  },
  vets: { "v-horvat": "dr. Ivana Horvat", "v-peric": "dr. Maja Perić", "v-long": "dr. med. vet. Ana-Marija Kovačević-Horvat" },
  // From VetDesk (06, F-02). deceased_on: the VetDesk marker for a pet that has died, Q-017.
  pets: [
    { id: "p-rex", name: "Rex", species: "pas", breed: "njemački ovčar", born: "2021-04-12", clinic_id: "c-tresnjevka", vet_id: "v-horvat", deceased_on: null },
    { id: "p-mica", name: "Mica", species: "mačka", breed: "europska kratkodlaka", born: "2026-03-05", clinic_id: "c-maksimir", vet_id: "v-peric", deceased_on: null },
    { id: "p-zara", name: "Zara", species: "pas", breed: "labrador retriver", born: "2015-08-30", clinic_id: "c-tresnjevka", vet_id: "v-long", deceased_on: null },
    { id: "p-bobi", name: "Bobi", species: "pas", breed: "mješanac", born: "2009-01-10", clinic_id: "c-tresnjevka", vet_id: "v-horvat", deceased_on: "2025-12-02" }
  ],
  long: { name: "Gospodin Mrvica od Trešnjevke", breed: "kavalir King Charles španijel, križanac s malteškim psićem" },
  // A drawn placeholder standing in for an owner's photo. Not a real photo.
  mockPhoto: "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="#F2E9DC"/><circle cx="60" cy="68" r="22" fill="#0F7C7A"/><circle cx="36" cy="44" r="9" fill="#0F7C7A"/><circle cx="52" cy="34" r="9" fill="#0F7C7A"/><circle cx="68" cy="34" r="9" fill="#0F7C7A"/><circle cx="84" cy="44" r="9" fill="#0F7C7A"/></svg>')
};

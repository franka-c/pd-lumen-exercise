// Mock data for F-03. Invented for the prototype: no real Lumen data, no real clinical notes.
// Only notes and documents the vet marked visible to the owner reach the app (D-032).
(function () {
  const vets = { "v-horvat": "dr. Ivana Horvat", "v-babic": "dr. Marko Babić", "v-long": "dr. med. vet. Ana-Marija Kovačević-Horvat" };
  const types = ["Pregled", "Cijepljenje", "Kontrola", "Stomatologija"];
  const consultations = [
    { id: "k-1", date: "2026-10-02", type: "Kontrola", vet_id: "v-horvat", clinic: "Lumen Trešnjevka",
      note: "Rex je dobro. Šapa je zacijelila, nema više šepanja. Nastaviti s laganim šetnjama još tjedan dana, zatim normalna aktivnost. Kontrola nije potrebna osim ako se šepanje vrati.",
      documents: [
        { id: "d-1", name: "Laboratorijski nalaz krvi", kind: "pdf", date: "2026-10-02" },
        { id: "d-2", name: "Rendgenska snimka lijeve prednje šape", kind: "image", date: "2026-10-02" }
      ] },
    { id: "k-2", date: "2026-09-18", type: "Pregled", vet_id: "v-long", clinic: "Lumen Trešnjevka",
      note: null, documents: [] },     // the vet released nothing for this one
    { id: "k-3", date: "2026-06-04", type: "Cijepljenje", vet_id: "v-babic", clinic: "Lumen Trešnjevka",
      note: "Cijepljenje protiv bjesnoće. Rex je dobro podnio cjepivo.", documents: [
        { id: "d-3", name: "Potvrda o cijepljenju protiv bjesnoće za putovnicu kućnog ljubimca, EU", kind: "pdf", date: "2026-06-04" } ] }
  ];
  // Older history, enough to need "Prikaži starije".
  for (let i = 0; i < 24; i++) {
    const y = 2025 - Math.floor(i / 6), m = 11 - (i % 6) * 2;
    consultations.push({ id: `k-old-${i}`, date: `${y}-${String(m).padStart(2, "0")}-15`, type: types[i % 4], vet_id: i % 3 ? "v-horvat" : "v-babic",
      clinic: "Lumen Trešnjevka", note: i % 5 === 2 ? null : "Redovni pregled, bez posebnosti.", documents: i % 4 === 0 ? [{ id: `d-old-${i}`, name: "Nalaz", kind: "pdf", date: `${y}-${String(m).padStart(2, "0")}-15` }] : [] });
  }
  window.MOCK = {
    pet: { id: "p-rex", name: "Rex", deceased_on: null },
    deceasedPet: { id: "p-bobi", name: "Bobi", deceased_on: "2025-12-02" },
    vets, consultations, cachedAt: "10:02",
    longNote: "Rex je dobro. Šapa je zacijelila, nema više šepanja. Nastaviti s laganim šetnjama još tjedan dana, zatim normalna aktivnost. ".repeat(6) + "Kontrola nije potrebna osim ako se šepanje vrati."
  };
})();

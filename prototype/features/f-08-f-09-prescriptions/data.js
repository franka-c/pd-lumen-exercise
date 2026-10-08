// Mock data for F-08 and F-09. Invented for the prototype: no real Lumen data.
window.MOCK = {
  today: "2026-10-20",
  cachedAt: "10:02",
  earlyDays: 7,          // request from 7 days before the next eligible date, UNCONFIRMED (Q-021)
  noteMax: 300,
  pet: { id: "p-rex", name: "Rex", clinic: "Lumen Trešnjevka" },
  vets: { "v-horvat": "dr. Ivana Horvat", "v-babic": "dr. Marko Babić" },
  lastConsultation: { date: "2026-10-02", vet_id: "v-horvat" },
  // Read from VetDesk (D-013). next_eligible: where it comes from is Q-021.
  prescriptions: [
    { id: "rx-1", medicine: "Caninsulin 40 IU/ml", dose: "8 IU dvaput dnevno, uz obrok", last_dispensed: "2026-09-24", next_eligible: "2026-10-24" },
    { id: "rx-2", medicine: "Fenobarbital 60 mg", dose: "1 tableta dvaput dnevno", last_dispensed: "2026-09-20", next_eligible: "2026-11-20" }
  ],
  // UNCONFIRMED placeholder reasons, as in F-10 (Q-010).
  reasons: { needs_checkup: "Potreban je pregled" },
  history: [
    { medicine: "Caninsulin 40 IU/ml", requested: "2026-09-22", outcome: "approved", pickup: "2026-09-24" },
    { medicine: "Fenobarbital 60 mg", requested: "2026-09-18", outcome: "approved", pickup: "2026-09-20" },
    { medicine: "Caninsulin 40 IU/ml", requested: "2026-08-20", outcome: "declined", reason: "needs_checkup", vet_text: "Molim dođite na kontrolu glukoze prije sljedećeg pakiranja." }
  ],
  long: { medicine: "Caninsulin 40 IU/ml suspenzija za injekciju za pse i mačke, bočica od 10 ml", dose: "8 IU dvaput dnevno, potkožno, uz obrok, u razmaku od 12 sati; ne davati ako pas ne jede" }
};

// Mock data for F-01. Invented for the prototype: no real Lumen data, no real credentials.
// The prototype accepts any password that meets the rule; the panel forces the failure cases.
window.MOCK = {
  owner: { name: "Ivana Kovač", email: "ivana.kovac@example.com", phone: "+385 91 234 5678" },
  longOwner: { name: "Ana-Marija Kovačević-Horvat Šimunović", email: "ana-marija.kovacevic-horvat.simunovic@primjer-dugog-maila.hr", phone: "+385 98 765 4321" },
  clinics: [
    { name: "Lumen Trešnjevka", phone: "01 234 5678" },   // phones: MOCK
    { name: "Lumen Maksimir", phone: "01 345 6789" },
    { name: "Lumen Dubrava", phone: "01 456 7890" }
  ],
  rules: {
    passwordMin: 8,          // UNCONFIRMED (Q-016)
    inviteValidDays: 7,      // UNCONFIRMED (Q-016)
    maxAttempts: 5,          // UNCONFIRMED (Q-016)
    lockMinutes: 15          // UNCONFIRMED (Q-016)
  }
};

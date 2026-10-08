// Mock data for F-13. Invented for the prototype: no real Lumen data.
window.MOCK = {
  now: "2026-10-20T10:00:00+02:00",
  clinic: { name: "Lumen Trešnjevka", phone: "01 234 5678" },     // phone: MOCK
  receptionist: "Sanja",
  maxLength: 500,          // UNCONFIRMED (Q-022)
  unreadHours: 24,         // UNCONFIRMED (Q-022)
  // has_app: activated F-01; email: on file in VetDesk.
  owners: [
    { id: "o-ivana", name: "Ivana Kovač", phone: "091 234 5678", email: "ivana.kovac@example.com", has_app: true,
      pets: [{ id: "p-rex", name: "Rex" }, { id: "p-mica", name: "Mica" }] },
    { id: "o-branko", name: "Branko Šimić", phone: "098 765 4321", email: "branko.simic@example.com", has_app: false,
      pets: [{ id: "p-medo", name: "Medo" }, { id: "p-zara", name: "Zara" }] },
    { id: "o-tena", name: "Tena Jurić", phone: "095 111 2233", email: null, has_app: false, pets: [{ id: "p-fluffy", name: "Fluffy" }] },
    { id: "o-petar", name: "Petar Marić", phone: "092 444 5566", email: "petar.maric@example.com", has_app: true, pets: [{ id: "p-luna", name: "Luna" }] }
  ],
  // What a message can link to (D-018).
  links: {
    "p-rex": [{ kind: "consultation", label: "Pregled 2. listopada 2026. (Kontrola)", href: "../f-03-record/index.html?state=consult" },
              { kind: "appointment", label: "Termin čet, 22. listopada u 10:30", href: "../f-05-booking/index.html?state=list" }]
  },
  // From the inputs: "your results are in", "bring the vaccination booklet". The other two are ours, UNCONFIRMED (Q-022).
  templates: [
    { id: "results", label: "Nalazi su stigli", text: "{pet}: nalazi su stigli. Možete ih pogledati u kartonu u aplikaciji ili nas nazovite.", source: "kickoff, IA workshop", link: "consultation" },
    { id: "booklet", label: "Ponesite knjižicu cijepljenja", text: "{pet}: molimo ponesite knjižicu cijepljenja na sljedeći termin.", source: "kickoff, IA workshop", link: "appointment" },
    { id: "call", label: "Molimo nazovite kliniku", text: "Molimo nazovite kliniku na {phone} u vezi s ljubimcem {pet}.", source: null, link: null },
    { id: "phone-confirmed", label: "Termin je potvrđen telefonom", text: "{pet}: termin je potvrđen telefonom. Vidimo se.", source: null, link: "appointment" }
  ],
  sent: [
    { id: "m1", owner_id: "o-ivana", pet: "Rex", text: "Rex: nalazi su stigli. Možete ih pogledati u kartonu u aplikaciji ili nas nazovite.", by: "Sanja", sent_at: "2026-10-20T09:15:00+02:00", read_at: null, channel: "app", link: { label: "Pregled 2. listopada 2026. (Kontrola)", href: "../f-03-record/index.html?state=consult" } },
    { id: "m2", owner_id: "o-branko", pet: "Medo", text: "Medo: molimo ponesite knjižicu cijepljenja na sljedeći termin.", by: "Sanja", sent_at: "2026-10-20T08:40:00+02:00", read_at: null, channel: "email", link: null },
    { id: "m3", owner_id: "o-petar", pet: "Luna", text: "Molimo nazovite kliniku na 01 234 5678 u vezi s ljubimcem Luna.", by: "Marija", sent_at: "2026-10-18T16:05:00+02:00", read_at: null, channel: "app", link: null },
    { id: "m4", owner_id: "o-ivana", pet: "Mica", text: "Mica: molimo ponesite knjižicu cijepljenja na sljedeći termin.", by: "Sanja", sent_at: "2026-10-15T11:20:00+02:00", read_at: "2026-10-15T18:02:00+02:00", channel: "app", link: null },
    { id: "m5", owner_id: "o-ivana", pet: "Rex", text: "Rex: termin je potvrđen telefonom. Vidimo se.", by: "Marija", sent_at: "2026-10-02T08:10:00+02:00", read_at: "2026-10-02T08:30:00+02:00", channel: "app", link: null },
    { id: "m6", owner_id: "o-ivana", pet: "Mica", text: "Molimo nazovite kliniku na 01 234 5678 u vezi s ljubimcem Mica.", by: "Sanja", sent_at: "2026-09-12T10:00:00+02:00", read_at: "2026-09-12T12:41:00+02:00", channel: "app", link: null }
  ],
  longText: "Rex: nalazi su stigli. Vrijednosti glukoze su malo povišene, pa dr. Horvat predlaže kontrolu za dva tjedna. Možete ih pogledati u kartonu u aplikaciji ili nas nazovite, rado ćemo vam sve objasniti. Ako primijetite da Rex pije više vode nego inače ili je umoran, javite nam se odmah."
};

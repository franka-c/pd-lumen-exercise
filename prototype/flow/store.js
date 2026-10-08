// The connected prototype's single source of truth. Every role reads and changes this
// state; it is kept in sessionStorage so a reload keeps it. Invented data, no real Lumen data.
// Times are local Zagreb time written without an offset ("2026-10-20T10:00") and handled as UTC
// internally, so arithmetic never shifts with the viewer's timezone.
(function () {
  const KEY = "lumen-flow-v1";
  const t = s => Date.parse(s + ":00Z");
  const iso = ms => new Date(ms).toISOString().slice(0, 16);
  const addMin = (s, m) => iso(t(s) + m * 60000);
  const day = s => s.slice(0, 10);

  function initial() {
    return {
      now: "2026-10-20T10:00",
      signedIn: false,
      clinics: {
        "c-tresnjevka": { name: "Lumen Trešnjevka", phone: "01 234 5678", types: ["check-up", "vaccination", "surgery", "dental", "emergency"], hours: { wd: [7, 20], sat: [8, 14] } },
        "c-maksimir": { name: "Lumen Maksimir", phone: "01 345 6789", types: ["check-up", "vaccination", "surgery", "dental"], hours: { wd: [7, 20], sat: [8, 14] } }
      },
      vets: {
        "v-horvat": { name: "dr. Ivana Horvat", clinic_id: "c-tresnjevka" },
        "v-babic": { name: "dr. Marko Babić", clinic_id: "c-tresnjevka" },
        "v-peric": { name: "dr. Maja Perić", clinic_id: "c-maksimir" },
        "v-kos": { name: "dr. Davor Kos", clinic_id: "c-maksimir" }
      },
      types: { "check-up": "Pregled", "vaccination": "Cijepljenje", "surgery": "Operacija", "dental": "Stomatologija", "emergency": "Hitni slučaj" },
      owner: { name: "Ivana Kovač", first: "Ivana", email: "ivana.kovac@example.com", phone: "+385 91 234 5678" },
      pets: [
        { id: "p-rex", name: "Rex", species: "pas", breed: "njemački ovčar", born: "2021-04-12", clinic_id: "c-tresnjevka", vet_id: "v-horvat", photo: null },
        { id: "p-mica", name: "Mica", species: "mačka", breed: "europska kratkodlaka", born: "2026-03-05", clinic_id: "c-maksimir", vet_id: "v-peric", photo: null }
      ],
      bookings: [
        { id: "b-1", pet_id: "p-rex", clinic_id: "c-tresnjevka", vet_id: "v-horvat", type: "check-up", slot_start: "2026-10-22T10:30", status: "confirmed", requested_at: "2026-10-12T09:00", reason: null, pending: null }
      ],
      due: [
        { id: "d-1", pet_id: "p-rex", type: "Cijepljenje protiv bjesnoće", due_date: "2026-09-03", clinic_id: "c-tresnjevka", reminded: ["14", "day"] },
        { id: "d-2", pet_id: "p-mica", type: "Cijepljenje protiv bjesnoće", due_date: "2026-11-03", clinic_id: "c-maksimir", reminded: [] }
      ],
      vaccHistory: [
        { pet_id: "p-rex", name: "Bjesnoća", date: "2025-09-03", vet_id: "v-babic" },
        { pet_id: "p-rex", name: "Kombinirano cjepivo (DHPPi)", date: "2026-03-03", vet_id: "v-horvat" },
        { pet_id: "p-mica", name: "Kombinirano cjepivo za mačke", date: "2026-05-20", vet_id: "v-peric" }
      ],
      consultations: [
        { id: "k-1", pet_id: "p-rex", date: "2026-10-02", type: "Kontrola", vet_id: "v-horvat", note: "Rex je dobro. Šapa je zacijelila, nema više šepanja. Nastaviti s laganim šetnjama još tjedan dana.", docs: [{ name: "Laboratorijski nalaz krvi", kind: "PDF" }] },
        { id: "k-2", pet_id: "p-rex", date: "2026-09-18", type: "Pregled", vet_id: "v-babic", note: null, docs: [] },
        { id: "k-3", pet_id: "p-mica", date: "2026-05-20", type: "Cijepljenje", vet_id: "v-peric", note: "Mica je dobro podnijela cjepivo.", docs: [] }
      ],
      prescriptions: [
        { id: "rx-1", pet_id: "p-rex", medicine: "Caninsulin 40 IU/ml", dose: "8 IU dvaput dnevno, uz obrok", last_dispensed: "2026-09-24", next_eligible: "2026-10-24", request: null },
        { id: "rx-2", pet_id: "p-rex", medicine: "Fenobarbital 60 mg", dose: "1 tableta dvaput dnevno", last_dispensed: "2026-09-20", next_eligible: "2026-11-20", request: null }
      ],
      messages: [
        { id: "m-1", pet_id: "p-mica", text: "Mica: molimo ponesite knjižicu cijepljenja na sljedeći termin.", sent_at: "2026-10-15T11:20", read_at: "2026-10-15T18:02", by: "Sanja", link: null }
      ],
      // Other owners only reception sees, so its lists are not just Ivana.
      otherRequests: [
        { id: "x-1", kind: "new", pet: "Zara", owner: "Branko Šimić", vet_id: "v-babic", type: "dental", slot_start: "2026-11-05T09:00", requested_at: "2026-10-20T09:52" }
      ],
      pushes: [],           // waiting for the owner: {title, body, target}
      dots: { owner: false, reception: false, vet: false },
      role: "owner",
      routes: { owner: { name: "signin" }, reception: { name: "appts" }, vet: { name: "rx" } },
      seq: 10
    };
  }

  let S;
  try { S = JSON.parse(sessionStorage.getItem(KEY)) || initial(); } catch (e) { S = initial(); }
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* the prototype works without storage */ } };
  const id = p => `${p}-${++S.seq}`;
  const pet = pid => S.pets.find(p => p.id === pid);
  const notify = (role, push) => { if (push && role === "owner") S.pushes.push(Object.assign({ at: S.now }, push)); if (S.role !== role) S.dots[role] = true; };

  // Free times: deterministic per vet and day, minus booked slots and anything inside 15 minutes.
  function freeTimes(vet_id, type, dayStr) {
    const d = new Date(dayStr + "T12:00:00Z"), wd = d.getUTCDay();
    if (wd === 0) return [];
    const c = S.clinics[S.vets[vet_id].clinic_id], [o, cl] = wd === 6 ? c.hours.sat : c.hours.wd;
    let seed = 0; for (const ch of dayStr + vet_id + type) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const taken = new Set(S.bookings.filter(b => b.vet_id === vet_id && b.status !== "cancelled" && b.status !== "not_confirmed").flatMap(b => [b.slot_start, b.pending && b.pending.slot_start]).filter(Boolean));
    const out = [];
    for (let h = o; h < cl; h++) for (const m of ["00", "30"]) {
      seed = (seed * 1103515245 + 12345) >>> 0;
      const s = `${dayStr}T${String(h).padStart(2, "0")}:${m}`;
      if (seed % 10 < 3 && !taken.has(s) && t(s) - t(S.now) > 15 * 60000) out.push(s.slice(11));
    }
    return out;
  }

  // ---------- actions ----------
  const A = {
    book(f) {
      const b = { id: id("b"), pet_id: f.pet_id, clinic_id: f.clinic_id, vet_id: f.vet_id, type: f.type, slot_start: `${f.day}T${f.time}`, status: "requested", requested_at: S.now, reason: null, pending: null };
      S.bookings.push(b); notify("reception"); save(); return b;
    },
    cancelRequest(bid) { const b = S.bookings.find(x => x.id === bid); b.status = "cancelled"; save(); },
    requestMove(bid, dayStr, time) { const b = S.bookings.find(x => x.id === bid); b.pending = { kind: "move", slot_start: `${dayStr}T${time}`, requested_at: S.now }; notify("reception"); save(); },
    requestCancel(bid) { const b = S.bookings.find(x => x.id === bid); b.pending = { kind: "cancel", requested_at: S.now }; notify("reception"); save(); },
    withdrawMove(bid) { const b = S.bookings.find(x => x.id === bid); b.pending = null; save(); },
    // Reception answers within the 15 minutes (D-024, D-028, D-029)
    approve(bid) { settle(S.bookings.find(x => x.id === bid), true); save(); },
    reject(bid, reason, text) { settle(S.bookings.find(x => x.id === bid), false, reason, text); save(); },
    dismissOther(xid) { S.otherRequests = S.otherRequests.filter(x => x.id !== xid); save(); },
    requestRenewal(rxid, note) { const r = S.prescriptions.find(x => x.id === rxid); r.request = { status: "requested", note: note || null, sent_at: S.now }; notify("vet"); notify("reception"); save(); },
    withdrawRenewal(rxid) { S.prescriptions.find(x => x.id === rxid).request = null; save(); },
    approveRx(rxid, pickup) {
      const r = S.prescriptions.find(x => x.id === rxid);
      r.request = { ...r.request, status: "approved", pickup };
      notify("owner", { title: `${pet(r.pet_id).name}: recept je odobren`, body: `${r.medicine}. Preuzimanje od ${fmtDate(pickup)}.`, target: { name: "rx", pet: r.pet_id } }); save();
    },
    declineRx(rxid, reason, text) {
      const r = S.prescriptions.find(x => x.id === rxid);
      r.request = { ...r.request, status: "declined", reason, vet_text: text || null };
      notify("owner", { title: `${pet(r.pet_id).name}: recept nije odobren`, body: `${r.medicine}. ${reason}.`, target: { name: "rx", pet: r.pet_id } }); save();
    },
    sendMessage(pet_id, text, link) {
      const m = { id: id("m"), pet_id, text, sent_at: S.now, read_at: null, by: "Sanja", link };
      S.messages.push(m);
      notify("owner", { title: S.clinics[pet(pet_id).clinic_id].name, body: text.length > 90 ? text.slice(0, 90) + "…" : text, target: { name: "message", id: m.id } }); save(); return m;
    },
    readMessage(mid) { const m = S.messages.find(x => x.id === mid); if (m && !m.read_at) { m.read_at = S.now; save(); } },
    setPhoto(pid, dataUrl) { pet(pid).photo = dataUrl; save(); },
    // The clock. VetDesk confirms after 15 minutes; reminders follow D-034.
    advance(minutes) {
      const before = S.now; S.now = addMin(S.now, minutes);
      for (const b of S.bookings) {
        if (b.status === "requested" && t(addMin(b.requested_at, 15)) <= t(S.now)) settle(b, true, null, null, true);
        if (b.pending && t(addMin(b.pending.requested_at, 15)) <= t(S.now)) settle(b, true, null, null, true);
      }
      S.otherRequests = S.otherRequests.map(x => ({ ...x }));
      // Vaccination reminders: 14 days before, and on the day if nothing is booked (D-034).
      for (const d of S.due) {
        const booked = S.bookings.some(b => b.pet_id === d.pet_id && b.type === "vaccination" && ["requested", "confirmed"].includes(b.status) && day(b.slot_start) >= day(S.now));
        if (booked) continue;
        const p = pet(d.pet_id);
        if (!d.reminded.includes("14") && day(addMin(S.now, 14 * 1440)) >= d.due_date) { d.reminded.push("14"); notify("owner", { title: `${p.name}: za 14 dana dospijeva cijepljenje`, body: `${d.type}, ${fmtDate(d.due_date)}.`, target: { name: "home", pet: p.id } }); }
        if (!d.reminded.includes("day") && day(S.now) >= d.due_date) { d.reminded.push("day"); notify("owner", { title: `${p.name}: danas dospijeva cijepljenje`, body: `${d.type}. Rezervirajte termin u aplikaciji.`, target: { name: "home", pet: p.id } }); }
      }
      // Appointment reminders: the day before at 18:00 (D-034).
      for (const b of S.bookings) {
        if (b.status !== "confirmed" || b.remindedEve) continue;
        const eve = `${day(addMin(b.slot_start, -1440))}T18:00`;
        if (t(before) < t(eve) && t(eve) <= t(S.now)) { b.remindedEve = true; notify("owner", { at: eve, title: `Sutra u ${b.slot_start.slice(11)}: ${pet(b.pet_id).name}, ${S.types[b.type].toLowerCase()}`, body: `${S.clinics[b.clinic_id].name}, ${S.vets[b.vet_id].name}.`, target: { name: "appointments" } }); }
      }
      save();
    },
    reset() { S = initial(); save(); },
    setRole(r) { S.role = r; S.dots[r] = false; save(); },
    go(role, route) { S.routes[role] = route; save(); },
    signIn() { S.signedIn = true; S.routes.owner = { name: "home" }; save(); },
    signOut() { S.signedIn = false; S.routes.owner = { name: "signin" }; save(); },
    shiftPush() { const p = S.pushes.shift(); save(); return p; }
  };

  // A request settles: approved by reception, rejected, or confirmed by VetDesk after 15 minutes.
  function settle(b, ok, reason, text, auto) {
    const p = pet(b.pet_id), when = `${fmtSlot(b.slot_start)}, ${p.name}`;
    if (b.pending && b.pending.kind === "move") {
      if (ok) { b.slot_start = b.pending.slot_start; notify("owner", { title: "Termin je premješten", body: `${fmtSlot(b.slot_start)}, ${p.name}`, target: { name: "appointments" } }); }
      else notify("owner", { title: "Promjena termina nije prihvaćena", body: `Ostaje ${when}. ${reason}`, target: { name: "appointments" } });
      b.pending = null; b.autoConfirmed = !!auto; return;
    }
    if (b.pending && b.pending.kind === "cancel") {
      if (ok) { b.status = "cancelled"; notify("owner", { title: "Termin je otkazan", body: when, target: { name: "appointments" } }); }
      else notify("owner", { title: "Otkazivanje nije prihvaćeno", body: `Termin ostaje ${when}. ${reason}`, target: { name: "appointments" } });
      b.pending = null; b.autoConfirmed = !!auto; return;
    }
    if (ok) { b.status = "confirmed"; b.autoConfirmed = !!auto; notify("owner", { title: "Termin je potvrđen", body: when, target: { name: "appointments" } }); }
    else { b.status = "not_confirmed"; b.reason = reason; b.reason_text = text || null; notify("owner", { title: "Termin nije potvrđen", body: `${when}. ${reason}`, target: { name: "appointments" } }); }
  }

  const DAYS = ["ned", "pon", "uto", "sri", "čet", "pet", "sub"];
  const MONTHS = ["siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja", "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"];
  function fmtDate(s) { const d = new Date(s.slice(0, 10) + "T12:00:00Z"); return `${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]}`; }
  function fmtSlot(s) { const d = new Date(s.slice(0, 10) + "T12:00:00Z"); return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} u ${s.slice(11, 16)}`; }

  window.Flow = { get S() { return S; }, A, t, iso, addMin, day, freeTimes, fmtDate, fmtSlot, DAYS, MONTHS, pet };
})();

// F-05 booking prototype. Plain JS, no build step, no backend.
// Every state is reachable with ?state=<id>; ?long=1 swaps in long content; ?text=200 doubles text size.
(function () {
  const M = window.MOCK;
  const params = new URLSearchParams(location.search);
  const STATE = params.get("state") || "list";
  const LONG = params.get("long") === "1";
  if (params.get("text") === "200") document.documentElement.classList.add("text-200");

  // ---------- helpers ----------
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DAYS = ["ned", "pon", "uto", "sri", "čet", "pet", "sub"];
  const MONTHS = ["siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja", "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"];
  const MONTHS_SHORT = ["sij", "velj", "ožu", "tra", "svi", "lip", "srp", "kol", "ruj", "lis", "stu", "pro"];
  const ymd = d => d.toISOString().slice(0, 10);
  const parseDay = s => new Date(s + "T12:00:00Z");
  const addDays = (d, n) => new Date(d.getTime() + n * 864e5);
  const fmtDayLong = d => `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]}`;
  const fmtDateLong = s => { const d = parseDay(s); return `${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}.`; };
  const slotDay = iso => iso.slice(0, 10);
  const slotTime = iso => iso.slice(11, 16);
  const fmtSlot = iso => `${fmtDayLong(parseDay(slotDay(iso)))} u ${slotTime(iso)}`;
  const clinic = id => M.clinics.find(c => c.id === id);
  const vet = id => M.vets.find(v => v.id === id);
  const typeLabel = t => M.types[t].hr;
  const HORIZON_DAYS = 28; // four weeks, designer decision

  // ---------- app state ----------
  const pets = M.pets.map(p => ({ ...p, name: LONG && p.id === "p-rex" ? M.longPetName : p.name }));
  let bookings = JSON.parse(JSON.stringify(M.bookings));
  if (LONG) bookings.find(b => b.id === "b-2").reject_reason_text = M.longRejectText;

  const app = {
    view: "list",            // list | book
    tab: "upcoming",
    listMode: "default",     // default | empty | loading | error
    sheet: null,             // null | {kind, bookingId}
    toast: null,
    push: null,
    book: null               // the booking form, see newForm()
  };

  function newForm(overrides) {
    return Object.assign({
      pets: pets,
      petId: pets.length === 1 ? pets[0].id : null,
      clinicId: null, vetId: null, type: null, day: null, time: null,
      slotsMode: "normal",   // normal | loading | error | none-day | fully-booked
      slotsLoading: false,
      sendMode: "normal",    // normal | taken | error
      sending: false,
      error: null
    }, overrides || {});
  }
  function applyPetDefaults(f) {
    const p = pets.find(x => x.id === f.petId);
    if (!p) return f;
    f.clinicId = p.usual_clinic_id || null;
    f.vetId = p.usual_vet_id || null;
    return f;
  }

  // Deterministic free times: Sunday closed, otherwise a pseudo-random subset of half hours.
  function freeTimes(f, dayStr) {
    if (f.slotsMode === "fully-booked") return [];
    if (f.slotsMode === "none-day" && dayStr === f.day) return [];
    const d = parseDay(dayStr);
    if (d.getUTCDay() === 0) return [];
    const c = clinic(f.clinicId);
    const [open, close] = d.getUTCDay() === 6 ? c.hours.saturday : c.hours.weekday;
    const start = +open.slice(0, 2), end = +close.slice(0, 2);
    let seed = 0;
    for (const ch of dayStr + f.vetId + f.type) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const out = [];
    for (let h = start; h < end; h++) for (const m of ["00", "30"]) {
      seed = (seed * 1103515245 + 12345) >>> 0;
      if (seed % 10 < 3) out.push(`${String(h).padStart(2, "0")}:${m}`);
    }
    if (f.takenTime) return out.filter(t => t !== f.takenTime);
    return out;
  }
  function horizon() {
    const t = parseDay(M.today);
    return Array.from({ length: HORIZON_DAYS }, (_, i) => ymd(addDays(t, i)));
  }
  function nextFreeDay(f, after) {
    return horizon().find(d => d > after && freeTimes(f, d).length);
  }

  // ---------- initial state from the URL ----------
  function boot() {
    switch (STATE) {
      case "list-empty": app.listMode = "empty"; break;
      case "list-loading": app.listMode = "loading"; break;
      case "list-error": app.listMode = "error"; break;
      case "dialog-cancel-request": app.sheet = { kind: "cancel", bookingId: "b-1" }; break;
      case "push-confirmed": simulate("confirm", true); break;
      case "push-rejected": simulate("reject", true); break;
      case "pick-another": pickAnother("b-2"); break;
      default:
        if (STATE.startsWith("book") || STATE === "dialog-discard") startBookState(STATE);
    }
    render();
  }

  function startBookState(s) {
    app.view = "book";
    const one = [pets[0]];
    let f;
    switch (s) {
      case "book-multi": f = newForm(); break;
      case "book-no-pets": f = newForm({ pets: [], petId: null }); break;
      case "book-no-usual-vet": {
        const p = { ...pets[0], usual_vet_id: null };
        f = newForm({ pets: [p], petId: p.id, clinicId: p.usual_clinic_id, vetId: null }); break;
      }
      default: f = applyPetDefaults(newForm({ pets: one, petId: one[0].id }));
    }
    const firstFree = () => horizon().find(d => freeTimes(f, d).length);
    if (["book-loading-slots", "book-no-slots-day", "book-fully-booked", "book-slots-error", "book-ready", "book-sending", "book-slot-taken", "book-send-error", "dialog-discard"].includes(s)) f.type = "check-up";
    if (s === "book-emergency") f.type = "emergency";
    if (s === "book-vaccination-not-due") f.type = "vaccination";
    if (s === "book-loading-slots") { f.day = horizon()[1]; f.slotsMode = "loading"; }
    if (s === "book-no-slots-day") { f.slotsMode = "none-day"; f.day = horizon()[1]; }
    if (s === "book-fully-booked") f.slotsMode = "fully-booked";
    if (s === "book-slots-error") { f.day = horizon()[1]; f.slotsMode = "error"; }
    if (["book-ready", "book-sending", "book-slot-taken", "book-send-error", "dialog-discard", "book-emergency"].includes(s)) {
      f.day = firstFree(); f.time = freeTimes(f, f.day)[1] || freeTimes(f, f.day)[0];
    }
    if (s === "book-sending") f.sending = true;
    // These two open on the result of pressing Send, so a ticket can link straight to them.
    if (s === "book-slot-taken") { f.error = "taken"; f.takenTime = f.time; f.time = null; }
    if (s === "book-send-error") f.error = "send";
    app.book = f;
    if (s === "dialog-discard") app.sheet = { kind: "discard" };
  }

  // ---------- actions ----------
  function showToast(text) {
    app.toast = text; render();
    clearTimeout(showToast.t); showToast.t = setTimeout(() => { app.toast = null; render(); }, 3000);
  }
  function openBook(overrides) {
    app.view = "book";
    app.book = applyPetDefaults(newForm(overrides));
    if (overrides && overrides.vetId) app.book.vetId = overrides.vetId;
    if (overrides && overrides.clinicId) app.book.clinicId = overrides.clinicId;
    render(); window.scrollTo(0, 0);
  }
  function pickAnother(id) {
    // D-020: same clinic, same pet. Same vet and type: proposal 2, confirmed in the spec.
    const b = bookings.find(x => x.id === id);
    app.view = "book";
    app.book = newForm({ petId: b.pet_id, clinicId: b.clinic_id, vetId: b.vet_id, type: b.appointment_type });
  }
  function closeBook() {
    if (app.book && app.book.time) { app.sheet = { kind: "discard" }; render(); return; }
    app.view = "list"; app.book = null; render();
  }
  function loadSlots() {
    const f = app.book;
    if (f.slotsMode === "loading") return;
    f.slotsLoading = true; render();
    setTimeout(() => { f.slotsLoading = false; render(); }, 450);
  }
  function send() {
    const f = app.book;
    if (!canSend(f) || f.sending) return;
    f.sending = true; f.error = null; render();
    setTimeout(() => {
      f.sending = false;
      if (f.sendMode === "taken") {
        f.error = "taken"; f.takenTime = f.time; f.time = null; f.sendMode = "normal"; render(); loadSlots(); return;
      }
      if (f.sendMode === "error") { f.error = "send"; f.sendMode = "normal"; render(); return; }
      const iso = `${f.day}T${f.time}:00+02:00`;
      bookings.unshift({ id: "b-new", pet_id: f.petId, clinic_id: f.clinicId, vet_id: f.vetId, appointment_type: f.type,
        slot_start: iso, status: "requested", created_at: new Date().toISOString(), reject_reason_code: null, reject_reason_text: null });
      app.view = "list"; app.tab = "upcoming"; app.listMode = "default"; app.book = null;
      showToast("Zahtjev je poslan"); window.scrollTo(0, 0);
    }, 900);
  }
  function canSend(f) { return !!(f.petId && f.clinicId && f.vetId && f.type && f.day && f.time); }
  function simulate(kind, silent) {
    const b = bookings.find(x => x.status === "requested");
    if (!b) { if (!silent) showToast("[Prototip] Nema zahtjeva na čekanju"); return; }
    if (kind === "confirm") {
      b.status = "confirmed";
      app.push = { title: "Termin je potvrđen", body: `${fmtSlot(b.slot_start)}, ${petName(b.pet_id)}` };
    } else {
      b.status = "not_confirmed"; b.reject_reason_code = "vet_unavailable"; b.reject_reason_text = null;
      app.push = { title: "Termin nije potvrđen", body: `${fmtSlot(b.slot_start)}, ${petName(b.pet_id)}. ${M.rejectReasons[0].hr}` };
    }
    app.view = "list"; app.book = null;
    if (!silent) render();
  }
  const petName = id => (pets.find(p => p.id === id) || {}).name;

  // ---------- rendering ----------
  function render() {
    const root = document.getElementById("app");
    root.innerHTML = app.view === "list" ? renderList() : renderBook();
    document.getElementById("overlays").innerHTML = renderOverlays();
    renderPanel();
  }

  function renderList() {
    let body;
    if (app.tab === "past") {
      body = `<div class="empty"><p>Nema prošlih termina.</p><p class="meta">[Prototip] Prošli termini nisu dio F-05.</p></div>`;
    } else if (app.listMode === "loading") {
      body = `<div class="skeleton" style="min-height:120px" aria-hidden="true" data-check="list-loading"></div><div class="skeleton" style="min-height:120px" aria-hidden="true"></div><span class="sr-only">Učitavanje termina</span>`;
    } else if (app.listMode === "error") {
      body = `<div class="alert alert-error" role="alert" data-check="list-error"><p>Termine nije moguće učitati.</p><button class="btn btn-outline" data-act="list-retry">Pokušaj ponovno</button></div>`;
    } else {
      const upcoming = app.listMode === "empty" ? [] : bookings.filter(b => b.status !== "cancelled");
      body = upcoming.length
        ? upcoming.map(renderCard).join("")
        : `<div class="empty" data-check="empty-list"><h2>Nemate nadolazećih termina</h2><p class="meta">Rezervirajte termin kod svog veterinara.</p></div>`;
    }
    return `
      <header class="topbar"><h1>Termini</h1></header>
      <main class="content">
        <div class="tabs" role="tablist">
          <button class="tab" role="tab" aria-selected="${app.tab === "upcoming"}" data-act="tab" data-tab="upcoming">Nadolazeći</button>
          <button class="tab" role="tab" aria-selected="${app.tab === "past"}" data-act="tab" data-tab="past">Prošli</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-3)">${body}</div>
      </main>
      <div class="footer"><button class="btn btn-primary btn-lg btn-block" data-act="book" data-check="book-btn">Rezerviraj termin</button></div>`;
  }

  function renderCard(b) {
    const c = clinic(b.clinic_id), v = vet(b.vet_id);
    const when = `<p class="card-title" data-check="card-when">${esc(fmtSlot(b.slot_start))}</p>`;
    const who = `<p class="meta clamp-2" data-check="card-pet">${esc(petName(b.pet_id))} · ${esc(typeLabel(b.appointment_type))}</p>
                 <p class="meta" data-check="card-vet">${esc(c.name)}, ${esc(v.name)}</p>`;
    if (b.status === "requested") return `
      <article class="card" data-check="card-requested">
        <div class="card-row"><span class="badge badge-requested">Zatraženo, čeka potvrdu klinike</span></div>
        ${when}${who}
        <div><button class="btn btn-outline" data-act="cancel-req" data-id="${b.id}">Otkaži zahtjev</button></div>
      </article>`;
    if (b.status === "not_confirmed") {
      const r = M.rejectReasons.find(x => x.code === b.reject_reason_code);
      return `
      <article class="card" data-check="card-rejected">
        <div class="card-row"><span class="badge badge-rejected">Nije potvrđeno</span></div>
        ${when}${who}
        <div>
          <p><strong>${esc(r.hr)}</strong> <span class="badge badge-unconfirmed" title="Placeholder: Lumen has not given the reason list (Q-010)">Nepotvrđeno</span></p>
          ${b.reject_reason_text ? `<p class="clamp-3" id="rt-${b.id}" data-check="reject-text">${esc(b.reject_reason_text)}</p>
            <button class="linklike" data-act="more" data-id="${b.id}" ${LONG ? "" : "hidden"}>Više</button>` : ""}
        </div>
        <div><button class="btn btn-primary" data-act="pick-another" data-id="${b.id}">Odaberi drugi termin</button></div>
      </article>`;
    }
    return `
      <article class="card" data-check="card-confirmed">
        <div class="card-row"><span class="badge badge-confirmed">Potvrđeno</span></div>
        ${when}${who}
        <div><button class="btn btn-outline" data-act="f06">Promijeni ili otkaži</button></div>
      </article>`;
  }

  function renderBook() {
    const f = app.book;
    const header = `<header class="topbar">
        <button class="btn btn-ghost btn-icon" aria-label="Zatvori" data-act="close-book">✕</button>
        <h1>Novi termin</h1></header>`;
    if (!f.pets.length) return header + `<main class="content"><div class="empty" data-check="no-pets">
        <h2>Još nema ljubimaca</h2><p class="meta">Vaši ljubimci pojavit će se ovdje kada ih klinika doda.</p></div></main>`;

    const sections = [renderPet(f)];
    if (f.petId) sections.push(renderClinic(f), renderVet(f));
    if (f.vetId) sections.push(renderType(f));
    if (f.type) sections.push(renderWhen(f));

    const c = f.clinicId && clinic(f.clinicId);
    const emergency = f.type === "emergency" ? `
      <div class="alert" role="note" data-check="emergency-notice">
        <p class="alert-title">Za hitne slučajeve nazovite kliniku</p>
        <a class="btn btn-outline" href="tel:${esc(c.phone.replace(/ /g, ""))}">Nazovi ${esc(c.phone)}</a>
      </div>` : "";
    const err = f.error === "send"
      ? `<div class="alert alert-error" role="alert" data-check="send-error"><p>Zahtjev nije poslan. Provjerite vezu i pokušajte ponovno.</p></div>` : "";
    const label = f.sending ? "Šaljem…" : f.error === "send" ? "Pokušaj ponovno" : "Pošalji zahtjev";
    return header + `<main class="content">${sections.join("")}</main>
      <div class="footer">${emergency}${err}
        <button class="btn btn-primary btn-lg btn-block" data-act="send" data-check="send-btn"
          ${!canSend(f) || f.sending ? "disabled" : ""} aria-busy="${f.sending}">${label}</button>
      </div>`;
  }

  function renderPet(f) {
    if (f.pets.length === 1) {
      const p = f.pets[0];
      return `<section class="field"><h2 class="label" style="font-size:var(--text-sm)">Ljubimac</h2>
        <div class="option" style="cursor:default"><div class="option-body"><span class="truncate" data-check="pet-name">${esc(p.name)}</span><span class="meta">${esc(p.species)}</span></div></div></section>`;
    }
    return `<fieldset class="field"><legend>Ljubimac</legend><div class="option-list">
      ${f.pets.map(p => `<label class="option"><input type="radio" name="pet" value="${p.id}" ${f.petId === p.id ? "checked" : ""} data-act="pet">
        <span class="option-body"><span class="truncate" data-check="pet-name">${esc(p.name)}</span><span class="meta">${esc(p.species)}</span></span></label>`).join("")}
      </div></fieldset>`;
  }

  function renderClinic(f) {
    const p = f.pets.find(x => x.id === f.petId);
    return `<section class="field"><label class="label" for="clinic">Klinika</label>
      <select id="clinic" class="select" data-act="clinic">
        ${f.clinicId ? "" : `<option value="">Odaberite kliniku</option>`}
        ${M.clinics.map(c => `<option value="${c.id}" ${f.clinicId === c.id ? "selected" : ""}>${esc(c.name)}${c.id === p.usual_clinic_id ? " (vaša klinika)" : ""}</option>`).join("")}
      </select></section>`;
  }

  function renderVet(f) {
    if (!f.clinicId) return "";
    const p = f.pets.find(x => x.id === f.petId);
    const vets = M.vets.filter(v => v.clinic_id === f.clinicId)
      .sort((a, b) => (b.id === p.usual_vet_id) - (a.id === p.usual_vet_id));
    return `<fieldset class="field"><legend>Veterinar</legend>
      ${f.vetId ? "" : `<p class="meta">Odaberite veterinara.</p>`}
      <div class="option-list">
      ${vets.map(v => `<label class="option"><input type="radio" name="vet" value="${v.id}" ${f.vetId === v.id ? "checked" : ""} data-act="vet">
        <span class="option-body"><span data-check="vet-name">${esc(v.name)}</span>${v.id === p.usual_vet_id ? `<span class="meta">Vaš veterinar</span>` : ""}</span></label>`).join("")}
      </div></fieldset>`;
  }

  function renderType(f) {
    const c = clinic(f.clinicId);
    let note = "";
    if (f.type === "vaccination") {
      const due = M.vaccinationDue[f.petId];
      if (due && !due.due_now && due.next_due) {
        const p = f.pets.find(x => x.id === f.petId);
        note = `<div class="alert" role="note" data-check="vaccination-warning"><p>${esc(p.name)} trenutno nema dospjelo cijepljenje. Sljedeće je ${esc(fmtDateLong(due.next_due))}</p><p>Zahtjev svejedno možete poslati.</p></div>`;
      }
    }
    return `<fieldset class="field"><legend>Vrsta pregleda</legend><div class="chips">
      ${c.types.map(t => `<button type="button" class="btn btn-outline chip" aria-pressed="${f.type === t}" data-act="type" data-type="${t}">${esc(typeLabel(t))}</button>`).join("")}
      </div>${note}</fieldset>`;
  }

  function renderWhen(f) {
    const c = clinic(f.clinicId);
    if (f.slotsMode === "fully-booked") return `<section class="field"><h2 class="label" style="font-size:var(--text-sm)">Datum i vrijeme</h2>
      <div class="alert" data-check="fully-booked"><p class="alert-title">Nema slobodnih termina u sljedeća 4 tjedna.</p><p>Nazovite kliniku za termin.</p>
      <a class="btn btn-outline" href="tel:${esc(c.phone.replace(/ /g, ""))}">Nazovi ${esc(c.phone)}</a></div></section>`;
    const days = horizon().map(d => {
      const dt = parseDay(d), n = freeTimes(f, d).length;
      return `<button type="button" class="btn btn-outline day ${n ? "" : "is-empty"}" aria-pressed="${f.day === d}" data-act="day" data-day="${d}"
        aria-label="${esc(fmtDayLong(dt))}${n ? "" : ", nema slobodnih termina"}"><small>${DAYS[dt.getUTCDay()]}</small>${dt.getUTCDate()}<small>${MONTHS_SHORT[dt.getUTCMonth()]}</small></button>`;
    }).join("");
    let times;
    if (!f.day) times = `<p class="meta">Odaberite dan.</p>`;
    else if (f.slotsMode === "loading" || f.slotsLoading) times = `<div class="times" aria-hidden="true" data-check="slots-loading">${"<div class='skeleton'></div>".repeat(8)}</div><span class="sr-only">Učitavanje slobodnih termina</span>`;
    else if (f.slotsMode === "error") times = `<div class="alert alert-error" role="alert" data-check="slots-error"><p>Slobodne termine nije moguće učitati.</p><button class="btn btn-outline" data-act="slots-retry">Pokušaj ponovno</button></div>`;
    else {
      const list = freeTimes(f, f.day);
      if (!list.length) {
        const nf = nextFreeDay(f, f.day);
        times = `<div class="alert" data-check="no-slots-day"><p>Nema slobodnih termina ovaj dan.</p>
          ${nf ? `<button class="btn btn-outline" data-act="day" data-day="${nf}">Sljedeći slobodan dan: ${esc(fmtDayLong(parseDay(nf)))}</button>` : ""}</div>`;
      } else {
        times = `<div class="times" data-check="times">${list.map(t => `<button type="button" class="btn btn-outline time" aria-pressed="${f.time === t}" data-act="time" data-time="${t}">${t}</button>`).join("")}</div>`;
      }
    }
    const taken = f.error === "taken" ? `<div class="alert alert-error" role="alert" data-check="slot-taken"><p>Ovaj termin je upravo zauzet. Odaberite drugi.</p></div>` : "";
    return `<section class="field"><h2 class="label" style="font-size:var(--text-sm)">Datum i vrijeme</h2>
      <div class="days" role="group" aria-label="Dan">${days}</div>${taken}${times}</section>`;
  }

  function renderOverlays() {
    let out = "";
    if (app.sheet && app.sheet.kind === "cancel") out += `<div class="scrim" data-act="sheet-close"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t" data-stop>
        <h2 id="sh-t">Otkazati zahtjev?</h2><p class="meta">Klinika ga neće primiti. Ovo se ne može poništiti.</p>
        <div class="actions"><button class="btn btn-destructive btn-lg" data-act="cancel-confirm">Otkaži zahtjev</button>
        <button class="btn btn-outline btn-lg" data-act="sheet-close">Natrag</button></div></div></div>`;
    if (app.sheet && app.sheet.kind === "discard") out += `<div class="scrim" data-act="sheet-close"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t" data-stop>
        <h2 id="sh-t">Odbaciti rezervaciju?</h2><p class="meta">Odabrani termin neće biti sačuvan.</p>
        <div class="actions"><button class="btn btn-destructive btn-lg" data-act="discard-confirm">Odbaci</button>
        <button class="btn btn-outline btn-lg" data-act="sheet-close">Nastavi rezervaciju</button></div></div></div>`;
    if (app.toast) out += `<div class="toast" role="status">${esc(app.toast)}</div>`;
    if (app.push) out += `<button class="push" data-act="push-open"><small>Lumen · sada</small><br><strong>${esc(app.push.title)}</strong><br><span class="meta">${esc(app.push.body)}</span></button>`;
    return out;
  }

  // ---------- prototype panel ----------
  const STATES = {
    "Popis termina": ["list", "list-empty", "list-loading", "list-error", "dialog-cancel-request", "push-confirmed", "push-rejected"],
    "Rezervacija": ["book", "book-multi", "book-no-pets", "book-no-usual-vet", "book-loading-slots", "book-no-slots-day", "book-fully-booked",
      "book-slots-error", "book-ready", "book-sending", "book-slot-taken", "book-send-error", "book-emergency", "book-vaccination-not-due", "dialog-discard", "pick-another"]
  };
  function renderPanel() {
    const el = document.getElementById("proto-panel");
    const open = el.classList.contains("open");
    const link = s => { const q = new URLSearchParams(location.search); q.set("state", s); return `<a href="?${q}" aria-current="${s === STATE}">${s}</a>`; };
    const toggle = (k, v, label) => { const q = new URLSearchParams(location.search); const on = q.get(k) === v; on ? q.delete(k) : q.set(k, v); return `<a href="?${q}">${on ? "☑" : "☐"} ${label}</a>`; };
    el.innerHTML = `<button data-act="panel">PROTOTIP · stanja</button><div class="proto-body">
      ${Object.entries(STATES).map(([g, l]) => `<h4>${g}</h4>${l.map(link).join("")}`).join("")}
      <h4>Sadržaj</h4>${toggle("long", "1", "dugi tekst")}${toggle("text", "200", "tekst 200%")}
      <h4>Simuliraj VetDesk</h4><button data-act="sim-confirm">→ potvrdi zahtjev (15 min)</button><button data-act="sim-reject">→ recepcija odbija</button>
      <h4>Dokumentacija</h4><a href="../../rules/f-05-booking.md">Pravila (rules page)</a><a href="#devdoc">Ugovor podataka ↓</a></div>`;
    if (open) el.classList.add("open");
  }

  // ---------- events ----------
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    if (t.dataset.act === "sheet-close" && e.target.closest("[data-stop]") && t.classList.contains("scrim")) return;
    const f = app.book;
    switch (t.dataset.act) {
      case "panel": document.getElementById("proto-panel").classList.toggle("open"); return;
      case "tab": app.tab = t.dataset.tab; break;
      case "book": openBook(); return;
      case "list-retry": app.listMode = "default"; break;
      case "cancel-req": app.sheet = { kind: "cancel", bookingId: t.dataset.id }; break;
      case "cancel-confirm": {
        const b = bookings.find(x => x.id === app.sheet.bookingId); b.status = "cancelled"; app.sheet = null; showToast("Zahtjev je otkazan"); return;
      }
      case "sheet-close": app.sheet = null; break;
      case "discard-confirm": app.sheet = null; app.view = "list"; app.book = null; break;
      case "pick-another": pickAnother(t.dataset.id); render(); window.scrollTo(0, 0); return;
      case "more": { const p = document.getElementById("rt-" + t.dataset.id); p.classList.remove("clamp-3"); t.hidden = true; return; }
      case "f06": showToast("[Prototip] Premještanje i otkazivanje su F-06, još nisu izrađeni"); return;
      case "close-book": closeBook(); return;
      case "type": f.type = t.dataset.type; f.time = null; f.error = null; if (f.day) loadSlots(); break;
      case "day": f.day = t.dataset.day; f.time = null; if (f.slotsMode === "none-day") f.slotsMode = "normal"; loadSlots(); return;
      case "time": f.time = t.dataset.time; f.error = null; break;
      case "slots-retry": f.slotsMode = "normal"; loadSlots(); return;
      case "send": send(); return;
      case "sim-confirm": simulate("confirm"); return;
      case "sim-reject": simulate("reject"); return;
      case "push-open": app.push = null; app.view = "list"; app.book = null; break;
      default: return;
    }
    render();
  });
  document.addEventListener("change", e => {
    const t = e.target, f = app.book;
    if (!f) return;
    if (t.dataset.act === "pet") { f.petId = t.value; applyPetDefaults(f); f.type = null; f.day = null; f.time = null; }
    if (t.dataset.act === "clinic") { f.clinicId = t.value || null; f.vetId = null; f.type = null; f.day = null; f.time = null; }
    if (t.dataset.act === "vet") { f.vetId = t.value; f.time = null; if (f.day) { render(); loadSlots(); return; } }
    render();
  });

  boot();
})();

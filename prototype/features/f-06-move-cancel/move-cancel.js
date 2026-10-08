// F-06 move or cancel a confirmed appointment. Plain JS, no build step, no backend.
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
  const fmtSlot = iso => `${fmtDayLong(parseDay(iso.slice(0, 10)))} u ${iso.slice(11, 16)}`;
  const clinic = id => M.clinics.find(c => c.id === id);
  const vet = id => M.vets.find(v => v.id === id);
  const petName = id => (LONG && id === "p-rex") ? M.longPetName : M.pets.find(p => p.id === id).name;
  const minutesUntil = iso => (Date.parse(iso) - Date.parse(M.now)) / 60000;
  const CUTOFF_MIN = 15;            // D-028: no changes in the last 15 minutes
  const POLICY_MIN = 24 * 60;       // IA: cancelling inside 24 hours shows the policy
  const HORIZON_DAYS = 28;          // D-027: four weeks of free times
  const reason = code => M.rejectReasons.find(r => r.code === code).hr;

  // ---------- app state ----------
  let bookings = JSON.parse(JSON.stringify(M.bookings));
  const app = { view: "list", sheet: null, toast: null, push: null, move: null };

  function newMove(id) {
    return { id, day: null, time: null, slotsMode: "normal", slotsLoading: false, sending: false, error: null, takenTime: null, failNext: null };
  }
  function freeTimes(mv, dayStr) {
    if (mv.slotsMode === "fully-booked") return [];
    if (mv.slotsMode === "none-day" && dayStr === mv.day) return [];
    const b = bookings.find(x => x.id === mv.id);
    const d = parseDay(dayStr);
    if (d.getUTCDay() === 0) return [];
    const c = clinic(b.clinic_id);
    const [open, close] = d.getUTCDay() === 6 ? c.hours.saturday : c.hours.weekday;
    let seed = 0;
    for (const ch of dayStr + b.vet_id + b.appointment_type) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const out = [];
    for (let h = +open.slice(0, 2); h < +close.slice(0, 2); h++) for (const m of ["00", "30"]) {
      seed = (seed * 1103515245 + 12345) >>> 0;
      const t = `${String(h).padStart(2, "0")}:${m}`;
      // Not the appointment's own time, and nothing in the past or inside the cut-off.
      const iso = `${dayStr}T${t}:00+02:00`;
      if (seed % 10 < 3 && iso.slice(0, 16) !== b.slot_start.slice(0, 16) && minutesUntil(iso) > CUTOFF_MIN) out.push(t);
    }
    return mv.takenTime ? out.filter(t => t !== mv.takenTime) : out;
  }
  const horizon = () => Array.from({ length: HORIZON_DAYS }, (_, i) => ymd(addDays(parseDay(M.today), i)));
  const nextFreeDay = (mv, after) => horizon().find(d => d > after && freeTimes(mv, d).length);

  // ---------- initial state from the URL ----------
  function boot() {
    const firstFree = mv => horizon().find(d => freeTimes(mv, d).length);
    const startMove = () => { app.view = "move"; app.move = newMove("b-10"); return app.move; };
    switch (STATE) {
      case "list-long": break;
      case "actions-sheet": app.sheet = { kind: "actions", id: "b-10" }; break;
      case "move": startMove(); break;
      case "move-loading": { const mv = startMove(); mv.day = horizon()[1]; mv.slotsMode = "loading"; break; }
      case "move-no-slots-day": { const mv = startMove(); mv.slotsMode = "none-day"; mv.day = horizon()[1]; break; }
      case "move-fully-booked": { const mv = startMove(); mv.slotsMode = "fully-booked"; break; }
      case "move-slots-error": { const mv = startMove(); mv.day = horizon()[1]; mv.slotsMode = "error"; break; }
      case "move-ready": case "move-sending": case "move-slot-taken": case "move-send-error": case "move-discard": {
        const mv = startMove(); mv.day = firstFree(mv); mv.time = freeTimes(mv, mv.day)[0];
        if (STATE === "move-sending") mv.sending = true;
        if (STATE === "move-slot-taken") { mv.error = "taken"; mv.takenTime = mv.time; mv.time = null; }
        if (STATE === "move-send-error") mv.error = "send";
        if (STATE === "move-discard") app.sheet = { kind: "discard" };
        break;
      }
      case "cancel-confirm": app.sheet = { kind: "cancel", id: "b-10" }; break;
      case "cancel-confirm-late": app.sheet = { kind: "cancel", id: "b-11" }; break;
      case "cancel-sending": app.sheet = { kind: "cancel", id: "b-10", sending: true }; break;
      case "cancel-error": app.sheet = { kind: "cancel", id: "b-10", error: true }; break;
      case "push-move-confirmed": settle("b-13", true); break;
      case "push-move-rejected": settle("b-13", false); break;
      case "push-cancel-confirmed": settle("b-14", true); break;
      case "push-cancel-rejected": settle("b-14", false); break;
    }
    render();
  }

  // ---------- actions ----------
  function showToast(text) {
    app.toast = text; render();
    clearTimeout(showToast.t); showToast.t = setTimeout(() => { app.toast = null; render(); }, 3000);
  }
  function loadSlots() {
    const mv = app.move;
    if (mv.slotsMode === "loading") return;
    mv.slotsLoading = true; render();
    setTimeout(() => { mv.slotsLoading = false; render(); }, 450);
  }
  function sendMove() {
    const mv = app.move;
    if (!mv.day || !mv.time || mv.sending) return;
    mv.sending = true; mv.error = null; render();
    setTimeout(() => {
      mv.sending = false;
      if (mv.failNext === "taken") { mv.failNext = null; mv.error = "taken"; mv.takenTime = mv.time; mv.time = null; render(); loadSlots(); return; }
      if (mv.failNext === "send") { mv.failNext = null; mv.error = "send"; render(); return; }
      const b = bookings.find(x => x.id === mv.id);
      b.pending_change = { kind: "move", slot_start: `${mv.day}T${mv.time}:00+02:00`, requested_at: M.now };
      app.view = "list"; app.move = null;
      showToast("Zahtjev za promjenu je poslan"); window.scrollTo(0, 0);
    }, 900);
  }
  function sendCancel() {
    const s = app.sheet;
    if (s.sending) return;
    s.sending = true; s.error = false; render();
    setTimeout(() => {
      const b = bookings.find(x => x.id === s.id);
      b.pending_change = { kind: "cancel", requested_at: M.now };
      app.sheet = null; showToast("Zahtjev za otkazivanje je poslan");
    }, 900);
  }
  // VetDesk confirms after 15 minutes, or reception rejects inside them.
  function settle(id, ok) {
    const b = id ? bookings.find(x => x.id === id) : bookings.find(x => x.pending_change);
    if (!b || !b.pending_change) { showToast("[Prototip] Nema promjene na čekanju"); return; }
    const pet = petName(b.pet_id), pc = b.pending_change;
    if (pc.kind === "move" && ok) {
      app.push = { title: "Termin je premješten", body: `${fmtSlot(pc.slot_start)}, ${pet}` };
      b.slot_start = pc.slot_start;
    } else if (pc.kind === "move") {
      app.push = { title: "Promjena termina nije prihvaćena", body: `Ostaje ${fmtSlot(b.slot_start)}, ${pet}. ${reason("vet_unavailable")}` };
    } else if (ok) {
      app.push = { title: "Termin je otkazan", body: `${fmtSlot(b.slot_start)}, ${pet}` };
      b.status = "cancelled";
    } else {
      app.push = { title: "Otkazivanje nije prihvaćeno", body: `Termin ostaje ${fmtSlot(b.slot_start)}, ${pet}. ${reason("late_cancellation")}` };
    }
    b.pending_change = null;
    app.view = "list"; app.move = null; app.sheet = null;
  }

  // ---------- rendering ----------
  function render() {
    document.getElementById("app").innerHTML = app.view === "list" ? renderList() : renderMove();
    document.getElementById("overlays").innerHTML = renderOverlays();
    renderPanel();
  }

  function renderList() {
    const list = bookings.filter(b => b.status !== "cancelled");
    return `<header class="topbar"><h1>Termini</h1></header>
      <main class="content">
        <div class="tabs" role="tablist">
          <button class="tab" role="tab" aria-selected="true">Nadolazeći</button>
          <button class="tab" role="tab" aria-selected="false" data-act="past">Prošli</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-3)">${list.length ? list.map(renderCard).join("") :
          `<div class="empty"><h2>Nemate nadolazećih termina</h2></div>`}</div>
      </main>
      <div class="footer"><a class="btn btn-primary btn-lg btn-block" href="../f-05-booking/index.html">Rezerviraj termin</a></div>`;
  }

  function renderCard(b) {
    const c = clinic(b.clinic_id), v = vet(b.vet_id), pc = b.pending_change, mins = minutesUntil(b.slot_start);
    let note = "", action;
    if (pc && pc.kind === "move") {
      note = `<p class="meta" data-check="pending-move"><strong>Premještanje na ${esc(fmtSlot(pc.slot_start))}, čeka potvrdu klinike</strong></p>`;
      action = `<button class="btn btn-outline" data-act="withdraw" data-id="${b.id}">Odustani od promjene</button>`;
    } else if (pc && pc.kind === "cancel") {
      note = `<p class="meta" data-check="pending-cancel"><strong>Otkazivanje zatraženo, čeka potvrdu klinike</strong></p>`;
      action = "";
    } else if (mins <= CUTOFF_MIN) {
      action = `<div class="alert" data-check="cutoff"><p>Za promjene nazovite kliniku.</p>
        <a class="btn btn-outline" href="tel:${esc(c.phone.replace(/ /g, ""))}">Nazovi ${esc(c.phone)}</a></div>`;
    } else {
      action = `<button class="btn btn-outline" data-act="actions" data-id="${b.id}">Promijeni ili otkaži</button>`;
    }
    return `<article class="card" data-check="card-${b.id}">
      <div class="card-row"><span class="badge badge-confirmed">Potvrđeno</span></div>
      <p class="card-title">${esc(fmtSlot(b.slot_start))}</p>
      <p class="meta clamp-2" data-check="card-pet">${esc(petName(b.pet_id))} · ${esc(M.types[b.appointment_type])}</p>
      <p class="meta">${esc(c.name)}, ${esc(v.name)}</p>
      ${note}${action ? `<div>${action}</div>` : ""}
    </article>`;
  }

  function renderMove() {
    const mv = app.move, b = bookings.find(x => x.id === mv.id), c = clinic(b.clinic_id);
    const header = `<header class="topbar"><button class="btn btn-ghost btn-icon" aria-label="Zatvori" data-act="close-move">✕</button><h1>Promijeni termin</h1></header>`;
    const current = `<section class="field"><h2 class="label" style="font-size:var(--text-sm)">Trenutni termin</h2>
      <div class="card" data-check="current"><p class="card-title">${esc(fmtSlot(b.slot_start))}</p>
      <p class="meta clamp-2">${esc(petName(b.pet_id))} · ${esc(M.types[b.appointment_type])}</p>
      <p class="meta">${esc(c.name)}, ${esc(vet(b.vet_id).name)}</p>
      <p class="meta">Ostaje dok klinika ne potvrdi novi termin.</p></div></section>`;
    let when;
    if (mv.slotsMode === "fully-booked") when = `<div class="alert" data-check="fully-booked"><p class="alert-title">Nema slobodnih termina u sljedeća 4 tjedna.</p>
      <p>Nazovite kliniku za termin.</p><a class="btn btn-outline" href="tel:${esc(c.phone.replace(/ /g, ""))}">Nazovi ${esc(c.phone)}</a></div>`;
    else {
      const days = horizon().map(d => {
        const dt = parseDay(d), n = freeTimes(mv, d).length;
        return `<button type="button" class="btn btn-outline day ${n ? "" : "is-empty"}" aria-pressed="${mv.day === d}" data-act="day" data-day="${d}"
          aria-label="${esc(fmtDayLong(dt))}${n ? "" : ", nema slobodnih termina"}"><small>${DAYS[dt.getUTCDay()]}</small>${dt.getUTCDate()}<small>${MONTHS_SHORT[dt.getUTCMonth()]}</small></button>`;
      }).join("");
      let times;
      if (!mv.day) times = `<p class="meta">Odaberite dan.</p>`;
      else if (mv.slotsMode === "loading" || mv.slotsLoading) times = `<div class="times" aria-hidden="true" data-check="slots-loading">${"<div class='skeleton'></div>".repeat(8)}</div><span class="sr-only">Učitavanje slobodnih termina</span>`;
      else if (mv.slotsMode === "error") times = `<div class="alert alert-error" role="alert" data-check="slots-error"><p>Slobodne termine nije moguće učitati.</p><button class="btn btn-outline" data-act="slots-retry">Pokušaj ponovno</button></div>`;
      else {
        const list = freeTimes(mv, mv.day);
        if (!list.length) {
          const nf = nextFreeDay(mv, mv.day);
          times = `<div class="alert" data-check="no-slots-day"><p>Nema slobodnih termina ovaj dan.</p>
            ${nf ? `<button class="btn btn-outline" data-act="day" data-day="${nf}">Sljedeći slobodan dan: ${esc(fmtDayLong(parseDay(nf)))}</button>` : ""}</div>`;
        } else times = `<div class="times" data-check="times">${list.map(t => `<button type="button" class="btn btn-outline time" aria-pressed="${mv.time === t}" data-act="time" data-time="${t}">${t}</button>`).join("")}</div>`;
      }
      const taken = mv.error === "taken" ? `<div class="alert alert-error" role="alert" data-check="slot-taken"><p>Ovaj termin je upravo zauzet. Odaberite drugi.</p></div>` : "";
      when = `<div class="days" role="group" aria-label="Dan">${days}</div>${taken}${times}`;
    }
    const err = mv.error === "send" ? `<div class="alert alert-error" role="alert" data-check="send-error"><p>Zahtjev nije poslan. Provjerite vezu i pokušajte ponovno.</p></div>` : "";
    const label = mv.sending ? "Šaljem…" : mv.error === "send" ? "Pokušaj ponovno" : "Pošalji zahtjev za promjenu";
    return header + `<main class="content">${current}<section class="field"><h2 class="label" style="font-size:var(--text-sm)">Novi datum i vrijeme</h2>${when}</section></main>
      <div class="footer">${err}<button class="btn btn-primary btn-lg btn-block" data-act="send-move" data-check="send-btn"
        ${!mv.day || !mv.time || mv.sending ? "disabled" : ""} aria-busy="${mv.sending}">${label}</button></div>`;
  }

  function renderOverlays() {
    let out = "";
    const s = app.sheet;
    if (s && s.kind === "actions") {
      const b = bookings.find(x => x.id === s.id);
      out += `<div class="scrim" data-act="sheet-close"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t" data-stop>
        <h2 id="sh-t">${esc(fmtSlot(b.slot_start))}</h2><p class="meta">${esc(petName(b.pet_id))} · ${esc(M.types[b.appointment_type])}</p>
        <div class="actions"><button class="btn btn-outline btn-lg" data-act="start-move" data-id="${b.id}">Promijeni termin</button>
        <button class="btn btn-outline btn-lg" data-act="start-cancel" data-id="${b.id}">Otkaži termin</button>
        <button class="btn btn-ghost btn-lg" data-act="sheet-close">Natrag</button></div></div></div>`;
    }
    if (s && s.kind === "cancel") {
      const b = bookings.find(x => x.id === s.id), late = minutesUntil(b.slot_start) < POLICY_MIN;
      out += `<div class="scrim" data-act="sheet-close"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t" data-stop>
        <h2 id="sh-t">Otkazati termin?</h2>
        <p class="meta">${esc(fmtSlot(b.slot_start))}, ${esc(petName(b.pet_id))}. Klinika ima 15 minuta da potvrdi otkazivanje.</p>
        ${late ? `<div class="alert" data-check="policy"><p class="alert-title">Pravila otkazivanja <span class="badge badge-unconfirmed" title="Placeholder: Lumen has not given the text (Q-014)">Nepotvrđeno</span></p><p>${esc(M.cancellation_policy)}</p></div>` : ""}
        ${s.error ? `<div class="alert alert-error" role="alert" data-check="cancel-error"><p>Zahtjev nije poslan. Provjerite vezu i pokušajte ponovno.</p></div>` : ""}
        <div class="actions"><button class="btn btn-destructive btn-lg" data-act="cancel-confirm" ${s.sending ? "disabled" : ""} aria-busy="${!!s.sending}">${s.sending ? "Šaljem…" : s.error ? "Pokušaj ponovno" : "Otkaži termin"}</button>
        <button class="btn btn-outline btn-lg" data-act="sheet-close">Natrag</button></div></div></div>`;
    }
    if (s && s.kind === "discard") out += `<div class="scrim" data-act="sheet-close"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t" data-stop>
        <h2 id="sh-t">Odbaciti promjenu?</h2><p class="meta">Trenutni termin ostaje.</p>
        <div class="actions"><button class="btn btn-destructive btn-lg" data-act="discard-confirm">Odbaci</button>
        <button class="btn btn-outline btn-lg" data-act="sheet-close">Nastavi</button></div></div></div>`;
    if (app.toast) out += `<div class="toast" role="status">${esc(app.toast)}</div>`;
    if (app.push) out += `<button class="push" data-act="push-open"><small>Lumen · sada</small><br><strong>${esc(app.push.title)}</strong><br><span class="meta">${esc(app.push.body)}</span></button>`;
    return out;
  }

  // ---------- prototype panel ----------
  const STATES = {
    "Popis termina": ["list", "actions-sheet", "push-move-confirmed", "push-move-rejected", "push-cancel-confirmed", "push-cancel-rejected"],
    "Promjena": ["move", "move-loading", "move-no-slots-day", "move-fully-booked", "move-slots-error", "move-ready", "move-sending", "move-slot-taken", "move-send-error", "move-discard"],
    "Otkazivanje": ["cancel-confirm", "cancel-confirm-late", "cancel-sending", "cancel-error"]
  };
  function renderPanel() {
    const el = document.getElementById("proto-panel"), open = el.classList.contains("open");
    const link = s => { const q = new URLSearchParams(location.search); q.set("state", s); return `<a href="?${q}" aria-current="${s === STATE}">${s}</a>`; };
    const toggle = (k, v, label) => { const q = new URLSearchParams(location.search); const on = q.get(k) === v; on ? q.delete(k) : q.set(k, v); return `<a href="?${q}">${on ? "☑" : "☐"} ${label}</a>`; };
    el.innerHTML = `<button data-act="panel">PROTOTIP · stanja</button><div class="proto-body">
      ${Object.entries(STATES).map(([g, l]) => `<h4>${g}</h4>${l.map(link).join("")}`).join("")}
      <h4>Sadržaj</h4>${toggle("long", "1", "dugi tekst")}${toggle("text", "200", "tekst 200%")}
      <h4>Simuliraj VetDesk</h4><button data-act="sim-ok">→ potvrdi promjenu (15 min)</button><button data-act="sim-reject">→ recepcija odbija</button>
      <button data-act="sim-fail-taken">→ sljedeće slanje: termin zauzet</button><button data-act="sim-fail-send">→ sljedeće slanje: greška</button>
      <h4>Dokumentacija</h4><a href="../../rules/f-06-move-cancel.md">Pravila (rules page)</a><a href="#devdoc">Ugovor podataka ↓</a><a href="../f-05-booking/index.html">F-05 Rezervacija</a></div>`;
    if (open) el.classList.add("open");
  }

  // ---------- events ----------
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    if (t.classList.contains("scrim") && e.target.closest("[data-stop]")) return;
    const mv = app.move;
    switch (t.dataset.act) {
      case "panel": document.getElementById("proto-panel").classList.toggle("open"); return;
      case "past": showToast("[Prototip] Prošli termini nisu dio F-06"); return;
      case "actions": app.sheet = { kind: "actions", id: t.dataset.id }; break;
      case "start-move": app.sheet = null; app.view = "move"; app.move = newMove(t.dataset.id); render(); window.scrollTo(0, 0); return;
      case "start-cancel": app.sheet = { kind: "cancel", id: t.dataset.id }; break;
      case "cancel-confirm": sendCancel(); return;
      case "sheet-close": app.sheet = null; break;
      case "withdraw": { const b = bookings.find(x => x.id === t.dataset.id); b.pending_change = null; showToast("Promjena je povučena"); return; }
      case "close-move": if (mv.time) { app.sheet = { kind: "discard" }; break; } app.view = "list"; app.move = null; break;
      case "discard-confirm": app.sheet = null; app.view = "list"; app.move = null; break;
      case "day": mv.day = t.dataset.day; mv.time = null; if (mv.slotsMode === "none-day") mv.slotsMode = "normal"; loadSlots(); return;
      case "time": mv.time = t.dataset.time; mv.error = null; break;
      case "slots-retry": mv.slotsMode = "normal"; loadSlots(); return;
      case "send-move": sendMove(); return;
      case "sim-ok": settle(null, true); break;
      case "sim-reject": settle(null, false); break;
      case "sim-fail-taken": if (mv) mv.failNext = "taken"; showToast("[Prototip] Sljedeće slanje: termin zauzet"); return;
      case "sim-fail-send": if (mv) mv.failNext = "send"; showToast("[Prototip] Sljedeće slanje: greška"); return;
      case "push-open": app.push = null; break;
      default: return;
    }
    render();
  });

  boot();
})();

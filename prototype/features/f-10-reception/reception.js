// F-10 reception web view. Plain JS, no build step, no backend.
// ?role=reception|vet, ?state=<id>, ?long=1, ?text=200.
(function () {
  const M = window.MOCK;
  const params = new URLSearchParams(location.search);
  const STATE = params.get("state") || "";
  const LONG = params.get("long") === "1";
  let ROLE = params.get("role") === "vet" ? "vet" : "reception";
  if (params.get("text") === "200") document.documentElement.classList.add("text-200");

  // ---------- helpers ----------
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DAYS = ["ned", "pon", "uto", "sri", "čet", "pet", "sub"];
  const MONTHS = ["siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja", "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"];
  const day = s => new Date(s.slice(0, 10) + "T12:00:00Z");
  const fmtDate = s => { const d = day(s); return `${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}.`; };
  const fmtSlot = iso => { const d = day(iso); return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} u ${iso.slice(11, 16)}`; };
  const WINDOW_MIN = 15;  // D-024, D-028
  const KIND = { new: "Novi", move: "Promjena", cancel: "Otkazivanje" };
  const APPROVED_TOAST = { new: "Termin je potvrđen. Vlasnik je obaviješten.", move: "Promjena je potvrđena. Vlasnik je obaviješten.", cancel: "Otkazivanje je potvrđeno. Vlasnik je obaviješten." };

  // ---------- app state ----------
  let now = Date.parse(M.now);
  const appts = JSON.parse(JSON.stringify(M.appointmentRequests)).map(r => ({ ...r, owner: LONG && r.id === "r2" ? M.longOwner : r.owner, dismissed: false, done: false }));
  const rxs = JSON.parse(JSON.stringify(M.prescriptionRequests)).map(r => ({ ...r, done: false }));
  const app = {
    tab: ROLE === "vet" ? "rx" : "appts",
    listMode: "default",   // default | empty | loading | error
    selected: null,        // request id
    rejecting: false, reason: null, reasonText: LONG ? M.longReject : "",
    pickup: M.now.slice(0, 10),
    sending: false, error: null,   // null | "send" | "handled"
    failNext: null, toast: null
  };
  const minutesLeft = r => WINDOW_MIN - (now - Date.parse(r.requested_at)) / 60000;
  const isAuto = r => minutesLeft(r) <= 0;
  const activeAppts = () => appts.filter(r => !r.done && !isAuto(r)).sort((a, b) => minutesLeft(a) - minutesLeft(b));
  const autoAppts = () => appts.filter(r => !r.done && isAuto(r) && !r.dismissed);
  const activeRx = () => rxs.filter(r => !r.done);

  // ---------- initial state ----------
  function boot() {
    const s = STATE;
    if (s.endsWith("-empty")) app.listMode = "empty";
    if (s.endsWith("-loading")) app.listMode = "loading";
    if (s.endsWith("-error") && !s.includes("approve")) app.listMode = "error";
    if (s.startsWith("rx")) app.tab = "rx";
    if (s === "messages") app.tab = "messages";
    if (s === "appts-detail") app.selected = "r2";
    if (s === "appts-reject") { app.selected = "r3"; app.rejecting = true; app.reason = "late_cancellation"; }
    if (s === "appts-approve-error") { app.selected = "r1"; app.error = "send"; }
    if (s === "appts-already-handled") { app.selected = "r1"; app.error = "handled"; }
    if (s === "appts-sending") { app.selected = "r1"; app.sending = true; }
    if (s === "rx-detail") app.selected = ROLE === "vet" ? "p2" : "p3";
    if (s === "rx-reject") { app.selected = ROLE === "vet" ? "p2" : "p3"; app.rejecting = true; app.reason = ROLE === "vet" ? "needs_checkup" : "owner_not_registered"; }
    if (s === "rx-approve-error") { app.selected = "p2"; app.error = "send"; }
    if (ROLE === "vet" && app.tab === "appts") app.tab = "rx";
    render();
  }

  // ---------- actions ----------
  function toast(t) { app.toast = t; render(); clearTimeout(toast.t); toast.t = setTimeout(() => { app.toast = null; render(); }, 3000); }
  function select(id) { Object.assign(app, { selected: id, rejecting: false, reason: null, reasonText: LONG ? M.longReject : "", error: null, sending: false, pickup: M.now.slice(0, 10) }); render(); }
  function current() { return app.tab === "rx" ? rxs.find(r => r.id === app.selected) : appts.find(r => r.id === app.selected); }
  function submit(kind) {   // kind: approve | reject
    const r = current();
    if (!r || app.sending) return;
    if (kind === "reject" && !app.reason) return;
    app.sending = true; app.error = null; render();
    setTimeout(() => {
      app.sending = false;
      if (app.tab === "appts" && isAuto(r)) { app.error = "handled"; render(); return; }
      if (app.failNext) { app.error = app.failNext; app.failNext = null; render(); return; }
      r.done = true; app.selected = null; app.rejecting = false;
      if (app.tab === "appts") toast(kind === "approve" ? APPROVED_TOAST[r.kind] : "Zahtjev je odbijen. Vlasnik je obaviješten.");
      else toast(kind === "approve" ? `Recept je odobren, preuzimanje od ${fmtDate(app.pickup)}` : "Zahtjev za recept je odbijen. Vlasnik je obaviješten.");
    }, 800);
  }

  // ---------- rendering ----------
  function render() {
    // Empty shows 0. While loading or failed the counts are unknown, so none is shown.
    const known = app.listMode === "default" || app.listMode === "empty";
    const counts = app.listMode === "empty" ? { appts: 0, rx: 0 } : { appts: activeAppts().length, rx: activeRx().length };
    const total = ROLE === "vet" ? counts.rx : counts.appts + counts.rx;
    document.title = known && total ? `(${total}) Lumen recepcija` : "Lumen recepcija";
    const user = M.users[ROLE];
    const tabs = (ROLE === "vet" ? [["rx", "Zahtjevi za recepte"]] : [["appts", "Zahtjevi za termine"], ["rx", "Zahtjevi za recepte"], ["messages", "Poruke"]])
      .map(([k, l]) => `<button class="tab" role="tab" aria-selected="${app.tab === k}" data-act="tab" data-tab="${k}">${l}${known && counts[k] ? ` <span class="count" data-check="count-${k}">${counts[k]}</span>` : ""}</button>`).join("");
    const detail = app.selected && app.tab !== "messages" ? renderDetail() : "";
    document.getElementById("app").innerHTML = `
      <header class="desk-header"><h1>${esc(M.clinic.name)} · ${ROLE === "vet" ? "Veterinar" : "Recepcija"}</h1>
        <p class="role-tag">${esc(user.name)}</p></header>
      <nav class="desk-nav" role="tablist">${tabs}</nav>
      <div class="desk-body ${detail ? "" : "no-detail"}">
        <main class="desk-list">${app.tab === "appts" ? renderAppts() : app.tab === "rx" ? renderRx() : renderMessages()}</main>
        ${detail}
      </div>`;
    document.getElementById("overlays").innerHTML = app.toast ? `<div class="toast" role="status">${esc(app.toast)}</div>` : "";
    renderPanel();
  }

  function listShell(rows) {
    if (app.listMode === "loading") return `<div class="skeleton" style="min-height:52px" data-check="list-loading"></div>`.repeat(4) + `<span class="sr-only">Učitavanje</span>`;
    if (app.listMode === "error") return `<div class="alert alert-error" role="alert" data-check="list-error"><p>Zahtjeve nije moguće učitati.</p><button class="btn btn-outline" data-act="retry">Pokušaj ponovno</button></div>`;
    return rows;
  }

  function renderAppts() {
    const act = app.listMode === "empty" ? [] : activeAppts(), auto = app.listMode === "empty" ? [] : autoAppts();
    const row = r => {
      const left = Math.ceil(minutesLeft(r));
      const when = r.kind === "move" ? `${fmtSlot(r.slot_start)} → ${fmtSlot(r.new_slot_start)}` : fmtSlot(r.slot_start);
      return `<button class="row ${isAuto(r) ? "is-auto" : ""}" data-act="${isAuto(r) ? "noop" : "select"}" data-id="${r.id}" aria-current="${app.selected === r.id}" data-check="row-${r.id}">
        <span><span class="badge ${r.kind === "cancel" ? "badge-rejected" : r.kind === "move" ? "badge-requested" : "badge-confirmed"}">${KIND[r.kind]}</span></span>
        <span class="col-who"><span class="when">${esc(r.pet)}</span> · ${esc(M.types[r.type])}<br><span class="meta truncate" style="display:block" data-check="owner">${esc(r.owner)}</span></span>
        <span>${esc(when)}<br><span class="meta">${esc(M.vets[r.vet_id])}</span></span>
        <span class="left">${isAuto(r) ? `<span class="meta">Potvrđeno automatski</span>` : `još ${left} min`}</span>
      </button>${isAuto(r) ? `<div style="display:flex;justify-content:flex-end;margin-top:calc(-1 * var(--space-1))"><button class="btn btn-ghost" data-act="dismiss" data-id="${r.id}">Ukloni s liste</button></div>` : ""}`;
    };
    const body = act.length ? act.map(row).join("") : `<div class="empty" data-check="appts-empty"><h2 style="color:var(--color-foreground);font-size:var(--text-lg)">Nema novih zahtjeva</h2><p class="meta">Novi zahtjevi za termine pojavit će se ovdje.</p></div>`;
    const autoBlock = auto.length ? `<div class="card-row"><h2 data-check="auto-heading">Potvrđeno automatski (${auto.length})</h2><button class="btn btn-ghost" data-act="dismiss-all">Ukloni sve automatski potvrđene</button></div>${auto.map(row).join("")}` : "";
    return listShell(body + autoBlock);
  }

  function renderRx() {
    const list = app.listMode === "empty" ? [] : activeRx();
    const rows = list.map(r => `<button class="row row-rx" data-act="select" data-id="${r.id}" aria-current="${app.selected === r.id}" data-check="row-${r.id}">
        <span><span class="when">${esc(r.pet)}</span> · ${esc(r.species)}<br><span class="meta">${esc(r.owner)}</span></span>
        <span>${esc(r.medicine)}<br><span class="meta">${esc(r.dose)}</span></span>
        <span class="meta">${r.registered_here ? `zatraženo ${esc(r.requested_at.slice(11, 16))}` : `<span class="badge badge-rejected">Provjeriti vlasnika</span>`}</span>
      </button>`).join("");
    return listShell(rows || `<div class="empty" data-check="rx-empty"><h2 style="color:var(--color-foreground);font-size:var(--text-lg)">Nema zahtjeva za recepte</h2></div>`);
  }

  function renderMessages() {
    return `<div class="empty" data-check="messages"><h2 style="color:var(--color-foreground);font-size:var(--text-lg)">Poruke</h2><p class="meta">[Prototip] Slanje poruka vlasnicima je F-13 (D-025), još nije izrađeno.</p></div>`;
  }

  function reasonPicker(list) {
    return `<fieldset class="field" data-check="reject-form"><legend>Razlog <span class="badge badge-unconfirmed" title="Placeholder: Lumen has not given the list (Q-010)">Nepotvrđeno</span></legend>
      <div class="option-list">${list.map(x => `<label class="option"><input type="radio" name="reason" value="${x.code}" ${app.reason === x.code ? "checked" : ""} data-act="reason"><span class="option-body">${esc(x.hr)}</span></label>`).join("")}</div>
      <label class="label meta" for="rt">Poruka vlasniku (nije obavezno)</label>
      <textarea id="rt" class="input" data-act="reason-text">${esc(app.reasonText)}</textarea></fieldset>`;
  }
  function errors() {
    if (app.error === "send") return `<div class="alert alert-error" role="alert" data-check="send-error"><p>Odgovor nije poslan. Pokušajte ponovno.</p></div>`;
    if (app.error === "handled") return `<div class="alert alert-error" role="alert" data-check="already-handled"><p>Ovaj zahtjev je već obrađen. VetDesk ga je u međuvremenu potvrdio.</p></div>`;
    return "";
  }

  function renderDetail() {
    const r = current();
    if (!r) return "";
    const close = `<div class="card-row"><h2>${app.tab === "rx" ? "Zahtjev za recept" : `${KIND[r.kind]} · ${esc(r.pet)}`}</h2><button class="btn btn-ghost btn-icon" aria-label="Zatvori" data-act="close">✕</button></div>`;
    if (app.tab === "appts") {
      const left = Math.ceil(minutesLeft(r));
      const late = r.kind === "cancel" && (Date.parse(r.slot_start) - now) < 24 * 3600e3;
      return `<aside class="desk-detail" data-check="detail">${close}
        <dl><dt>Ljubimac</dt><dd>${esc(r.pet)}</dd><dt>Vlasnik</dt><dd data-check="detail-owner">${esc(r.owner)}</dd>
          <dt>Vrsta</dt><dd>${esc(M.types[r.type])}</dd><dt>Veterinar</dt><dd>${esc(M.vets[r.vet_id])}</dd>
          ${r.kind === "move" ? `<dt>Sadašnji termin</dt><dd>${esc(fmtSlot(r.slot_start))}</dd><dt>Novi termin</dt><dd><strong>${esc(fmtSlot(r.new_slot_start))}</strong></dd>` : `<dt>Termin</dt><dd>${esc(fmtSlot(r.slot_start))}</dd>`}
          <dt>Preostalo</dt><dd data-check="detail-left">${isAuto(r) ? "Potvrđeno automatski" : `još ${left} min, zatim VetDesk potvrđuje sam`}</dd></dl>
        ${late ? `<div class="alert" data-check="late-note"><p>Otkazivanje manje od 24 sata prije termina.</p></div>` : ""}
        ${errors()}
        ${app.rejecting ? reasonPicker(r.kind === "cancel" ? M.reasons.cancellation : M.reasons.appointment) + `<div class="actions">
            <button class="btn btn-destructive" data-act="reject-send" data-check="reject-send" ${!app.reason || app.sending ? "disabled" : ""}>${app.sending ? "Šaljem…" : "Odbij zahtjev"}</button>
            <button class="btn btn-outline" data-act="reject-cancel">Natrag</button></div>`
        : `<div class="actions"><button class="btn btn-primary" data-act="approve" data-check="approve" ${app.sending || app.error === "handled" ? "disabled" : ""}>${app.sending ? "Šaljem…" : app.error === "send" ? "Pokušaj ponovno" : "Odobri"}</button>
            <button class="btn btn-outline" data-act="reject-open" ${app.error === "handled" ? "disabled" : ""}>Odbij</button></div>`}
      </aside>`;
    }
    // Prescription
    const lc = r.last_consultation;
    const facts = `<dl><dt>Ljubimac</dt><dd>${esc(r.pet)}, ${esc(r.species)}</dd><dt>Vlasnik</dt><dd>${esc(r.owner)}</dd>
      <dt>Lijek</dt><dd><strong>${esc(r.medicine)}</strong></dd><dt>Doza</dt><dd>${esc(r.dose)}</dd>
      <dt>Zadnji pregled</dt><dd data-check="last-consultation">${lc ? `${esc(fmtDate(lc.date))}, ${esc(M.vets[lc.vet_id])}<br><span class="meta">${esc(lc.note)}</span>` : "Nema pregleda u kartoteci"}</dd>
      <dt>Zadnje izdavanje</dt><dd data-check="last-dispensed">${r.last_dispensed ? esc(fmtDate(r.last_dispensed)) : "Nije izdavan"}</dd>
      ${r.owner_note ? `<dt>Napomena vlasnika</dt><dd data-check="owner-note">${esc(r.owner_note)}</dd>` : ""}</dl>`;
    if (ROLE === "vet") {
      return `<aside class="desk-detail" data-check="detail">${close}${facts}${errors()}
        ${app.rejecting ? reasonPicker(M.reasons.prescriptionVet) + `<div class="actions">
            <button class="btn btn-destructive" data-act="reject-send" data-check="reject-send" ${!app.reason || app.sending ? "disabled" : ""}>${app.sending ? "Šaljem…" : "Odbij zahtjev"}</button>
            <button class="btn btn-outline" data-act="reject-cancel">Natrag</button></div>`
        : `<section class="field"><label class="label" for="pickup" style="font-size:var(--text-sm);font-weight:var(--font-weight-heading)">Preuzimanje od</label>
            <input id="pickup" class="input" type="date" value="${app.pickup}" min="${M.now.slice(0, 10)}" data-act="pickup" data-check="pickup" style="max-width:200px"></section>
          <div class="actions"><button class="btn btn-primary" data-act="approve" data-check="approve" ${app.sending ? "disabled" : ""}>${app.sending ? "Šaljem…" : app.error === "send" ? "Pokušaj ponovno" : "Odobri"}</button>
            <button class="btn btn-outline" data-act="reject-open">Odbij</button></div>`}
      </aside>`;
    }
    // Reception sees the request, rejects only for administrative reasons (IA).
    return `<aside class="desk-detail" data-check="detail">${close}${facts}
      <p class="meta" data-check="vet-only">Recept odobrava veterinar. Recepcija može odbiti samo iz administrativnih razloga.</p>${errors()}
      ${app.rejecting ? `<fieldset class="field" data-check="reject-form"><legend>Administrativni razlog</legend><div class="option-list">
          ${M.reasons.prescriptionAdmin.map(x => `<label class="option"><input type="radio" name="reason" value="${x.code}" ${app.reason === x.code ? "checked" : ""} data-act="reason"><span class="option-body">${esc(x.hr)}</span></label>`).join("")}</div>
          <label class="label meta" for="rt">Poruka vlasniku (nije obavezno)</label><textarea id="rt" class="input" data-act="reason-text">${esc(app.reasonText)}</textarea></fieldset>
          <div class="actions"><button class="btn btn-destructive" data-act="reject-send" data-check="reject-send" ${!app.reason || app.sending ? "disabled" : ""}>${app.sending ? "Šaljem…" : "Odbij zahtjev"}</button>
          <button class="btn btn-outline" data-act="reject-cancel">Natrag</button></div>`
      : `<div class="actions"><button class="btn btn-outline" data-act="reject-open" data-check="admin-reject">Odbij (administrativno)</button></div>`}
    </aside>`;
  }

  // ---------- prototype panel ----------
  const STATES = {
    reception: ["appts", "appts-empty", "appts-loading", "appts-error", "appts-detail", "appts-reject", "appts-sending", "appts-approve-error", "appts-already-handled", "rx", "rx-detail", "rx-reject", "messages"],
    vet: ["rx", "rx-empty", "rx-detail", "rx-reject", "rx-approve-error"]
  };
  function renderPanel() {
    const el = document.getElementById("proto-panel"), open = el.classList.contains("open");
    const link = (role, s) => { const q = new URLSearchParams(location.search); q.set("state", s); q.set("role", role); return `<a href="?${q}" aria-current="${s === STATE && role === ROLE}">${s}</a>`; };
    const toggle = (k, v, label) => { const q = new URLSearchParams(location.search); const on = q.get(k) === v; on ? q.delete(k) : q.set(k, v); return `<a href="?${q}">${on ? "☑" : "☐"} ${label}</a>`; };
    el.innerHTML = `<button data-act="panel">PROTOTIP · stanja</button><div class="proto-body">
      <h4>Recepcija (Sanja)</h4>${STATES.reception.map(s => link("reception", s)).join("")}
      <h4>Veterinar (dr. Horvat)</h4>${STATES.vet.map(s => link("vet", s)).join("")}
      <h4>Sadržaj</h4>${toggle("long", "1", "dugi tekst")}${toggle("text", "200", "tekst 200%")}
      <h4>Simulacija</h4><button data-act="tick">→ pomakni vrijeme +5 min</button><button data-act="fail-send">→ sljedeće slanje: greška</button>
      <h4>Dokumentacija</h4><a href="../../rules/f-10-reception.md">Pravila (rules page)</a><a href="#devdoc">Ugovor podataka ↓</a><a href="../f-05-booking/index.html">F-05</a><a href="../f-06-move-cancel/index.html">F-06</a></div>`;
    if (open) el.classList.add("open");
  }

  // ---------- events ----------
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    switch (t.dataset.act) {
      case "panel": document.getElementById("proto-panel").classList.toggle("open"); return;
      case "tab": app.tab = t.dataset.tab; app.selected = null; break;
      case "retry": app.listMode = "default"; break;
      case "select": select(t.dataset.id); return;
      case "close": app.selected = null; break;
      case "approve": submit("approve"); return;
      case "reject-open": app.rejecting = true; app.error = null; break;
      case "reject-cancel": app.rejecting = false; app.reason = null; break;
      case "reject-send": submit("reject"); return;
      case "dismiss": appts.find(r => r.id === t.dataset.id).dismissed = true; break;
      case "dismiss-all": autoAppts().forEach(r => r.dismissed = true); break;
      case "tick": now += 5 * 60000; toast("[Prototip] Vrijeme +5 min"); return;
      case "fail-send": app.failNext = "send"; toast("[Prototip] Sljedeće slanje: greška"); return;
      default: return;
    }
    render();
  });
  document.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.act === "reason") { app.reason = t.value; render(); }
    if (t.dataset.act === "pickup") { app.pickup = t.value < M.now.slice(0, 10) ? M.now.slice(0, 10) : t.value; render(); }
  });
  document.addEventListener("input", e => { if (e.target.dataset.act === "reason-text") app.reasonText = e.target.value; });

  boot();
})();

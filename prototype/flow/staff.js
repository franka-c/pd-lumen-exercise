// Sanja's reception web view and dr. Horvat's prescription queue in the connected prototype.
(function () {
  const F = window.Flow, A = F.A;
  const S = () => F.S;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const vet = v => S().vets[v].name;
  const KIND = { new: "Novi", move: "Promjena", cancel: "Otkazivanje" };
  // UNCONFIRMED placeholder reasons (Q-010); the two administrative ones come from the IA.
  const REASONS = { appt: ["Veterinar tada nije dostupan", "Za ovu vrstu pregleda prvo nazovite", "Ostalo"], cancel: ["Kasno otkazivanje prema pravilima klinike", "Ostalo"], vet: ["Potreban je pregled", "Ostalo"], admin: ["Vlasnik nije registriran u ovoj klinici", "Ljubimac nije u kartoteci"] };
  const TEMPLATES = [["Nalazi su stigli", "{pet}: nalazi su stigli. Možete ih pogledati u kartonu u aplikaciji ili nas nazovite.", "consult"], ["Ponesite knjižicu cijepljenja", "{pet}: molimo ponesite knjižicu cijepljenja na sljedeći termin.", "appt"], ["Molimo nazovite kliniku", "Molimo nazovite kliniku na 01 234 5678 u vezi s ljubimcem {pet}.", null]];
  const spec = href => `<a class="meta flow-spec" href="${href}">Specifikacija ovog ekrana</a>`;
  const go = (role, name, extra) => A.go(role, Object.assign({ name }, extra || {}));

  // Ivana's requests and the other owners', as reception sees them.
  function requests() {
    const out = [];
    for (const b of S().bookings) {
      if (b.status === "requested") out.push({ id: b.id, kind: "new", pet: F.pet(b.pet_id).name, owner: S().owner.name, vet_id: b.vet_id, type: b.type, slot: b.slot_start, at: b.requested_at, mine: true });
      if (b.pending) out.push({ id: b.id, kind: b.pending.kind, pet: F.pet(b.pet_id).name, owner: S().owner.name, vet_id: b.vet_id, type: b.type, slot: b.slot_start, newSlot: b.pending.slot_start, at: b.pending.requested_at, mine: true });
    }
    for (const x of S().otherRequests) out.push({ id: x.id, kind: x.kind, pet: x.pet, owner: x.owner, vet_id: x.vet_id, type: x.type, slot: x.slot_start, at: x.requested_at, mine: false });
    return out.map(x => ({ ...x, left: 15 - (F.t(S().now) - F.t(x.at)) / 60000 })).filter(x => x.left > 0).sort((a, b) => a.left - b.left);
  }
  const rxQueue = () => S().prescriptions.filter(r => r.request && r.request.status === "requested");

  function shell(role, tabs, active, body, detail) {
    const user = role === "vet" ? "dr. Ivana Horvat" : "Sanja";
    return `<div class="desk"><header class="desk-header"><h1>Lumen Trešnjevka · ${role === "vet" ? "Veterinar" : "Recepcija"}</h1><p class="role-tag">${user}</p></header>
      <nav class="desk-nav" role="tablist">${tabs.map(([k, l, n]) => `<button class="tab" role="tab" aria-selected="${k === active}" data-act="s-tab" data-to="${k}">${l}${n ? ` <span class="count">${n}</span>` : ""}</button>`).join("")}</nav>
      <div class="desk-body ${detail ? "" : "no-detail"}"><main class="desk-list">${body}</main>${detail || ""}</div></div>`;
  }

  function reception(r) {
    const reqs = requests(), rxs = rxQueue();
    const tabs = [["appts", "Zahtjevi za termine", reqs.length], ["rx", "Zahtjevi za recepte", rxs.length], ["messages", "Poruke", 0]];
    if (r.name === "rx") return shell("reception", tabs, "rx", rxs.length ? rxs.map(x => rxRow(x, r)).join("") + `<p class="meta">Recept odobrava veterinar. Recepcija može odbiti samo iz administrativnih razloga.</p>` : `<div class="empty"><p>Nema zahtjeva za recepte.</p></div>`,
      r.sel ? rxDetail(rxs.find(x => x.id === r.sel), r, "reception") : "");
    if (r.name === "messages" || r.name === "compose") return shell("reception", tabs, "messages", r.name === "compose" ? compose(r) : sent());
    const sel = reqs.find(x => x.id === r.sel);
    const body = reqs.length ? reqs.map(x => `<button class="row" data-act="s-sel" data-id="${x.id}" aria-current="${r.sel === x.id}">
        <span><span class="badge ${x.kind === "cancel" ? "badge-rejected" : x.kind === "move" ? "badge-requested" : "badge-confirmed"}">${KIND[x.kind]}</span></span>
        <span class="col-who"><span class="when">${esc(x.pet)}</span> · ${esc(S().types[x.type])}<br><span class="meta">${esc(x.owner)}</span></span>
        <span>${esc(F.fmtSlot(x.slot))}${x.newSlot ? ` → ${esc(F.fmtSlot(x.newSlot))}` : ""}<br><span class="meta">${esc(vet(x.vet_id))}</span></span>
        <span class="left">još ${Math.ceil(x.left)} min</span></button>`).join("") : `<div class="empty"><h2 style="color:var(--color-foreground);font-size:var(--text-lg)">Nema novih zahtjeva</h2><p class="meta">Zahtjevi na koje se ne odgovori u 15 minuta VetDesk potvrđuje sam.</p></div>`;
    const detail = sel ? `<aside class="desk-detail"><div class="card-row"><h2>${KIND[sel.kind]} · ${esc(sel.pet)}</h2><button class="btn btn-ghost btn-icon" aria-label="Zatvori" data-act="s-sel" data-id="">✕</button></div>
      <dl><dt>Vlasnik</dt><dd>${esc(sel.owner)}</dd><dt>Vrsta</dt><dd>${esc(S().types[sel.type])}</dd><dt>Veterinar</dt><dd>${esc(vet(sel.vet_id))}</dd>
        ${sel.newSlot ? `<dt>Sadašnji termin</dt><dd>${esc(F.fmtSlot(sel.slot))}</dd><dt>Novi termin</dt><dd><strong>${esc(F.fmtSlot(sel.newSlot))}</strong></dd>` : `<dt>Termin</dt><dd>${esc(F.fmtSlot(sel.slot))}</dd>`}
        <dt>Preostalo</dt><dd>još ${Math.ceil(sel.left)} min, zatim VetDesk potvrđuje sam</dd></dl>
      ${r.rejecting ? reasonForm(sel.kind === "cancel" ? REASONS.cancel : REASONS.appt, r, "s-reject-send") : `<div class="actions"><button class="btn btn-primary" data-act="s-approve" data-id="${sel.id}" data-mine="${sel.mine}">Odobri</button><button class="btn btn-outline" data-act="s-reject-open">Odbij</button></div>`}
      ${sel.mine ? `<button class="btn btn-ghost" data-act="s-compose" data-pet="${S().bookings.find(b => b.id === sel.id).pet_id}">Pošalji poruku vlasniku</button>` : ""}${spec("../features/f-10-reception/index.html?state=appts-detail")}</aside>` : "";
    return shell("reception", tabs, "appts", body, detail);
  }
  function reasonForm(list, r, act) {
    return `<fieldset class="field"><legend>Razlog <span class="badge badge-unconfirmed" title="Placeholder (Q-010)">Nepotvrđeno</span></legend><div class="option-list">${list.map(x => `<label class="option"><input type="radio" name="reason" value="${esc(x)}" ${r.reason === x ? "checked" : ""} data-act="s-reason"><span class="option-body">${esc(x)}</span></label>`).join("")}</div>
      <label class="label meta" for="rt">Poruka vlasniku (nije obavezno)</label><textarea id="rt" class="input"></textarea></fieldset>
      <div class="actions"><button class="btn btn-destructive" data-act="${act}" ${r.reason ? "" : "disabled"}>Odbij zahtjev</button><button class="btn btn-outline" data-act="s-reject-cancel">Natrag</button></div>`;
  }
  function rxRow(x, r) {
    return `<button class="row row-rx" data-act="s-sel" data-id="${x.id}" aria-current="${r.sel === x.id}"><span><span class="when">${esc(F.pet(x.pet_id).name)}</span><br><span class="meta">${esc(S().owner.name)}</span></span><span>${esc(x.medicine)}<br><span class="meta">${esc(x.dose)}</span></span><span class="meta">zatraženo ${esc(x.request.sent_at.slice(11))}</span></button>`;
  }
  function rxDetail(x, r, role) {
    if (!x) return "";
    const lc = S().consultations.filter(k => k.pet_id === x.pet_id).sort((a, b) => b.date.localeCompare(a.date))[0];
    const facts = `<dl><dt>Ljubimac</dt><dd>${esc(F.pet(x.pet_id).name)}</dd><dt>Lijek</dt><dd><strong>${esc(x.medicine)}</strong></dd><dt>Doza</dt><dd>${esc(x.dose)}</dd>
      <dt>Zadnji pregled</dt><dd>${lc ? `${esc(F.fmtDate(lc.date))}, ${esc(vet(lc.vet_id))}` : "Nema"}</dd><dt>Zadnje izdavanje</dt><dd>${esc(F.fmtDate(x.last_dispensed))}</dd>
      ${x.request.note ? `<dt>Napomena vlasnika</dt><dd>${esc(x.request.note)}</dd>` : ""}</dl>`;
    const actions = role === "vet"
      ? (r.rejecting ? reasonForm(REASONS.vet, r, "v-decline") : `<section class="field"><label class="label" for="pickup" style="font-size:var(--text-sm);font-weight:var(--font-weight-heading)">Preuzimanje od</label><input id="pickup" class="input" type="date" value="${F.day(S().now)}" min="${F.day(S().now)}" style="max-width:200px"></section>
        <div class="actions"><button class="btn btn-primary" data-act="v-approve" data-id="${x.id}">Odobri</button><button class="btn btn-outline" data-act="s-reject-open">Odbij</button></div>`)
      : (r.rejecting ? reasonForm(REASONS.admin, r, "a-decline") : `<div class="actions"><button class="btn btn-outline" data-act="s-reject-open">Odbij (administrativno)</button></div>`);
    return `<aside class="desk-detail"><div class="card-row"><h2>Zahtjev za recept</h2><button class="btn btn-ghost btn-icon" aria-label="Zatvori" data-act="s-sel" data-id="">✕</button></div>${facts}${actions}${spec("../features/f-10-reception/index.html?role=vet&state=rx-detail")}</aside>`;
  }

  function sent() {
    const list = S().messages.slice().sort((a, b) => b.sent_at.localeCompare(a.sent_at));
    const status = m => m.read_at ? `Pročitano ${esc(F.fmtDate(m.read_at))} ${esc(m.read_at.slice(11))}` : (F.t(S().now) - F.t(m.sent_at)) / 36e5 >= 24 ? `<span class="badge badge-rejected">Nije pročitano. Razmislite o pozivu</span>` : `<span class="meta">Poslano ${esc(F.fmtDate(m.sent_at))} ${esc(m.sent_at.slice(11))}</span>`;
    return `<div class="card-row"><h2 style="color:var(--color-foreground);font-size:var(--text-base);margin:0">Poslane poruke</h2><button class="btn btn-primary" data-act="s-compose">Nova poruka</button></div>
      ${list.map(m => `<div class="row row-rx" style="cursor:default"><span><span class="when">${esc(S().owner.name)}</span><br><span class="meta">${esc(F.pet(m.pet_id).name)} · poslala ${esc(m.by)}</span></span><span class="truncate" style="display:block">${esc(m.text)}</span><span style="text-align:right">${status(m)}</span></div>`).join("")}${spec("../features/f-13-messages/index.html?side=reception&state=sent")}`;
  }
  function compose(r) {
    const pid = r.pet || S().pets[0].id, p = F.pet(pid);
    const tpl = TEMPLATES[r.tpl == null ? -1 : r.tpl];
    const text = r.text != null ? r.text : tpl ? tpl[1].replace("{pet}", p.name) : "";
    return `<h2 style="color:var(--color-foreground);font-size:var(--text-base);margin:0">Nova poruka</h2><div style="max-width:640px;display:flex;flex-direction:column;gap:var(--space-4)">
      <p><strong>${esc(S().owner.name)}</strong> · ${esc(S().owner.phone)} <span class="meta">(u povezanom prototipu poruke idu Ivani)</span></p>
      <section class="field"><label class="label" for="mp" style="font-size:var(--text-sm);font-weight:var(--font-weight-heading)">Ljubimac</label><select id="mp" class="select" data-act="s-mpet">${S().pets.map(x => `<option value="${x.id}" ${x.id === pid ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select></section>
      <section class="field"><h3 style="font-size:var(--text-sm)">Predložak</h3><div class="chips">${TEMPLATES.map((x, i) => `<button type="button" class="btn btn-outline chip" aria-pressed="${r.tpl === i}" data-act="s-tpl" data-i="${i}">${esc(x[0])}</button>`).join("")}</div></section>
      <section class="field"><label class="label" for="mt" style="font-size:var(--text-sm);font-weight:var(--font-weight-heading)">Poruka</label><textarea id="mt" class="input" maxlength="500" data-act="s-text">${esc(text)}</textarea></section>
      <p class="meta">Šalje se u aplikaciju, s push obaviješću. Vlasnik ne može odgovoriti.</p>
      <div class="actions"><button class="btn btn-primary" data-act="s-send-msg" data-pet="${pid}">Pošalji</button><button class="btn btn-outline" data-act="s-tab" data-to="messages">Odustani</button></div></div>${spec("../features/f-13-messages/index.html?side=reception&state=compose-filled")}`;
  }

  function vetView(r) {
    const rxs = rxQueue();
    return shell("vet", [["rx", "Zahtjevi za recepte", rxs.length]], "rx", rxs.length ? rxs.map(x => rxRow(x, r)).join("") : `<div class="empty"><p>Nema zahtjeva za recepte.</p><p class="meta">Kad vlasnik zatraži obnovu, zahtjev se pojavi ovdje.</p></div>`, r.sel ? rxDetail(rxs.find(x => x.id === r.sel), r, "vet") : "");
  }

  function handle(act, el, r, ui, role) {
    const d = el.dataset;
    const set = extra => A.go(role, Object.assign({}, r, extra));
    switch (act) {
      case "s-tab": go(role, d.to); return true;
      case "s-sel": set({ sel: d.id || null, rejecting: false, reason: null }); return true;
      case "s-reject-open": set({ rejecting: true }); return true;
      case "s-reject-cancel": set({ rejecting: false, reason: null }); return true;
      case "s-approve": if (d.mine === "true") A.approve(d.id); else A.dismissOther(d.id); ui.toast("Odobreno. Vlasnik je obaviješten."); set({ sel: null }); return true;
      case "s-reject-send": { const text = (document.getElementById("rt") || {}).value; if (S().bookings.some(b => b.id === r.sel)) A.reject(r.sel, r.reason, text); else A.dismissOther(r.sel); ui.toast("Zahtjev je odbijen. Vlasnik je obaviješten."); set({ sel: null, rejecting: false, reason: null }); return true; }
      case "v-approve": A.approveRx(d.id, (document.getElementById("pickup") || {}).value || F.day(S().now)); ui.toast("Recept je odobren"); set({ sel: null }); return true;
      case "v-decline": case "a-decline": A.declineRx(r.sel, r.reason, (document.getElementById("rt") || {}).value); ui.toast("Zahtjev za recept je odbijen"); set({ sel: null, rejecting: false, reason: null }); return true;
      case "s-compose": go("reception", "compose", { pet: d.pet || null, tpl: d.pet ? 0 : null, text: null }); A.setRole("reception"); return true;
      case "s-tpl": set({ tpl: +d.i, text: null }); return true;
      case "s-send-msg": {
        const text = document.getElementById("mt").value.trim(); if (!text) { ui.toast("Upišite poruku"); return true; }
        const tpl = TEMPLATES[r.tpl], p = F.pet(d.pet);
        let link = null;
        if (tpl && tpl[2] === "consult") { const k = S().consultations.filter(x => x.pet_id === p.id).sort((a, b) => b.date.localeCompare(a.date))[0]; if (k) link = { to: "record", kid: k.id, label: `Pregled ${F.fmtDate(k.date)}` }; }
        if (tpl && tpl[2] === "appt") link = { to: "appointments", label: "Termini" };
        A.sendMessage(p.id, text, link); ui.toast("Poruka je poslana"); go("reception", "messages"); return true;
      }
    }
    return false;
  }
  function change(act, el, r, role) {
    if (act === "s-reason") { A.go(role, Object.assign({}, r, { reason: el.value })); return true; }
    if (act === "s-mpet") { A.go(role, Object.assign({}, r, { pet: el.value, text: null })); return true; }
    return false;
  }
  function input(act, el, r, role) { if (act === "s-text") { r.text = el.value; A.go(role, r); } }

  F.staff = { reception, vet: vetView, handle, change, input };
})();

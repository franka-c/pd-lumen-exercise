// Ivana's app in the connected prototype. Screens follow the feature rules pages;
// edge states stay on the feature pages, linked as "Specifikacija ovog ekrana".
(function () {
  const F = window.Flow, A = F.A;
  const S = () => F.S;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const today = () => F.day(S().now);
  const vet = v => S().vets[v].name, clinic = c => S().clinics[c];
  const spec = href => `<a class="meta flow-spec" href="${href}">Specifikacija ovog ekrana</a>`;
  const plural = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11) ? one : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? few : many;
  const go = (name, extra) => { A.go("owner", Object.assign({ name }, extra || {})); };

  // ---------- derived ----------
  const upcoming = () => S().bookings.filter(b => ["requested", "confirmed", "not_confirmed"].includes(b.status) && F.t(b.slot_start) >= F.t(S().now)).sort((a, b) => a.slot_start.localeCompare(b.slot_start));
  const canRenew = r => !r.request || r.request.status === "declined" ? today() >= F.day(F.addMin(r.next_eligible + "T12:00", -7 * 1440)) : false;
  function todo(pid) {
    const items = [];
    for (const b of upcoming().filter(b => b.status === "not_confirmed")) items.push({ pet: b.pet_id, sort: "0", html: `<p class="card-title">${esc(F.pet(b.pet_id).name)}: termin nije potvrđen</p><p>${esc(b.reason)}</p><div><button class="btn btn-primary" data-act="pick-another" data-id="${b.id}">Odaberi drugi termin</button></div>` });
    for (const d of S().due) {
      const booked = S().bookings.some(b => b.pet_id === d.pet_id && b.type === "vaccination" && ["requested", "confirmed"].includes(b.status) && F.day(b.slot_start) >= today());
      const over = d.due_date < today();
      items.push({ pet: d.pet_id, sort: (over ? "1" : "3") + d.due_date, html: `<p class="card-title">${esc(F.pet(d.pet_id).name)}: ${esc(d.type.charAt(0).toLowerCase() + d.type.slice(1))}</p>
        <p>${over ? "Dospjelo" : "Dospijeva"} ${esc(F.fmtDate(d.due_date))}</p>
        <div>${booked ? `<p class="meta">Termin rezerviran</p>` : `<button class="btn btn-primary" data-act="book" data-pet="${d.pet_id}" data-type="vaccination" data-clinic="${d.clinic_id}">Rezerviraj</button>`}</div>` });
    }
    for (const r of S().prescriptions) {
      if (r.request && r.request.status === "approved" && today() <= r.request.pickup) items.push({ pet: r.pet_id, sort: "2", html: `<p class="card-title">${esc(F.pet(r.pet_id).name)}: ${esc(r.medicine)}</p><p>Odobreno, preuzimanje od ${esc(F.fmtDate(r.request.pickup))}.</p>` });
      else if (r.request && r.request.status === "requested") items.push({ pet: r.pet_id, sort: "2", html: `<p class="card-title">${esc(F.pet(r.pet_id).name)}: ${esc(r.medicine)}</p><p class="meta">Zatraženo, čeka veterinara</p>` });
      else if (canRenew(r)) items.push({ pet: r.pet_id, sort: "2", html: `<p class="card-title">${esc(F.pet(r.pet_id).name)}: ${esc(r.medicine)}</p><p>Možete zatražiti obnovu.</p><div><button class="btn btn-primary" data-act="renew" data-id="${r.id}">Zatraži obnovu</button></div>` });
    }
    return items.filter(i => !pid || i.pet === pid).sort((a, b) => a.sort.localeCompare(b.sort));
  }
  const needs = pid => todo(pid).some(i => !/Termin rezerviran|čeka veterinara|Odobreno/.test(i.html));

  // ---------- screens ----------
  function avatar(p, size, ring) {
    const inner = p.photo ? `<img src="${p.photo}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-full)">` : esc(p.name[0]);
    return `<span class="pet-avatar ${ring ? "has-ring" : ""}" style="width:${size}px;height:${size}px">${inner}</span>`;
  }
  function countdown(b) {
    const days = Math.round((F.t(F.day(b.slot_start) + "T00:00") - F.t(today() + "T00:00")) / 864e5);
    return days === 0 ? `DANAS U ${b.slot_start.slice(11)}` : days === 1 ? "SUTRA" : `ZA ${days} ${plural(days, "DAN", "DANA", "DANA")}`;
  }

  function home(r) {
    const pid = r.pet || null, pets = S().pets;
    const row = `<div class="pets-row" role="tablist" aria-label="Ljubimci">
      <button class="pet-chip" role="tab" aria-selected="${!pid}" data-act="filter" data-pet=""><span class="pet-avatar is-all" style="width:64px;height:64px">Svi</span><span>Svi</span></button>
      ${pets.map(p => `<button class="pet-chip" role="tab" aria-selected="${pid === p.id}" data-act="filter" data-pet="${p.id}" data-check="chip-${p.id}">${avatar(p, 64, needs(p.id))}<span>${esc(p.name)}</span></button>`).join("")}</div>`;
    const next = upcoming().filter(b => b.status !== "not_confirmed" && (!pid || b.pet_id === pid))[0];
    const hero = next ? `<section class="hero" data-check="hero">
        <p class="hero-count">${countdown(next)}</p>
        <p class="hero-date">${esc(F.fmtSlot(next.slot_start))}</p>
        <p>${esc(F.pet(next.pet_id).name)} · ${esc(S().types[next.type])} · ${esc(vet(next.vet_id))}</p>
        ${next.status === "requested" ? `<p><span class="badge hero-badge">Zatraženo, čeka potvrdu klinike</span></p>` : ""}
        ${next.pending ? `<p><span class="badge hero-badge">${next.pending.kind === "move" ? `Premještanje na ${esc(F.fmtSlot(next.pending.slot_start))}, čeka potvrdu klinike` : "Otkazivanje zatraženo, čeka potvrdu klinike"}</span></p>` : ""}
        <div>${next.status === "requested" ? `<button class="btn btn-on-primary" data-act="nav" data-to="appointments">Pogledaj</button>` : next.pending ? "" : `<button class="btn btn-on-primary" data-act="change" data-id="${next.id}">Promijeni ili otkaži</button>`}</div>
      </section>`
      : `<section class="hero hero-empty" data-check="hero-empty"><p class="hero-date">Nemate zakazanih termina</p><div><button class="btn btn-on-primary" data-act="book" data-pet="${pid || ""}">Rezerviraj termin</button></div></section>`;
    const items = todo(pid);
    const msgs = S().messages.filter(m => !pid || m.pet_id === pid).slice().sort((a, b) => b.sent_at.localeCompare(a.sent_at));
    const unread = msgs.filter(m => !m.read_at).length;
    return `<header class="topbar"><h1>Dobar dan, ${esc(S().owner.first)}</h1></header>
      <main class="content" data-check="home">${row}${hero}
        ${items.length ? `<section class="field"><h2 class="section-title">Treba napraviti</h2>${items.map(i => `<article class="card">${i.html}</article>`).join("")}</section>` : ""}
        ${msgs.length ? `<section class="field"><h2 class="section-title">Od vaše klinike${unread ? ` <span class="count">${unread} ${plural(unread, "nova", "nove", "novih")}</span>` : ""}</h2><div class="option-list">${msgs.slice(0, 3).map(msgRow).join("")}</div>
          ${msgs.length > 3 ? `<button class="btn btn-outline" data-act="nav" data-to="messages">Prikaži sve</button>` : ""}</section>` : ""}
        ${spec("../features/f-07-home/index.html")}</main>`;
  }
  function msgRow(m) {
    return `<button class="option" style="font:inherit;color:inherit;background:var(--color-background);text-align:left;align-items:flex-start" data-act="open-msg" data-id="${m.id}">
      <span style="width:8px;height:8px;margin-top:8px;border-radius:var(--radius-full);flex:none;background:${m.read_at ? "transparent" : "var(--color-primary)"}" aria-label="${m.read_at ? "" : "Nepročitano"}"></span>
      <span class="option-body"><span class="truncate" style="display:block;${m.read_at ? "" : "font-weight:var(--font-weight-heading)"}">${esc(m.text)}</span><span class="meta">${esc(clinic(F.pet(m.pet_id).clinic_id).name)} · ${esc(F.fmtDate(m.sent_at))} ${esc(m.sent_at.slice(11))}</span></span></button>`;
  }
  function message(r) {
    const m = S().messages.find(x => x.id === r.id); A.readMessage(m.id);
    const c = clinic(F.pet(m.pet_id).clinic_id);
    return back("Od vaše klinike", "home") + `<main class="content"><p class="meta">${esc(c.name)} · ${esc(F.fmtDate(m.sent_at))} ${esc(m.sent_at.slice(11))}</p>
      <p style="overflow-wrap:anywhere">${esc(m.text)}</p>${m.link ? `<button class="btn btn-primary" data-act="nav" data-to="${m.link.to}" data-pet="${m.pet_id}" data-kid="${m.link.kid || ""}">Pogledaj: ${esc(m.link.label)}</button>` : ""}
      <div class="alert"><p>Na ovu poruku ne možete odgovoriti. Za pitanja nazovite kliniku.</p><a class="btn btn-outline" href="tel:${c.phone.replace(/ /g, "")}">Nazovi ${esc(c.phone)}</a></div>${spec("../features/f-13-messages/index.html?side=owner&state=message")}</main>`;
  }
  function messages() { const all = S().messages.slice().sort((a, b) => b.sent_at.localeCompare(a.sent_at)); return back("Od vaše klinike", "home") + `<main class="content"><div class="option-list">${all.map(msgRow).join("")}</div></main>`; }

  function back(title, to, extra) { return `<header class="topbar"><button class="btn btn-ghost btn-icon" aria-label="Natrag" data-act="nav" data-to="${to}" ${extra || ""}>‹</button><h1 class="truncate">${esc(title)}</h1></header>`; }

  function appointments() {
    const list = upcoming();
    const card = b => {
      const head = b.status === "requested" ? `<span class="badge badge-requested">Zatraženo, čeka potvrdu klinike</span>` : b.status === "not_confirmed" ? `<span class="badge badge-rejected">Nije potvrđeno</span>` : `<span class="badge badge-confirmed">Potvrđeno</span>`;
      const mins = (F.t(b.slot_start) - F.t(S().now)) / 60000;
      let action;
      if (b.status === "requested") action = `<button class="btn btn-outline" data-act="cancel-req" data-id="${b.id}">Otkaži zahtjev</button>`;
      else if (b.status === "not_confirmed") action = `<p><strong>${esc(b.reason)}</strong></p>${b.reason_text ? `<p>${esc(b.reason_text)}</p>` : ""}<button class="btn btn-primary" data-act="pick-another" data-id="${b.id}">Odaberi drugi termin</button>`;
      else if (b.pending && b.pending.kind === "move") action = `<p class="meta"><strong>Premještanje na ${esc(F.fmtSlot(b.pending.slot_start))}, čeka potvrdu klinike</strong></p><button class="btn btn-outline" data-act="withdraw" data-id="${b.id}">Odustani od promjene</button>`;
      else if (b.pending) action = `<p class="meta"><strong>Otkazivanje zatraženo, čeka potvrdu klinike</strong></p>`;
      else if (mins <= 15) action = `<p class="meta">Za promjene nazovite kliniku: ${esc(clinic(b.clinic_id).phone)}</p>`;
      else action = `<button class="btn btn-outline" data-act="change" data-id="${b.id}">Promijeni ili otkaži</button>`;
      return `<article class="card" data-check="appt-${b.id}"><div>${head}</div><p class="card-title">${esc(F.fmtSlot(b.slot_start))}</p>
        <p class="meta">${esc(F.pet(b.pet_id).name)} · ${esc(S().types[b.type])}</p><p class="meta">${esc(clinic(b.clinic_id).name)}, ${esc(vet(b.vet_id))}</p><div>${action}</div></article>`;
    };
    return `<header class="topbar"><h1>Termini</h1></header><main class="content">
      ${list.length ? list.map(card).join("") : `<div class="empty"><h2>Nemate nadolazećih termina</h2></div>`}
      <button class="btn btn-primary btn-lg" data-act="book">Rezerviraj termin</button>${spec("../features/f-05-booking/index.html")}</main>`;
  }

  // Booking (F-05) and moving (F-06) share the day and time picker.
  function picker(f, vet_id, type, exclude) {
    const days = Array.from({ length: 28 }, (_, i) => F.day(F.addMin(today() + "T12:00", i * 1440)));
    const dayBtns = days.map(d => { const n = F.freeTimes(vet_id, type, d).filter(x => `${d}T${x}` !== exclude).length, dt = new Date(d + "T12:00:00Z");
      return `<button type="button" class="btn btn-outline day ${n ? "" : "is-empty"}" aria-pressed="${f.day === d}" data-act="f-day" data-v="${d}"><small>${F.DAYS[dt.getUTCDay()]}</small>${dt.getUTCDate()}<small>${F.MONTHS[dt.getUTCMonth()].slice(0, 3)}</small></button>`; }).join("");
    const times = f.day ? F.freeTimes(vet_id, type, f.day).filter(x => `${f.day}T${x}` !== exclude) : [];
    return `<div class="days" role="group" aria-label="Dan">${dayBtns}</div>${!f.day ? `<p class="meta">Odaberite dan.</p>` : times.length
      ? `<div class="times">${times.map(x => `<button type="button" class="btn btn-outline time" aria-pressed="${f.time === x}" data-act="f-time" data-v="${x}">${x}</button>`).join("")}</div>` : `<div class="alert"><p>Nema slobodnih termina ovaj dan.</p></div>`}`;
  }
  function book(r) {
    const f = r;
    const p = f.pet_id && F.pet(f.pet_id);
    const c = f.clinic_id && clinic(f.clinic_id);
    const vets = c ? Object.entries(S().vets).filter(([, v]) => v.clinic_id === f.clinic_id).sort(([a], [b]) => (b === p.vet_id) - (a === p.vet_id)) : [];
    const ready = f.pet_id && f.clinic_id && f.vet_id && f.type && f.day && f.time;
    let warn = "";
    if (f.type === "emergency") warn = `<div class="alert"><p class="alert-title">Za hitne slučajeve nazovite kliniku</p><a class="btn btn-outline" href="tel:${c.phone.replace(/ /g, "")}">Nazovi ${esc(c.phone)}</a></div>`;
    if (f.type === "vaccination" && p) { const d = S().due.filter(x => x.pet_id === p.id); if (d.length && !d.some(x => x.due_date <= F.day(F.addMin(today() + "T12:00", 14 * 1440)))) warn = `<div class="alert"><p>${esc(p.name)} trenutno nema dospjelo cijepljenje. Sljedeće je ${esc(F.fmtDate(d[0].due_date))}.</p></div>`; }
    return back("Novi termin", "appointments") + `<main class="content">
      <fieldset class="field"><legend>Ljubimac</legend><div class="chips">${S().pets.map(x => `<button type="button" class="btn btn-outline chip" aria-pressed="${f.pet_id === x.id}" data-act="f-pet" data-v="${x.id}">${esc(x.name)}</button>`).join("")}</div></fieldset>
      ${p ? `<section class="field"><label class="label" for="cl" style="font-size:var(--text-sm);font-weight:var(--font-weight-heading)">Klinika</label><select id="cl" class="select" data-act="f-clinic">${Object.entries(S().clinics).map(([k, v]) => `<option value="${k}" ${k === f.clinic_id ? "selected" : ""}>${esc(v.name)}${k === p.clinic_id ? " (vaša klinika)" : ""}</option>`).join("")}</select></section>
      <fieldset class="field"><legend>Veterinar</legend><div class="option-list">${vets.map(([k, v]) => `<label class="option"><input type="radio" name="vet" value="${k}" ${k === f.vet_id ? "checked" : ""} data-act="f-vet"><span class="option-body"><span>${esc(v.name)}</span>${k === p.vet_id ? `<span class="meta">Vaš veterinar</span>` : ""}</span></label>`).join("")}</div></fieldset>` : ""}
      ${f.vet_id ? `<fieldset class="field"><legend>Vrsta pregleda</legend><div class="chips">${c.types.map(x => `<button type="button" class="btn btn-outline chip" aria-pressed="${f.type === x}" data-act="f-type" data-v="${x}">${esc(S().types[x])}</button>`).join("")}</div>${warn}</fieldset>` : ""}
      ${f.type ? `<section class="field"><h2 class="label" style="font-size:var(--text-sm)">Datum i vrijeme</h2>${picker(f, f.vet_id, f.type)}</section>` : ""}
      ${spec("../features/f-05-booking/index.html?state=book")}</main>
      <div class="footer"><button class="btn btn-primary btn-lg btn-block" data-act="send-booking" ${ready ? "" : "disabled"}>Pošalji zahtjev</button></div>`;
  }
  function move(r) {
    const b = S().bookings.find(x => x.id === r.bid);
    return back("Promijeni termin", "appointments") + `<main class="content"><section class="card"><p class="meta">Trenutni termin</p><p class="card-title">${esc(F.fmtSlot(b.slot_start))}</p><p class="meta">Ostaje dok klinika ne potvrdi novi termin.</p></section>
      <section class="field"><h2 class="label" style="font-size:var(--text-sm)">Novi datum i vrijeme</h2>${picker(r, b.vet_id, b.type, b.slot_start)}</section>${spec("../features/f-06-move-cancel/index.html?state=move")}</main>
      <div class="footer"><button class="btn btn-primary btn-lg btn-block" data-act="send-move" ${r.day && r.time ? "" : "disabled"}>Pošalji zahtjev za promjenu</button></div>`;
  }

  function pets() {
    return `<header class="topbar"><h1>Moji ljubimci</h1></header><main class="content">${S().pets.map(p => `<button class="card" style="flex-direction:row;align-items:center;text-align:left;font:inherit;color:inherit;cursor:pointer;width:100%" data-act="nav" data-to="pet" data-pet="${p.id}">
      ${avatar(p, 56, needs(p.id))}<span style="display:flex;flex-direction:column;min-width:0"><span class="card-title">${esc(p.name)}</span><span class="meta truncate">${esc(p.species)}, ${esc(p.breed)}</span><span class="meta">${esc(clinic(p.clinic_id).name)}</span></span></button>`).join("")}${spec("../features/f-02-pets/index.html")}</main>`;
  }
  function petPage(r) {
    const p = F.pet(r.pet);
    return back(p.name, "pets") + `<main class="content"><section style="display:flex;flex-direction:column;align-items:center;gap:var(--space-3)">${avatar(p, 112, false)}<h2 style="font-size:var(--text-xl)">${esc(p.name)}</h2>
        <label class="btn btn-outline">${p.photo ? "Promijeni fotografiju" : "Dodaj fotografiju"}<input type="file" accept="image/*" class="sr-only" data-act="photo" data-pet="${p.id}"></label></section>
      <section class="card"><dl style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--space-2) var(--space-3);margin:0"><dt class="meta">Vrsta</dt><dd style="margin:0">${esc(p.species)}, ${esc(p.breed)}</dd><dt class="meta">Klinika</dt><dd style="margin:0">${esc(clinic(p.clinic_id).name)}</dd><dt class="meta">Veterinar</dt><dd style="margin:0">${esc(vet(p.vet_id))}</dd></dl></section>
      <button class="btn btn-primary btn-lg" data-act="book" data-pet="${p.id}">Rezerviraj termin</button>
      <nav class="option-list">${[["record", "Karton"], ["vacc", "Cijepljenja"], ["rx", "Recepti"]].map(([to, l]) => `<button class="option" style="font:inherit;color:inherit;background:var(--color-background);justify-content:space-between" data-act="nav" data-to="${to}" data-pet="${p.id}"><span>${l}</span><span aria-hidden="true">›</span></button>`).join("")}</nav></main>`;
  }
  function record(r) {
    const p = F.pet(r.pet), list = S().consultations.filter(k => k.pet_id === p.id);
    if (r.kid) { const k = list.find(x => x.id === r.kid); return back(F.fmtDate(k.date), "record", `data-pet="${p.id}"`) + `<main class="content"><p class="meta">${esc(k.type)} · ${esc(vet(k.vet_id))}</p>${k.note ? `<p>${esc(k.note)}</p>` : `<div class="alert"><p>Bilješke za ovaj pregled nisu dostupne u aplikaciji. Za pitanja se javite klinici.</p></div>`}
      ${k.docs.map(d => `<div class="option"><span class="badge badge-requested">${d.kind}</span><span class="option-body">${esc(d.name)}</span></div>`).join("")}${spec("../features/f-03-record/index.html?state=consult")}</main>`; }
    return back(`Karton · ${p.name}`, "pet", `data-pet="${p.id}"`) + `<main class="content">${list.map(k => `<button class="card" style="text-align:left;font:inherit;color:inherit;cursor:pointer" data-act="nav" data-to="record" data-pet="${p.id}" data-kid="${k.id}"><span class="card-title">${esc(F.fmtDate(k.date))} · ${esc(k.type)}</span><span class="meta">${esc(vet(k.vet_id))}</span><span class="truncate" style="display:block">${k.note ? esc(k.note) : `<span class="meta">Bilješke nisu dostupne u aplikaciji</span>`}</span></button>`).join("")}${spec("../features/f-03-record/index.html")}</main>`;
  }
  function vacc(r) {
    const p = F.pet(r.pet), due = S().due.filter(d => d.pet_id === p.id).sort((a, b) => a.due_date.localeCompare(b.due_date));
    return back(`Cijepljenja · ${p.name}`, "pet", `data-pet="${p.id}"`) + `<main class="content"><section class="field"><h2 class="section-title">Dospijeva</h2>${due.map(d => { const booked = S().bookings.some(b => b.pet_id === p.id && b.type === "vaccination" && ["requested", "confirmed"].includes(b.status) && F.day(b.slot_start) >= today());
        return `<article class="card"><p class="card-title">${esc(d.type)}</p><p>${d.due_date < today() ? "Dospjelo" : "Dospijeva"} ${esc(F.fmtDate(d.due_date))}</p><div>${booked ? `<p class="meta">Termin rezerviran</p>` : `<button class="btn btn-primary" data-act="book" data-pet="${p.id}" data-type="vaccination" data-clinic="${d.clinic_id}">Rezerviraj</button>`}</div></article>`; }).join("") || `<p class="meta">Nema dospjelih cijepljenja.</p>`}</section>
      <section class="field"><h2 class="section-title">Povijest</h2><div class="option-list">${S().vaccHistory.filter(h => h.pet_id === p.id).map(h => `<div class="option"><span class="option-body"><span>${esc(h.name)}</span><span class="meta">${esc(F.fmtDate(h.date))} · ${esc(vet(h.vet_id))}</span></span></div>`).join("")}</div></section>${spec("../features/f-04-vaccinations/index.html")}</main>`;
  }
  function rx(r) {
    const p = F.pet(r.pet), list = S().prescriptions.filter(x => x.pet_id === p.id);
    const block = x => { const q = x.request;
      if (q && q.status === "requested") return `<div class="alert"><p class="alert-title">Zatraženo, čeka veterinara</p><button class="btn btn-outline" data-act="withdraw-rx" data-id="${x.id}">Povuci zahtjev</button></div>`;
      if (q && q.status === "approved") return `<div class="alert"><p class="alert-title">Odobreno</p><p>Preuzimanje od ${esc(F.fmtDate(q.pickup))}.</p></div>`;
      const dec = q && q.status === "declined" ? `<div class="alert alert-error"><p class="alert-title">Nije odobreno</p><p>${esc(q.reason)}</p>${q.vet_text ? `<p>${esc(q.vet_text)}</p>` : ""}</div>` : "";
      return dec + (canRenew(x) ? `<div><button class="btn btn-primary" data-act="renew" data-id="${x.id}">${dec ? "Zatraži ponovno" : "Zatraži obnovu"}</button></div>` : `<p class="meta">Obnovu možete zatražiti od ${esc(F.fmtDate(F.day(F.addMin(x.next_eligible + "T12:00", -7 * 1440))))}.</p>`); };
    return back(`Recepti · ${p.name}`, "pet", `data-pet="${p.id}"`) + `<main class="content">${list.map(x => `<article class="card"><p class="card-title">${esc(x.medicine)}</p><p>${esc(x.dose)}</p><p class="meta">Zadnje izdavanje ${esc(F.fmtDate(x.last_dispensed))} · sljedeće moguće ${esc(F.fmtDate(x.next_eligible))}</p>${block(x)}</article>`).join("") || `<p class="meta">${esc(p.name)} nema ponovljenih recepata.</p>`}${spec("../features/f-08-f-09-prescriptions/index.html")}</main>`;
  }
  function rxRequest(r) {
    const x = S().prescriptions.find(y => y.id === r.id), p = F.pet(x.pet_id), lc = S().consultations.filter(k => k.pet_id === p.id).sort((a, b) => b.date.localeCompare(a.date))[0];
    return back("Zahtjev za obnovu", "rx", `data-pet="${p.id}"`) + `<main class="content"><p>Veterinar će vidjeti:</p><section class="card"><dl style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--space-2) var(--space-3);margin:0">
      <dt class="meta">Ljubimac</dt><dd style="margin:0">${esc(p.name)}</dd><dt class="meta">Lijek</dt><dd style="margin:0"><strong>${esc(x.medicine)}</strong></dd><dt class="meta">Doza</dt><dd style="margin:0">${esc(x.dose)}</dd>
      <dt class="meta">Zadnji pregled</dt><dd style="margin:0">${lc ? `${esc(F.fmtDate(lc.date))}, ${esc(vet(lc.vet_id))}` : "Nema"}</dd><dt class="meta">Zadnje izdavanje</dt><dd style="margin:0">${esc(F.fmtDate(x.last_dispensed))}</dd></dl></section>
      <section class="field"><label class="label" for="note" style="font-size:var(--text-sm);font-weight:var(--font-weight-heading)">Napomena za veterinara (nije obavezno)</label><textarea id="note" class="input" maxlength="300" data-act="note"></textarea><p class="meta">Veterinar ne može odgovoriti na napomenu.</p></section>
      ${spec("../features/f-08-f-09-prescriptions/index.html?state=request")}</main><div class="footer"><button class="btn btn-primary btn-lg btn-block" data-act="send-renewal" data-id="${x.id}">Pošalji zahtjev</button></div>`;
  }
  function account() {
    const o = S().owner;
    return `<header class="topbar"><h1>Račun</h1></header><main class="content"><section class="card"><dl style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--space-2) var(--space-3);margin:0"><dt class="meta">Ime</dt><dd style="margin:0">${esc(o.name)}</dd><dt class="meta">E-mail</dt><dd style="margin:0">${esc(o.email)}</dd><dt class="meta">Telefon</dt><dd style="margin:0">${esc(o.phone)}</dd></dl><p class="meta">Za promjenu podataka javite se svojoj klinici.</p></section>
      <div class="option"><span class="option-body">Obavijesti</span><span class="badge badge-unconfirmed">Uskoro</span></div><button class="btn btn-outline btn-lg" data-act="signout">Odjava</button>${spec("../features/f-01-sign-in/index.html?state=account")}</main>`;
  }
  function signin() {
    return `<main class="content" style="justify-content:center"><h1 style="text-align:center">Lumen</h1><p style="text-align:center">Termini, podsjetnici i karton vašeg ljubimca na jednom mjestu.</p>
      <section class="field"><label class="label" for="id" style="font-size:var(--text-sm);font-weight:var(--font-weight-heading)">E-mail ili broj telefona</label><input id="id" class="input" value="${esc(S().owner.email)}" autocomplete="username"></section>
      <section class="field"><label class="label" for="pw" style="font-size:var(--text-sm);font-weight:var(--font-weight-heading)">Lozinka</label><input id="pw" class="input" type="password" value="prototip" autocomplete="current-password"><p class="meta">[Prototip] Prijava prihvaća bilo koju lozinku.</p></section>
      <button class="btn btn-primary btn-lg" data-act="signin" data-check="signin">Prijava</button>${spec("../features/f-01-sign-in/index.html")}</main>`;
  }

  const TABS = [["home", "Početna"], ["appointments", "Termini"], ["pets", "Moji ljubimci"], ["account", "Račun"]];
  const TAB_OF = { home: "home", message: "home", messages: "home", appointments: "appointments", book: "appointments", move: "appointments", pets: "pets", pet: "pets", record: "pets", vacc: "pets", rx: "pets", rxRequest: "pets", account: "account" };
  function render(r) {
    if (!S().signedIn) return signin();
    const screens = { home, message, messages, appointments, book, move, pets, pet: petPage, record, vacc, rx, rxRequest, account };
    const active = TAB_OF[r.name] || "home";
    return (screens[r.name] || home)(r) + `<nav class="footer" aria-label="Glavna navigacija" style="flex-direction:row;gap:var(--space-1)">${TABS.map(([k, l]) => `<button class="tab" style="flex:1" aria-selected="${k === active}" ${k === active ? 'aria-current="page"' : ""} data-act="nav" data-to="${k}">${l}</button>`).join("")}</nav>`;
  }

  // ---------- events ----------
  function handle(act, el, r, ui) {
    const d = el.dataset;
    switch (act) {
      case "signin": A.signIn(); return true;
      case "signout": ui.sheet({ title: "Odjaviti se?", body: "Za ponovnu prijavu trebat ćete e-mail ili broj telefona i lozinku.", actions: [["Odjava", () => A.signOut(), "destructive"]] }); return true;
      case "nav": go(d.to, { pet: d.pet || r.pet, kid: d.kid || undefined }); return true;
      case "filter": go("home", { pet: d.pet || null }); return true;
      case "open-msg": go("message", { id: d.id }); return true;
      case "book": { const pid = d.pet || (S().pets.length === 1 ? S().pets[0].id : null), p = pid && F.pet(pid);
        go("book", { pet_id: pid, clinic_id: d.clinic || (p && p.clinic_id) || null, vet_id: p && (!d.clinic || d.clinic === p.clinic_id) ? p.vet_id : null, type: d.type || null, day: null, time: null }); return true; }
      case "pick-another": { const b = S().bookings.find(x => x.id === d.id); go("book", { pet_id: b.pet_id, clinic_id: b.clinic_id, vet_id: b.vet_id, type: b.type, day: null, time: null, replaces: b.id }); return true; }
      case "f-pet": { const p = F.pet(d.v); Object.assign(r, { pet_id: p.id, clinic_id: p.clinic_id, vet_id: p.vet_id, type: null, day: null, time: null }); go("book", r); return true; }
      case "f-type": Object.assign(r, { type: d.v, time: null }); go(r.name, r); return true;
      case "f-day": Object.assign(r, { day: d.v, time: null }); go(r.name, r); return true;
      case "f-time": r.time = d.v; go(r.name, r); return true;
      case "send-booking": if (r.replaces) A.cancelRequest(r.replaces); A.book(r); ui.toast("Zahtjev je poslan"); go("appointments"); return true;
      case "cancel-req": ui.sheet({ title: "Otkazati zahtjev?", body: "Klinika ga neće primiti. Ovo se ne može poništiti.", actions: [["Otkaži zahtjev", () => { A.cancelRequest(d.id); ui.toast("Zahtjev je otkazan"); }, "destructive"]] }); return true;
      case "change": ui.sheet({ title: F.fmtSlot(S().bookings.find(x => x.id === d.id).slot_start), actions: [["Promijeni termin", () => go("move", { bid: d.id, day: null, time: null })], ["Otkaži termin", () => cancelSheet(d.id, ui)]] }); return true;
      case "send-move": A.requestMove(r.bid, r.day, r.time); ui.toast("Zahtjev za promjenu je poslan"); go("appointments"); return true;
      case "withdraw": A.withdrawMove(d.id); ui.toast("Promjena je povučena"); return true;
      case "renew": go("rxRequest", { id: d.id, pet: S().prescriptions.find(x => x.id === d.id).pet_id }); return true;
      case "send-renewal": A.requestRenewal(d.id, (document.getElementById("note") || {}).value); ui.toast("Zahtjev je poslan veterinaru"); go("rx", { pet: r.pet }); return true;
      case "withdraw-rx": ui.sheet({ title: "Povući zahtjev?", body: "Veterinar ga neće dobiti. Obnovu možete ponovno zatražiti.", actions: [["Povuci zahtjev", () => { A.withdrawRenewal(d.id); ui.toast("Zahtjev je povučen"); }, "destructive"]] }); return true;
    }
    return false;
  }
  function cancelSheet(bid, ui) {
    const b = S().bookings.find(x => x.id === bid), late = F.t(b.slot_start) - F.t(S().now) < 864e5;
    ui.sheet({ title: "Otkazati termin?", body: `${F.fmtSlot(b.slot_start)}, ${F.pet(b.pet_id).name}. Klinika ima 15 minuta da potvrdi otkazivanje.`,
      note: late ? "Otkazivanje manje od 24 sata prije termina može se naplatiti. (Nepotvrđeno, Q-014)" : null,
      actions: [["Otkaži termin", () => { A.requestCancel(bid); ui.toast("Zahtjev za otkazivanje je poslan"); }, "destructive"]] });
  }
  function change(act, el, r) {
    const d = el.dataset;
    if (act === "f-clinic") { Object.assign(r, { clinic_id: el.value, vet_id: null, type: null, day: null, time: null }); go("book", r); return true; }
    if (act === "f-vet") { Object.assign(r, { vet_id: el.value, time: null }); go("book", r); return true; }
    if (act === "photo" && el.files[0]) { const fr = new FileReader(); fr.onload = () => { A.setPhoto(d.pet, fr.result); window.FlowUI.render(); }; fr.readAsDataURL(el.files[0]); return false; }
    return false;
  }

  F.owner = { render, handle, change };
})();

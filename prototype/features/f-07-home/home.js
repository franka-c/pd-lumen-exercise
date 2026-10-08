// F-07 Home, and the reminders by push and email. Plain JS, no backend.
// Every state is reachable with ?state=<id>; ?long=1 long content; ?text=200 double text size.
(function () {
  const M = window.MOCK;
  const params = new URLSearchParams(location.search);
  const STATE = params.get("state") || "home";
  const LONG = params.get("long") === "1";
  if (params.get("text") === "200") document.documentElement.classList.add("text-200");

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DAYS = ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"];
  const DAYS_SHORT = ["ned", "pon", "uto", "sri", "čet", "pet", "sub"];
  const MONTHS = ["siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja", "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"];
  const day = s => new Date(s.slice(0, 10) + "T12:00:00Z");
  const fmtShort = s => { const d = day(s); return `${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]}`; };
  const fmtSlot = iso => { const d = day(iso); return `${DAYS_SHORT[d.getUTCDay()]}, ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} u ${iso.slice(11, 16)}`; };

  let due = JSON.parse(JSON.stringify(M.due)), next = JSON.parse(JSON.stringify(M.nextAppointment));
  if (LONG) { due[1].pet = M.longPet; due[1].type = M.longType; }
  const app = { view: "home", mode: "default", push: null, email: null, focus: null };

  // Pet names are never declined: the app cannot decline every name correctly, so
  // texts put the name first, "Rex: …".
  const pushes = {
    "vacc-14": () => { const v = due[0]; return { title: `${v.pet}: za 14 dana dospijeva cijepljenje`, body: `${v.type}, ${fmtShort(v.due_date)}. ${M.clinics[v.clinic_id].name}.`, when: "sada", focus: v.pet_id }; },
    "vacc-day": () => { const v = due[1]; return { title: `${v.pet}: danas dospijeva cijepljenje`, body: `${v.type}. Rezervirajte termin u aplikaciji.`, when: fmtShort(v.due_date) + " u 08:00", focus: v.pet_id }; },
    "appt": () => ({ title: `Sutra u ${next.slot_start.slice(11, 16)}: ${next.pet}, ${next.type.toLowerCase()}`, body: `${M.clinics[next.clinic_id].name}, ${M.vets[next.vet_id]}.`, when: fmtShort(new Date(Date.parse(next.slot_start) - 864e5).toISOString()) + " u 18:00", focus: "next" })
  };

  function boot() {
    const s = STATE;
    if (s === "home-requested") next.status = "requested";
    if (s === "home-empty") { due = []; next = null; }
    if (s === "home-loading") app.mode = "loading";
    if (s === "home-error") app.mode = "error";
    if (s === "home-stale") app.mode = "stale";
    if (s.startsWith("push-")) app.push = s.slice(5);
    if (s.startsWith("email-")) { app.view = "email"; app.email = s.slice(6); }
    render();
  }

  function card(focus, html) { return `<article class="card" ${app.focus === focus ? 'style="border-color:var(--color-primary);box-shadow:0 0 0 1px var(--color-primary)"' : ""} data-check="card-${focus}">${html}</article>`; }

  function renderHome() {
    let body;
    if (app.mode === "loading") body = `<div class="skeleton" style="min-height:120px" data-check="loading"></div>`.repeat(3);
    else if (app.mode === "error") body = `<div class="alert alert-error" role="alert" data-check="error"><p>Početnu nije moguće učitati.</p><button class="btn btn-outline" data-act="retry">Pokušaj ponovno</button></div>`;
    else {
      const stale = app.mode === "stale" ? `<div class="alert" role="status" data-check="stale"><p>Podaci od ${M.cachedAt}. Osvježavanje nije uspjelo.</p><button class="btn btn-outline" data-act="retry">Pokušaj ponovno</button></div>` : "";
      const days = next ? Math.round((Date.parse(next.slot_start.slice(0, 10)) - Date.parse(M.today)) / 864e5) : 0;
      const count = days === 0 ? `DANAS U ${next && next.slot_start.slice(11, 16)}` : days === 1 ? "SUTRA" : `ZA ${days} DANA`;
      const pets = `<div class="pets-row" role="tablist" aria-label="Ljubimci" data-check="pets-row">
          <button class="pet-chip" role="tab" aria-selected="true"><span class="pet-avatar is-all" style="width:64px;height:64px">Svi</span><span>Svi</span></button>
          ${M.pets.map(p => `<button class="pet-chip" role="tab" aria-selected="false"><span class="pet-avatar ${p.needs ? "has-ring" : ""}" style="width:64px;height:64px">${esc(p.name[0])}</span><span>${esc(p.name)}</span></button>`).join("")}</div>`;
      const nextCard = next ? `<section class="hero" ${app.focus === "next" ? 'style="outline:3px solid var(--color-foreground);outline-offset:2px"' : ""} data-check="card-next">
          <p class="hero-count" data-check="countdown">${count}</p><p class="hero-date">${esc(fmtSlot(next.slot_start))}</p>
          <p>${esc(next.pet)} · ${esc(next.type)} · ${esc(M.vets[next.vet_id])}</p>
          ${next.status === "requested" ? `<p><span class="badge hero-badge">Zatraženo, čeka potvrdu klinike</span></p>` : ""}
          <div>${next.status === "requested" ? `<a class="btn btn-on-primary" href="../f-05-booking/index.html?state=list">Pogledaj</a>` : `<a class="btn btn-on-primary" href="../f-06-move-cancel/index.html?state=actions-sheet" data-check="change">Promijeni ili otkaži</a>`}</div></section>`
        : `<section class="hero hero-empty" data-check="hero-empty"><p class="hero-date">Nemate zakazanih termina</p><div><a class="btn btn-on-primary" href="../f-05-booking/index.html?state=book">Rezerviraj termin</a></div></section>`;
      const dueCards = due.slice().sort((a, b) => a.due_date.localeCompare(b.due_date)).map(v => card(v.pet_id, `
          <p class="card-title" style="overflow-wrap:anywhere" data-check="due-title">${esc(v.pet)}: ${esc(v.type.charAt(0).toLowerCase() + v.type.slice(1))}</p>
          <p data-check="${v.due_date < M.today ? "overdue" : "upcoming"}">${v.due_date < M.today ? "Dospjelo" : "Dospijeva"} ${esc(fmtShort(v.due_date))}</p>
          <p class="meta">${esc(M.clinics[v.clinic_id].name)}</p>
          <div><a class="btn btn-primary" href="../f-05-booking/index.html?state=book&pet=${v.pet_id}&type=vaccination&clinic=${v.clinic_id}">Rezerviraj</a></div>`)).join("");
      const later = `<section class="field" data-check="from-clinic"><h2 style="font-size:var(--text-base)">Od vaše klinike</h2>
          <a class="option" style="color:inherit;text-decoration:none;align-items:flex-start" href="../f-13-messages/index.html?side=owner&state=message"><span style="width:8px;height:8px;margin-top:8px;border-radius:var(--radius-full);flex:none;background:var(--color-primary)" aria-label="Nepročitano"></span>
          <span class="option-body"><span class="truncate" style="display:block;font-weight:var(--font-weight-heading)">Rex: nalazi su stigli. Možete ih pogledati u kartonu u aplikaciji ili nas nazovite.</span><span class="meta">Lumen Trešnjevka · danas 09:15</span></span></a>
          <a class="btn btn-outline" href="../f-13-messages/index.html?side=owner&state=all">Prikaži sve</a></section>
        <article class="card" data-check="renewal"><p class="card-title">Rex: Caninsulin 40 IU/ml</p><p>Možete zatražiti obnovu.</p><div><a class="btn btn-primary" href="../f-08-f-09-prescriptions/index.html?state=request">Zatraži obnovu</a></div></article>`;
      body = stale + pets + nextCard + (due.length ? `<h2 class="section-title">Treba napraviti</h2>` : "") + dueCards + later;
    }
    return `<header class="topbar"><h1>Dobar dan, ${esc(M.owner.first_name)}</h1></header>
      <main class="content"><div style="display:flex;flex-direction:column;gap:var(--space-3)" data-check="home">${body}</div></main>${tabbar()}`;
  }

  function tabbar() {
    const items = [["home", "Početna", null], ["appointments", "Termini", "../f-05-booking/index.html?state=list"], ["pets", "Moji ljubimci", "../f-02-pets/index.html"], ["account", "Račun", "../f-01-sign-in/index.html?state=account"]];
    return `<nav class="footer" aria-label="Glavna navigacija" style="flex-direction:row;gap:var(--space-1)">${items.map(([k, l, href]) => href
      ? `<a class="tab" style="flex:1;text-align:center;text-decoration:none" href="${href}">${l}</a>`
      : `<button class="tab" style="flex:1" aria-current="page" aria-selected="true">${l}</button>`).join("")}</nav>`;
  }

  // An email as an email client shows it, at most 600 px wide.
  function renderEmail() {
    const isAppt = app.email === "appt", v = due[0], c = M.clinics[isAppt ? next.clinic_id : v.clinic_id];
    const subject = isAppt ? `Podsjetnik: termin ${fmtShort(next.slot_start)} u ${next.slot_start.slice(11, 16)}` : `Podsjetnik: cijepljenje, ${v.pet}`;
    const lines = isAppt
      ? [`Imate termin ${DAYS[day(next.slot_start).getUTCDay()]}, ${fmtShort(next.slot_start)} u ${next.slot_start.slice(11, 16)}.`, `${next.pet}, ${next.type.toLowerCase()}. ${c.name}, ${M.vets[next.vet_id]}.`, "Ako ne možete doći, promijenite ili otkažite termin u aplikaciji ili nazovite kliniku."]
      : [`${v.pet}: ${v.type.charAt(0).toLowerCase() + v.type.slice(1)} dospijeva ${fmtShort(v.due_date)}.`, `Termin možete rezervirati u aplikaciji ili pozivom klinici ${c.name}.`];
    return `<div style="background:var(--color-muted);min-height:100vh;padding:var(--space-4)" data-check="email">
      <p class="meta" style="max-width:600px;margin:0 auto var(--space-2);overflow-wrap:anywhere">[Prototip] Prikaz e-maila. Od: Lumen &lt;podsjetnici@lumen.example&gt; · Za: ${esc(M.owner.email)}</p>
      <article style="max-width:600px;margin:0 auto;background:var(--color-background);border:var(--border-width) solid var(--color-border);border-radius:var(--radius);padding:var(--space-6);display:flex;flex-direction:column;gap:var(--space-4)">
        <p class="meta" data-check="subject"><strong>Predmet:</strong> ${esc(subject)}</p>
        <h1 style="font-size:var(--text-xl);line-height:var(--leading-xl);color:var(--color-primary)">Lumen</h1>
        <p>Dobar dan, ${esc(M.owner.first_name)},</p>${lines.map(l => `<p style="overflow-wrap:anywhere">${esc(l)}</p>`).join("")}
        <div style="display:flex;flex-wrap:wrap;gap:var(--space-2)"><a class="btn btn-primary btn-lg" href="index.html" data-check="open-app">Otvori u aplikaciji</a>
        <a class="btn btn-outline btn-lg" href="tel:${c.phone.replace(/ /g, "")}">Nazovi ${esc(c.phone)}</a></div>
        <hr style="border:0;border-top:var(--border-width) solid var(--color-border);width:100%">
        <p class="meta" data-check="footer">Primate ovu poruku jer ste klijent klinike Lumen. <span class="badge badge-unconfirmed" title="Unsubscribe link: Q-020">Odjava: nepotvrđeno</span></p>
      </article></div>`;
  }

  function render() {
    document.getElementById("app").innerHTML = app.view === "email" ? renderEmail() : renderHome();
    document.querySelector(".app").classList.toggle("is-email", app.view === "email");
    const p = app.push && pushes[app.push]();
    document.getElementById("overlays").innerHTML = p ? `<button class="push" data-act="push-open" data-focus="${p.focus}" data-check="push"><small>Lumen · ${esc(p.when)}</small><br><strong>${esc(p.title)}</strong><br><span class="meta">${esc(p.body)}</span></button>` : "";
    renderPanel();
  }

  const STATES = { "Početna": ["home", "home-requested", "home-empty", "home-loading", "home-error", "home-stale"], "Push": ["push-vacc-14", "push-vacc-day", "push-appt"], "E-mail": ["email-vacc", "email-appt"] };
  function renderPanel() {
    const el = document.getElementById("proto-panel"), open = el.classList.contains("open");
    const link = s => { const q = new URLSearchParams(location.search); q.set("state", s); return `<a href="?${q}" aria-current="${s === STATE}">${s}</a>`; };
    const toggle = (k, v, label) => { const q = new URLSearchParams(location.search); const on = q.get(k) === v; on ? q.delete(k) : q.set(k, v); return `<a href="?${q}">${on ? "☑" : "☐"} ${label}</a>`; };
    el.innerHTML = `<button data-act="panel">PROTOTIP · stanja</button><div class="proto-body">
      ${Object.entries(STATES).map(([g, l]) => `<h4>${g}</h4>${l.map(link).join("")}`).join("")}
      <h4>Sadržaj</h4>${toggle("long", "1", "dugi tekst")}${toggle("text", "200", "tekst 200%")}
      <h4>Dokumentacija</h4><a href="../../rules/f-07-home.md">Pravila (rules page)</a><a href="#devdoc">Ugovor podataka ↓</a></div>`;
    if (open) el.classList.add("open");
  }

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    if (t.dataset.act === "panel") { document.getElementById("proto-panel").classList.toggle("open"); return; }
    if (t.dataset.act === "retry") app.mode = "default";
    if (t.dataset.act === "push-open") { app.push = null; app.view = "home"; app.focus = t.dataset.focus; render(); const c = document.querySelector(`[data-check=card-${app.focus}]`); if (c) c.scrollIntoView({ block: "center" }); return; }
    render();
  });

  boot();
})();

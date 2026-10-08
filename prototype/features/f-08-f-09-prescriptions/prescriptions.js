// F-08 repeat prescriptions and F-09 renewal requests. Plain JS, no backend.
// Every state is reachable with ?state=<id>; ?long=1 long content; ?text=200 double text size.
(function () {
  const M = window.MOCK;
  const params = new URLSearchParams(location.search);
  const STATE = params.get("state") || "rx";
  const LONG = params.get("long") === "1";
  if (params.get("text") === "200") document.documentElement.classList.add("text-200");

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MONTHS = ["siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja", "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"];
  const d = s => new Date(s + "T12:00:00Z");
  const fmtDate = s => `${d(s).getUTCDate()}. ${MONTHS[d(s).getUTCMonth()]} ${d(s).getUTCFullYear()}.`;
  const fmtShort = s => `${d(s).getUTCDate()}. ${MONTHS[d(s).getUTCMonth()]}`;
  const addDays = (s, n) => new Date(d(s).getTime() + n * 864e5).toISOString().slice(0, 10);
  const plural = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11) ? one : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? few : many;
  const leftText = n => `Još ${n} ${plural(n, "znak", "znaka", "znakova")}. Veterinar ne može odgovoriti na napomenu.`;
  const opensOn = rx => addDays(rx.next_eligible, -M.earlyDays);
  const canRequest = rx => M.today >= opensOn(rx);

  let rxs = JSON.parse(JSON.stringify(M.prescriptions)).map(r => ({ ...r, request: null }));
  if (LONG) Object.assign(rxs[0], M.long);
  const app = { view: "rx", mode: "default", rxId: null, note: "", sending: false, error: false, failNext: false, sheet: null, toast: null, push: null };

  function boot() {
    const s = STATE, r = rxs[0];
    if (s === "rx-requested") r.request = { status: "requested", sent: "2026-10-20T09:40" };
    if (s === "rx-approved") r.request = { status: "approved", pickup: "2026-10-23" };
    if (s === "rx-declined") r.request = { status: "declined", reason: "needs_checkup", vet_text: "Molim dođite na kontrolu glukoze prije sljedećeg pakiranja." };
    if (s === "rx-none") rxs = [];
    if (s === "rx-loading") app.mode = "loading";
    if (s === "rx-error") app.mode = "error";
    if (s === "rx-stale") app.mode = "stale";
    if (s.startsWith("request")) { app.view = "request"; app.rxId = "rx-1"; }
    if (s === "request-note") app.note = "Zadnja dva tjedna pije više vode nego inače. Inače je dobro.";
    if (s === "request-note-long") app.note = "Zadnja dva tjedna pije više vode nego inače. ".repeat(10).slice(0, M.noteMax);
    if (s === "request-sending") app.sending = true;
    if (s === "request-error") app.error = true;
    if (s === "withdraw-sheet") { r.request = { status: "requested", sent: "2026-10-20T09:40" }; app.sheet = "withdraw"; }
    if (s === "home-card") app.view = "home";
    if (s === "home-approved") { app.view = "home"; r.request = { status: "approved", pickup: "2026-10-23" }; }
    if (s === "push-approved") { r.request = { status: "approved", pickup: "2026-10-23" }; app.push = { title: `${M.pet.name}: recept je odobren`, body: `${r.medicine}. Preuzimanje od ${fmtShort("2026-10-23")}, ${M.pet.clinic}.` }; }
    if (s === "push-declined") { r.request = { status: "declined", reason: "needs_checkup", vet_text: "Molim dođite na kontrolu glukoze prije sljedećeg pakiranja." }; app.push = { title: `${M.pet.name}: recept nije odobren`, body: `${r.medicine}. ${M.reasons.needs_checkup}.` }; }
    render();
  }

  function toast(t) { app.toast = t; render(); clearTimeout(toast.t); toast.t = setTimeout(() => { app.toast = null; render(); }, 3000); }

  function statusBlock(r) {
    const q = r.request;
    if (q && q.status === "requested") return `<div class="alert" data-check="status-requested"><p class="alert-title">Zatraženo, čeka veterinara</p><p>Recept odobrava veterinar.</p>
      <button class="btn btn-outline" data-act="withdraw" data-id="${r.id}">Povuci zahtjev</button></div>`;
    if (q && q.status === "approved") return `<div class="alert" data-check="status-approved"><p class="alert-title">Odobreno</p><p>Preuzimanje od ${esc(fmtDate(q.pickup))} u klinici ${esc(M.pet.clinic)}.</p></div>`;
    const declined = q && q.status === "declined" ? `<div class="alert alert-error" data-check="status-declined"><p class="alert-title">Nije odobreno</p><p>${esc(M.reasons[q.reason])} <span class="badge badge-unconfirmed" title="Placeholder reason (Q-010)">Nepotvrđeno</span></p>${q.vet_text ? `<p style="overflow-wrap:anywhere">${esc(q.vet_text)}</p>` : ""}</div>` : "";
    const btn = canRequest(r)
      ? `<a class="btn btn-primary" href="?state=request" data-act="start" data-id="${r.id}" data-check="request-btn">${declined ? "Zatraži ponovno" : "Zatraži obnovu"}</a>`
      : `<button class="btn btn-primary" disabled data-check="request-btn">Zatraži obnovu</button><p class="meta" data-check="opens-on">Obnovu možete zatražiti od ${esc(fmtShort(opensOn(r)))}. ${unconf()}</p>`;
    return declined + `<div>${btn}</div>`;
  }
  const unconf = () => `<span class="badge badge-unconfirmed" title="7 days is ours (Q-021)">Nepotvrđeno</span>`;

  function renderList() {
    let body;
    if (app.mode === "loading") body = `<div class="skeleton" style="min-height:140px" data-check="loading"></div>`.repeat(2);
    else if (app.mode === "error") body = `<div class="alert alert-error" role="alert" data-check="error"><p>Recepte nije moguće učitati.</p><button class="btn btn-outline" data-act="retry">Pokušaj ponovno</button></div>`;
    else {
      const stale = app.mode === "stale" ? `<div class="alert" role="status" data-check="stale"><p>Podaci od ${M.cachedAt}. Osvježavanje nije uspjelo.</p><button class="btn btn-outline" data-act="retry">Pokušaj ponovno</button></div>` : "";
      const active = rxs.length ? rxs.map(r => `<article class="card" data-check="rx-${r.id}">
          <p class="card-title" style="overflow-wrap:anywhere" data-check="medicine">${esc(r.medicine)}</p><p style="overflow-wrap:anywhere">${esc(r.dose)}</p>
          <dl style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--space-1) var(--space-3);margin:0" class="meta">
            <dt>Zadnje izdavanje</dt><dd style="margin:0">${esc(fmtDate(r.last_dispensed))}</dd><dt>Sljedeće moguće</dt><dd style="margin:0">${esc(fmtDate(r.next_eligible))}</dd></dl>
          ${statusBlock(r)}</article>`).join("")
        : `<div class="empty" data-check="none"><p>${esc(M.pet.name)} nema ponovljenih recepata.</p><p class="meta">Recept propisuje veterinar na pregledu.</p></div>`;
      const hist = M.history.map(h => `<div class="option" style="cursor:default"><span class="option-body"><span style="overflow-wrap:anywhere">${esc(h.medicine)}</span>
          <span class="meta">Zatraženo ${esc(fmtShort(h.requested))} · ${h.outcome === "approved" ? `odobreno, preuzimanje od ${esc(fmtShort(h.pickup))}` : `nije odobreno: ${esc(M.reasons[h.reason])}`}</span></span></div>`).join("");
      body = stale + `<section class="field"><h2 style="font-size:var(--text-base)">Aktivni recepti</h2>${active}</section>`
        + (rxs.length ? `<section class="field"><h2 style="font-size:var(--text-base)">Povijest</h2><div class="option-list" data-check="history">${hist}</div></section>` : "");
    }
    return `<header class="topbar"><button class="btn btn-ghost btn-icon" aria-label="Natrag" data-act="back-pet">‹</button><h1 class="truncate">Recepti · ${esc(M.pet.name)}</h1></header>
      <main class="content" data-check="rx-list">${body}</main>`;
  }

  // F-09: the request shows exactly what the vet will see (D-004).
  function renderRequest() {
    const r = rxs.find(x => x.id === app.rxId), lc = M.lastConsultation;
    const left = M.noteMax - app.note.length;
    return `<header class="topbar"><button class="btn btn-ghost btn-icon" aria-label="Natrag" data-act="back">‹</button><h1>Zahtjev za obnovu</h1></header>
      <main class="content" data-check="request">
        <p>Veterinar će vidjeti:</p>
        <section class="card" data-check="vet-sees"><dl style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--space-2) var(--space-3);margin:0">
          <dt class="meta">Ljubimac</dt><dd style="margin:0">${esc(M.pet.name)}</dd>
          <dt class="meta">Lijek</dt><dd style="margin:0"><strong>${esc(r.medicine)}</strong></dd><dt class="meta">Doza</dt><dd style="margin:0">${esc(r.dose)}</dd>
          <dt class="meta">Zadnji pregled</dt><dd style="margin:0">${esc(fmtDate(lc.date))}, ${esc(M.vets[lc.vet_id])}</dd>
          <dt class="meta">Zadnje izdavanje</dt><dd style="margin:0">${esc(fmtDate(r.last_dispensed))}</dd></dl></section>
        <section class="field"><label class="label" for="note" style="font-size:var(--text-sm);font-weight:var(--font-weight-heading)">Napomena za veterinara (nije obavezno)</label>
          <textarea id="note" class="input" maxlength="${M.noteMax}" data-act="note" data-check="note">${esc(app.note)}</textarea>
          <p class="meta" data-check="note-left" aria-live="polite">${leftText(left)}</p></section>
        <p class="meta">Recept odobrava veterinar. Odgovor obično stiže isti dan. <span class="badge badge-unconfirmed" title="Not from Lumen">Nepotvrđeno</span></p>
        ${app.error ? `<div class="alert alert-error" role="alert" data-check="send-error"><p>Zahtjev nije poslan. Provjerite vezu i pokušajte ponovno.</p></div>` : ""}
      </main>
      <div class="footer"><button class="btn btn-primary btn-lg btn-block" data-act="send" data-check="send" ${app.sending ? "disabled" : ""} aria-busy="${app.sending}">${app.sending ? "Šaljem…" : app.error ? "Pokušaj ponovno" : "Pošalji zahtjev"}</button></div>`;
  }

  // F-09 on Home: the renewal card, from 7 days before the next eligible date.
  function renderHome() {
    const cards = rxs.filter(r => canRequest(r) || (r.request && r.request.status === "approved" && M.today <= r.request.pickup)).map(r => {
      const q = r.request;
      if (q && q.status === "approved") return `<article class="card" data-check="home-approved"><p class="card-title">${esc(M.pet.name)}: ${esc(r.medicine)}</p><p>Odobreno, preuzimanje od ${esc(fmtShort(q.pickup))}.</p><p class="meta">${esc(M.pet.clinic)}</p></article>`;
      return `<article class="card" data-check="home-renewal"><p class="card-title" style="overflow-wrap:anywhere">${esc(M.pet.name)}: ${esc(r.medicine)}</p><p>Možete zatražiti obnovu.</p>
        <div><a class="btn btn-primary" href="?state=request" data-act="start" data-id="${r.id}">Zatraži obnovu</a></div></article>`;
    }).join("");
    return `<header class="topbar"><h1>Početna</h1></header><main class="content"><p class="meta">[Prototip] Izvadak Početne: kartica za obnovu (F-09). Ostatak Početne je F-07.</p>
      <div style="display:flex;flex-direction:column;gap:var(--space-3)">${cards}</div><a class="btn btn-outline" href="../f-07-home/index.html">Cijela Početna (F-07)</a></main>`;
  }

  function render() {
    document.getElementById("app").innerHTML = app.view === "request" ? renderRequest() : app.view === "home" ? renderHome() : renderList();
    document.getElementById("overlays").innerHTML = (app.sheet === "withdraw" ? `<div class="scrim" data-act="sheet-close"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t" data-stop>
        <h2 id="sh-t">Povući zahtjev?</h2><p class="meta">Veterinar ga neće dobiti. Obnovu možete ponovno zatražiti.</p>
        <div class="actions"><button class="btn btn-destructive btn-lg" data-act="withdraw-confirm">Povuci zahtjev</button><button class="btn btn-outline btn-lg" data-act="sheet-close">Natrag</button></div></div></div>` : "")
      + (app.push ? `<button class="push" data-act="push-open" data-check="push"><small>Lumen · sada</small><br><strong>${esc(app.push.title)}</strong><br><span class="meta">${esc(app.push.body)}</span></button>` : "")
      + (app.toast ? `<div class="toast" role="status">${esc(app.toast)}</div>` : "");
    renderPanel();
  }

  const STATES = { "F-08 Recepti": ["rx", "rx-requested", "rx-approved", "rx-declined", "rx-none", "rx-loading", "rx-error", "rx-stale", "withdraw-sheet"], "F-09 Zahtjev": ["request", "request-note", "request-note-long", "request-sending", "request-error"], "F-09 Početna i push": ["home-card", "home-approved", "push-approved", "push-declined"] };
  function renderPanel() {
    const el = document.getElementById("proto-panel"), open = el.classList.contains("open");
    const link = s => { const q = new URLSearchParams(location.search); q.set("state", s); return `<a href="?${q}" aria-current="${s === STATE}">${s}</a>`; };
    const toggle = (k, v, label) => { const q = new URLSearchParams(location.search); const on = q.get(k) === v; on ? q.delete(k) : q.set(k, v); return `<a href="?${q}">${on ? "☑" : "☐"} ${label}</a>`; };
    el.innerHTML = `<button data-act="panel">PROTOTIP · stanja</button><div class="proto-body">
      ${Object.entries(STATES).map(([g, l]) => `<h4>${g}</h4>${l.map(link).join("")}`).join("")}
      <h4>Sadržaj</h4>${toggle("long", "1", "dugi tekst")}${toggle("text", "200", "tekst 200%")}
      <h4>Simulacija</h4><button data-act="fail">→ sljedeće slanje: greška</button><button data-act="vet-approve">→ veterinar odobrava</button><button data-act="vet-decline">→ veterinar odbija</button>
      <h4>Dokumentacija</h4><a href="../../rules/f-08-f-09-prescriptions.md">Pravila (rules page)</a><a href="#devdoc">Ugovor podataka ↓</a><a href="../f-10-reception/index.html?role=vet&state=rx-detail">F-10 pogled veterinara</a></div>`;
    if (open) el.classList.add("open");
  }

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    if (t.classList.contains("scrim") && e.target.closest("[data-stop]")) return;
    const r = rxs.find(x => x.id === (t.dataset.id || app.rxId)) || rxs[0];
    switch (t.dataset.act) {
      case "panel": document.getElementById("proto-panel").classList.toggle("open"); return;
      case "back-pet": location.href = "../f-02-pets/index.html?state=pet"; return;
      case "start": e.preventDefault(); app.view = "request"; app.rxId = t.dataset.id; app.note = ""; app.error = false; render(); window.scrollTo(0, 0); return;
      case "back": app.view = "rx"; break;
      case "retry": app.mode = "default"; break;
      case "send":
        if (app.sending) return;
        app.sending = true; app.error = false; render();
        setTimeout(() => {
          app.sending = false;
          if (app.failNext) { app.failNext = false; app.error = true; render(); return; }
          r.request = { status: "requested", sent: M.today, note: app.note }; app.view = "rx"; toast("Zahtjev je poslan veterinaru"); window.scrollTo(0, 0);
        }, 800);
        return;
      case "withdraw": app.sheet = "withdraw"; app.rxId = t.dataset.id; break;
      case "withdraw-confirm": r.request = null; app.sheet = null; toast("Zahtjev je povučen"); return;
      case "sheet-close": app.sheet = null; break;
      case "fail": app.failNext = true; toast("[Prototip] Sljedeće slanje: greška"); return;
      case "vet-approve": { const x = rxs.find(y => y.request && y.request.status === "requested"); if (!x) { toast("[Prototip] Nema zahtjeva na čekanju"); return; } x.request = { status: "approved", pickup: "2026-10-23" }; app.push = { title: `${M.pet.name}: recept je odobren`, body: `${x.medicine}. Preuzimanje od ${fmtShort("2026-10-23")}, ${M.pet.clinic}.` }; app.view = "rx"; break; }
      case "vet-decline": { const x = rxs.find(y => y.request && y.request.status === "requested"); if (!x) { toast("[Prototip] Nema zahtjeva na čekanju"); return; } x.request = { status: "declined", reason: "needs_checkup", vet_text: "" }; app.push = { title: `${M.pet.name}: recept nije odobren`, body: `${x.medicine}. ${M.reasons.needs_checkup}.` }; app.view = "rx"; break; }
      case "push-open": app.push = null; app.view = "rx"; break;
      default: return;
    }
    render();
  });
  document.addEventListener("input", e => {
    if (e.target.dataset.act !== "note") return;
    app.note = e.target.value;
    const left = document.querySelector("[data-check=note-left]");
    if (left) left.textContent = leftText(M.noteMax - app.note.length);
  });

  boot();
})();

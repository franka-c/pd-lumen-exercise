// F-04 vaccinations and due dates. Plain JS, no backend.
// Every state is reachable with ?state=<id>; ?long=1 long content; ?text=200 double text size.
(function () {
  const M = window.MOCK;
  const params = new URLSearchParams(location.search);
  const STATE = params.get("state") || "list";
  const LONG = params.get("long") === "1";
  if (params.get("text") === "200") document.documentElement.classList.add("text-200");

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const DAYS = ["ned", "pon", "uto", "sri", "čet", "pet", "sub"];
  const MONTHS = ["siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja", "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"];
  const fmtDate = s => { const d = new Date(s.slice(0, 10) + "T12:00:00Z"); return `${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}.`; };
  const fmtShort = s => { const d = new Date(s.slice(0, 10) + "T12:00:00Z"); return `${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]}` + (s.slice(0, 4) === M.today.slice(0, 4) ? "" : ` ${d.getUTCFullYear()}.`); };
  const fmtSlot = iso => { const d = new Date(iso.slice(0, 10) + "T12:00:00Z"); return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]}`; };

  let due = JSON.parse(JSON.stringify(M.due)), history = JSON.parse(JSON.stringify(M.history));
  if (LONG) { due[0].type = M.longName; history[2].name = M.longName; }
  const app = { pet: M.pet, mode: "default", booked: false };

  function boot() {
    const s = STATE;
    if (s === "due-booked") app.booked = true;
    if (s === "none-due") due = [];
    if (s === "empty") { due = []; history = []; }
    if (s === "loading") app.mode = "loading";
    if (s === "error") app.mode = "error";
    if (s === "stale") app.mode = "stale";
    if (s === "deceased") app.pet = M.deceasedPet;
    render();
  }

  function render() {
    const p = app.pet, dead = !!p.deceased_on;
    let body;
    if (app.mode === "loading") body = `<div class="skeleton" style="min-height:96px" data-check="loading"></div>`.repeat(3);
    else if (app.mode === "error") body = `<div class="alert alert-error" role="alert" data-check="error"><p>Cijepljenja nije moguće učitati.</p><button class="btn btn-outline" data-act="retry">Pokušaj ponovno</button></div>`;
    else {
      const stale = app.mode === "stale" ? `<div class="alert" role="status" data-check="stale"><p>Podaci od ${M.cachedAt}. Osvježavanje nije uspjelo.</p><button class="btn btn-outline" data-act="retry">Pokušaj ponovno</button></div>` : "";
      // Overdue first, then by date. Nothing is calculated beyond what VetDesk returned (D-014).
      const sorted = due.slice().sort((a, b) => a.due_date.localeCompare(b.due_date));
      const dueBlock = dead ? "" : `<section class="field"><h2 style="font-size:var(--text-base)">Dospijeva</h2>${sorted.length ? sorted.map(v => {
          const overdue = v.due_date < M.today;
          const action = app.booked
            ? `<p class="meta" data-check="booked">Termin rezerviran: ${esc(fmtSlot(M.booking.slot_start))}</p>`
            : `<a class="btn btn-primary" href="../f-05-booking/index.html?state=book&pet=${p.id}&type=vaccination&clinic=${v.clinic_id}" data-check="book">Rezerviraj</a>`;
          return `<article class="card" data-check="due-item">
            <p class="card-title" style="overflow-wrap:anywhere" data-check="due-type">${esc(v.type)}</p>
            <p data-check="${overdue ? "overdue" : "upcoming"}">${overdue ? "Dospjelo" : "Dospijeva"} ${esc(fmtShort(v.due_date))}</p>
            <p class="meta">${esc(M.clinics[v.clinic_id])}</p><div>${action}</div></article>`;
        }).join("") : `<p class="meta" data-check="none-due">Nema dospjelih cijepljenja.</p>`}</section>`;
      const hist = history.slice().sort((a, b) => b.date.localeCompare(a.date));
      const histBlock = `<section class="field"><h2 style="font-size:var(--text-base)">Povijest</h2>${hist.length ? `<div class="option-list">${hist.map(h => `
          <div class="option" style="cursor:default" data-check="history-item"><span class="option-body"><span style="overflow-wrap:anywhere">${esc(h.name)}</span>
          <span class="meta">${esc(fmtDate(h.date))} · ${esc(M.vets[h.vet_id])}, ${esc(M.clinics[h.clinic_id])}</span></span></div>`).join("")}</div>`
        : `<p class="meta" data-check="no-history">Još nema cijepljenja u kartonu.</p>`}</section>`;
      body = stale + dueBlock + histBlock;
    }
    document.getElementById("app").innerHTML = `<header class="topbar"><button class="btn btn-ghost btn-icon" aria-label="Natrag" data-act="back">‹</button><h1 class="truncate">Cijepljenja · ${esc(p.name)}</h1></header>
      <main class="content" data-check="vaccinations">${body}</main>`;
    renderPanel();
  }

  const STATES = ["list", "due-booked", "none-due", "empty", "loading", "error", "stale", "deceased"];
  function renderPanel() {
    const el = document.getElementById("proto-panel"), open = el.classList.contains("open");
    const link = s => { const q = new URLSearchParams(location.search); q.set("state", s); return `<a href="?${q}" aria-current="${s === STATE}">${s}</a>`; };
    const toggle = (k, v, label) => { const q = new URLSearchParams(location.search); const on = q.get(k) === v; on ? q.delete(k) : q.set(k, v); return `<a href="?${q}">${on ? "☑" : "☐"} ${label}</a>`; };
    el.innerHTML = `<button data-act="panel">PROTOTIP · stanja</button><div class="proto-body"><h4>Cijepljenja</h4>${STATES.map(link).join("")}
      <h4>Sadržaj</h4>${toggle("long", "1", "dugi tekst")}${toggle("text", "200", "tekst 200%")}
      <h4>Dokumentacija</h4><a href="../../rules/f-04-vaccinations.md">Pravila (rules page)</a><a href="#devdoc">Ugovor podataka ↓</a><a href="../f-02-pets/index.html?state=pet">F-02 Ljubimac</a></div>`;
    if (open) el.classList.add("open");
  }

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    if (t.dataset.act === "panel") { document.getElementById("proto-panel").classList.toggle("open"); return; }
    if (t.dataset.act === "back") { location.href = `../f-02-pets/index.html?state=${app.pet.deceased_on ? "pet-deceased" : "pet"}`; return; }
    if (t.dataset.act === "retry") { app.mode = "default"; render(); }
  });

  boot();
})();

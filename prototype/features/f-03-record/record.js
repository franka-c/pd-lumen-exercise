// F-03 the pet's record. Plain JS, no backend.
// Every state is reachable with ?state=<id>; ?long=1 long content; ?text=200 double text size.
(function () {
  const M = window.MOCK;
  const params = new URLSearchParams(location.search);
  const STATE = params.get("state") || "record";
  const LONG = params.get("long") === "1";
  if (params.get("text") === "200") document.documentElement.classList.add("text-200");

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MONTHS = ["siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja", "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"];
  const fmtDate = s => { const d = new Date(s + "T12:00:00Z"); return `${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}.`; };
  const plural = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11) ? one : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? few : many;
  const PAGE = 20;

  let list = JSON.parse(JSON.stringify(M.consultations)).sort((a, b) => b.date.localeCompare(a.date));
  if (LONG) list[0].note = M.longNote;
  const app = { view: "record", pet: M.pet, shown: PAGE, mode: "default", consultId: null, doc: null, docError: false, toast: null };

  function boot() {
    const s = STATE;
    if (s === "record-empty") list = [];
    if (s === "record-loading") app.mode = "loading";
    if (s === "record-error") app.mode = "error";
    if (s === "record-stale") app.mode = "stale";
    if (s === "record-all") app.shown = list.length;
    if (s === "record-deceased") app.pet = M.deceasedPet;
    if (s.startsWith("consult")) { app.view = "consult"; app.consultId = s === "consult-no-note" ? "k-2" : s === "consult-no-docs" ? "k-old-1" : "k-1"; }
    if (s.startsWith("doc")) { app.view = "consult"; app.consultId = "k-1"; app.doc = s === "doc-image" ? "d-2" : "d-1"; app.docError = s === "doc-error"; }
    render();
  }

  function toast(t) { app.toast = t; render(); clearTimeout(toast.t); toast.t = setTimeout(() => { app.toast = null; render(); }, 3000); }
  const docCount = n => `${n} ${plural(n, "dokument", "dokumenta", "dokumenata")}`;

  function renderRecord() {
    const header = `<header class="topbar"><button class="btn btn-ghost btn-icon" aria-label="Natrag" data-act="back-pet">‹</button><h1 class="truncate">Karton · ${esc(app.pet.name)}</h1></header>`;
    let body;
    if (app.mode === "loading") body = `<div class="skeleton" style="min-height:76px" data-check="loading"></div>`.repeat(4);
    else if (app.mode === "error") body = `<div class="alert alert-error" role="alert" data-check="error"><p>Karton nije moguće učitati.</p><button class="btn btn-outline" data-act="retry">Pokušaj ponovno</button></div>`;
    else if (!list.length) body = `<div class="empty" data-check="empty"><h2>Još nema pregleda u kartonu</h2><p class="meta">Pregledi će se pojaviti ovdje nakon posjeta klinici.</p></div>`;
    else {
      const items = list.slice(0, app.shown);
      let year = null, rows = "";
      for (const k of items) {
        const y = k.date.slice(0, 4);
        if (y !== year) { rows += `<h2 style="font-size:var(--text-sm);color:var(--color-muted-foreground);margin-top:var(--space-2)" data-check="year">${y}.</h2>`; year = y; }
        rows += `<button class="card" style="text-align:left;font:inherit;color:inherit;cursor:pointer;width:100%;gap:var(--space-1)" data-act="open" data-id="${k.id}" data-check="row-${k.id}">
          <span class="card-row" style="width:100%"><span class="card-title">${esc(fmtDate(k.date))}</span><span class="meta">${esc(k.type)}</span></span>
          <span class="meta" style="overflow-wrap:anywhere">${esc(M.vets[k.vet_id])}, ${esc(k.clinic)}</span>
          <span class="truncate" style="display:block;width:100%" data-check="note-line">${k.note ? esc(k.note) : `<span class="meta">Bilješke nisu dostupne u aplikaciji</span>`}</span>
          ${k.documents.length ? `<span class="meta" data-check="doc-count">${docCount(k.documents.length)}</span>` : ""}
        </button>`;
      }
      const stale = app.mode === "stale" ? `<div class="alert" role="status" data-check="stale"><p>Podaci od ${M.cachedAt}. Osvježavanje nije uspjelo.</p><button class="btn btn-outline" data-act="retry">Pokušaj ponovno</button></div>` : "";
      const ro = app.pet.deceased_on ? `<p class="meta" data-check="read-only">Karton je samo za čitanje.</p>` : "";
      const more = app.shown < list.length ? `<button class="btn btn-outline" data-act="more" data-check="more">Prikaži starije</button>` : "";
      body = stale + ro + rows + more;
    }
    return header + `<main class="content"><div style="display:flex;flex-direction:column;gap:var(--space-3)" data-check="record">${body}</div></main>`;
  }

  function renderConsult() {
    const k = list.find(x => x.id === app.consultId);
    return `<header class="topbar"><button class="btn btn-ghost btn-icon" aria-label="Natrag" data-act="back">‹</button><h1 class="truncate">${esc(fmtDate(k.date))}</h1></header>
      <main class="content" data-check="consult">
        <section class="card"><dl style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--space-2) var(--space-3);margin:0">
          <dt class="meta">Vrsta</dt><dd style="margin:0">${esc(k.type)}</dd><dt class="meta">Veterinar</dt><dd style="margin:0">${esc(M.vets[k.vet_id])}</dd>
          <dt class="meta">Klinika</dt><dd style="margin:0">${esc(k.clinic)}</dd></dl></section>
        <section class="field"><h2 style="font-size:var(--text-base)">Bilješka veterinara</h2>
          ${k.note ? `<p style="white-space:pre-line;overflow-wrap:anywhere" data-check="note">${esc(k.note)}</p>` : `<div class="alert" data-check="no-note"><p>Bilješke za ovaj pregled nisu dostupne u aplikaciji. Za pitanja se javite klinici.</p></div>`}</section>
        ${k.documents.length ? `<section class="field"><h2 style="font-size:var(--text-base)">Dokumenti</h2><div class="option-list">${k.documents.map(d => `
          <button class="option" style="font:inherit;color:inherit;background:var(--color-background);text-align:left" data-act="doc" data-id="${d.id}" data-check="doc-${d.id}">
            <span class="badge badge-requested" style="flex:none">${d.kind === "pdf" ? "PDF" : "Slika"}</span>
            <span class="option-body"><span class="clamp-2" data-check="doc-name">${esc(d.name)}</span><span class="meta">${esc(fmtDate(d.date))}</span></span></button>`).join("")}</div></section>` : ""}
      </main>`;
  }

  function renderViewer() {
    const k = list.find(x => x.id === app.consultId), d = k.documents.find(x => x.id === app.doc);
    const body = app.docError ? `<div class="alert alert-error" role="alert" data-check="doc-error"><p>Dokument nije moguće otvoriti. Pokušajte ponovno.</p><button class="btn btn-outline" data-act="doc-retry">Pokušaj ponovno</button></div>`
      : d.kind === "pdf" ? `<div class="card" style="min-height:420px;align-items:center;justify-content:center" data-check="viewer-pdf"><p class="meta">[Prototip] Prikaz PDF-a: ${esc(d.name)}</p></div>`
      : `<div class="card" style="min-height:320px;align-items:center;justify-content:center;background:var(--color-foreground)" data-check="viewer-image"><p style="color:var(--color-background)">[Prototip] Slika: ${esc(d.name)}</p></div>`;
    return `<div class="scrim" style="align-items:stretch;background:var(--color-background)" role="dialog" aria-modal="true" aria-label="${esc(d.name)}" data-check="viewer">
      <div style="width:100%;max-width:560px;margin:0 auto;display:flex;flex-direction:column">
        <header class="topbar"><button class="btn btn-ghost btn-icon" aria-label="Zatvori" data-act="doc-close">✕</button><h1 class="truncate" style="font-size:var(--text-base)">${esc(d.name)}</h1></header>
        <main class="content">${body}</main>
        ${app.docError ? "" : `<div class="footer" style="flex-direction:row"><button class="btn btn-outline btn-lg" style="flex:1" data-act="share">Podijeli</button><button class="btn btn-outline btn-lg" style="flex:1" data-act="download">Preuzmi</button></div>`}
      </div></div>`;
  }

  function render() {
    document.getElementById("app").innerHTML = app.view === "record" ? renderRecord() : renderConsult();
    document.getElementById("overlays").innerHTML = (app.doc ? renderViewer() : "") + (app.toast ? `<div class="toast" role="status">${esc(app.toast)}</div>` : "");
    renderPanel();
  }

  const STATES = { "Karton": ["record", "record-all", "record-empty", "record-loading", "record-error", "record-stale", "record-deceased"], "Pregled": ["consult", "consult-no-note", "consult-no-docs"], "Dokument": ["doc-pdf", "doc-image", "doc-error"] };
  function renderPanel() {
    const el = document.getElementById("proto-panel"), open = el.classList.contains("open");
    const link = s => { const q = new URLSearchParams(location.search); q.set("state", s); return `<a href="?${q}" aria-current="${s === STATE}">${s}</a>`; };
    const toggle = (k, v, label) => { const q = new URLSearchParams(location.search); const on = q.get(k) === v; on ? q.delete(k) : q.set(k, v); return `<a href="?${q}">${on ? "☑" : "☐"} ${label}</a>`; };
    el.innerHTML = `<button data-act="panel">PROTOTIP · stanja</button><div class="proto-body">
      ${Object.entries(STATES).map(([g, l]) => `<h4>${g}</h4>${l.map(link).join("")}`).join("")}
      <h4>Sadržaj</h4>${toggle("long", "1", "dugi tekst")}${toggle("text", "200", "tekst 200%")}
      <h4>Dokumentacija</h4><a href="../../rules/f-03-record.md">Pravila (rules page)</a><a href="#devdoc">Ugovor podataka ↓</a><a href="../f-02-pets/index.html?state=pet">F-02 Ljubimac</a></div>`;
    if (open) el.classList.add("open");
  }

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    switch (t.dataset.act) {
      case "panel": document.getElementById("proto-panel").classList.toggle("open"); return;
      case "back-pet": location.href = "../f-02-pets/index.html?state=pet"; return;
      case "retry": app.mode = "default"; break;
      case "more": app.shown += PAGE; break;
      case "open": app.view = "consult"; app.consultId = t.dataset.id; render(); window.scrollTo(0, 0); return;
      case "back": app.view = "record"; app.doc = null; break;
      case "doc": app.doc = t.dataset.id; app.docError = false; break;
      case "doc-close": app.doc = null; break;
      case "doc-retry": app.docError = false; break;
      case "share": toast("[Prototip] Otvara sustavni izbornik za dijeljenje"); return;
      case "download": toast("[Prototip] Dokument se sprema na telefon"); return;
      default: return;
    }
    render();
  });

  boot();
})();

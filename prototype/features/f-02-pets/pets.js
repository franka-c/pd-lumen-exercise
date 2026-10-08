// F-02 My pets: the list and the pet's page. Plain JS, no backend.
// Every state is reachable with ?state=<id>; ?long=1 long content; ?text=200 double text size.
(function () {
  const M = window.MOCK;
  const params = new URLSearchParams(location.search);
  const STATE = params.get("state") || "list";
  const LONG = params.get("long") === "1";
  if (params.get("text") === "200") document.documentElement.classList.add("text-200");

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MONTHS = ["siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja", "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"];
  const fmtDate = s => { const d = new Date(s + "T12:00:00Z"); return `${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}.`; };
  // Croatian plural: 1 godina, 2-4 godine, 5+ godina (11-14 godina); months likewise.
  const plural = (n, one, few, many) => (n % 10 === 1 && n % 100 !== 11) ? one : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? few : many;
  function age(born, until) {
    const a = new Date(born + "T12:00:00Z"), b = new Date((until || M.today) + "T12:00:00Z");
    let months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth() - (b.getUTCDate() < a.getUTCDate() ? 1 : 0);
    if (months < 12) return `${months} ${plural(months, "mjesec", "mjeseca", "mjeseci")}`;
    const y = Math.floor(months / 12);
    return `${y} ${plural(y, "godina", "godine", "godina")}`;
  }

  let pets = JSON.parse(JSON.stringify(M.pets)).map(p => ({ ...p, photo: null }));
  if (LONG) Object.assign(pets[0], M.long);
  const app = { view: "list", petId: null, mode: "default", sheet: null, toast: null, photoError: false, failNext: false, saving: false };
  const byName = (a, b) => a.name.localeCompare(b.name, "hr");
  const living = () => pets.filter(p => !p.deceased_on).sort(byName);
  const deceased = () => pets.filter(p => p.deceased_on).sort(byName);

  function boot() {
    const s = STATE;
    if (s === "list-one") pets = pets.filter(p => p.id === "p-rex");
    if (s === "list-empty") pets = [];
    if (s === "list-loading") app.mode = "loading";
    if (s === "list-error") app.mode = "error";
    if (s === "list-stale") app.mode = "stale";
    if (s === "list-photos") { pets[0].photo = M.mockPhoto; pets[3].photo = M.mockPhoto; }
    if (s.startsWith("pet")) { app.view = "pet"; app.petId = "p-rex"; }
    if (s === "pet-photo" || s === "pet-remove-photo") pets[0].photo = M.mockPhoto;
    if (s === "pet-remove-photo") app.sheet = "remove";
    if (s === "pet-photo-error") app.photoError = true;
    if (s === "pet-saving") app.saving = true;
    if (s === "pet-deceased") { app.petId = "p-bobi"; pets[3].photo = M.mockPhoto; }
    render();
  }

  function toast(t) { app.toast = t; render(); clearTimeout(toast.t); toast.t = setTimeout(() => { app.toast = null; render(); }, 3000); }
  const avatar = (p, size) => p.photo
    ? `<img src="${p.photo}" alt="${esc(p.name)}" data-check="photo" style="width:${size}px;height:${size}px;border-radius:var(--radius-full);object-fit:cover;flex:none">`
    : `<span aria-hidden="true" data-check="initial" style="width:${size}px;height:${size}px;border-radius:var(--radius-full);background:var(--color-secondary);color:var(--color-secondary-foreground);display:flex;align-items:center;justify-content:center;font-weight:var(--font-weight-heading);font-size:${size > 60 ? "var(--text-2xl)" : "var(--text-lg)"};flex:none">${esc(p.name[0])}</span>`;

  function petCard(p) {
    const c = M.clinics[p.clinic_id];
    return `<button class="card" style="flex-direction:row;align-items:center;text-align:left;font:inherit;color:inherit;cursor:pointer;width:100%" data-act="open" data-id="${p.id}" data-check="card-${p.id}">
      ${avatar(p, 56)}
      <span style="display:flex;flex-direction:column;min-width:0;flex:1">
        <span class="card-title clamp-2" data-check="pet-name">${esc(p.name)}</span>
        <span class="meta truncate" data-check="breed">${esc(p.species)}, ${esc(p.breed)}</span>
        <span class="meta">${p.deceased_on ? `${p.born.slice(0, 4)}. – ${p.deceased_on.slice(0, 4)}.` : `${esc(age(p.born))} · ${esc(c.name)}`}</span>
      </span></button>`;
  }

  function renderList() {
    let body;
    if (app.mode === "loading") body = `<div class="skeleton" style="min-height:88px" data-check="loading"></div>`.repeat(3);
    else if (app.mode === "error") body = `<div class="alert alert-error" role="alert" data-check="error"><p>Ljubimce nije moguće učitati.</p><button class="btn btn-outline" data-act="retry">Pokušaj ponovno</button></div>`;
    else if (!pets.length) body = `<div class="empty" data-check="empty"><h2>Još nema ljubimaca</h2><p class="meta">Vaši ljubimci pojavit će se ovdje kada ih klinika doda.</p>
        <ul class="meta" style="margin:0;padding:0;list-style:none">${Object.values(M.clinics).map(c => `<li>${esc(c.name)}: <a href="tel:${c.phone.replace(/ /g, "")}">${esc(c.phone)}</a></li>`).join("")}</ul></div>`;
    else {
      const stale = app.mode === "stale" ? `<div class="alert" role="status" data-check="stale"><p>Podaci od ${M.cachedAt}. Osvježavanje nije uspjelo.</p><button class="btn btn-outline" data-act="retry">Pokušaj ponovno</button></div>` : "";
      const dead = deceased();
      body = stale + living().map(petCard).join("") + (dead.length ? `<h2 style="font-size:var(--text-sm);color:var(--color-muted-foreground);margin-top:var(--space-4)" data-check="deceased-heading">Preminuli</h2>${dead.map(petCard).join("")}` : "");
    }
    return `<header class="topbar"><h1>Moji ljubimci</h1></header><main class="content"><div style="display:flex;flex-direction:column;gap:var(--space-3)">${body}</div></main>${tabbar()}`;
  }

  function renderPet() {
    const p = pets.find(x => x.id === app.petId), c = M.clinics[p.clinic_id], dead = !!p.deceased_on;
    const photoCtl = dead ? "" : app.saving ? `<p class="meta" data-check="saving">Spremanje fotografije…</p>`
      : p.photo ? `<div style="display:flex;gap:var(--space-2)"><label class="btn btn-outline">Promijeni<input type="file" accept="image/*" class="sr-only" data-act="file"></label><button class="btn btn-ghost" data-act="remove">Ukloni</button></div>`
      : `<label class="btn btn-outline" data-check="add-photo">Dodaj fotografiju<input type="file" accept="image/*" class="sr-only" data-act="file"></label>`;
    const sections = [["Karton", "F-03"], ["Cijepljenja", "F-04"], ["Recepti", "F-08"]].filter(([l]) => !dead || l === "Karton");
    return `<header class="topbar"><button class="btn btn-ghost btn-icon" aria-label="Natrag" data-act="back">‹</button><h1 class="truncate">${esc(p.name)}</h1></header>
      <main class="content" data-check="pet-page">
        <section style="display:flex;flex-direction:column;align-items:center;gap:var(--space-3);text-align:center">
          ${avatar(p, 112)}<h2 style="font-size:var(--text-xl);overflow-wrap:anywhere" data-check="pet-title">${esc(p.name)}</h2>
          ${dead ? `<p class="meta" data-check="deceased-note">Preminuli · ${esc(fmtDate(p.deceased_on))}</p>` : ""}${photoCtl}
          ${app.photoError ? `<div class="alert alert-error" role="alert" data-check="photo-error"><p>Fotografija nije spremljena. Pokušajte ponovno.</p></div>` : ""}
        </section>
        <section class="card"><dl style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--space-2) var(--space-3);margin:0">
          <dt class="meta">Vrsta</dt><dd style="margin:0">${esc(p.species)}</dd>
          <dt class="meta">Pasmina</dt><dd style="margin:0;overflow-wrap:anywhere">${esc(p.breed)}</dd>
          <dt class="meta">Datum rođenja</dt><dd style="margin:0">${esc(fmtDate(p.born))}${dead ? "" : ` (${esc(age(p.born))})`}</dd>
          <dt class="meta">Klinika</dt><dd style="margin:0">${esc(c.name)}</dd>
          <dt class="meta">Veterinar</dt><dd style="margin:0;overflow-wrap:anywhere">${esc(M.vets[p.vet_id])}</dd></dl>
          <p class="meta">Podatke vodi klinika. Za ispravak se javite klinici.</p></section>
        ${dead ? "" : `<a class="btn btn-primary btn-lg" href="../f-05-booking/index.html?state=book" data-check="book">Rezerviraj termin</a>`}
        <nav class="option-list" aria-label="${esc(p.name)}">${sections.map(([l, f]) => `<button class="option" style="font:inherit;color:inherit;background:var(--color-background);justify-content:space-between" data-act="section" data-f="${f}">
          <span>${l}${dead && l === "Karton" ? " (samo za čitanje)" : ""}</span>${f === "F-03" || f === "F-04" ? "<span aria-hidden=\"true\">›</span>" : `<span class="badge badge-unconfirmed">${f}, još nije izrađeno</span>`}</button>`).join("")}</nav>
      </main>${tabbar()}`;
  }

  function tabbar() {
    const items = [["home", "Početna"], ["appointments", "Termini"], ["pets", "Moji ljubimci"], ["account", "Račun"]];
    return `<nav class="footer" aria-label="Glavna navigacija" style="flex-direction:row;gap:var(--space-1)">${items.map(([k, l]) =>
      `<button class="tab" style="flex:1" aria-current="${k === "pets" ? "page" : "false"}" aria-selected="${k === "pets"}" data-act="nav" data-to="${k}">${l}</button>`).join("")}</nav>`;
  }

  function render() {
    document.getElementById("app").innerHTML = app.view === "list" ? renderList() : renderPet();
    document.getElementById("overlays").innerHTML = (app.sheet === "remove" ? `<div class="scrim" data-act="sheet-close"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t" data-stop>
        <h2 id="sh-t">Ukloniti fotografiju?</h2><p class="meta">Umjesto nje prikazivat će se prvo slovo imena.</p>
        <div class="actions"><button class="btn btn-destructive btn-lg" data-act="remove-confirm">Ukloni</button><button class="btn btn-outline btn-lg" data-act="sheet-close">Natrag</button></div></div></div>` : "")
      + (app.toast ? `<div class="toast" role="status">${esc(app.toast)}</div>` : "");
    renderPanel();
  }

  const STATES = { "Lista": ["list", "list-one", "list-photos", "list-empty", "list-loading", "list-error", "list-stale"], "Ljubimac": ["pet", "pet-photo", "pet-saving", "pet-photo-error", "pet-remove-photo", "pet-deceased"] };
  function renderPanel() {
    const el = document.getElementById("proto-panel"), open = el.classList.contains("open");
    const link = s => { const q = new URLSearchParams(location.search); q.set("state", s); return `<a href="?${q}" aria-current="${s === STATE}">${s}</a>`; };
    const toggle = (k, v, label) => { const q = new URLSearchParams(location.search); const on = q.get(k) === v; on ? q.delete(k) : q.set(k, v); return `<a href="?${q}">${on ? "☑" : "☐"} ${label}</a>`; };
    el.innerHTML = `<button data-act="panel">PROTOTIP · stanja</button><div class="proto-body">
      ${Object.entries(STATES).map(([g, l]) => `<h4>${g}</h4>${l.map(link).join("")}`).join("")}
      <h4>Sadržaj</h4>${toggle("long", "1", "dugi tekst")}${toggle("text", "200", "tekst 200%")}
      <h4>Simulacija</h4><button data-act="fail-photo">→ sljedeće spremanje fotografije: greška</button>
      <h4>Dokumentacija</h4><a href="../../rules/f-02-pets.md">Pravila (rules page)</a><a href="#devdoc">Ugovor podataka ↓</a></div>`;
    if (open) el.classList.add("open");
  }

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    if (t.classList.contains("scrim") && e.target.closest("[data-stop]")) return;
    switch (t.dataset.act) {
      case "panel": document.getElementById("proto-panel").classList.toggle("open"); return;
      case "open": app.view = "pet"; app.petId = t.dataset.id; app.photoError = false; render(); window.scrollTo(0, 0); return;
      case "back": app.view = "list"; app.photoError = false; break;
      case "retry": app.mode = "default"; break;
      case "remove": app.sheet = "remove"; break;
      case "remove-confirm": pets.find(p => p.id === app.petId).photo = null; app.sheet = null; toast("Fotografija je uklonjena"); return;
      case "sheet-close": app.sheet = null; break;
      case "section": if (t.dataset.f === "F-03") { location.href = `../f-03-record/index.html?state=${app.petId === "p-bobi" ? "record-deceased" : "record"}`; return; } if (t.dataset.f === "F-04") { location.href = "../f-04-vaccinations/index.html?state=list"; return; } toast(`[Prototip] ${t.dataset.f} još nije izrađen`); return;
      case "nav": if (t.dataset.to === "pets") { app.view = "list"; break; } toast("[Prototip] To područje nije dio F-02"); return;
      case "fail-photo": app.failNext = true; toast("[Prototip] Sljedeće spremanje: greška"); return;
      default: return;
    }
    render();
  });
  document.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.act !== "file" || !t.files[0]) return;
    const reader = new FileReader();
    app.saving = true; app.photoError = false; render();
    reader.onload = () => setTimeout(() => {
      app.saving = false;
      if (app.failNext) { app.failNext = false; app.photoError = true; render(); return; }
      pets.find(p => p.id === app.petId).photo = reader.result; toast("Fotografija je spremljena");
    }, 700);
    reader.readAsDataURL(t.files[0]);
  });

  boot();
})();

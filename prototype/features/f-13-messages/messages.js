// F-13 reception messages. Two sides: ?side=reception (desktop, F-10's web view) and ?side=owner (the app, F-07's Home).
// Every state is reachable with ?state=<id>; ?long=1 long content; ?text=200 double text size.
(function () {
  const M = window.MOCK;
  const params = new URLSearchParams(location.search);
  const SIDE = params.get("side") === "owner" ? "owner" : "reception";
  const STATE = params.get("state") || (SIDE === "owner" ? "home" : "sent");
  const LONG = params.get("long") === "1";
  if (params.get("text") === "200") document.documentElement.classList.add("text-200");

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MONTHS = ["siječnja", "veljače", "ožujka", "travnja", "svibnja", "lipnja", "srpnja", "kolovoza", "rujna", "listopada", "studenoga", "prosinca"];
  const now = Date.parse(M.now);
  const fmtWhen = iso => { const d = new Date(iso.slice(0, 10) + "T12:00:00Z"); return iso.slice(0, 10) === M.now.slice(0, 10) ? `danas ${iso.slice(11, 16)}` : `${d.getUTCDate()}. ${MONTHS[d.getUTCMonth()]} ${iso.slice(11, 16)}`; };
  const owner = id => M.owners.find(o => o.id === id);
  let sent = JSON.parse(JSON.stringify(M.sent));
  if (LONG) sent[0].text = M.longText;

  const app = {
    view: "list", mode: "default",
    q: "", ownerId: null, petId: null, templateId: null, text: "", linkIdx: "",
    sending: false, error: false, failNext: false, toast: null,
    // owner side
    ownerView: "home", openId: null, push: false, read: new Set(["m4", "m5", "m6"])
  };

  function boot() {
    const s = STATE;
    if (SIDE === "reception") {
      if (s === "sent-empty") sent = [];
      if (s.startsWith("compose")) app.view = "compose";
      if (s === "compose-results") app.q = "kov";
      if (s === "compose-no-results") app.q = "Horvatinčić";
      if (["compose-filled", "compose-sending", "compose-error", "compose-from-request"].includes(s)) fill("o-ivana", "p-rex", "results");
      if (s === "compose-email") fill("o-branko", "p-medo", "booklet");
      if (s === "compose-no-contact") fill("o-tena", "p-fluffy", "call");
      if (s === "compose-sending") app.sending = true;
      if (s === "compose-error") app.error = true;
      if (s === "compose-from-request") app.fromRequest = true;
    } else {
      if (s === "all") app.ownerView = "all";
      if (s === "message") { app.ownerView = "message"; app.openId = "m1"; }
      if (s === "message-plain") { app.ownerView = "message"; app.openId = "m4"; }
      if (s === "push") app.push = true;
      if (s === "home-none") sent = [];
      if (s === "email") app.ownerView = "email";
    }
    render();
  }
  function fill(oid, pid, tid) {
    app.ownerId = oid; app.petId = pid; applyTemplate(tid);
    if (M.links[pid] && app.templateId === "results") app.linkIdx = "0";
  }
  function applyTemplate(tid) {
    app.templateId = tid;
    const t = M.templates.find(x => x.id === tid), o = owner(app.ownerId), p = o && o.pets.find(x => x.id === app.petId);
    if (t) app.text = t.text.replace("{pet}", p ? p.name : "").replace("{phone}", M.clinic.phone);
    if (t && t.link && M.links[app.petId]) { const i = M.links[app.petId].findIndex(l => l.kind === t.link); app.linkIdx = i >= 0 ? String(i) : ""; }
  }
  function toast(t) { app.toast = t; render(); clearTimeout(toast.t); toast.t = setTimeout(() => { app.toast = null; render(); }, 3000); }

  // ---------- reception side ----------
  function status(m) {
    if (m.channel === "email") return `<span class="meta" data-check="status-email">Poslano e-mailom ${esc(fmtWhen(m.sent_at))}</span>`;
    if (m.read_at) return `<span data-check="status-read">Pročitano ${esc(fmtWhen(m.read_at))}</span>`;
    if ((now - Date.parse(m.sent_at)) / 36e5 >= M.unreadHours) return `<span class="badge badge-rejected" data-check="status-unread">Nije pročitano. Razmislite o pozivu</span>`;
    return `<span class="meta" data-check="status-sent">Poslano ${esc(fmtWhen(m.sent_at))}</span>`;
  }
  function renderSent() {
    const rows = app.mode === "loading" ? `<div class="skeleton" style="min-height:60px"></div>`.repeat(3)
      : !sent.length ? `<div class="empty" data-check="sent-empty"><h2 style="color:var(--color-foreground);font-size:var(--text-lg)">Još niste poslali nijednu poruku</h2><p class="meta">Poslane poruke i njihov status pojavit će se ovdje.</p></div>`
      : sent.map(m => `<div class="row row-rx" style="cursor:default" data-check="sent-${m.id}">
          <span><span class="when">${esc(owner(m.owner_id).name)}</span><br><span class="meta">${esc(m.pet)} · poslala ${esc(m.by)}</span></span>
          <span class="truncate" style="display:block" data-check="sent-text">${esc(m.text)}</span>
          <span style="text-align:right">${status(m)}</span></div>`).join("");
    return `<div class="card-row"><h2 style="color:var(--color-foreground);font-size:var(--text-base);margin:0">Poslane poruke</h2><button class="btn btn-primary" data-act="new" data-check="new">Nova poruka</button></div>${rows}`;
  }
  function renderCompose() {
    const o = app.ownerId && owner(app.ownerId);
    let who;
    if (!o) {
      const q = app.q.trim().toLowerCase();
      const hits = q.length >= 2 ? M.owners.filter(x => x.name.toLowerCase().includes(q) || x.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) || x.pets.some(p => p.name.toLowerCase().includes(q))) : [];
      who = `<section class="field"><label class="label" for="q" style="font-size:var(--text-sm);font-weight:var(--font-weight-heading)">Vlasnik</label>
        <input id="q" class="input" placeholder="Ime vlasnika, ljubimca ili broj telefona" value="${esc(app.q)}" data-act="q" data-check="search">
        ${q.length >= 2 ? (hits.length ? `<div class="option-list" data-check="results">${hits.map(x => `<button class="option" style="font:inherit;color:inherit;background:var(--color-background);text-align:left" data-act="pick" data-id="${x.id}">
            <span class="option-body"><span>${esc(x.name)}</span><span class="meta">${esc(x.pets.map(p => p.name).join(", "))} · ${esc(x.phone)}</span></span></button>`).join("")}</div>`
          : `<p class="meta" data-check="no-results">Nema vlasnika za "${esc(app.q)}".</p>`) : `<p class="meta">Upišite najmanje dva znaka.</p>`}</section>`;
    } else {
      who = `<section class="field"><h3 style="font-size:var(--text-sm)">Vlasnik</h3><div class="card-row"><span data-check="owner">${esc(o.name)} · ${esc(o.phone)}</span>${app.fromRequest ? "" : `<button class="btn btn-ghost" data-act="unpick">Promijeni</button>`}</div>
        ${app.fromRequest ? `<p class="meta" data-check="from-request">Iz zahtjeva za termin (F-10).</p>` : ""}</section>
        <section class="field"><label class="label" for="pet" style="font-size:var(--text-sm);font-weight:var(--font-weight-heading)">Ljubimac</label>
        <select id="pet" class="select" data-act="pet">${o.pets.map(p => `<option value="${p.id}" ${p.id === app.petId ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></section>`;
    }
    const channel = !o ? "" : o.has_app ? `<p class="meta" data-check="channel-app">Šalje se u aplikaciju, s push obaviješću.</p>`
      : o.email ? `<div class="alert" data-check="channel-email"><p>Šalje se e-mailom (${esc(o.email)}). Vlasnik nema aplikaciju, pa status čitanja nije dostupan.</p></div>`
      : `<div class="alert alert-error" data-check="channel-none"><p>Vlasnik nema aplikaciju ni e-mail. Nazovite ${esc(o.phone)}.</p></div>`;
    const canSend = o && (o.has_app || o.email) && app.text.trim() && !app.sending;
    const links = (app.petId && M.links[app.petId]) || [];
    const body = !o ? "" : `
      <section class="field"><h3 style="font-size:var(--text-sm)">Predložak</h3><div class="chips">${M.templates.map(t => `<button type="button" class="btn btn-outline chip" aria-pressed="${app.templateId === t.id}" data-act="tpl" data-id="${t.id}">${esc(t.label)}${t.source ? "" : ` <span class="badge badge-unconfirmed" title="Template is ours (Q-022)">Nepotvrđeno</span>`}</button>`).join("")}</div></section>
      <section class="field"><label class="label" for="msg" style="font-size:var(--text-sm);font-weight:var(--font-weight-heading)">Poruka</label>
        <textarea id="msg" class="input" maxlength="${M.maxLength}" data-act="text" data-check="text">${esc(app.text)}</textarea>
        <p class="meta" data-check="left">${M.maxLength - app.text.length} / ${M.maxLength}</p></section>
      ${links.length ? `<section class="field"><label class="label" for="link" style="font-size:var(--text-sm);font-weight:var(--font-weight-heading)">Poveznica u poruci</label>
        <select id="link" class="select" data-act="link"><option value="">Bez poveznice</option>${links.map((l, i) => `<option value="${i}" ${String(i) === app.linkIdx ? "selected" : ""}>${esc(l.label)}</option>`).join("")}</select></section>` : ""}
      ${channel}
      ${app.error ? `<div class="alert alert-error" role="alert" data-check="send-error"><p>Poruka nije poslana. Pokušajte ponovno.</p></div>` : ""}
      <p class="meta">Vlasnik ne može odgovoriti na poruku (D-012). Poslanu poruku nije moguće urediti ni obrisati.</p>
      <div class="actions"><button class="btn btn-primary" data-act="send" data-check="send" ${canSend ? "" : "disabled"}>${app.sending ? "Šaljem…" : app.error ? "Pokušaj ponovno" : "Pošalji"}</button><button class="btn btn-outline" data-act="cancel">Odustani</button></div>`;
    return `<div class="card-row"><h2 style="color:var(--color-foreground);font-size:var(--text-base);margin:0">Nova poruka</h2></div><div style="max-width:640px;display:flex;flex-direction:column;gap:var(--space-4)" data-check="compose">${who}${body}</div>`;
  }
  function renderReception() {
    const tabs = [["../f-10-reception/index.html?state=appts", "Zahtjevi za termine"], ["../f-10-reception/index.html?state=rx", "Zahtjevi za recepte"], [null, "Poruke"]];
    return `<div class="desk"><header class="desk-header"><h1>${esc(M.clinic.name)} · Recepcija</h1><p class="role-tag">${esc(M.receptionist)}</p></header>
      <nav class="desk-nav" role="tablist">${tabs.map(([href, l]) => href ? `<a class="tab" role="tab" aria-selected="false" href="${href}" style="text-decoration:none">${l}</a>` : `<button class="tab" role="tab" aria-selected="true">${l}</button>`).join("")}</nav>
      <div class="desk-body no-detail"><main class="desk-list">${app.view === "compose" ? renderCompose() : renderSent()}</main></div></div>`;
  }

  // ---------- owner side ----------
  const mine = () => sent.filter(m => m.owner_id === "o-ivana" && m.channel === "app");
  function msgRow(m) {
    const unread = !app.read.has(m.id);
    return `<button class="option" style="font:inherit;color:inherit;background:var(--color-background);text-align:left;align-items:flex-start" data-act="open" data-id="${m.id}" data-check="msg-${m.id}">
      <span aria-label="${unread ? "Nepročitano" : ""}" style="width:8px;height:8px;margin-top:8px;border-radius:var(--radius-full);flex:none;background:${unread ? "var(--color-primary)" : "transparent"}" data-check="${unread ? "unread-dot" : "read"}"></span>
      <span class="option-body"><span class="truncate" style="display:block;${unread ? "font-weight:var(--font-weight-heading)" : ""}">${esc(m.text)}</span><span class="meta">${esc(M.clinic.name)} · ${esc(fmtWhen(m.sent_at))}</span></span></button>`;
  }
  function renderOwner() {
    const list = mine();
    if (app.ownerView === "email") return renderEmail();
    if (app.ownerView === "message") {
      const m = sent.find(x => x.id === app.openId);
      return `<header class="topbar"><button class="btn btn-ghost btn-icon" aria-label="Natrag" data-act="back">‹</button><h1>Od vaše klinike</h1></header>
        <main class="content" data-check="message"><p class="meta">${esc(M.clinic.name)} · ${esc(fmtWhen(m.sent_at))}</p>
          <p style="white-space:pre-line;overflow-wrap:anywhere" data-check="message-text">${esc(m.text)}</p>
          ${m.link ? `<a class="btn btn-primary" href="${m.link.href}" data-check="message-link">Pogledaj: ${esc(m.link.label)}</a>` : ""}
          <div class="alert" data-check="no-reply"><p>Na ovu poruku ne možete odgovoriti. Za pitanja nazovite kliniku.</p><a class="btn btn-outline" href="tel:${M.clinic.phone.replace(/ /g, "")}">Nazovi ${esc(M.clinic.phone)}</a></div></main>${tabbar()}`;
    }
    const shown = app.ownerView === "all" ? list : list.slice(0, 3);
    const section = list.length ? `<section class="field" data-check="from-clinic"><h2 style="font-size:var(--text-base)">Od vaše klinike</h2><div class="option-list">${shown.map(msgRow).join("")}</div>
        ${app.ownerView !== "all" && list.length > 3 ? `<button class="btn btn-outline" data-act="all" data-check="show-all">Prikaži sve</button>` : ""}</section>` : "";
    return `<header class="topbar">${app.ownerView === "all" ? `<button class="btn btn-ghost btn-icon" aria-label="Natrag" data-act="back">‹</button><h1>Od vaše klinike</h1>` : `<h1>Dobar dan, Ivana</h1>`}</header>
      <main class="content">${app.ownerView === "all" ? "" : `<p class="meta">[Prototip] Izvadak Početne: dio "Od vaše klinike". Ostatak Početne je F-07. <a href="../f-07-home/index.html">Cijela Početna</a></p>`}
      ${section || `<p class="meta" data-check="none">[Prototip] Bez poruka dio "Od vaše klinike" se ne prikazuje.</p>`}</main>${tabbar()}`;
  }
  function tabbar() {
    const items = [["Početna", "../f-07-home/index.html", true], ["Termini", "../f-05-booking/index.html?state=list"], ["Moji ljubimci", "../f-02-pets/index.html"], ["Račun", "../f-01-sign-in/index.html?state=account"]];
    return `<nav class="footer" aria-label="Glavna navigacija" style="flex-direction:row;gap:var(--space-1)">${items.map(([l, href, active]) => active
      ? `<button class="tab" style="flex:1" aria-current="page" aria-selected="true">${l}</button>` : `<a class="tab" style="flex:1;text-align:center;text-decoration:none" href="${href}">${l}</a>`).join("")}</nav>`;
  }
  function renderEmail() {
    const m = sent.find(x => x.id === "m2"), o = owner(m.owner_id);
    return `<div style="background:var(--color-muted);min-height:100vh;padding:var(--space-4)" data-check="email">
      <p class="meta" style="max-width:600px;margin:0 auto var(--space-2);overflow-wrap:anywhere">[Prototip] Prikaz e-maila. Od: ${esc(M.clinic.name)} &lt;poruke@lumen.example&gt; · Za: ${esc(o.email)}</p>
      <article style="max-width:600px;margin:0 auto;background:var(--color-background);border:var(--border-width) solid var(--color-border);border-radius:var(--radius);padding:var(--space-6);display:flex;flex-direction:column;gap:var(--space-4)">
        <p class="meta"><strong>Predmet:</strong> Poruka iz klinike ${esc(M.clinic.name)}</p>
        <h1 style="font-size:var(--text-xl);line-height:var(--leading-xl);color:var(--color-primary)">Lumen</h1>
        <p>Dobar dan,</p><p style="overflow-wrap:anywhere">${esc(m.text)}</p>
        <p>Na ovu poruku ne možete odgovoriti. Za pitanja nazovite kliniku.</p>
        <div><a class="btn btn-outline btn-lg" href="tel:${M.clinic.phone.replace(/ /g, "")}">Nazovi ${esc(M.clinic.phone)}</a></div>
        <hr style="border:0;border-top:var(--border-width) solid var(--color-border);width:100%">
        <p class="meta">Primate ovu poruku jer ste klijent klinike Lumen. <span class="badge badge-unconfirmed" title="Unsubscribe link: Q-020">Odjava: nepotvrđeno</span></p>
      </article></div>`;
  }

  function render() {
    const root = document.getElementById("app");
    root.className = SIDE === "owner" ? "app" + (app.ownerView === "email" ? " is-email" : "") : "";
    root.innerHTML = SIDE === "owner" ? renderOwner() : renderReception();
    const p = SIDE === "owner" && app.push ? `<button class="push" data-act="push-open" data-check="push"><small>Lumen · sada</small><br><strong>${esc(M.clinic.name)}</strong><br><span class="meta">${esc(sent[0].text.slice(0, 90))}${sent[0].text.length > 90 ? "…" : ""}</span></button>` : "";
    document.getElementById("overlays").innerHTML = p + (app.toast ? `<div class="toast" role="status">${esc(app.toast)}</div>` : "");
    renderPanel();
  }

  const STATES = {
    reception: ["sent", "sent-empty", "compose", "compose-results", "compose-no-results", "compose-filled", "compose-from-request", "compose-email", "compose-no-contact", "compose-sending", "compose-error"],
    owner: ["home", "all", "message", "message-plain", "push", "home-none", "email"]
  };
  function renderPanel() {
    const el = document.getElementById("proto-panel"), open = el.classList.contains("open");
    const link = (side, s) => { const q = new URLSearchParams(location.search); q.set("side", side); q.set("state", s); return `<a href="?${q}" aria-current="${side === SIDE && s === STATE}">${s}</a>`; };
    const toggle = (k, v, label) => { const q = new URLSearchParams(location.search); const on = q.get(k) === v; on ? q.delete(k) : q.set(k, v); return `<a href="?${q}">${on ? "☑" : "☐"} ${label}</a>`; };
    el.innerHTML = `<button data-act="panel">PROTOTIP · stanja</button><div class="proto-body">
      <h4>Recepcija (desktop)</h4>${STATES.reception.map(s => link("reception", s)).join("")}
      <h4>Vlasnik (aplikacija)</h4>${STATES.owner.map(s => link("owner", s)).join("")}
      <h4>Sadržaj</h4>${toggle("long", "1", "dugi tekst")}${toggle("text", "200", "tekst 200%")}
      <h4>Simulacija</h4><button data-act="fail">→ sljedeće slanje: greška</button>
      <h4>Dokumentacija</h4><a href="../../rules/f-13-messages.md">Pravila (rules page)</a><a href="#devdoc">Ugovor podataka ↓</a></div>`;
    if (open) el.classList.add("open");
  }

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    switch (t.dataset.act) {
      case "panel": document.getElementById("proto-panel").classList.toggle("open"); return;
      case "new": Object.assign(app, { view: "compose", q: "", ownerId: null, petId: null, templateId: null, text: "", linkIdx: "", error: false, fromRequest: false }); break;
      case "cancel": app.view = "list"; break;
      case "pick": { const o = owner(t.dataset.id); app.ownerId = o.id; app.petId = o.pets[0].id; app.text = ""; app.templateId = null; break; }
      case "unpick": app.ownerId = null; break;
      case "tpl": applyTemplate(t.dataset.id); break;
      case "send":
        app.sending = true; app.error = false; render();
        setTimeout(() => {
          app.sending = false;
          if (app.failNext) { app.failNext = false; app.error = true; render(); return; }
          const o = owner(app.ownerId), p = o.pets.find(x => x.id === app.petId);
          sent.unshift({ id: "m-new", owner_id: o.id, pet: p.name, text: app.text, by: M.receptionist, sent_at: M.now, read_at: null, channel: o.has_app ? "app" : "email", link: null });
          app.view = "list"; toast(o.has_app ? "Poruka je poslana" : "Poruka je poslana e-mailom");
        }, 800);
        return;
      case "fail": app.failNext = true; toast("[Prototip] Sljedeće slanje: greška"); return;
      case "open": app.ownerView = "message"; app.openId = t.dataset.id; app.read.add(t.dataset.id); render(); window.scrollTo(0, 0); return;
      case "all": app.ownerView = "all"; break;
      case "back": app.ownerView = app.ownerView === "message" ? "home" : "home"; break;
      case "push-open": app.push = false; app.ownerView = "message"; app.openId = sent[0].id; app.read.add(sent[0].id); break;
      default: return;
    }
    render();
  });
  document.addEventListener("input", e => {
    const t = e.target;
    if (t.dataset.act === "q") { app.q = t.value; const pos = t.selectionStart; render(); const n = document.querySelector("[data-check=search]"); n.focus(); n.setSelectionRange(pos, pos); }
    if (t.dataset.act === "text") { app.text = t.value; const l = document.querySelector("[data-check=left]"); if (l) l.textContent = `${M.maxLength - app.text.length} / ${M.maxLength}`; const s = document.querySelector("[data-check=send]"); const o = owner(app.ownerId); if (s) s.disabled = !(o && (o.has_app || o.email) && app.text.trim()); }
  });
  document.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.act === "pet") { app.petId = t.value; if (app.templateId) applyTemplate(app.templateId); render(); }
    if (t.dataset.act === "link") app.linkIdx = t.value;
  });

  boot();
})();

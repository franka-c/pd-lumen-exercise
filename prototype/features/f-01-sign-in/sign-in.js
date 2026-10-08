// F-01 sign in with a clinic invitation, and the Account screen. Plain JS, no backend.
// Every state is reachable with ?state=<id>; ?long=1 long content; ?text=200 double text size.
(function () {
  const M = window.MOCK, R = M.rules;
  const params = new URLSearchParams(location.search);
  const STATE = params.get("state") || "welcome";
  const LONG = params.get("long") === "1";
  if (params.get("text") === "200") document.documentElement.classList.add("text-200");
  const owner = LONG ? M.longOwner : M.owner;

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isPhone = v => /^\+?[\d\s/-]{8,}$/.test(v.trim());
  const idKind = v => isEmail(v) ? "email" : isPhone(v) ? "phone" : null;

  const app = {
    view: "welcome",   // welcome | activate | expired | desktop | signin | forgot | forgot-sent | forgot-code | forgot-new | request | request-sent | account | home
    id: "", pw: "", pw2: "", show: false, code: "",
    sending: false, error: null,   // null | "creds" | "locked" | "network" | "format" | "code"
    attempts: 0, failNext: null, sheet: null, toast: null
  };

  function boot() {
    const map = {
      "welcome": ["welcome"], "activate": ["activate"], "activate-weak": ["activate", { pw: "lumen" }],
      "activate-ready": ["activate", { pw: "Mrvica2026!" }], "activate-sending": ["activate", { pw: "Mrvica2026!", sending: true }],
      "activate-error": ["activate", { pw: "Mrvica2026!", error: "network" }], "invite-expired": ["expired"], "desktop-link": ["desktop"],
      "signin": ["signin"], "signin-filled": ["signin", { id: owner.email, pw: "Mrvica2026!" }],
      "signin-format": ["signin", { id: "ivana.kovac@", pw: "Mrvica2026!", error: "format" }],
      "signin-error": ["signin", { id: owner.email, pw: "krivalozinka", error: "creds" }],
      "signin-locked": ["signin", { id: owner.email, error: "locked" }], "signin-sending": ["signin", { id: owner.email, pw: "Mrvica2026!", sending: true }],
      "signin-network": ["signin", { id: owner.email, pw: "Mrvica2026!", error: "network" }],
      "forgot": ["forgot"], "forgot-email-sent": ["forgot-sent", { id: owner.email }], "forgot-sms-code": ["forgot-code", { id: owner.phone }],
      "forgot-code-wrong": ["forgot-code", { id: owner.phone, code: "123456", error: "code" }], "forgot-new-password": ["forgot-new", { id: owner.phone }],
      "request-invite": ["request"], "request-invite-sent": ["request-sent", { id: owner.email }],
      "account": ["account"], "account-signout": ["account", {}, "signout"]
    };
    const [view, extra, sheet] = map[STATE] || map.welcome;
    Object.assign(app, { view }, extra || {});
    if (sheet) app.sheet = sheet;
    render();
  }

  // ---------- actions ----------
  function go(view, keep) { Object.assign(app, { view, error: null, sending: false, show: false }, keep ? {} : { pw: "", pw2: "", code: "" }); render(); window.scrollTo(0, 0); }
  function toast(t) { app.toast = t; render(); clearTimeout(toast.t); toast.t = setTimeout(() => { app.toast = null; render(); }, 3000); }
  function pending(then) {
    app.sending = true; app.error = null; render();
    setTimeout(() => {
      app.sending = false;
      if (app.failNext) { app.error = app.failNext; app.failNext = null; render(); return; }
      then();
    }, 800);
  }
  function signIn() {
    if (!idKind(app.id)) { app.error = "format"; render(); return; }
    if (app.attempts >= R.maxAttempts) { app.error = "locked"; render(); return; }
    pending(() => {
      if (app.forceWrong) { app.forceWrong = false; app.attempts++; app.error = app.attempts >= R.maxAttempts ? "locked" : "creds"; app.pw = ""; render(); return; }
      app.attempts = 0; go("home");
    });
  }

  // ---------- rendering ----------
  const clinicsList = () => `<ul class="meta" style="margin:0;padding-left:var(--space-4)">${M.clinics.map(c => `<li>${esc(c.name)}: <a href="tel:${c.phone.replace(/ /g, "")}">${esc(c.phone)}</a></li>`).join("")}</ul>`;
  const unconf = t => `<span class="badge badge-unconfirmed" title="${esc(t)}">Nepotvrđeno</span>`;
  const header = (title, back) => `<header class="topbar">${back ? `<button class="btn btn-ghost btn-icon" aria-label="Natrag" data-act="go" data-view="${back}">‹</button>` : ""}<h1>${title}</h1></header>`;
  const errBox = () => {
    const m = {
      creds: "E-mail, broj ili lozinka nisu točni.",
      locked: `Previše pokušaja. Pokušajte ponovno za ${R.lockMinutes} minuta.`,
      network: "Nema veze s poslužiteljem. Provjerite internet i pokušajte ponovno.",
      format: "Upišite e-mail ili broj telefona.",
      code: "Kod nije točan ili je istekao."
    }[app.error];
    return m ? `<div class="alert alert-error" role="alert" data-check="error-${app.error}"><p>${m}</p></div>` : "";
  };
  const idField = (label) => `<section class="field"><label class="label" for="id" style="font-size:var(--text-sm);font-weight:var(--font-weight-heading)">${label}</label>
      <input id="id" class="input" type="text" inputmode="email" autocomplete="username" value="${esc(app.id)}" data-act="id" data-check="id-input" placeholder="ime@primjer.hr ili 091 234 5678"></section>`;
  const pwField = (label, autocomplete, withRules) => {
    const ok = app.pw.length >= R.passwordMin;
    return `<section class="field"><label class="label" for="pw" style="font-size:var(--text-sm);font-weight:var(--font-weight-heading)">${label}</label>
      <div style="display:flex;gap:var(--space-2)"><input id="pw" class="input" type="${app.show ? "text" : "password"}" autocomplete="${autocomplete}" value="${esc(app.pw)}" data-act="pw" data-check="pw-input">
      <button type="button" class="btn btn-outline" data-act="show" aria-pressed="${app.show}">${app.show ? "Sakrij" : "Prikaži"}</button></div>
      ${withRules ? `<p class="meta" data-check="pw-rule" aria-live="polite">${ok ? "✓" : "○"} Najmanje ${R.passwordMin} znakova ${unconf("Password rule is ours (Q-016)")}</p>` : ""}</section>`;
  };
  const button = (label, act, enabled) => `<button class="btn btn-primary btn-lg btn-block" data-act="${act}" data-check="submit" ${!enabled || app.sending ? "disabled" : ""} aria-busy="${app.sending}">${app.sending ? "Šaljem…" : app.error === "network" ? "Pokušaj ponovno" : label}</button>`;

  function render() {
    const v = app.view;
    let html;
    if (v === "welcome") html = `<main class="content" style="justify-content:center;text-align:center" data-check="welcome">
        <h1>Lumen</h1><p>Termini, podsjetnici i karton vašeg ljubimca na jednom mjestu.</p>
        <div style="display:flex;flex-direction:column;gap:var(--space-2)"><button class="btn btn-primary btn-lg" data-act="go" data-view="signin">Prijava</button>
        <button class="btn btn-outline btn-lg" data-act="go" data-view="request">Nemam pozivnicu</button></div>
        <p class="meta">Pozivnicu šalje vaša klinika e-mailom ili SMS-om.</p></main>`;
    else if (v === "activate") html = header("Aktivacija računa") + `<main class="content" data-check="activate">
        <p>Dobro došli, <strong data-check="owner-name">${esc(owner.name)}</strong>. Postavite lozinku za prijavu.</p>
        <p class="meta">Prijavljivat ćete se s <span data-check="owner-id" style="overflow-wrap:anywhere">${esc(owner.email)}</span> ili brojem telefona.</p>
        ${pwField("Nova lozinka", "new-password", true)}${errBox()}</main>
        <div class="footer">${button("Aktiviraj račun", "activate", app.pw.length >= R.passwordMin)}</div>`;
    else if (v === "expired") html = header("Pozivnica") + `<main class="content" data-check="expired">
        <div class="alert"><p class="alert-title">Pozivnica više ne vrijedi</p><p>Vrijedi ${R.inviteValidDays} dana i može se iskoristiti jednom. ${unconf("Validity is ours (Q-016)")}</p></div>
        <button class="btn btn-primary btn-lg" data-act="go" data-view="request">Zatraži novu</button>
        <button class="btn btn-outline btn-lg" data-act="go" data-view="signin">Već imam račun</button></main>`;
    else if (v === "desktop") html = `<main class="content" style="text-align:center;align-items:center" data-check="desktop">
        <h1>Otvorite ovu poveznicu na telefonu</h1><p>Aplikacija Lumen radi na telefonu. Skenirajte kod kamerom telefona.</p>
        <div aria-label="QR kod, prototip" style="width:160px;height:160px;border:var(--border-width) dashed var(--color-muted-foreground);border-radius:var(--radius);display:flex;align-items:center;justify-content:center" class="meta">[Prototip] QR kod</div>
        <p class="meta">Ili otvorite pozivnicu iz e-maila ili SMS-a na telefonu.</p></main>`;
    else if (v === "signin") html = header("Prijava", "welcome") + `<main class="content" data-check="signin">
        ${idField("E-mail ili broj telefona")}${pwField("Lozinka", "current-password", false)}
        <button class="linklike" data-act="go-keep" data-view="forgot" style="align-self:flex-start">Zaboravili ste lozinku?</button>${errBox()}</main>
        <div class="footer">${button("Prijava", "signin", app.id && app.pw && app.error !== "locked")}</div>`;
    else if (v === "forgot") html = header("Zaboravljena lozinka", "signin") + `<main class="content" data-check="forgot">
        <p>Upišite e-mail ili broj telefona s kojim se prijavljujete. Na e-mail šaljemo poveznicu, na telefon kod.</p>${idField("E-mail ili broj telefona")}${errBox()}</main>
        <div class="footer">${button("Pošalji", "forgot", !!app.id)}</div>`;
    else if (v === "forgot-sent") html = header("Provjerite e-mail", "signin") + `<main class="content" data-check="forgot-sent">
        <p>Ako postoji račun s adresom <strong style="overflow-wrap:anywhere">${esc(app.id)}</strong>, poslali smo poveznicu za novu lozinku. Poveznica vrijedi 1 sat. ${unconf("Validity is ours (Q-016)")}</p>
        <button class="btn btn-outline" data-act="go" data-view="signin">Natrag na prijavu</button></main>`;
    else if (v === "forgot-code") html = header("Upišite kod", "forgot") + `<main class="content" data-check="forgot-code">
        <p>Ako postoji račun s brojem <strong>${esc(app.id)}</strong>, poslali smo SMS sa šesteroznamenkastim kodom.</p>
        <section class="field"><label class="label" for="code" style="font-size:var(--text-sm);font-weight:var(--font-weight-heading)">Kod iz SMS-a</label>
        <input id="code" class="input" inputmode="numeric" autocomplete="one-time-code" maxlength="6" value="${esc(app.code)}" data-act="code" data-check="code-input" style="max-width:160px;letter-spacing:0.2em"></section>
        <button class="linklike" data-act="resend" style="align-self:flex-start">Pošalji kod ponovno</button>${errBox()}</main>
        <div class="footer">${button("Potvrdi", "code", /^\d{6}$/.test(app.code))}</div>`;
    else if (v === "forgot-new") html = header("Nova lozinka") + `<main class="content" data-check="forgot-new">${pwField("Nova lozinka", "new-password", true)}${errBox()}</main>
        <div class="footer">${button("Spremi lozinku", "newpw", app.pw.length >= R.passwordMin)}</div>`;
    else if (v === "request") html = header("Nemam pozivnicu", "welcome") + `<main class="content" data-check="request">
        <p>Upišite e-mail ili broj telefona koji ste dali klinici. Ako ste klijent Lumena, poslat ćemo vam pozivnicu.</p>${idField("E-mail ili broj telefona")}${errBox()}</main>
        <div class="footer">${button("Zatraži pozivnicu", "request", !!app.id)}</div>`;
    else if (v === "request-sent") html = header("Zahtjev je poslan", "welcome") + `<main class="content" data-check="request-sent">
        <div class="alert"><p>Ako ste klijent Lumena, pozivnica stiže u nekoliko minuta. Ako ne stigne, javite se svojoj klinici.</p></div>${clinicsList()}
        <button class="btn btn-outline" data-act="go" data-view="welcome">Natrag</button></main>`;
    else if (v === "home") html = header("Početna") + `<main class="content" data-check="home"><div class="empty"><p>Prijavljeni ste.</p><p class="meta">[Prototip] Početna nije dio F-01.</p></div></main>` + tabbar("home");
    else html = header("Račun") + `<main class="content" data-check="account">
        <section class="card"><dl style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:var(--space-2) var(--space-3);margin:0">
          <dt class="meta">Ime</dt><dd style="margin:0;overflow-wrap:anywhere" data-check="acc-name">${esc(owner.name)}</dd>
          <dt class="meta">E-mail</dt><dd style="margin:0;overflow-wrap:anywhere" data-check="acc-email">${esc(owner.email)}</dd>
          <dt class="meta">Telefon</dt><dd style="margin:0">${esc(owner.phone)}</dd></dl>
          <p class="meta">Za promjenu podataka javite se svojoj klinici.</p></section>
        <div class="option" style="cursor:default" data-check="notifications"><span class="option-body">Obavijesti</span><span class="badge badge-unconfirmed" title="F-11 is Future in 06; the IA has it">Uskoro</span></div>
        <button class="btn btn-outline btn-lg" data-act="signout">Odjava</button></main>` + tabbar("account");
    document.getElementById("app").innerHTML = html;
    document.getElementById("overlays").innerHTML = (app.sheet === "signout" ? `<div class="scrim" data-act="sheet-close"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t" data-stop>
        <h2 id="sh-t">Odjaviti se?</h2><p class="meta">Za ponovnu prijavu trebat ćete e-mail ili broj telefona i lozinku.</p>
        <div class="actions"><button class="btn btn-destructive btn-lg" data-act="signout-confirm">Odjava</button><button class="btn btn-outline btn-lg" data-act="sheet-close">Natrag</button></div></div></div>` : "")
      + (app.toast ? `<div class="toast" role="status">${esc(app.toast)}</div>` : "");
    renderPanel();
  }

  // The four areas of the owner app (D-010). Only Račun is built here.
  function tabbar(active) {
    const items = [["home", "Početna"], ["appointments", "Termini"], ["pets", "Moji ljubimci"], ["account", "Račun"]];
    return `<nav class="footer" aria-label="Glavna navigacija" style="flex-direction:row;gap:var(--space-1)" data-check="tabbar">${items.map(([k, l]) =>
      `<button class="tab" style="flex:1" aria-current="${k === active ? "page" : "false"}" aria-selected="${k === active}" data-act="nav" data-to="${k}">${l}</button>`).join("")}</nav>`;
  }

  const STATES = {
    "Ulaz": ["welcome", "activate", "activate-weak", "activate-ready", "activate-sending", "activate-error", "invite-expired", "desktop-link"],
    "Prijava": ["signin", "signin-filled", "signin-format", "signin-error", "signin-locked", "signin-sending", "signin-network"],
    "Lozinka": ["forgot", "forgot-email-sent", "forgot-sms-code", "forgot-code-wrong", "forgot-new-password"],
    "Pozivnica": ["request-invite", "request-invite-sent"],
    "Račun": ["account", "account-signout"]
  };
  function renderPanel() {
    const el = document.getElementById("proto-panel"), open = el.classList.contains("open");
    const link = s => { const q = new URLSearchParams(location.search); q.set("state", s); return `<a href="?${q}" aria-current="${s === STATE}">${s}</a>`; };
    const toggle = (k, v, label) => { const q = new URLSearchParams(location.search); const on = q.get(k) === v; on ? q.delete(k) : q.set(k, v); return `<a href="?${q}">${on ? "☑" : "☐"} ${label}</a>`; };
    el.innerHTML = `<button data-act="panel">PROTOTIP · stanja</button><div class="proto-body">
      ${Object.entries(STATES).map(([g, l]) => `<h4>${g}</h4>${l.map(link).join("")}`).join("")}
      <h4>Sadržaj</h4>${toggle("long", "1", "dugi tekst")}${toggle("text", "200", "tekst 200%")}
      <h4>Simulacija</h4><button data-act="force-wrong">→ sljedeća prijava: pogrešna lozinka</button><button data-act="fail-net">→ sljedeće slanje: nema veze</button>
      <h4>Dokumentacija</h4><a href="../../rules/f-01-sign-in.md">Pravila (rules page)</a><a href="#devdoc">Ugovor podataka ↓</a></div>`;
    if (open) el.classList.add("open");
  }

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    if (t.classList.contains("scrim") && e.target.closest("[data-stop]")) return;
    switch (t.dataset.act) {
      case "panel": document.getElementById("proto-panel").classList.toggle("open"); return;
      case "go": go(t.dataset.view); return;
      case "go-keep": go(t.dataset.view, true); return;
      case "show": app.show = !app.show; break;
      case "activate": pending(() => { toast("Račun je aktiviran"); go("home"); }); return;
      case "signin": signIn(); return;
      case "forgot": if (!idKind(app.id)) { app.error = "format"; break; } pending(() => go(idKind(app.id) === "email" ? "forgot-sent" : "forgot-code", true)); return;
      case "code": pending(() => go("forgot-new", true)); return;
      case "resend": toast("Kod je ponovno poslan"); return;
      case "newpw": pending(() => { toast("Lozinka je promijenjena. Prijavite se."); go("signin"); }); return;
      case "request": if (!idKind(app.id)) { app.error = "format"; break; } pending(() => go("request-sent", true)); return;
      case "signout": app.sheet = "signout"; break;
      case "signout-confirm": app.sheet = null; app.id = ""; go("welcome"); return;
      case "sheet-close": app.sheet = null; break;
      case "nav": if (t.dataset.to === "account") { go("account"); return; } toast("[Prototip] To područje nije dio F-01"); return;
      case "force-wrong": app.forceWrong = true; toast("[Prototip] Sljedeća prijava: pogrešna lozinka"); return;
      case "fail-net": app.failNext = "network"; toast("[Prototip] Sljedeće slanje: nema veze"); return;
      default: return;
    }
    render();
  });
  // Inputs update state without re-rendering, so focus and caret stay put.
  document.addEventListener("input", e => {
    const t = e.target, k = t.dataset.act;
    if (!["id", "pw", "code"].includes(k)) return;
    app[k] = t.value;
    if (app.error && app.error !== "locked") { app.error = null; const b = document.querySelector("[role=alert]"); if (b) b.remove(); }
    const rule = document.querySelector("[data-check=pw-rule]");
    if (k === "pw" && rule) rule.firstChild.textContent = (app.pw.length >= R.passwordMin ? "✓" : "○") + ` Najmanje ${R.passwordMin} znakova `;
    const submit = document.querySelector("[data-check=submit]");
    if (submit) {
      const v = app.view;
      const ok = v === "activate" || v === "forgot-new" ? app.pw.length >= R.passwordMin
        : v === "signin" ? !!(app.id && app.pw) && app.error !== "locked" : v === "forgot-code" ? /^\d{6}$/.test(app.code) : !!app.id;
      submit.disabled = !ok || app.sending;
    }
  });

  boot();
})();

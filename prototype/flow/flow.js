// The connected prototype's shell: the role switcher, the clock, push notifications,
// sheets and toasts. The yellow bar is prototype scaffolding, not part of the product.
(function () {
  const F = window.Flow, A = F.A;
  const S = () => F.S;
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const params = new URLSearchParams(location.search);
  if (params.get("text") === "200") document.documentElement.classList.add("text-200");
  let toastMsg = null, sheet = null;

  const ui = {
    toast(t) { toastMsg = t; clearTimeout(ui.tt); ui.tt = setTimeout(() => { toastMsg = null; render(); }, 2600); },
    sheet(s) { sheet = s; }
  };

  function bar() {
    const roles = [["owner", "Ivana", "vlasnica"], ["reception", "Sanja", "recepcija"], ["vet", "dr. Horvat", "veterinar"]];
    const d = new Date(S().now + ":00Z");
    return `<div class="flow-bar" role="region" aria-label="Kontrole prototipa">
      <div class="flow-roles" role="tablist">${roles.map(([k, n, r]) => `<button role="tab" aria-selected="${S().role === k}" data-act="role" data-role="${k}" data-check="role-${k}">${n} <small>(${r})</small>${S().dots[k] || (k === "owner" && S().role !== "owner" && S().pushes.length) ? `<span class="flow-dot" aria-label="Novo" data-check="dot-${k}"></span>` : ""}</button>`).join("")}</div>
      <div class="flow-clock"><span data-check="clock">${F.DAYS[d.getUTCDay()]} ${d.getUTCDate()}. ${F.MONTHS[d.getUTCMonth()].slice(0, 3)} ${S().now.slice(11)}</span>
        <button data-act="tick" data-m="5">+5 min</button><button data-act="tick" data-m="15">+15 min</button><button data-act="tick" data-m="1440">+1 dan</button><button data-act="reset">Vrati na početak</button>
        <a href="../index.html">Stranice funkcionalnosti</a></div></div>`;
  }

  function render() {
    const role = S().role, r = S().routes[role];
    document.getElementById("bar").innerHTML = bar();
    const root = document.getElementById("app");
    if (role === "owner") { root.className = "app"; root.innerHTML = F.owner.render(r); }
    else { root.className = ""; root.innerHTML = role === "vet" ? F.staff.vet(r) : F.staff.reception(r); }
    // Pushes reach Ivana's phone; they show one at a time while her app is open.
    const push = role === "owner" && S().signedIn && S().pushes[0];
    let ov = "";
    if (push) ov += `<button class="push" data-act="push" data-check="push"><small>Lumen · ${push.at && push.at !== S().now ? esc(F.fmtDate(push.at) + " " + push.at.slice(11)) : "sada"}</small><br><strong>${esc(push.title)}</strong><br><span class="meta">${esc(push.body)}</span></button>`;
    if (sheet) ov += `<div class="scrim" data-act="sheet-close"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t" data-stop>
        <h2 id="sh-t">${esc(sheet.title)}</h2>${sheet.body ? `<p class="meta">${esc(sheet.body)}</p>` : ""}${sheet.note ? `<div class="alert"><p>${esc(sheet.note)}</p></div>` : ""}
        <div class="actions">${sheet.actions.map((a, i) => `<button class="btn ${a[2] === "destructive" ? "btn-destructive" : "btn-outline"} btn-lg" data-act="sheet-do" data-i="${i}">${esc(a[0])}</button>`).join("")}<button class="btn btn-ghost btn-lg" data-act="sheet-close">Natrag</button></div></div></div>`;
    if (toastMsg) ov += `<div class="toast" role="status">${esc(toastMsg)}</div>`;
    document.getElementById("overlays").innerHTML = ov;
  }
  window.FlowUI = { render };

  document.addEventListener("click", e => {
    const el = e.target.closest("[data-act]");
    if (!el) return;
    if (el.classList.contains("scrim") && e.target.closest("[data-stop]")) return;
    const act = el.dataset.act, role = S().role, r = S().routes[role];
    if (el.tagName === "A") return;
    switch (act) {
      case "role": A.setRole(el.dataset.role); break;
      case "tick": A.advance(+el.dataset.m); ui.toast(`[Prototip] Vrijeme +${el.dataset.m === "1440" ? "1 dan" : el.dataset.m + " min"}`); break;
      case "reset": A.reset(); sheet = null; ui.toast("[Prototip] Vraćeno na početak"); break;
      case "push": { const p = A.shiftPush(); if (p && p.target) A.go("owner", p.target); break; }
      case "sheet-close": sheet = null; break;
      case "sheet-do": { const a = sheet.actions[+el.dataset.i]; sheet = null; a[1](); break; }
      default: {
        const handled = role === "owner" ? F.owner.handle(act, el, r, ui) : F.staff.handle(act, el, r, ui, role);
        if (!handled) return;
        window.scrollTo(0, 0);
      }
    }
    render();
  });
  document.addEventListener("change", e => {
    const el = e.target, act = el.dataset.act; if (!act) return;
    const role = S().role, r = S().routes[role];
    if (role === "owner" ? F.owner.change(act, el, r) : F.staff.change(act, el, r, role)) render();
  });
  document.addEventListener("input", e => {
    const el = e.target, act = el.dataset.act; if (!act || S().role === "owner") return;
    F.staff.input(act, el, S().routes[S().role], S().role);
  });

  render();
})();

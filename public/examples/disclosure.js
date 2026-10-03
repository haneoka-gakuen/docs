(() => {
  const registry = Symbol.for("haneoka.docs.disclosure");
  if (globalThis[registry]) {
    globalThis[registry]();
    return;
  }
  function bind() {
    for (const root of document.querySelectorAll("[data-docs-disclosure]")) {
      if (root.dataset.disclosureBound) continue;
      const button = root.querySelector("[data-docs-disclosure-trigger]");
      const panel = root.querySelector("[data-docs-disclosure-panel]");
      if (!button || !panel || button.getAttribute("aria-controls") !== panel.id) continue;
      root.dataset.disclosureBound = "true";
      button.addEventListener("click", event => {
        const expanded = button.getAttribute("aria-expanded") !== "true";
        button.setAttribute("aria-expanded", String(expanded));
        panel.hidden = !expanded;
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const ripple = document.createElement("span");
        ripple.className = "docs-disclosure__ripple";
        ripple.setAttribute("aria-hidden", "true");
        const bounds = button.getBoundingClientRect();
        const size = Math.max(bounds.width, bounds.height) * 2;
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${(event.detail ? event.clientX - bounds.left : bounds.width / 2) - size / 2}px`;
        ripple.style.top = `${(event.detail ? event.clientY - bounds.top : bounds.height / 2) - size / 2}px`;
        button.append(ripple);
        ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
        setTimeout(() => ripple.remove(), 600);
      });
      button.disabled = false;
    }
  }
  globalThis[registry] = bind;
  document.addEventListener("astro:page-load", bind);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once: true });
  else bind();
})();

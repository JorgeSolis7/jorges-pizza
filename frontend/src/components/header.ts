/**
 * Header (8.1 / J1) + menú móvil a pantalla completa (8.2 / J16).
 * Transparente sobre el hero, sólido tras él; se oculta al bajar y vuelve al subir.
 */
import { gsap, ScrollTrigger, lockScroll } from "../motion/core";
import { MM_CONDITIONS, flags } from "../motion/tokens";
import { fromHTML, prefersReducedMotion, qs, qsa, type Component } from "../lib/dom";
import { icon, LOGO_SVG } from "../lib/icons";
import { cart, cartCount, ui } from "../state/store";
import { trapFocus } from "./focusTrap";

export const NAV = [
  { href: "#menu", label: "Menú" },
  { href: "#arma-tu-pizza", label: "Arma tu pizza" },
  { href: "#club", label: "Club Jorges" },
  { href: "#ingredientes", label: "Nosotros" },
  { href: "#locales", label: "Locales" },
] as const;

export function createHeader(): Component {
  const el = fromHTML<HTMLElement>(`
<header class="site-header">
  <div class="container site-header__inner">
    <a class="logo" href="#top" aria-label="Jorges, inicio">${LOGO_SVG}</a>
    <nav class="nav" aria-label="Principal">${NAV.map((n) => `<a href="${n.href}">${n.label}</a>`).join("")}</nav>
    <div class="header-actions">
      <a class="header-action header-action--secondary" href="#locales" data-icon="map-pin">Elige tu local</a>
      <a class="header-action header-action--secondary" href="#club" data-icon="user">Ingresar</a>
      <button class="icon-btn" type="button" data-cart aria-label="Abrir tu pedido"><span class="cart-count" hidden></span></button>
      <button class="icon-btn icon-btn--menu" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Abrir menú"></button>
    </div>
  </div>
</header>`);

  qsa<HTMLElement>(el, "[data-icon]").forEach((a) => a.prepend(icon(a.dataset.icon === "user" ? "user" : "map-pin", 20)));
  const cartBtn = qs<HTMLButtonElement>(el, "[data-cart]");
  const count = qs(el, ".cart-count");
  cartBtn.prepend(icon("shopping-bag", 24));
  const menuBtn = qs<HTMLButtonElement>(el, ".icon-btn--menu");
  menuBtn.append(icon("menu", 24));

  cartBtn.addEventListener("click", () => ui.emit({ type: "open-cart" }));

  let lastCount = cartCount();
  const offCart = cart.subscribe(() => {
    const n = cartCount();
    count.hidden = n === 0;
    count.textContent = String(n);
    cartBtn.setAttribute("aria-label", n ? `Abrir tu pedido (${n} ${n === 1 ? "producto" : "productos"})` : "Abrir tu pedido");
    if (n > lastCount && !prefersReducedMotion()) {
      gsap.fromTo(count, { scale: 1 }, { scale: 1.3, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" });
    }
    lastCount = n;
  });

  /* ---------------------------- Menú móvil ---------------------------- */
  const mobile = fromHTML<HTMLElement>(`
<div class="mobile-menu" id="mobile-menu" data-theme="dark" role="dialog" aria-modal="true" aria-label="Menú">
  <div class="container mobile-menu__bar">
    <a class="logo" href="#top" aria-label="Jorges, inicio">${LOGO_SVG}</a>
    <button class="icon-btn" type="button" data-close aria-label="Cerrar menú"></button>
  </div>
  <div class="container">
    <ul class="mobile-menu__links">${NAV.map((n) => `<li class="mobile-menu__item"><a href="${n.href}">${n.label}</a></li>`).join("")}</ul>
    <div class="mobile-menu__meta mobile-menu__item">
      <a href="#locales" data-icon="map-pin">Elige tu local</a>
      <a href="#club" data-icon="user">Ingresar</a>
    </div>
  </div>
  <div class="container mobile-menu__club mobile-menu__item">
    <a class="btn btn-queso btn--block" href="#club">Únete a Club Jorges</a>
  </div>
</div>`);
  qsa<HTMLElement>(mobile, "[data-icon]").forEach((a) => a.prepend(icon(a.dataset.icon === "user" ? "user" : "map-pin", 20)));
  const closeBtn = qs<HTMLButtonElement>(mobile, "[data-close]");
  closeBtn.append(icon("x", 24));

  let release: (() => void) | null = null;
  let menuTl: gsap.core.Timeline | null = null;
  const buildMenuTl = (): gsap.core.Timeline => {
    const reduce = prefersReducedMotion();
    const tl = gsap.timeline({ paused: true }).to(mobile, { autoAlpha: 1, duration: reduce ? 0.15 : 0.25, ease: "power2.out" });
    if (!reduce) tl.from(qsa(mobile, ".mobile-menu__item"), { y: 24, autoAlpha: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }, "<0.05");
    return tl;
  };
  const openMenu = (): void => {
    menuTl ??= buildMenuTl();
    menuBtn.setAttribute("aria-expanded", "true");
    lockScroll(true);
    menuTl.timeScale(1).play();
    release = trapFocus(mobile, closeMenu);
    closeBtn.focus();
  };
  function closeMenu(): void {
    if (!release) return;
    menuBtn.setAttribute("aria-expanded", "false");
    menuTl?.timeScale(1.5).reverse();
    lockScroll(false);
    release();
    release = null;
  }
  menuBtn.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);
  mobile.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest("a")) closeMenu();
  });

  /* ------------------------------ Motion ------------------------------ */
  const mm = gsap.matchMedia();
  const triggers: ScrollTrigger[] = [];

  const animate = (): void => {
    // Ocultar/mostrar (no con reduce: el header queda siempre visible).
    mm.add(MM_CONDITIONS, (ctx) => {
      if (flags(ctx.conditions).reduce) return;
      const hide = gsap.to(el, { yPercent: -100, duration: 0.35, ease: "power2.out", paused: true });
      ScrollTrigger.create({
        start: 0, end: "max",
        onUpdate: (self) => {
          const locked = document.documentElement.classList.contains("is-overlay-open") || el.contains(document.activeElement);
          if (self.direction === 1 && self.scroll() > 120 && !locked) {
            hide.play();
            document.documentElement.classList.add("header-hidden");
          } else if (self.direction === -1) {
            hide.reverse();
            document.documentElement.classList.remove("header-hidden");
          }
        },
      });
      return () => document.documentElement.classList.remove("header-hidden");
    });
    // Sólido tras el hero (cambio de estado, también con reduce).
    const afterHero = document.querySelector(".club-band");
    if (afterHero) {
      triggers.push(ScrollTrigger.create({ trigger: afterHero, start: "top top+=96", end: "max", refreshPriority: -1, toggleClass: { targets: el, className: "is-solid" } }));
    }
    // Link activo según la sección visible.
    const links = qsa<HTMLAnchorElement>(el, ".nav a");
    links.forEach((a) => {
      const target = document.querySelector(a.getAttribute("href")!);
      if (!target) return;
      triggers.push(ScrollTrigger.create({
        trigger: target, start: "top center", end: "bottom center", refreshPriority: -1,
        onToggle: (self) => {
          if (self.isActive) links.forEach((l) => (l === a ? l.setAttribute("aria-current", "true") : l.removeAttribute("aria-current")));
          else a.removeAttribute("aria-current");
        },
      }));
    });
  };

  return {
    el,
    portals: [mobile],
    animate,
    destroy: () => { offCart(); mm.revert(); triggers.forEach((t) => t.kill()); closeMenu(); el.remove(); mobile.remove(); },
  };
}


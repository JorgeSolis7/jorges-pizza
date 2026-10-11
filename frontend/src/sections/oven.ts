/**
 * Sección 6 · Horno de leña (J13 + J14 + J5, DESIGN.md 9.5 §6).
 * El video del horno aún no existe: mientras tanto, una fotografía con transparencia
 * (boca del horno, resplandor y brasas que suben, para no
 * competir con el lettering ni con las fotos del pack) ocupa su lugar con la misma
 * capa al 65 % y los mismos efectos: la escena "se asienta" (scale 1.12 → 1,
 * scrub), el lettering se escribe, los bordes rasgados hacen parallax y el
 * bucle se pausa fuera de pantalla o con el botón (WCAG 2.2.2).
 */
import { drawLettering, gsap, ScrollTrigger } from "../motion/core";
import { mq } from "../motion/tokens";
import { h, qs, type Component } from "../lib/dom";
import { icon } from "../lib/icons";
import { photo } from "../lib/img";
import { rng } from "../lib/pizzaLayout";
import { letteringHeading } from "../components/lettering";
import { tear } from "../components/tear";


export function createOven(): Component {
  const rand = rng(21);
  const embers = Array.from({ length: 18 }, () => {
    const e = h("span", { class: "oven__ember" });
    e.style.left = `${30 + rand() * 40}%`;
    e.style.top = `${55 + rand() * 30}%`;
    return e;
  });
  const toggle = h("button", { class: "btn btn-queso btn--icon oven__toggle", type: "button", "aria-pressed": "false", "aria-label": "Pausar la animación del horno" }, icon("pause", 20));
  const scene = h("div", { class: "oven__scene" }, h("div", { class: "oven__glow" }), ...embers);
  scene.append(photo({ src: "/assets/jorges/oven-wood-fired.webp", w: 1254, h: 1254 }, { className: "oven__arch" }));

  // El ámbito oscuro va en un envoltorio interior: los bordes rasgados leen los tokens de las secciones vecinas.
  const el = h("section", { class: "oven", "aria-labelledby": "oven-title" },
    tear("top", 0),
    h("div", { class: "oven__inner", "data-theme": "dark" },
    h("div", { class: "oven__media", "aria-hidden": "true" }, scene, h("div", { class: "oven__overlay" })),
    h("div", { class: "oven__content" },
      Object.assign(letteringHeading("Horno de leña a 450 °C", ["HORNO DE LEÑA", "A 450 °C"], 9), { id: "oven-title" }),
      h("p", { class: "t-lead oven__lead", "data-reveal": true }, "Leña de eucalipto y 90 segundos de horno: borde inflado, alveolado y con sus manchas de leopardo."),
    ),
    toggle),
    tear("bottom", 1),
  );

  const mm = gsap.matchMedia();
  const animate = (): void => {
    mm.add({ motion: mq.motion, reduce: mq.reduce }, (ctx) => {
      if (ctx.conditions?.reduce) { toggle.remove(); return; } // escena estática, lettering completo
      let userPaused = false;
      gsap.fromTo(scene, { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top top", scrub: true } });
      // Ambos bordes suben 16 px; el inferior va de 16 → 0 para no destapar el fondo oscuro (overflow: clip).
      const tearST = { trigger: el, start: "top bottom", end: "bottom top", scrub: true } as const;
      gsap.to(qs(el, ".tear--top"), { y: -16, ease: "none", scrollTrigger: tearST });
      gsap.fromTo(qs(el, ".tear--bottom"), { y: 16 }, { y: 0, ease: "none", scrollTrigger: tearST });
      const loops = embers.map((e) => gsap.fromTo(e,
        { y: 0, x: 0, autoAlpha: 0, scale: gsap.utils.random(0.5, 1.2) },
        { y: () => -gsap.utils.random(160, 360), x: () => gsap.utils.random(-40, 40), keyframes: { autoAlpha: [0, 1, 0] }, duration: gsap.utils.random(2.4, 4.2), ease: "sine.out", repeat: -1, repeatRefresh: true, delay: gsap.utils.random(0, 3), paused: true }));
      const glow = gsap.to(qs(el, ".oven__glow"), { opacity: 0.75, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true });
      const all = [...loops, glow];
      const st = ScrollTrigger.create({
        trigger: el, start: "top bottom", end: "bottom top",
        onToggle: (s) => all.forEach((t) => (s.isActive && !userPaused ? t.play() : t.pause())),
      });
      const onBtn = (): void => {
        userPaused = !userPaused;
        toggle.setAttribute("aria-pressed", String(userPaused));
        toggle.setAttribute("aria-label", userPaused ? "Reanudar la animación del horno" : "Pausar la animación del horno");
        toggle.replaceChildren(icon(userPaused ? "play" : "pause", 20));
        all.forEach((t) => (userPaused || !st.isActive ? t.pause() : t.play()));
      };
      toggle.addEventListener("click", onBtn);
      drawLettering(el, "top 60%");
      return () => toggle.removeEventListener("click", onBtn);
    });
  };

  return { el, animate, destroy: () => { mm.revert(); el.remove(); } };
}

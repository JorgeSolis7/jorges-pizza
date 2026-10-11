/**
 * Sección 7 · Del horno a tu mesa (J7, DESIGN.md 9.5 §7).
 * La pizza protagonista del hero (foto del pack) se queda fija (pin sin espaciado) mientras el titular
 * aparece con el scroll, y "aterriza" sobre el hueco final. Móvil/reduce: sin pin.
 */
import { drawLettering, gsap, ScrollTrigger } from "../motion/core";
import { mq } from "../motion/tokens";
import { h, qs, type Component } from "../lib/dom";
import { icon } from "../lib/icons";
import { PHOTO, photo } from "../lib/img";
import { letteringHeading } from "../components/lettering";

export function createBoard(): Component {
  const plate = h("div", { class: "board__plate" },
    h("span", { class: "board__shadow", "aria-hidden": "true" }),
    photo(PHOTO.pepperoniPizza, { alt: "Pizza pepperoni recién salida del horno de leña" }));
  const el = h("section", { class: "section board section--muted paper", "aria-labelledby": "board-title" },
    h("div", { class: "container" },
      plate,
      h("div", { class: "board__headline" },
        Object.assign(letteringHeading("Del horno a tu mesa", ["DEL HORNO", "A TU MESA"], 13), { id: "board-title" }),
        h("p", { class: "t-lead board__lead" }, "Sale del horno, se corta en seis y viaja en caja ventilada para que llegue crocante. Pídela a domicilio o pasa a buscarla."),
      ),
      h("div", { class: "board__slot", "aria-hidden": "true" }),
      h("div", { class: "board__cta", "data-reveal": true },
        h("a", { class: "btn btn-primary btn--lg", href: "#menu" }, "Pide ahora"),
        h("a", { class: "link-arrow", href: "#locales" }, "Ver locales", icon("arrow-right", 16))),
    ),
  );

  const mm = gsap.matchMedia();
  const animate = (): void => {
    mm.add({ motion: mq.motion, reduce: mq.reduce }, (ctx) => {
      if (!ctx.conditions?.reduce) drawLettering(el);
    });
    mm.add(`${mq.desktop} and ${mq.motion}`, () => {
      const img = qs(plate, "img");
      ScrollTrigger.create({
        trigger: plate, start: "top 65%", endTrigger: qs(el, ".board__slot"), end: "top 65%",
        pin: true, pinSpacing: false, anticipatePin: 1,
        onLeave: () => gsap.fromTo(img, { scale: 1.02 }, { scale: 1, duration: 0.4, ease: "back.out(2)" }),
      });
      gsap.fromTo(qs(el, ".board__headline"), { autoAlpha: 0, y: 60 }, {
        autoAlpha: 1, y: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "top top", scrub: true },
      });
    });
    // Móvil: titular con revelado simple (J9).
    mm.add(`${mq.mobile} and ${mq.motion}`, () => {
      gsap.from(qs(el, ".board__headline"), { autoAlpha: 0, y: 24, duration: 0.9, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 70%", once: true } });
    });
  };

  return { el, animate, destroy: () => { mm.revert(); el.remove(); } };
}

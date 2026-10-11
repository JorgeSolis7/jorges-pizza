/**
 * Sección 8 · De temporada (J12): carrusel con scroll-snap nativo (sin librería),
 * botones anterior/siguiente en escritorio. Ítems = pizzas "nuevas" de la API.
 */
import { requestRefresh } from "../motion/core";
import { observeReveals } from "../motion/reveals";
import { h, prefersReducedMotion, type Component } from "../lib/dom";
import { icon } from "../lib/icons";
import { catalogImage } from "../lib/img";
import { money } from "../lib/format";
import { sectionHead } from "../components/sectionHead";
import type { Pizza } from "../api/types";
import { addToCart, isPizzaItem, menu, ui } from "../state/store";

export function createSeasonal(): Component {
  const track = h("div", { class: "carousel container", role: "region", "aria-roledescription": "carrusel", "aria-label": "Pizzas de temporada", tabindex: "0" });
  const prev = h("button", { class: "btn btn-secondary btn--icon", type: "button", "aria-label": "Anterior" }, icon("chevron-left", 20));
  const next = h("button", { class: "btn btn-secondary btn--icon", type: "button", "aria-label": "Siguiente" }, icon("chevron-right", 20));
  const el = h("section", { class: "section seasonal", "aria-labelledby": "seasonal-title" },
    h("div", { class: "container" },
      sectionHead({ id: "seasonal-title", eyebrow: "Solo por esta temporada", title: "De temporada", lead: "Recetas nuevas que rotan con la cosecha. Cuando se acaban, se acaban.", aside: h("div", { class: "carousel-nav" }, prev, next) })),
    track,
  );

  const step = (): number => (track.querySelector<HTMLElement>(".season-card")?.offsetWidth ?? 368) + 32;
  const behavior = (): ScrollBehavior => (prefersReducedMotion() ? "auto" : "smooth");
  prev.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: behavior() }));
  next.addEventListener("click", () => track.scrollBy({ left: step(), behavior: behavior() }));
  const syncNav = (): void => {
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  };
  track.addEventListener("scroll", syncNav, { passive: true });

  function card(p: Pizza, currency: string, pizza: boolean): HTMLElement {
    const order = h("button", { class: "link-arrow", type: "button", style: "background:none;border:0;padding:0", "aria-label": `Pedir ${p.name}` }, "Pedir", icon("arrow-right", 16));
    const size = pizza ? "mediana" : "personal";
    order.addEventListener("click", () => {
      addToCart({ pizzaId: p.id, customIngredientIds: null, size, name: p.name, image: p.image, unitPrices: { ...p.prices }, detail: "", portion: !pizza });
      ui.emit({ type: "added", name: p.name });
    });
    return h("article", { class: "season-card", "data-reveal": true },
      h("div", { class: "season-card__media" }, catalogImage({ src: p.image, alt: `${p.name} vista desde arriba`, width: 272, height: 272, sizes: "(min-width: 768px) 240px, 64vw" })),
      h("div", { class: "season-card__body" },
        h("h3", { class: "t-h4" }, p.name),
        h("p", { class: "season-card__desc" }, p.description),
        h("div", { class: "season-card__row" }, h("span", { class: "t-price" }, money(p.prices[size], currency)), order)));
  }

  const off = menu.subscribe((s) => {
    if (s.status !== "ready") {
      el.hidden = s.status === "error"; // sin datos no hay temporada que mostrar
      return;
    }
    el.hidden = false;
    const fresh = s.data.pizzas.filter((p) => p.tags.some((t) => t.toLowerCase() === "nueva"));
    const extra = s.data.pizzas.filter((p) => !fresh.includes(p) && !isPizzaItem(p, s.data));
    const list = [...fresh, ...extra].slice(0, 5);
    track.replaceChildren(...list.map((p) => card(p, s.data.currency, isPizzaItem(p, s.data))));
    observeReveals(track);
    requestAnimationFrame(syncNav);
    requestRefresh();
  });

  return { el, destroy: () => { off(); el.remove(); } };
}

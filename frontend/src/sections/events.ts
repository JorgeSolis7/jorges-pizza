/** Sección 9 · Eventos y pedidos grupales (8.14): dos cards con revelado (J9); cabecera con foto del pack. */
import { h, type Component } from "../lib/dom";
import { icon } from "../lib/icons";
import { PHOTO, photo } from "../lib/img";
import { sectionHead } from "../components/sectionHead";

const CARDS = [
  {
    title: "Eventos y cumpleaños", art: PHOTO.margherita, cta: "Cotizar evento",
    points: ["Horno móvil de leña en tu casa o local", "Pizzaiolo y ayudante para 20 a 120 personas", "Menú a medida con opciones veganas"],
  },
  {
    title: "Pedidos para empresas", art: PHOTO.slice, cta: "Pedir para mi equipo",
    points: ["Pizzas familiares cortadas en 8 porciones", "Entrega programada y factura electrónica", "Descuento desde 10 pizzas"],
  },
];

export function createEvents(): Component {
  const el = h("section", { class: "section section--muted", "aria-labelledby": "events-title" },
    h("div", { class: "container" },
      sectionHead({ id: "events-title", eyebrow: "Para compartir", title: "Eventos y pedidos grupales" }),
      h("div", { class: "event-grid" }, ...CARDS.map((c) => {
        const art = h("div", { class: "event-card__art", "aria-hidden": "true" }, h("span", { class: "event-card__art-shadow" }), photo(c.art, { className: "event-card__art-img" }));
        return h("article", { class: "event-card", "data-reveal": true },
          h("div", { class: "event-card__head", "data-theme": "dark" }, art, h("h3", { class: "t-h3" }, c.title)),
          h("div", { class: "event-card__body" },
            h("ul", { class: "check-list" }, ...c.points.map((p) => h("li", {}, icon("check", 20), p))),
            h("a", { class: "btn btn-secondary btn--lg btn--block", href: "mailto:eventos@jorges.pe" }, c.cta)));
      })),
    ),
  );
  return { el, destroy: () => el.remove() };
}

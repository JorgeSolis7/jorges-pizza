/**
 * Sección 4 · Una pizza, seis caminos (J8, DESIGN.md 9.5 §4).
 * Pizza fijada (pin + scrub): la margherita fotográfica del pack, cortada en 6
 * porciones con clip-path (una sola descarga, recorte estático), que se separan en radial;
 * revela una categoría del menú (labels desde GET /api/menu, con respaldo).
 * Cortes a las 12 y cada 60°: la porción i se centra en θᵢ = −60° + 60°·i.
 * Transición de entrada (escritorio): la porción fotográfica slice-pepperoni.webp
 * entra en diagonal desde el borde izquierdo mientras la sección sube, y queda
 * como acento durante el pin (estática con reduce, oculta en móvil).
 */
import { gsap } from "../motion/core";
import { MM_CONDITIONS, flags, mq } from "../motion/tokens";
import { h, qsa, type Component } from "../lib/dom";
import { icon } from "../lib/icons";
import { PHOTO, photo } from "../lib/img";
import { plural } from "../lib/format";
import { sectionHead } from "../components/sectionHead";
import { sameId } from "../api/types";
import { isPizzaItem, menu, ui } from "../state/store";

const FALLBACK = [
  { slug: "clasicas", name: "Clásicas" },
  { slug: "de-la-casa", name: "De la casa" },
  { slug: "blancas", name: "Blancas" },
  { slug: "veganas", name: "Veganas" },
  { slug: "para-picar", name: "Para picar" },
  { slug: "postres-y-bebidas", name: "Postres y bebidas" },
];

const theta = (i: number): number => -60 + 60 * i;

/** Cuña de 60° centrada en θ, en % de la caja (corrige el aspecto 960×905 para que los cortes sean rectos). */
function wedge(deg: number): string {
  const { w, h: ht } = PHOTO.margherita;
  const pts = ["50% 50%"];
  for (let a = deg - 30; a <= deg + 30; a += 7.5) {
    const t = (a * Math.PI) / 180;
    pts.push(`${(50 + Math.cos(t) * 75).toFixed(2)}% ${(50 + Math.sin(t) * 75 * (w / ht)).toFixed(2)}%`);
  }
  return `polygon(${pts.join(", ")})`;
}

export function createSlices(): Component {
  const pizza = h("div", { class: "slices__pizza" },
    ...Array.from({ length: 6 }, (_, i) => {
      const img = photo(PHOTO.margherita, { className: "slices__slice" });
      img.style.clipPath = wedge(theta(i));
      return img;
    }));
  const labels = h("ul", { class: "slices__labels" });
  // Contenedor (entrada) > sombra aparte + foto: nunca drop-shadow sobre la imagen que se mueve.
  const extra = h("div", { class: "slices__extra", "aria-hidden": "true" },
    h("span", { class: "slices__extra-shadow" }), photo(PHOTO.slice, { className: "slices__extra-img" }));
  const el = h("section", { class: "slices section--muted paper", id: "categorias", "aria-labelledby": "slices-title" },
    h("div", { class: "container slices__head" },
      sectionHead({ id: "slices-title", eyebrow: "Una pizza, seis caminos", title: "Elige por dónde empezar", center: true })),
    h("div", { class: "slices__stage" }, h("span", { class: "slices__shadow", "aria-hidden": "true" }), pizza),
    h("div", { class: "container" }, labels),
    extra,
  );

  // 6 labels estables (las timelines apuntan a ellos); el contenido se actualiza al llegar la API.
  const items = FALLBACK.map((c, i) => {
    const name = h("span", { class: "slices__label-name" }, c.name);
    const count = h("span", { class: "slices__label-count" });
    const a = h("a", { href: "#menu", "data-slug": c.slug }, h("span", {}, name, count), icon("arrow-right", 16));
    a.addEventListener("click", (e) => { e.preventDefault(); ui.emit({ type: "select-category", slug: a.dataset.slug ?? c.slug }); });
    const li = h("li", { class: "slices__label" }, a);
    li.style.setProperty("--a", `${theta(i)}deg`);
    labels.append(li);
    return { a, name, count };
  });

  function renderLabels(): void {
    const s = menu.get();
    if (s.status !== "ready") return;
    s.data.categories.slice(0, 6).forEach((c, i) => {
      const item = items[i];
      if (!item) return;
      const inCat = s.data.pizzas.filter((p) => sameId(p.categoryId, c.id));
      const pizzas = inCat.length > 0 && isPizzaItem(inCat[0]!, s.data);
      item.a.dataset.slug = c.slug;
      item.name.textContent = c.name;
      item.count.textContent = pizzas ? plural(inCat.length, "pizza", "pizzas") : plural(inCat.length, "opción", "opciones");
    });
  }
  const offMenu = menu.subscribe(renderLabels);

  const mm = gsap.matchMedia();
  const animate = (): void => {
    // Entrada lateral (antes del pin: termina justo cuando la sección llega arriba).
    mm.add(`${mq.desktop} and ${mq.motion}`, () => {
      gsap.fromTo(extra, { xPercent: -110, yPercent: 30, rotation: -28, autoAlpha: 0 }, {
        xPercent: 0, yPercent: 0, rotation: 0, autoAlpha: 1, ease: "power2.out",
        scrollTrigger: {
          trigger: el, start: "top 90%", end: "top top", scrub: 0.8,
          onToggle: (self) => (extra.style.willChange = self.isActive ? "transform, opacity" : ""),
        },
      });
    });
    mm.add(MM_CONDITIONS, (ctx) => {
      const { desktop, reduce } = flags(ctx.conditions);
      const slices = qsa(el, ".slices__slice");
      const R = (): number => pizza.offsetWidth * (desktop ? 0.14 : 0.1);
      if (reduce) {
        // Estado final estático: porciones separadas y labels visibles, sin pin.
        slices.forEach((s, i) => { const t = (theta(i) * Math.PI) / 180; gsap.set(s, { x: Math.cos(t) * R(), y: Math.sin(t) * R() }); });
        return;
      }
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el, start: "top top", end: desktop ? "+=200%" : "+=120%",
          pin: true, anticipatePin: 1, scrub: 1, invalidateOnRefresh: true,
          onToggle: (self) => slices.forEach((s) => (s.style.willChange = self.isActive ? "transform" : "")),
        },
      });
      slices.forEach((s, i) => {
        const deg = theta(i);
        const t = (deg * Math.PI) / 180;
        tl.to(s, { x: () => Math.cos(t) * R(), y: () => Math.sin(t) * R(), rotation: deg * 0.1, ease: "power3.out", duration: 1 }, 0);
      });
      // Se anima el enlace interior: el <li> conserva su `translate` radial (GSAP lo reescribiría).
      tl.from(qsa(el, ".slices__label > a"), { autoAlpha: 0, y: 16, stagger: 0.1, duration: 0.4, ease: "power2.out" }, 0.6)
        .to({}, { duration: 0.3 });
      // Teclado: si el foco entra antes de que los labels sean visibles, saltar al final del pin.
      const onFocus = (): void => { const st = tl.scrollTrigger; if (st && st.progress < 0.95) st.scroll(st.end); };
      el.addEventListener("focusin", onFocus);
      return () => el.removeEventListener("focusin", onFocus);
    });
  };

  return { el, animate, destroy: () => { offMenu(); mm.revert(); el.remove(); } };
}

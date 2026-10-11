/**
 * Sección 3 · Menú (8.5 + 8.6, J9 + J10): pestañas de categoría con indicador
 * Flip y grid de cards alimentado por GET /api/menu. Skeletons mientras carga y
 * estado de error con reintento si la API no responde.
 */
import { Flip, gsap, requestRefresh, scrollToTarget } from "../motion/core";
import { observeReveals } from "../motion/reveals";
import { h, prefersReducedMotion, type Component } from "../lib/dom";
import { icon, type IconName } from "../lib/icons";
import { catalogImage } from "../lib/img";
import { money, PORTION_LABEL, SIZE_LABEL } from "../lib/format";
import { sectionHead } from "../components/sectionHead";
import { errorState } from "../components/states";
import { sameId, type Menu, type Pizza, type PizzaSize } from "../api/types";
import { addToCart, isPizzaItem, loadMenu, menu, ui } from "../state/store";

const FEATURED = "favoritas";
const BADGES: Record<string, { cls: string; label: string; icon?: IconName }> = {
  favorita: { cls: "badge--top", label: "Más pedida", icon: "star" },
  picante: { cls: "badge--picante", label: "Picante", icon: "flame" },
  vegetariana: { cls: "badge--veggie", label: "Veggie", icon: "leaf" },
  nueva: { cls: "badge--nueva", label: "Nueva" },
};

export function createMenu(): Component {
  const tablist = h("div", { class: "tabs", role: "tablist", "aria-label": "Categorías del menú" });
  const indicator = h("span", { class: "tab__indicator", "aria-hidden": "true" });
  const panel = h("div", { class: "menu__panel", role: "tabpanel", tabindex: "-1", "aria-live": "polite" });
  const el = h(
    "section",
    { class: "section menu", id: "menu", "aria-labelledby": "menu-title" },
    h("div", { class: "container" },
      sectionHead({ id: "menu-title", eyebrow: "Recién salidas del horno", title: "Las favoritas de la casa", highlight: "favoritas", lead: "Masa madre de 48 horas, ingredientes italianos y peruanos, y un horno de leña a 450 °C." }),
    ),
    h("div", { class: "tabs-bar" }, h("div", { class: "container", style: "height:100%" }, tablist)),
    h("div", { class: "container" }, panel),
  );

  let active = FEATURED;
  let data: Menu | null = null;

  function itemsFor(slug: string, m: Menu): Pizza[] {
    if (slug === FEATURED) {
      const tagged = m.pizzas.filter((p) => p.tags.some((t) => ["favorita", "nueva"].includes(t.toLowerCase())));
      const rest = m.pizzas.filter((p) => !tagged.includes(p) && isPizzaItem(p, m));
      return [...tagged, ...rest].slice(0, 6);
    }
    const cat = m.categories.find((c) => c.slug === slug);
    return cat ? m.pizzas.filter((p) => sameId(p.categoryId, cat.id)) : [];
  }

  function card(p: Pizza, m: Menu): HTMLElement {
    const pizza = isPizzaItem(p, m);
    const size: PizzaSize = pizza ? "mediana" : "personal";
    const sizeLabel = pizza ? SIZE_LABEL[size] : PORTION_LABEL[size];
    const badges = p.tags
      .map((t) => BADGES[t.toLowerCase()])
      .filter((b): b is NonNullable<typeof b> => !!b)
      .slice(0, 2)
      .map((b) => h("span", { class: `badge ${b.cls}` }, b.icon ? icon(b.icon, 12) : null, b.label));

    const name = pizza
      ? h("a", { href: "#arma-tu-pizza", onclick: (e: Event) => { e.preventDefault(); ui.emit({ type: "customize", pizzaId: p.id }); } }, p.name)
      : h("span", {}, p.name);

    const add = h("button", {
      class: "btn btn-secondary btn--icon btn--sm", type: "button", "aria-label": `Agregar ${p.name} (${sizeLabel.toLowerCase()}) al pedido`,
      onclick: () => {
        addToCart({
          pizzaId: p.id, customIngredientIds: null, size, name: p.name, image: p.image, unitPrices: { ...p.prices },
          detail: "", portion: !pizza,
        });
        ui.emit({ type: "added", name: p.name });
      },
    }, icon("plus", 20));

    return h("article", { class: "pizza-card", "data-reveal": true },
      h("div", { class: "pizza-card__media" },
        catalogImage({ src: p.image, alt: `${p.name} vista desde arriba`, width: 320, height: 320, className: "pizza-card__img", sizes: "(min-width: 768px) 280px, 112px" })),
      h("div", { class: "pizza-card__text" },
        badges.length ? h("div", { class: "pizza-card__badges" }, ...badges) : h("div", { class: "pizza-card__badges" }),
        h("h3", { class: "pizza-card__name" }, name),
        h("p", { class: "pizza-card__desc" }, p.description)),
      h("div", { class: "pizza-card__buy" },
        h("span", { class: "t-price" }, money(p.prices[size], m.currency), h("span", { class: "sr-only" }, ` (${sizeLabel})`)),
        add),
      pizza ? h("a", {
          class: "link-arrow pizza-card__cta", href: "#arma-tu-pizza",
          onclick: (e: Event) => { e.preventDefault(); ui.emit({ type: "customize", pizzaId: p.id }); },
        }, "Personalizar", icon("arrow-right", 16)) : null,
    );
  }

  function skeletons(): HTMLElement {
    const reduce = prefersReducedMotion();
    return h("div", { class: "pizza-grid", "aria-busy": "true", "aria-label": "Cargando el menú" },
      ...Array.from({ length: 6 }, () => h("div", { class: "skeleton-card" },
        h("div", { class: `skeleton skeleton-card__img${reduce ? "" : " skeleton--pulse"}` }),
        h("div", {}, h("div", { class: `skeleton skeleton-card__line${reduce ? "" : " skeleton--pulse"}` }), h("div", { class: `skeleton skeleton-card__line${reduce ? "" : " skeleton--pulse"}` })))));
  }

  function renderTabs(m: Menu): void {
    const tabs = [{ slug: FEATURED, name: "Favoritas" }, ...m.categories.map((c) => ({ slug: c.slug, name: c.name }))];
    tablist.replaceChildren(...tabs.map((t) => {
      const selected = t.slug === active;
      const b = h("button", {
        class: "tab", role: "tab", type: "button", id: `tab-${t.slug}`, "aria-controls": "menu-panel",
        "aria-selected": String(selected), tabindex: selected ? "0" : "-1", "data-slug": t.slug,
      }, t.name);
      if (selected) b.append(indicator);
      return b;
    }));
    panel.id = "menu-panel";
    panel.setAttribute("aria-labelledby", `tab-${active}`);
  }

  function renderGrid(m: Menu, animateIn: boolean): void {
    const items = itemsFor(active, m);
    const grid = h("div", { class: "pizza-grid" }, ...items.map((p) => card(p, m)));
    panel.replaceChildren(items.length ? grid : h("p", { class: "state-error__msg" }, "Pronto tendremos novedades en esta categoría."));
    if (animateIn) {
      // Cambio de pestaña: entrada inmediata (ya está en pantalla), sin esperar al scroll.
      const cards = grid.querySelectorAll<HTMLElement>(".pizza-card");
      if (prefersReducedMotion()) gsap.set(cards, { autoAlpha: 1, y: 0 });
      else gsap.to(cards, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" });
    } else {
      observeReveals(grid);
    }
    requestRefresh();
  }

  function select(slug: string, focus = false): void {
    if (!data || slug === active) return;
    const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>(".tab"));
    const next = tabs.find((t) => t.dataset.slug === slug);
    if (!next) return;
    active = slug;
    const state = Flip.getState(indicator);
    tabs.forEach((t) => {
      const on = t === next;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    next.append(indicator);
    if (!prefersReducedMotion()) Flip.from(state, { duration: 0.4, ease: "power2.inOut" });
    next.scrollIntoView({ inline: "center", block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    if (focus) next.focus();
    panel.setAttribute("aria-labelledby", next.id);
    renderGrid(data, true);
  }

  tablist.addEventListener("click", (e) => {
    const tab = (e.target as HTMLElement).closest<HTMLButtonElement>(".tab");
    if (tab?.dataset.slug) select(tab.dataset.slug);
  });
  tablist.addEventListener("keydown", (e) => {
    const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>(".tab"));
    const i = tabs.findIndex((t) => t.dataset.slug === active);
    const go = (j: number): void => { const t = tabs[(j + tabs.length) % tabs.length]; if (t?.dataset.slug) select(t.dataset.slug, true); };
    if (e.key === "ArrowRight") { e.preventDefault(); go(i + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
    else if (e.key === "Home") { e.preventDefault(); go(0); }
    else if (e.key === "End") { e.preventDefault(); go(tabs.length - 1); }
  });

  const offMenu = menu.subscribe((s) => {
    if (s.status === "loading" || s.status === "idle") {
      tablist.replaceChildren(...["Favoritas", "Clásicas", "De la casa", "Blancas"].map((n) => h("span", { class: "tab", "aria-hidden": "true", style: "opacity:.5" }, n)));
      panel.replaceChildren(skeletons());
    } else if (s.status === "error") {
      tablist.replaceChildren();
      panel.replaceChildren(errorState("No pudimos cargar el menú", s.error.message, () => void loadMenu()));
      requestRefresh();
    } else {
      data = s.data;
      renderTabs(s.data);
      renderGrid(s.data, false);
    }
  });

  const offUi = ui.on((e) => {
    if (e.type !== "select-category" || !data) return;
    if (e.slug !== active) select(e.slug);
    scrollToTarget(el, 0);
  });

  return { el, destroy: () => { offMenu(); offUi(); el.remove(); } };
}

/**
 * "Arma tu pizza" (8.7 / J15). Pasos alimentados por GET /api/ingredients,
 * precio en vivo = customPizza.basePrices[tamaño] + Σ extraPrice, reglas del
 * backend replicadas (una sola masa, sin repetidos, máx. 12 ingredientes).
 * Al marcar un ingrediente, su imagen vuela (Flip.fit) hasta la mini pizza.
 */
import { Flip, gsap, requestRefresh, scrollToTarget } from "../motion/core";
import { observeReveals } from "../motion/reveals";
import { h, prefersReducedMotion, qs, type Component } from "../lib/dom";
import { icon } from "../lib/icons";
import { GENERIC_INGREDIENT, ingredientImage, smartImage } from "../lib/img";
import { money, plural, SIZE_CM, SIZE_LABEL } from "../lib/format";
import { hashString, layoutToppings, pieceCount } from "../lib/pizzaLayout";
import { sectionHead } from "../components/sectionHead";
import { errorState } from "../components/states";
import { ORDER_LIMITS, PIZZA_SIZES, sameId, type Id, type Ingredient, type IngredientKind, type PizzaSize } from "../api/types";
import { addToCart, currency, customPrice, ingredients, loadIngredients, menu, ui } from "../state/store";

import { BUILDER_ART, CUSTOM_PIZZA_PHOTO, builderIngredientImage, builderSauceImage } from "../lib/visualAssets";

interface Step { kinds: IngredientKind[]; title: string; single: boolean; optional?: string }

const STEPS: Step[] = [
  { kinds: ["masa"], title: "Elige la masa", single: true },
  { kinds: ["salsa"], title: "Elige la salsa", single: true, optional: "Sin salsa (blanca)" },
  { kinds: ["queso"], title: "Quesos", single: false },
  { kinds: ["carne", "vegetal"], title: "Ingredientes", single: false },
  { kinds: ["hierba"], title: "Hierbas y extras", single: false },
];
const PIECE_KINDS: ReadonlySet<IngredientKind> = new Set(["queso", "carne", "vegetal", "hierba"]);

export function createBuilder(): Component {
  const steps = h("div", { class: "builder__steps" });
  const status = h("p", { class: "sr-only", "aria-live": "polite" });
  const preview = createMiniPizza(false);
  const barMini = createMiniPizza(true);
  const summary = h("p", { class: "builder__summary" });
  const barSummary = h("span", { class: "t-caption" });
  const barTotal = h("span", { class: "t-price-lg" });
  const addBtn = h("button", { class: "btn btn-primary btn--lg", type: "button" }, icon("plus", 20), h("span", {}, "Agregar al pedido"));
  const limitMsg = h("p", { class: "field__error", role: "alert", hidden: true });

  const el = h("section", { class: "section builder", id: "arma-tu-pizza", "aria-labelledby": "builder-title" },
    h("div", { class: "container" },
      sectionHead({ id: "builder-title", eyebrow: "A tu manera", title: "Arma tu pizza", highlight: "tu pizza", lead: "Elige tamaño, masa, salsa y hasta 12 ingredientes. La vemos tomar forma mientras la armas." }),
      h("div", { class: "builder__layout" },
        steps,
        h("aside", { class: "builder__aside", "aria-label": "Vista previa de tu pizza" },
          h("div", { class: "builder__preview" }, preview.el, summary)),
      ),
    ),
    h("div", { class: "builder__bar" },
      h("div", { class: "container builder__bar-inner" },
        h("div", { class: "builder__bar-mini" }, barMini.el),
        h("div", { class: "builder__bar-info" }, barSummary, barTotal),
        addBtn)),
    status,
  );

  let catalog: Ingredient[] = [];
  let size: PizzaSize = "mediana";
  const selected = new Set<string>();
  const key = (id: Id): string => String(id);
  const byKey = (k: string): Ingredient | undefined => catalog.find((i) => key(i.id) === k);

  /* ------------------------------ Render ------------------------------ */
  function stepHead(n: number, title: string): HTMLElement {
    return h("div", { class: "builder__step-head" },
      h("p", { class: "t-eyebrow" }, `Paso ${n} de ${STEPS.length + 1}`),
      h("h3", { class: "t-h3" }, title));
  }

  function sizeStep(): HTMLElement {
    const opts = PIZZA_SIZES.map((s) => {
      const r = 14 + SIZE_CM[s] * 0.5;
      const input = h("input", { type: "radio", name: "builder-size", value: s, class: "sr-only", checked: s === size });
      input.addEventListener("change", () => { size = s; update(); });
      const circle = `<svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="${(r / 2).toFixed(1)}" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
      const label = h("label", { class: "size-option" }, input, h("span", { html: circle }),
        h("span", { class: "size-option__name" }, SIZE_LABEL[s]),
        h("span", { class: "size-option__meta", "data-size-price": s }, `${SIZE_CM[s]} cm`));
      return label;
    });
    return h("fieldset", { class: "builder__step", "data-reveal": true }, h("legend", { class: "sr-only" }, "Tamaño"), stepHead(1, "Elige el tamaño"), h("div", { class: "size-options" }, ...opts));
  }

  function ingredientCard(ing: Ingredient, single: boolean, group: string): HTMLElement {
    const input = h("input", { type: single ? "radio" : "checkbox", name: group, value: key(ing.id), class: "sr-only", checked: selected.has(key(ing.id)) });
    const img = smartImage({ src: builderIngredientImage(ing.slug), alt: "", width: 160, height: 160, className: "ing-card__img", lazy: true, fallbacks: [ingredientImage(ing.slug).replace(".webp", ".svg"), GENERIC_INGREDIENT] });
    input.addEventListener("change", () => onToggle(ing, input, img, single));
    const meta = ing.extraPrice > 0 ? `+ ${money(ing.extraPrice, currency())}` : "Incluido";
    return h("label", { class: "ing-card" }, input, img,
      h("span", {}, h("span", { class: "ing-card__name" }, ing.name), h("span", { class: "ing-card__meta", style: "display:block" }, meta)),
      h("span", { class: "ing-card__check", "aria-hidden": "true" }, icon("check", 16)));
  }

  function renderSteps(): void {
    const blocks: HTMLElement[] = [sizeStep()];
    STEPS.forEach((step, i) => {
      const group = `builder-${step.kinds.join("-")}`;
      const items = catalog.filter((c) => step.kinds.includes(c.kind));
      if (!items.length) return;
      const cards = items.map((ing) => ingredientCard(ing, step.single, group));
      if (step.optional) {
        const none = h("input", { type: "radio", name: group, value: "", class: "sr-only", checked: !items.some((it) => selected.has(key(it.id))) });
        none.addEventListener("change", () => { items.forEach((it) => removeIngredient(key(it.id))); update(); });
        cards.push(h("label", { class: "ing-card", style: "padding-left:24px" }, none,
          h("span", {}, h("span", { class: "ing-card__name" }, step.optional), h("span", { class: "ing-card__meta", style: "display:block" }, "Como las pizzas blancas")),
          h("span", { class: "ing-card__check", "aria-hidden": "true" }, icon("check", 16))));
      }
      blocks.push(h("fieldset", { class: "builder__step", "data-reveal": true },
        h("legend", { class: "sr-only" }, step.title), stepHead(i + 2, step.title), h("div", { class: "ing-grid" }, ...cards)));
    });
    blocks.push(limitMsg);
    steps.replaceChildren(...blocks);
    // Sincroniza el estado vivo de los controles con la selección actual.
    steps.querySelectorAll<HTMLInputElement>("input[name^=builder-]").forEach((i) => {
      if (i.name === "builder-size") i.checked = i.value === size;
      else if (i.value) i.checked = selected.has(i.value);
    });
    observeReveals(steps);
  }

  /* ----------------------------- Selección ----------------------------- */
  function onToggle(ing: Ingredient, input: HTMLInputElement, img: HTMLImageElement, single: boolean): void {
    const k = key(ing.id);
    limitMsg.hidden = true;
    if (single) {
      // Radio: quitar el resto del grupo (una sola masa / una sola salsa).
      catalog.filter((c) => c.kind === ing.kind && key(c.id) !== k).forEach((c) => removeIngredient(key(c.id)));
      if (!selected.has(k)) addIngredient(ing, img);
    } else if (input.checked) {
      if (selected.size >= ORDER_LIMITS.maxCustomIngredients) {
        input.checked = false;
        limitMsg.hidden = false;
        limitMsg.replaceChildren(icon("circle-alert", 16), `Una pizza personalizada admite como máximo ${ORDER_LIMITS.maxCustomIngredients} ingredientes. Quita alguno para agregar otro.`);
        return;
      }
      addIngredient(ing, img);
    } else {
      removeIngredient(k);
    }
    update();
  }

  function addIngredient(ing: Ingredient, from?: HTMLImageElement): void {
    const k = key(ing.id);
    if (selected.has(k)) return; // sin repetidos
    selected.add(k);
    preview.add(ing);
    barMini.add(ing);
    if (from) fly(from, ing);
    status.textContent = `${ing.name} agregado.`;
  }

  function removeIngredient(k: string): void {
    if (!selected.delete(k)) return;
    const ing = byKey(k);
    preview.remove(k);
    barMini.remove(k);
    if (ing) status.textContent = `${ing.name} quitado.`;
  }

  function fly(from: HTMLImageElement, ing: Ingredient): void {
    if (prefersReducedMotion() || !from.currentSrc) return;
    const targetEl = window.matchMedia("(min-width: 1024px)").matches ? preview.target : barMini.target;
    const r = from.getBoundingClientRect();
    if (r.width === 0) return;
    const clone = from.cloneNode() as HTMLImageElement;
    clone.className = "fly-clone";
    clone.removeAttribute("loading");
    Object.assign(clone.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    document.body.append(clone);
    const layer = preview.layerFor(key(ing.id));
    const barLayer = barMini.layerFor(key(ing.id));
    const layers = [layer, barLayer].filter(Boolean);
    if (layers.length > 0) gsap.set(layers, { autoAlpha: 0 });
    Flip.fit(clone, targetEl, {
      duration: 0.6, ease: "power2.inOut", scale: true, absolute: true,
      onComplete: () => {
        gsap.to(clone, { autoAlpha: 0, duration: 0.2, onComplete: () => clone.remove() });
        if (layers.length > 0) gsap.fromTo(layers, { autoAlpha: 0, scale: 1.1 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "power2.out" });
      },
    });
  }

  function ids(): Id[] {
    return catalog.filter((c) => selected.has(key(c.id))).map((c) => c.id);
  }

  function update(): void {
    const chosen = catalog.filter((c) => selected.has(key(c.id)));
    const hasMasa = chosen.some((c) => c.kind === "masa");
    const price = customPrice(size, ids());
    const toppings = chosen.filter((c) => c.kind !== "masa").length;
    const text = `Tu pizza ${SIZE_LABEL[size].toLowerCase()} · ${plural(toppings, "ingrediente", "ingredientes")}`;
    summary.textContent = text;
    barSummary.textContent = text;
    barTotal.textContent = price === null ? "—" : money(price, currency());
    const label = qs(addBtn, "span");
    label.textContent = price === null ? "Agregar al pedido" : `Agregar · ${money(price, currency())}`;
    addBtn.disabled = !hasMasa || catalog.length === 0;
    addBtn.setAttribute("aria-disabled", String(addBtn.disabled));
    // Precio por tamaño en las cards de tamaño.
    el.querySelectorAll<HTMLElement>("[data-size-price]").forEach((n) => {
      const s = n.dataset.sizePrice as PizzaSize;
      const p = customPrice(s, ids());
      n.textContent = p === null ? `${SIZE_CM[s]} cm` : `${SIZE_CM[s]} cm · ${money(p, currency())}`;
    });
    preview.setSize(size);
  }

  addBtn.addEventListener("click", () => {
    const list = ids();
    const chosen = catalog.filter((c) => selected.has(key(c.id)));
    const unitPrices = Object.fromEntries(PIZZA_SIZES.map((s) => [s, customPrice(s, list) ?? 0])) as Record<PizzaSize, number>;
    addToCart({
      pizzaId: null, customIngredientIds: list, size, name: "Pizza a tu gusto", image: CUSTOM_PIZZA_PHOTO,
      unitPrices, detail: chosen.filter((c) => c.kind !== "masa").map((c) => c.name).join(", ") || "Solo masa", portion: false,
    });
    ui.emit({ type: "added", name: "tu pizza a tu gusto" });
  });

  function applyDefaults(preset?: readonly Id[]): void {
    [...selected].forEach(removeIngredient);
    const list = preset
      ? catalog.filter((c) => preset.some((p) => sameId(p, c.id)))
      : (["masa", "salsa", "queso"] as const).map((k) => catalog.find((c) => c.kind === k)).filter((c): c is Ingredient => !!c);
    if (!list.some((c) => c.kind === "masa")) {
      const masa = catalog.find((c) => c.kind === "masa");
      if (masa) list.unshift(masa);
    }
    list.slice(0, ORDER_LIMITS.maxCustomIngredients).forEach((c) => addIngredient(c));
    renderSteps();
    update();
  }

  /* ------------------------------ Datos ------------------------------ */
  const offIng = ingredients.subscribe((s) => {
    if (s.status === "loading" || s.status === "idle") {
      const reduce = prefersReducedMotion();
      steps.replaceChildren(...Array.from({ length: 4 }, () => h("div", { class: `skeleton${reduce ? "" : " skeleton--pulse"}`, style: "height:128px;margin-bottom:16px" })));
      addBtn.disabled = true;
      return;
    }
    if (s.status === "error") {
      catalog = [];
      steps.replaceChildren(errorState("No pudimos cargar los ingredientes", s.error.message, () => void loadIngredients()));
      update();
      requestRefresh();
      return;
    }
    catalog = s.data;
    applyDefaults();
    requestRefresh();
  });
  const offMenu = menu.subscribe(() => { if (catalog.length) update(); });

  const offUi = ui.on((e) => {
    if (e.type !== "customize") return;
    const m = menu.get();
    const pizza = m.status === "ready" ? m.data.pizzas.find((p) => sameId(p.id, e.pizzaId)) : undefined;
    if (pizza && catalog.length) {
      size = "mediana";
      applyDefaults(pizza.ingredientIds);
      status.textContent = `Constructor cargado con la pizza ${pizza.name}. Personalízala a tu gusto.`;
    }
    scrollToTarget(el, 0);
  });

  return { el, destroy: () => { offIng(); offMenu(); offUi(); el.remove(); } };
}

/* --------------------------- Mini pizza (preview) --------------------------- */

interface MiniPizza {
  el: HTMLElement;
  target: HTMLElement;
  add(ing: Ingredient): void;
  remove(k: string): void;
  layerFor(k: string): HTMLElement | null;
  setSize(s: PizzaSize): void;
}

function createMiniPizza(small: boolean): MiniPizza {
  const base = smartImage({ src: BUILDER_ART.base, alt: "", width: 360, height: 360, className: "mini-pizza__layer" });
  const target = h("span", { class: "mini-pizza__target", "aria-hidden": "true" });
  const el = h("div", { class: `mini-pizza${small ? " mini-pizza--sm" : ""}`, role: "img", "aria-label": "Vista previa de tu pizza" }, base, target);
  const layers = new Map<string, HTMLElement>();
  const cheeses = new Set<string>();
  const cheeseLayer = smartImage({ src: BUILDER_ART.cheese, alt: "", width: 360, height: 360, className: "mini-pizza__layer" });
  cheeseLayer.style.zIndex = "2";

  function add(ing: Ingredient): void {
    const k = String(ing.id);
    if (layers.has(k)) return;
    let layer: HTMLElement | null = null;
    if (ing.kind === "salsa") {
      layer = smartImage({ src: builderSauceImage(ing.slug), alt: "", width: 360, height: 360, className: "mini-pizza__layer", fallbacks: ["/assets/pizzas/salsa.svg"] });
      layer.style.zIndex = "1";
    } else if (PIECE_KINDS.has(ing.kind)) {
      if (ing.kind === "queso") {
        cheeses.add(k);
        gsap.killTweensOf(cheeseLayer);
        gsap.set(cheeseLayer, { clearProps: "opacity,visibility" });
        if (!cheeseLayer.isConnected) el.insertBefore(cheeseLayer, target);
      }
      layer = h("div", { class: "mini-pizza__layer", style: `z-index:${ing.kind === "hierba" ? 4 : 3}` });
      const density = small ? 0.5 : Math.min(1, 4 / Math.max(1, pieceCount(ing.slug)) + 0.35);
      for (const p of layoutToppings([ing.slug], hashString(ing.slug), density)) {
        const img = smartImage({ src: builderIngredientImage(ing.slug), alt: "", width: 64, height: 64, className: "mini-pizza__piece", fallbacks: [ingredientImage(ing.slug).replace(".webp", ".svg"), GENERIC_INGREDIENT] });
        Object.assign(img.style, { left: `${50 + p.x * 50}%`, top: `${50 + p.y * 50}%`, width: `${p.size * 100}%`, rotate: `${p.rotation}deg` });
        layer.append(img);
      }
    }
    if (!layer) return; // masa: la base ya la representa
    layers.set(k, layer);
    el.insertBefore(layer, target);
  }

  function remove(k: string): void {
    const layer = layers.get(k);
    if (!layer) return;
    layers.delete(k);
    const fade = (node: HTMLElement): void => {
      if (prefersReducedMotion()) node.remove();
      else gsap.to(node, { autoAlpha: 0, duration: 0.25, ease: "power2.in", onComplete: () => { node.remove(); gsap.set(node, { clearProps: "opacity,visibility" }); } });
    };
    fade(layer);
    if (cheeses.delete(k) && cheeses.size === 0) fade(cheeseLayer);
  }

  return {
    el, target, add, remove,
    layerFor: (k) => layers.get(k) ?? null,
    setSize: (s) => { if (!small) gsap.to(el, { scale: { personal: 0.84, mediana: 0.92, familiar: 1 }[s], duration: 0.4, ease: "power2.out" }); },
  };
}

/**
 * Drawer del carrito (8.8) + checkout (8.16) → POST /api/orders.
 * Validación en español en el cliente (mismas reglas que el backend) y los
 * errores 400 del servidor (`customer.phone`, `items[0].quantity`…) se pintan
 * junto a su campo o en un aviso general.
 */
import { gsap, lockScroll } from "../motion/core";
import { h, prefersReducedMotion, type Component } from "../lib/dom";
import { icon } from "../lib/icons";
import { catalogImage } from "../lib/img";
import { money, PORTION_LABEL, SIZE_LABEL } from "../lib/format";
import { api, ApiError } from "../api/client";
import { ORDER_LIMITS, PIZZA_SIZES, type CustomerRequest, type OrderCreated, type PizzaSize } from "../api/types";
import { cart, cartCount, cartSubtotal, clearCart, currency, removeFromCart, ui, updateQuantity, updateSize, type CartItem } from "../state/store";
import { trapFocus } from "./focusTrap";

type View = "cart" | "checkout" | "success";
type Field = keyof CustomerRequest;

const STATUS_ES: Record<string, string> = {
  received: "Recibido", recibido: "Recibido", pending: "Pendiente", pendiente: "Pendiente", confirmed: "Confirmado",
  confirmado: "Confirmado", preparing: "En preparación", "en-preparacion": "En preparación",
};

export function validateCustomer(c: CustomerRequest): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  const name = c.name.trim();
  const phone = c.phone.trim();
  const address = c.address.trim();
  if (!name) errors.name = "Ingresa tu nombre para saber a quién entregar.";
  else if (name.length < 2) errors.name = "El nombre es demasiado corto.";
  else if (name.length > ORDER_LIMITS.maxNameLength) errors.name = `El nombre no puede superar los ${ORDER_LIMITS.maxNameLength} caracteres.`;
  const digits = (phone.match(/\d/g) ?? []).length;
  if (!phone) errors.phone = "Ingresa un teléfono para avisarte cuando salga tu pedido.";
  else if (!/^[\d\s()+-]+$/.test(phone)) errors.phone = "Usa solo números, espacios, paréntesis, + o -.";
  else if (digits < ORDER_LIMITS.minPhoneDigits) errors.phone = `El teléfono debe tener al menos ${ORDER_LIMITS.minPhoneDigits} dígitos.`;
  else if (phone.length > ORDER_LIMITS.maxPhoneLength) errors.phone = `El teléfono no puede superar los ${ORDER_LIMITS.maxPhoneLength} caracteres.`;
  if (!address) errors.address = "Ingresa la dirección de entrega.";
  else if (address.length < 6) errors.address = "Agrega más detalle: calle, número y distrito.";
  else if (address.length > ORDER_LIMITS.maxAddressLength) errors.address = `La dirección no puede superar los ${ORDER_LIMITS.maxAddressLength} caracteres.`;
  return errors;
}

export function createCartDrawer(): Component {
  const title = h("h2", { class: "t-h4", id: "cart-title" }, "Tu pedido");
  const closeBtn = h("button", { class: "icon-btn", type: "button", "aria-label": "Cerrar tu pedido" }, icon("x", 24));
  const body = h("div", { class: "cart-panel__body" });
  const foot = h("div", { class: "cart-panel__foot" });
  const panel = h("div", { class: "cart-panel", role: "dialog", "aria-modal": "true", "aria-labelledby": "cart-title" },
    h("div", { class: "cart-panel__head" }, title, closeBtn), body, foot);
  const scrim = h("div", { class: "cart-scrim", "aria-hidden": "true" });
  const el = h("div", { class: "cart-root" });
  // Estado inicial fuera de pantalla lo fija GSAP (un translate en CSS se sumaría al xPercent).
  gsap.set(panel, { xPercent: 100 });

  let view: View = "cart";
  let open = false;
  let release: (() => void) | null = null;
  let lastOrder: OrderCreated | null = null;
  const draft: CustomerRequest = { name: "", phone: "", address: "" };
  let tl: gsap.core.Timeline | null = null;

  /* ------------------------------ Vistas ------------------------------ */
  function sizeOptions(item: CartItem): HTMLSelectElement {
    const labels = item.portion ? PORTION_LABEL : SIZE_LABEL;
    const select = h("select", { class: "size-select", "aria-label": `Tamaño de ${item.name}` },
      ...PIZZA_SIZES.map((s) => h("option", { value: s, selected: s === item.size }, `${labels[s]} · ${money(item.unitPrices[s], currency())}`)));
    select.addEventListener("change", () => updateSize(item.key, select.value as PizzaSize));
    return select;
  }

  function itemRow(item: CartItem): HTMLElement {
    const qty = h("output", { "aria-live": "polite", "aria-label": `Cantidad de ${item.name}` }, String(item.quantity));
    const minus = h("button", { type: "button", "aria-label": `Quitar una ${item.name}` }, icon("minus", 16));
    const plus = h("button", { type: "button", "aria-label": `Agregar una ${item.name}`, disabled: item.quantity >= ORDER_LIMITS.maxQuantity }, icon("plus", 16));
    minus.addEventListener("click", () => updateQuantity(item.key, item.quantity - 1));
    plus.addEventListener("click", () => updateQuantity(item.key, item.quantity + 1));
    const remove = h("button", { class: "cart-item__remove", type: "button" }, "Quitar");
    remove.addEventListener("click", () => removeFromCart(item.key));
    return h("li", { class: "cart-item" },
      catalogImage({ src: item.image, alt: "", width: 72, height: 72, className: "cart-item__img" }),
      h("div", {},
        h("p", { class: "font-display t-h5" }, item.name),
        item.detail ? h("p", { class: "cart-item__mods" }, item.detail) : null,
        h("div", { class: "cart-item__controls" }, h("div", { class: "stepper" }, minus, qty, plus), sizeOptions(item))),
      h("div", { class: "cart-item__price" }, h("span", { class: "t-price" }, money(item.unitPrices[item.size] * item.quantity, currency())), remove));
  }

  function renderCart(): void {
    const items = cart.get();
    title.textContent = items.length ? `Tu pedido (${cartCount()})` : "Tu pedido";
    if (!items.length) {
      const goMenu = h("a", { class: "btn btn-secondary", href: "#menu" }, "Ver menú");
      goMenu.addEventListener("click", () => close());
      body.replaceChildren(h("div", { class: "cart-empty" }, icon("shopping-bag", 32),
        h("p", { class: "font-display t-h4", style: "color:var(--foreground)" }, "Tu pedido está vacío"),
        h("p", {}, "Elige tu pizza favorita o ármala a tu gusto."), goMenu));
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    body.replaceChildren(h("ul", { style: "list-style:none;margin:0;padding:0" }, ...items.map(itemRow)));
    const toCheckout = h("button", { class: "btn btn-primary btn--lg btn--block", type: "button" }, "Ir a pagar");
    toCheckout.addEventListener("click", () => setView("checkout"));
    foot.replaceChildren(
      h("div", { class: "cart-row" }, h("span", {}, "Subtotal"), h("span", { class: "tabular-nums" }, money(cartSubtotal(), currency()))),
      h("div", { class: "cart-row" }, h("span", {}, "Envío"), h("span", {}, "Gratis en tu primer pedido")),
      h("div", { class: "cart-total" }, h("span", { class: "font-display t-h5" }, "Total estimado"), h("span", { class: "t-price-lg" }, money(cartSubtotal(), currency()))),
      h("div", { style: "margin-top:16px" }, toCheckout),
      h("p", { class: "cart-legal" }, "El total final lo confirma la cocina al recibir tu pedido."),
    );
  }

  function field(name: Field, label: string, input: HTMLInputElement | HTMLTextAreaElement, help?: string): HTMLElement {
    const id = `checkout-${name}`;
    input.id = id;
    input.name = name;
    input.value = draft[name];
    const helpEl = help ? h("p", { class: "field__help", id: `${id}-help` }, help) : null;
    const errEl = h("p", { class: "field__error", id: `${id}-error`, hidden: true });
    input.setAttribute("aria-describedby", [helpEl?.id, errEl.id].filter(Boolean).join(" "));
    input.addEventListener("input", () => { draft[name] = input.value; if (input.getAttribute("aria-invalid") === "true") showFieldError(name, validateCustomer(draft)[name]); });
    input.addEventListener("blur", () => { if (input.value.trim()) showFieldError(name, validateCustomer(draft)[name]); });
    return h("div", { class: "field", "data-field": name }, h("label", { for: id }, label), input, helpEl, errEl);
  }

  function showFieldError(name: Field, message: string | undefined): void {
    const input = body.querySelector<HTMLInputElement>(`#checkout-${name}`);
    const err = body.querySelector<HTMLElement>(`#checkout-${name}-error`);
    if (!input || !err) return;
    input.setAttribute("aria-invalid", message ? "true" : "false");
    err.hidden = !message;
    err.replaceChildren(...(message ? [icon("circle-alert", 16), h("span", {}, message)] : []));
  }

  function renderCheckout(): void {
    title.textContent = "Datos de entrega";
    const back = h("button", { class: "link-arrow", type: "button", style: "background:none;border:0;padding:0" }, icon("chevron-left", 16), "Volver al pedido");
    back.addEventListener("click", () => setView("cart"));
    const alert = h("div", { class: "alert", role: "alert", tabindex: "-1", hidden: true });
    const submit = h("button", { class: "btn btn-primary btn--lg btn--block", type: "submit" }, h("span", { class: "btn__icon" }, icon("check", 20)), h("span", {}, `Confirmar pedido · ${money(cartSubtotal(), currency())}`));
    const form = h("form", { class: "form", novalidate: true },
      back,
      field("name", "Nombre", h("input", { type: "text", autocomplete: "name", maxlength: String(ORDER_LIMITS.maxNameLength), placeholder: "Ej. Lucía Ramírez" })),
      field("phone", "Teléfono", h("input", { type: "tel", autocomplete: "tel", inputmode: "tel", maxlength: String(ORDER_LIMITS.maxPhoneLength), placeholder: "Ej. 987 654 321" }), "Te escribimos por WhatsApp cuando salga del horno."),
      field("address", "Dirección de entrega", h("textarea", { autocomplete: "street-address", maxlength: String(ORDER_LIMITS.maxAddressLength), rows: "3", placeholder: "Calle, número, distrito y referencia" })),
      alert,
      submit,
      h("p", { class: "cart-legal" }, `${cartCount()} ${cartCount() === 1 ? "producto" : "productos"} · pago contra entrega.`),
    );
    form.addEventListener("submit", (e) => { e.preventDefault(); void send(form, submit, alert); });
    body.replaceChildren(form);
    foot.hidden = true;
  }

  async function send(form: HTMLFormElement, submit: HTMLButtonElement, alert: HTMLElement): Promise<void> {
    const errors = validateCustomer(draft);
    (["name", "phone", "address"] as const).forEach((f) => showFieldError(f, errors[f]));
    const first = (["name", "phone", "address"] as const).find((f) => errors[f]);
    if (first) { form.querySelector<HTMLElement>(`#checkout-${first}`)?.focus(); return; }
    alert.hidden = true;
    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");
    const spinner = h("span", { class: "spinner", "aria-hidden": "true" });
    submit.prepend(spinner);
    const items = cart.get();
    try {
      lastOrder = await api.createOrder({
        items: items.map((i) => ({ pizzaId: i.pizzaId, customIngredientIds: i.customIngredientIds, size: i.size, quantity: i.quantity })),
        customer: { name: draft.name.trim(), phone: draft.phone.trim(), address: draft.address.trim() },
      });
      clearCart();
      setView("success");
    } catch (err) {
      const e = err instanceof ApiError ? err : new ApiError("network", "Ocurrió un error inesperado.");
      const general: string[] = [];
      if (e.kind === "validation" && e.problem) {
        for (const [k, msgs] of Object.entries(e.problem.errors)) {
          const m = /^customer\.(name|phone|address)$/i.exec(k);
          if (m) showFieldError(m[1]!.toLowerCase() as Field, msgs.join(" "));
          else {
            const idx = /^items\[(\d+)\]/i.exec(k);
            const who = idx ? items[Number(idx[1])]?.name : undefined;
            general.push(...msgs.map((msg) => (who ? `${who}: ${msg}` : msg)));
          }
        }
        if (!general.length && !Object.keys(e.problem.errors).length) general.push(e.message);
      } else {
        general.push(`${e.message} Tu pedido sigue guardado; vuelve a intentarlo.`);
      }
      if (general.length) {
        alert.hidden = false;
        alert.replaceChildren(icon("circle-alert", 20), h("div", {}, ...general.map((g) => h("p", {}, g))));
        alert.focus();
      } else {
        form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      }
    } finally {
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
      spinner.remove();
    }
  }

  function renderSuccess(): void {
    title.textContent = "¡Pedido recibido!";
    const o = lastOrder;
    const done = h("button", { class: "btn btn-secondary", type: "button" }, "Seguir explorando");
    done.addEventListener("click", () => close());
    const ic = icon("circle-check", 32);
    ic.classList.add("success__icon");
    body.replaceChildren(h("div", { class: "success", role: "status" }, ic,
      h("p", { class: "font-display t-h3" }, "Ya está en el horno"),
      h("p", { style: "color:var(--muted-foreground)" }, "Te avisaremos cuando salga a tu dirección."),
      o ? h("dl", {},
        h("dt", {}, "N.º de pedido"), h("dd", { title: String(o.id) }, String(o.id).slice(0, 8).toUpperCase()),
        h("dt", {}, "Estado"), h("dd", {}, STATUS_ES[o.status.toLowerCase()] ?? o.status),
        h("dt", {}, "Total"), h("dd", {}, money(o.total, o.currency)),
        h("dt", {}, "Llega en"), h("dd", {}, `≈ ${o.estimatedMinutes} min`)) : null,
      done));
    foot.hidden = true;
  }

  function setView(next: View): void {
    view = next;
    if (view === "cart") renderCart();
    else if (view === "checkout") renderCheckout();
    else renderSuccess();
    body.scrollTop = 0;
    if (view === "checkout") body.querySelector<HTMLInputElement>("input")?.focus();
  }

  /* ---------------------------- Abrir/cerrar ---------------------------- */
  function buildTl(): gsap.core.Timeline {
    const reduce = prefersReducedMotion();
    if (reduce) {
      return gsap.timeline({ paused: true })
        .to(scrim, { autoAlpha: 1, duration: 0.15 }, 0)
        .fromTo(panel, { xPercent: 0, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, 0);
    }
    return gsap.timeline({ paused: true, defaults: { ease: "power3.out" } })
      .to(scrim, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0)
      .fromTo(panel, { xPercent: 100, autoAlpha: 1 }, { xPercent: 0, duration: 0.5 }, 0);
  }

  function openDrawer(): void {
    if (open) return;
    open = true;
    if (view === "success") view = "cart";
    setView(view === "checkout" && cart.get().length === 0 ? "cart" : view);
    tl ??= buildTl();
    gsap.set(panel, { visibility: "visible" });
    tl.timeScale(1).play();
    if (!prefersReducedMotion()) gsap.from(body.querySelectorAll(".cart-item"), { x: 24, autoAlpha: 0, stagger: 0.04, duration: 0.3, ease: "power2.out", delay: 0.2 });
    lockScroll(true);
    release = trapFocus(panel, close, [scrim]);
    closeBtn.focus();
  }

  function close(): void {
    if (!open) return;
    open = false;
    tl?.timeScale(1.6).reverse();
    tl?.eventCallback("onReverseComplete", () => gsap.set(panel, { visibility: "hidden" }));
    lockScroll(false);
    release?.();
    release = null;
  }

  closeBtn.addEventListener("click", close);
  scrim.addEventListener("click", close);
  const offUi = ui.on((e) => { if (e.type === "open-cart") openDrawer(); });
  const offCart = cart.subscribe(() => { if (view === "cart") renderCart(); });

  return { el, portals: [scrim, panel], destroy: () => { offUi(); offCart(); close(); scrim.remove(); panel.remove(); } };
}

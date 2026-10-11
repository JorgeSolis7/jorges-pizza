/** Toast (8.9): "Agregado al pedido", 3 s, role=status. */
import { gsap } from "../motion/core";
import { h, prefersReducedMotion, type Component } from "../lib/dom";
import { icon } from "../lib/icons";
import { ui } from "../state/store";

export function createToast(): Component {
  const text = h("span");
  const action = h("button", { type: "button" }, "Ver pedido");
  const el = h("div", { class: "toast", role: "status", "aria-live": "polite" }, icon("circle-check", 20), text, action);
  let timer = 0;

  const hide = (): void => {
    gsap.to(el, { autoAlpha: 0, duration: 0.2, ease: "power2.in" });
  };
  const show = (message: string): void => {
    text.textContent = message;
    window.clearTimeout(timer);
    const reduce = prefersReducedMotion();
    gsap.fromTo(el, { autoAlpha: 0, y: reduce ? 0 : 16 }, { autoAlpha: 1, y: 0, duration: reduce ? 0.15 : 0.3, ease: "power2.out", overwrite: true });
    timer = window.setTimeout(hide, 3000);
  };
  action.addEventListener("click", () => {
    hide();
    ui.emit({ type: "open-cart" });
  });
  const off = ui.on((e) => {
    if (e.type === "added") show(`Se agregó ${e.name} a tu pedido`);
  });

  return { el, destroy: () => { off(); window.clearTimeout(timer); el.remove(); } };
}

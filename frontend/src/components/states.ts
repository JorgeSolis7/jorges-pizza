/** Estados compartidos: error con reintento (la UI se degrada si la API no responde). */
import { h } from "../lib/dom";
import { icon } from "../lib/icons";

export function errorState(title: string, message: string, onRetry: () => void): HTMLElement {
  const retry = h("button", { class: "btn btn-secondary", type: "button" }, icon("rotate-cw", 20), "Reintentar");
  retry.addEventListener("click", () => {
    retry.setAttribute("aria-busy", "true");
    retry.disabled = true;
    onRetry();
  });
  const ic = icon("circle-alert", 32);
  ic.classList.add("state-error__icon");
  return h("div", { class: "state-error", role: "alert" },
    ic,
    h("p", { class: "font-display t-h4" }, title),
    h("p", { class: "state-error__msg" }, `${message} Puedes intentarlo de nuevo en unos segundos.`),
    retry,
  );
}

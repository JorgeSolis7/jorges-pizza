/** Encabezado de sección (8.12): eyebrow → h2 (con SplitText) → lead opcional. */
import { h } from "../lib/dom";

export interface SectionHeadOptions {
  id: string;
  eyebrow: string;
  /** Texto del h2; `highlight` se envuelve en <em> (palabra destacada). */
  title: string;
  highlight?: string;
  lead?: string;
  center?: boolean;
  aside?: HTMLElement;
}

export function sectionHead(o: SectionHeadOptions): HTMLElement {
  const title = h("h2", { class: "t-h2 section-head__title", id: o.id, "data-split": true });
  if (o.highlight && o.title.includes(o.highlight)) {
    const [before, after] = o.title.split(o.highlight) as [string, string];
    title.append(before, h("em", {}, o.highlight), after);
  } else {
    title.textContent = o.title;
  }
  const text = h("div", {}, h("p", { class: "t-eyebrow section-head__eyebrow", "data-reveal": true }, o.eyebrow), title);
  if (o.lead) text.append(h("p", { class: "t-lead section-head__lead", "data-reveal": true }, o.lead));
  return h(
    "header",
    { class: `section-head${o.center ? " section-head--center" : ""}` },
    o.aside ? h("div", { class: "section-head__row" }, text, o.aside) : text,
  );
}

/** Helper mínimo y tipado para crear DOM sin framework. */

type Child = Node | string | number | null | undefined | false;
type Attrs = Record<string, string | number | boolean | null | undefined | EventListener>;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (typeof value === "function") {
      el.addEventListener(key.replace(/^on/, "").toLowerCase(), value);
    } else if (key === "class") {
      el.className = String(value);
    } else if (key === "html") {
      el.innerHTML = String(value); // solo con contenido propio (SVG generado), nunca con datos de la API
    } else {
      el.setAttribute(key, value === true ? "" : String(value));
      // Estado vivo además del atributo (la restauración de formularios del navegador puede pisar solo el atributo).
      if (key === "checked" || key === "selected" || key === "disabled") (el as unknown as Record<string, unknown>)[key] = true;
    }
  }
  append(el, ...children);
  return el;
}

export function append(parent: Node, ...children: Child[]): void {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    parent.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
  }
}

/** Crea nodos desde un string de marcado propio (estático, sin datos externos). */
export function fromHTML<T extends Element = HTMLElement>(markup: string): T {
  const tpl = document.createElement("template");
  tpl.innerHTML = markup.trim();
  const el = tpl.content.firstElementChild;
  if (!el) throw new Error("fromHTML: marcado vacío");
  return el as T;
}

export function qs<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`No se encontró ${selector}`);
  return el;
}

export function qsa<T extends Element = HTMLElement>(root: ParentNode, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

export const prefersReducedMotion = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Interfaz común de los módulos de UI: poseen su DOM y sus timelines, y se limpian solos. */
export interface Component<E extends HTMLElement = HTMLElement> {
  el: E;
  /** Elementos que se montan directamente en <body> (overlays, drawers). */
  portals?: HTMLElement[];
  /** Crea los ScrollTriggers/timelines. Se llama en orden de documento tras cargar fuentes. */
  animate?(): void;
  destroy(): void;
}

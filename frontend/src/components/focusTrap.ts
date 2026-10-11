/** Atrapa el foco dentro de un diálogo y lo devuelve al cerrar. */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function trapFocus(container: HTMLElement, onEscape: () => void, keep: readonly HTMLElement[] = []): () => void {
  const previous = document.activeElement as HTMLElement | null;
  const siblings = Array.from(document.body.children).filter((c): c is HTMLElement => c instanceof HTMLElement && c !== container && !c.contains(container) && !keep.includes(c));
  siblings.forEach((s) => s.setAttribute("inert", ""));

  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      e.preventDefault();
      onEscape();
      return;
    }
    if (e.key !== "Tab") return;
    const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0]!;
    const last = items[items.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  document.addEventListener("keydown", onKey);

  return () => {
    document.removeEventListener("keydown", onKey);
    siblings.forEach((s) => s.removeAttribute("inert"));
    previous?.focus({ preventScroll: true });
  };
}

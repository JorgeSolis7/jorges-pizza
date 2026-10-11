/**
 * Revelados de toda la home (J9 + SplitText, DESIGN.md 9.5 §3).
 * `[data-reveal]`: fade + subida al 80 % del viewport, una vez, en lotes.
 * `[data-split]`: líneas enmascaradas que suben. Con reduce: todo visible.
 * Los elementos que llegan después (datos de la API) se registran con `observeReveals`.
 */
import { gsap, ScrollTrigger, SplitText } from "./core";
import { mq } from "./tokens";

let enabled = false;
const splits: SplitText[] = [];
const mm = gsap.matchMedia();

function batch(targets: Element[]): void {
  if (targets.length === 0) return;
  ScrollTrigger.batch(targets, {
    start: "top 80%", once: true,
    onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.1, overwrite: true }),
  });
}

function split(h: HTMLElement): void {
  if (h.dataset.splitDone !== undefined) return;
  h.dataset.splitDone = "";
  splits.push(SplitText.create(h, {
    type: "lines", mask: "lines", autoSplit: true,
    onSplit(self) {
      gsap.set(h, { visibility: "visible" });
      return gsap.from(self.lines, {
        yPercent: 100, duration: 0.9, ease: "power3.out", stagger: 0.08,
        scrollTrigger: { trigger: h, start: "top 85%", once: true },
      });
    },
  }));
}

export function initReveals(): void {
  mm.add({ motion: mq.motion, reduce: mq.reduce }, (ctx) => {
    if (ctx.conditions?.reduce) {
      enabled = false;
      gsap.set("[data-reveal], [data-split]", { clearProps: "all", autoAlpha: 1 });
      return;
    }
    enabled = true;
    batch(gsap.utils.toArray<HTMLElement>("[data-reveal]"));
    gsap.utils.toArray<HTMLElement>("[data-split]").forEach(split);
    return () => {
      enabled = false;
      splits.splice(0).forEach((s) => s.revert());
      document.querySelectorAll<HTMLElement>("[data-split-done]").forEach((el) => delete el.dataset.splitDone);
    };
  });
}

/** Registra revelados para contenido añadido tras la carga (cards de la API). */
export function observeReveals(scope: ParentNode): void {
  const els = Array.from(scope.querySelectorAll<HTMLElement>("[data-reveal]"));
  if (scope instanceof HTMLElement && scope.hasAttribute("data-reveal")) els.unshift(scope);
  if (!enabled) {
    if (window.matchMedia(mq.reduce).matches) gsap.set(els, { clearProps: "all", autoAlpha: 1 });
    return; // antes de initReveals: los recogerá el batch inicial
  }
  batch(els);
}

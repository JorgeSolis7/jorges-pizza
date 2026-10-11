/**
 * Núcleo de motion (DESIGN.md §9.3–9.4): registro de plugins, Lenis solo en
 * escritorio con puntero fino y sin reduce, bloqueo de scroll para overlays y
 * refresco de ScrollTrigger tras fuentes/imágenes/datos.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { mq } from "./tokens";

gsap.registerPlugin(ScrollTrigger, Flip, DrawSVGPlugin, SplitText);
gsap.defaults({ duration: 0.6, ease: "power2.out" });
ScrollTrigger.config({ ignoreMobileResize: true });
if (import.meta.env.DEV && location.search.includes("markers")) ScrollTrigger.defaults({ markers: true });

export { gsap, ScrollTrigger, Flip, SplitText };

let lenis: Lenis | null = null;
const globalMM = gsap.matchMedia();

export function initSmoothScroll(): void {
  globalMM.add(`${mq.desktop} and ${mq.hover} and ${mq.motion}`, () => {
    const instance = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: { offset: 0 } });
    lenis = instance;
    instance.on("scroll", ScrollTrigger.update);
    const raf = (t: number): void => instance.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      lenis = null;
    };
  });
}

/** Desplazamiento a un elemento respetando Lenis y reduce. */
export function scrollToTarget(target: HTMLElement | number, offset = 0): void {
  if (lenis) {
    lenis.scrollTo(target, { offset: -offset, duration: 1.1 });
    return;
  }
  const top = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY - offset;
  const reduce = window.matchMedia(mq.reduce).matches;
  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
}

let overlayCount = 0;
/** Bloquea el scroll mientras hay un overlay abierto (drawer, menú móvil). */
export function lockScroll(on: boolean): void {
  overlayCount = Math.max(0, overlayCount + (on ? 1 : -1));
  const locked = overlayCount > 0;
  document.documentElement.classList.toggle("is-overlay-open", locked);
  document.documentElement.style.overflow = locked ? "hidden" : "";
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
}

let refreshTimer = 0;
/** ScrollTrigger.refresh() con debounce: se llama tras pintar datos de la API. */
export function requestRefresh(delay = 120): void {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), delay);
}

/** Espera fuentes e imágenes de secciones pinneadas (start/end dependen de sus alturas). */
export async function waitForLayoutAssets(root: ParentNode = document): Promise<void> {
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img[data-pin-asset]")).map((img) =>
    img.complete && img.naturalWidth > 0
      ? img.decode().catch(() => undefined)
      : new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          setTimeout(resolve, 3000);
        }),
  );
  await Promise.race([Promise.all([fonts, ...imgs]), new Promise((r) => setTimeout(r, 3500))]);
}

/** Hand-lettering que se escribe solo (J5): DrawSVG por trazo, una vez. */
export function drawLettering(scope: ParentNode, start = "top 75%"): gsap.core.Tween[] {
  return Array.from(scope.querySelectorAll<SVGSVGElement>("svg.lettering")).map((svg) =>
    gsap.from(svg.querySelectorAll("path"), {
      drawSVG: 0, duration: 1.6, ease: "power1.inOut", stagger: { amount: 0.8 },
      scrollTrigger: { trigger: svg, start, once: true },
    }),
  );
}

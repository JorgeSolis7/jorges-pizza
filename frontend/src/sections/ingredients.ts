/**
 * Sección 5 · Ingredientes de verdad (J5 + J6 + J4, DESIGN.md 9.5 §5).
 * Lettering que se escribe (DrawSVG) + marquee infinito de 3 filas ligado a la
 * velocidad de scroll (datos de GET /api/ingredients, con respaldo local) +
 * ingredientes sueltos en parallax por delante.
 * v2 (pack fotorrealista): la cinta es tipográfica (nombre + origen) y solo los
 * ingredientes con foto real llevan miniatura; el parallax usa las fotos del
 * pack. Así no se mezclan ilustraciones planas con fotografía.
 */
import { drawLettering, gsap, ScrollTrigger } from "../motion/core";
import { MM_CONDITIONS, flags, mq } from "../motion/tokens";
import { h, qs, qsa, type Component } from "../lib/dom";
import { icon } from "../lib/icons";
import { PHOTO, PHOTO_BY_SLUG, photo, type PhotoIngredient } from "../lib/img";
import { letteringHeading } from "../components/lettering";
import { ingredients } from "../state/store";

interface MarqueeItem { slug: string; name: string }

const ORIGIN: Record<string, string> = {
  mozzarella: "Fior di latte, Campania", parmigiano: "Parma, Italia", gorgonzola: "Lombardía, Italia",
  prosciutto: "Parma, Italia", pepperoni: "Curado en casa", nduja: "Calabria, Italia", champinones: "Huaral, Lima",
  "aceitunas-botija": "Tacna, Perú", "cebolla-caramelizada": "Arequipa, Perú", "pimientos-asados": "Cañete, Lima",
  "ajo-confitado": "Arequipa, Perú", albahaca: "Nuestro huerto", rucula: "Cieneguilla, Lima", oregano: "Tacna, Perú",
  "salsa-pomodoro": "San Marzano, Campania", "crema-de-rocoto": "Oxapampa, Perú", "pesto-genoves": "Receta de Génova",
  "masa-tradicional": "Harina tipo 00", "masa-delgada": "Harina tipo 00", "masa-integral": "Trigo de Huamachuco",
};

/** Respaldo si la API no responde: el marquee nunca queda vacío. */
const FALLBACK: MarqueeItem[] = [
  { slug: "mozzarella", name: "Mozzarella fior di latte" }, { slug: "salsa-pomodoro", name: "Tomate San Marzano" },
  { slug: "albahaca", name: "Albahaca fresca" }, { slug: "prosciutto", name: "Prosciutto di Parma" },
  { slug: "rucula", name: "Rúcula" }, { slug: "parmigiano", name: "Parmigiano Reggiano" },
  { slug: "nduja", name: "'Nduja calabresa" }, { slug: "champinones", name: "Champiñones" },
  { slug: "aceitunas-botija", name: "Aceitunas de botija" }, { slug: "masa-tradicional", name: "Masa de 48 horas" },
  { slug: "gorgonzola", name: "Gorgonzola dolce" }, { slug: "crema-de-rocoto", name: "Crema de rocoto" },
];

const PARALLAX: readonly { kind: PhotoIngredient; left: string; top: string; w: number; speed: number; rotate: number; desktopOnly: boolean }[] = [
  { kind: "basil", left: "3%", top: "6%", w: 120, speed: 0.3, rotate: 28, desktopOnly: false },
  { kind: "tomato", left: "85%", top: "10%", w: 132, speed: 0.22, rotate: -14, desktopOnly: false },
  { kind: "mushroom", left: "9%", top: "93%", w: 96, speed: 0.06, rotate: 32, desktopOnly: true },
  { kind: "mozzarella", left: "84%", top: "92%", w: 120, speed: 0.05, rotate: -18, desktopOnly: true },
  { kind: "rucula", left: "93%", top: "36%", w: 84, speed: 0.12, rotate: -36, desktopOnly: true },
  { kind: "oregano", left: "1%", top: "30%", w: 92, speed: 0.25, rotate: 30, desktopOnly: true },
];

export function createIngredients(): Component {
  const marquee = h("div", { class: "marquee" });
  const toggle = h("button", { class: "btn btn-outline btn--icon marquee__toggle", type: "button", "aria-pressed": "false", "aria-label": "Pausar la cinta de ingredientes" }, icon("pause", 20));
  const el = h("section", { class: "section ingredients", id: "ingredientes", "aria-labelledby": "ingredients-title" },
    h("div", { class: "container section-head section-head--center" },
      h("p", { class: "t-eyebrow section-head__eyebrow", "data-reveal": true }, "Ingredientes de verdad"),
      Object.assign(letteringHeading("Masa madre, 48 horas", ["MASA MADRE,", "48 HORAS"], 5), { id: "ingredients-title" }),
      h("p", { class: "t-lead section-head__lead", "data-reveal": true }, "Fermentamos la masa dos días y la coronamos con productos de Campania y de los valles del Perú. Nada más."),
    ),
    marquee,
    h("div", { class: "container marquee__foot" },
      h("a", { class: "link-arrow", href: "#arma-tu-pizza" }, "Arma la tuya con estos ingredientes", icon("arrow-right", 16)),
      toggle),
    ...PARALLAX.map((p) => {
      const img = photo(PHOTO[p.kind], { className: "parallax-piece" });
      Object.assign(img.style, { left: p.left, top: p.top });
      img.style.setProperty("--pw", `${p.w}px`);
      img.dataset.speed = String(p.speed);
      img.dataset.rotate = String(p.rotate);
      if (p.desktopOnly) img.dataset.desktopOnly = "";
      return img;
    }),
  );

  /* ------------------------------ Filas ------------------------------ */
  function figure(item: MarqueeItem): HTMLElement {
    const origin = ORIGIN[item.slug];
    const kind = PHOTO_BY_SLUG[item.slug];
    return h("figure", { class: `marquee__item${kind ? " marquee__item--photo" : ""}` },
      kind ? photo(PHOTO[kind], { className: "marquee__img" }) : null,
      h("figcaption", {},
        h("span", { class: "marquee__name" }, item.name),
        origin ? h("span", { class: "marquee__origin" }, origin) : null));
  }

  function buildRows(list: MarqueeItem[]): void {
    const rows: MarqueeItem[][] = [[], [], []];
    list.forEach((item, i) => rows[i % 3]!.push(item));
    marquee.replaceChildren(...rows.map((row, r) => {
      // Cada juego debe medir ≥ 1440 px: se repite hasta ~8 ítems.
      const filled: MarqueeItem[] = [];
      while (filled.length < 8 && row.length) filled.push(...row);
      const set = (hidden: boolean): HTMLElement =>
        h("div", { class: "marquee__set", ...(hidden ? { "aria-hidden": "true" } : { role: "list" }) },
          ...filled.map((item) => { const f = figure(item); if (!hidden) f.setAttribute("role", "listitem"); return f; }));
      return h("div", { class: "marquee__row", ...(r === 2 ? { "data-desktop-only": true } : {}) },
        h("div", { class: "marquee__track" }, set(false), set(true)));
    }));
  }

  /* ------------------------------ Motion ------------------------------ */
  const mm = gsap.matchMedia();
  const marqueeMM = gsap.matchMedia();
  let animated = false;
  let userPaused = false;

  function startMarquee(): void {
    marqueeMM.add(MM_CONDITIONS, (ctx) => {
      if (flags(ctx.conditions).reduce) return; // CSS: filas estáticas en flex-wrap
      const tracks = qsa(marquee, ".marquee__track").filter((t) => t.offsetParent !== null);
      const tls = tracks.map((track, i) => {
        const rev = i % 2 === 1;
        return gsap.fromTo(track, { xPercent: rev ? -50 : 0 }, { xPercent: rev ? 0 : -50, duration: 40 + i * 6, ease: "none", repeat: -1, paused: true });
      });
      const setSpeed = (v: number, d: number): void => tls.forEach((t) => { gsap.to(t, { timeScale: v, duration: d, overwrite: true }); });
      const st = ScrollTrigger.create({
        trigger: marquee, start: "top bottom", end: "bottom top",
        onToggle: (self) => tls.forEach((t, i) => {
          tracks[i]!.style.willChange = self.isActive ? "transform" : "";
          if (self.isActive && !userPaused) t.play(); else t.pause();
        }),
        onUpdate: (self) => { if (!userPaused) setSpeed(1 + Math.min(Math.abs(self.getVelocity()) / 400, 3), 0.2); },
      });
      const onScrollEnd = (): void => { if (!userPaused) setSpeed(1, 0.6); };
      ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);
      const hoverable = window.matchMedia(mq.hover).matches;
      const enter = tracks.map((_t, i) => () => { if (!userPaused && hoverable) gsap.to(tls[i]!, { timeScale: 0, duration: 0.4, overwrite: true }); });
      const leave = tracks.map((_t, i) => () => { if (!userPaused && hoverable) gsap.to(tls[i]!, { timeScale: 1, duration: 0.4, overwrite: true }); });
      tracks.forEach((t, i) => { t.addEventListener("mouseenter", enter[i]!); t.addEventListener("mouseleave", leave[i]!); });
      const onBtn = (): void => {
        userPaused = !userPaused;
        toggle.setAttribute("aria-pressed", String(userPaused));
        toggle.setAttribute("aria-label", userPaused ? "Reanudar la cinta de ingredientes" : "Pausar la cinta de ingredientes");
        toggle.replaceChildren(icon(userPaused ? "play" : "pause", 20));
        tls.forEach((t) => (userPaused || !st.isActive ? t.pause() : t.play()));
      };
      toggle.addEventListener("click", onBtn);
      return () => {
        ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd);
        toggle.removeEventListener("click", onBtn);
        tracks.forEach((t, i) => { t.removeEventListener("mouseenter", enter[i]!); t.removeEventListener("mouseleave", leave[i]!); });
      };
    });
  }

  const offIng = ingredients.subscribe((s) => {
    if (s.status === "loading" || s.status === "idle") {
      if (!marquee.childElementCount) buildRows(FALLBACK);
      return;
    }
    const list = s.status === "ready" && s.data.length ? s.data.map((i) => ({ slug: i.slug, name: i.name })) : FALLBACK;
    marqueeMM.revert();
    buildRows(list);
    if (animated) { startMarquee(); ScrollTrigger.refresh(); }
  });

  const animate = (): void => {
    animated = true;
    mm.add(MM_CONDITIONS, (ctx) => {
      const { mobile, reduce } = flags(ctx.conditions);
      if (reduce) return; // lettering completo, parallax en su posición CSS
      drawLettering(el);
      // J4: parallax (speed máx. 0.15 en móvil).
      qsa(el, "[data-speed]").filter((p) => p.offsetParent !== null).forEach((p) => {
        const speed = Math.min(Number(p.dataset.speed), mobile ? 0.15 : 0.35);
        gsap.to(p, {
          y: () => -speed * el.offsetHeight, rotation: Number(p.dataset.rotate ?? 0), ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
        });
      });
    });
    startMarquee();
  };

  // El botón de pausa no tiene sentido con reduce (no hay movimiento).
  if (window.matchMedia(mq.reduce).matches) qs(el, ".marquee__foot").removeChild(toggle);

  return { el, animate, destroy: () => { offIng(); mm.revert(); marqueeMM.revert(); el.remove(); } };
}

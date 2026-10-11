/**
 * Sección 1 · Hero "La pizza se arma" (J2 + J3, DESIGN.md 9.5 §1), versión foto.
 * Ancla: pizza-base.webp (masa + salsa + mozzarella, vista frontal ligeramente
 * inclinada; contain, nunca recortada). Alrededor flotan ingredientes
 * fotográficos en 3 planos de profundidad; con scroll (pin + scrub) viajan
 * desde los bordes y ATERRIZAN sobre la superficie de la masa.
 *
 * Geometría del aterrizaje (medida sobre la imagen 1377 × 1142):
 *   - zona de salsa/queso dentro del borde: elipse centro (712, 512), rx 515, ry 345
 *   - superficie superior completa (borde incluido): ancho 1330 px
 *   - proporción de la elipse visible ry/rx ≈ 0.67 → scaleY de los ingredientes
 * Los destinos se calculan en coordenadas de la imagen y se proyectan sobre la
 * caja "contain" real de la <img> (no la del contenedor), así que son exactos a
 * cualquier tamaño. Se recalculan en cada refresh (valores función +
 * invalidateOnRefresh).
 *
 * Capas (z): pizza (1) < TODOS los ingredientes (2) < texto (3); el header
 * (z 50, fuera del hero) queda siempre encima. La profundidad se transmite con
 * tamaño y velocidad de parallax, nunca pasando por detrás de la pizza.
 *
 * Envoltorios por ingrediente (cada transform tiene un único dueño):
 *   .hero__ing         → ancla de tamaño 0 en el centro visual. Scroll: x, y, scaleX, scaleY
 *                        (aplastado en espacio de pantalla; transform-origin 0 0 = el centro)
 *   .hero__ing-spin    → scroll: giro plano sobre la masa (dentro del aplastado)
 *   .hero__ing-idle    → reposo: flotación (y) y cabeceo; se detiene al aterrizar
 *   .hero__ing-center  → solo CSS (translate -50 %, giro de reposo, ancho): GSAP nunca lo toca, así el
 *                        centrado no depende de que la foto (lazy) ya tenga alto
 *
 * Reduce: pizza armada estática (ingredientes ya colocados), sin pin.
 */
import { gsap, ScrollTrigger } from "../motion/core";
import { MM_CONDITIONS, flags, mq } from "../motion/tokens";
import { fromHTML, qs, qsa, type Component } from "../lib/dom";
import { icon } from "../lib/icons";
import { PHOTO, photo } from "../lib/img";

/** Geometría de pizza-base.webp en píxeles de la imagen (ver cabecera). */
const BASE = { w: 1377, h: 1142, cx: 712, cy: 512, rx: 515, ry: 345, surface: 1330 } as const;
/** Proporción de la elipse visible de la cara superior: aplasta los ingredientes en perspectiva. */
const SQUASH = BASE.ry / BASE.rx;

type Kind = "pepperoni" | "basil" | "mushroom" | "tomato";
/** Ancho aterrizado como fracción del diámetro de la cara superior (tamaño realista de topping). */
const TOPPING_SIZE: Record<Kind, number> = { pepperoni: 0.135, basil: 0.13, mushroom: 0.125, tomato: 0.12 };

type Depth = 1 | 2 | 3;
/** Punto de aterrizaje en el disco unidad de la zona de salsa (u → derecha, v → hacia delante) y giro final. */
type Land = readonly [u: number, v: number, rot: number];
interface Piece {
  kind: Kind;
  depth: Depth;
  /** Escritorio: centro en % del hero y ancho en px a 1440. */
  d: readonly [left: number, top: number, width: number];
  /** Móvil (opcional): centro en % de la zona de la pizza (el campo arranca bajo los CTA) y ancho en px. Sin `m`, no se muestra en móvil. */
  m?: readonly [left: number, top: number, width: number];
  rot: number;
  land: Land;
  /** Destino alternativo en móvil (menos piezas → reparto distinto). */
  landM?: Land;
}

/*
 * Reparto en el disco (radio ≤ 0.74 → nunca sobre el borde): centro + anillo
 * de 4 (r 0.4) + anillo de 7 (r 0.74). Separación mínima ≈ 0.36 unidades
 * (> ancho de un topping ≈ 0.31) → sin solapes. Tipos alternados para que no
 * se amontonen iguales. Cada pieza aterriza en el lado de la pizza por el que
 * entra (trayectorias sin cruces bruscos). En móvil (7 piezas) el reparto es un
 * hexágono: centro + 6 a r 0.62 (separación 0.62).
 * Reposo en escritorio (1440×900): fuera de la franja del header y de la
 * columna del texto (x < 46 %).
 */
const PIECES: readonly Piece[] = [
  // Plano cercano (3): grandes y rápidos.
  { kind: "pepperoni", depth: 3, d: [89, 80, 150], m: [90, 80, 76], rot: -12, land: [0.67, 0.31, 18], landM: [0.54, 0.31, 18] },
  { kind: "mushroom", depth: 3, d: [56, 82, 132], m: [8, 82, 66], rot: 18, land: [-0.46, 0.58, -24], landM: [-0.54, 0.31, -24] },
  { kind: "pepperoni", depth: 3, d: [95, 36, 146], m: [94, 30, 72], rot: 8, land: [0.67, -0.32, 64], landM: [0.54, -0.31, 64] },
  { kind: "tomato", depth: 3, d: [57, 30, 136], m: [7, 36, 64], rot: -28, land: [-0.47, -0.58, 30], landM: [-0.54, -0.31, 30] },
  // Plano medio (2).
  { kind: "basil", depth: 2, d: [82, 23, 112], m: [82, 6, 60], rot: 14, land: [0.15, -0.72, -40], landM: [0, -0.62, -40] },
  { kind: "basil", depth: 2, d: [99, 61, 104], rot: -30, land: [0.38, 0.14, 120] },
  { kind: "pepperoni", depth: 2, d: [51, 56, 100], m: [26, 97, 58], rot: 40, land: [-0.74, 0.01, -70], landM: [0, 0.62, -70] },
  { kind: "mushroom", depth: 2, d: [72, 91, 100], rot: 10, land: [0.18, 0.72, 36] },
  // Plano lejano (1): pequeños y lentos (el parallax de velocidad da la profundidad).
  { kind: "mushroom", depth: 1, d: [67, 18, 74], rot: -10, land: [0.14, -0.38, 150] },
  { kind: "tomato", depth: 1, d: [48, 88, 70], rot: -20, land: [-0.14, 0.38, -110] },
  { kind: "pepperoni", depth: 1, d: [98, 88, 72], m: [68, 99, 50], rot: 24, land: [0, 0, 90] },
  { kind: "basil", depth: 1, d: [49, 36, 70], rot: 64, land: [-0.38, -0.14, 200] },
];

/** Por plano: amplitud de flotación (px), desplazamiento con el puntero (px), inicio y duración del vuelo. */
const DEPTH = {
  1: { float: 6, mouse: 6, at: 0.2, len: 0.56 },
  2: { float: 10, mouse: 14, at: 0.11, len: 0.5 },
  3: { float: 16, mouse: 26, at: 0.03, len: 0.44 },
} as const satisfies Record<Depth, { float: number; mouse: number; at: number; len: number }>;

const ALT: Record<Kind, string> = { pepperoni: "pepperoni", basil: "albahaca", mushroom: "champiñón", tomato: "tomate" };

export function createHero(): Component {
  const el = fromHTML<HTMLElement>(`
<section class="hero" id="top" data-theme="dark" aria-labelledby="hero-title">
  <div class="container hero__grid">
    <div class="hero__copy">
      <span class="badge badge--hero">De temporada</span>
      <p class="t-eyebrow hero__eyebrow">Masa madre · 48 h de fermentación</p>
      <h1 class="t-display hero__title" id="hero-title">Pizza napolitana al horno de <em>leña</em></h1>
      <p class="t-lead hero__lead">Masa de 48 horas, tomate San Marzano y mozzarella fior di latte. La armamos frente a ti y sale del horno en 90 segundos.</p>
      <div class="hero__ctas">
        <a class="btn btn-primary btn--lg" href="#menu">Pide ahora</a>
        <a class="btn btn-secondary btn--lg" href="#categorias">Ver menú</a>
      </div>
    </div>
    <div class="hero__stage">
      <div class="hero__pizza">
        <div class="hero__pizza-body">
          <span class="hero__pizza-shadow" aria-hidden="true"></span>
          <div class="hero__pizza-float"></div>
        </div>
      </div>
      <p class="hero__done">Hecha a mano. Horneada a 450 °C.</p>
    </div>
  </div>
  <div class="hero__field" aria-hidden="true">
    <div class="hero__layer" data-depth="1"></div>
    <div class="hero__layer" data-depth="2"></div>
    <div class="hero__layer" data-depth="3"></div>
  </div>
  <p class="hero__scroll" aria-hidden="true">Desliza</p>
</section>`);

  qs(el, ".hero__scroll").append(icon("chevron-down", 20));
  const pizza = qs(el, ".hero__pizza");
  const pizzaBody = qs(el, ".hero__pizza-body");
  const pizzaFloat = qs(el, ".hero__pizza-float");
  const pizzaImg = photo(PHOTO.pizzaBase, {
    alt: "Pizza napolitana de masa madre con salsa de tomate y mozzarella fundida",
    className: "hero__pizza-img", priority: true, pinAsset: true,
  });
  pizzaFloat.append(pizzaImg);

  const meta = new Map<HTMLElement, Piece>();
  PIECES.forEach((p) => {
    const piece = document.createElement("span");
    piece.className = `hero__ing hero__ing--${p.kind}`;
    const [l, t, w] = p.d;
    piece.style.setProperty("--l", `${l}%`);
    piece.style.setProperty("--t", `${t}%`);
    piece.style.setProperty("--w", String(w));
    piece.style.setProperty("--r", `${p.rot}deg`);
    if (p.m) {
      piece.style.setProperty("--ml", `${p.m[0]}%`);
      piece.style.setProperty("--mt", `${p.m[1]}%`);
      piece.style.setProperty("--mw", `${p.m[2]}px`);
    } else piece.dataset.desktopOnly = "";
    piece.dataset.depth = String(p.depth);
    const span = (cls: string): HTMLSpanElement => Object.assign(document.createElement("span"), { className: cls });
    const spin = span("hero__ing-spin");
    const idle = span("hero__ing-idle");
    const center = span("hero__ing-center");
    center.append(span("hero__ing-shadow"), photo(PHOTO[p.kind], { className: "hero__ing-img", alt: ALT[p.kind] }));
    idle.append(center);
    spin.append(idle);
    piece.append(spin);
    qs(el, `.hero__layer[data-depth="${p.depth}"]`).append(piece);
    meta.set(piece, p);
  });

  const field = qs(el, ".hero__field");
  const stage = qs(el, ".hero__stage");
  /** Móvil: el campo de ingredientes empieza en la zona de la pizza (bajo los CTA), nunca sobre el texto. */
  const fitField = (on: boolean): void => {
    if (!on) { field.style.removeProperty("--hero-field-top"); return; }
    const top = stage.getBoundingClientRect().top - el.getBoundingClientRect().top - 16;
    field.style.setProperty("--hero-field-top", `${Math.max(0, Math.round(top))}px`);
  };

  /** Caja "contain" real de la imagen en coordenadas del campo de ingredientes (ninguno de los dos se transforma). */
  const geometry = (): { left: number; top: number; s: number } => {
    const hr = field.getBoundingClientRect();
    const pr = pizza.getBoundingClientRect();
    const bw = pizza.clientWidth;
    const bh = pizza.clientHeight;
    const s = Math.min(bw / BASE.w, bh / BASE.h);
    return { left: pr.left - hr.left + (bw - BASE.w * s) / 2, top: pr.top - hr.top + (bh - BASE.h * s) / 2, s };
  };

  /** Transform de aterrizaje de una pieza (offsetLeft/Top del ancla = centro visual). El giro de reposo (--r) vive en .hero__ing-center. */
  const landing = (p: HTMLElement, mobile: boolean): { x: number; y: number; sx: number; sy: number; rotation: number } => {
    const cfg = meta.get(p)!;
    const [u, v, rot] = (mobile && cfg.landM) || cfg.land;
    const g = geometry();
    const x = g.left + (BASE.cx + u * BASE.rx) * g.s;
    const y = g.top + (BASE.cy + v * BASE.ry) * g.s;
    const near = 1 + 0.12 * v; // lo más cercano al espectador (v > 0) se ve un poco mayor
    const width = TOPPING_SIZE[cfg.kind] * BASE.surface * g.s * near * (mobile ? 1.2 : 1); // móvil: menos piezas, algo mayores
    const sx = width / Math.max(1, qs(p, ".hero__ing-center").offsetWidth);
    return { x: x - p.offsetLeft, y: y - p.offsetTop, sx, sy: sx * SQUASH, rotation: rot - cfg.rot };
  };

  const mm = gsap.matchMedia();

  const animate = (): void => {
    mm.add(MM_CONDITIONS, (ctx) => {
      const { desktop, mobile, reduce } = flags(ctx.conditions);
      fitField(mobile);
      const onRefreshInit = (): void => fitField(mobile);
      ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
      const pieces = qsa(el, ".hero__ing").filter((p) => getComputedStyle(p).display !== "none");
      const spinOf = (p: HTMLElement): HTMLElement => qs(p, ".hero__ing-spin");
      const shadowOf = (p: HTMLElement): HTMLElement => qs(p, ".hero__ing-shadow");
      const LANDED_SHADOW = { opacity: 0.5, scale: 0.8, yPercent: -110 } as const;
      gsap.set(pieces, { transformOrigin: "0px 0px" });

      if (reduce) {
        // Pizza ya armada, sin pin ni flotación; se recoloca si cambia el tamaño.
        const place = (): void => {
          fitField(mobile);
          pieces.forEach((p) => {
            const t = landing(p, mobile);
            gsap.set(p, { x: t.x, y: t.y, scaleX: t.sx, scaleY: t.sy });
            gsap.set(spinOf(p), { rotation: t.rotation });
            gsap.set(shadowOf(p), LANDED_SHADOW);
          });
        };
        place();
        const ro = new ResizeObserver(() => place());
        ro.observe(el);
        return () => { ro.disconnect(); ScrollTrigger.removeEventListener("refreshInit", onRefreshInit); fitField(false); };
      }

      const idles = pieces.map((p) => qs(p, ".hero__ing-idle"));
      const layers = qsa(el, ".hero__layer");
      const pizzaShadow = qs(el, ".hero__pizza-shadow");
      const done = qs(el, ".hero__done");

      /* J3 · Flotación en reposo, en su propio envoltorio (.hero__ing-idle): nunca
         compite con las transformaciones del scroll. */
      const lighten = desktop ? 1 : 0.6;
      const floats: gsap.core.Tween[] = [];
      pieces.forEach((p, i) => {
        const idle = idles[i]!;
        const depth = meta.get(p)!.depth;
        const amp = DEPTH[depth].float * lighten;
        const dur = gsap.utils.random(2.6, 4.2);
        const delay = gsap.utils.random(0, 2);
        floats.push(gsap.to(idle, { y: -amp, duration: dur, ease: "sine.inOut", yoyo: true, repeat: -1, delay }));
        floats.push(meta.get(p)!.kind === "basil"
          ? gsap.to(idle, { rotation: 18 * lighten, duration: gsap.utils.random(6, 8), ease: "sine.inOut", yoyo: true, repeat: -1 })
          : gsap.to(idle, { rotation: 4 * lighten, duration: dur * 1.3, ease: "sine.inOut", yoyo: true, repeat: -1, delay }));
      });
      floats.push(gsap.to(pizzaFloat, { y: desktop ? -8 : -5, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 }));

      /* Parallax con el puntero (escritorio con ratón), solo en reposo. Al empezar el
         aterrizaje las capas vuelven a 0 y los quickTo se recrean al volver al reposo. */
      const canHover = desktop && window.matchMedia(mq.hover).matches;
      type Mover = { k: number; x: gsap.QuickToFunc; y: gsap.QuickToFunc };
      let movers: Mover[] = [];
      const buildMovers = (): void => {
        movers = canHover
          ? layers.map((layer) => ({
              k: DEPTH[(Number(layer.dataset.depth) || 2) as Depth].mouse,
              x: gsap.quickTo(layer, "x", { duration: 1.2, ease: "power3.out" }),
              y: gsap.quickTo(layer, "y", { duration: 1.2, ease: "power3.out" }),
            }))
          : [];
      };
      buildMovers();
      const onPointer = (e: PointerEvent): void => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        movers.forEach((m) => { m.x(-nx * m.k); m.y(-ny * m.k); });
      };
      if (canHover) el.addEventListener("pointermove", onPointer);

      let resting = true;
      let settle: gsap.core.Tween | null = null;
      let settleLayers: gsap.core.Tween | null = null;
      const setResting = (on: boolean): void => {
        if (on === resting) return;
        resting = on;
        if (on) {
          settle?.kill();
          settleLayers?.kill();
          floats.forEach((t) => t.restart());
          buildMovers();
        } else {
          // Fin de la flotación: los envoltorios de reposo vuelven a neutro (sin vibración residual).
          floats.forEach((t) => t.pause());
          movers = [];
          settle = gsap.to([...idles, pizzaFloat], { y: 0, rotation: 0, duration: 0.3, ease: "power2.out" });
          settleLayers = gsap.to(layers, { x: 0, y: 0, duration: 0.3, ease: "power2.out", overwrite: true });
        }
      };

      /* J2 · Convergencia con pin + scrub. */
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          // Si el hero es más alto que la pantalla (móvil bajo/apaisado) se fija por abajo: la pizza queda entera a la vista.
          trigger: el, start: () => (el.offsetHeight > window.innerHeight + 1 ? "bottom bottom" : "top top"), end: desktop ? "+=150%" : "+=70%",
          pin: true, anticipatePin: 1, scrub: desktop ? 0.8 : 0.5, invalidateOnRefresh: true,
          onUpdate: (self) => setResting(self.progress <= 0.02),
          onToggle: (self) => [...pieces, pizzaBody].forEach((p) => (p.style.willChange = self.isActive ? "transform" : "")),
        },
      });

      // La pizza termina de crecer (escala 1) antes de que aterrice el primer ingrediente.
      tl.to(qs(el, ".hero__scroll"), { autoAlpha: 0, duration: 0.1 }, 0)
        .fromTo(pizzaBody, { scale: 0.9 }, { scale: 1, duration: 0.4, ease: "power2.out" }, 0)
        .fromTo(pizzaShadow, { scale: 0.85, opacity: 0.75 }, { scale: 1, opacity: 1, duration: 0.4 }, 0);

      // Cercanas primero, lejanas al final y más lentas: parallax de velocidad en el propio vuelo.
      // Sin tweens de opacidad: cada ingrediente aterriza y se queda (opacidad 1).
      const cache = new Map<HTMLElement, ReturnType<typeof landing>>();
      const target = (p: HTMLElement): ReturnType<typeof landing> => {
        let t = cache.get(p);
        if (!t) { t = landing(p, mobile); cache.set(p, t); }
        return t;
      };
      const fresh = (p: HTMLElement): ReturnType<typeof landing> => { cache.delete(p); return target(p); };
      pieces.forEach((p, i) => {
        const { depth } = meta.get(p)!;
        const at = DEPTH[depth].at + (i % 4) * 0.02;
        const len = DEPTH[depth].len;
        tl.to(p, {
          x: () => fresh(p).x, y: () => target(p).y,
          scaleX: () => target(p).sx, scaleY: () => target(p).sy,
          duration: len,
        }, at)
          .to(spinOf(p), { rotation: () => target(p).rotation, duration: len, ease: "power1.inOut" }, at)
          .to(shadowOf(p), { ...LANDED_SHADOW, duration: len * 0.6, ease: "power1.in" }, at + len * 0.4);
      });

      tl.from(done, { autoAlpha: 0, y: 20, duration: 0.18, ease: "power2.out" }, 0.8)
        .to({}, { duration: 0.1 });

      return () => {
        floats.forEach((t) => t.kill());
        settle?.kill();
        settleLayers?.kill();
        if (canHover) el.removeEventListener("pointermove", onPointer);
        ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
        fitField(false);
      };
    });
  };

  return { el, animate, destroy: () => { mm.revert(); el.remove(); } };
}

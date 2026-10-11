/**
 * Disposición determinista de ingredientes sobre una pizza.
 * La comparten la app (hero, constructor, menú) y scripts/generate-art.ts,
 * para que las pizzas SVG pre-renderizadas encajen exactamente con las
 * compuestas en el DOM. Sin imports: Node lo ejecuta con type stripping.
 *
 * Coordenadas normalizadas: (0,0) es el centro de la pizza, 1 es el radio
 * exterior de la masa. `size` es el diámetro de la pieza relativo al diámetro
 * total de la pizza.
 */

export interface ToppingPlacement {
  slug: string;
  x: number;
  y: number;
  rotation: number;
  size: number;
}

/** Diámetro relativo de cada pieza sobre la pizza (fracción del diámetro total). */
export const PIECE_SIZE: Readonly<Record<string, number>> = {
  tomate: 0.2,
  pepperoni: 0.17,
  albahaca: 0.17,
  champinones: 0.16,
  aceitunas: 0.1,
  cebolla: 0.17,
  pimiento: 0.15,
  jamon: 0.17,
  pina: 0.11,
  rucula: 0.2,
  oregano: 0.12,
  parmesano: 0.12,
  salchicha: 0.12,
  mozzarella: 0.2,
  burrata: 0.26,
  jalapeno: 0.11,
  ajo: 0.08,
  gorgonzola: 0.13,
  nduja: 0.11,
  prosciutto: 0.17,
  parmigiano: 0.12,
  "ajo-confitado": 0.08,
  "cebolla-caramelizada": 0.16,
  "pimientos-asados": 0.16,
  "aceitunas-botija": 0.09,
};

const DEFAULT_SIZE = 0.15;
export const pieceSize = (slug: string): number => PIECE_SIZE[slug] ?? DEFAULT_SIZE;

/** Cuántas piezas de cada ingrediente lleva una pizza "llena". */
const PIECE_COUNT: Readonly<Record<string, number>> = {
  tomate: 5,
  pepperoni: 8,
  albahaca: 4,
  champinones: 5,
  aceitunas: 7,
  cebolla: 4,
  pimiento: 5,
  jamon: 5,
  pina: 7,
  rucula: 5,
  oregano: 5,
  parmesano: 6,
  salchicha: 7,
  mozzarella: 5,
  burrata: 1,
  jalapeno: 7,
  ajo: 8,
  gorgonzola: 6,
  nduja: 7,
  prosciutto: 5,
  parmigiano: 6,
  "ajo-confitado": 8,
  "cebolla-caramelizada": 5,
  "pimientos-asados": 5,
  "aceitunas-botija": 7,
};
export const pieceCount = (slug: string): number => PIECE_COUNT[slug] ?? 5;

/** Mulberry32: PRNG pequeño y determinista. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Radio útil (dentro del borde de la masa) en unidades normalizadas. */
export const TOPPING_RADIUS = 0.66;

/**
 * Reparte las piezas de cada ingrediente evitando solapes fuertes
 * (muestreo por rechazo con distancia mínima proporcional al tamaño).
 * Las hierbas van al final para quedar encima.
 */
export function layoutToppings(slugs: readonly string[], seed: number, density = 1): ToppingPlacement[] {
  const rand = rng(seed);
  const herbsLast = [...slugs].sort((a, b) => Number(isHerb(a)) - Number(isHerb(b)));
  const placed: ToppingPlacement[] = [];
  const share = slugs.length > 3 ? 3 / slugs.length : 1;

  for (const slug of herbsLast) {
    const n = Math.max(1, Math.round(pieceCount(slug) * share * density));
    const size = pieceSize(slug);
    for (let i = 0; i < n; i++) {
      let best: ToppingPlacement | null = null;
      let bestGap = -Infinity;
      // Reparte por sectores angulares y elige el candidato más separado.
      for (let attempt = 0; attempt < 24; attempt++) {
        const angle = ((i + rand() * 0.9) / n) * Math.PI * 2 + rand() * 0.6;
        const r = Math.sqrt(0.08 + rand() * 0.92) * (TOPPING_RADIUS - size * 0.6);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const gap = placed.reduce((min, p) => {
          const d = Math.hypot(p.x - x, p.y - y) - (p.size + size) * 0.85;
          return Math.min(min, d);
        }, Infinity);
        if (gap > bestGap) {
          bestGap = gap;
          best = { slug, x, y, rotation: Math.round(rand() * 360), size };
        }
        if (gap > 0.04) break;
      }
      if (best) placed.push(best);
    }
  }
  return placed;
}

function isHerb(slug: string): boolean {
  return slug === "albahaca" || slug === "rucula" || slug === "oregano";
}

/** Ingredientes visibles sobre la pizza (masa, salsa y queso base se dibujan como capas). */

/** Composición fija de la pizza del hero (la que se arma con el scroll). */
export const HERO_TOPPINGS = ["tomate", "pepperoni", "champinones", "aceitunas", "albahaca"] as const;
export const HERO_SEED = 7;

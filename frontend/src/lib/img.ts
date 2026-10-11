/**
 * Carga de imágenes con cadena de respaldo:
 *   1. la ruta pedida (el pack local de Jorges)
 *   2. el mismo nombre en .svg (ilustración vectorial incluida en el repo)
 *   3. respaldos extra (p. ej. un SVG genérico)
 * Las ilustraciones del constructor tienen rutas propias (visualAssets.ts).
 *
 * La carta, las novedades y el carrito usan catalogImage(): cadena SOLO de
 * fotos (sin el paso 2). Antes compartían esta cadena y, si la foto fallaba
 * una vez (o la ruta de la API no existía en disco, como /assets/pizzas/*.webp),
 * se mostraba en silencio la ilustración SVG del mismo nombre.
 */

import { CATALOG_FALLBACK_PHOTO, catalogPhoto } from "./visualAssets";

const failed = new Set<string>();

export function svgSibling(src: string): string | null {
  return /\.(webp|avif|png|jpe?g)$/i.test(src) ? src.replace(/\.(webp|avif|png|jpe?g)$/i, ".svg") : null;
}

export function candidatesFor(src: string, extra: readonly string[] = [], photoOnly = false): string[] {
  const list = (photoOnly ? [catalogPhoto(src), ...extra] : [src, svgSibling(src), ...extra]).filter((s): s is string => !!s);
  return [...new Set(list)].filter((s) => !failed.has(s));
}

export interface SmartImageOptions {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbacks?: readonly string[];
  lazy?: boolean;
  priority?: boolean;
  /** Marca la imagen para que motion la decodifique antes de crear pins. */
  pinAsset?: boolean;
  /** Cadena solo de fotos (sin respaldo SVG). */
  photoOnly?: boolean;
}

/** <img> que recorre la cadena de respaldo en `error`. */
export function smartImage(opts: SmartImageOptions): HTMLImageElement {
  const img = document.createElement("img");
  img.alt = opts.alt;
  img.decoding = "async";
  if (opts.width) img.width = opts.width;
  if (opts.height) img.height = opts.height;
  if (opts.className) img.className = opts.className;
  if (opts.lazy) img.loading = "lazy";
  if (opts.priority) img.setAttribute("fetchpriority", "high");
  if (opts.pinAsset) img.dataset.pinAsset = "";
  setSmartSrc(img, opts.src, opts.fallbacks, opts.photoOnly);
  return img;
}

export function setSmartSrc(img: HTMLImageElement, src: string, fallbacks: readonly string[] = [], photoOnly = false): void {
  const queue = candidatesFor(src, fallbacks, photoOnly);
  const next = (): void => {
    const candidate = queue.shift();
    if (!candidate) {
      img.removeEventListener("error", onError);
      img.dataset.broken = "";
      return;
    }
    img.src = candidate;
  };
  const onError = (): void => {
    if (img.getAttribute("src")) failed.add(img.getAttribute("src")!);
    img.removeAttribute("srcset"); // el respaldo no tiene variantes
    next();
  };
  img.addEventListener("error", onError);
  img.addEventListener("load", () => img.removeEventListener("error", onError), { once: true });
  next();
}

export const ingredientImage = (slug: string): string => `/assets/ingredients/${slug}.webp`;
export const GENERIC_INGREDIENT = "/assets/ingredients/masa.svg";

/**
 * Pack fotorrealista (public/assets/jorges, ver assets-map.md): WebP con alfa
 * real, siempre con object-fit: contain y sin fondo ni máscara rectangular.
 * Las medidas intrínsecas van en width/height para reservar el hueco (sin CLS).
 */
export interface PackAsset { readonly src: string; readonly w: number; readonly h: number }
const pack = (file: string, w: number, h: number): PackAsset => ({ src: `/assets/jorges/${file}`, w, h });

export const PHOTO = {
  /** Base del hero: masa + salsa + mozzarella, vista frontal ligeramente inclinada. */
  pizzaBase: pack("pizza-base.webp", 1377, 1142),
  pepperoniPizza: pack("pizza-pepperoni-hero.webp", 1280, 1062),
  margherita: pack("pizza-margherita.webp", 960, 905),
  slice: pack("slice-pepperoni.webp", 980, 653),
  pepperoni: pack("ingredient-pepperoni.webp", 600, 511),
  basil: pack("ingredient-basil.webp", 600, 428),
  mozzarella: pack("ingredient-mozzarella.webp", 600, 389),
  tomato: pack("ingredient-tomato.webp", 600, 590),
  mushroom: pack("ingredient-mushroom.webp", 600, 522),
  "parmigiano": pack("ingredient-parmigiano.webp", 1254, 1254),
  "gorgonzola": pack("ingredient-gorgonzola.webp", 1254, 1254),
  "prosciutto": pack("ingredient-prosciutto.webp", 1254, 1254),
  "nduja": pack("ingredient-nduja.webp", 1254, 1254),
  "aceitunas-botija": pack("ingredient-aceitunas-botija.webp", 1254, 1254),
  "cebolla-caramelizada": pack("ingredient-cebolla-caramelizada.webp", 1254, 1254),
  "pimientos-asados": pack("ingredient-pimientos-asados.webp", 1254, 1254),
  "ajo-confitado": pack("ingredient-ajo-confitado.webp", 1254, 1254),
  "rucula": pack("ingredient-rucula.webp", 1254, 1254),
  "oregano": pack("ingredient-oregano.webp", 1254, 1254),
  "crema-de-rocoto": pack("ingredient-crema-de-rocoto.webp", 1254, 1254),
  "pesto-genoves": pack("ingredient-pesto-genoves.webp", 1254, 1254),
  "masa-tradicional": pack("ingredient-masa-tradicional.webp", 1254, 1254),
  "masa-delgada": pack("ingredient-masa-delgada.webp", 1254, 1254),
  "masa-integral": pack("ingredient-masa-integral.webp", 1254, 1254),
} as const satisfies Record<string, PackAsset>;
export type PhotoIngredient = Exclude<keyof typeof PHOTO, "pizzaBase" | "pepperoniPizza" | "margherita" | "slice">;

/** Fotos del catálogo de ingredientes para el marquee y el parallax. */
export const PHOTO_BY_SLUG: Readonly<Record<string, PhotoIngredient>> = {
  "parmigiano": "parmigiano",
  "gorgonzola": "gorgonzola",
  "prosciutto": "prosciutto",
  "nduja": "nduja",
  "aceitunas-botija": "aceitunas-botija",
  "cebolla-caramelizada": "cebolla-caramelizada",
  "pimientos-asados": "pimientos-asados",
  "ajo-confitado": "ajo-confitado",
  "rucula": "rucula",
  "oregano": "oregano",
  "crema-de-rocoto": "crema-de-rocoto",
  "pesto-genoves": "pesto-genoves",
  "masa-tradicional": "masa-tradicional",
  "masa-delgada": "masa-delgada",
  "masa-integral": "masa-integral",
  pepperoni: "pepperoni", albahaca: "basil", mozzarella: "mozzarella", "mozzarella-fior-di-latte": "mozzarella",
  "queso-mozzarella": "mozzarella", tomate: "tomato", "salsa-pomodoro": "tomato", "salsa-de-tomate": "tomato",
  "tomate-cherry": "tomato", champinones: "mushroom", champinon: "mushroom", hongos: "mushroom",
};

/** <img> de una foto del pack con medidas intrínsecas; perezosa salvo que se pida prioridad. */
export function photo(asset: PackAsset, opts: { alt?: string; className?: string; priority?: boolean; pinAsset?: boolean } = {}): HTMLImageElement {
  const img = document.createElement("img");
  img.src = asset.src;
  img.alt = opts.alt ?? "";
  img.width = asset.w;
  img.height = asset.h;
  img.decoding = "async";
  if (opts.className) img.className = opts.className;
  if (opts.priority) img.setAttribute("fetchpriority", "high");
  else img.loading = "lazy";
  if (opts.pinAsset) img.dataset.pinAsset = "";
  return img;
}

/** Variante de 640 px junto a las fotos de pizza del pack (pizza-<slug>-640.webp). */
const variant640 = (src: string): string | null =>
  /^\/assets\/jorges\/pizza-[^/]+\.webp$/.test(src) && !src.endsWith("-640.webp") ? src.replace(/\.webp$/, "-640.webp") : null;

/** Anchos originales que no son 1254 px (el resto de fotos del pack lo son). */
const ORIGINAL_W: Readonly<Record<string, number>> = {
  "/assets/jorges/pizza-margherita.webp": 960, "/assets/jorges/pizza-pepperoni-hero.webp": 1280, "/assets/jorges/pizza-base.webp": 1377,
};

export interface CatalogImageOptions {
  /** Ruta de la API o del carrito; se resuelve siempre a una foto del pack. */
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Ancho de render (atributo sizes); por defecto el ancho intrínseco declarado. */
  sizes?: string;
  className?: string;
}

/**
 * Imagen de la carta, novedades y carrito: estrictamente fotográfica (nunca
 * ilustración/SVG), con medidas, lazy + async y srcset 640w/original para no
 * descargar 1254 px en una tarjeta de 280 px.
 */
export function catalogImage(o: CatalogImageOptions): HTMLImageElement {
  const photoSrc = catalogPhoto(o.src);
  const img = smartImage({ src: photoSrc, alt: o.alt, width: o.width, height: o.height, ...(o.className ? { className: o.className } : {}), lazy: true, photoOnly: true, fallbacks: [CATALOG_FALLBACK_PHOTO] });
  const small = variant640(photoSrc);
  if (small && img.getAttribute("src") === photoSrc) {
    img.sizes = o.sizes ?? `${o.width}px`;
    img.srcset = `${small} 640w, ${photoSrc} ${ORIGINAL_W[photoSrc] ?? 1254}w`;
  }
  return img;
}

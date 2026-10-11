/** El catálogo conserva sus URL de API; el cliente resuelve el pack local. */
export const MENU_SLUGS = [
  "margherita", "pepperoni", "diavola", "jorges-especial", "prosciutto-rucula",
  "rocoto-andina", "cuatro-quesos", "dulce-gorgonzola", "pesto-verde", "marinara",
  "huerta", "focaccia-ajo", "burrata", "tiramisu", "limonada-hierbabuena",
] as const;

export const BUILDER_SLUGS = [
  "masa-tradicional", "masa-delgada", "masa-integral", "salsa-pomodoro",
  "crema-de-rocoto", "pesto-genoves", "mozzarella", "parmigiano", "gorgonzola",
  "prosciutto", "pepperoni", "nduja", "champinones", "aceitunas-botija",
  "cebolla-caramelizada", "pimientos-asados", "ajo-confitado", "albahaca", "rucula", "oregano",
] as const;

const menuSlugs = new Set<string>(MENU_SLUGS);
const builderSlugs = new Set<string>(BUILDER_SLUGS);
const asset = (file: string): string => `/assets/jorges/${file}.webp`;

/** Foto de respaldo de la carta: nunca una ilustración (las ilustraciones son solo del constructor). */
export const CATALOG_FALLBACK_PHOTO = asset("pizza-margherita");
/** Miniatura fotográfica de una pizza armada en el constructor (carrito). */
export const CUSTOM_PIZZA_PHOTO = asset("pizza-base");
/** Miniatura del constructor que guardaban los carritos antiguos (el archivo ya no existe: solo se reconoce la ruta). */
const LEGACY_BUILDER_PIZZA = asset("builder-pizza");

/** Foto de la carta para un slug; un slug desconocido recibe la foto genérica, nunca un SVG. */
export const menuImage = (slug: string): string => menuSlugs.has(slug)
  ? asset(slug === "pepperoni" ? "pizza-pepperoni-hero" : `pizza-${slug}`)
  : CATALOG_FALLBACK_PHOTO;

/**
 * Resuelve cualquier ruta de imagen de la carta/novedades/carrito a una FOTO del pack:
 * rutas de la API (/assets/pizzas/<slug>.webp|.svg), rutas ya resueltas (/assets/jorges/pizza-*.webp)
 * y carritos guardados con la ilustración del constructor (se sustituye por la foto de la base).
 */
export function catalogPhoto(src: string): string {
  if (/^\/assets\/jorges\/pizza-[^/]+\.webp$/.test(src)) return src;
  if (src === LEGACY_BUILDER_PIZZA || /^\/assets\/pizzas\/pizza\.(webp|svg)$/.test(src)) return CUSTOM_PIZZA_PHOTO;
  const slug = /^\/assets\/pizzas\/([^/]+)\.(webp|svg|png|jpe?g|avif)$/.exec(src)?.[1];
  return slug ? menuImage(slug) : CATALOG_FALLBACK_PHOTO;
}

/** Siempre ilustraciones, incluso si la API entrega una foto del ingrediente. */
export const builderIngredientImage = (slug: string): string => builderSlugs.has(slug)
  ? asset(`builder-ingredient-${slug}`)
  : `/assets/ingredients/${slug}.svg`;

export const BUILDER_ART = {
  base: asset("builder-base"), cheese: asset("builder-cheese"),
  pomodoro: asset("builder-sauce-pomodoro"), rocoto: asset("builder-sauce-rocoto"), pesto: asset("builder-sauce-pesto"),
} as const;

export function builderSauceImage(slug: string): string {
  if (slug === "crema-de-rocoto") return BUILDER_ART.rocoto;
  if (slug === "pesto-genoves") return BUILDER_ART.pesto;
  return BUILDER_ART.pomodoro;
}

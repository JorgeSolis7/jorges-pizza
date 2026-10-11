/**
 * Estado de la app: catálogo (menú + ingredientes, cargados de la API) y carrito.
 * Observable mínimo y tipado; el carrito se persiste en localStorage.
 */
import { api, ApiError } from "../api/client";
import { NON_PIZZA_CATEGORY_SLUGS, ORDER_LIMITS, sameId, type Id, type Ingredient, type Menu, type Pizza, type PizzaSize } from "../api/types";

export type Remote<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; error: ApiError };

type Listener<T> = (value: T) => void;

export class Signal<T> {
  private listeners = new Set<Listener<T>>();
  private value: T;
  constructor(initial: T) {
    this.value = initial;
  }
  get(): T {
    return this.value;
  }
  set(next: T): void {
    this.value = next;
    this.listeners.forEach((l) => l(next));
  }
  /** Suscribe y llama de inmediato con el valor actual. Devuelve la función para desuscribirse. */
  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    listener(this.value);
    return () => this.listeners.delete(listener);
  }
}

const toApiError = (err: unknown): ApiError =>
  err instanceof ApiError ? err : new ApiError("network", "Ocurrió un error inesperado.");

/* ------------------------------ Catálogo ------------------------------ */

export const menu = new Signal<Remote<Menu>>({ status: "idle" });
export const ingredients = new Signal<Remote<Ingredient[]>>({ status: "idle" });

export async function loadMenu(): Promise<void> {
  menu.set({ status: "loading" });
  try {
    menu.set({ status: "ready", data: await api.getMenu() });
  } catch (err) {
    menu.set({ status: "error", error: toApiError(err) });
  }
}

export async function loadIngredients(): Promise<void> {
  ingredients.set({ status: "loading" });
  try {
    ingredients.set({ status: "ready", data: await api.getIngredients() });
  } catch (err) {
    ingredients.set({ status: "error", error: toApiError(err) });
  }
}

export const DEFAULT_CURRENCY = "PEN";
export const currency = (): string => {
  const m = menu.get();
  return m.status === "ready" ? m.data.currency : DEFAULT_CURRENCY;
};

export function isPizzaItem(p: Pizza, m: Menu): boolean {
  const cat = m.categories.find((c) => sameId(c.id, p.categoryId));
  return !cat || !NON_PIZZA_CATEGORY_SLUGS.has(cat.slug);
}

export function ingredientById(id: Id): Ingredient | undefined {
  const s = ingredients.get();
  return s.status === "ready" ? s.data.find((i) => sameId(i.id, id)) : undefined;
}

/** Precio de una pizza personalizada: basePrices[size] + Σ extraPrice (contrato del backend). */
export function customPrice(size: PizzaSize, ids: readonly Id[]): number | null {
  const m = menu.get();
  if (m.status !== "ready" || !m.data.customPizza) return null;
  const extras = ids.reduce<number>((sum, id) => sum + (ingredientById(id)?.extraPrice ?? 0), 0);
  return m.data.customPizza.basePrices[size] + extras;
}

/* ------------------------------- Carrito ------------------------------- */

export interface CartItem {
  key: string;
  pizzaId: Id | null;
  customIngredientIds: Id[] | null;
  size: PizzaSize;
  quantity: number;
  name: string;
  image: string;
  /** Precio unitario estimado en el cliente; el total oficial lo devuelve la API. */
  unitPrices: Record<PizzaSize, number>;
  detail: string;
  /** Para picar / postres: los tamaños se muestran como porciones. */
  portion: boolean;
}

const CART_KEY = "jorges.cart.v1";

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed.filter(isCartItem) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function isCartItem(v: unknown): boolean {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.key === "string" && typeof o.name === "string" && typeof o.quantity === "number" && typeof o.size === "string" && typeof o.unitPrices === "object";
}

export const cart = new Signal<CartItem[]>(readCart());
cart.subscribe((items) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    /* almacenamiento no disponible: el carrito vive solo en memoria */
  }
});

export const cartCount = (): number => cart.get().reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (): number => cart.get().reduce((s, i) => s + i.unitPrices[i.size] * i.quantity, 0);

const clampQty = (q: number): number => Math.min(ORDER_LIMITS.maxQuantity, Math.max(ORDER_LIMITS.minQuantity, Math.round(q)));

export function addToCart(item: Omit<CartItem, "key" | "quantity">, quantity = 1): void {
  const idsKey = item.customIngredientIds ? [...item.customIngredientIds].map(String).sort().join(",") : "";
  const key = `${item.pizzaId ?? "custom"}|${idsKey}|${item.size}`;
  const items = cart.get();
  const existing = items.find((i) => i.key === key);
  if (existing) {
    cart.set(items.map((i) => (i.key === key ? { ...i, quantity: clampQty(i.quantity + quantity) } : i)));
  } else {
    cart.set([...items, { ...item, key, quantity: clampQty(quantity) }]);
  }
}

export function updateQuantity(key: string, quantity: number): void {
  if (quantity < ORDER_LIMITS.minQuantity) return removeFromCart(key);
  cart.set(cart.get().map((i) => (i.key === key ? { ...i, quantity: clampQty(quantity) } : i)));
}

export function updateSize(key: string, size: PizzaSize): void {
  const items = cart.get();
  const item = items.find((i) => i.key === key);
  if (!item) return;
  const newKey = item.key.replace(/\|[^|]+$/, `|${size}`);
  const clash = items.find((i) => i.key === newKey && i.key !== key);
  if (clash) {
    cart.set(items.filter((i) => i.key !== key).map((i) => (i.key === newKey ? { ...i, quantity: clampQty(i.quantity + item.quantity) } : i)));
  } else {
    cart.set(items.map((i) => (i.key === key ? { ...i, size, key: newKey } : i)));
  }
}

export function removeFromCart(key: string): void {
  cart.set(cart.get().filter((i) => i.key !== key));
}

export function clearCart(): void {
  cart.set([]);
}

/* --------------------------- Eventos de la UI --------------------------- */

/** Bus de eventos de UI entre componentes desacoplados. */
export type UIEvent =
  | { type: "open-cart" }
  | { type: "added"; name: string }
  | { type: "customize"; pizzaId: Id }
  | { type: "select-category"; slug: string };

const uiListeners = new Set<(e: UIEvent) => void>();
export const ui = {
  emit(e: UIEvent): void {
    uiListeners.forEach((l) => l(e));
  },
  on(l: (e: UIEvent) => void): () => void {
    uiListeners.add(l);
    return () => uiListeners.delete(l);
  },
};

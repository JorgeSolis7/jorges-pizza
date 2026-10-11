/**
 * Contrato de la API de Jorges (JSON camelCase).
 * El backend .NET implementa exactamente estas formas; el frontend las valida
 * en tiempo de ejecución en `guards.ts` antes de que entren a la app.
 */

/** Los IDs pueden llegar como número o como cadena; se comparan siempre con `sameId`. */
export type Id = number | string;

export const PIZZA_SIZES = ["personal", "mediana", "familiar"] as const;
export type PizzaSize = (typeof PIZZA_SIZES)[number];

export const INGREDIENT_KINDS = ["masa", "salsa", "queso", "carne", "vegetal", "hierba"] as const;
export type IngredientKind = (typeof INGREDIENT_KINDS)[number];

export interface Category {
  id: Id;
  slug: string;
  name: string;
}

export type PriceBySize = Record<PizzaSize, number>;

export interface Pizza {
  id: Id;
  slug: string;
  name: string;
  description: string;
  categoryId: Id;
  prices: PriceBySize;
  image: string;
  ingredientIds: Id[];
  tags: string[];
}

export interface CustomPizzaPricing {
  /** Precio base por tamaño; el total = basePrices[size] + Σ extraPrice. */
  basePrices: PriceBySize;
}

export interface Menu {
  currency: string;
  categories: Category[];
  pizzas: Pizza[];
  /** Puede faltar si el backend es anterior a esta extensión del contrato. */
  customPizza: CustomPizzaPricing | null;
}

/** Categorías cuyos ítems no son pizzas (no abren el constructor). */
export const NON_PIZZA_CATEGORY_SLUGS: ReadonlySet<string> = new Set(["para-picar", "postres-y-bebidas"]);

/** Límites que el backend aplica (OrderRequestParser.cs); se replican en el cliente. */
export const ORDER_LIMITS = {
  maxNameLength: 100,
  maxPhoneLength: 20,
  minPhoneDigits: 6,
  maxAddressLength: 200,
  maxCustomIngredients: 12,
  minQuantity: 1,
  maxQuantity: 20,
} as const;

export interface Ingredient {
  id: Id;
  slug: string;
  name: string;
  kind: IngredientKind;
  extraPrice: number;
  image: string;
}

export interface OrderItemRequest {
  pizzaId: Id | null;
  customIngredientIds: Id[] | null;
  size: PizzaSize;
  quantity: number;
}

export interface CustomerRequest {
  name: string;
  phone: string;
  address: string;
}

export interface OrderRequest {
  items: OrderItemRequest[];
  customer: CustomerRequest;
}

export interface OrderCreated {
  id: Id;
  status: string;
  total: number;
  currency: string;
  estimatedMinutes: number;
}

/** RFC 7807 ValidationProblemDetails, tal como lo emite ASP.NET Core. */
export interface ValidationProblem {
  title?: string;
  status?: number;
  errors: Record<string, string[]>;
}

export const sameId = (a: Id, b: Id): boolean => String(a) === String(b);

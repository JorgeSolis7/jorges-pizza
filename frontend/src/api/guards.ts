/**
 * Validación en tiempo de ejecución de las respuestas de la API.
 * Pequeños decodificadores componibles: nada sin validar cruza este límite.
 */
import {
  INGREDIENT_KINDS,
  PIZZA_SIZES,
  type Category,
  type Id,
  type Ingredient,
  type IngredientKind,
  type Menu,
  type OrderCreated,
  type Pizza,
  type PriceBySize,
  type ValidationProblem,
} from "./types";

export class DecodeError extends Error {
  readonly path: string;
  readonly expected: string;
  constructor(path: string, expected: string) {
    super(`Respuesta inválida de la API en "${path}": se esperaba ${expected}.`);
    this.name = "DecodeError";
    this.path = path;
    this.expected = expected;
  }
}

type Decoder<T> = (value: unknown, path: string) => T;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const record: Decoder<Record<string, unknown>> = (v, path) => {
  if (!isRecord(v)) throw new DecodeError(path, "un objeto");
  return v;
};

const string: Decoder<string> = (v, path) => {
  if (typeof v !== "string") throw new DecodeError(path, "una cadena");
  return v;
};

const number: Decoder<number> = (v, path) => {
  if (typeof v !== "number" || !Number.isFinite(v)) throw new DecodeError(path, "un número");
  return v;
};

const id: Decoder<Id> = (v, path) => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.length > 0) return v;
  throw new DecodeError(path, "un id (número o cadena)");
};

const array =
  <T>(item: Decoder<T>): Decoder<T[]> =>
  (v, path) => {
    if (!Array.isArray(v)) throw new DecodeError(path, "una lista");
    return v.map((x, i) => item(x, `${path}[${i}]`));
  };

const oneOf =
  <T extends string>(options: readonly T[]): Decoder<T> =>
  (v, path) => {
    if (typeof v === "string" && (options as readonly string[]).includes(v)) return v as T;
    throw new DecodeError(path, `uno de ${options.join(", ")}`);
  };

/** Campo de lista opcional: si falta o es null, lista vacía. */
const optionalArray =
  <T>(item: Decoder<T>): Decoder<T[]> =>
  (v, path) =>
    v === undefined || v === null ? [] : array(item)(v, path);

const category: Decoder<Category> = (v, path) => {
  const o = record(v, path);
  return { id: id(o.id, `${path}.id`), slug: string(o.slug, `${path}.slug`), name: string(o.name, `${path}.name`) };
};

const prices: Decoder<PriceBySize> = (v, path) => {
  const o = record(v, path);
  const out = {} as PriceBySize;
  for (const size of PIZZA_SIZES) out[size] = number(o[size], `${path}.${size}`);
  return out;
};

const pizza: Decoder<Pizza> = (v, path) => {
  const o = record(v, path);
  return {
    id: id(o.id, `${path}.id`),
    slug: string(o.slug, `${path}.slug`),
    name: string(o.name, `${path}.name`),
    description: string(o.description, `${path}.description`),
    categoryId: id(o.categoryId, `${path}.categoryId`),
    prices: prices(o.prices, `${path}.prices`),
    image: string(o.image, `${path}.image`),
    ingredientIds: optionalArray(id)(o.ingredientIds, `${path}.ingredientIds`),
    tags: optionalArray(string)(o.tags, `${path}.tags`),
  };
};

export const decodeMenu = (v: unknown): Menu => {
  const o = record(v, "menu");
  let customPizza: Menu["customPizza"] = null;
  if (o.customPizza !== undefined && o.customPizza !== null) {
    const cp = record(o.customPizza, "menu.customPizza");
    customPizza = { basePrices: prices(cp.basePrices, "menu.customPizza.basePrices") };
  }
  return {
    currency: string(o.currency, "menu.currency"),
    categories: array(category)(o.categories, "menu.categories"),
    pizzas: array(pizza)(o.pizzas, "menu.pizzas"),
    customPizza,
  };
};

const ingredient: Decoder<Ingredient> = (v, path) => {
  const o = record(v, path);
  return {
    id: id(o.id, `${path}.id`),
    slug: string(o.slug, `${path}.slug`),
    name: string(o.name, `${path}.name`),
    kind: oneOf<IngredientKind>(INGREDIENT_KINDS)(o.kind, `${path}.kind`),
    extraPrice: number(o.extraPrice, `${path}.extraPrice`),
    image: string(o.image, `${path}.image`),
  };
};

export const decodeIngredients = (v: unknown): Ingredient[] => array(ingredient)(v, "ingredients");

export const decodeOrderCreated = (v: unknown): OrderCreated => {
  const o = record(v, "order");
  return {
    id: id(o.id, "order.id"),
    status: string(o.status, "order.status"),
    total: number(o.total, "order.total"),
    currency: string(o.currency, "order.currency"),
    estimatedMinutes: number(o.estimatedMinutes, "order.estimatedMinutes"),
  };
};

/** Tolerante: devuelve null si el cuerpo no tiene forma de ValidationProblem. */
export const tryDecodeValidationProblem = (v: unknown): ValidationProblem | null => {
  if (!isRecord(v) || !isRecord(v.errors)) return null;
  const errors: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(v.errors)) {
    if (Array.isArray(value)) errors[key] = value.filter((m): m is string => typeof m === "string");
    else if (typeof value === "string") errors[key] = [value];
  }
  const problem: ValidationProblem = { errors };
  if (typeof v.title === "string") problem.title = v.title;
  if (typeof v.status === "number") problem.status = v.status;
  return problem;
};

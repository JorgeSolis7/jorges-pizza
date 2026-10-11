/**
 * Cliente HTTP tipado de la API de Jorges.
 * Toda respuesta pasa por un decodificador (guards.ts); los errores se
 * normalizan en ApiError para que la UI muestre estados de error con reintento.
 */
import { decodeIngredients, decodeMenu, decodeOrderCreated, DecodeError, tryDecodeValidationProblem } from "./guards";
import type { Ingredient, Menu, OrderCreated, OrderRequest, ValidationProblem } from "./types";

const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "/api";
const TIMEOUT_MS = 10_000;

export type ApiErrorKind = "network" | "timeout" | "http" | "decode" | "validation";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | undefined;
  readonly problem: ValidationProblem | undefined;
  constructor(kind: ApiErrorKind, message: string, status?: number, problem?: ValidationProblem) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.problem = problem;
  }
}

async function request<T>(path: string, decode: (v: unknown) => T, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted) throw new ApiError("timeout", "El servidor tardó demasiado en responder.");
    throw new ApiError("network", "No pudimos conectar con la cocina. Revisa tu conexión.");
  } finally {
    window.clearTimeout(timer);
  }

  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 400) {
      const problem = tryDecodeValidationProblem(body);
      if (problem) throw new ApiError("validation", "Revisa los datos del pedido.", 400, problem);
    }
    // Vite devuelve 502/504 cuando el proxy no alcanza el backend.
    const message =
      res.status >= 500 ? "La cocina no está disponible en este momento." : `Error inesperado (${res.status}).`;
    throw new ApiError("http", message, res.status);
  }

  try {
    return decode(body);
  } catch (err) {
    if (err instanceof DecodeError) {
      console.error(err);
      throw new ApiError("decode", "Recibimos una respuesta inesperada del servidor.");
    }
    throw err;
  }
}

export const api = {
  getMenu: (): Promise<Menu> => request("/menu", decodeMenu),
  getIngredients: (): Promise<Ingredient[]> => request("/ingredients", decodeIngredients),
  createOrder: (order: OrderRequest): Promise<OrderCreated> =>
    request("/orders", decodeOrderCreated, { method: "POST", body: JSON.stringify(order) }),
};

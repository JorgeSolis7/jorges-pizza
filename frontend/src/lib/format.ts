const cache = new Map<string, Intl.NumberFormat>();

/** Formatea precios con la moneda que entrega el backend (por defecto PEN, locale es-PE). */
export function money(value: number, currency: string): string {
  let fmt = cache.get(currency);
  if (!fmt) {
    try {
      fmt = new Intl.NumberFormat("es-PE", { style: "currency", currency });
    } catch {
      fmt = new Intl.NumberFormat("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    cache.set(currency, fmt);
  }
  return fmt.format(value);
}

export const SIZE_LABEL = { personal: "Personal", mediana: "Mediana", familiar: "Familiar" } as const;
export const SIZE_CM = { personal: 25, mediana: 33, familiar: 40 } as const;
/** En "para picar" y "postres y bebidas" los tamaños son porciones o vasos. */
export const PORTION_LABEL = { personal: "Chica", mediana: "Mediana", familiar: "Grande" } as const;

export const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;

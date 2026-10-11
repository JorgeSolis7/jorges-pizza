/** Tokens de motion de DESIGN.md §9.2. */
export const dur = { d1: 0.12, d2: 0.25, d3: 0.4, d4: 0.6, d5: 0.9, d6: 1.6, float: 2.4 } as const;
export const ease = {
  standard: "power2.out", emphasis: "power3.out", exit: "power2.in", move: "power2.inOut",
  float: "sine.inOut", draw: "power1.inOut", pop: "back.out(1.7)", linear: "none",
} as const;
export const scrub = { direct: true, smooth: 0.8, soft: 1 } as const;
export const mq = {
  desktop: "(min-width: 1024px)",
  mobile: "(max-width: 1023.98px)",
  reduce: "(prefers-reduced-motion: reduce)",
  motion: "(prefers-reduced-motion: no-preference)",
  hover: "(hover: hover) and (pointer: fine)",
} as const;

/** Condiciones típicas de gsap.matchMedia en las secciones. */
export const MM_CONDITIONS = { desktop: mq.desktop, mobile: mq.mobile, reduce: mq.reduce } as const;
export interface MMFlags { desktop: boolean; mobile: boolean; reduce: boolean }
export const flags = (c: gsap.Conditions | undefined): MMFlags => ({
  desktop: !!c?.desktop, mobile: !!c?.mobile, reduce: !!c?.reduce,
});

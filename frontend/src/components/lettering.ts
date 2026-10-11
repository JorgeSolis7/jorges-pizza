/**
 * Hand-lettering provisional (DESIGN.md 7.7): una tipografía de trazo central
 * (monolínea, mayúsculas de rotulista) generada como paths SVG, un <path> por
 * trazo en orden de escritura, para que DrawSVG la "escriba". Se reemplaza por
 * los SVG del diseñador cuando existan, sin cambiar la API del componente.
 *
 * Glifos en una caja de 100 de alto (0 = arriba, 100 = línea base).
 */
import { rng } from "../lib/pizzaLayout";

interface Glyph { w: number; strokes: string[] }

const G: Record<string, Glyph> = {
  A: { w: 60, strokes: ["M0 100 L30 0 L60 100", "M12 64 L48 64"] },
  C: { w: 56, strokes: ["M56 16 C48 4 38 0 28 0 C8 0 0 26 0 50 C0 76 10 100 30 100 C42 100 52 94 56 82"] },
  D: { w: 56, strokes: ["M0 0 L0 100", "M0 0 C40 0 56 22 56 50 C56 80 40 100 0 100"] },
  E: { w: 46, strokes: ["M46 0 L0 0 L0 100 L46 100", "M0 50 L36 50"] },
  H: { w: 54, strokes: ["M0 0 L0 100", "M54 0 L54 100", "M0 50 L54 50"] },
  L: { w: 44, strokes: ["M0 0 L0 100 L44 100"] },
  M: { w: 72, strokes: ["M0 100 L0 0 L36 66 L72 0 L72 100"] },
  N: { w: 56, strokes: ["M0 100 L0 0 L56 100 L56 0"] },
  Ñ: { w: 56, strokes: ["M0 100 L0 0 L56 100 L56 0", "M8 -16 C16 -28 26 -10 36 -16 C42 -20 46 -24 50 -20"] },
  O: { w: 60, strokes: ["M30 0 C8 0 0 26 0 50 C0 76 10 100 30 100 C50 100 60 76 60 50 C60 26 52 0 30 0"] },
  R: { w: 54, strokes: ["M0 100 L0 0 L28 0 C48 0 54 12 54 26 C54 42 44 52 26 52 L0 52", "M24 52 L54 100"] },
  S: { w: 52, strokes: ["M50 14 C44 4 34 0 26 0 C10 0 2 10 2 24 C2 56 52 44 52 74 C52 90 40 100 24 100 C14 100 4 94 0 84"] },
  T: { w: 54, strokes: ["M0 0 L54 0", "M27 0 L27 100"] },
  U: { w: 54, strokes: ["M0 0 L0 66 C0 88 12 100 27 100 C42 100 54 88 54 66 L54 0"] },
  "0": { w: 52, strokes: ["M26 0 C6 0 0 28 0 50 C0 74 6 100 26 100 C46 100 52 74 52 50 C52 28 46 0 26 0"] },
  "4": { w: 54, strokes: ["M40 100 L40 0 L0 70 L54 70"] },
  "5": { w: 50, strokes: ["M48 0 L8 0 L4 44 C14 38 22 36 28 36 C44 36 50 50 50 66 C50 86 38 100 22 100 C12 100 4 96 0 88"] },
  "8": { w: 52, strokes: ["M26 46 C12 46 4 36 4 24 C4 10 14 0 26 0 C38 0 48 10 48 24 C48 36 40 46 26 46 C10 46 0 58 0 72 C0 88 12 100 26 100 C40 100 52 88 52 72 C52 58 42 46 26 46"] },
  "°": { w: 24, strokes: ["M12 0 C4 0 0 6 0 12 C0 18 4 24 12 24 C20 24 24 18 24 12 C24 6 20 0 12 0"] },
  ",": { w: 12, strokes: ["M8 88 C10 96 8 106 0 114"] },
};

const SPACE = 30;
const TRACKING = 18;
const LINE_GAP = 46;

/** Transforma los números de un path (solo comandos absolutos M/L/C). */
function transformPath(d: string, fx: (x: number, y: number) => [number, number]): string {
  return d.replace(/([MLC])([^MLC]*)/g, (_m, cmd: string, args: string) => {
    const nums = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    const out: string[] = [];
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const [x, y] = fx(nums[i]!, nums[i + 1]!);
      out.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return `${cmd}${out.join(" ")} `;
  }).trim();
}

/**
 * Construye el SVG del lettering. `lines` en mayúsculas (los caracteres sin
 * glifo se ignoran). Cada línea va centrada; inclinación y temblor leves.
 */
export function letteringSVG(lines: readonly string[], opts: { label: string; seed?: number } ): SVGSVGElement {
  const rand = rng(opts.seed ?? 3);
  const measured = lines.map((line) => {
    let w = 0;
    for (const ch of line) w += ch === " " ? SPACE : (G[ch]?.w ?? 0) + TRACKING;
    return Math.max(0, w - TRACKING);
  });
  const width = Math.max(...measured) + 40;
  const height = lines.length * 100 + (lines.length - 1) * LINE_GAP + 60;
  const paths: string[] = [];
  const skew = Math.tan((-9 * Math.PI) / 180);

  lines.forEach((line, li) => {
    let cursor = (width - measured[li]!) / 2;
    const baseY = 34 + li * (100 + LINE_GAP);
    for (const ch of line) {
      if (ch === " ") { cursor += SPACE; continue; }
      const g = G[ch];
      if (!g) continue;
      const jitterY = (rand() - 0.5) * 6;
      const jitterR = (rand() - 0.5) * 0.05;
      const ox = cursor;
      const cx = g.w / 2;
      for (const s of g.strokes) {
        paths.push(transformPath(s, (x, y) => {
          // leve rotación por letra + inclinación de rotulista
          const rx = (x - cx) * Math.cos(jitterR) - (y - 50) * Math.sin(jitterR) + cx;
          const ry = (x - cx) * Math.sin(jitterR) + (y - 50) * Math.cos(jitterR) + 50;
          return [ox + rx + (ry - 100) * skew, baseY + ry + jitterY];
        }));
      }
      cursor += g.w + TRACKING;
    }
  });

  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${width.toFixed(0)} ${height}`);
  svg.setAttribute("class", "lettering");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  for (const d of paths) {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    svg.appendChild(p);
  }
  return svg;
}

/** `<h2>` accesible con el texto real oculto y el SVG decorativo. */
export function letteringHeading(text: string, lines: readonly string[], seed?: number): HTMLHeadingElement {
  const h2 = document.createElement("h2");
  const sr = document.createElement("span");
  sr.className = "sr-only";
  sr.textContent = text;
  h2.append(sr, letteringSVG(lines, seed === undefined ? { label: text } : { label: text, seed }));
  return h2;
}

/**
 * Genera las ilustraciones vectoriales planas de Jorges:
 *   public/assets/ingredients/<slug>.svg   (una pieza por ingrediente, viewBox 200)
 *   public/assets/pizzas/{base,salsa,queso,pizza,porcion,<pizza>}.svg (viewBox 400)
 *
 * Uso: npm run art   (Node 24 ejecuta TypeScript con type stripping)
 * Las fotos WebP reales sustituyen a estos SVG más adelante sin tocar código:
 * la app intenta primero <slug>.webp y cae al .svg si falta.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { HERO_SEED, HERO_TOPPINGS, hashString, layoutToppings, rng } from "../src/lib/pizzaLayout.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "assets");
const ingDir = join(root, "ingredients");
const pizDir = join(root, "pizzas");
mkdirSync(ingDir, { recursive: true });
mkdirSync(pizDir, { recursive: true });

const svg = (viewBox: string, body: string, label: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${label}">\n${body}\n</svg>\n`;

/** Puntos irregulares alrededor de un círculo → path suave (Catmull-Rom → Bézier). */
function blobPath(cx: number, cy: number, r: number, wobble: number, points: number, seed: number): string {
  const rand = rng(seed);
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const rr = r * (1 - wobble / 2 + rand() * wobble);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  const n = pts.length;
  const at = (i: number): [number, number] => pts[((i % n) + n) % n]!;
  let d = `M${at(0)[0].toFixed(1)} ${at(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]!.toFixed(1)} ${c1[1]!.toFixed(1)} ${c2[0]!.toFixed(1)} ${c2[1]!.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + "Z";
}

function dots(n: number, seed: number, area: (r: () => number) => [number, number], rMin: number, rMax: number, fill: string, opacity = 1): string {
  const rand = rng(seed);
  let out = "";
  for (let i = 0; i < n; i++) {
    const [x, y] = area(rand);
    const r = rMin + rand() * (rMax - rMin);
    out += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * (0.7 + rand() * 0.3)).toFixed(1)}" fill="${fill}" opacity="${opacity}"/>`;
  }
  return out;
}
const inDisc = (cx: number, cy: number, R: number) => (rand: () => number): [number, number] => {
  const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * R;
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
};
const inRing = (cx: number, cy: number, r0: number, r1: number) => (rand: () => number): [number, number] => {
  const a = rand() * Math.PI * 2, r = r0 + rand() * (r1 - r0);
  return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
};

/* ------------------------------------------------------------------ */
/* Piezas de ingredientes (viewBox 0 0 200 200, centradas en 100,100) */
/* ------------------------------------------------------------------ */

const pieces: Record<string, { name: string; body: string }> = {
  tomate: {
    name: "Rodaja de tomate",
    body: `<circle cx="100" cy="100" r="90" fill="#B8291A"/>
<circle cx="100" cy="100" r="82" fill="#DE4C35"/>
${[0, 72, 144, 216, 288].map((r) => `<g transform="rotate(${r} 100 100)"><path d="M100 30 C124 34 132 58 122 76 C114 88 86 88 78 76 C68 58 76 34 100 30Z" fill="#F2836B"/><ellipse cx="94" cy="56" rx="4" ry="6.5" fill="#FBE3A0"/><ellipse cx="106" cy="62" rx="4" ry="6.5" fill="#FBE3A0"/><ellipse cx="100" cy="46" rx="3.5" ry="5.5" fill="#FBE3A0"/></g>`).join("")}
<circle cx="100" cy="100" r="18" fill="#F2A092"/>
<path d="M40 70 A66 66 0 0 1 82 36" stroke="#FFFFFF" stroke-opacity=".35" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  },
  pepperoni: {
    name: "Pepperoni",
    body: `<defs><radialGradient id="pep-g" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#C8341E"/><stop offset=".75" stop-color="#A2281A"/><stop offset="1" stop-color="#7A1D13"/></radialGradient></defs>
<path d="${blobPath(100, 100, 86, 0.06, 14, 31)}" fill="url(#pep-g)"/>
${dots(14, 4, inDisc(100, 100, 66), 3, 7, "#F2A092", 0.75)}
${dots(6, 9, inDisc(100, 100, 60), 3, 6, "#5F1B16", 0.55)}
<path d="M44 78 A60 60 0 0 1 86 42" stroke="#FFFFFF" stroke-opacity=".28" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  },
  albahaca: {
    name: "Hoja de albahaca",
    body: `<g transform="rotate(-28 100 100)">
<path d="M100 14 C152 38 170 102 138 158 C124 180 110 190 100 190 C90 190 76 180 62 158 C30 102 48 38 100 14Z" fill="#2D642B"/>
<path d="M100 14 C152 38 170 102 138 158 C124 180 110 190 100 190Z" fill="#3B7B37"/>
<path d="M100 22 C100 80 100 140 100 196" stroke="#225021" stroke-width="5" fill="none" stroke-linecap="round"/>
${[60, 92, 124, 152].map((y) => `<path d="M100 ${y} Q${124} ${y - 10} ${140} ${y - 26}" stroke="#2D642B" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M100 ${y} Q${76} ${y - 10} ${60} ${y - 26}" stroke="#225021" stroke-width="3" fill="none" stroke-linecap="round"/>`).join("")}
<path d="M118 44 C138 64 146 94 140 122" stroke="#91C68B" stroke-opacity=".55" stroke-width="5" fill="none" stroke-linecap="round"/>
</g>`,
  },
  champinones: {
    name: "Láminas de champiñón",
    body: `<path d="M24 104 C24 50 62 22 100 22 C138 22 176 50 176 104 C176 116 166 120 154 118 L130 115 L130 162 C130 176 118 182 100 182 C82 182 70 176 70 162 L70 115 L46 118 C34 120 24 116 24 104Z" fill="#E2D4C1" stroke="#8C6A4B" stroke-width="8" stroke-linejoin="round"/>
<path d="M40 100 C42 62 70 40 100 40 C130 40 158 62 160 100" fill="none" stroke="#C9AE8C" stroke-width="5" stroke-linecap="round"/>
<path d="M84 120 L84 160 M100 120 L100 166 M116 120 L116 160" stroke="#D3C0A4" stroke-width="4" stroke-linecap="round"/>
<path d="M56 70 C66 52 82 44 98 42" stroke="#FFFFFF" stroke-opacity=".5" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  },
  aceitunas: {
    name: "Aceituna negra",
    body: `<circle cx="100" cy="100" r="58" fill="none" stroke="#261C17" stroke-width="44"/>
<circle cx="100" cy="100" r="58" fill="none" stroke="#4D4038" stroke-width="6" stroke-dasharray="70 300" stroke-dashoffset="-200" stroke-linecap="round"/>
<circle cx="100" cy="100" r="36" fill="none" stroke="#17100C" stroke-width="3" opacity=".8"/>`,
  },
  cebolla: {
    name: "Aro de cebolla morada",
    body: `<path d="M100 26 A74 74 0 1 1 30 120" fill="none" stroke="#7A2E5E" stroke-width="16" stroke-linecap="round"/>
<path d="M100 44 A56 56 0 1 1 46 116" fill="none" stroke="#E9C6DA" stroke-width="9" stroke-linecap="round"/>
<path d="M100 26 A74 74 0 0 1 160 62" fill="none" stroke="#B4588F" stroke-width="5" stroke-linecap="round" opacity=".8"/>`,
  },
  pimiento: {
    name: "Aro de pimiento verde",
    body: `<path d="M100 32 C132 24 164 48 166 80 C178 112 162 152 130 164 C112 174 88 174 70 164 C38 152 22 112 34 80 C38 48 68 24 100 32Z" fill="none" stroke="#2D642B" stroke-width="18" stroke-linejoin="round"/>
<path d="M100 32 C132 24 164 48 166 80" fill="none" stroke="#5DAD58" stroke-width="5" stroke-linecap="round"/>`,
  },
  jamon: {
    name: "Jamón",
    body: `<path d="${blobPath(100, 100, 78, 0.28, 9, 77)}" fill="#F2C0B4"/>
<path d="${blobPath(100, 104, 62, 0.3, 9, 78)}" fill="#E58A84"/>
<path d="M60 90 C80 76 112 74 138 88" stroke="#F8D8D2" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>
<path d="M70 128 C92 136 118 134 134 122" stroke="#C86B66" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>`,
  },
  pina: {
    name: "Trozo de piña",
    body: `<path d="M40 60 L160 60 L144 150 L56 150Z" fill="#F6CB6F" stroke="#E89417" stroke-width="7" stroke-linejoin="round"/>
<path d="M70 72 L78 140 M100 72 L100 140 M130 72 L122 140" stroke="#F2B33D" stroke-width="5" stroke-linecap="round"/>
<path d="M52 66 L148 66" stroke="#FEF9EC" stroke-width="5" stroke-linecap="round" opacity=".8"/>`,
  },
  rucula: {
    name: "Hoja de rúcula",
    body: `<g transform="rotate(20 100 100)"><path d="M100 10 C112 30 92 40 116 52 C136 62 118 76 138 88 C156 100 132 114 146 130 C156 146 128 152 120 168 C112 182 104 192 100 192 C96 192 88 182 80 168 C72 152 44 146 54 130 C68 114 44 100 62 88 C82 76 64 62 84 52 C108 40 88 30 100 10Z" fill="#3B7B37"/>
<path d="M100 18 L100 196" stroke="#2D642B" stroke-width="5" stroke-linecap="round"/>
<path d="M100 70 L124 56 M100 100 L130 90 M100 130 L126 124 M100 70 L76 56 M100 100 L70 90 M100 130 L74 124" stroke="#2D642B" stroke-width="3" stroke-linecap="round"/></g>`,
  },
  oregano: {
    name: "Ramita de orégano",
    body: `<path d="M100 186 C98 140 102 90 100 20" stroke="#4D4038" stroke-width="5" fill="none" stroke-linecap="round"/>
${[40, 70, 100, 130, 158].map((y, i) => `<ellipse cx="${i % 2 ? 78 : 122}" cy="${y}" rx="20" ry="12" transform="rotate(${i % 2 ? 25 : -25} ${i % 2 ? 78 : 122} ${y})" fill="${i % 2 ? "#489245" : "#3B7B37"}"/>`).join("")}
<ellipse cx="100" cy="22" rx="12" ry="16" fill="#5DAD58"/>`,
  },
  parmesano: {
    name: "Lasca de parmesano",
    body: `<path d="M30 110 C40 70 90 48 150 56 C172 60 176 76 160 86 C120 102 90 128 60 150 C40 162 24 140 30 110Z" fill="#F6E0A6" stroke="#E2C27A" stroke-width="5" stroke-linejoin="round"/>
<path d="M54 110 C76 90 110 78 146 72" stroke="#FEF9EC" stroke-width="6" fill="none" stroke-linecap="round"/>
${dots(6, 12, inDisc(96, 104, 30), 2, 4, "#E8C46A", 0.8)}`,
  },
  salchicha: {
    name: "Salchicha italiana",
    body: `<path d="${blobPath(100, 100, 70, 0.4, 11, 41)}" fill="#8C4A2C"/>
<path d="${blobPath(96, 94, 46, 0.45, 9, 42)}" fill="#A65F3A"/>
${dots(8, 43, inDisc(100, 100, 50), 3, 5, "#F2E9D9", 0.7)}
${dots(5, 44, inDisc(100, 100, 50), 3, 6, "#5A2C17", 0.7)}`,
  },
  mozzarella: {
    name: "Mozzarella fresca",
    body: `<path d="${blobPath(100, 100, 80, 0.22, 10, 55)}" fill="#FFF8E7" stroke="#F1E3BF" stroke-width="4"/>
<path d="${blobPath(104, 104, 58, 0.25, 9, 56)}" fill="#FDF1D2"/>
${dots(5, 57, inDisc(100, 100, 55), 4, 9, "#F6CB6F", 0.55)}
<path d="M56 74 C70 54 96 46 118 50" stroke="#FFFFFF" stroke-width="8" fill="none" stroke-linecap="round"/>`,
  },
  burrata: {
    name: "Burrata",
    body: `<circle cx="100" cy="104" r="76" fill="#F2E9D9"/>
<circle cx="100" cy="100" r="72" fill="#FFFDF8"/>
<path d="M78 40 C90 30 110 30 122 40 C116 54 84 54 78 40Z" fill="#F2E9D9"/>
<path d="M60 86 C66 66 84 54 104 52" stroke="#FFFFFF" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M70 130 C90 146 120 142 136 124" stroke="#E2D4C1" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  },
  jalapeno: {
    name: "Rodaja de jalapeño",
    body: `<circle cx="100" cy="100" r="66" fill="#2D642B"/>
<circle cx="100" cy="100" r="54" fill="#91C68B"/>
<circle cx="100" cy="100" r="22" fill="#DFEFDC"/>
${[0, 60, 120, 180, 240, 300].map((r) => `<ellipse cx="100" cy="68" rx="5" ry="8" transform="rotate(${r} 100 100)" fill="#FEF9EC"/>`).join("")}`,
  },
  ajo: {
    name: "Lámina de ajo",
    body: `<path d="M100 30 C150 40 166 110 140 160 C126 180 74 180 60 160 C34 110 50 40 100 30Z" fill="#FEF9EC" stroke="#E2D4C1" stroke-width="6"/>
<path d="M100 50 C110 90 110 130 100 166" stroke="#F2E9D9" stroke-width="6" fill="none" stroke-linecap="round"/>`,
  },
  masa: {
    name: "Bola de masa",
    body: `<ellipse cx="100" cy="150" rx="78" ry="16" fill="#261C17" opacity=".12"/>
<path d="M22 128 C22 70 58 40 100 40 C142 40 178 70 178 128 C178 150 142 158 100 158 C58 158 22 150 22 128Z" fill="#F2DEB4"/>
<path d="M40 104 C46 74 70 56 98 54" stroke="#FFFDF8" stroke-width="10" fill="none" stroke-linecap="round" opacity=".8"/>
${dots(14, 61, inDisc(100, 104, 52), 1.5, 3, "#FFFFFF", 0.9)}`,
  },
  "salsa-tomate": {
    name: "Salsa de tomate San Marzano",
    body: `<path d="${blobPath(100, 100, 82, 0.3, 12, 71)}" fill="#A2281A"/>
<path d="${blobPath(100, 98, 70, 0.3, 12, 72)}" fill="#C8341E"/>
${dots(7, 73, inDisc(100, 100, 50), 3, 7, "#DE4C35", 0.9)}
<path d="M58 72 C70 58 88 52 104 52" stroke="#F2A092" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>
${dots(5, 74, inDisc(100, 100, 50), 1.5, 2.5, "#3B7B37", 0.9)}`,
  },
  gorgonzola: {
    name: "Gorgonzola dolce",
    body: `<path d="M34 64 L162 50 L170 140 L44 156Z" fill="#FCEFCF" stroke="#E2D4C1" stroke-width="5" stroke-linejoin="round"/>
${dots(9, 81, inDisc(102, 102, 44), 4, 9, "#7C8F7A", 0.75)}
${dots(6, 82, inDisc(102, 102, 44), 2, 4, "#4F6152", 0.7)}
<path d="M48 72 L150 60" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity=".8"/>`,
  },
  nduja: {
    name: "'Nduja calabresa",
    body: `<path d="${blobPath(100, 100, 72, 0.42, 11, 91)}" fill="#A2281A"/>
<path d="${blobPath(98, 96, 48, 0.45, 9, 92)}" fill="#C8341E"/>
${dots(9, 93, inDisc(100, 100, 50), 2, 5, "#E89417", 0.75)}
${dots(5, 94, inDisc(100, 100, 50), 3, 6, "#5F1B16", 0.6)}`,
  },
  "cebolla-caramelizada": {
    name: "Cebolla caramelizada",
    body: `<path d="M40 120 C60 60 130 50 162 96" fill="none" stroke="#975217" stroke-width="16" stroke-linecap="round"/>
<path d="M52 140 C80 96 132 96 154 132" fill="none" stroke="#C17115" stroke-width="13" stroke-linecap="round"/>
<path d="M70 80 C96 62 130 70 140 86" fill="none" stroke="#E89417" stroke-width="7" stroke-linecap="round" opacity=".9"/>`,
  },
  "pimientos-asados": {
    name: "Pimientos asados",
    body: `<path d="M30 76 C70 50 140 56 172 90 C176 104 164 112 150 106 C120 88 80 86 46 104 C30 110 20 92 30 76Z" fill="#C8341E"/>
<path d="M44 132 C80 112 128 118 160 142 C166 156 150 164 138 156 C110 140 84 140 56 152 C40 158 32 142 44 132Z" fill="#E89417"/>
<path d="M50 78 C80 64 120 64 150 80" stroke="#F2A092" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
${dots(5, 95, inDisc(100, 100, 50), 3, 6, "#5F1B16", 0.45)}`,
  },
  "aceitunas-botija": {
    name: "Aceituna de botija",
    body: `<ellipse cx="100" cy="100" rx="70" ry="54" fill="#4A2340"/>
<ellipse cx="100" cy="100" rx="70" ry="54" fill="none" stroke="#2B1424" stroke-width="6"/>
<ellipse cx="78" cy="80" rx="22" ry="10" transform="rotate(-20 78 80)" fill="#8E5A80" opacity=".7"/>`,
  },
  "masa-delgada": {
    name: "Masa delgada crocante",
    body: `<ellipse cx="100" cy="112" rx="88" ry="68" fill="#D99A4E"/>
<ellipse cx="100" cy="106" rx="80" ry="60" fill="#F2DEB4"/>
${dots(12, 96, inDisc(100, 106, 50), 2, 4, "#C98840", 0.6)}`,
  },
  "masa-integral": {
    name: "Masa integral de masa madre",
    body: `<ellipse cx="100" cy="150" rx="78" ry="16" fill="#261C17" opacity=".12"/>
<path d="M22 128 C22 70 58 40 100 40 C142 40 178 70 178 128 C178 150 142 158 100 158 C58 158 22 150 22 128Z" fill="#C9A06B"/>
<path d="M40 104 C46 74 70 56 98 54" stroke="#E2C59A" stroke-width="10" fill="none" stroke-linecap="round"/>
${dots(18, 97, inDisc(100, 104, 52), 1.5, 3, "#7A5230", 0.8)}`,
  },
  "crema-de-rocoto": {
    name: "Crema de rocoto",
    body: `<path d="${blobPath(100, 100, 82, 0.3, 12, 98)}" fill="#C17115"/>
<path d="${blobPath(100, 98, 70, 0.3, 12, 99)}" fill="#E89417"/>
${dots(7, 100, inDisc(100, 100, 50), 3, 7, "#C8341E", 0.6)}
<path d="M58 72 C70 58 88 52 104 52" stroke="#F6CB6F" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>`,
  },
  "pesto-genoves": {
    name: "Pesto genovés",
    body: `<path d="${blobPath(100, 100, 82, 0.3, 12, 101)}" fill="#2D642B"/>
<path d="${blobPath(100, 98, 70, 0.3, 12, 102)}" fill="#489245"/>
${dots(10, 103, inDisc(100, 100, 52), 2, 5, "#91C68B", 0.8)}
${dots(5, 104, inDisc(100, 100, 50), 2, 4, "#F6E0A6", 0.9)}`,
  },
};
// Alias: slugs del backend (y variantes probables) que reutilizan una pieza.
const aliases: Record<string, string> = {
  "masa-tradicional": "masa",
  "salsa-pomodoro": "salsa-tomate",
  "ajo-confitado": "ajo",
  champinon: "champinones",
  hongos: "champinones",
  aceituna: "aceitunas",
  "aceitunas-negras": "aceitunas",
  "tomate-cherry": "tomate",
  "pimiento-verde": "pimiento",
  "cebolla-morada": "cebolla",
  "jamon-serrano": "jamon",
  prosciutto: "jamon",
  "jamon-cocido": "jamon",
  "salsa": "salsa-tomate",
  "salsa-de-tomate": "salsa-tomate",
  "masa-clasica": "masa",
  "masa-madre": "masa",
  "mozzarella-fior-di-latte": "mozzarella",
  "queso-mozzarella": "mozzarella",
  "parmigiano-reggiano": "parmesano",
  parmigiano: "parmesano",
  "salchicha-italiana": "salchicha",
  pimientos: "pimientos-asados",
};

for (const [slug, p] of Object.entries(pieces)) {
  writeFileSync(join(ingDir, `${slug}.svg`), svg("0 0 200 200", p.body, p.name));
}
for (const [alias, target] of Object.entries(aliases)) {
  const p = pieces[target]!;
  writeFileSync(join(ingDir, `${alias}.svg`), svg("0 0 200 200", p.body, p.name));
}

/* ------------------------------------------------------------------ */
/* Capas de pizza (viewBox 0 0 400 400)                                */
/* ------------------------------------------------------------------ */

const baseLayer = `<defs><radialGradient id="crust-g" cx=".5" cy=".5" r=".5"><stop offset=".78" stop-color="#F2C67E"/><stop offset=".9" stop-color="#D99A4E"/><stop offset="1" stop-color="#A86A2C"/></radialGradient></defs>
<circle cx="200" cy="200" r="196" fill="url(#crust-g)"/>
${dots(26, 101, inRing(200, 200, 168, 190), 3, 9, "#6B3A17", 0.55)}
${dots(16, 102, inRing(200, 200, 160, 186), 2, 5, "#3A1F0E", 0.5)}
<circle cx="200" cy="200" r="160" fill="#F3DDB0"/>
<path d="M70 120 A150 150 0 0 1 150 54" stroke="#FFF4DB" stroke-width="10" fill="none" stroke-linecap="round" opacity=".7"/>`;

type Sauce = "pomodoro" | "rocoto" | "pesto" | null;
const SAUCE_COLORS: Record<Exclude<Sauce, null>, [string, string, string, string]> = {
  pomodoro: ["#A2281A", "#C8341E", "#DE4C35", "#2D642B"],
  rocoto: ["#C17115", "#E89417", "#C8341E", "#3B7B37"],
  pesto: ["#2D642B", "#489245", "#91C68B", "#F6E0A6"],
};
const sauceLayerOf = (sauce: Exclude<Sauce, null>): string => {
  const [edge, fill, spot, fleck] = SAUCE_COLORS[sauce];
  return `<path d="${blobPath(200, 200, 156, 0.05, 22, 111)}" fill="${edge}"/>
<path d="${blobPath(200, 200, 148, 0.06, 22, 112)}" fill="${fill}"/>
${dots(18, 113, inDisc(200, 200, 125), 6, 16, spot, 0.8)}
${dots(10, 114, inDisc(200, 200, 125), 2, 3.5, fleck, 0.85)}`;
};
const sauceLayer = sauceLayerOf("pomodoro");

const cheeseLayer = `<path d="${blobPath(200, 200, 140, 0.16, 18, 121)}" fill="#FCEFCF"/>
<path d="${blobPath(204, 198, 112, 0.2, 14, 122)}" fill="#FEF9EC"/>
${dots(16, 123, inDisc(200, 200, 118), 6, 15, "#F2B33D", 0.5)}
${dots(8, 124, inDisc(200, 200, 110), 4, 8, "#E89417", 0.45)}`;

const shadow = `<ellipse cx="200" cy="206" rx="196" ry="196" fill="#17100C" opacity=".14"/>`;

writeFileSync(join(pizDir, "base.svg"), svg("0 0 400 400", baseLayer, "Base de masa"));
writeFileSync(join(pizDir, "salsa.svg"), svg("0 0 400 400", sauceLayer, "Capa de salsa de tomate"));
writeFileSync(join(pizDir, "salsa-pomodoro.svg"), svg("0 0 400 400", sauceLayer, "Capa de salsa de tomate"));
writeFileSync(join(pizDir, "salsa-crema-de-rocoto.svg"), svg("0 0 400 400", sauceLayerOf("rocoto"), "Capa de crema de rocoto"));
writeFileSync(join(pizDir, "salsa-pesto-genoves.svg"), svg("0 0 400 400", sauceLayerOf("pesto"), "Capa de pesto genovés"));
writeFileSync(join(pizDir, "queso.svg"), svg("0 0 400 400", cheeseLayer, "Capa de mozzarella fundida"));

/** Inserta una pieza como <svg> anidado, rotada y escalada sobre la pizza. */
function placePiece(slug: string, x: number, y: number, rotation: number, size: number, uid: string): string {
  const p = pieces[slug] ?? pieces[aliases[slug] ?? ""];
  if (!p) return "";
  const px = 200 + x * 200, py = 200 + y * 200, w = size * 400;
  // Prefija ids de gradientes para que no colisionen entre piezas.
  const body = p.body.replace(/id="([^"]+)"/g, `id="$1-${uid}"`).replace(/url\(#([^)]+)\)/g, `url(#$1-${uid})`);
  return `<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${rotation})"><svg x="${(-w / 2).toFixed(1)}" y="${(-w / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${w.toFixed(1)}" viewBox="0 0 200 200">${body}</svg></g>`;
}

function composePizza(toppings: readonly string[], seed: number, withCheese = true, sauce: Sauce = "pomodoro"): string {
  const placements = layoutToppings(toppings, seed);
  return [
    baseLayer,
    sauce ? sauceLayerOf(sauce) : "",
    withCheese ? cheeseLayer : "",
    ...placements.map((t, i) => placePiece(t.slug, t.x, t.y, t.rotation, t.size, `${i}`)),
  ].join("\n");
}

const heroPizza = composePizza(HERO_TOPPINGS, HERO_SEED);
writeFileSync(join(pizDir, "pizza.svg"), svg("0 0 400 400", heroPizza, "Pizza Jorges recién horneada"));
writeFileSync(join(pizDir, "pizza-generica.svg"), svg("0 0 400 400", shadow + heroPizza, "Pizza"));

const wedge = (deg0: number, deg1: number): string => {
  const r = 200, rad = (d: number) => (d * Math.PI) / 180;
  const p = (d: number) => `${(200 + Math.cos(rad(d)) * r).toFixed(1)} ${(200 + Math.sin(rad(d)) * r).toFixed(1)}`;
  return `M200 200 L${p(deg0)} A${r} ${r} 0 0 1 ${p(deg1)}Z`;
};
// Porción suelta (cuña de 60°) apuntando hacia abajo.
writeFileSync(
  join(pizDir, "porcion.svg"),
  svg("90 200 220 205", `<defs><clipPath id="slice-clip"><path d="${wedge(60, 120)}"/></clipPath></defs><g clip-path="url(#slice-clip)">${heroPizza}</g>`, "Porción de pizza"),
);

// Base del hero: masa + salsa, sin toppings (los toppings vuelan en el DOM).
writeFileSync(join(pizDir, "base-hero.svg"), svg("0 0 400 400", baseLayer + "\n" + sauceLayer, "Base de masa con salsa"));

// 6 porciones (J8) en lienzo común de 400×400: cortes a las 12 y cada 60°.
// Porción i centrada en θ = -60° + 60°·i (0° = derecha, sentido horario).
mkdirSync(join(pizDir, "porciones"), { recursive: true });
const slicePizza = composePizza(["mozzarella", "tomate", "pepperoni", "champinones", "aceitunas", "albahaca"], 2024);
for (let i = 0; i < 6; i++) {
  const c = -60 + 60 * i;
  writeFileSync(
    join(pizDir, "porciones", `porcion-${i + 1}.svg`),
    svg("0 0 400 400", `<defs><clipPath id="w${i}"><path d="${wedge(c - 30, c + 30)}"/></clipPath></defs><g clip-path="url(#w${i})">${slicePizza}</g>`, `Porción ${i + 1}`),
  );
}

// Tabla de madera con pizza (J7), sombra horneada abajo a la derecha.
const boardBody = `<ellipse cx="318" cy="228" rx="214" ry="206" fill="#17100C" opacity=".16"/>
<rect x="470" y="186" width="160" height="56" rx="28" fill="#975217"/>
<circle cx="596" cy="214" r="11" fill="#723D17"/>
<circle cx="300" cy="214" r="206" fill="#975217"/>
<circle cx="300" cy="214" r="196" fill="#C17115"/>
${[150, 178, 205, 232, 262].map((y, k) => `<path d="M${120 + k * 6} ${y} C220 ${y - 14} 380 ${y + 14} ${480 - k * 6} ${y}" stroke="#975217" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>`).join("")}
<g transform="translate(125 39) scale(.875)">${heroPizza}</g>`;
writeFileSync(join(pizDir, "tabla.svg"), svg("0 0 640 420", boardBody, "Pizza sobre tabla de madera"));

// Pizzas del menú: slugs y composición del seed del backend (+ algunos genéricos).
const menuPizzas: Record<string, { name: string; toppings: string[]; cheese?: boolean; sauce?: Sauce }> = {
  margherita: { name: "Pizza Margherita", toppings: ["mozzarella", "tomate", "albahaca"] },
  margarita: { name: "Pizza Margarita", toppings: ["mozzarella", "tomate", "albahaca"] },
  pepperoni: { name: "Pizza Pepperoni", toppings: ["pepperoni", "oregano"] },
  diavola: { name: "Pizza Diavola", toppings: ["nduja", "pepperoni"] },
  "jorges-especial": { name: "Pizza Jorges Especial", toppings: ["prosciutto", "champinones", "aceitunas-botija"] },
  "prosciutto-rucula": { name: "Pizza Prosciutto e Rúcula", toppings: ["prosciutto", "rucula", "parmigiano"] },
  "rocoto-andina": { name: "Pizza Rocoto Andina", toppings: ["nduja", "cebolla-caramelizada"], sauce: "rocoto" },
  "cuatro-quesos": { name: "Pizza Cuatro Quesos", toppings: ["mozzarella", "parmigiano", "gorgonzola"], sauce: null },
  "dulce-gorgonzola": { name: "Pizza Dulce Gorgonzola", toppings: ["gorgonzola", "cebolla-caramelizada", "rucula"], sauce: null },
  "pesto-verde": { name: "Pizza Pesto Verde", toppings: ["parmigiano", "rucula"], sauce: "pesto" },
  marinara: { name: "Pizza Marinara", toppings: ["ajo-confitado", "oregano", "albahaca"], cheese: false },
  huerta: { name: "Pizza Huerta", toppings: ["champinones", "pimientos-asados", "cebolla-caramelizada", "aceitunas-botija"], cheese: false },
  hawaiana: { name: "Pizza Hawaiana", toppings: ["jamon", "pina"] },
  vegetariana: { name: "Pizza Vegetariana", toppings: ["champinones", "pimiento", "cebolla", "aceitunas", "tomate"] },
  funghi: { name: "Pizza Funghi", toppings: ["champinones", "ajo", "oregano"] },
  capricciosa: { name: "Pizza Capricciosa", toppings: ["jamon", "champinones", "aceitunas", "albahaca"] },
};
for (const [slug, p] of Object.entries(menuPizzas)) {
  writeFileSync(
    join(pizDir, `${slug}.svg`),
    svg("0 0 400 400", shadow + composePizza(p.toppings, hashString(slug), p.cheese ?? true, p.sauce === undefined ? "pomodoro" : p.sauce), p.name),
  );
}

// Platos que no son pizza (para picar, postres y bebidas), también cenitales.
const dishes: Record<string, { name: string; body: string }> = {
  "focaccia-ajo": {
    name: "Focaccia de ajo y orégano",
    body: `<rect x="44" y="70" width="320" height="270" rx="40" fill="#17100C" opacity=".14"/>
<rect x="36" y="60" width="320" height="270" rx="40" fill="#D99A4E"/>
<rect x="50" y="74" width="292" height="242" rx="32" fill="#F2C67E"/>
${dots(22, 201, (r) => [70 + r() * 252, 94 + r() * 202], 6, 10, "#C98840", 0.7)}
${[[120, 140], [250, 120], [180, 230], [290, 250], [100, 270]].map(([x, y], i) => placePiece("ajo", (x! - 200) / 200, (y! - 200) / 200, i * 40, 0.08, `f${i}`)).join("")}
${[[160, 110], [230, 190], [130, 210], [300, 170]].map(([x, y], i) => placePiece("oregano", (x! - 200) / 200, (y! - 200) / 200, i * 70, 0.1, `o${i}`)).join("")}`,
  },
  burrata: {
    name: "Burrata con tomates asados",
    body: `<circle cx="206" cy="208" r="186" fill="#17100C" opacity=".14"/>
<circle cx="200" cy="200" r="186" fill="#FFFDF8"/>
<circle cx="200" cy="200" r="150" fill="none" stroke="#F2E9D9" stroke-width="6"/>
${placePiece("burrata", 0, 0, 0, 0.36, "b")}
${[0, 60, 120, 180, 240, 300].map((a, i) => placePiece("tomate", Math.cos((a * Math.PI) / 180) * 0.52, Math.sin((a * Math.PI) / 180) * 0.52, a, 0.16, `t${i}`)).join("")}
${[30, 150, 270].map((a, i) => placePiece("albahaca", Math.cos((a * Math.PI) / 180) * 0.5, Math.sin((a * Math.PI) / 180) * 0.5, a, 0.14, `a${i}`)).join("")}`,
  },
  tiramisu: {
    name: "Tiramisú de la casa",
    body: `<circle cx="206" cy="208" r="186" fill="#17100C" opacity=".14"/>
<circle cx="200" cy="200" r="186" fill="#FFFDF8"/>
<rect x="104" y="104" width="200" height="200" rx="10" fill="#17100C" opacity=".12"/>
<rect x="96" y="96" width="200" height="200" rx="10" fill="#FCEFCF"/>
<rect x="108" y="108" width="176" height="176" rx="6" fill="#723D17"/>
${dots(60, 211, (r) => [112 + r() * 168, 112 + r() * 168], 1.5, 3, "#512B15", 0.9)}
${dots(14, 212, (r) => [112 + r() * 168, 112 + r() * 168], 3, 6, "#975217", 0.6)}`,
  },
  "limonada-hierbabuena": {
    name: "Limonada de hierbabuena",
    body: `<circle cx="210" cy="210" r="150" fill="#17100C" opacity=".14"/>
<circle cx="200" cy="200" r="150" fill="#E2D4C1"/>
<circle cx="200" cy="200" r="138" fill="#FCEFCF"/>
<circle cx="200" cy="200" r="120" fill="#FAE0A3"/>
<circle cx="170" cy="180" r="56" fill="#F2B33D"/>
<circle cx="170" cy="180" r="48" fill="#FEF9EC"/>
${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M170 180 L${(170 + Math.cos((a * Math.PI) / 180) * 44).toFixed(1)} ${(180 + Math.sin((a * Math.PI) / 180) * 44).toFixed(1)}" stroke="#F6CB6F" stroke-width="5"/>`).join("")}
${placePiece("albahaca", 0.25, 0.22, 40, 0.2, "m1")}${placePiece("albahaca", 0.08, 0.34, -30, 0.16, "m2")}
<path d="M110 120 A120 120 0 0 1 180 84" stroke="#FFFFFF" stroke-width="10" fill="none" stroke-linecap="round" opacity=".7"/>`,
  },
};
for (const [slug, d] of Object.entries(dishes)) writeFileSync(join(pizDir, `${slug}.svg`), svg("0 0 400 400", d.body, d.name));
// Favicon: porción con la cuña de la pizza.
writeFileSync(
  join(root, "..", "favicon.svg"),
  svg("0 0 64 64", `<rect width="64" height="64" rx="14" fill="#261C17"/><path d="M32 54 L12 16 A44 44 0 0 1 52 16Z" fill="#F2B33D"/><path d="M12 16 A44 44 0 0 1 52 16 L49 22 A38 38 0 0 0 15 22Z" fill="#D99A4E"/><circle cx="28" cy="27" r="4.5" fill="#C8341E"/><circle cx="37" cy="36" r="4" fill="#C8341E"/><circle cx="31" cy="44" r="3" fill="#C8341E"/>`, "Jorges"),
);

console.log(`Ingredientes: ${Object.keys(pieces).length} piezas + ${Object.keys(aliases).length} alias · Pizzas: ${Object.keys(menuPizzas).length + 5}`);

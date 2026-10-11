# Jorges: sistema de diseño

> Paso 1b del proyecto. Documento de referencia único para construir el frontend de Jorges (TypeScript + GSAP 3.13 + ScrollTrigger; backend .NET 10; Docker).
> Fecha: 2026-10-09. Estructura basada en la skill *design-system-extract*: atmósfera, color, tipografía, componentes, layout y notas de generación, más las secciones de imágenes y motion.
>
> **Fuentes de verdad (no duplicar, enlazar):**
> - Color: [`docs/design/palette.css`](docs/design/palette.css) y [`docs/design/palette.md`](docs/design/palette.md). Todos los colores de este documento salen de ahí. **No se añade ningún color nuevo.**
> - Referencia visual y medidas de Chipotle: [`docs/research/chipotle-analysis.md`](docs/research/chipotle-analysis.md) (los códigos A1–A15 y J1–J16 de este documento remiten a ese análisis) y sus capturas en [`docs/research/screenshots/`](docs/research/screenshots/).
>
> Convenciones: `px` siempre a 16 px = 1 rem. "Escritorio" = viewport ≥ 1024 px; "móvil" = < 1024 px salvo que se indique otro corte. Los valores entre `clamp()` interpolan entre 390 px y 1440 px de viewport.

---

## 1. Tema visual y atmósfera

**Una frase:** la estructura editorial y franca de chipotle.com (titulares condensados en mayúsculas, comida recortada sobre fondo limpio, cards cuadradas con borde fino, casi sin sombras) trasladada a una pizzería premium de masa madre y horno de leña, con el storytelling de scroll que Chipotle solo tiene en `/values` llevado a la home y hecho con GSAP.

| Rasgo | Chipotle (medido) | Jorges (decidido) |
|---|---|---|
| Fondo de página | Blanco `#FFFFFF` | Crema de harina `--background` `#FAF5EA` |
| Texto | Marrón `#451400`, nunca negro | Carbón tostado `--foreground` `#17100C` (marrón muy oscuro), nunca `#000` |
| Titulares | Trade Gothic LT Bold condensada, MAYÚSCULAS, interlineado muy apretado (48/38) | Barlow Condensed 700–800, MAYÚSCULAS, interlineado 0,92–1,0 (más aire por las tildes del español) |
| Texto corrido | Nunito 16 px | Nunito Sans 16–17 px |
| Radios | Botones 4 px, píldoras 9999 px, cards e imágenes 0 | Igual |
| Sombras | Casi ninguna; la profundidad la da la sombra incluida en el PNG | Igual; sombras horneadas en los assets estáticos y sombras CSS separadas en los assets animados |
| Comida | PNG recortados con alfa sobre blanco o papel | WebP recortados con alfa, vista cenital, sobre crema, carbón o papel |
| Momentos de marca | Hand-lettering en GIF | Hand-lettering en SVG de trazo que se dibuja con DrawSVG |
| Motion | Sobrio: hovers de 0,12 s, fades de 1 s, parallax y marquee lineales | Más rico pero contenido: hero pinneado de ensamblaje, porciones que se separan, marquee ligado a la velocidad de scroll; hovers de 0,25 s |

**Qué hace que se sienta premium y no fast-food:**
1. Fondo crema y secciones en carbón (`masa-900`/`masa-950`) en lugar de blanco puro y rojo por todas partes. Proporción 60/25/10/5 de la paleta (masa / tomate / queso / albahaca).
2. Un solo CTA rojo por vista.
3. Más aire vertical que Chipotle: 128 px entre secciones en escritorio (Chipotle usa 40–60 px).
4. Fotografía cenital consistente: todas las pizzas e ingredientes fotografiados desde arriba (90°), con luz desde arriba a la izquierda.
5. Movimiento lento y con inercia (`scrub: 0.8–1`, easings `power2/power3`), nunca rebotes exagerados salvo el "pop" del contador del carrito.

---

## 2. Color

La implementación completa (escalas 50–950, tokens semánticos claro/oscuro, ratios WCAG) está en `docs/design/palette.css`. Se importa tal cual:

```css
/* src/styles/main.css */
@import "tailwindcss";
@import "../../docs/design/palette.css"; /* o copiarlo a src/styles/palette.css */
@import "./tokens.css";                  /* bloque de la sección 11 de este documento */
@custom-variant dark (&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));
```

### 2.1 Roles (resumen)

| Rol | Token | Claro | Uso en Jorges |
|---|---|---|---|
| Fondo de página | `--background` | `masa-50` `#FAF5EA` | Secciones "crema" |
| Superficie | `--surface` | `harina` `#FFFDF8` | Cards, header sólido, drawer del carrito, inputs |
| Sección alterna | `--muted` | `masa-100` `#F2E9D9` | Secciones alternas, chips inactivos, estado disabled |
| Texto | `--foreground` | `masa-950` `#17100C` | Todo el texto y los titulares por defecto |
| Texto atenuado | `--muted-foreground` | `masa-600` `#63554B` | Descripciones de platos, metadatos, kcal |
| Primario | `--primary` / `--primary-hover` | `tomate-600` `#C8341E` / `tomate-700` `#A2281A` | CTA principal, palabra destacada en titulares, barra activa de la nav |
| Texto rojo | `--primary-text` | `tomate-700` | Enlaces, "Personalizar →" |
| Secundario | `--secondary` | `masa-900` `#261C17` | Botón secundario, pestaña activa, botón "+" de las cards |
| Acento | `--accent` | `queso-400` `#F2B33D` | Botón queso sobre tomate o carbón, contador del carrito, precios sobre carbón, subrayados |
| Texto acento | `--accent-text` | `queso-800` `#723D17` | Eyebrows y viñetas sobre crema |
| Borde decorativo | `--border` | `masa-200` `#E2D4C1` | Contorno de cards, separadores |
| Borde de control | `--input` | `masa-500` `#796A5D` | Inputs, checkbox, botón outline |
| Foco | `--ring` | `tomate-600` (claro) / `queso-400` (oscuro) | `outline: 2px` + `offset: 2px` |
| Éxito | `--success` | `albahaca-600` `#3B7B37` | Toast "Agregado", badge Veggie |
| Error | `--danger` | `vino-600` `#A8213A` | Solo errores, siempre con icono y texto |

### 2.2 Equivalencias con Chipotle

| Chipotle | Hex | Jorges |
|---|---|---|
| Marrón texto / botón primario | `#451400` | `--foreground` (texto) y `--secondary` (botón) |
| Marrón hover | `#6B321B` | `masa-700` `#4D4038` (hover del botón secundario, ver 8.3) |
| Rojo marca | `#AD2118` | `--primary` `tomate-600` |
| Rojo hover | `#B3473F` | `--primary-hover` `tomate-700` (Jorges oscurece en hover, Chipotle aclara: el texto crema necesita ≥ 4.5:1) |
| Dorado | `#B68207` | `--accent` `queso-400` sobre oscuro; `--accent-text` `queso-800` como texto sobre crema |
| Borde de cards | `#D4CBC7` | `--border` `masa-200` |
| Gris de barras | `#F2F2F2` | `--muted` `masa-100` |
| Papel de `/values` | textura | `masa-100` + textura de grano (ver 7.6) |

### 2.3 Secciones con ámbito oscuro

`palette.css` aplica los tokens oscuros a cualquier elemento con `data-theme="dark"`, no solo a `<html>`. Las secciones carbón se marcan así y todos los componentes dentro se adaptan solos (el botón secundario pasa a crema, el foco pasa a queso, los enlaces a `tomate-400`):

```html
<section class="hero" data-theme="dark">…</section>   <!-- fondo masa-950 por --background -->
```

Para que una sección oscura use `masa-900` en lugar de `masa-950`, se añade `bg-masa-900` a la sección. Secciones con `data-theme="dark"`: hero, video del horno, menú móvil, footer.

**Modo oscuro global:** v1 sigue `prefers-color-scheme` tal como lo define `palette.css`, sin interruptor visible. Las secciones crema pasan a `masa-950`; las cards a `masa-900`.

### 2.4 Tokens de componente derivados

Solo combinan tonos que ya existen en la paleta (comprobados con las tablas de `palette.md`):

| Token | Claro | Ámbito oscuro | Contraste del texto |
|---|---|---|---|
| `--secondary-hover` | `masa-700` `#4D4038` | `masa-200` `#E2D4C1` | crema/masa-700 9.17:1 · carbón/masa-200 12.92:1 |
| `--accent-hover` | `queso-300` `#F6CB6F` | `queso-300` | carbón/queso-300 12.27:1 |
| `--scrim` | `rgb(23 16 12 / 0.5)` (masa-950 al 50 %) | igual | n/a |
| `--overlay-photo` | `rgb(23 16 12 / 0.65)` (mínimo de `palette.md` para texto crema sobre foto) | igual | crema 5.39:1 en el peor caso |

---

## 3. Tipografía

### 3.1 Familias elegidas

| Rol | Familia | Pesos cargados | Sustituye a (Chipotle) |
|---|---|---|---|
| Display, titulares, nav, botones, precios, pestañas | **Barlow Condensed** | 600, 700, 800 (normal) | Trade Gothic LT Bold (Condensed No. 20) |
| Texto, labels, badges, eyebrows | **Nunito Sans** (variable) | eje `wght` 400–800, cursiva 400 | Nunito (texto) y Gotham (badges, "FIND A CHIPOTLE") |
| Hand-lettering | **SVG propios** (no fuente) | — | GIF hand-lettering |

**Por qué Barlow Condensed** (frente a Oswald y Anton):
- Es una grotesca condensada de terminales rectos y curvas "cuadradas", la más cercana en proporción y textura a Trade Gothic Bold Condensed No. 20 entre las Google Fonts.
- Tiene 9 pesos más cursivas: permite jerarquía real (800 en display, 700 en titulares y botones, 600 en nav y pestañas) con una sola familia. **Anton** solo existe en un peso (400 muy negro): sirve para un póster, no para un sistema con botones de 16 px.
- **Oswald** (variable 200–700) es más alta y estrecha, con aperturas cerradas; en botones de 16 px se empasta y su tono es más "deportivo / periódico". Barlow tiene esquinas suavemente redondeadas que dan calidez sin perder firmeza.
- Cubre todos los diacríticos del español (Á É Í Ó Ú Ñ Ü ¿ ¡) en mayúsculas.

**Por qué Nunito Sans** (frente a Nunito):
- Mantiene el esqueleto y la calidez de Nunito (la fuente de texto de Chipotle), pero sin terminales redondeados. Nunito redondeada lee "infantil/casual"; Nunito Sans lee editorial, más acorde con una carta premium.
- Variable (un solo archivo para 400–800), muy legible a 14–17 px y con cursiva para citas.
- Cubre el papel de Gotham (badges y microcopy en mayúsculas espaciadas) con su peso 800 + `letter-spacing: 0.08–0.12em`, así se evita cargar una tercera familia (unos 40 KB menos).

### 3.2 Carga

Producción: autoalojadas con Fontsource (sin terceros, funciona igual en Docker y evita peticiones a Google):

```bash
npm i @fontsource/barlow-condensed @fontsource-variable/nunito-sans
```

```ts
// src/styles/fonts.ts (importar en main.ts)
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource-variable/nunito-sans/wght.css";
import "@fontsource-variable/nunito-sans/wght-italic.css";
```

- Subconjunto: solo `latin` (el español no necesita `latin-ext`).
- `font-display: swap` (el valor por defecto de Fontsource).
- Precargar **solo** Barlow Condensed 800 latin (la del H1 del hero, candidata a LCP): `<link rel="preload" as="font" type="font/woff2" href="…/barlow-condensed-latin-800-normal.woff2" crossorigin>`.
- Generar fallbacks con métricas ajustadas con el plugin de Vite `fontaine` para que el cambio de fuente no provoque CLS.
- Prototipos rápidos (no producción): `https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Nunito+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap`.
- Llamar a `ScrollTrigger.refresh()` después de `document.fonts.ready` (ver 9.4): el cambio de fuente altera las alturas.

Pilas de fallback:
- `--font-display: "Barlow Condensed", "Arial Narrow", "Roboto Condensed", sans-serif;`
- `--font-body: "Nunito Sans Variable", "Nunito Sans", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;`

### 3.3 Escala tipográfica

Fluida entre 390 px y 1440 px. Los titulares van en MAYÚSCULAS por CSS (`text-transform: uppercase`); el contenido se escribe en minúsculas normales en el HTML (mejor para lectores de pantalla y SEO).

| Token | Familia / peso | Móvil (390) | Escritorio (1440) | `clamp()` | Interlineado | Tracking | Uso |
|---|---|---|---|---|---|---|---|
| `display` | Barlow C. 800, MAYÚS. | 56 px | 112 px | `clamp(3.5rem, 2.2rem + 5.333vw, 7rem)` | 0.92 | -0.01em | H1 del hero |
| `h1` | Barlow C. 800, MAYÚS. | 48 px | 80 px | `clamp(3rem, 2.257rem + 3.048vw, 5rem)` | 0.95 | -0.01em | H1 de páginas internas |
| `h2` | Barlow C. 700, MAYÚS. | 40 px | 56 px | `clamp(2.5rem, 2.129rem + 1.524vw, 3.5rem)` | 1.0 | 0 | Titular de sección |
| `h3` | Barlow C. 700, MAYÚS. | 30 px | 40 px | `clamp(1.875rem, 1.643rem + 0.952vw, 2.5rem)` | 1.0 | 0 | Nombre de pizza en el grid (como los tiles de Chipotle, 40 px) |
| `h4` | Barlow C. 700, MAYÚS. | 24 px | 28 px | `clamp(1.5rem, 1.407rem + 0.381vw, 1.75rem)` | 1.1 | 0.01em | Titular de card, nombre en lista móvil, título del drawer |
| `h5` | Barlow C. 700, MAYÚS. | 20 px | 22 px | `clamp(1.25rem, 1.204rem + 0.19vw, 1.375rem)` | 1.15 | 0.02em | Nombre del ingrediente en el constructor, ítem del carrito |
| `nav` | Barlow C. 600, MAYÚS. | — | 20 px | `1.25rem` | 1 | 0.02em | Links del header (escritorio) |
| `nav-mobile` | Barlow C. 800, MAYÚS. | 40 px | — | `2.5rem` | 1.05 | 0 | Links del menú a pantalla completa |
| `button-lg` | Barlow C. 700, MAYÚS. | 20 px | 20 px | `1.25rem` | 1 | 0.04em | Botón 56 px |
| `button` | Barlow C. 700, MAYÚS. | 18 px | 18 px | `1.125rem` | 1 | 0.04em | Botón 48 px |
| `button-sm` | Barlow C. 700, MAYÚS. | 16 px | 16 px | `1rem` | 1 | 0.04em | Botón 40 px, pestañas |
| `price` | Barlow C. 700, `tabular-nums` | 22 px | 28 px | `clamp(1.375rem, 1.236rem + 0.571vw, 1.75rem)` | 1 | 0.01em | Precio en card |
| `price-lg` | Barlow C. 800, `tabular-nums` | 28 px | 32 px | `clamp(1.75rem, 1.657rem + 0.381vw, 2rem)` | 1 | 0 | Total del carrito y del constructor |
| `lead` | Nunito Sans 400 | 18 px | 20 px | `clamp(1.125rem, 1.079rem + 0.19vw, 1.25rem)` | 1.55 | 0 | Entradilla bajo H1/H2 |
| `body` | Nunito Sans 400 | 16 px | 17 px | `clamp(1rem, 0.977rem + 0.095vw, 1.0625rem)` | 1.6 | 0 | Texto corrido |
| `body-strong` | Nunito Sans 700 | igual que `body` | | | 1.6 | 0 | Énfasis, links del footer pequeños |
| `sm` | Nunito Sans 400 / 600 | 14 px | 14 px | `0.875rem` | 1.5 | 0 | Descripciones en cards (15 px en escritorio, ver 8.5), ayudas de formulario, kcal |
| `label` | Nunito Sans 700 | 14 px | 14 px | `0.875rem` | 1.3 | 0.01em | Labels de formulario |
| `eyebrow` | Nunito Sans 800, MAYÚS. | 12 px | 13 px | `clamp(0.75rem, 0.727rem + 0.095vw, 0.8125rem)` | 1.2 | 0.12em | Antetítulo de sección ("MASA MADRE · 48 H") |
| `badge` | Nunito Sans 800, MAYÚS. | 12 px | 12 px | `0.75rem` | 1 | 0.08em | Píldoras "Picante", "Veggie", "Nueva" |
| `caption` | Nunito Sans 600 | 12 px | 12 px | `0.75rem` | 1.4 | 0.02em | Legal, notas al pie, nombre bajo ingrediente del marquee |

Reglas tipográficas:
- **Interlineado de titulares:** Chipotle usa 0,79 (48/38). Jorges no baja de 0,92 porque las mayúsculas acentuadas del español (Á, É, Ñ) chocan con la línea de arriba. Probar siempre con "ÁÉÍÓÚÑ" en dos líneas.
- `text-wrap: balance` en h1–h4; `text-wrap: pretty` en párrafos.
- Ancho máximo del texto corrido: `65ch`. Entradillas: `48ch`.
- Precios y cantidades: `font-variant-numeric: tabular-nums` para que no bailen al cambiar.
- Palabra destacada en un titular: `<em>` sin cursiva, con `color: var(--primary)` sobre crema o `color: var(--color-queso-400)` sobre carbón.
- Nunca usar Barlow Condensed por debajo de 16 px ni en párrafos. Nunca Nunito Sans en mayúsculas para más de 4 palabras.
- Color del texto: `--foreground`; nunca `tomate` ni `queso` en párrafos (regla de `palette.md`).

---

## 4. Layout, espaciado y grid

### 4.1 Escala de espaciado

Base de 4 px, idéntica a la de Tailwind v4 (`--spacing: 0.25rem`), así que se usan directamente las utilidades `p-4`, `gap-8`, etc.

| Paso Tailwind | px | Uso típico |
|---|---|---|
| 1 | 4 | Separación icono-badge, offset del foco |
| 2 | 8 | Gap entre icono y texto en botones, entre badges |
| 3 | 12 | Padding vertical de inputs pequeños |
| 4 | 16 | Gutter móvil, padding de ítems de lista, gap del grid en móvil |
| 5 | 20 | Separación entre campos de formulario |
| 6 | 24 | Padding de cards, gutter de tablet, gap del grid en tablet |
| 8 | 32 | Gap del grid en escritorio, padding de cards grandes, gutter de escritorio |
| 10 | 40 | Separación título de sección → contenido en móvil |
| 12 | 48 | Separación título de sección → contenido en escritorio |
| 16 | 64 | Padding vertical de sección en móvil; separación entre filas del grid de pizzas |
| 24 | 96 | Alto de la banda Club Jorges en escritorio |
| 32 | 128 | Padding vertical de sección en escritorio |

Tokens semánticos:
- `--section-y: clamp(4rem, 2.514rem + 6.095vw, 8rem);` (64 → 128 px), padding superior e inferior de cada sección.
- `--stack-title: clamp(2.5rem, 2.314rem + 0.762vw, 3rem);` (40 → 48 px), del bloque de título al contenido.

### 4.2 Contenedores

| Token | Valor | Uso |
|---|---|---|
| `--container` | `1170px` de contenido (el `.contained` de Chipotle) | Todo el contenido por defecto |
| `--container-wide` | `1440px` | Carrusel de temporada, cabecera del marquee |
| `--container-narrow` | `760px` | Texto largo, formularios de checkout (máx. 560 px el formulario en sí) |
| `--gutter` | `16px` (< 640) · `24px` (640–1023) · `32px` (≥ 1024) | Padding lateral del contenedor |

```css
.container { width: 100%; max-width: calc(var(--container) + 2 * var(--gutter)); margin-inline: auto; padding-inline: var(--gutter); }
```

Elementos a sangre (sin contenedor): hero, video del horno, filas del marquee, bandas de color.

### 4.3 Breakpoints

| Nombre | Mín. | Cambios principales |
|---|---|---|
| base | 0 | 1 columna; header 64 px con hamburguesa; grid de pizzas en lista |
| `sm` | 640 px (40rem) | Gutter 24; drawer del carrito pasa de pantalla completa a 440 px |
| `md` | 768 px (48rem) | Grid de pizzas a 2 columnas; cards del constructor a 2 columnas |
| `lg` | 1024 px (64rem) | **Corte de motion "escritorio"**; nav completa en el header 96 px; grid de pizzas a 3 columnas; constructor con preview lateral |
| `xl` | 1280 px (80rem) | Solo ajustes de tamaño de imágenes del hero |
| `2xl` | 1440 px (90rem) | Tope de la escala fluida |

### 4.4 Grid

- 12 columnas. Gap: 16 px (móvil), 24 px (tablet), 32 px (escritorio).
- A 1170 px y 3 columnas, cada columna del grid de pizzas mide (1170 − 2·32) / 3 = **368,67 px**.
- Composiciones de referencia (escritorio): hero texto 6 col + pizza 6 col; constructor 7 col (cards) + 5 col (preview sticky); footer 4 + 3 + 5.

### 4.5 Alturas fijas y capas

| Token | Valor |
|---|---|
| `--header-h` | `64px` (< 1024) · `96px` (≥ 1024) |
| `--tabs-h` | `56px` (barra de pestañas sticky) |
| `--sticky-bar-h` | `72px` (< 1024) · `80px` (≥ 1024) |

| Capa (`z-index`) | Valor |
|---|---|
| Contenido | 0 |
| Comida por encima de titulares (parallax, tabla fijada) | 10 |
| Pestañas sticky | 40 |
| Header | 50 |
| Barra sticky inferior (constructor) | 60 |
| Menú móvil a pantalla completa | 80 |
| Scrim del drawer | 90 |
| Drawer del carrito | 100 |
| Toast | 110 |

---

## 5. Radios, bordes y elevación

### 5.1 Radios

| Token | Valor | Dónde |
|---|---|---|
| `--radius-none` | `0` | Cards, imágenes, fotos, video, drawer, secciones, cards del constructor (igual que Chipotle) |
| `--radius-sm` | `4px` | Botones, inputs, select, textarea, checkbox, stepper de cantidad, toast |
| `--radius-pill` | `9999px` | Badges, pestañas de categoría, control segmentado (Normal/Extra), contador del carrito |
| `--radius-full` | `50%` | Botones de icono redondos (redes sociales), check de selección, sombras CSS elípticas |

### 5.2 Bordes

- Contorno de card: `1px solid var(--border)`.
- Hover de card interactiva (constructor, catering): el borde pasa a `var(--foreground)` (como Chipotle pasa a marrón). Transición `border-color 0.25s`.
- Selección: borde visual de 2 px con `box-shadow: inset 0 0 0 2px var(--primary)` (no se cambia `border-width` para no mover el layout).
- Controles (inputs, outline, checkbox): `1px solid var(--input)`.
- Separador de sección (como la línea gris de Chipotle bajo la barra de Rewards): `1px solid var(--border)`.

### 5.3 Elevación

Casi plana, como Chipotle. Solo cinco sombras, todas con el color `masa-950` (`rgb(23 16 12)`):

| Token | Valor | Uso |
|---|---|---|
| `--shadow-header` | `0 10px 11px -5px rgb(23 16 12 / 0.10)` | Header en estado sólido (valor medido en Chipotle) |
| `--shadow-card` | `0 2px 12px rgb(23 16 12 / 0.06)` | Solo cards de catering (Chipotle "Crowd Pleasers") |
| `--shadow-pop` | `0 8px 24px rgb(23 16 12 / 0.12)` | Toast, tooltip del marquee, dropdowns |
| `--shadow-sticky` | `0 -8px 24px rgb(23 16 12 / 0.08)` | Barra sticky inferior |
| `--shadow-drawer` | `-24px 0 48px rgb(23 16 12 / 0.18)` | Drawer del carrito |

En modo oscuro las sombras no se ven sobre `masa-950`; la elevación se expresa con la superficie (`masa-900`, `masa-800`) y el borde `--border`. No se usan sombras negras.

---

## 6. Iconografía

- **Librería:** [Lucide](https://lucide.dev) (`lucide` o `lucide-static`, importando iconos sueltos para tree-shaking). Trazo lineal, coherente con los iconos SVG lineales de Chipotle.
- **Rejilla:** 24×24, `fill="none"`, `stroke="currentColor"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
- **Grosor:** `stroke-width: 2` para iconos de 16–20 px; `1.75` para 24 px; `1.5` para 32 px o más.
- **Tamaños:** 16 (dentro de badges y botones sm), 20 (botones md/lg, inputs), 24 (header, drawer), 32 (estados vacíos, features).
- **Color:** hereda `currentColor`. Iconos decorativos: `aria-hidden="true"`. Botón solo-icono: `aria-label` obligatorio y área táctil ≥ 44×44 px.

| Uso | Icono Lucide |
|---|---|
| Carrito | `shopping-bag` |
| Elegir local | `map-pin` |
| Cuenta | `user` |
| Menú / cerrar | `menu` / `x` |
| Agregar / quitar | `plus` / `minus` |
| Seleccionado | `check` |
| Flechas de link y carrusel | `arrow-right`, `chevron-left`, `chevron-right`, `chevron-down` |
| Eliminar del carrito | `trash-2` |
| Tiempo de entrega / delivery / retiro | `clock`, `bike`, `store` |
| Picante / veggie / sin gluten | `flame`, `leaf`, `wheat-off` |
| Más pedida | `star` |
| Info / error / éxito | `info`, `circle-alert`, `circle-check` |
| Pausa / reproducción (video, marquee) | `pause`, `play` |

- **Iconos propios** (no existen en Lucide): `pizza-entera`, `porcion`, `horno-lena`, `masa-madre`. Se dibujan en la misma rejilla de 24 px con trazo 1.75 y extremos redondeados, y se guardan en `src/assets/icons/*.svg`.
- **Redes sociales:** Simple Icons (relleno), dentro de círculos de 40 px `--secondary` con icono `--secondary-foreground` de 20 px; área táctil 44 px. Hover: el círculo pasa a `--accent` con icono `--accent-foreground` (Chipotle usa `opacity: .5`; se descarta porque baja el contraste).

---

## 7. Imágenes y assets

### 7.1 Dirección de arte

- **Todo cenital (90°)**: pizzas, porciones e ingredientes. Es lo que permite girar la pizza en el hover (J10), separar porciones (J8) y montar capas en el constructor (J15). Chipotle mezcla ángulos 3/4; Jorges no.
- Luz suave desde arriba a la izquierda; la sombra cae abajo a la derecha.
- Recortes limpios con borde antialiasado (sin halo blanco). Nada de fondos de mesa en los recortes.
- Fotos "con contexto" (mesa, horno, manos) solo en: video del horno, cards de temporada, cabecera de las cards de catering.

### 7.1 b Pack fotorrealista (v2, 2026-10-11)

Fotos con alfa real en `public/assets/jorges/` (mapa en `assets-map.md`; registro tipado `PHOTO` en `src/lib/img.ts`, siempre con `width`/`height` intrínsecos, `decoding="async"` y `loading="lazy"` salvo la pizza del hero, que se precarga con `fetchpriority="high"`).

| Asset | Uso |
|---|---|
| `pizza-base.webp` | Ancla del hero (masa + salsa + mozzarella, `object-fit: contain`, precargada); miniatura de la pizza armada en el carrito |
| `pizza-pepperoni-hero.webp` | Pizza que aterriza en "Del horno a tu mesa"; foto de la Pepperoni en la carta |
| `pizza-margherita.webp` | "Seis caminos": una sola descarga cortada en 6 cuñas con `clip-path` estático (sustituye a las 6 porciones planas); cabecera de la card "Eventos"; respaldo fotográfico de la carta |
| `pizza-<slug>.webp` + `pizza-<slug>-640.webp` | Carta, novedades y carrito (`catalogImage()`, `srcset` 640w/original); el slug de la API se resuelve en `src/lib/visualAssets.ts` |
| `slice-pepperoni.webp` | Entrada lateral (scrub) al llegar a "Seis caminos" (solo escritorio); cabecera de la card "Pedidos para empresas" |
| `ingredient-*.webp` (20) | Hero (pepperoni, albahaca, champiñón y tomate: 12 piezas escritorio / 7 móvil en 3 planos), parallax de "Ingredientes de verdad" y miniaturas de la cinta (`PHOTO_BY_SLUG`) |
| `oven-wood-fired.webp` | Boca del horno en "Horno de leña" |
| `builder-*.webp` | Ilustraciones de "Arma tu pizza" (base, queso, 3 salsas y 20 ingredientes); respaldo: el SVG plano de `public/assets/ingredients/` y `public/assets/pizzas/salsa.svg` |

Reglas: las ilustraciones planas solo quedan en el constructor y **nunca comparten encuadre con una foto**; la carta, las novedades y el carrito son estrictamente fotográficos (sin respaldo SVG). Las fotos no llevan fondo, máscara rectangular ni `filter: drop-shadow`: la sombra es un elemento hermano (7.3).

### 7.2 Formatos y presupuestos

| Asset | Tamaño en pantalla (escritorio / móvil) | Exportar (2x) | Formato | Peso máx. | Sombra |
|---|---|---|---|---|---|
| Base del hero (masa con salsa, sin toppings) | 560 / 300 px de diámetro | 1120×1120 | WebP con alfa, calidad 80 (+ AVIF opcional en `<picture>`) | 180 KB | **Sin sombra** (sombra CSS animable) |
| Ingredientes del hero (14 piezas) | 40–100 / 24–56 px | ancho ×2, lienzo ajustado | WebP alfa q80 | 25 KB c/u | Sin sombra |
| Pizza del grid ("Las favoritas", menú) | 300 / 112 px | 640×640 | WebP alfa q80 | 70 KB | **Horneada** (suave, abajo-derecha, ≤ 12 % del diámetro) |
| Porciones de J8 (6 cuñas) | pizza de 640 / 300 px | **lienzo común 1280×1280** por porción | WebP alfa q80 | 60 KB c/u | Sin sombra |
| Ingrediente del marquee | 160 / 112 px (md), 120 / 88 px (sm) | 360×360 | WebP alfa q80 | 30 KB | Horneada |
| Ingrediente de card del constructor | 160 px de ancho (se sale por la izquierda) | 400×400 | WebP alfa q80 | 35 KB | Horneada |
| **Capa** del ingrediente en la preview del constructor | 360 / 96 px | 720×720 (lienzo = pizza) | WebP alfa q75 | 60 KB | Sin sombra |
| Tabla de madera + pizza (J7) | 640 / 320 px de ancho | 1280 de ancho | WebP alfa q80 | 160 KB | Horneada |
| Hojas/tomates del parallax (J4) | 64–160 px | ×2 | WebP alfa q80 | 25 KB c/u | Horneada |
| Foto de card de temporada | 368×276 (4:3) | 736×552 | WebP q78 | 90 KB | — |
| Cabecera de card de catering | 568×220 | 1136×440 | WebP q78 | 110 KB | — |
| Video del horno | a sangre, 1920×1080 / 720×1280 | — | MP4 H.264 + WebM VP9, 10 s en bucle, sin audio | 4 MB / 1,5 MB | Póster WebP 1920 de ancho, 150 KB |

Presupuesto total del primer viewport (hero): **≤ 450 KB** de imágenes.

### 7.3 Por qué hay dos tipos de sombra

- **Horneada en el WebP** para todo lo que no se mueve (grid, marquee, constructor, tabla). Es lo que hace Chipotle y no cuesta nada al navegador.
- **Sombra CSS separada** para lo que flota o se desplaza (hero, porciones): un elemento hermano con `background: radial-gradient(ellipse at center, rgb(23 16 12 / 0.45) 0%, rgb(23 16 12 / 0) 70%)`, al que GSAP anima `scale` y `opacity` (patrón `updown` + `shadow` de Chipotle, A4).
- **Prohibido** `filter: drop-shadow()` en elementos animados: obliga a repintar en cada frame.

### 7.4 Reglas de recorte para porciones y capas

- Las 6 porciones de J8 se cortan **de la misma foto cenital** y se exportan **cada una en un lienzo de 1280×1280 con el centro de la pizza en el centro del lienzo** (el resto transparente). Así todas se apilan con `position: absolute; inset: 0` y `transform-origin: 50% 50%`, y encajan al píxel. Cortes a las 12 en punto y cada 60° en sentido horario.
- Las capas del constructor (un ingrediente repartido sobre un lienzo del tamaño de la pizza) también comparten lienzo 720×720 y centro, para apilarlas sin cálculos.

### 7.5 Marcado

```html
<img src="/assets/jorges/pizza-margherita.webp" width="320" height="320"
     alt="Pizza margherita vista desde arriba" loading="lazy" decoding="async">
```

- Siempre `width` y `height` (evita CLS). `loading="lazy"` salvo en el hero; la base del hero lleva `fetchpriority="high"` y un `<link rel="preload" as="image" type="image/webp">`.
- Recortes decorativos (hojas del parallax, ingredientes del hero): `alt=""`.
- Rutas reales: fotos e ilustraciones del pack en `/assets/jorges/` (ver 7.1 b y `assets-map.md`); respaldos SVG planos del constructor en `/assets/ingredients/{slug}.svg` y `/assets/pizzas/salsa.svg`. La API sigue devolviendo `/assets/pizzas/{slug}.webp` e `/assets/ingredients/{slug}.webp`, que el cliente resuelve al pack (`src/lib/visualAssets.ts`). El lettering es SVG inline.

### 7.6 Texturas y separadores

- **Grano de papel** en secciones `--muted`: un WebP de 512×512 en mosaico, con ruido en `masa-950` al 4–6 % de alfa ya aplicado en el archivo, usado como `background-image` sobre `background-color: var(--muted)`. Sin `mix-blend-mode` (encarece el scroll).
- **Borde rasgado** (J14, equivale al `tear-desktop.png` de Chipotle): SVG inline de 48 px de alto (escritorio) / 24 px (móvil), `preserveAspectRatio="none"`, `fill="currentColor"`, con `color` igual al fondo de la sección a la que pertenece. Va en el borde superior de la sección, `position: absolute; top: -47px` (solapa 1 px para no dejar rendija). Tres variantes de trazado para no repetir.

### 7.7 Hand-lettering

- Frases v1: "Masa madre, 48 horas" (sección ingredientes), "Horno de leña a 450 °C" (video), "Del horno a tu mesa" (tabla).
- Producción: el diseñador las traza como **trazos de línea central (no contornos rellenos)** en un `viewBox` de 1000 de ancho, `stroke-width="8"`, `stroke-linecap="round"`, `stroke="currentColor"`, `fill="none"`, un `<path>` por trazo en orden de escritura. Solo así DrawSVG las "escribe".
- Color: `tomate-600` sobre crema/muted; `masa-50` o `queso-400` sobre carbón y video.
- Accesibilidad: `<h2><span class="sr-only">Del horno a tu mesa</span><svg aria-hidden="true" class="lettering">…</svg></h2>`.
- Mientras no existan los SVG: maqueta con Caveat Brush (Google Fonts) **solo en prototipos**; nunca se carga en producción.

---

## 8. Componentes

Todos los componentes usan tokens semánticos (`var(--primary)`, `bg-surface`…), nunca hex sueltos.

### 8.1 Header (J1)

| Propiedad | Valor |
|---|---|
| Posición | `position: fixed; inset-inline: 0; top: 0; z-index: 50` |
| Alto | 96 px (≥ 1024) / 64 px (< 1024) |
| Estado sobre el hero | Fondo transparente, contenido en `masa-50` (el hero es `data-theme="dark"`) |
| Estado `.is-solid` | Capa `::before` con `background: var(--surface)`, `border-bottom: 1px solid var(--border)` y `box-shadow: var(--shadow-header)`, que entra con `opacity 0 → 1` en 0,3 s; el texto pasa a `--foreground` (`color 0.3s`) |
| Páginas sin hero | El header nace con `.is-solid` y el `<main>` lleva `padding-top: var(--header-h)` |
| Ocultar/mostrar | Sube `yPercent: -100` al bajar (con scroll > 120 px) y vuelve al subir; ver receta en 9.5 (sección 0) |
| Contenido escritorio | Grid `auto auto 1fr auto`: logo (56×56) · nav (gap 40 px) · hueco · acciones (gap 32 px) |
| Nav | Menú · Arma tu pizza · Club Jorges · Nosotros · Locales — token `nav` |
| Hover de link | Barra de 20×3 px bajo el texto (8 px de separación), `--primary`, `scaleX(0 → 1)` desde la izquierda en 0,25 s `power2.out` |
| Link activo | Texto `--primary-text` + la barra visible (igual que Chipotle en `/values`); `aria-current="page"` |
| Acciones | "Elige tu local" (`map-pin` 20 + token `badge` a 13 px), "Ingresar" (`user`), carrito (`shopping-bag` 24 en botón 44×44) |
| Contador del carrito | Círculo de 20 px, `--accent` con texto `--accent-foreground`, Nunito Sans 800 12 px, `top: -4px; right: -4px`; oculto si el carrito está vacío |
| Móvil (< 1024) | Logo 44×44 a la izquierda; a la derecha carrito y hamburguesa (44×44 cada uno, gap 8) |
| Logo | Logotipo del pack (`public/assets/jorges/logo-jorges-*.svg`) **recoloreado a tokens** e inline (`LOGO_SVG` en `src/lib/icons.ts`, viewBox recortado al contenido): símbolo en `--logo-mark` y wordmark en `currentColor`. Sobre el hero: `tomate-400` + `masa-50` (variante oscura); con `.is-solid`: `--primary` + `--foreground` (variante clara). Alto 36 px (≥ 1024) / 30 px. Los `#D65D34` / `#F6E9D4` del pack no se usan. Enlaza a `/` con `aria-label="Jorges, inicio"` |
| Legibilidad sobre el hero | `::after` con degradado `masa-950` 70 % → 0 dentro del alto del header (sin desbordar, para no asomar al ocultarse); desaparece con `.is-solid`. Ninguna pieza flotante del hero se coloca en la franja del header |

### 8.2 Menú móvil a pantalla completa (J16)

- `position: fixed; inset: 0; z-index: 80; data-theme="dark"; background: var(--color-masa-900)`.
- Barra superior igual que el header móvil, con `x` en lugar de hamburguesa.
- Links con token `nav-mobile` (40 px, Barlow 800), uno por línea, gap 8 px, padding lateral 16 px, empezando a 96 px del borde superior. Activo en `queso-400`.
- Debajo: "Elige tu local", "Ingresar" (Nunito Sans 700 18 px, `masa-300`) y la banda Club Jorges compacta (botón queso de ancho completo).
- Abre con `aria-expanded` en la hamburguesa, atrapa el foco, cierra con `Esc` y bloquea el scroll del body (`lenis.stop()` si Lenis está activo).

### 8.3 Botones

**Anatomía común**

| Tamaño | Alto | Padding horizontal | Texto | Icono | Uso |
|---|---|---|---|---|---|
| `lg` | 56 px | 32 px | `button-lg` 20 px | 20 px | CTA del hero, "Agregar al pedido", "Ir a pagar" |
| `md` (por defecto) | 48 px | 24 px | `button` 18 px | 20 px | General |
| `sm` | 40 px | 16 px | `button-sm` 16 px | 16 px | Dentro de cards, banda Club |
| `icon` | 40×40 (`sm`) / 44×44 | 0 | — | 20 px | "+" de las cards, cerrar |

`border-radius: 4px`, gap icono-texto 8 px, `white-space: nowrap`, área táctil mínima 44 px de alto (en `sm` se amplía con un `::after` invisible).

**Variantes**

| Variante | Reposo | Barrido de hover | Dónde |
|---|---|---|---|
| **Primario** | `--primary` + texto `--primary-foreground` | `--primary-hover` | Un solo CTA por vista: "Pide ahora", "Agregar al pedido", "Ir a pagar" |
| **Secundario** | `--secondary` + `--secondary-foreground` | `--secondary-hover` (`masa-700`; en ámbito oscuro `masa-200`) | "Ver menú", "+" de las cards, botones de cards de catering |
| **Queso** | `--accent` + `--accent-foreground` | `--accent-hover` (`queso-300`) | Solo sobre fondo tomate o carbón: banda Club Jorges, menú móvil, footer |
| **Outline** | transparente, `1px solid var(--input)`, texto `--foreground` | `--muted` | Acciones terciarias ("Cancelar", "Unirme" en el footer) |
| **Link con flecha** | sin fondo, `button-sm` en `--primary-text`, icono `arrow-right` 16 | la flecha se desplaza `x: 0 → 4px` en 0,25 s | "Ver menú completo →", "Ver todos los ingredientes →" |

**Barrido de color (J11, adaptación de A6).** Chipotle anima `background-position` (repinta). Jorges usa una capa `::before` con `scaleX`, que solo compone:

```css
.btn { position: relative; isolation: isolate; overflow: hidden; background: var(--btn-bg); color: var(--btn-fg);
       transition: transform var(--dur-1) var(--ease-standard); }
.btn::before { content: ""; position: absolute; inset: 0; z-index: -1; background: var(--btn-hover);
               transform: scaleX(0); transform-origin: right center;
               transition: transform var(--dur-2) var(--ease-standard); }
@media (hover: hover) and (pointer: fine) {
  .btn:hover::before { transform: scaleX(1); transform-origin: left center; } /* entra por la izquierda, sale por la derecha */
}
.btn:active { transform: scale(0.98); }
.btn-primary   { --btn-bg: var(--primary);   --btn-fg: var(--primary-foreground);   --btn-hover: var(--primary-hover); }
.btn-secondary { --btn-bg: var(--secondary); --btn-fg: var(--secondary-foreground); --btn-hover: var(--secondary-hover); }
.btn-queso     { --btn-bg: var(--accent);    --btn-fg: var(--accent-foreground);    --btn-hover: var(--accent-hover); }
.btn-outline   { --btn-bg: transparent;      --btn-fg: var(--foreground);           --btn-hover: var(--muted); border: 1px solid var(--input); }
```

Duración del barrido: 0,25 s (Chipotle 0,12 s; se alarga para que se perciba como gesto premium).

**Estados**
- Foco: `outline: 2px solid var(--ring); outline-offset: 2px` (ya en `palette.css`), solo con `:focus-visible`.
- Pulsado: `scale(0.98)` en 0,12 s.
- Deshabilitado: fondo `--muted`, texto `--muted-foreground` (5.95:1), sin barrido, `cursor: not-allowed`, `aria-disabled="true"`.
- Cargando: el icono se sustituye por un spinner de 16 px (rotación CSS 0,8 s lineal), el texto se mantiene, `aria-busy="true"`, sin cambio de ancho.

### 8.4 Badges

Píldora `height: 24px; padding: 0 10px; border-radius: 9999px;` texto `badge` (Nunito Sans 800, 12 px, MAYÚS., `0.08em`), icono opcional de 12 px con gap 4 px.

| Badge | Fondo | Texto | Icono |
|---|---|---|---|
| Picante | `tomate-100` | `tomate-800` (7.99:1) | `flame` |
| Veggie | `albahaca-100` | `albahaca-800` (7.83:1) | `leaf` |
| Nueva | `queso-100` | `queso-800` (7.68:1) | — |
| Más pedida | `--accent` | `--accent-foreground` (10.12:1) | `star` |
| Sin gluten (opción) | `masa-100` | `masa-600` (5.95:1) | `wheat-off` |
| Agotado | `--muted` | `--muted-foreground` | — |
| Hero ("De temporada") | `--accent` | `--accent-foreground` | — (alto 32 px, padding 0 14 px, 13 px) |

Máximo 2 badges por card.

### 8.5 Card de pizza (grid del menú y "Las favoritas")

Basada en los tiles del menú de Chipotle (sin fondo de card, comida recortada grande, nombre enorme) más precio siempre visible.

**Escritorio y tablet (≥ 768 px)**, columna centrada:
1. Imagen: contenedor `aspect-ratio: 1; max-width: 320px; margin-inline: auto`, `<img>` con `object-fit: contain`.
2. Badges: fila centrada, `margin-top: 16px`, gap 8 px.
3. Nombre: `h3` (40 px escritorio), centrado, `margin-top: 8px`. Es un `<a>` al constructor precargado con esa pizza (`/arma-tu-pizza?base={slug}`) cuyo `::after` cubre toda la card (card clicable sin anidar interactivos).
4. Descripción: `sm` a 15 px en escritorio, `--muted-foreground`, centrada, `max-width: 32ch`, 2 líneas máx. (`line-clamp: 2`), `margin-top: 8px`.
5. Fila de precio: `margin-top: 16px`, flex centrado, gap 16 px: precio (`price`, `--foreground`; sobre carbón `queso-400`) + botón `icon` secundario 40×40 con `plus` (`aria-label="Agregar Margherita al pedido"`, `position: relative; z-index: 1` para quedar por encima del `::after`).
6. "Personalizar →": link con flecha en `--primary-text`, `margin-top: 12px`, oculto en reposo (`opacity: 0; translateY(8px)`) y visible en hover/focus-within (J10). En dispositivos táctiles se muestra siempre.

Grid: 3 columnas (≥ 1024), 2 columnas (768–1023), gap de columnas 32 px y de filas 64 px.

**Móvil (< 768 px)**, fila de lista (como Chipotle en móvil):
- `display: grid; grid-template-columns: 112px 1fr auto; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--border)`.
- Imagen 112×112 · bloque de texto (badges, nombre en `h4` 24 px, descripción 14 px en 1 línea) · columna derecha con precio (`price` 22 px) encima del botón "+".

### 8.6 Pestañas de categoría

- Barra `position: sticky; top: var(--header-h); z-index: 40; height: 56px; background: var(--background); border-bottom: 1px solid var(--border)`. Cuando el header se oculta, la barra sube con él (`translateY(calc(-1 * var(--header-h)))`, misma duración y ease que el header).
- Pestaña: `height: 40px; padding: 0 20px; border-radius: 9999px;` texto `button-sm` (Barlow 600, 16 px). Inactiva: transparente, `1px solid var(--border)`, texto `--foreground`; hover `--muted`. Activa: indicador `--secondary` con texto `--secondary-foreground`.
- El indicador activo es un único elemento que se mueve entre pestañas con Flip (0,4 s `power2.inOut`, ver 9.6).
- Móvil: scroll horizontal con `scroll-snap-type: x mandatory`, sin barra de scroll visible, máscara de degradado de 24 px en los bordes (`mask-image`), y la pestaña activa se centra con `scrollIntoView({ inline: "center" })`.
- Accesibilidad: si filtran en la misma página, `role="tablist"` / `role="tab"` / `aria-selected` y flechas izquierda/derecha; si son anclas, `<nav>` con links y `aria-current`.
- Categorías v1: Clásicas · De la casa · Blancas · Veganas · Para picar · Postres y bebidas.

### 8.7 Sección "Arma tu pizza": card de ingrediente (J15, adaptación de A14)

| Propiedad | Valor |
|---|---|
| Caja | `position: relative; overflow: hidden; height: 128px` (escritorio) / `112px` (móvil); `background: var(--surface); border: 1px solid var(--border); border-radius: 0` |
| Imagen | `<img>` 160×160 en `position: absolute; left: -48px; top: 50%; translate: 0 -50%` (escritorio) / 136×136 y `left: -40px` (móvil): el ingrediente se sale por el borde izquierdo, como en Chipotle |
| Texto | `padding-left: 128px` (escritorio) / `108px` (móvil), `padding-right: 16px`, centrado en vertical: nombre `h5` + meta `sm` en `--muted-foreground` ("+ $1.500 · 80 kcal") |
| Hover | `border-color: var(--foreground)` en 0,25 s |
| Seleccionada | `box-shadow: inset 0 0 0 2px var(--primary)`; círculo de 24 px `--primary` con `check` 16 px en `--primary-foreground`, `top: 8px; right: 8px`, que entra con `scale 0 → 1` en 0,3 s `back.out(1.7)`; aparece el control segmentado "Normal / Extra" |
| Agotada | Imagen al 40 % de opacidad, badge "Agotado", no seleccionable |
| Control segmentado | Píldora de 32 px de alto, 2 opciones, `border: 1px solid var(--input)`; opción activa con fondo `--secondary` |
| Marcado | `<label>` que envuelve un `<input type="checkbox">` (o `radio` en pasos de opción única: tamaño, masa, salsa) visualmente oculto; foco visible en la card con `:has(:focus-visible)` |
| Grid | 2 columnas (≥ 768) con gap 16 px; 1 columna en móvil |

**Página del constructor:**
- Escritorio: 7 columnas para los pasos (1. Tamaño · 2. Masa · 3. Salsa · 4. Queso · 5. Ingredientes · 6. Extras), cada uno con eyebrow "Paso 2 de 6" + `h3`; 5 columnas para la **preview**: pizza de 360 px en `position: sticky; top: calc(var(--header-h) + 24px)`, formada por la base y una capa WebP por ingrediente (7.4) apiladas.
- Selector de tamaño: 3 cards de radio de 1/3 de ancho, cada una con un círculo SVG a escala (25 / 33 / 40 cm), nombre y precio.
- **Barra sticky inferior** (`position: sticky; bottom: 0; z-index: 60; height: var(--sticky-bar-h); background: var(--surface); border-top: 1px solid var(--border); box-shadow: var(--shadow-sticky)`): resumen "Tu pizza · 6 ingredientes" (`sm`), total (`price-lg`) y botón primario `lg` "Agregar al pedido · $X". En móvil incluye a la izquierda una mini-preview de 56 px (la preview lateral no existe en móvil) y el botón pasa a `md`.

### 8.8 Drawer del carrito

| Propiedad | Valor |
|---|---|
| Panel | `position: fixed; top: 0; right: 0; height: 100dvh; width: 440px` (≥ 640) / `100vw` (< 640); `background: var(--background); box-shadow: var(--shadow-drawer); z-index: 100` |
| Scrim | `position: fixed; inset: 0; background: var(--scrim); z-index: 90`; clic cierra |
| Cabecera | 72 px, padding 0 24 px, `border-bottom: 1px solid var(--border)`: "Tu pedido (3)" en `h4` + botón `x` 44×44 |
| Ítem | Grid `72px 1fr auto`, gap 16 px, padding 16 px 24 px, separador `--border`: miniatura recortada 72×72 · nombre `h5` + modificadores `sm` atenuados + stepper · precio `price` a 20 px + link "Quitar" (`sm`, `--primary-text`) |
| Stepper | 36 px de alto, `border: 1px solid var(--input); border-radius: 4px`, botones `minus`/`plus` de 36×36 (área táctil 44 con `::after`) y número `tabular-nums` de 32 px de ancho; `aria-label` "Quitar una" / "Agregar una"; el número con `aria-live="polite"` |
| Pie (sticky) | padding 24 px, `border-top: 1px solid var(--border)`: subtotal y envío (`body`, filas flex), total (`price-lg`), botón primario `lg` de ancho completo "Ir a pagar", nota legal en `caption` |
| Vacío | Icono `shopping-bag` 32 px en `--muted-foreground`, "Tu pedido está vacío" (`h4`), "Elige tu pizza favorita o ármala a tu gusto" (`body`), botón secundario "Ver menú" |
| Accesibilidad | `role="dialog" aria-modal="true" aria-labelledby`; foco al botón cerrar al abrir y de vuelta al botón del carrito al cerrar; `inert` en el resto de la página; `Esc` cierra |
| Motion | Ver 9.6 |

### 8.9 Toast

`position: fixed; bottom: 24px;` centrado en móvil, a la derecha (`right: 24px`) en escritorio; `min-height: 48px; padding: 12px 16px; max-width: 400px; border-radius: 4px; background: var(--secondary); color: var(--secondary-foreground); box-shadow: var(--shadow-pop)`. Icono `circle-check` 20 px en `albahaca-400`. Texto `body-strong` a 15 px + link opcional "Ver pedido" en `queso-300`. Visible 3 s; `role="status"` / `aria-live="polite"`.

### 8.10 Hero (estructura; la animación está en 9.5, sección 1)

- `<section class="hero" data-theme="dark">`, `background: var(--color-masa-900)`, `height: 100svh; min-height: 640px` (escritorio) / `min-height: 600px` (móvil).
- Escritorio: grid de 12 columnas dentro de `--container`. Texto en columnas 1–6, alineado al centro vertical con `padding-top: var(--header-h)`; pizza en columnas 6–12, contenedor `.hero__pizza` de `width: min(560px, 42vw); aspect-ratio: 1`.
- Móvil: texto arriba (padding-top `header-h + 24px`), pizza de 300 px centrada abajo.
- Contenido: badge "De temporada" · eyebrow "Masa madre · 48 h de fermentación" en `queso-400` · H1 `display` en `masa-50` ("Pizza napolitana al horno de *leña*", con *leña* en `queso-400`) · `lead` en `masa-300`, `max-width: 40ch` · botones primario `lg` "Pide ahora" + secundario `lg` "Ver menú" (en ámbito oscuro el secundario es crema), gap 16 px.
- El H1 es visible desde el primer frame (es el LCP): nunca se oculta para animarlo.
- **v2 (pack fotorrealista, vigente):** la pizza es `pizza-base.webp` y `.hero__pizza` pasa a `width: min(600px, 43vw); aspect-ratio: 1377 / 1142` (móvil `min(320px, 80vw)`) con la foto en `contain` y sombra de contacto aparte. Capas: pizza (z 1) < todos los ingredientes (z 2) < texto (z 3) < header (z 50). En reposo los ingredientes flotan (amplitud 6 / 10 / 16 px según plano, la albahaca oscila ±18°) y, en escritorio con ratón, los planos siguen al puntero 6 / 14 / 26 px. Con scroll (pin `+=150%` escritorio / `+=70%` móvil, scrub) aterrizan sobre la masa mientras la pizza pasa de `scale 0.9` a su tamaño final. Reduce: pizza ya armada, estática y sin pin. Detalle en 9.5, sección 1.

### 8.11 Banda Club Jorges (equivale a la barra de Rewards)

- `background: var(--primary)`; texto `masa-50`. Alto 96 px en escritorio (contenido en una línea, centrado, gap 24 px); en móvil padding 32 px 16 px y contenido apilado y centrado.
- Contenido: sello del club (48 px, SVG en `queso-400`) · "Únete a Club Jorges. Tu 5.ª pizza va por nuestra cuenta" (`h4` a 28 px) · botón queso `sm` "Unirme" · "o **ingresa**" (`body`, enlace subrayado en `masa-50`).

### 8.12 Encabezado de sección

Patrón reutilizable: eyebrow (`--accent-text` sobre crema; `queso-400` sobre carbón) → `h2` (`margin-top: 8px`) → `lead` opcional en `--muted-foreground` (`margin-top: 16px`). En escritorio, link con flecha alineado a la derecha en la misma fila que el `h2`. Separación al contenido: `--stack-title`.

### 8.13 Card de temporada (carrusel, J12)

- Ancho 368 px (3 visibles en 1170 con gap 32) / 82 % del viewport en móvil (asoma la siguiente).
- Foto 4:3 a sangre (`object-fit: cover`, radio 0) · cuerpo `background: var(--surface)`, padding 24 px: nombre `h4`, descripción `sm` atenuada, fila con precio `price` + link "Pedir →".
- Sin borde ni sombra (como las meal-cards de Chipotle).

### 8.14 Card de catering / pedidos grupales

- 2 columnas (≥ 768), gap 32 px; `background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-card)`.
- Cabecera de foto de 220 px con capa `--overlay-photo` (65 %) y título `h3` en `masa-50` abajo a la izquierda (padding 24 px).
- Cuerpo padding 32 px: lista de 3 puntos (`body`, icono `check` 20 px en `--accent-text`, gap 12 px) y botón secundario `lg` de ancho completo ("Cotizar evento").

### 8.15 Footer

- `data-theme="dark"`, `background: var(--color-masa-950)`, borde rasgado arriba (7.6). Padding `--section-y` arriba y 48 px abajo.
- Escritorio: grid 4 + 3 + 5.
  - Col. 1: links grandes (Barlow 700, 28 px, MAYÚS., `masa-50`, gap 12 px): Pedir · Arma tu pizza · Locales · Club Jorges · Trabaja con nosotros.
  - Col. 2: links pequeños (`body-strong` 16 px, `masa-300`, gap 12 px): Nosotros · Ingredientes · Alérgenos · Preguntas frecuentes · Contacto.
  - Col. 3: bloque Club: eyebrow "Club Jorges" en `queso-400`, `h3` "Tu 5.ª pizza va por nuestra cuenta", `body` en `masa-300`, botón outline `md` "Unirme".
  - Hover de links: `queso-400` en 0,2 s.
- Fila de redes (círculos de 40 px, 6.2), margen superior 48 px.
- Barra legal: `background: var(--color-masa-900)`, 56 px de alto, `caption` a 14 px en `masa-300`: © Jorges · Términos · Privacidad · Cookies.
- Móvil: una columna, en el orden 1 → 3 → 2, separación de 40 px.

### 8.16 Formularios (checkout, reservas, club)

| Elemento | Valor |
|---|---|
| Label | Encima del campo, `label` (Nunito Sans 700, 14 px), `--foreground`, `margin-bottom: 8px`. Opcional marcado con "(opcional)" en `--muted-foreground`; los obligatorios no llevan asterisco |
| Input / select | `height: 48px; padding: 0 16px; border-radius: 4px; background: var(--surface); border: 1px solid var(--input);` texto 16 px (evita el zoom de iOS) |
| Placeholder | `--muted-foreground` (5.12:1 sobre harina); nunca sustituye al label |
| Foco | `border-color: var(--ring)` + `outline: 2px solid var(--ring); outline-offset: 2px` |
| Textarea | `min-height: 120px; padding: 12px 16px; resize: vertical` |
| Ayuda | `sm` en `--muted-foreground`, `margin-top: 6px`, enlazada con `aria-describedby` |
| Error | Borde `--danger`, mensaje `sm` en `--danger-text` con icono `circle-alert` 16 px, `aria-invalid="true"`; se valida al salir del campo y al enviar; el primer campo con error recibe el foco |
| Checkbox / radio | 20×20, borde `--input`, radio 4 px (checkbox) / 50 % (radio); marcado con fondo `--primary` y `check` en `--primary-foreground`; label a 12 px; fila de 44 px |
| Card de radio (Delivery / Retiro) | Como la card del constructor sin imagen: 72 px, icono `bike` / `store` 24 px, título `h5`, texto `sm`; selección con `inset 0 0 0 2px var(--primary)` |
| Espaciado | 20 px entre campos; 40 px entre grupos (`<fieldset>` con `<legend>` en `h5`); ancho máximo 560 px |
| Envío | Botón primario `lg` de ancho completo en móvil, ancho automático en escritorio |

---

## 9. Motion

### 9.1 Principios

1. **Comida con física, interfaz rápida.** Lo que se mueve con el scroll (comida) usa scrub con inercia (0,8–1 s). La interfaz (hover, drawer, toasts) responde en 0,12–0,5 s.
2. **Solo `transform` y `opacity`** en todo lo que se anima por frame (detalle en 9.7).
3. **El contenido nunca depende de la animación.** Sin JavaScript, o con `prefers-reduced-motion`, todo está visible y en su estado final.
4. **Un efecto protagonista por sección.** No se combinan pin y parallax pesado en la misma pantalla.
5. Chipotle no usa GSAP (A1–A15 son CSS, IntersectionObserver y JS propio); aquí **todo** lo que va ligado al scroll se hace con GSAP + ScrollTrigger; los hovers simples siguen siendo CSS.

### 9.2 Tokens de motion

**Duraciones**

| Token | Segundos | Uso |
|---|---|---|
| `--dur-1` | 0.12 | Pulsado de botón, feedback inmediato |
| `--dur-2` | 0.25 | Hovers, barrido de botón, aparición del CTA de la card, ocultar/mostrar header (0,35) |
| `--dur-3` | 0.4 | Pestañas (Flip), menú móvil (ítems), tooltips, check de selección (0,3) |
| `--dur-4` | 0.6 | Apertura del drawer (0,5), vuelo FLIP del constructor, hover de imagen de pizza (0,5) |
| `--dur-5` | 0.9 | Revelados al entrar en pantalla |
| `--dur-6` | 1.6 | Hand-lettering (DrawSVG) |
| Bucles | 2.4 (semiciclo) | Flotación de comida (J3) |
| Bucles | 40 / 46 / 52 | Una vuelta de cada fila del marquee (Chipotle: 50 s) |

**Easings** (nombre GSAP → equivalente CSS para transiciones)

| Token | GSAP | CSS `cubic-bezier` | Uso |
|---|---|---|---|
| `standard` | `power2.out` | `(0.215, 0.61, 0.355, 1)` | Entradas de UI, revelados, header |
| `emphasis` | `power3.out` | `(0.165, 0.84, 0.44, 1)` | Drawer, hover de imagen, porciones, líneas de SplitText |
| `exit` | `power2.in` | `(0.55, 0.055, 0.675, 0.19)` | Salidas (toast, cerrar menú) |
| `move` | `power2.inOut` | `(0.645, 0.045, 0.355, 1)` | Desplazamientos de A a B: ensamblaje del hero, Flip, indicador de pestañas |
| `float` | `sine.inOut` | `(0.445, 0.05, 0.55, 0.95)` | Flotación de comida |
| `draw` | `power1.inOut` | `(0.455, 0.03, 0.515, 0.955)` | Hand-lettering |
| `pop` | `back.out(1.7)` | `(0.175, 0.885, 0.32, 1.275)` | Contador del carrito, check de selección |
| `linear` | `none` | `linear` | Parallax, marquee, opacidades con scrub |

**Scrub**

| Token | Valor | Uso |
|---|---|---|
| `scrub-direct` | `true` | Parallax y opacidades ligadas al scroll (Chipotle: lineal, sin suavizado) |
| `scrub-smooth` | `0.8` | Hero pinneado |
| `scrub-soft` | `1` | Porciones (J8) |

```ts
// src/motion/tokens.ts
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
  hover: "(hover: hover) and (pointer: fine)",
} as const;
```

### 9.3 Librerías

| Paquete | Uso |
|---|---|
| `gsap@^3.13` | Núcleo + `ScrollTrigger`, `Flip`, `DrawSVGPlugin`, `SplitText` (todos gratuitos desde 3.13, incluidos en el paquete npm `gsap`) |
| `lenis@^1.1` | Scroll suave **solo** en escritorio con puntero fino y sin `reduce`. Chipotle no lo usa; se añade por la sensación premium. En táctil se mantiene el scroll nativo |

No se usan Swiper ni Lottie: el carrusel es `scroll-snap` nativo y el hand-lettering es SVG + DrawSVG.

### 9.4 Inicialización

```html
<!-- en <head>, antes de cualquier CSS: permite ocultar estados iniciales solo si hay JS -->
<script>document.documentElement.classList.add("js")</script>
```

```css
/* Estados iniciales: los fija el CSS para evitar el parpadeo, nunca el HTML */
@media (prefers-reduced-motion: no-preference) {
  .js [data-reveal] { opacity: 0; visibility: hidden; transform: translateY(40px); }
  .js [data-split]  { visibility: hidden; }
}
@media (prefers-reduced-motion: no-preference) and (max-width: 1023.98px) {
  .js [data-reveal] { transform: translateY(24px); }
}
```

```ts
// src/motion/index.ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { mq } from "./tokens";

gsap.registerPlugin(ScrollTrigger, Flip, DrawSVGPlugin, SplitText);
gsap.defaults({ duration: 0.6, ease: "power2.out" });
ScrollTrigger.config({ ignoreMobileResize: true });
if (import.meta.env.DEV && location.search.includes("markers")) ScrollTrigger.defaults({ markers: true });

export const mm = gsap.matchMedia();

export async function initMotion() {
  // 1. Esperar fuentes e imágenes de las secciones pinneadas (start/end dependen de sus alturas)
  await document.fonts.ready;
  await Promise.all(
    [...document.querySelectorAll<HTMLImageElement>("[data-pin-asset]")].map((img) => img.decode().catch(() => {})),
  );

  // 2. Lenis solo en escritorio con ratón y sin reduce
  mm.add(`${mq.desktop} and ${mq.hover} and (prefers-reduced-motion: no-preference)`, () => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    (window as any).__lenis = lenis; // para stop()/start() desde el drawer y el menú móvil
    return () => { gsap.ticker.remove(raf); lenis.destroy(); delete (window as any).__lenis; };
  });

  // 3. Secciones en orden de documento (importante para el cálculo de pins)
  initHeader();      // J1
  initHero();        // J2 + J3
  initReveals();     // J9 + SplitText
  initSlices();      // J8
  initIngredients(); // J5 + J6 + J4
  initOvenVideo();   // J13 + J14 + J5
  initBoard();       // J7

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
```

Si la app es SPA, cada vista crea sus animaciones dentro de `gsap.context()` o `mm.add()` y llama a `revert()` al desmontarse.

### 9.5 Catálogo de efectos de la home, en orden de scroll

| # | Sección | Fondo | Efecto principal | Pin (escritorio / móvil) | Recetas |
|---|---|---|---|---|---|
| 0 | Header (global) | transparente → `surface` | Se oculta al bajar, vuelve al subir; pasa a sólido tras el hero | — | J1 |
| 1 | Hero "La pizza se arma" | `masa-900` (oscuro) | Los ingredientes flotan y, con el scroll, vuelan y se colocan sobre la masa | `+=150%` / `+=70%` | J2, J3 |
| 2 | Banda Club Jorges | `tomate-600` | Revelado simple | — | J9 |
| 3 | Las favoritas (6 pizzas) | `background` | Revelado escalonado + hover que gira la pizza | — | J9, J10 |
| 4 | Una pizza, seis caminos | `muted` | La pizza se abre en 6 porciones = 6 categorías | `+=200%` / `+=120%` | J8 |
| 5 | Ingredientes de verdad | `background` | Titular que se escribe + marquee de 3 filas + hojas en parallax | — | J5, J6, J4 |
| 6 | Horno de leña | video (oscuro) | Video que se asienta (`scale`) + lettering + bordes rasgados | — | J13, J14, J5 |
| 7 | Del horno a tu mesa | `muted` + grano | La tabla con la pizza se queda fija y aterriza sobre el titular | ≈ 700–800 px / sin pin | J7 |
| 8 | De temporada | `background` | Carrusel con arrastre nativo; revelado | — | J12, J9 |
| 9 | Eventos y pedidos grupales | `muted` | Revelado de las dos cards | — | J9 |
| 10 | Footer | `masa-950` (oscuro) | Borde rasgado con parallax leve | — | J14 |

Es el orden propuesto en §9.3 del análisis. El grid de pizzas (3) queda entre los dos pins (1 y 4) a propósito: así hay una sección accionable con precios antes del segundo pin y no se encadenan 3,5 pantallas de scroll pinneado al principio.

---

#### Sección 0 · Header (J1)

| Campo | Valor |
|---|---|
| Ocultar/mostrar | `ScrollTrigger.create({ start: 0, end: "max" })` con `onUpdate` según `self.direction` |
| Umbral | Se oculta solo si `scroll > 120` px y la dirección es hacia abajo |
| Propiedad | `yPercent: 0 → -100`, 0,35 s `power2.out` |
| Sólido | `toggleClass` de `is-solid` cuando el top de la sección 2 pasa por `top+=96` (fin del hero) |
| Excepciones | No se oculta con el menú móvil o el drawer abiertos, ni si el foco está dentro del header |

```ts
function initHeader() {
  const header = document.querySelector<HTMLElement>(".site-header")!;
  const hide = gsap.to(header, { yPercent: -100, duration: 0.35, ease: "power2.out", paused: true });
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      const locked = document.documentElement.classList.contains("is-overlay-open") || header.contains(document.activeElement);
      if (self.direction === 1 && self.scroll() > 120 && !locked) { hide.play(); document.documentElement.classList.add("header-hidden"); }
      else if (self.direction === -1) { hide.reverse(); document.documentElement.classList.remove("header-hidden"); }
    },
  });
  const afterHero = document.querySelector(".club-band");
  if (afterHero) {
    ScrollTrigger.create({ trigger: afterHero, start: "top top+=96", end: "max", toggleClass: { targets: header, className: "is-solid" } });
  }
}
```

Reduce: sin ocultar/mostrar (siempre visible); el cambio a sólido se mantiene (es un cambio de estado, no movimiento).

---

#### Sección 1 · Hero "La pizza se arma" (J2 + J3)

> **Versión vigente: v2 con el pack fotorrealista** (resumen en 8.10). La fuente de verdad es `src/sections/hero.ts`; esta sección describe el comportamiento implementado y sustituye a la primera maqueta (base `base-hero@2x.webp` cenital de 560×560 y 14 piezas planas con `data-from-x/y`), que se descartó.

**Estructura.** Ancla: `pizza-base.webp` (1377 × 1142, masa + salsa + mozzarella, vista frontal ligeramente inclinada) dentro de `.hero__pizza` (`aspect-ratio: 1377 / 1142`, `object-fit: contain`, `fetchpriority="high"` + `<link rel="preload">`). `.hero__pizza` es la caja de medida y nunca se transforma; `.hero__pizza-body` recibe la escala del scroll y `.hero__pizza-float` la flotación en reposo. La sombra de contacto es un elemento hermano (`.hero__pizza-shadow`). Los ingredientes viven en `.hero__field` (capa absoluta sobre todo el hero) agrupados en tres planos `.hero__layer[data-depth]`.

**Piezas.** 12 en escritorio / 7 en móvil, fotos del pack (`PHOTO` en `src/lib/img.ts`): pepperoni ×4, albahaca ×3, champiñón ×3, tomate ×2, repartidas en 3 planos de profundidad. Cada pieza declara su posición de reposo (escritorio en % del hero, móvil en % de la zona de la pizza) y su punto de aterrizaje en el disco unidad de la zona de salsa; los destinos se proyectan sobre la caja `contain` real de la imagen (elipse centro (712, 512), rx 515, ry 345 en píxeles de la imagen) y se aplastan en vertical con `ry/rx ≈ 0.67` para la perspectiva. Envoltorios con un único dueño por transformación: `.hero__ing` (scroll: x, y, scaleX/Y) > `.hero__ing-spin` (giro sobre la masa) > `.hero__ing-idle` (flotación) > `.hero__ing-center` (solo CSS).

**Capas (z).** pizza (1) < todos los ingredientes (2) < texto (3) < header (50, fuera del hero). La profundidad se transmite con tamaño y velocidad, nunca pasando por detrás de la pizza.

**Animación.**

| Campo | Valor |
|---|---|
| Trigger | `.hero`; start `"top top"` (o `"bottom bottom"` si el hero es más alto que la pantalla) |
| End / pin / scrub | `"+=150%"` escritorio, `"+=70%"` móvil / `pin: true`, `anticipatePin: 1` / `scrub: 0.8` escritorio, `0.5` móvil |
| Pizza | `.hero__pizza-body` `scale 0.9 → 1` y su sombra `scale 0.85, opacity 0.75 → 1` en el primer 40 % de la timeline |
| Ingredientes | Vuelan a su destino (x, y, scaleX/Y) y giran hasta la rotación final; los planos cercanos arrancan antes y los lejanos después y más lentos (parallax de velocidad). Sin tweens de opacidad: cada pieza aterriza y se queda |
| Final | `.hero__done` `autoAlpha 0 → 1`, `y 20 → 0` al 80 % |
| Flotación (J3) | En reposo cada `.hero__ing-idle` flota 6 / 10 / 16 px según el plano (×0,6 en móvil) con cabeceo leve; la albahaca oscila ±18°. La pizza flota 8 px (5 en móvil) |
| Puntero | Escritorio con ratón: los planos siguen al puntero 6 / 14 / 26 px, solo en reposo |
| Pausa | Con `progress > 0.02` se pausan flotación y parallax del puntero y los envoltorios vuelven a neutro en 0,3 s; al volver a 0 se reanudan |

Reduce: pizza ya armada (ingredientes colocados en su destino), sin pin, sin flotación ni puntero; se recoloca con `ResizeObserver` si cambia el tamaño.

---

#### Sección 2 · Banda Club Jorges (J9)

Solo revelado (`data-reveal` en el bloque de contenido). Sin pin ni parallax: es una pausa visual entre dos efectos fuertes.

---

#### Sección 3 · Las favoritas (J9 + J10)

**Revelado escalonado (J9, umbral del 80 % medido en Chipotle, A3)**

| Campo | Valor |
|---|---|
| Elementos | `[data-reveal]` (cards, encabezados de sección, bloques de texto en toda la home) |
| Trigger / start | Cada elemento / `"top 80%"`, `once: true` |
| Propiedades | `autoAlpha 0 → 1`, `y 40 → 0` (móvil 24 → 0) |
| Duración / ease / stagger | 0,9 s / `power2.out` / 0,1 s entre elementos que entran juntos |
| Pin / scrub | No / No |

Titulares `h2` con `data-split`: líneas enmascaradas que suben (`yPercent 100 → 0`, 0,9 s `power3.out`, stagger 0,08, start `"top 85%"`, `once`). Un elemento nunca lleva `data-reveal` y `data-split` a la vez.

```ts
function initReveals() {
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: mq.reduce }, (ctx) => {
    if ((ctx.conditions as Record<string, boolean>).reduce) {
      gsap.set("[data-reveal], [data-split]", { clearProps: "all", autoAlpha: 1 });
      return;
    }
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 80%", once: true,
      onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out", stagger: 0.1, overwrite: true }),
    });
    gsap.utils.toArray<HTMLElement>("[data-split]").forEach((h) => {
      SplitText.create(h, {
        type: "lines", mask: "lines", autoSplit: true,
        onSplit(self) {
          gsap.set(h, { visibility: "visible" });
          return gsap.from(self.lines, {
            yPercent: 100, duration: 0.9, ease: "power3.out", stagger: 0.08,
            scrollTrigger: { trigger: h, start: "top 85%", once: true },
          });
        },
      });
    });
  });
}
```

**Hover de la card de pizza (J10).** CSS, solo con `(hover: hover) and (pointer: fine)`:

```css
@media (hover: hover) and (pointer: fine) {
  .pizza-card__img { transition: transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1); }
  .pizza-card:hover .pizza-card__img, .pizza-card:focus-within .pizza-card__img { transform: scale(1.06) rotate(12deg); }
  .pizza-card__cta { opacity: 0; transform: translateY(8px);
                     transition: opacity 0.25s cubic-bezier(0.215, 0.61, 0.355, 1), transform 0.25s cubic-bezier(0.215, 0.61, 0.355, 1); }
  .pizza-card:hover .pizza-card__cta, .pizza-card:focus-within .pizza-card__cta { opacity: 1; transform: none; }
}
```

Escala 1,06 (no 1,1 como Chipotle): con el giro de 12° una pizza cenital ya se percibe "viva", y 1,1 recorta la sombra horneada contra el contenedor.

---

#### Sección 4 · Una pizza, seis caminos (J8)

**Estructura.** Pizza de 640 px (escritorio) / 300 px (móvil) centrada; 6 `<img class="slices__slice">` apiladas (`position: absolute; inset: 0`, lienzo común, ver 7.4) y 6 links de categoría `.slices__label` (`<a href="/menu#clasicas">`), cada uno con `--a` (ángulo del centro de su cuña).

Geometría: cortes a las 12 en punto y cada 60° en sentido horario. En coordenadas de pantalla (0° = derecha, sentido horario), la porción *i* (0–5) tiene su centro en **θᵢ = −60° + 60°·i**.

```css
.slices__label { position: absolute; left: 50%; top: 50%;
  translate: calc(-50% + cos(var(--a)) * var(--rl)) calc(-50% + sin(var(--a)) * var(--rl)); }
.slices { --rl: calc(0.68 * var(--d)); --d: 640px; }
@media (max-width: 1023.98px) { .slices { --d: 300px; } .slices__label { position: static; translate: none; } }
```

Labels: `h4` en `--foreground` + `sm` atenuado ("12 pizzas"), con flecha. En móvil no son radiales: van debajo de la pizza en un grid de 2 columnas (gap 12 px) como chips de 48 px de alto.

| Campo | Valor |
|---|---|
| Trigger | `.slices` |
| Start / end | `"top top"` / `"+=200%"` (escritorio), `"+=120%"` (móvil) |
| Pin / scrub | `pin: true`, `anticipatePin: 1` / `scrub: 1` |
| Porciones | `x: cos θᵢ · R`, `y: sin θᵢ · R`, `rotation: θᵢ · 0.1` (en grados), `ease: "power3.out"`, todas a la vez (posición 0) |
| Radio de separación R | `0.14 × diámetro` (≈ 90 px en escritorio) / `0.10 × diámetro` (30 px en móvil) |
| Labels | `autoAlpha 0 → 1`, `y 16 → 0`, `stagger: 0.1`, desde 0,6 de la timeline |
| Respiro final | 0,3 de timeline vacía para que el estado abierto se lea antes de soltar el pin |
| Teclado | Si el foco entra en la sección antes de que los labels sean visibles, se salta al final del trigger (`st.scroll(st.end)`) |

```ts
function initSlices() {
  const root = document.querySelector<HTMLElement>(".slices");
  if (!root) return;
  mm.add({ desktop: mq.desktop, mobile: mq.mobile, reduce: mq.reduce }, (ctx) => {
    const { desktop, reduce } = ctx.conditions as Record<string, boolean>;
    const slices = gsap.utils.toArray<HTMLElement>(".slices__slice", root);
    const pizza = root.querySelector<HTMLElement>(".slices__pizza")!;
    const R = () => pizza.offsetWidth * (desktop ? 0.14 : 0.1);
    if (reduce) { // estado final estático
      slices.forEach((s, i) => { const t = ((-60 + 60 * i) * Math.PI) / 180; gsap.set(s, { x: Math.cos(t) * R(), y: Math.sin(t) * R() }); });
      return;
    }
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root, start: "top top", end: desktop ? "+=200%" : "+=120%",
        pin: true, anticipatePin: 1, scrub: 1, invalidateOnRefresh: true,
        onToggle: (self) => slices.forEach((s) => (s.style.willChange = self.isActive ? "transform" : "")),
      },
    });
    slices.forEach((s, i) => {
      const deg = -60 + 60 * i, t = (deg * Math.PI) / 180;
      tl.to(s, { x: () => Math.cos(t) * R(), y: () => Math.sin(t) * R(), rotation: deg * 0.1, ease: "power3.out", duration: 1 }, 0);
    });
    tl.from(gsap.utils.toArray(".slices__label", root), { autoAlpha: 0, y: 16, stagger: 0.1, duration: 0.4, ease: "power2.out" }, 0.6)
      .to({}, { duration: 0.3 });
    const onFocus = () => { const st = tl.scrollTrigger!; if (st.progress < 0.95) st.scroll(st.end); };
    root.addEventListener("focusin", onFocus);
    return () => root.removeEventListener("focusin", onFocus);
  });
}
```

Los hilos de queso entre porciones (mencionados en J8) **quedan fuera de v1**.

---

#### Sección 5 · Ingredientes de verdad (J5 + J6 + J4)

Composición: encabezado centrado con el lettering "Masa madre, 48 horas" + `lead` → 3 filas de marquee a sangre (gap vertical 48 px; móvil: 2 filas, 32 px) → link "Ver todos los ingredientes →" → 4–6 piezas de parallax en primer plano (`z-index: 10`), 2 en móvil.

Ítem del marquee: `<figure>` de 160 px (alterna 160/120 para ritmo, como los tamaños sm/md de Chipotle), imagen recortada + `<figcaption>` en `caption` a 13 px `--muted-foreground`, gap horizontal 48 px. Ingredientes v1: mozzarella di bufala, tomate San Marzano, albahaca, prosciutto crudo, rúcula, burrata, aceite de oliva, harina tipo 00, parmigiano, nduja, champiñones, aceitunas taggiasche (vienen de la API, ver 10).

**Hand-lettering (J5)**

| Campo | Valor |
|---|---|
| Elementos | `svg.lettering path` |
| Trigger / start | El SVG / `"top 75%"`, `once: true` |
| Propiedades | `drawSVG: 0 → 100%` |
| Duración / ease / stagger | 1,6 s por trazo / `power1.inOut` / `stagger: { amount: 0.8 }` (total ≤ 2,4 s) |

```ts
function drawLettering(scope: ParentNode = document) {
  gsap.utils.toArray<SVGSVGElement>(".lettering", scope).forEach((svg) => {
    gsap.from(svg.querySelectorAll("path"), {
      drawSVG: 0, duration: 1.6, ease: "power1.inOut", stagger: { amount: 0.8 },
      scrollTrigger: { trigger: svg, start: "top 75%", once: true },
    });
  });
}
```

**Marquee (J6, adaptación de A10)**

| Campo | Valor |
|---|---|
| Estructura | `.marquee__track` por fila con la lista **duplicada** (el segundo juego con `aria-hidden="true"`); cada juego mide al menos 1440 px (si no, se repite) |
| Animación | Filas 0 y 2: `xPercent 0 → -50`; fila 1 al revés (`-50 → 0`). Duración por vuelta 40 / 46 / 52 s, `ease: "none"`, `repeat: -1` |
| Velocidad de scroll | `timeScale = 1 + min(|velocidad| / 400, 3)` (hasta 4×), vuelve a 1 en 0,6 s al terminar el scroll |
| Fuera de pantalla | Pausado (`onToggle`) |
| Hover de fila | `timeScale → 0` en 0,4 s; al salir, `→ 1`. Tooltip con el origen del ingrediente ("Campania, Italia"): `surface`, `shadow-pop`, `sm`, padding 8 px 12 px |
| Botón pausa | Obligatorio (WCAG 2.2.2, el contenido se mueve > 5 s): botón `icon` 44×44 con `pause`/`play` abajo a la derecha de la sección, `aria-pressed` |
| Móvil | 2 filas, sin tooltip |

```ts
function initMarquee(root: HTMLElement) {
  mm.add({ desktop: mq.desktop, reduce: mq.reduce }, (ctx) => {
    if ((ctx.conditions as Record<string, boolean>).reduce) return; // ver fallback en 9.8
    const tracks = gsap.utils.toArray<HTMLElement>(".marquee__track", root).filter((t) => t.offsetParent !== null);
    let userPaused = false;
    const tls = tracks.map((track, i) => {
      const rev = i % 2 === 1;
      return gsap.fromTo(track, { xPercent: rev ? -50 : 0 }, { xPercent: rev ? 0 : -50, duration: 40 + i * 6, ease: "none", repeat: -1, paused: true });
    });
    const setSpeed = (v: number, d: number) => tls.forEach((t) => gsap.to(t, { timeScale: v, duration: d, overwrite: true }));
    ScrollTrigger.create({
      trigger: root, start: "top bottom", end: "bottom top",
      onToggle: (self) => tls.forEach((t) => (self.isActive && !userPaused ? t.play() : t.pause())),
      onUpdate: (self) => { if (!userPaused) setSpeed(1 + Math.min(Math.abs(self.getVelocity()) / 400, 3), 0.2); },
    });
    const onScrollEnd = () => { if (!userPaused) setSpeed(1, 0.6); };
    ScrollTrigger.addEventListener("scrollEnd", onScrollEnd);
    tracks.forEach((track, i) => {
      track.addEventListener("mouseenter", () => !userPaused && gsap.to(tls[i], { timeScale: 0, duration: 0.4, overwrite: true }));
      track.addEventListener("mouseleave", () => !userPaused && gsap.to(tls[i], { timeScale: 1, duration: 0.4, overwrite: true }));
    });
    const btn = root.querySelector<HTMLButtonElement>(".marquee__toggle")!;
    const onBtn = () => { userPaused = !userPaused; btn.setAttribute("aria-pressed", String(userPaused)); tls.forEach((t) => (userPaused ? t.pause() : t.play())); };
    btn.addEventListener("click", onBtn);
    return () => { ScrollTrigger.removeEventListener("scrollEnd", onScrollEnd); btn.removeEventListener("click", onBtn); };
  });
}
```

**Parallax de ingredientes sueltos (J4, adaptación de A8)**

| Campo | Valor |
|---|---|
| Elementos | `[data-speed]` (hojas de albahaca, tomates cherry, pizca de harina), `alt=""`, `pointer-events: none` |
| Trigger / start / end | La sección que los contiene / `"top bottom"` / `"bottom top"` |
| Propiedades | `y: 0 → -speed × alto de la sección` con `speed` entre 0.1 (Chipotle) y 0.35; `rotation: 0 → data-rotate` (hojas: 25°) |
| Ease / scrub | `none` / `true` |
| Móvil | Solo 2 piezas, `speed` máx. 0.15 |

```ts
function initParallax(scope: ParentNode = document) {
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", mobile: mq.mobile }, (ctx) => {
    if (!(ctx.conditions as Record<string, boolean>).motion) return;
    const isMobile = (ctx.conditions as Record<string, boolean>).mobile;
    gsap.utils.toArray<HTMLElement>("[data-speed]", scope).filter((el) => el.offsetParent !== null).forEach((el) => {
      const section = el.closest("section")!;
      const speed = Math.min(parseFloat(el.dataset.speed!), isMobile ? 0.15 : 0.35);
      gsap.to(el, {
        y: () => -speed * section.offsetHeight, rotation: +(el.dataset.rotate ?? 0), ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
      });
    });
  });
}

function initIngredients() {
  const root = document.querySelector<HTMLElement>(".ingredients");
  if (!root) return;
  drawLettering(root);
  initMarquee(root);
  initParallax(root);
}
```

---

#### Sección 6 · Horno de leña (J13 + J14 + J5)

- Sección `data-theme="dark"`, `height: 80svh; min-height: 560px; max-height: 900px`, `overflow: hidden`, video a sangre `object-fit: cover`, capa `--overlay-photo` (65 %) encima y lettering "Horno de leña a 450 °C" en `masa-50` centrado, `width: min(880px, 90vw)`.
- `<video muted loop playsinline preload="none" poster="…">` con `<source>` WebM y MP4 por breakpoint. Botón pausa 44×44 abajo a la derecha (WCAG 2.2.2).
- Bordes rasgados arriba y abajo (7.6).

| Efecto | Trigger | Start / end | Propiedades | Scrub |
|---|---|---|---|---|
| Video que se asienta | la sección | `"top bottom"` / `"top top"` | `scale 1.12 → 1` en el `<video>` | `true` |
| Reproducir solo en pantalla | la sección | `"top bottom"` / `"bottom top"` | `onToggle`: `play()` / `pause()` | — |
| Lettering | el SVG | `"top 60%"`, `once` | `drawSVG 0 → 100%` (receta J5) | — |
| Borde rasgado (J14) | la sección | `"top bottom"` / `"bottom top"` | `y: 0 → -16px` | `true` |

```ts
function initOvenVideo() {
  const root = document.querySelector<HTMLElement>(".oven");
  if (!root) return;
  const video = root.querySelector("video")!;
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: mq.reduce }, (ctx) => {
    if ((ctx.conditions as Record<string, boolean>).reduce) return; // póster estático; el usuario puede pulsar play
    gsap.fromTo(video, { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "top top", scrub: true } });
    ScrollTrigger.create({ trigger: root, start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive && !root.dataset.userPaused ? video.play() : video.pause()) });
    gsap.to(root.querySelectorAll(".tear"), { y: -16, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true } });
    drawLettering(root);
  });
}
```

---

#### Sección 7 · Del horno a tu mesa (J7, adaptación de A11)

**Estructura** (en flujo, de arriba abajo): `.board__plate` (tabla de madera con pizza, 640 px de ancho, `z-index: 10`, con su sombra horneada) → 120 px de aire → `.board__headline` (lettering "Del horno a tu mesa" en `tomate-600` + `lead`) → `.board__slot` (hueco vacío con la misma altura que la tabla, posición final) → texto "Pídela a domicilio o pasa a buscarla" + botón primario "Pide ahora" + link "Ver locales →".

| Campo | Valor (medido en Chipotle y adaptado) |
|---|---|
| Pin | `trigger: .board__plate`, `start: "top 65%"`, `endTrigger: .board__slot`, `end: "top 65%"`, `pin: true`, `pinSpacing: false` |
| Recorrido | Distancia entre la tabla y el hueco (≈ 700–800 px, como los 742 px de Chipotle) |
| Titular | `autoAlpha 0 → 1`, `y 60 → 0`; `trigger: section`, `start: "top bottom"`, `end: "top top"`, `ease: "none"`, `scrub: true` |
| Lettering | DrawSVG al entrar (`"top 75%"`, once) |
| Aterrizaje | Al terminar el pin (`onLeave`), la imagen interior hace `scale 1.02 → 1` en 0,4 s `back.out(2)` |
| Móvil (< 1024) | Sin pin: tabla estática, titular con revelado J9 |

Con `pinSpacing: false`, al soltarse el pin la tabla queda desplazada exactamente la distancia recorrida, o sea, encima del `.board__slot`: "aterriza" sobre el titular.

```ts
function initBoard() {
  const root = document.querySelector<HTMLElement>(".board");
  if (!root) return;
  drawLettering(root);
  mm.add(`${mq.desktop} and (prefers-reduced-motion: no-preference)`, () => {
    const plate = root.querySelector<HTMLElement>(".board__plate")!;
    ScrollTrigger.create({
      trigger: plate, start: "top 65%", endTrigger: root.querySelector(".board__slot")!, end: "top 65%",
      pin: true, pinSpacing: false, anticipatePin: 1,
      onLeave: () => gsap.fromTo(plate.querySelector("img"), { scale: 1.02 }, { scale: 1, duration: 0.4, ease: "back.out(2)" }),
    });
    gsap.fromTo(root.querySelector(".board__headline"), { autoAlpha: 0, y: 60 }, {
      autoAlpha: 1, y: 0, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "top top", scrub: true },
    });
  });
}
```

---

#### Sección 8 · De temporada (J12)

- Carrusel **sin librería**: pista `display: flex; gap: 32px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-inline: var(--gutter)`, cards con `scroll-snap-align: start`, barra de scroll oculta. El arrastre es el nativo (táctil y trackpad).
- Botones anterior/siguiente (`chevron-left`/`chevron-right`, `icon` 44×44 secundarios) en la cabecera de la sección, solo en escritorio; desplazan una card (`scrollBy({ left: ±(368 + 32), behavior: "smooth" })`; con reduce, `behavior: "auto"`). Se deshabilitan en los extremos.
- Entrada: J9 con stagger 0,1 en las cards visibles.
- Accesibilidad: `role="region" aria-roledescription="carrusel" aria-label="Pizzas de temporada"`; cada card es un `<article>`.

#### Sección 9 · Eventos y pedidos grupales

J9 sobre las dos cards (stagger 0,15). Sin otros efectos.

#### Sección 10 · Footer (J14)

Borde rasgado superior con `y: 0 → -16px` y scrub (misma receta que en la sección 6). Nada más.

---

### 9.6 Efectos de interfaz (fuera del scroll)

**Menú móvil (J16)**

```ts
const menuTl = gsap.timeline({ paused: true })
  .to(".mobile-menu", { autoAlpha: 1, duration: 0.25, ease: "power2.out" })
  .from(".mobile-menu__item", { y: 24, autoAlpha: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }, "<0.05");
// abrir: menuTl.timeScale(1).play();  cerrar: menuTl.timeScale(1.5).reverse();
```

**Drawer del carrito**

```ts
const cartTl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } })
  .to(".cart-scrim", { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0)
  .fromTo(".cart-panel", { xPercent: 100 }, { xPercent: 0, duration: 0.5 }, 0)
  .from(".cart-item", { x: 24, autoAlpha: 0, stagger: 0.04, duration: 0.3, ease: "power2.out" }, 0.2);
// abrir: cartTl.timeScale(1).play();  cerrar: cartTl.timeScale(1.6).reverse();  (≈ 0,31 s)
// Al abrir: document.documentElement.classList.add("is-overlay-open"); window.__lenis?.stop();
```

**Agregar al carrito:** contador `scale 1 → 1.3 → 1` (`gsap.fromTo(badge, { scale: 1 }, { scale: 1.3, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" })`) + toast (entra `y: 16 → 0`, `autoAlpha` 0,3 s `power2.out`; sale `autoAlpha → 0` 0,2 s `power2.in` a los 3 s).

**Vuelo de ingrediente en el constructor (J15)**

| Paso | Valor |
|---|---|
| 1 | Clonar la `<img>` de la card en `position: fixed` sobre su rect actual (`z-index: 70`) |
| 2 | `Flip.fit(clone, previewTarget, { duration: 0.6, ease: "power2.inOut", scale: true })`; `previewTarget` es un elemento de 64 px en el centro de la preview (en móvil, la mini-preview de 56 px de la barra inferior) |
| 3 | Al terminar: el clon `autoAlpha → 0` en 0,2 s y se elimina; la capa del ingrediente en la preview `autoAlpha 0 → 1`, `scale 1.1 → 1`, 0,3 s `power2.out` |
| Quitar | La capa sale con `autoAlpha → 0` en 0,25 s `power2.in`; no hay vuelo de vuelta |
| Reduce | Sin vuelo: solo el fundido de la capa, 0,2 s |

**Indicador de pestañas**

```ts
function moveIndicator(indicator: HTMLElement, tab: HTMLElement) {
  const state = Flip.getState(indicator);
  tab.appendChild(indicator);
  Flip.from(state, { duration: 0.4, ease: "power2.inOut" });
}
```

**Skeletons** mientras llega la API: bloques `--muted` con `opacity` entre 0.6 y 1, 1,2 s `sine.inOut`, `yoyo`, `repeat: -1`. Con reduce, estáticos.

**Transiciones entre páginas:** ninguna en v1 (Chipotle tampoco las tiene).

### 9.7 Reglas de 60 fps

1. **Propiedades permitidas en animaciones por frame:** `x`, `y`, `xPercent`, `yPercent`, `scale`, `rotation` y `opacity`/`autoAlpha`. **Prohibido** animar con scrub o en bucle: `top`, `left`, `width`, `height`, `margin`, `padding`, `box-shadow`, `filter`, `clip-path`, `background-position`, `border-width`.
2. **Excepciones permitidas** (cambios de estado puntuales, no por frame, ≤ 0,3 s): `color` del header al pasar a sólido y de los links del footer; `border-color` de las cards. El barrido de botones se hace con `scaleX` en un pseudo-elemento (8.3), no con `background-position` como Chipotle.
3. **`will-change`:** nunca global en CSS ni en `*`. Se permite solo en: el header (`will-change: transform` fijo), las 3 pistas del marquee mientras corren, y las piezas del hero y las porciones **solo mientras su ScrollTrigger está activo** (`onToggle` lo pone y lo quita, ver recetas). Para el resto se confía en `force3D: "auto"` de GSAP, que promueve la capa durante el tween y la libera al terminar. Máximo unas 25 capas promovidas a la vez.
4. **Sin `filter: drop-shadow()`** en nada animado (7.3).
5. **Imágenes:** `width`/`height` siempre; las de secciones pinneadas llevan `data-pin-asset` y se decodifican antes de crear los ScrollTrigger (9.4). `ScrollTrigger.refresh()` tras `document.fonts.ready` y tras `load`.
6. **Valores dependientes del tamaño** siempre como función (`x: () => …`) con `invalidateOnRefresh: true`; nunca leer `offsetWidth` dentro de `onUpdate`.
7. **Bucles infinitos** (flotación, marquee, video) se pausan fuera de pantalla.
8. **Orden de creación:** ScrollTriggers en orden de documento (de arriba abajo), o `refreshPriority` si no es posible, para que los pins calculen bien sus espaciadores.
9. **`ScrollTrigger.config({ ignoreMobileResize: true })`** y alturas con `svh`/`dvh` para que la barra de direcciones de móvil no recalcule los pins.
10. **Presupuesto JS de motion:** ≤ 60 KB gzip (GSAP + ScrollTrigger + Flip + DrawSVG + SplitText + Lenis).
11. **Verificación** (Chrome DevTools, CPU 4× más lenta, viewport 390×844 y 1440×900): sin tareas > 50 ms durante el scroll, ≥ 55 fps de media en las secciones 1, 4 y 5, CLS < 0,1, LCP < 2,5 s.

### 9.8 `prefers-reduced-motion`

Se gestiona con `gsap.matchMedia()` (condición `reduce`) y CSS. Con `reduce`:

| Efecto | Fallback |
|---|---|
| Lenis | No se crea; scroll nativo |
| Header (J1) | Siempre visible; el cambio a sólido se mantiene |
| Hero (J2/J3) | Sin pin ni flotación; pizza montada (estado CSS); `.hero__done` visible |
| Revelados (J9, SplitText) | Contenido visible desde el inicio (`clearProps`) |
| Hover de pizza (J10) | Sin giro ni escala; el CTA "Personalizar →" siempre visible |
| Porciones (J8) | Sin pin; porciones ya separadas y labels visibles |
| Lettering (J5) | SVG completo, sin dibujar |
| Marquee (J6) | Sin movimiento: cada fila es un `flex-wrap` centrado con 8 ingredientes (sin el juego duplicado) |
| Parallax (J4, J14) | Piezas en su posición CSS |
| Video (J13) | Sin autoplay ni `scale`; póster con botón de reproducir |
| Tabla (J7) | Sin pin; titular visible |
| Drawer, menú móvil, toast | Solo `autoAlpha` en 0,15 s, sin desplazamiento |
| Vuelo del constructor (J15) | Solo fundido de la capa |
| Carrusel | `scrollBy` con `behavior: "auto"` |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; }
  .marquee__track { flex-wrap: wrap; justify-content: center; transform: none !important; }
  .marquee__track [aria-hidden="true"] { display: none; }
}
```

### 9.9 Simplificaciones en móvil (`gsap.matchMedia`, < 1024 px)

| Sección | Escritorio | Móvil |
|---|---|---|
| Lenis | Activo (puntero fino) | Desactivado |
| Hero | 14 piezas, pin `+=150%`, scrub 0,8, flotación 16 px | 8 piezas, pin `+=100%`, scrub 0,5, flotación 10 px |
| Revelados | `y: 40` | `y: 24` |
| Hover de cards (J10) | Activo | No existe (CTA siempre visible) |
| Porciones | Pin `+=200%`, R = 0,14·d, labels radiales | Pin `+=120%`, R = 0,10·d, labels en grid de 2 columnas debajo |
| Marquee | 3 filas, tooltip | 2 filas, sin tooltip |
| Parallax | 4–6 piezas, speed hasta 0,35 | 2 piezas, speed hasta 0,15 |
| Video | 1920×1080 | 720×1280 |
| Tabla (J7) | Pin + aterrizaje | Sin pin, revelado |
| Carrusel | 3 visibles + botones | 1,2 visibles, solo arrastre |

---

## 10. Datos e integración con el backend

- Menú, categorías, ingredientes (nombre, origen para el tooltip, precio, kcal, assets) y precios del constructor vienen de la API .NET 10. El marquee y las cards se generan desde esos datos.
- Cada ingrediente expone 3 assets: `card` (400×400 con sombra), `marquee` (360×360 con sombra) y `layer` (720×720 sin sombra, lienzo de pizza).
- Precios: siempre formateados en el frontend con `Intl.NumberFormat` usando la moneda y el locale que entregue la configuración del backend (los "$X" de este documento son marcadores).
- Tras pintar contenido que llega de la API dentro o por encima de una sección con ScrollTrigger, llamar a `ScrollTrigger.refresh()`.

---

## 11. Tokens para copiar (`src/styles/tokens.css`)

Complementa `palette.css` (que ya define todos los colores). Tailwind v4 genera utilidades a partir de `@theme` (`font-display`, `text-h2`, `rounded-pill`, `shadow-header`, `ease-emphasis`…).

```css
@theme {
  /* Fuentes */
  --font-display: "Barlow Condensed", "Arial Narrow", "Roboto Condensed", sans-serif;
  --font-body: "Nunito Sans Variable", "Nunito Sans", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

  /* Escala tipográfica (390 → 1440 px) */
  --text-display: clamp(3.5rem, 2.2rem + 5.333vw, 7rem);   --text-display--line-height: 0.92; --text-display--letter-spacing: -0.01em;
  --text-h1: clamp(3rem, 2.257rem + 3.048vw, 5rem);        --text-h1--line-height: 0.95;      --text-h1--letter-spacing: -0.01em;
  --text-h2: clamp(2.5rem, 2.129rem + 1.524vw, 3.5rem);    --text-h2--line-height: 1;
  --text-h3: clamp(1.875rem, 1.643rem + 0.952vw, 2.5rem);  --text-h3--line-height: 1;
  --text-h4: clamp(1.5rem, 1.407rem + 0.381vw, 1.75rem);   --text-h4--line-height: 1.1;       --text-h4--letter-spacing: 0.01em;
  --text-h5: clamp(1.25rem, 1.204rem + 0.19vw, 1.375rem);  --text-h5--line-height: 1.15;      --text-h5--letter-spacing: 0.02em;
  --text-price: clamp(1.375rem, 1.236rem + 0.571vw, 1.75rem); --text-price--line-height: 1;
  --text-price-lg: clamp(1.75rem, 1.657rem + 0.381vw, 2rem);  --text-price-lg--line-height: 1;
  --text-lead: clamp(1.125rem, 1.079rem + 0.19vw, 1.25rem);   --text-lead--line-height: 1.55;
  --text-body: clamp(1rem, 0.977rem + 0.095vw, 1.0625rem);    --text-body--line-height: 1.6;
  --text-sm: 0.875rem;  --text-sm--line-height: 1.5;
  --text-xs: 0.75rem;   --text-xs--line-height: 1.4;
  --text-eyebrow: clamp(0.75rem, 0.727rem + 0.095vw, 0.8125rem); --text-eyebrow--line-height: 1.2; --text-eyebrow--letter-spacing: 0.12em;

  --tracking-button: 0.04em;
  --tracking-badge: 0.08em;

  /* Breakpoints */
  --breakpoint-2xl: 90rem;

  /* Radios */
  --radius-sm: 4px;
  --radius-pill: 9999px;

  /* Sombras */
  --shadow-header: 0 10px 11px -5px rgb(23 16 12 / 0.10);
  --shadow-card: 0 2px 12px rgb(23 16 12 / 0.06);
  --shadow-pop: 0 8px 24px rgb(23 16 12 / 0.12);
  --shadow-sticky: 0 -8px 24px rgb(23 16 12 / 0.08);
  --shadow-drawer: -24px 0 48px rgb(23 16 12 / 0.18);

  /* Easings */
  --ease-standard: cubic-bezier(0.215, 0.61, 0.355, 1);
  --ease-emphasis: cubic-bezier(0.165, 0.84, 0.44, 1);
  --ease-exit: cubic-bezier(0.55, 0.055, 0.675, 0.19);
  --ease-move: cubic-bezier(0.645, 0.045, 0.355, 1);
  --ease-float: cubic-bezier(0.445, 0.05, 0.55, 0.95);
  --ease-pop: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

:root {
  /* Layout */
  --container: 1170px;
  --container-wide: 1440px;
  --container-narrow: 760px;
  --gutter: 16px;
  --header-h: 64px;
  --tabs-h: 56px;
  --sticky-bar-h: 72px;
  --section-y: clamp(4rem, 2.514rem + 6.095vw, 8rem);
  --stack-title: clamp(2.5rem, 2.314rem + 0.762vw, 3rem);

  /* Capas */
  --z-raised: 10; --z-tabs: 40; --z-header: 50; --z-sticky-bar: 60;
  --z-mobile-menu: 80; --z-scrim: 90; --z-drawer: 100; --z-toast: 110;

  /* Motion */
  --dur-1: 0.12s; --dur-2: 0.25s; --dur-3: 0.4s; --dur-4: 0.6s; --dur-5: 0.9s; --dur-6: 1.6s;

  /* Derivados de la paleta (sección 2.4) */
  --secondary-hover: var(--color-masa-700, #4D4038);
  --accent-hover: var(--color-queso-300, #F6CB6F);
  --scrim: rgb(23 16 12 / 0.5);
  --overlay-photo: rgb(23 16 12 / 0.65);
}
@media (min-width: 640px)  { :root { --gutter: 24px; } }
@media (min-width: 1024px) { :root { --gutter: 32px; --header-h: 96px; --sticky-bar-h: 80px; } }

.dark, [data-theme="dark"] { --secondary-hover: var(--color-masa-200, #E2D4C1); }
@media (prefers-color-scheme: dark) {
  :root:not(.light):not([data-theme="light"]) { --secondary-hover: var(--color-masa-200, #E2D4C1); }
}

body { font-family: var(--font-body); font-size: var(--text-body); line-height: 1.6; background: var(--background); color: var(--foreground); }
h1, h2, h3, h4, h5, .font-display { font-family: var(--font-display); text-transform: uppercase; text-wrap: balance; }
```

---

## 12. Notas para generación de páginas (bloque para copiar en prompts)

```
DESIGN SYSTEM — JORGES (pizzería premium, inspirada en chipotle.com)
- Fondo crema #FAF5EA (--background); cards harina #FFFDF8 (--surface); secciones alternas masa-100 #F2E9D9 (--muted).
- Texto carbón tostado #17100C (--foreground), nunca negro; atenuado #63554B (--muted-foreground).
- Primario tomate #C8341E (--primary), hover #A2281A; un solo CTA rojo por vista.
- Acento queso #F2B33D (--accent) solo como fondo (con texto carbón) o sobre tomate/carbón; como texto sobre crema usar #723D17.
- Secciones oscuras con data-theme="dark" (hero, video, menú móvil, footer): fondo #261C17 / #17100C.
- Éxito albahaca #3B7B37; vino #A8213A solo para errores con icono. No hay más colores.
- Tipos: Barlow Condensed 800/700/600 en MAYÚSCULAS para titulares, nav, botones y precios (H2 40→56 px, lh 1.0);
  Nunito Sans 400–800 para texto (16→17 px, lh 1.6); badges/eyebrows en Nunito Sans 800 MAYÚS. 12–13 px, tracking .08–.12em.
- Radios: botones e inputs 4px; badges y pestañas 9999px; cards, imágenes y drawer 0.
- Bordes 1px #E2D4C1; casi sin sombras (header: 0 10px 11px -5px rgb(23 16 12/.1)).
- Contenedor 1170px; gutter 16/24/32; secciones 64→128 px de padding vertical; grid 12 col, gap 16/24/32.
- Comida: WebP recortado con alfa, vista cenital, sombra horneada (o sombra CSS separada si se anima).
- Botones: barrido de color izquierda→derecha con ::before scaleX (0,25 s).
- Motion GSAP+ScrollTrigger: hero pinneado de ensamblaje, porciones que se separan, marquee de ingredientes,
  tabla fijada que aterriza; solo transform/opacity; todo visible sin JS y con prefers-reduced-motion.
```

---

## 13. Decisiones tomadas en este documento

Cosas que los documentos anteriores dejaban abiertas o proponían de otra forma:

| Tema | Decisión | Motivo |
|---|---|---|
| Fuente display | Barlow Condensed 600/700/800 | Jerarquía de pesos, cercanía a Trade Gothic Condensed, tildes; Oswald más dura, Anton con un solo peso |
| Fuente de texto | Nunito Sans (no Nunito) | Misma calidez sin terminales redondeados: más premium |
| Rol de Gotham | Sin tercera familia; Nunito Sans 800 en mayúsculas espaciadas | Ahorra unos 40 KB y una petición |
| Carga de fuentes | Autoalojadas con Fontsource | Sin terceros, mejor para Docker y privacidad |
| Interlineado de titulares | 0,92–1,0 (Chipotle 0,79) | Tildes del español en mayúsculas |
| Espaciado entre secciones | 64 → 128 px (Chipotle 40–60) | Más aire = más premium |
| Header | 96/64 px (Chipotle 100/70), transparente sobre el hero y sólido en `--surface` | Encaja con el hero oscuro; la superficie harina lo separa del fondo crema |
| Hero | Opción A de `palette.md` (fondo carbón), no foto con capa | La paleta la marca como la más premium y no necesita overlay |
| Ángulo de fotografía | Todo cenital | Permite girar, separar porciones y montar capas |
| Sombras de assets | Horneadas en estáticos, CSS separada en animados; sin `drop-shadow` | Rendimiento y animación de la sombra |
| Porciones | 6 (no 6–8), una por categoría, lienzo común de 1280 px; sin hilos de queso en v1 | Mapea 1:1 con las 6 categorías; simplifica la geometría |
| Barrido de botones | `::before` + `scaleX` en vez de `background-position` | Solo composición, sin repintado |
| Hover del primario | Oscurece (`tomate-700`); Chipotle aclara | El texto crema necesita ≥ 4.5:1 |
| Escala del hover de pizza | 1,06 + 12° (J10 proponía 1,08) | Evita recortar la sombra horneada |
| Lenis | Sí, solo escritorio con ratón y sin reduce (el análisis lo dejaba opcional) | Sensación premium sin romper el scroll táctil |
| Carrusel | `scroll-snap` nativo, sin Swiper/Embla | Menos JS, accesible |
| Lettering | SVG de trazo central + DrawSVG; Caveat Brush solo en maquetas | Los GIF de Chipotle no escalan ni se pueden controlar |
| Pausa de marquee y video | Botón de pausa obligatorio | WCAG 2.2.2 (movimiento de más de 5 s) |
| Botón queso | Solo sobre tomate o carbón; en cards sobre crema se usa secundario | Regla de `palette.md` (queso/crema 1.71:1) |
| Card de pizza | Enlaza al constructor precargado (`/arma-tu-pizza?base=slug`); no hay página de producto en v1 | Un solo flujo de personalización |
| Pestaña activa | Fondo carbón (`--secondary`), no rojo | Mantener un solo rojo por vista |
| Modo oscuro | Sigue al sistema, sin interruptor en v1 | `palette.css` ya lo resuelve |
| Tabla J7 en móvil | Sin pin | Ahorra scroll pinneado en pantallas pequeñas |

**Pendiente (fuera de este documento):** logotipo y sello del club, los SVG de hand-lettering, la sesión de fotos cenital y el video del horno, la moneda/locale de los precios (los da el backend) y los textos finales.

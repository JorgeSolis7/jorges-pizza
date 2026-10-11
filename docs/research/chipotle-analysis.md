# Análisis de chipotle.com — referencia visual y de animaciones para "Jorges"

> Paso 1a del proyecto. Fecha de inspección: 2026-10-09. Herramienta: `agent-browser` v0.38.2 (Chrome headless), viewports 1440x900 (escritorio) y 390x844 (móvil, emulación iPhone 14).
> Páginas inspeccionadas: `/` (home), `/values` (Our Values), `/order/build/burrito-bowl` (constructor del menú).
> Las capturas tomadas durante la inspección no se incluyen en el repositorio; el análisis es solo textual.

---

## 0. Resumen ejecutivo (leer primero)

1. **La home de Chipotle es casi estática.** No hay pin, ni scrub, ni parallax, ni ingredientes flotando en `/`. Las únicas animaciones son: header sticky, video de fondo en el hero, un *fade-in* de opacidad por IntersectionObserver en dos bloques, efectos hover (zoom de imagen, botones con barrido de color) y un carrusel Swiper en móvil.
2. **Donde sí está el "storytelling" con scroll es `/values`**: parallax de un burrito recortado, titulares *hand-lettering* que se "escriben solos" (GIF animados que arrancan al entrar en pantalla), un marquee infinito de ingredientes recortados en 3 filas con direcciones alternas, y un bowl que se queda **fijo (pin manual)** unos 742 px mientras el titular aparece debajo y luego "aterriza" en su sitio.
3. **No usan GSAP, ScrollTrigger, Lenis, Locomotive, Framer Motion, AOS ni WebGL.** Stack: Adobe Experience Manager (AEM) + **Vue 3** (la app de pedidos `order-web`, que también pinta partes de la home) + JS vanilla + **IntersectionObserver** + transiciones/keyframes CSS + **Swiper**. Cargan `@lottiefiles/lottie-player` y `lottie-interactivity`, pero no había ningún `<lottie-player>` en las páginas inspeccionadas.
4. **Las fotos de comida son PNG recortados con canal alfa** (sombra suave ya incluida en la imagen) sobre fondo blanco o una textura de papel. No hay WebP/AVIF ni `<picture>` con formatos modernos.
5. **Tipografía:** *Trade Gothic LT Bold* (condensada, en mayúsculas) para titulares, navegación y botones; *Nunito* para el texto; *Gotham* para badges y textos de `/values`; los titulares grandes de `/values` son ilustraciones hand-lettering (GIF/SVG), no fuentes.
6. **Color:** marrón chocolate `#451400` (texto, botones primarios), rojo `#AD2118`, dorado `#B68207`, bordes `#D4CBC7` y grises `#F2F2F2`.

Para Jorges conviene copiar **la identidad visual** (paleta cálida, titulares condensados en mayúsculas, comida recortada sobre fondos limpios o de papel, hand-lettering) y **mejorar el movimiento** con GSAP: los efectos de `/values` pasan a ScrollTrigger con `scrub`/`pin` reales y se añaden los efectos "premium" que pide el brief (ingredientes que se ensamblan sobre la masa, porciones que se separan). Ver §9.

---

## 1. Acceso y metodología

| Punto | Resultado |
|---|---|
| Protección anti-bot | **Ninguna.** El sitio cargó normal en headless, sin CAPTCHA ni bloqueos. |
| Banner de cookies (Ketch) | Aparece en la primera visita (panel a la derecha). Se cerró con la "X" (`close banner`), sin aceptar ni enviar nada. |
| Login / formularios | No se inició sesión ni se envió ningún formulario. En el constructor de pedidos no se seleccionó ningún ingrediente (solo hover). |
| Método de análisis | Scroll paso a paso con capturas; `eval` para detectar librerías, leer estilos calculados, reglas CSS y keyframes; un script que compara `transform`/`opacity`/`className` de todos los nodos en cada posición de scroll (cada 200–300 px) para encontrar **qué cambia de verdad con el scroll**; lectura del JS de AEM (`clientlib-site`) y del CSS de `order-web` (`app.css`). |

---

## 2. Tecnología detectada

| Tecnología | ¿Está? | Evidencia |
|---|---|---|
| GSAP / ScrollTrigger | **No** | `window.gsap` y `window.ScrollTrigger` son `undefined`; no hay scripts de GSAP. |
| Lenis / Locomotive (smooth scroll) | **No** | No hay clase `.lenis` ni `[data-scroll-container]`; el scroll es nativo. |
| Framer Motion / React | **No** | No hay React. |
| **Vue 3** | **Sí** | `__VUE__`, `__VUE_INSTANCE_SETTERS__`, `webpackChunkorder_web`, atributos `data-v-xxxx`; bundles `orderweb-cdn.chipotle.com/js/app.js` y `chunk-vendors.js`. |
| **Adobe Experience Manager** | **Sí** | `etc.clientlibs/cmgaemacs/...`, clases `cmp-*`, `aem-hero`, `aem-card`, `experiencefragment`. |
| **IntersectionObserver** | **Sí** | En `clientlib-site`: `new IntersectionObserver(cb, {root:null, rootMargin:"-20%"})` sobre `.lazy-load.fade-out` → añade `.fade-in` y deja de observar. |
| Swiper | **Sí** | `.swiper-container`, `.swiper-slide.meal-card` (carrusel "Featured"; en móvil con paginación de puntos). |
| Lottie | Cargado, **sin uso visible** | `lottie-player@1.5.7` y `lottie-interactivity@latest` desde unpkg; 0 elementos `<lottie-player>` en `/` y `/values`. |
| CSS scroll-timeline / view-timeline | **No** | No hay reglas `animation-timeline` en ninguna hoja. |
| Canvas / WebGL | **No** | 0 `<canvas>`. |
| Video | **Sí** | `<video autoplay muted loop playsinline>` MP4: hero de la home (archivos distintos para escritorio y móvil), card de guacamole, secciones de `/values`. |
| AOS / WOW / Rellax | **No** | — |
| Animación de los titulares hand-lettering | **GIF animados** | `chpvalues-2020-comp0X-*.gif` (8 GIF) dentro de contenedores `.trigger`. |
| Parallax / pin en `/values` | **JS propio (Vue)** | `transform: translate3d(0, Ypx, 0)` inline en el burrito; un clon `position: fixed` (`#bowlTrigger`) para el bowl "fijado". |
| Analítica (no relevante) | Sí | GTM, Adobe Launch, FullStory, Datadog RUM, Bing, Branch, Ketch (cookies). |

---

## 3. Home (`/`) — sección por sección, en orden de scroll

Altura total: **~4.011 px en escritorio** (~4,5 pantallas) y **~5.968 px en móvil**.

### 3.1 Barra de utilidad + Header — `y = 0–145`
- **Barra de utilidad** (44 px, fondo `#F2F2F2`): solo "ENABLE ACCESSIBILITY" a la derecha (Nunito Extra Bold 11 px, `letter-spacing: .85px`). Sale de pantalla al hacer scroll (no es sticky).
- **Header** (`header.experiencefragment.aem-xf-header`): `position: sticky; top: 0; z-index: 100`, fondo blanco, `border-bottom: 1px solid #D7D7D7`, `box-shadow: 0 10px 11px -5px rgba(0,0,0,.1)` (≥768 px). Alto 100 px (escritorio) / 70 px (móvil). Grid `auto auto 1fr`.
  - Izquierda: logo circular rojo (≈64 px) y nav `MENU · CATERING · REWARDS · OUR VALUES · NUTRITION` (Trade Gothic LT Bold 24 px, mayúsculas, `#451400`, `transition: .12s`).
  - Derecha: icono de pin + "FIND A CHIPOTLE", icono de usuario + "SIGN IN / JOIN" (Gotham, mayúsculas con tracking amplio, ~14 px), icono de bolsa.
  - **Estado activo** (visto en `/values`): el texto pasa a rojo y aparece debajo una barrita roja corta (~20x3 px).
  - **En scroll:** se queda fijo arriba; **no se oculta al bajar ni reaparece al subir, y no cambia de color ni de tamaño**.

### 3.2 Hero con video — `y = 145–595` (450 px)
- `.aem-hero` con `min-height: 450px; max-height: 650px` (a 1440 px mide 450). Fondo: `<video>` MP4 en bucle, a pantalla completa y `object-fit: cover` (archivo distinto para escritorio y para móvil). Antes de cargar se ve un placeholder `#F0F0F0`.
- Contenido centrado:
  - Badge tipo píldora blanca (`rounded-full`) con "ALL-NEW" en rojo `#AD2118` (Gotham Bold 16 px, `letter-spacing: 1.6px`).
  - Titular en dos líneas: "POLLO ASADO" (Gotham Bold 50 px / 55 px) y "& CHILI LIME CHIPS" (Trade Gothic 55 px / 50 px), blanco.
  - Texto: Nunito Bold 18 px, blanco, 3 líneas.
  - CTA "ORDER NOW" rojo (ver §6.3).
- **Animación:** solo el video. Sin parallax ni zoom en scroll; un segundo fotograma del video muestra el botón en hover.

### 3.3 Barra de Rewards — `y = 595–675` (80 px)
- Sello de Rewards, "JOIN CHIPOTLE REWARDS. UNLOCK FREE CHIPOTLE." (Trade Gothic LT Bold 24 px, `#451400`), botón marrón "JOIN REWARDS" (220x33) y "OR **SIGN IN**" (enlace dorado `#B68207` subrayado). Debajo, una línea divisoria gris de 1 px.

### 3.4 Grid del menú (Vue `.top-level-menus`) — `y = 691–1627`
- 9 tiles en **3 columnas** (flex-wrap, `max-width: 1200px`): Family Meals, Burrito, Burrito Bowl, High Protein Menu, Quesadilla, Salad, Tacos, Kid's Meal, Chips & Sides.
- Cada tile: PNG recortado (p. ej. `burrito.png`, 954x633, 68 % de píxeles transparentes) de ~290 px de ancho, una etiqueta opcional tipo píldora ("DIGITAL ONLY", "NEW": fondo `#451400`, Nunito Bold 12 px blanco), el nombre en Trade Gothic LT Bold 40 px en mayúsculas `#451400` y, a veces, un tagline ("Serves 4-6 people", 14 px).
- **Hover:** `img { transform: scale(1.1) }` y aparece "ORDER →" en dorado `#B68207` (Trade Gothic Bold 22,4 px, flecha SVG dorada). **No tiene transición** (el cambio es instantáneo; `order-cta` pasa de `visibility: hidden` a `visible`).

### 3.5 Dos cards promocionales — `y ≈ 1683–2215` (bloque `lazy-load fade-out transition transition-1s`)
- Dos `.aem-card.card-image-right` de 538x500, `border: 1px solid #D4CBC7`, **sin radio y sin sombra**, `margin: 16px`.
  - Columna de texto de 278 px: titular Trade Gothic LT Bold ~32 px en mayúsculas en 4 líneas ("WE START WITH 48 PERFECT AVOCADOS"), texto Nunito 16–18 px y botón marrón de ancho completo "ORDER NOW" (36 px de alto) pegado abajo (`justify-content: space-between`).
  - Mitad derecha: un **video en bucle** (guacamole) o una foto.
- **Entra con un fade-in** (ver §5, A3).

### 3.6 "FEATURED" — `y ≈ 2255–2819`
- Fondo beige muy claro con un patrón de ilustraciones de ingredientes (aguacate, cebolla, chile, lima) en tono crema. Titular "FEATURED" en Trade Gothic LT Bold 48 px y botón "FIND A CHIPOTLE" (220x48).
- 3 `meal-card` dentro de Swiper (389 px de ancho): foto a sangre arriba y caption blanco con el nombre (Nunito Bold 20 px). Sin radio ni sombra.

### 3.7 "CROWD PLEASERS" — `y ≈ 2874–3327` (también `lazy-load` con fade-in)
- Dos cards (Catering / Group Order): foto de cabecera de ~180 px con el título encima en blanco (Trade Gothic Bold 40 px), una lista con viñetas doradas, botón **dorado** `#B68207` de 370x60 y una sombra muy suave.

### 3.8 Footer — `y = 3327–4068`
- Columna 1: enlaces grandes (Trade Gothic 28 px en mayúsculas): Contact Support, Careers, Chipotle Goods, Gift Cards, Fundraising, Rewards.
- Columna 2: enlaces pequeños (Nunito Extra Bold 16 px): Our Values, News & Events, Investors…
- Columna 3: sello de Rewards, "JOIN REWARDS" (rojo), "GET REWARDED" (Trade Gothic 48 px), subtítulo y botón **outline** "JOIN NOW" (`1px solid #786259`, 24 px, `padding: 10px 20px`).
- Badges de App Store / Google Play, iconos sociales (círculos marrones de 32 px; en hover `opacity: .5`).
- Barra legal con fondo `#F2F2F2` y enlaces grises pequeños.

---

## 4. `/values` — la página con animaciones de scroll

Altura ~10.600 px en escritorio. Fondo general: textura de papel (`background-tile.jpg`, beige/crema) alternada con bandas de video a sangre y bloques blancos. Los bloques se separan con un **borde de papel rasgado** (`tear-desktop.png`, 160 px de alto).

| # | Sección (clase) | Doc-Y aprox. | Contenido | Animación |
|---|---|---|---|---|
| V1 | `.food-has-the-power` | 145–2343 | GIF hand-lettering "We believe that FOOD has the power to change the world" (marrón sobre papel), un bowl recortado a la izquierda + "WE DO IT BY BEING REAL" (SVG) + texto Gotham 22 px a la derecha, un **burrito recortado** que entra por la derecha y un GIF "This isn't just food for thought…" | GIF que se "escribe" + **parallax del burrito** |
| V2 | `.fresh-food` (video) | 2343–3247 | Video a sangre (`food_sequence_xlarge.mp4`) con el GIF blanco "BEING REAL MEANS… MAKING FOOD FRESH EVERY DAY" y dos iconos "NO" (SVG) con texto | Video en bucle + GIF |
| V3 | `.real-ingredients` | 3247–4906 | GIF "WE ONLY USE 53 INGREDIENTS…", subtítulo y **3 filas de ingredientes recortados** (PNG 510x510) que se desplazan en horizontal + "SEE THEM ALL →" | GIF + **marquee infinito** |
| V4 | `.sustainability` | 4906–6688 | Video de cultivos con el GIF "BEING REAL MEANS BEING COMMITTED" + texto; después, sobre papel, el GIF "FIGHTING FOR OUR PLANET" y dos estadísticas con iconos lineales SVG (papelera de reciclaje con "50%", planeta) | GIF + video |
| V5 | `.career` | 6688–7967 | Papel rasgado → blanco; GIF "TREATING OUR PEOPLE RIGHT" a la izquierda, texto + "CHIPOTLE CAREERS →" a la derecha y una foto grande del equipo | GIF |
| V6 | `.cultivate-a-better-world` | 7967–9161 | Bowl recortado (`carnitas-bowl-sm.png`, 768x280) + GIF "IT'S OUR WAY TO CULTIVATE A BETTER WORLD" + "One meal might not change the world…" | **Bowl fijado (pin)** + **opacidad del titular ligada al scroll** |
| V7 | `.real-x3` | 9211–9856 | "REAL INGREDIENTS. REAL PURPOSE. REAL FLAVOR." (SVG hand-lettering) + logo | — |

---

## 5. Animaciones — especificación para reimplementarlas con GSAP ScrollTrigger

Notación: *Doc-Y* = posición absoluta en el documento; *vh* = alto del viewport (900 px en las mediciones de escritorio). Los valores marcados como **medido** salen de leer estilos calculados en varias posiciones de scroll; los marcados como **estimado** salen de las capturas.

### A1. Header sticky (home y todo el sitio)
| Campo | Valor |
|---|---|
| Qué hace | La barra de utilidad (44 px) sale con el scroll; el header blanco de 100 px queda `sticky` en `top: 0`. |
| Trigger / start / end | No usa JS; es `position: sticky` en CSS. |
| Propiedades | Ninguna cambia (ni color, ni alto, ni sombra; la sombra está siempre puesta). |
| Pin / Scrub | Equivale a un pin permanente. |
| GSAP | No hace falta: `position: sticky`. Para Jorges se propone una versión mejorada (ocultar/mostrar según dirección), ver §9. |

### A2. Hero con video en bucle (home)
- `<video autoplay muted loop playsinline>` con `object-fit: cover` y un MP4 por breakpoint (escritorio/móvil). No reacciona al scroll.
- GSAP: no aplica. Si se quiere un toque extra: `scale 1 → 1.08` del video y `opacity 1 → 0` del texto con `scrub` entre `top top` y `bottom top` del hero.

### A3. Fade-in al entrar en pantalla (home: cards promocionales y "Crowd Pleasers")
| Campo | Valor (**medido**) |
|---|---|
| Elementos | `.experiencefragment.lazy-load.fade-out.transition.transition-1s` (2 bloques) |
| Trigger | IntersectionObserver `{ root: null, rootMargin: "-20%" }`. Se dispara cuando el bloque entra en el 60 % central del viewport, es decir, cuando su borde superior pasa del **80 % del viewport** (unos 720 px de 900). Solo una vez (`unobserve`). El observer parece montarse con un retraso de unos 3 s tras la carga. |
| Propiedades | `opacity: 0 → 1` (clase `.fade-in`). Sin transform. |
| Duración / easing | `transition-duration: 1s`, easing por defecto (`ease`). |
| Pin / Scrub | No / No (se dispara una vez, no va ligado al scroll). |
| GSAP equivalente | `gsap.from(el, { autoAlpha: 0, duration: 1, ease: "power1.out", scrollTrigger: { trigger: el, start: "top 80%", once: true } })` |

> El CSS también define `@keyframes fade-in { 0% { transform: scale(.6); opacity: .6 } }`, pero se usa para modales, no en scroll.

### A4. Comida flotando ("updown" + sombra) — definido en el CSS del sitio
- Clases utilitarias de AEM: `.image-hover { animation: updown 3s ease infinite }` con `@keyframes updown { 0%,100% { translateY(0) } 50% { translateY(-20px) } }` y `.shadow-hover { animation: shadow 3s ease infinite }` con `@keyframes shadow { 50% { translateY(20px) scale(.9); opacity: .5 } }`.
- Es decir: la comida sube 20 px mientras su sombra (otro elemento) baja, se encoge al 90 % y se aclara. En la inspección **no estaba activo** en ninguna pieza visible (es contenido de campaña que va rotando), pero es justo el efecto de "comida flotando" que se quiere para Jorges.
- GSAP: `gsap.to(food, { y: -20, duration: 1.5, ease: "sine.inOut", yoyo: true, repeat: -1 })` + `gsap.to(shadow, { y: 20, scale: .9, opacity: .5, duration: 1.5, ease: "sine.inOut", yoyo: true, repeat: -1 })`.

### A5. Hover de los tiles del menú (home)
| Campo | Valor (**medido**) |
|---|---|
| Disparador | `.top-level-menu .content:hover` |
| Propiedades | `img { transform: scale(1.1) }` y `.order-cta { visibility: hidden → visible }` ("ORDER →" en dorado). |
| Duración | **Ninguna** (cambio instantáneo; el CSS no declara `transition`). |
| GSAP / CSS recomendado | `transition: transform .35s cubic-bezier(.2,.8,.2,1)` y, para el CTA, `opacity` + `translateY(6px → 0)` en 0,25 s. Chipotle lo hace sin suavizado y queda brusco; en Jorges conviene suavizarlo. |

### A6. Botones con barrido de color en hover (todo el sitio)
| Campo | Valor (**medido**) |
|---|---|
| Técnica | `background-image: linear-gradient(to right, <claro> 50%, <base> 50%)`, `background-size: 200% 100%`, posición de reposo a la derecha (se ve el color base). En hover pasa a `background-position: left bottom`, así que el color claro entra barriendo de izquierda a derecha. |
| Duración | `transition: background-position .12s` (botones normales); `.3s` en el outline "JOIN NOW". |
| Pares de color | Rojo `#AC2117 → #B3473F`; marrón `#451400 → #6B321B`; dorado `#B68207 → #976500`; secundario: fondo `#F0F0F0`. Botones genéricos `.cmp-button:hover { opacity: .7 }`. |
| GSAP | No hace falta (CSS puro). |

### A7. Carrusel "Featured" (Swiper)
- Escritorio: 3 slides visibles (prácticamente estático). Móvil: 1,2 slides visibles, swipe y paginación de puntos.
- Para Jorges: Swiper, Embla o un *horizontal loop* de GSAP con Draggable.

### A8. Parallax del burrito recortado (`/values`, V1)
| Campo | Valor (**medido**) |
|---|---|
| Elemento | `.food-has-the-power__hero-burrito` (PNG 805x681 con alfa) |
| Propiedad | `transform: translate3d(0, Y, 0)` inline, con **Y ≈ 100 − 0,1·scrollY** px (scroll 300 → 70 px; 600 → 40; 1.200 → −20; 9.800 → −870). |
| Efecto | El burrito sube un 10 % más rápido que el scroll y "atraviesa" el titular siguiente (capas `background`/`foreground`). Movimiento lineal, sin easing (lo actualiza un listener de scroll). |
| Pin / Scrub | No / **Sí (lineal)** |
| GSAP equivalente | `gsap.fromTo(burrito, { y: 100 }, { y: -120, ease: "none", scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: true } })` (ajustar `y` final ≈ −0,1 × alto de la sección). |

### A9. Titulares hand-lettering que se "escriben solos" (`/values`, en todas las secciones)
| Campo | Valor |
|---|---|
| Técnica | **GIF animados** (`chpvalues-2020-comp01…08-*.gif`) que dibujan las letras trazo a trazo. Van dentro de `.trigger` (con un `top` interno de 200–360 px como punto de disparo) y arrancan cuando el bloque entra en pantalla. Se cazaron a medias: "53 `", "TREATING OUR PEOPLE R", "IT'S THOUGHT". |
| Duración | Unos 1,5–3 s por titular (**estimado**). Se reproduce una vez. |
| Pin / Scrub | No / No (es temporal, no va ligado al scroll). |
| GSAP equivalente (mejor que un GIF) | Titular en **SVG con trazos** y DrawSVGPlugin (gratis desde GSAP 3.13): `gsap.from(paths, { drawSVG: 0, duration: 1.6, stagger: .04, ease: "power1.inOut", scrollTrigger: { trigger: svg, start: "top 75%", once: true } })`. Alternativa: Lottie exportado desde After Effects. |

### A10. Marquee infinito de ingredientes (`/values`, V3)
| Campo | Valor (**medido**) |
|---|---|
| Estructura | 3 filas `.real-ingredients__ingredients_list`; la fila central lleva `.reverse`. Cada fila contiene la lista de ingredientes **duplicada** (cada `.Ingredient` es una `figure` con el PNG como `background-image`, en tamaños sm/md, más el nombre debajo). |
| Animación | `animation: Ingredient 50s linear infinite` con `@keyframes Ingredient { from { translateX(0) } to { translateX(-50%) } }`; la fila reverse va al revés. |
| Ligado al scroll | **No** (es temporal; sigue moviéndose aunque no haya scroll). |
| GSAP equivalente | `horizontalLoop()` de GSAP o `gsap.to(row, { xPercent: -50, duration: 50, ease: "none", repeat: -1 })`. Extra para Jorges: acelerarlo según la velocidad de scroll (`ScrollTrigger.create({ onUpdate: self => tl.timeScale(1 + Math.abs(self.getVelocity()) / 300) })`). |

### A11. Bowl fijado mientras aparece el titular (`/values`, V6) — el efecto más "GSAP" del sitio
| Campo | Valor (**medido**) |
|---|---|
| Elementos | `#top_bowl` (posición inicial, Doc-Y 7835, encima de la foto del equipo), `#bowlTrigger` (clon `position: fixed`, oculto con `d-none`), `#bottom_bowl` (posición final, Doc-Y 8577) y `#logo` (GIF "CULTIVATE A BETTER WORLD", `position: absolute`, centrado con translate(−50 %, −50 %)). |
| Fase 1 (scroll < ~7.250) | El bowl de arriba se desplaza con la página. |
| Fase 2 (scroll ≈ 7.250 → 8.000, **~742 px**) | Cuando el bowl llega a `top = 584 px` del viewport (**65 % de vh**), se oculta `#top_bowl` (`opacity: 0`) y se muestra el clon fijo. El bowl **se queda quieto** mientras la foto del equipo sale y el titular sube desde debajo del bowl. |
| Titular | `opacity` **ligada al scroll** de forma lineal: 0,03 → 1 entre scroll 7.000 y 8.000 (≈ `start: "top bottom"`, `end: "top top"` de la sección). |
| Fase 3 (scroll ≥ ~8.000) | Cuando `#bottom_bowl` llega a 584 px, se oculta el clon y se muestra el bowl final, que ya sigue el flujo normal: el bowl "aterriza" sobre el titular. |
| Pin / Scrub | **Pin: sí** (manual, ~742 px, sin espacio añadido); **Scrub: sí** (opacidad del titular). |
| GSAP equivalente | ```ScrollTrigger.create({ trigger: bowl, start: "top 65%", endTrigger: bowlSlot, end: "top 65%", pin: true, pinSpacing: false });``` y ```gsap.fromTo(headline, { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "top top", scrub: true } });``` |

### A12. Video a sangre con titular encima (`/values` V2/V4; card de guacamole en la home)
- Video `autoplay loop playsinline` (con `poster`) y titular blanco centrado encima; en la home los videos se cargan de forma diferida (`lazyloadVideos()` desde el mismo observer de A3).

### A13. Bordes de papel rasgado (`/values`)
- No es una animación, pero es clave en el look: un PNG con alfa (`tear-desktop.png`, 160 px de alto) superpuesto entre la textura de papel y el blanco.

### A14. Cards del constructor de pedidos (`/order/build/...`)
- Card 470x142, `border: 1px solid #D4CBC7`, sin radio. La foto del ingrediente va como `background-image` del contenedor (`background-size: 200px; background-position: -66px`), así que **la comida se sale por el borde izquierdo de la card** (look "a sangre").
- Hover: un overlay cambia el borde a `#451400`. Sin transform.
- Barra **sticky inferior** (`.sticky-bottom-screen`: `position: sticky; bottom: 0`) con "Find a Chipotle for pricing…" y CTA marrón.

### A15. Menú móvil y modales
- La hamburguesa abre un modal a pantalla completa (`.cmg-modal-container.full-screen`) con un fondo `rgba(0,0,0,.3)` que hace fade de opacidad; la entrada tarda menos de 250 ms (`.cmp-modal-container.fade-enter-active { transition: .1s ease-in }`). Los dropdowns usan `scaleY(0 → 1)` en 0,3 s con `cubic-bezier(.23,1,.32,1)` y `transform-origin: top`.
- **Transiciones entre páginas:** ninguna (navegación completa entre páginas AEM; dentro de la app Vue no hay animación de ruta visible).

### Sensación general de easing
- Chipotle es **sobria y "editorial"**: hover instantáneos o de 0,12 s, fades de 1 s con `ease`, parallax y marquee lineales. El carácter lo dan las ilustraciones hand-lettering y la fotografía, no el motion.

---

## 6. Sistema visual

### 6.1 Tipografía (estilos calculados)
| Rol | Familia | Tamaño / peso | Notas |
|---|---|---|---|
| Nav del header | Trade Gothic LT Bold | 24 px / 500, MAYÚSCULAS | `#451400`; activo en rojo con subrayado corto |
| Titulares de sección ("FEATURED", "CROWD PLEASERS") | Trade Gothic LT Bold | 48 px (h2), `line-height: 38px` (muy apretado) | Condensada |
| Nombres de los tiles del menú | Trade Gothic LT Bold | 40 px, MAYÚSCULAS | |
| Titulares de las cards | Trade Gothic LT Bold | ~32 px, MAYÚSCULAS | |
| Botones | Trade Gothic LT / Bold | 20 px (hero, cards), 24 px (outline) | MAYÚSCULAS |
| Hero | Gotham Bold 50 px + Trade Gothic 55 px | | blanco |
| Badges / "SIGN IN / JOIN" / "FIND A CHIPOTLE" | Gotham 500–600 | 14–16 px, `letter-spacing: 1.6px` | |
| Texto | **Nunito** 400 | 16 px | color `#451400` (el texto no es negro: es marrón) |
| Enlaces pequeños del footer / utilidad | Nunito Extra Bold | 16 px / 11 px | |
| Texto de `/values` | Gotham Medium / Black | 18–22 px | |
| Botón "JOIN REWARDS" | FestivoLettersNo2 → Trade Gothic | 16 px / 700 | |
| Titulares grandes de `/values` | **Ilustración** hand-lettering (GIF/SVG) | — | No es una fuente |

**Equivalentes gratuitos para Jorges:** Trade Gothic Bold Condensed → *Oswald 600/700*, *Barlow Condensed 700* o *Antonio*; Gotham → *Montserrat*; Nunito → *Nunito* (Google Fonts); hand-lettering → SVG propios (ideal) o *Caveat Brush* / *Permanent Marker* solo como maqueta.

### 6.2 Colores
| Token | Hex | Uso |
|---|---|---|
| Marrón principal | `#451400` | Texto, titulares, botones primarios, nav |
| Marrón hover | `#6B321B` | Hover de botones marrones, borde del outline en hover |
| Rojo marca | `#AD2118` (`#AC2117`) | CTA del hero, badges, nav activo, "JOIN REWARDS" del footer |
| Rojo hover | `#B3473F` | Hover del CTA rojo |
| Dorado | `#B68207` | CTA de catering, "ORDER →", enlaces "SIGN IN", viñetas |
| Dorado hover | `#976500` | |
| Borde de cards | `#D4CBC7` | Cards de la home y del constructor |
| Borde del outline | `#786259` | Botón "JOIN NOW" |
| Borde del header | `#D7D7D7` | |
| Gris de barras | `#F2F2F2` | Barra de utilidad, barra legal, sticky inferior |
| Gris placeholder | `#F0F0F0` | Fondo del hero antes del video, hover del botón secundario |
| Blanco | `#FFFFFF` | Fondo general |
| Beige del patrón "Featured" | ≈ `#F5F0EB` (**estimado**) | Fondo con ilustraciones |
| Papel de `/values` | ≈ `#EAE3DC` (**estimado**, es una textura JPG) | Fondo de secciones narrativas |

### 6.3 Espaciado, radios, sombras y botones
- **Contenedor:** `.contained { max-width: 1170px; padding: 0 15px }`; el grid del menú llega a `max-width: 1200px`; Featured ocupa ~1216 px.
- **Ritmo vertical:** unos 40–60 px entre secciones; las cards llevan `margin: 16px` (32 px entre cards).
- **Radios:** botones `4px`; badges/píldoras `9999px`; **cards e imágenes 0** (look cuadrado y editorial).
- **Sombras:** casi ninguna. Header `0 10px 11px -5px rgba(0,0,0,.1)` y una sombra suave en las cards de Crowd Pleasers. La "profundidad" de la comida viene de la sombra incluida en el PNG.
- **Botones:**
  - Primario marrón: alto 33–36 px, `padding: 0 12–16px`, Trade Gothic 16–20 px en mayúsculas, blanco sobre `#451400`, radio 4 px, barrido a `#6B321B`.
  - CTA rojo (hero): 134x40, `#AD2118`, barrido a `#B3473F`.
  - Dorado grande: 370x60, `#B68207`.
  - Outline: borde `1px #786259`, texto marrón 24 px, `padding: 10px 20px`, barrido 0,3 s.
  - Enlace-flecha: "SEE THEM ALL →", "CHIPOTLE CAREERS →" (Trade Gothic Bold 16 px con flecha SVG).

---

## 7. Componentes clave (resumen)
| Componente | Descripción breve |
|---|---|
| Header | Sticky, blanco, logo circular + nav condensada en mayúsculas + acciones con icono a la derecha; utilidad gris arriba. Móvil: logo + hamburguesa + "FIND A CHIPOTLE" + bolsa (70 px). |
| Hero | Video cover (450–650 px), contenido centrado: píldora "ALL-NEW", titular blanco grande, texto y CTA rojo. |
| Barra de promo | Una línea centrada: icono + titular + botón + enlace alternativo. |
| Tile de producto | PNG recortado grande + etiqueta píldora + nombre enorme condensado; hover con zoom y CTA dorado. |
| Card editorial | Borde fino `#D4CBC7`, radio 0, mitad texto / mitad media (video), botón de ancho completo abajo. |
| Card de carrusel | Foto a sangre + caption blanco. |
| Card de servicio | Foto de cabecera con el título encima, lista con viñetas doradas, botón dorado grande. |
| Card del constructor | Fila horizontal, ingrediente a sangre por la izquierda, nombre + calorías; borde marrón en hover; sticky CTA inferior. |
| Footer | 3 columnas (enlaces grandes / enlaces pequeños / bloque de Rewards), apps, redes y barra legal gris. |
| Separador | Borde de papel rasgado (PNG). |

---

## 8. Diferencias en móvil (390 px)
| Elemento | Móvil |
|---|---|
| Header | 70 px; hamburguesa + "FIND A CHIPOTLE" visible; nav dentro de un modal a pantalla completa (lista con fondo `#F2F2F2` + bloque de Rewards). |
| Hero | Otro MP4 (vertical/encuadre móvil), el mismo texto centrado y más compacto. |
| Barra de Rewards | Titular en 2 líneas centradas y el botón debajo. |
| Grid del menú | **Lista de 1 columna**: thumbnail de 140 px a la izquierda y nombre a la derecha (~24 px). |
| Cards promocionales | Apiladas: la media arriba (~130 px) y el texto + botón de ancho completo debajo. |
| Featured | Swiper con *peek* de la siguiente card y puntos de paginación. |
| Crowd Pleasers | Cards apiladas con botones dorados de ancho completo. |
| Footer | Una sola columna; el bloque de Rewards va debajo. |
| `/values` | Misma narrativa en una columna; los GIF y el burrito se mantienen. |
| Constructor | Filas a ancho completo con el ingrediente a sangre a la izquierda; cabeceras de categoría con fondo gris; CTA sticky de ancho completo. |

---

## 9. Cómo adaptarlo a Jorges (pizzería premium)

### 9.1 Qué copiar y qué mejorar
- **Copiar:** paleta cálida y terrosa con texto "de color" (no negro), titulares condensados en mayúsculas, comida recortada con sombra incluida sobre blanco o papel, hand-lettering para los mensajes de marca, cards cuadradas con borde fino, botones con barrido de color, papel rasgado como separador.
- **Mejorar:** convertir los efectos de `/values` en ScrollTrigger real (pin + scrub suaves), dar a la home el storytelling que Chipotle solo tiene en `/values` y suavizar los hovers.

**Paleta sugerida (mismos roles que Chipotle):** marrón principal → carbón tostado `#2B1A12` o rojo tomate oscuro `#5A0F0B`; rojo marca → rojo San Marzano `#C8281E`; dorado → corteza/dorado horneado `#C88A1E`; borde → `#DCD2C8`; papel → harina/crema `#F4EDE3`; acento opcional verde albahaca `#3F6B2A`.

### 9.2 Mapa de efectos: de Chipotle a Jorges

| # | Efecto en Chipotle | Equivalente en Jorges | Implementación GSAP (trigger · start/end · props · pin · scrub) |
|---|---|---|---|
| J1 | Header sticky estático (A1) | Header sticky **transparente sobre el hero** que pasa a crema con sombra; **se oculta al bajar y vuelve al subir** | `ScrollTrigger.create({ start: 0, end: "max", onUpdate: s => gsap.to(header, { yPercent: s.direction === 1 && s.scroll() > 120 ? -100 : 0, duration: .35, ease: "power2.out" }) })` + `toggleClass` `is-solid` con `start: "top -80"`. Pin: no. Scrub: no. |
| J2 | Hero con video (A2) | **Hero "ensamblaje de la pizza"**: la masa en el centro; tomate, mozzarella, albahaca, pepperoni, champiñones y aceitunas (PNG/WebP con alfa) **flotan** alrededor (A4) y con el scroll **vuelan y se colocan** sobre la base | Timeline con `scrollTrigger: { trigger: ".hero", start: "top top", end: "+=150%", pin: true, scrub: 0.8 }`. Por ingrediente: `from` posición dispersa (x/y fuera de la base, `rotation` ±40°, `scale` 1.2) → `to` posición final (`x/y` en % del diámetro, `rotation` 0, `scale` .6), con `stagger: .08` y `ease: "power2.inOut"`. Al final: `scale` 1 → 1.04 de la pizza + aparece el titular (`autoAlpha`). |
| J3 | Comida flotando (A4 updown + sombra) | Pizza/porción del hero e ingredientes en reposo con **flotación suave** y la sombra que se encoge | `gsap.to(item, { y: -16, rotation: "+=3", duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 })` + sombra `{ scale: .88, opacity: .45 }` sincronizada. Desfasar cada pieza con `delay: random(0,1.5)`. Pausar cuando J2 entra en scrub (`onEnter: () => floatTl.pause()`). |
| J4 | Parallax del burrito (A8) | **Ingredientes sueltos en parallax** a distintas velocidades (hojas de albahaca, tomates cherry, harina) atravesando los titulares; una **porción con hilo de queso** cruzando la sección "Nuestra masa" | Por capa: `gsap.to(el, { y: () => -speed * section.offsetHeight, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } })` con `speed` entre 0,1 (como Chipotle) y 0,35. Añadir `rotation` 0 → 25° en las hojas. |
| J5 | Titulares hand-lettering en GIF (A9) | Mensajes de marca escritos a mano ("Masa madre de 48 horas", "Horno de leña a 450°") que **se dibujan trazo a trazo** | SVG con trazos + DrawSVGPlugin: `gsap.from(paths, { drawSVG: "0%", duration: 1.6, stagger: .05, ease: "power1.inOut", scrollTrigger: { trigger: svg, start: "top 75%", once: true } })`. Pin: no. Scrub: no (opcional `scrub: 1` si se quiere que se escriba al ritmo del scroll). |
| J6 | Marquee de ingredientes (A10) | **Cinta de ingredientes** (3 filas, direcciones alternas): mozzarella di bufala, San Marzano, albahaca, prosciutto, rúcula, burrata… con su nombre | `horizontalLoop(items, { speed: .6, repeat: -1, reversed: rowIndex === 1 })` + aceleración por velocidad de scroll (`tl.timeScale(1 + |velocity|/400)`, volviendo a 1 con `gsap.to(tl, { timeScale: 1, duration: .6 })`). Hover sobre un ingrediente: pausa + tooltip con su origen. |
| J7 | Bowl fijado + titular que aparece (A11) | **Caja de pizza / tabla de madera fijada** mientras sube el titular "Del horno a tu mesa"; al final la pizza **aterriza** sobre la tabla | `ScrollTrigger.create({ trigger: board, start: "top 65%", endTrigger: ".board-slot", end: "top 65%", pin: true, pinSpacing: false })` + `gsap.fromTo(headline, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "top top", scrub: true } })`. Pin: **sí** (~700–800 px). Scrub: **sí**. |
| J8 | — (efecto nuevo pedido en el brief) | **Porciones que se separan**: pizza entera fijada; con el scroll sus 6–8 porciones (piezas PNG/SVG en cuña) **se separan en radial**, giran un poco y cada una revela una categoría del menú (Clásicas, Especiales, Veganas, Postres…) | `pin: true`, `start: "center center"`, `end: "+=200%"`, `scrub: 1`. Para cada porción i con ángulo θᵢ: `to(slice, { x: cos θᵢ · R, y: sin θᵢ · R, rotation: θᵢ·0.1, ease: "power3.out" }, 0)`; después los labels con `autoAlpha` + `y` y `stagger: .1`. Hilos de queso: un SVG `path` entre porciones con `scaleX` 0 → 1 y después `opacity` → 0. |
| J9 | Fade-in por IntersectionObserver (A3) | Todas las secciones de contenido aparecen con **fade + subida** | `ScrollTrigger.batch(".reveal", { start: "top 80%", once: true, onEnter: els => gsap.from(els, { autoAlpha: 0, y: 40, duration: .9, ease: "power2.out", stagger: .1 }) })` (el mismo umbral del 80 % que usa Chipotle). |
| J10 | Hover de los tiles del menú (A5, instantáneo) | Tile de pizza: la imagen **escala 1,08 y gira 12°** (como si se girara la pizza) + aparece "Pedir →" | CSS `transition: transform .5s cubic-bezier(.2,.8,.2,1)` o `gsap.to(img, { scale: 1.08, rotation: 12, duration: .5, ease: "power3.out" })` en `mouseenter`; CTA con `y: 8 → 0`, `autoAlpha` en 0,25 s. |
| J11 | Botón con barrido (A6) | Igual, con los colores de Jorges (rojo tomate → rojo claro; carbón → marrón tostado) | Solo CSS: `background-size: 200% 100%`, `transition: background-position .25s ease`. |
| J12 | Carrusel Featured (A7) | "Pizzas de temporada" con arrastre y *peek* en móvil | Swiper/Embla o `horizontalLoop` + Draggable + Inertia. |
| J13 | Video a sangre con titular (A12) | Video del **horno de leña / estirado de la masa / hilo de queso** con el titular hand-lettering blanco encima | `<video muted loop playsinline>` + J5 en blanco; opcional `scale 1.1 → 1` con `scrub` mientras la sección cruza el viewport. |
| J14 | Papel rasgado (A13) | **Borde de papel kraft / de caja de pizza rasgado** o un borde que imite la orilla de la masa entre secciones | SVG/PNG con alfa; opcional un leve parallax (`y` ±20 px con scrub). |
| J15 | Constructor con cards a sangre (A14) | **"Arma tu pizza"**: cards con el ingrediente a sangre a la izquierda; al seleccionarlo, el ingrediente **vuela con FLIP** hasta una pizza en miniatura sticky que se va llenando | `Flip.getState(img)` → clonar en la mini-pizza → `Flip.from(state, { duration: .6, ease: "power2.inOut", scale: true })`. CTA sticky inferior "Agregar al pedido · $XX". El borde de la card cambia a color marca en hover/selección. |
| J16 | Menú móvil a pantalla completa (A15) | Overlay a pantalla completa con los ítems entrando **escalonados** | `gsap.timeline({ paused: true }).to(overlay, { autoAlpha: 1, duration: .25 }).from(items, { y: 24, autoAlpha: 0, stagger: .05, duration: .4, ease: "power2.out" }, "<.05")`. |

### 9.3 Estructura propuesta para la home de Jorges (orden de scroll)
1. **Header** transparente → sólido (J1).
2. **Hero pinneado "ensamblaje"** (J2 + J3) con titular hand-lettering (J5) y CTA "Ordenar ahora".
3. **Barra de fidelización** (como la de Rewards): "Únete a Club Jorges. Tu 5.ª pizza va por nuestra cuenta".
4. **Grid del menú** de 3 columnas con PNG recortados (J10), que pasa a lista en móvil (como Chipotle).
5. **Porciones que se separan → categorías** (J8).
6. **"Nuestros ingredientes"**: marquee de 3 filas (J6) + parallax de hojas (J4).
7. **Video del horno** con titular (J13) y papel rasgado (J14).
8. **Tabla fijada + "Del horno a tu mesa"** (J7).
9. **Featured / temporada** (J12) y **Catering / pedidos grupales** (cards con botón dorado).
10. **Footer** de 3 columnas como el de Chipotle.

### 9.4 Notas técnicas para el frontend (TypeScript + GSAP)
- Registrar los plugins: `gsap.registerPlugin(ScrollTrigger, Flip, DrawSVGPlugin)` (todos gratuitos desde GSAP 3.13). Smooth scroll opcional con **Lenis** sincronizado (`lenis.on("scroll", ScrollTrigger.update)`); Chipotle no lo usa, pero da sensación "premium".
- Usar `gsap.matchMedia()` para separar escritorio/móvil: en móvil, pins más cortos (`+=100%`), menos capas de parallax y el ensamblaje del hero simplificado.
- Respetar `prefers-reduced-motion`: desactivar scrub/pin y dejar los estados finales.
- **Assets:** ingredientes recortados en **WebP/AVIF con alfa** (Chipotle usa PNG de 135–355 KB; con WebP se ahorra un 60–70 %), a 2x del tamaño en pantalla, con la sombra suave incluida o como capa aparte (para animar la sombra en J3). Las porciones de J8 deben estar cortadas de la misma foto cenital para que encajen perfectas.
- Pre-cargar las imágenes de las secciones pinneadas antes de crear los ScrollTrigger (o llamar a `ScrollTrigger.refresh()` tras `load`) para que los cálculos de start/end sean correctos.
- Backend .NET 10: este análisis no lo afecta directamente; el menú, los ingredientes y los precios del constructor (J15) deberían venir de la API para poblar las cards y el marquee.

---

## 10. Limitaciones / lo que no se pudo ver
- **Campañas rotativas:** el contenido de la home cambia (hoy: Pollo Asado & Chili Lime Chips). Las clases de flotación `updown`/`shadow` existen en el CSS, pero no había ninguna pieza que las usara en esta visita.
- **Duraciones exactas de los GIF hand-lettering:** no se decodificaron fotograma a fotograma; la duración (~1,5–3 s) está estimada a partir de capturas tomadas a mitad de animación.
- **Lottie:** la librería se carga, pero no se encontró en uso en las páginas inspeccionadas (puede usarse en otras páginas o campañas).
- **Constructor de pedidos:** solo se inspeccionó el layout y el hover. No se seleccionaron ingredientes ni se eligió tienda (habría hecho falta interactuar con el flujo de ubicación), así que no se vieron los estados "seleccionado" ni el carrito.
- **Colores aproximados:** el beige del patrón de Featured y el tono del papel de `/values` son texturas/imágenes; los hex indicados están estimados a partir de las capturas.
- El script de rastreo de cambios en scroll trabajó con pasos de 200–300 px y esperas de 250–450 ms. Las transiciones de menos de 100 ms o los cambios entre pasos pueden no haber quedado registrados con precisión, aunque los efectos principales se confirmaron por varias vías (CSS, JS y capturas).

---

## Anexo — Índice de capturas
**Home escritorio:** `desktop-01-hero`, `02-scroll-450` (header ya sticky), `03-scroll-900` (grid del menú), `04-scroll-1500` (cards promocionales), `05-scroll-2100` (Featured), `06-scroll-2700` (Crowd Pleasers), `07-scroll-3300` y `08-scroll-3900` (footer), `09-menu-tile-hover`, `10/11-promo-fade-in-*`, `12-menu-grid-hover-alt`, `13-hero-button-hover`.
**Home móvil:** `mobile-01-hero` … `mobile-09-scroll-5200`, `mobile-10-hamburger-open`.
**Values escritorio:** `values-desktop-01-y0` … `15-y9200`, `16-cultivate-bowl-pin-start-y7250`, `17/18-cultivate-bowl-pinned-*`.
**Values móvil:** `mobile-11-values-top`, `mobile-12/13/14-values-*`.
**Constructor:** `order-desktop-01-burrito-bowl-builder`, `02-protein-cards`, `03-card-hover`, `04-rice-beans-cards`, `mobile-15-order-builder-cards`.

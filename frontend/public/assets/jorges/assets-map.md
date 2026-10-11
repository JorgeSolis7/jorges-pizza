# Jorges · assets map

Pack visual conceptual para integrar con TypeScript, GSAP y ScrollTrigger. Las imágenes son renderizados 2D con transparencia, no modelos 3D reales.

| Archivo | Uso previsto |
|---|---|
| `pizza-pepperoni-hero.webp` | Pizza pepperoni completa; protagonista del hero y convergencia al terminar el scroll. |
| `pizza-margherita.webp` | Pizza margherita completa; carta, sección de producto o segundo estado de la animación. |
| `slice-pepperoni.webp` | Rebanada individual en ángulo; entrada lateral o transición al producto. |
| `ingredient-pepperoni.webp` | Pepperoni suelto; capa de parallax cercana. |
| `ingredient-basil.webp` | Hoja de albahaca; parallax con giro lento. |
| `ingredient-mozzarella.webp` | Mozzarella desgarrada; ingrediente flotante de plano medio. |
| `ingredient-tomato.webp` | Medio tomate; parallax y secuencia de ingredientes. |
| `ingredient-mushroom.webp` | Champiñón cortado; profundidad y variación en la secuencia. |
| `logo-jorges-dark.svg` | Logotipo vectorial de concepto para fondos oscuros; fuente del logo inline (`LOGO_SVG` en src/lib/icons.ts). |
| `logo-jorges-light.svg` | Variante vectorial para fondos claros. |

## Integración

- Coloca los archivos en `public/assets/jorges/` y referencia rutas absolutas `/assets/jorges/<archivo>`.
- Usa `pizza-pepperoni-hero.webp` con `object-fit: contain`; no recortes con `cover`. Los ingredientes están individualizados y pueden repetirse con distintas escalas, rotaciones y duraciones.
- Para GSAP, anima `transform` y `opacity`; usa `will-change: transform` solo mientras el elemento esté activo, y reduce cantidad/movimiento con `prefers-reduced-motion`.
- Los WebP tienen alfa real. No les añadas fondo sólido ni una máscara rectangular. Los `.svg` son vectoriales y no requieren fuentes externas.
- El logo y la paleta son una propuesta provisional: el túnel temporal no fue accesible desde este entorno, por lo que no se pudo contrastar el DOM, los colores ni los espacios reales. Ajusta el mapeo a las vistas existentes antes de sustituir assets.
- No se incluyen `.glb`/`.gltf`: estos renderizados funcionan como planos 2D con parallax y no son geometría tridimensional.

## Tamaños y peso

| Archivo | Dimensiones px | Peso KiB |
|---|---:|---:|
| `pizza-pepperoni-hero.webp` | 1280 × 1062 | 598 |
| `pizza-margherita.webp` | 960 × 905 | 373 |
| `slice-pepperoni.webp` | 980 × 653 | 197 |
| `ingredient-pepperoni.webp` | 600 × 511 | 119 |
| `ingredient-basil.webp` | 600 × 428 | 59 |
| `ingredient-mozzarella.webp` | 600 × 389 | 42 |
| `ingredient-tomato.webp` | 600 × 590 | 121 |
| `ingredient-mushroom.webp` | 600 × 522 | 85 |


## Ampliación integrada · 11 de octubre de 2026

Se añadieron 55 WebP con transparencia: 29 fotografías generadas con la herramienta integrada image_gen y 26 exportaciones de las ilustraciones SVG existentes, exclusivas de «Arma tu pizza». Los archivos originales del pack se conservan.

- Carta, novedades y carrito: las 15 referencias del catálogo se resuelven desde src/lib/visualAssets.ts hacia este directorio. Margherita y Pepperoni reutilizan las fotos existentes.
- Ingredientes: las 15 fotos nuevas completan las miniaturas del catálogo; rúcula y orégano también entran en el parallax de ScrollTrigger.
- Horno: oven-wood-fired.webp sustituye el arco provisional dibujado.
- Constructor: 20 ingredientes ilustrados, base, queso y tres salsas. (La miniatura `builder-pizza.webp` y los logos raster `logo-jorges-*.webp` se retiraron antes de la publicación: el código no los cargaba.) Exportación sin pérdidas a 768 px (ingredientes) y 1200 px (capas), sin alterar sus coordenadas ni su alineación. La ruta de pomodoro ya no duplica el prefijo «salsa».
- Todas las fotografías nuevas conservan su resolución nativa de 1254 × 1254 px y el canal alfa; WebP calidad 94, alfa calidad 100.
- Prompts exactos, estilo, procedencia de los dibujos, dimensiones y tamaños: [generation-prompts.json](generation-prompts.json).

| Archivo nuevo | Estilo | Dimensiones | KiB |
|---|---|---:|---:|
| pizza-diavola.webp | Foto | 1254 × 1254 | 715 |
| pizza-jorges-especial.webp | Foto | 1254 × 1254 | 737 |
| pizza-prosciutto-rucula.webp | Foto | 1254 × 1254 | 725 |
| pizza-rocoto-andina.webp | Foto | 1254 × 1254 | 818 |
| pizza-cuatro-quesos.webp | Foto | 1254 × 1254 | 713 |
| pizza-dulce-gorgonzola.webp | Foto | 1254 × 1254 | 799 |
| pizza-pesto-verde.webp | Foto | 1254 × 1254 | 797 |
| pizza-marinara.webp | Foto | 1254 × 1254 | 817 |
| pizza-huerta.webp | Foto | 1254 × 1254 | 812 |
| pizza-focaccia-ajo.webp | Foto | 1254 × 1254 | 553 |
| pizza-burrata.webp | Foto | 1254 × 1254 | 502 |
| pizza-tiramisu.webp | Foto | 1254 × 1254 | 568 |
| pizza-limonada-hierbabuena.webp | Foto | 1254 × 1254 | 304 |
| ingredient-parmigiano.webp | Foto | 1254 × 1254 | 420 |
| ingredient-gorgonzola.webp | Foto | 1254 × 1254 | 437 |
| ingredient-prosciutto.webp | Foto | 1254 × 1254 | 369 |
| ingredient-nduja.webp | Foto | 1254 × 1254 | 437 |
| ingredient-aceitunas-botija.webp | Foto | 1254 × 1254 | 400 |
| ingredient-cebolla-caramelizada.webp | Foto | 1254 × 1254 | 473 |
| ingredient-pimientos-asados.webp | Foto | 1254 × 1254 | 442 |
| ingredient-ajo-confitado.webp | Foto | 1254 × 1254 | 418 |
| ingredient-rucula.webp | Foto | 1254 × 1254 | 286 |
| ingredient-oregano.webp | Foto | 1254 × 1254 | 436 |
| ingredient-crema-de-rocoto.webp | Foto | 1254 × 1254 | 358 |
| ingredient-pesto-genoves.webp | Foto | 1254 × 1254 | 572 |
| ingredient-masa-tradicional.webp | Foto | 1254 × 1254 | 478 |
| ingredient-masa-delgada.webp | Foto | 1254 × 1254 | 458 |
| ingredient-masa-integral.webp | Foto | 1254 × 1254 | 429 |
| oven-wood-fired.webp | Foto | 1254 × 1254 | 606 |
| builder-ingredient-masa-tradicional.webp | Dibujo | 768 × 768 | 11 |
| builder-ingredient-masa-delgada.webp | Dibujo | 768 × 768 | 13 |
| builder-ingredient-masa-integral.webp | Dibujo | 768 × 768 | 12 |
| builder-ingredient-salsa-pomodoro.webp | Dibujo | 768 × 768 | 15 |
| builder-ingredient-crema-de-rocoto.webp | Dibujo | 768 × 768 | 14 |
| builder-ingredient-pesto-genoves.webp | Dibujo | 768 × 768 | 15 |
| builder-ingredient-mozzarella.webp | Dibujo | 768 × 768 | 18 |
| builder-ingredient-parmigiano.webp | Dibujo | 768 × 768 | 12 |
| builder-ingredient-gorgonzola.webp | Dibujo | 768 × 768 | 10 |
| builder-ingredient-prosciutto.webp | Dibujo | 768 × 768 | 13 |
| builder-ingredient-pepperoni.webp | Dibujo | 768 × 768 | 35 |
| builder-ingredient-nduja.webp | Dibujo | 768 × 768 | 13 |
| builder-ingredient-champinones.webp | Dibujo | 768 × 768 | 15 |
| builder-ingredient-aceitunas-botija.webp | Dibujo | 768 × 768 | 10 |
| builder-ingredient-cebolla-caramelizada.webp | Dibujo | 768 × 768 | 9 |
| builder-ingredient-pimientos-asados.webp | Dibujo | 768 × 768 | 11 |
| builder-ingredient-ajo-confitado.webp | Dibujo | 768 × 768 | 11 |
| builder-ingredient-albahaca.webp | Dibujo | 768 × 768 | 18 |
| builder-ingredient-rucula.webp | Dibujo | 768 × 768 | 11 |
| builder-ingredient-oregano.webp | Dibujo | 768 × 768 | 11 |
| builder-base.webp | Dibujo | 1200 × 1200 | 111 |
| builder-cheese.webp | Dibujo | 1200 × 1200 | 24 |
| builder-sauce-pomodoro.webp | Dibujo | 1200 × 1200 | 27 |
| builder-sauce-rocoto.webp | Dibujo | 1200 × 1200 | 27 |
| builder-sauce-pesto.webp | Dibujo | 1200 × 1200 | 28 |

## Pizza base

- pizza-base.webp: vista frontal ligeramente inclinada, solo masa crujiente, salsa de tomate y mozzarella fundida. Fotografía generada con image_gen, iluminación premium del hero, WebP con alfa real preservado. 1377 × 1142 px.

## Variantes 640 px

- `pizza-<slug>-640.webp` (15 de la carta + `pizza-base-640.webp`): reducciones a 640 px de ancho con alfa, WebP q 0.86 (~65-190 KiB). `catalogImage()` (src/lib/img.ts) las sirve con `srcset` 640w/original y `sizes`.

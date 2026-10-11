# Jorges: paleta de color

> Paso 1c del sistema de diseño. Fuente de verdad para el color del sitio de Jorges.
> Archivo de implementación: [`palette.css`](./palette.css), con variables CSS, modo claro y oscuro y un bloque `@theme` para Tailwind v4.
> Todos los ratios de contraste de este documento se calcularon con la fórmula de luminancia relativa de WCAG 2.x (script Node); no son estimaciones.

---

## 1. Colores de marca

| Rol | Nombre | Hex | Token |
|---|---|---|---|
| Primario | **Tomate San Marzano** | `#C8341E` | `tomate-600` |
| Secundario / acento | **Queso fundido** | `#F2B33D` | `queso-400` |
| Oscuro de contraste | **Carbón de horno** | `#261C17` (superficies) / `#17100C` (texto) | `masa-900` / `masa-950` |
| Fondo | **Crema de harina** | `#FAF5EA` | `masa-50` |
| Terciario / éxito | **Albahaca** | `#3B7B37` | `albahaca-600` |
| Solo para errores | **Vino** | `#A8213A` | `vino-600` |

### Por qué estos colores

- **Tomate `#C8341E`** (HSL 8°, 74 %, 45 %). Es un rojo de salsa cocida con un punto anaranjado: cálido y apetecible, sin el rojo puro y frío de la comida rápida. De la horquilla propuesta (`#C8341E` a `#D6402A`) es el único tono que mantiene **texto crema sobre rojo ≥ 4.5:1** (4.87:1) y, a la vez, **rojo como texto sobre crema ≥ 4.5:1**. `#D6402A` se ve algo más vivo, pero baja a 4.21:1 sobre crema y suspende AA en texto normal. Con este tono un mismo rojo vale para botones, titulares y fondos de sección sin tener que cambiarlo.
- **Queso `#F2B33D`**. Es un amarillo dorado de mozzarella gratinada. Tira hacia el ámbar y no hacia el limón, porque así casa con el tomate y el carbón. Como todos los amarillos, **no sirve como texto sobre fondos claros** (1.71:1 sobre crema). Su lugar es el texto, iconos y subrayados sobre carbón o rojo oscuro, o como fondo de botón con texto carbón (10.12:1).
- **Masa / carbón**. Es un neutro cálido que va de la crema de harina (`#FAF5EA`) a un negro tostado de horno de leña (`#17100C`). Tiene un matiz marrón en toda la escala, así que nunca queda gris frío. Hace de equivalente pizzero del marrón casi negro de Chipotle: los fondos de hero y footer en `masa-900` le dan al sitio un aire premium y de restaurante, no de cadena.
- **Albahaca `#3B7B37`**. Es un verde hoja, algo apagado. Se usa poco: estados de éxito, etiquetas "vegetariana" y pequeños detalles. Es el tercer color de la bandera italiana sin convertirse en tema.
- **Vino `#A8213A`**. Peligro y error necesitan un rojo que no se confunda con el rojo de marca. El vino es más frío (matiz 350°) y más oscuro que el tomate. Aun así, **los errores siempre llevan icono y texto**, nunca solo color.

---

## 2. Escalas completas (50–950)

Método: los tonos se generaron en HSL a partir del color de marca, siguiendo la skill *color-palette*. Se mantuvo el matiz (con un ligero giro hacia naranja o ámbar en los tonos oscuros del queso para que no se vuelvan verde oliva), la saturación baja en los tonos claros para evitar pasteles chillones, y el hex de marca va exacto en su paso. En el neutro *masa* el matiz pasa de 40° en la crema a 18° en el carbón, con más saturación en los extremos y menos en los medios, para que la crema sea cálida y el carbón tostado.

Las columnas muestran el contraste de cada tono contra blanco, contra el fondo crema (`masa-50`) y contra el fondo carbón (`masa-950`). **Para texto normal hace falta ≥ 4.5; para texto grande o UI, ≥ 3.**

#### tomate

| Tono | Hex | vs blanco | vs crema (masa-50) | vs carbón (masa-950) |
|---|---|---|---|---|
| 50 | `#FDF4F1` | 1.08 | 1.00 | 17.37 |
| 100 | `#FCE4DF` | 1.21 | 1.12 | 15.51 |
| 200 | `#F8C8BF` | 1.50 | 1.38 | 12.55 |
| 300 | `#F2A092` | 2.06 | 1.89 | 9.16 |
| 400 | `#E9705D` | 3.03 | 2.78 | 6.22 |
| 500 | `#DE4C35` | 4.05 | 3.72 | 4.65 |
| 600 | `#C8341E` | 5.30 | 4.87 | 3.55 |
| 700 | `#A2281A` | 7.36 | 6.77 | 2.56 |
| 800 | `#812118` | 9.70 | 8.92 | 1.94 |
| 900 | `#5F1B16` | 12.69 | 11.67 | 1.48 |
| 950 | `#34100E` | 17.12 | 15.75 | 1.10 |

#### queso

| Tono | Hex | vs blanco | vs crema (masa-50) | vs carbón (masa-950) |
|---|---|---|---|---|
| 50 | `#FEF9EC` | 1.05 | 1.03 | 17.90 |
| 100 | `#FCEFCF` | 1.14 | 1.05 | 16.48 |
| 200 | `#FAE0A3` | 1.29 | 1.19 | 14.57 |
| 300 | `#F6CB6F` | 1.53 | 1.41 | 12.27 |
| 400 | `#F2B33D` | 1.86 | 1.71 | 10.12 |
| 500 | `#E89417` | 2.42 | 2.23 | 7.78 |
| 600 | `#C17115` | 3.72 | 3.42 | 5.05 |
| 700 | `#975217` | 5.94 | 5.46 | 3.17 |
| 800 | `#723D17` | 8.77 | 8.06 | 2.15 |
| 900 | `#512B15` | 12.31 | 11.32 | 1.53 |
| 950 | `#2B170D` | 17.06 | 15.69 | 1.10 |

#### masa

| Tono | Hex | vs blanco | vs crema (masa-50) | vs carbón (masa-950) |
|---|---|---|---|---|
| 50 | `#FAF5EA` | 1.09 | 1.00 | 17.31 |
| 100 | `#F2E9D9` | 1.20 | 1.11 | 15.62 |
| 200 | `#E2D4C1` | 1.46 | 1.34 | 12.92 |
| 300 | `#BFAF9B` | 2.14 | 1.97 | 8.80 |
| 400 | `#988776` | 3.46 | 3.19 | 5.43 |
| 500 | `#796A5D` | 5.21 | 4.79 | 3.61 |
| 600 | `#63554B` | 7.16 | 6.59 | 2.63 |
| 700 | `#4D4038` | 9.97 | 9.17 | 1.89 |
| 800 | `#372C25` | 13.55 | 12.47 | 1.39 |
| 900 | `#261C17` | 16.65 | 15.32 | 1.13 |
| 950 | `#17100C` | 18.82 | 17.31 | 1.00 |

#### albahaca

| Tono | Hex | vs blanco | vs crema (masa-50) | vs carbón (masa-950) |
|---|---|---|---|---|
| 50 | `#F2F9F1` | 1.07 | 1.01 | 17.56 |
| 100 | `#DFEFDC` | 1.20 | 1.10 | 15.70 |
| 200 | `#BFDEBA` | 1.46 | 1.34 | 12.88 |
| 300 | `#91C68B` | 1.97 | 1.81 | 9.55 |
| 400 | `#5DAD58` | 2.77 | 2.55 | 6.80 |
| 500 | `#489245` | 3.84 | 3.53 | 4.90 |
| 600 | `#3B7B37` | 5.15 | 4.74 | 3.65 |
| 700 | `#2D642B` | 7.07 | 6.50 | 2.66 |
| 800 | `#225021` | 9.39 | 8.63 | 2.01 |
| 900 | `#173B17` | 12.54 | 11.53 | 1.50 |
| 950 | `#0C220D` | 16.80 | 15.45 | 1.12 |

#### vino (solo estados de peligro)

| Tono | Hex |
|---|---|
| 50 | `#FCEEF0` |
| 100 | `#F8D8DE` |
| 400 | `#F07A8A` |
| 600 | `#A8213A` |
| 800 | `#641623` |


**Lectura rápida:**
- Tomate: sobre crema, los tonos **600 o más oscuros** valen como texto. Sobre carbón, los tonos **500 o más claros** (para texto normal, 400 o más claros es lo cómodo).
- Queso: sobre crema solo valen como texto los tonos **700 o más oscuros** (el 800 es el recomendado). Sobre carbón valen **del 50 al 600**.
- Masa: sobre crema, texto atenuado con **500 o más oscuro**. Sobre carbón, **400 o más claro**.
- Albahaca: sobre crema, **600 o más oscuro**. Sobre carbón, **500 o más claro**.

---

## 3. Tokens semánticos

Los componentes usan **siempre** tokens semánticos (`bg-primary`, `text-muted-foreground`…), nunca hex sueltos. Cada fondo tiene su par `-foreground`. Para texto de color sobre el fondo de página existen los tokens `*-text` (`primary-text`, `accent-text`, `success-text`, `warning-text`, `danger-text`), porque el tono que funciona como fondo de botón no siempre funciona como texto.

| Token | Claro | Oscuro |
|---|---|---|
| `--color-background` | `masa-50` #FAF5EA | `masa-950` #17100C |
| `--color-foreground` | `masa-950` #17100C | `masa-50` #FAF5EA |
| `--color-surface` | `harina` #FFFDF8 | `masa-900` #261C17 |
| `--color-surface-foreground` | `masa-950` #17100C | `masa-50` #FAF5EA |
| `--color-muted` | `masa-100` #F2E9D9 | `masa-800` #372C25 |
| `--color-muted-foreground` | `masa-600` #63554B | `masa-300` #BFAF9B |
| `--color-primary` | `tomate-600` #C8341E | `tomate-600` #C8341E |
| `--color-primary-hover` | `tomate-700` #A2281A | `tomate-700` #A2281A |
| `--color-primary-foreground` | `masa-50` #FAF5EA | `masa-50` #FAF5EA |
| `--color-primary-text` | `tomate-700` #A2281A | `tomate-400` #E9705D |
| `--color-secondary` | `masa-900` #261C17 | `masa-50` #FAF5EA |
| `--color-secondary-foreground` | `masa-50` #FAF5EA | `masa-950` #17100C |
| `--color-accent` | `queso-400` #F2B33D | `queso-400` #F2B33D |
| `--color-accent-foreground` | `masa-950` #17100C | `masa-950` #17100C |
| `--color-accent-text` | `queso-800` #723D17 | `queso-300` #F6CB6F |
| `--color-border` | `masa-200` #E2D4C1 | `masa-800` #372C25 |
| `--color-input` | `masa-500` #796A5D | `masa-400` #988776 |
| `--color-ring` | `tomate-600` #C8341E | `queso-400` #F2B33D |
| `--color-success` | `albahaca-600` #3B7B37 | `albahaca-400` #5DAD58 |
| `--color-success-foreground` | `#FFFFFF` #FFFFFF | `masa-950` #17100C |
| `--color-success-text` | `albahaca-700` #2D642B | `albahaca-300` #91C68B |
| `--color-warning` | `queso-400` #F2B33D | `queso-400` #F2B33D |
| `--color-warning-foreground` | `masa-950` #17100C | `masa-950` #17100C |
| `--color-warning-text` | `queso-800` #723D17 | `queso-300` #F6CB6F |
| `--color-danger` | `vino-600` #A8213A | `vino-400` #F07A8A |
| `--color-danger-foreground` | `masa-50` #FAF5EA | `masa-950` #17100C |
| `--color-danger-text` | `vino-600` #A8213A | `vino-400` #F07A8A |


Notas:
- `border` es un **separador decorativo** (líneas entre secciones, contorno de tarjetas) y no necesita 3:1. Si un borde tiene que identificar un control (inputs, checkboxes, selects, botón outline), usa `input`, que sí llega a ≥ 3:1 en ambos modos.
- En modo oscuro el botón primario **no cambia de color** (sigue en `tomate-600` con texto crema). Así el rojo de marca es idéntico en ambos modos. Un tono más claro (`tomate-500`) obligaría a usar texto oscuro sobre rojo. Los enlaces y el texto rojo sí suben a `tomate-400` en oscuro.
- `ring` (foco): tomate en modo claro y queso en modo oscuro. El queso sobre carbón da 10:1 y se distingue del botón rojo al que rodea.
- `primary-hover` es más oscuro en ambos modos (`tomate-700`). En modo oscuro el contorno del botón en hover queda en 2.56:1 frente al fondo. No es un problema: la etiqueta de texto identifica el botón y mantiene 6.77:1, y WCAG 1.4.11 no exige contraste del relleno cuando el texto identifica el control.

---

## 4. Tabla de contraste WCAG (verificada)

Umbrales AA: **4.5:1** para texto normal, **3:1** para texto grande (≥ 24 px, o ≥ 18.66 px en negrita) y para componentes de UI o foco. Todas las combinaciones recomendadas pasan; ninguna aparece como "FALLA".

### Modo claro

| Par | Texto / elemento | Fondo | Ratio | Mínimo | Resultado |
|---|---|---|---|---|---|
| Texto principal | `masa-950` #17100C | `masa-50` #FAF5EA | **17.31:1** | 4.5:1 | AAA |
| Texto en tarjeta | `masa-950` #17100C | `harina` #FFFDF8 | **18.51:1** | 4.5:1 | AAA |
| Texto atenuado sobre fondo | `masa-600` #63554B | `masa-50` #FAF5EA | **6.59:1** | 4.5:1 | AA |
| Texto atenuado sobre muted | `masa-600` #63554B | `masa-100` #F2E9D9 | **5.95:1** | 4.5:1 | AA |
| Texto atenuado sobre tarjeta | `masa-600` #63554B | `harina` #FFFDF8 | **7.05:1** | 4.5:1 | AAA |
| Botón primario (texto) | `masa-50` #FAF5EA | `tomate-600` #C8341E | **4.87:1** | 4.5:1 | AA |
| Botón primario hover (texto) | `masa-50` #FAF5EA | `tomate-700` #A2281A | **6.77:1** | 4.5:1 | AA |
| Botón primario vs fondo (UI) | `tomate-600` #C8341E | `masa-50` #FAF5EA | **4.87:1** | 3:1 | AA (cumple también 4.5) |
| Botón primario vs tarjeta (UI) | `tomate-600` #C8341E | `harina` #FFFDF8 | **5.21:1** | 3:1 | AA (cumple también 4.5) |
| Enlace / texto rojo | `tomate-700` #A2281A | `masa-50` #FAF5EA | **6.77:1** | 4.5:1 | AA |
| Enlace en tarjeta | `tomate-700` #A2281A | `harina` #FFFDF8 | **7.24:1** | 4.5:1 | AAA |
| Botón secundario (texto) | `masa-50` #FAF5EA | `masa-900` #261C17 | **15.32:1** | 4.5:1 | AAA |
| Botón/acento queso (texto) | `masa-950` #17100C | `queso-400` #F2B33D | **10.12:1** | 4.5:1 | AAA |
| Texto acento queso sobre fondo | `queso-800` #723D17 | `masa-50` #FAF5EA | **8.06:1** | 4.5:1 | AAA |
| Borde de input (UI) | `masa-500` #796A5D | `masa-50` #FAF5EA | **4.79:1** | 3:1 | AA (cumple también 4.5) |
| Borde de input en tarjeta (UI) | `masa-500` #796A5D | `harina` #FFFDF8 | **5.12:1** | 3:1 | AA (cumple también 4.5) |
| Anillo de foco (UI) | `tomate-600` #C8341E | `masa-50` #FAF5EA | **4.87:1** | 3:1 | AA (cumple también 4.5) |
| Éxito (texto en badge) | `#FFFFFF` #FFFFFF | `albahaca-600` #3B7B37 | **5.15:1** | 4.5:1 | AA |
| Texto de éxito sobre fondo | `albahaca-700` #2D642B | `masa-50` #FAF5EA | **6.50:1** | 4.5:1 | AA |
| Aviso (texto en badge) | `masa-950` #17100C | `queso-400` #F2B33D | **10.12:1** | 4.5:1 | AAA |
| Texto de aviso sobre fondo | `queso-800` #723D17 | `masa-50` #FAF5EA | **8.06:1** | 4.5:1 | AAA |
| Peligro (texto en botón) | `masa-50` #FAF5EA | `vino-600` #A8213A | **6.56:1** | 4.5:1 | AA |
| Texto de peligro sobre fondo | `vino-600` #A8213A | `masa-50` #FAF5EA | **6.56:1** | 4.5:1 | AA |

### Modo oscuro

| Par | Texto / elemento | Fondo | Ratio | Mínimo | Resultado |
|---|---|---|---|---|---|
| Texto principal | `masa-50` #FAF5EA | `masa-950` #17100C | **17.31:1** | 4.5:1 | AAA |
| Texto en tarjeta | `masa-50` #FAF5EA | `masa-900` #261C17 | **15.32:1** | 4.5:1 | AAA |
| Texto atenuado sobre fondo | `masa-300` #BFAF9B | `masa-950` #17100C | **8.80:1** | 4.5:1 | AAA |
| Texto atenuado sobre muted | `masa-300` #BFAF9B | `masa-800` #372C25 | **6.34:1** | 4.5:1 | AA |
| Texto atenuado sobre tarjeta | `masa-300` #BFAF9B | `masa-900` #261C17 | **7.79:1** | 4.5:1 | AAA |
| Botón primario (texto) | `masa-50` #FAF5EA | `tomate-600` #C8341E | **4.87:1** | 4.5:1 | AA |
| Botón primario hover (texto) | `masa-50` #FAF5EA | `tomate-700` #A2281A | **6.77:1** | 4.5:1 | AA |
| Botón primario vs fondo (UI) | `tomate-600` #C8341E | `masa-950` #17100C | **3.55:1** | 3:1 | AA texto grande / UI |
| Botón primario vs tarjeta (UI) | `tomate-600` #C8341E | `masa-900` #261C17 | **3.15:1** | 3:1 | AA texto grande / UI |
| Enlace / texto rojo | `tomate-400` #E9705D | `masa-950` #17100C | **6.22:1** | 4.5:1 | AA |
| Enlace en tarjeta | `tomate-400` #E9705D | `masa-900` #261C17 | **5.50:1** | 4.5:1 | AA |
| Botón secundario (texto) | `masa-950` #17100C | `masa-50` #FAF5EA | **17.31:1** | 4.5:1 | AAA |
| Botón/acento queso (texto) | `masa-950` #17100C | `queso-400` #F2B33D | **10.12:1** | 4.5:1 | AAA |
| Texto acento queso sobre fondo | `queso-300` #F6CB6F | `masa-950` #17100C | **12.27:1** | 4.5:1 | AAA |
| Borde de input (UI) | `masa-400` #988776 | `masa-950` #17100C | **5.43:1** | 3:1 | AA (cumple también 4.5) |
| Borde de input en tarjeta (UI) | `masa-400` #988776 | `masa-900` #261C17 | **4.81:1** | 3:1 | AA (cumple también 4.5) |
| Anillo de foco (UI) | `queso-400` #F2B33D | `masa-950` #17100C | **10.12:1** | 3:1 | AA (cumple también 4.5) |
| Éxito (texto en badge) | `masa-950` #17100C | `albahaca-400` #5DAD58 | **6.80:1** | 4.5:1 | AA |
| Texto de éxito sobre fondo | `albahaca-300` #91C68B | `masa-950` #17100C | **9.55:1** | 4.5:1 | AAA |
| Aviso (texto en badge) | `masa-950` #17100C | `queso-400` #F2B33D | **10.12:1** | 4.5:1 | AAA |
| Texto de aviso sobre fondo | `queso-300` #F6CB6F | `masa-950` #17100C | **12.27:1** | 4.5:1 | AAA |
| Peligro (texto en botón) | `masa-950` #17100C | `vino-400` #F07A8A | **7.04:1** | 4.5:1 | AAA |
| Texto de peligro sobre fondo | `vino-400` #F07A8A | `masa-950` #17100C | **7.04:1** | 4.5:1 | AAA |

### Combinaciones de marca (secciones, hero, badges)

| Par | Texto / elemento | Fondo | Ratio | Mínimo | Resultado |
|---|---|---|---|---|---|
| Hero carbón: crema sobre carbón | `masa-50` #FAF5EA | `masa-900` #261C17 | **15.32:1** | 4.5:1 | AAA |
| Hero carbón: queso sobre carbón | `queso-400` #F2B33D | `masa-900` #261C17 | **8.95:1** | 4.5:1 | AAA |
| Hero carbón: atenuado sobre carbón | `masa-300` #BFAF9B | `masa-900` #261C17 | **7.79:1** | 4.5:1 | AAA |
| Hero carbón: botón tomate vs carbón (UI) | `tomate-600` #C8341E | `masa-900` #261C17 | **3.15:1** | 3:1 | AA texto grande / UI |
| Banda tomate: crema sobre tomate-600 | `masa-50` #FAF5EA | `tomate-600` #C8341E | **4.87:1** | 4.5:1 | AA |
| Banda tomate: crema sobre tomate-700 | `masa-50` #FAF5EA | `tomate-700` #A2281A | **6.77:1** | 4.5:1 | AA |
| Banda tomate: queso-300 sobre tomate-800 | `queso-300` #F6CB6F | `tomate-800` #812118 | **6.33:1** | 4.5:1 | AA |
| Banda tomate: queso-400 sobre tomate-700 (solo texto grande) | `queso-400` #F2B33D | `tomate-700` #A2281A | **3.96:1** | 3:1 | AA texto grande / UI |
| Banda queso: carbón sobre queso-400 | `masa-950` #17100C | `queso-400` #F2B33D | **10.12:1** | 4.5:1 | AAA |
| Banda queso: tomate-800 sobre queso-200 | `tomate-800` #812118 | `queso-200` #FAE0A3 | **7.51:1** | 4.5:1 | AAA |
| Banda queso: tomate-700 sobre queso-300 (titular) | `tomate-700` #A2281A | `queso-300` #F6CB6F | **4.80:1** | 3:1 | AA (cumple también 4.5) |
| Titular tomate-600 sobre crema | `tomate-600` #C8341E | `masa-50` #FAF5EA | **4.87:1** | 4.5:1 | AA |
| Titular carbón sobre crema | `masa-950` #17100C | `masa-50` #FAF5EA | **17.31:1** | 4.5:1 | AAA |
| Placeholder masa-500 sobre harina | `masa-500` #796A5D | `harina` #FFFDF8 | **5.12:1** | 4.5:1 | AA |
| Badge albahaca-800 sobre albahaca-100 | `albahaca-800` #225021 | `albahaca-100` #DFEFDC | **7.83:1** | 4.5:1 | AAA |
| Badge tomate-800 sobre tomate-100 | `tomate-800` #812118 | `tomate-100` #FCE4DF | **7.99:1** | 4.5:1 | AAA |
| Badge queso-800 sobre queso-100 | `queso-800` #723D17 | `queso-100` #FCEFCF | **7.68:1** | 4.5:1 | AAA |
| Badge vino-800 sobre vino-50 | `vino-800` #641623 | `vino-50` #FCEEF0 | **11.08:1** | 4.5:1 | AAA |


**Superposición sobre fotografía (hero con imagen de pizza, GSAP).** El peor caso se calculó sobre una zona blanca de la foto con una capa de `masa-950`:
- Opacidad del 60 %: texto crema a **4.51:1** (justo en el límite).
- Opacidad del **65 %: 5.39:1**. Es el **mínimo recomendado** para texto crema de cuerpo.
- Opacidad del 70 %: queso-400 a **3.77:1**. Basta para titulares grandes en queso; para texto queso pequeño, no lo uses sobre foto.
- Si la capa se anima (fade o parallax), el texto no debe aparecer hasta que la capa alcance esa opacidad.

---

## 5. Guía de uso

### Proporción aproximada (regla 60 / 25 / 10 / 5)
- **60 %, crema y carbón (masa).** Fondos de página, texto y secciones alternas.
- **25 %, tomate.** CTAs, titulares de impacto y bandas de sección a color completo, al estilo Chipotle.
- **10 %, queso.** Acentos: precios, subrayados animados, badges, iconos y destacados sobre fondo oscuro.
- **5 %, albahaca.** Éxito, etiqueta "veggie" y detalles ornamentales.

### Por elemento

| Elemento | Color | Notas |
|---|---|---|
| **CTA principal** ("Pide ahora", "Reservar") | `bg-primary` + `text-primary-foreground`; hover `bg-primary-hover` | Un solo CTA rojo por vista. Texto en negrita, ≥ 16 px. |
| **CTA secundario** | `bg-secondary` + `text-secondary-foreground` (carbón con texto crema en claro, crema con texto carbón en oscuro) | Para "Ver menú" junto al CTA rojo. |
| **CTA sobre fondo rojo o carbón** | `bg-accent` + `text-accent-foreground` (queso con texto carbón, 10.12:1) | El queso destaca sobre rojo y sobre carbón. Un botón rojo sobre fondo rojo no se vería. |
| **Botón outline** | borde `input`, texto `foreground`; hover `bg-muted` | |
| **Hero** | Opción A: fondo `masa-900` (carbón) con titular `masa-50` y palabra clave en `queso-400`. Opción B: foto con capa `masa-950` al ≥ 65 %. | La opción A es la más premium. El CTA tomate sobre carbón tiene un contorno de 3.15:1. |
| **Bandas de sección "manifiesto"** | Fondo `tomate-600` con texto `masa-50` (4.87:1); para párrafos largos, `tomate-700` (6.77:1) | Titulares display en `queso-300` sobre `tomate-800` (6.33:1). `queso-400` sobre `tomate-700` solo en texto grande (3.96:1). |
| **Titulares (H1–H2) sobre crema** | `masa-950` por defecto; palabra destacada en `tomate-600` (4.87:1) | En tamaños display cualquier tomate ≥ 600 sobra. |
| **Cuerpo de texto** | `foreground` | Nunca `tomate` ni `queso` para párrafos. |
| **Texto secundario, metadatos, descripciones de platos** | `muted-foreground` | |
| **Enlaces en línea** | `text-primary-text` + subrayado | En claro, `tomate-700`; en oscuro, `tomate-400`. |
| **Precios** | `foreground` en negrita; sobre carbón, `queso-400` | Sobre crema, el queso no vale como texto: usa `accent-text` (`queso-800`). |
| **Tarjetas de producto** | `bg-surface` + borde `border`; sobre fondo `background` | En claro, harina sobre crema; en oscuro, `masa-900` sobre `masa-950`. |
| **Secciones alternas** | `bg-muted` (masa-100) frente a `bg-background` | Para ritmo visual en el scroll. |
| **Footer** | `masa-900` o `masa-950` con texto `masa-50` y enlaces `masa-300` (hover `queso-400`) | |
| **Badges** | "Picante": `tomate-100` / `tomate-800` · "Veggie": `albahaca-100` / `albahaca-800` · "Nuevo": `queso-100` / `queso-800` o `bg-accent` | Todos ≥ 7.5:1. |
| **Formularios** | borde `input`, foco con `ring` (outline 2 px y offset 2 px), error con borde y texto `danger-text` + icono | |
| **Estados** | éxito con `success`, aviso con `warning`, error con `danger` | Nunca solo color: siempre icono y mensaje. |
| **Selección de texto** | `accent` / `accent-foreground` | Ya está definido en `palette.css`. |

### Qué evitar
- Texto `queso-*` (≤ 600) sobre crema o blanco: no llega a 4.5.
- Texto `tomate-500` o más claro sobre crema (3.72:1).
- Texto crema sobre `tomate-500` o más claro.
- Botón rojo sobre banda roja; en ese caso usa el botón queso.
- Usar `vino` como color decorativo: está reservado para errores.
- Animaciones GSAP que hagan pasar el texto por fondos donde suspenda: comprueba **ambos extremos** de los degradados y de los cambios de color de fondo durante el scroll, y revela el texto solo cuando el fondo final ya está en su sitio.

---

## 6. Implementación

```css
/* src/styles/main.css */
@import "tailwindcss";
@import "./palette.css";
@custom-variant dark (&:where(.dark, .dark *, [data-theme="dark"], [data-theme="dark"] *));
```

```html
<a class="bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-2 ring-ring ring-offset-2 ring-offset-background">Pide ahora</a>
<section class="bg-masa-900 text-masa-50">
  <h1>Pizza al horno de <span class="text-queso-400">leña</span></h1>
</section>
```

- El modo oscuro se activa con la clase `.dark` o `[data-theme="dark"]` en `<html>`, o automáticamente con `prefers-color-scheme: dark` si no se ha forzado `.light`.
- Estructura de `palette.css`: un `@theme` con las escalas (genera utilidades como `bg-tomate-600` o `text-masa-950`), un `@theme inline` con los semánticos (`bg-primary` lee `var(--primary)`), y bloques `:root` / `.dark` / `prefers-color-scheme` con las variables de runtime en hex directo.
- Sin Tailwind, el navegador ignora los bloques `@theme`, pero `var(--primary)`, `var(--foreground)`, etc. funcionan igual. Para los tonos de escala en CSS plano, copia las líneas `--color-*` del primer `@theme` a `:root`.

# Nexum — Lenguaje visual

> Documento de dirección de arte. Define **qué valores** debe tener la interfaz.
> Está escrito para que quien lo convierta en código no tenga que preguntar nada:
> todo valor es un número o un hex. Fuente de verdad: los mockups de teléfono que
> aparecen dentro de los flyers de Nexum, Coolio y Plantico.

Versión 1.1 · Referencias: `brand/completos/`, `brand/iconos/`, `brand/mascotas/`
Afecta a: `apps/mobile/ui/tokens.ts`, `apps/mobile/ui/theme.ts` y todos los componentes de `apps/mobile/ui/`.

Cubre: color, profundidad, tipografía, espaciado, iconografía, acento por módulo, **modo oscuro completo** (§4) y **movimiento y vibración** (§5).

---

## 1. Qué transmite la marca, en una frase

**Nexum es la calma doméstica hecha interfaz: superficies blancas muy redondeadas flotando sobre una luz cálida, un solo dato grande que te dice lo que importa, y todo lo demás en silencio.**

De ahí salen tres reglas que gobiernan el resto del documento:

1. **Luz cálida, no blanco clínico.** El lienzo nunca es `#FFFFFF`; el blanco puro está reservado a las tarjetas, para que floten.
2. **Un protagonista por pantalla.** En cada pantalla hay exactamente **un** dato enorme (24°C, 68%, 75%). Todo lo demás baja de tamaño y de contraste para dejarle sitio.
3. **El color es información, no decoración.** Verde Nexum = la app. Cyan = Coolio. Verde agua = Plantico. Si un color no significa nada, no aparece.

---

## 2. Lectura de los mockups

Lo que se ve, medido sobre los tres flyers (todos son maquetas de iPhone de 393 pt de ancho; los valores están normalizados a puntos):

| Observación en el mockup | Consecuencia para los tokens |
|---|---|
| El fondo de la pantalla es un blanco roto cálido, casi imperceptible; el crema fuerte solo aparece en el **fondo del flyer**, no dentro del teléfono | El lienzo de la app es `#FAF8F4`, no `#F5F2EC` |
| Las tarjetas son blanco puro, **sin borde visible**, separadas del fondo solo por una sombra amplia y muy suave | Prohibido borde + sombra a la vez en tarjetas |
| El radio de las tarjetas es muy generoso: en las tarjetas de dispositivo se ve ~20–24 pt, en los contenedores grandes ~24–28 pt | `radius.card = 22`, `radius.sheet = 28` |
| El selector de escenas (En casa / Noche / Fuera / Eco) usa píldoras cuadradas de ~78×72 pt, radio ~18, la activa en verde oscuro sólido | Chip de escena como componente propio |
| El `24°C` del dial de Coolio ocupa cerca de un tercio del ancho de la tarjeta; es el elemento más grande de la pantalla con diferencia | Estilo tipográfico `dataHero`, 56 pt |
| Los `68%` / `22°C` de Plantico son de segundo nivel, con una etiqueta minúscula encima y un icono a la izquierda | Estilo `dataM` + `label` + azulejo de estadística |
| Todos los iconos son de línea, de grosor uniforme, redondeados en las puntas, sin relleno | Una sola librería, `strokeWidth` fijo, nada de iconos macizos |
| Cada módulo aparece con su color solo en su azulejo de icono y en su indicador de estado; los rótulos y la barra de pestañas siguen siendo neutros/verdes | Regla del acento ≤ 10% |
| Los estados (`Todo bien`, `Encendido`) son un punto de 8 pt + texto pequeño, nunca una etiqueta rellena grande | `StatusDot`, no `Badge`, para estado de dispositivo |

---

## 3. Tabla de tokens propuesta

### 3.1 Paleta base (`palette`)

Valores crudos. **Ningún componente puede importar de aquí**: se usan solo para construir `colors`.

| Token | Hex | Procedencia / uso |
|---|---|---|
| `warm50` | `#FDFCFA` | Blanco cálido, hojas elevadas |
| `warm100` | `#FAF8F4` | **Lienzo de la app** |
| `warm200` | `#F2EFE9` | Superficie hundida: inputs, chips inactivos |
| `warm300` | `#E8E3D9` | Borde hairline (solo inputs y divisores) |
| `warm400` | `#D8D2C6` | Borde de énfasis, pista de progreso |
| `white` | `#FFFFFF` | **Tarjetas, y solo tarjetas** |
| `ink900` | `#101C17` | Texto principal (verde-negro del wordmark Nexum) |
| `ink700` | `#33443C` | Texto secundario fuerte |
| `ink500` | `#5C6B63` | Texto secundario |
| `ink400` | `#7A8880` | Texto terciario (mínimo 15 pt) |
| `ink300` | `#A6B0AA` | Placeholder, iconos desactivados |
| `green900` | `#0C2B20` | Verde más oscuro, fondo de chip activo |
| `green800` | `#10382A` | Presionado del botón primario |
| `green600` | `#1E5B45` | **Verde Nexum principal** |
| `green500` | `#2E7D5B` | Verde de la hoja del logo, gráficos |
| `green200` | `#CADCD2` | Bordes suaves de acento |
| `green100` | `#E4EDE8` | Fondo suave de acento Nexum |
| `cyan800` | `#0E2748` | Azul marino del wordmark Coolio |
| `cyan600` | `#1687B8` | Cyan Coolio oscuro (texto sobre claro) |
| `cyan500` | `#1F9FD4` | **Cyan Coolio principal** |
| `cyan300` | `#7FD3EA` | Final del degradado del dial |
| `cyan100` | `#E6F4FB` | Fondo suave Coolio |
| `leaf600` | `#2E7D57` | **Verde Plantico principal** |
| `water500` | `#3FA9D6` | Agua Plantico (humedad, nivel) |
| `leaf100` | `#E9F2EC` | Fondo suave Plantico |
| `success600` | `#2E9E5B` | |
| `success100` | `#DCF0E4` | |
| `warning600` | `#C98A14` | |
| `warning100` | `#FAEFD6` | |
| `danger600` | `#C8503A` | |
| `danger100` | `#FBE7E2` | |
| `shadowInk` | `#1C2B24` | Tinte de todas las sombras (cálido, no negro puro) |

### 3.2 Colores semánticos (`colors`)

Esto es lo único que consumen los componentes.

| Token | Valor claro | Uso exacto |
|---|---|---|
| `canvas` | `warm100` `#FAF8F4` | Fondo de `Screen`. Nunca en tarjetas. |
| `surface` | `white` `#FFFFFF` | Tarjeta, hoja modal, barra de pestañas |
| `surfaceSunken` | `warm200` `#F2EFE9` | Input, chip inactivo, pista de slider |
| `surfaceAccent` | `green100` `#E4EDE8` | Azulejo de icono neutro, fondo de badge neutro |
| `divider` | `warm300` `#E8E3D9` | Línea de 1 px entre filas |
| `borderInput` | `warm300` `#E8E3D9` | Borde de campo de texto |
| `text` | `ink900` `#101C17` | Títulos y datos |
| `textSecondary` | `ink500` `#5C6B63` | Subtítulos, descripciones (ratio 6.4:1) |
| `textMuted` | `ink400` `#7A8880` | Metadatos. **Solo ≥ 15 pt** (ratio 4.0:1) |
| `textFaint` | `ink300` `#A6B0AA` | Placeholder e iconos inactivos. Nunca texto informativo |
| `textOnBrand` | `#FFFFFF` | Texto sobre verde/cyan sólido |
| `brand` | `green600` `#1E5B45` | Botón primario, enlace, pestaña activa |
| `brandPressed` | `green800` `#10382A` | Estado pulsado del primario |
| `brandSoft` | `green100` `#E4EDE8` | Fondo suave de marca |
| `brandInk` | `green900` `#0C2B20` | Chip de escena activo |
| `success` / `successSoft` | `#2E9E5B` / `#DCF0E4` | |
| `warning` / `warningSoft` | `#C98A14` / `#FAEFD6` | |
| `danger` / `dangerSoft` | `#C8503A` / `#FBE7E2` | |
| `offline` | `ink300` `#A6B0AA` | Punto de estado desconectado |

**Contraste comprometido (WCAG AA):** `text` sobre `canvas` = 15.9:1 · `textSecondary` sobre `canvas` = 6.4:1 · `textOnBrand` sobre `brand` = 8.1:1 · `brand` sobre `surface` = 8.5:1. `textMuted` (4.0:1) **no cumple AA a tamaño pequeño**: su uso queda restringido a 15 pt o más, donde el umbral es 3:1.

### 3.3 Espaciado (`spacing`)

Escala de 4. Se añade `xl = 20` porque es el margen de pantalla del mockup y hoy no existe.

| Token | px |
|---|---|
| `xxs` | 2 |
| `xs` | 4 |
| `sm` | 8 |
| `md` | 12 |
| `lg` | 16 |
| `xl` | 20 |
| `xxl` | 24 |
| `xxxl` | 32 |
| `huge` | 48 |

**Constantes de layout:**

| Constante | px | Qué es |
|---|---|---|
| `SCREEN_PADDING_H` | 20 | Margen lateral de toda pantalla |
| `SCREEN_PADDING_TOP` | 12 | Bajo la safe area |
| `CARD_GAP` | 12 | Entre tarjetas de una misma lista |
| `SECTION_GAP` | 28 | Entre bloques con cabecera |
| `CARD_PADDING` | 18 | Padding interno de tarjeta |
| `CARD_PADDING_COMPACT` | 14 | Tarjetas en rejilla de 2 columnas |
| `ROW_HEIGHT` | 56 | Altura de fila de lista con subtítulo |
| `ROW_HEIGHT_COMPACT` | 48 | Fila de una sola línea |
| `HIT_TARGET` | 44 | Mínimo pulsable (se mantiene) |
| `SCROLL_BOTTOM` | 96 | Espacio inferior para no quedar bajo la tab bar |
| `TABBAR_HEIGHT` | 56 | + safe area inferior |

### 3.4 Radios (`radius`)

| Token | px | Uso |
|---|---|---|
| `xs` | 8 | Badge rectangular, barra de progreso |
| `sm` | 12 | Azulejo de icono pequeño (32 pt) |
| `md` | 14 | Input, azulejo de icono 44 pt |
| `lg` | 18 | Chip de escena, botón cuadrado |
| `card` | 22 | **Tarjeta estándar** |
| `sheet` | 28 | Hoja modal, contenedor de dial |
| `pill` | 999 | Botones, chips de texto, puntos |

Regla de anidamiento: el radio interior = radio exterior − padding, redondeado al token más cercano. Tarjeta 22 con padding 18 → elemento interno máximo 8 (`xs`). Nunca un radio interior mayor que el exterior.

### 3.5 Sombras (`shadow`)

Tinte cálido `#1C2B24`, nunca `#000`. Tres niveles y ni uno más.

| Nivel | iOS | Android | Uso |
|---|---|---|---|
| `shadow.subtle` | `shadowColor #1C2B24`, `shadowOpacity 0.04`, `shadowRadius 6`, `shadowOffset {0, 2}` | `elevation: 1` | Chip, barra de pestañas, input enfocado |
| `shadow.card` | `shadowColor #1C2B24`, `shadowOpacity 0.07`, `shadowRadius 18`, `shadowOffset {0, 6}` | `elevation: 3` | **Tarjeta estándar** |
| `shadow.raised` | `shadowColor #1C2B24`, `shadowOpacity 0.10`, `shadowRadius 28`, `shadowOffset {0, 12}` | `elevation: 8` | Dial de Coolio, hoja modal, botón flotante |

Notas de implementación obligatorias:

- En Android, `shadowColor` solo se respeta desde API 28. Por debajo la sombra será gris del sistema: es aceptable, no se compensa con hacks.
- Una vista con `elevation` debe tener `backgroundColor` opaco; si no, Android pinta un rectángulo gris.
- `overflow: 'hidden'` **anula la sombra en Android**. Si una tarjeta necesita recortar contenido, el recorte va en una vista hija, no en la que lleva la sombra.
- Nada de `shadowOffset` negativo ni sombras laterales: la luz viene siempre de arriba.

### 3.6 Tipografía (`typography`)

Tipo de letra: la del sistema (San Francisco en iOS, Roboto en Android). Los wordmarks de los flyers son de una grotesca geométrica, pero **no se introduce una fuente propia en la app**: el coste de carga y el riesgo de FOUT no compensa; la personalidad la dan el color, el radio y la sombra.

Todos los tamaños llevan `lineHeight` explícito. Hoy no hay ninguno, y ese es el motivo principal de que la interfaz parezca "sin jerarquía".

| Token | Tamaño | Interlineado | Peso | Letter-spacing | Color por defecto | Uso |
|---|---|---|---|---|---|---|
| `dataHero` | 56 | 60 | 700 | −1.6 | `text` | **Dato protagonista**: 24°C del dial. Uno por pantalla |
| `dataHeroUnit` | 24 | 28 | 600 | −0.4 | `textSecondary` | El `°C` cuando va separado del número |
| `dataL` | 34 | 38 | 700 | −0.8 | `text` | Dato principal de una tarjeta a ancho completo |
| `dataM` | 22 | 26 | 700 | −0.3 | `text` | `68%`, `75%` en azulejos de estadística |
| `display` | 30 | 36 | 700 | −0.6 | `text` | Saludo de portada (`¡Hola, Fran!`) |
| `title` | 24 | 30 | 700 | −0.4 | `text` | Título de pantalla |
| `section` | 18 | 24 | 600 | −0.2 | `text` | Cabecera de sección (`Mis dispositivos`) |
| `cardTitle` | 16 | 22 | 600 | 0 | `text` | Título de tarjeta y de fila |
| `body` | 15 | 22 | 400 | 0 | `textSecondary` | Texto corrido |
| `bodyStrong` | 15 | 22 | 600 | 0 | `text` | Etiqueta de botón, valor de fila |
| `caption` | 13 | 18 | 400 | 0 | `textSecondary` | Subtítulo, metadato |
| `captionStrong` | 13 | 18 | 600 | 0 | `text` | Estado, `Ver todos` |
| `label` | 11 | 14 | 600 | 0.6 | `textMuted` | Etiqueta en versalitas sobre un dato |
| `tabLabel` | 10 | 13 | 600 | 0.2 | — | Rótulo de la barra de pestañas |

**Estilo "dato protagonista" — especificación completa**

Es el núcleo del parecido con los mockups. Reglas no negociables:

- `fontSize: 56`, `lineHeight: 60`, `fontWeight: '700'`, `letterSpacing: -1.6`, `color: colors.text`.
- `fontVariant: ['tabular-nums']` **siempre**. Sin cifras de ancho fijo, el número baila al pasar de 9°C a 24°C y se nota.
- `includeFontPadding: false` (solo Android) y `textAlignVertical: 'center'`: sin esto Android añade ~6 px arriba y abajo y el número queda descentrado dentro del dial.
- `allowFontScaling` se mantiene activo, pero el contenedor del dato lleva `maxFontSizeMultiplier: 1.4` para que con letra XXL no rompa el dial.
- La unidad (`°C`, `%`) va en `dataHeroUnit`, alineada a la línea base del número, con `marginLeft: 2`. Nunca al mismo tamaño que el número.
- Debajo, un `caption` en `textSecondary` con el contexto (`Sensación 24°C`), separado 2 px. Encima, nada: el dato no lleva etiqueta superior, la lleva la tarjeta.
- Un `dataHero` por pantalla. Si hay dos candidatos, el segundo baja a `dataL`.

**Regla de jerarquía:** dentro de una misma tarjeta nunca deben convivir más de tres estilos tipográficos. Si hacen falta cuatro, la tarjeta está haciendo demasiado.

### 3.7 Iconografía

**Librería elegida: `lucide-react-native`.**

Comparativa con la alternativa:

| Criterio | `@expo/vector-icons` | `lucide-react-native` |
|---|---|---|
| Naturaleza | Fuentes de iconos (Ionicons, Feather, MaterialCommunity…) | Componentes SVG |
| Control de grosor | **No existe**: el grosor está horneado en cada fuente | `strokeWidth` como prop, por icono |
| Consistencia | Mezclar familias descuadra el peso óptico; Feather sola tiene 287 iconos y está congelada | Rejilla única de 24×24, mismo grosor y mismas terminaciones en los ~1.500 iconos |
| Color | Un color plano | `color`, y admite degradado vía `react-native-svg` |
| Dependencias | Ya viene con Expo | Requiere `react-native-svg`, **que ya está en `apps/mobile/package.json` (`^15.12.1`)** |
| Tamaño del bundle | Carga la fuente entera aunque uses 6 iconos | Tree-shaking: solo entra el icono importado |

**Por qué Lucide.** Los mockups tienen una sola voz de icono: línea fina, uniforme, puntas redondeadas, sin relleno. Con `@expo/vector-icons` eso es irreproducible, porque el grosor no es un parámetro: en cuanto necesitas un termómetro y una gota que no estén en Feather, saltas a otra familia y el peso óptico cambia a mitad de pantalla. Ese salto es exactamente lo que hace que una app "no parezca de lujo". Lucide da grosor paramétrico y una única geometría, y no añade dependencias nuevas al proyecto.

Instalación: `npx expo install lucide-react-native` (react-native-svg ya presente).

**Tamaños y grosores:**

| Contexto | Tamaño | `strokeWidth` |
|---|---|---|
| Icono en línea de texto (junto a `caption`) | 14 | 2 |
| Icono de fila, chevron | 20 | 1.75 |
| Icono dentro de azulejo de 44 pt | 22 | 1.75 |
| Barra de pestañas | 24 | 1.75 (activo 2) |
| Icono de escena / chip | 24 | 1.75 |
| Icono grande de estado vacío | 40 | 1.5 |

Regla: el grosor **baja** cuando el icono crece (1.5 a partir de 32 pt) y **sube** cuando encoge (2 por debajo de 16 pt). Así el peso óptico se ve constante. Envolver esto en un único componente `<Icon name size tone />` para que no se repita en las pantallas.

Colores de icono: `textSecondary` por defecto, `brand` si es activo, color de módulo solo dentro de su azulejo, `textFaint` si está desactivado. Nunca `text` a pelo: un icono negro pesa más que el texto que acompaña.

Los logos de módulo (`brand/iconos/*.png`) no son iconos de interfaz: van dentro de azulejos de 44 o 56 pt con radio `md`/`lg` y fondo `soft` del módulo, y no se tiñen nunca.

### 3.8 Acento por módulo

`theme.ts` se reescribe así:

| Campo | Coolio | Plantico |
|---|---|---|
| `primary` | `#1F9FD4` | `#2E7D57` |
| `deep` (texto sobre claro, ≥ 4.5:1) | `#1687B8` | `#256A49` |
| `soft` (fondo) | `#E6F4FB` | `#E9F2EC` |
| `onPrimary` | `#FFFFFF` | `#FFFFFF` |
| `data` (color del dato secundario) | `#1687B8` | `#3FA9D6` (agua) |
| `gradient` (solo dial/arco) | `#1F9FD4` → `#7FD3EA` | `#3FA9D6` → `#8FD0EA` |

**Regla del acento — la única que hay que recordar:**

> El color de módulo puede ocupar como máximo el **10 % del área visible** de la pantalla, y solo en cuatro sitios: (1) el azulejo del icono del módulo, (2) el indicador de estado o de progreso de ese módulo, (3) el arco o gráfico del dato protagonista, (4) el botón primario **dentro** de una pantalla de ese módulo.

Lo que **nunca** se tiñe de color de módulo:

- El fondo de pantalla. Siempre `canvas`.
- El fondo de la tarjeta. Siempre `surface` blanco; la pertenencia al módulo se comunica con el azulejo del icono, no pintando la tarjeta.
- La barra de pestañas. Siempre verde Nexum, incluso navegando dentro de un módulo: es la app la que enmarca, no el módulo.
- Texto de cuerpo, títulos y cabeceras de sección.
- Estados de éxito/aviso/error: esos tienen sus propios colores y no ceden ante el módulo.

En la portada de Nexum, donde conviven tarjetas de varios módulos, cada tarjeta lleva su acento solo en su azulejo y su punto de estado. Es lo que hace que la fila "Plantico / Coolio" del mockup se lea como un sistema y no como dos apps pegadas.

### 3.9 Modo oscuro

Es un requisito completo, no una preparación. Toda la especificación está en **§4**.

---

## 4. Modo oscuro

El modo oscuro de Nexum **no es el modo claro invertido**. Es el mismo salón, de noche: la misma luz cálida, pero baja.

### 4.1 El problema del crema: por qué el fondo oscuro no puede ser gris

El crema `#FAF8F4` es la seña de identidad de la marca. Su matiz está en torno a **45° (amarillo-oliva)** con un croma bajísimo, ~2 %. La tentación es invertirlo a `#121212` o a un gris neutro: sería un error, porque la marca desaparece.

Hay un hecho perceptivo que manda aquí: **a luminancia baja, el ojo pierde sensibilidad al croma**. Un color con 2 % de saturación se lee cálido sobre un fondo claro, pero sobre un fondo oscuro el mismo 2 % es indistinguible del gris. Por tanto, para conservar la calidez hay que **subir el croma al bajar la luminancia**, no mantenerlo.

El fondo oscuro de Nexum es **`#100F0B`**: mismo matiz (≈ 48°), croma relativo subido a ~6 %, luminancia relativa 0.0048. Se lee como un marrón-oliva muy oscuro, no como negro, y no como gris. Junto a un `#121212` neutro la diferencia es evidente de inmediato; en solitario se percibe simplemente como "cálido".

Dos reglas derivadas:

- **Nunca negro puro `#000000`.** En OLED ahorra batería, pero aplasta la jerarquía de superficies (no hay nada por debajo) y el blanco puro encima produce halo. Además borra la marca.
- **El matiz cálido se mantiene en toda la escala de superficies**, no solo en el fondo. Si el fondo es cálido y las tarjetas son grises neutros, el conjunto se ve sucio.

### 4.2 Paleta oscura completa (`colors`, `scheme: 'dark'`)

| Token | Claro | **Oscuro** | Notas |
|---|---|---|---|
| `canvas` | `#FAF8F4` | **`#100F0B`** | Fondo de pantalla. Matiz 48°, cálido |
| `surface` | `#FFFFFF` | **`#211E17`** | Tarjeta. +15 % de luminancia sobre el lienzo |
| `surfaceElevated` | `#FFFFFF` | **`#2B2721`** | Hoja modal, menú, dial. +12 % sobre `surface` |
| `surfaceOverlay` | `#FFFFFF` | **`#35302823`** | Popover / tooltip sobre tarjeta |
| `surfaceSunken` | `#F2EFE9` | **`#0B0A07`** | Input, pista de slider, chip inactivo. Por **debajo** del lienzo |
| `surfaceAccent` | `#E4EDE8` | **`#15261C`** | Azulejo de icono neutro |
| `divider` | `#E8E3D9` | **`#2E2A22`** | Línea de 1 px |
| `borderInput` | `#E8E3D9` | **`#38332A`** | Borde de campo de texto |
| `borderStrong` | `#D8D2C6` | **`#443E33`** | Borde de tarjeta en oscuro (ver §4.4) |
| `scrim` | `#101C17B3` | **`#000000CC`** | Velo tras una hoja modal |
| `text` | `#101C17` | **`#EDEAE3`** | Blanco cálido, nunca `#FFFFFF` |
| `textSecondary` | `#5C6B63` | **`#B3ACA0`** | Subtítulos |
| `textMuted` | `#7A8880` | **`#918A7E`** | Metadatos |
| `textFaint` | `#A6B0AA` | **`#6B6459`** | Placeholder, iconos inactivos. Decorativo |
| `textOnFill` | `#FFFFFF` | **`#FFFFFF`** | Texto sobre relleno de marca |
| `brand` | `#1E5B45` | **`#4FAE84`** | **Primer plano**: enlaces, iconos, pestaña activa, texto de marca |
| `brandFill` | `#1E5B45` | **`#2E7D5B`** | **Fondo**: relleno del botón primario |
| `brandPressed` | `#10382A` | **`#276A4D`** | Pulsado del primario |
| `brandSoft` | `#E4EDE8` | **`#15261C`** | Fondo suave de marca |
| `brandInk` | `#0C2B20` | **`#3E9773`** | Chip de escena activo (en oscuro se **aclara**, no se oscurece) |
| `success` | `#2E9E5B` | **`#5CBF83`** | |
| `successSoft` | `#DCF0E4` | **`#16281D`** | |
| `warning` | `#C98A14` | **`#E0B152`** | |
| `warningSoft` | `#FAEFD6` | **`#2A2213`** | |
| `danger` | `#C8503A` | **`#E8806A`** | |
| `dangerSoft` | `#FBE7E2` | **`#2C1A15`** | |
| `offline` | `#A6B0AA` | **`#6B6459`** | |
| `shadowInk` | `#1C2B24` | `#000000` | En oscuro casi no se usa (§4.4) |

**Regla general de conversión** (para cualquier token futuro): en oscuro, un color de marca o de estado **sube 25–35 puntos de luminancia y baja 20–30 % de saturación**. Subir solo la luminancia sin bajar el croma es lo que produce el efecto "chillón".

### 4.3 Acentos de módulo en oscuro

Los primarios de claro (`#1F9FD4`, `#2E7D57`) fallan por motivos opuestos: el cyan de Coolio conserva contraste pero **deslumbra** por exceso de croma sobre fondo oscuro, y el verde de Plantico directamente **no se ve** (1.86:1 sobre `surface`, muy por debajo del mínimo).

| Campo | Coolio claro | **Coolio oscuro** | Plantico claro | **Plantico oscuro** |
|---|---|---|---|---|
| `primary` | `#1F9FD4` | **`#58AECB`** | `#2E7D57` | **`#5FB88C`** |
| `deep` (texto sobre `soft`) | `#1687B8` | **`#8ECBE0`** | `#256A49` | **`#94D2B2`** |
| `soft` (fondo de azulejo) | `#E6F4FB` | **`#15262E`** | `#E9F2EC` | **`#16261E`** |
| `onPrimary` | `#FFFFFF` | **`#0E1A1F`** | `#FFFFFF` | **`#0D1A13`** |
| `data` | `#1687B8` | **`#8ECBE0`** | `#3FA9D6` | **`#6FB8D6`** |
| `gradient` | `#1F9FD4` → `#7FD3EA` | **`#3E8FA8` → `#6FC4DE`** | `#3FA9D6` → `#8FD0EA` | **`#3F8E6B` → `#7FC9A3`** |

Qué se ha hecho con cada uno:

- **Coolio `#1F9FD4` → `#58AECB`.** Croma reducido ~28 %, luminancia subida. Pasa de "cyan de neón" a "cyan de bruma". Contraste sobre `surface`: **6.60:1**.
- **Plantico `#2E7D57` → `#5FB88C`.** Luminancia subida mucho (era invisible), croma reducido ~20 %. Contraste sobre `surface`: **6.91:1**.
- **Agua `#3FA9D6` → `#6FB8D6`.** Contraste **7.53:1**.
- **Los degradados del dial pierden ~35 % de croma en oscuro.** Un arco saturado de 12 px de grosor sobre fondo casi negro es la fuente número uno de fatiga visual en apps de domótica de noche.
- **`onPrimary` deja de ser blanco.** Sobre un acento aclarado, el blanco da 2.4:1. El texto sobre relleno de módulo en oscuro es **tinta oscura**, no blanco.

Un límite añadido, propio del modo oscuro: **ninguna superficie de acento saturado puede superar el 8 % del área de pantalla** (en claro el límite es 10 %). De noche, el mismo área de color pesa más.

### 4.4 Profundidad sin sombras

Una sombra es una zona oscurecida. Sobre `#100F0B` no hay nada que oscurecer: la sombra es invisible. La jerarquía de profundidad se reconstruye con **dos mecanismos combinados**: luminancia de superficie y borde.

| Nivel | Claro | **Oscuro: superficie** | **Oscuro: borde** |
|---|---|---|---|
| 0 — lienzo | `#FAF8F4`, sin sombra | `#100F0B` | — |
| −1 — hundido (input) | `#F2EFE9`, sin sombra | `#0B0A07` | 1 px `#2E2A22` |
| 1 — `shadow.subtle` (chip, tab bar) | sombra 0.04 / r6 / y2 | `#1B1812` | 1 px `#2E2A22` |
| 2 — `shadow.card` (tarjeta) | sombra 0.07 / r18 / y6 | `#211E17` | 1 px `#38332A` |
| 3 — `shadow.raised` (dial, hoja) | sombra 0.10 / r28 / y12 | `#2B2721` | 1 px `#443E33` |

Reglas:

- **En oscuro, la tarjeta sí lleva borde de 1 px.** Es la excepción a la regla del §8.1: en claro el borde sobra porque la sombra ya separa; en oscuro el borde es lo único que separa. El token que lo decide es `cardBorderWidth`: `0` en claro, `1` en oscuro.
- **Cada escalón sube ~12–15 % de luminancia relativa.** Menos no se distingue; más y el "flotar" se convierte en "parche gris".
- **Las sombras no se desactivan, se reducen a cero.** `shadow.card` en oscuro devuelve `shadowOpacity: 0` y `elevation: 0`, para que ningún componente tenga que preguntar por el modo.
- **Prohibido usar transparencias apiladas** (`rgba(255,255,255,0.05)` sobre `rgba(255,255,255,0.05)`) para simular elevación: en listas con reciclado se acumulan y las superficies acaban con luminancias distintas. Cada nivel es un hex opaco.
- **Nada de brillo interior ni de borde luminoso** en el borde superior de las tarjetas. Es un tic de interfaz de videojuego y aquí abarata.

### 4.5 Contraste comprobado

Ratios calculados con la fórmula de luminancia relativa de WCAG 2.1. Umbrales: **4.5:1** texto normal, **3:1** texto ≥ 18.66 px en negrita o ≥ 24 px, y elementos gráficos.

**Modo claro**

| Par | Ratio | AA |
|---|---|---|
| `text #101C17` sobre `canvas #FAF8F4` | **15.9:1** | ✅ |
| `text` sobre `surface #FFFFFF` | **16.6:1** | ✅ |
| `textSecondary #5C6B63` sobre `surface` | **6.4:1** | ✅ |
| `textMuted #7A8880` sobre `surface` | **4.0:1** | ⚠️ solo ≥ 15 pt (umbral 3:1) |
| `#FFFFFF` sobre `brandFill #1E5B45` | **8.1:1** | ✅ |
| `brand #1E5B45` sobre `surface` | **8.5:1** | ✅ |
| `danger #C8503A` sobre `surface` | **4.6:1** | ✅ |
| Coolio `#1F9FD4` sobre `surface` (gráfico) | **3.2:1** | ✅ (gráfico) |

**Modo oscuro**

| Par | Ratio | AA |
|---|---|---|
| `text #EDEAE3` sobre `canvas #100F0B` | **16.4:1** | ✅ |
| `text` sobre `surface #211E17` | **14.3:1** | ✅ |
| `textSecondary #B3ACA0` sobre `surface` | **7.4:1** | ✅ |
| `textMuted #918A7E` sobre `surface` | **4.9:1** | ✅ **sin restricción de tamaño** |
| `brand #4FAE84` sobre `surface` | **6.1:1** | ✅ |
| `#FFFFFF` sobre `brandFill #2E7D5B` | **5.0:1** | ✅ |
| Coolio `#58AECB` sobre `surface` | **6.6:1** | ✅ |
| Plantico `#5FB88C` sobre `surface` | **6.9:1** | ✅ |
| `success #5CBF83` sobre `surface` | **7.3:1** | ✅ |
| `warning #E0B152` sobre `surface` | **8.4:1** | ✅ |
| `danger #E8806A` sobre `surface` | **6.1:1** | ✅ |

Nota que merece la pena: **el `textMuted` oscuro cumple AA a cualquier tamaño y el claro no.** Es la única asimetría del sistema y está documentada a propósito, para que nadie "arregle" el oscuro igualándolo al claro.

Único par que no llega a 4.5:1 en ninguno de los dos modos: `textFaint`. Es deliberado — solo se usa para placeholders e iconos desactivados, donde WCAG no exige mínimo. **Nunca puede llevar información.**

### 4.6 Qué más cambia de noche

- **Imágenes y logos de módulo** (`brand/iconos/*.png`): se muestran igual, sin filtros. Van sobre su azulejo `soft` oscuro, que aporta el fondo claro suficiente. Nada de `tintColor` ni de inversión.
- **Mascotas** (Nexi, Airi, Broti): sobre `surfaceElevated`, nunca sobre el lienzo, para que su silueta no se recorte contra el fondo.
- **Barra de estado**: `style="light"` en oscuro, `"dark"` en claro; lo resuelve el `ThemeProvider`, nunca la pantalla.
- **Mapas y gráficos**: la rejilla pasa de `divider` a `#2E2A22` y las series mantienen su color de módulo oscuro.
- **Cambio de modo en caliente**: se aplica sin transición. Animar un cambio de tema produce un destello de colores intermedios sin sentido semántico.

### 4.7 Estructura de tokens: cómo una pantalla no sabe en qué modo está

El objetivo es que **la cadena `'light' | 'dark'` aparezca en exactamente dos ficheros de toda la app** (el que construye los colores y el proveedor). Ninguna pantalla, ninguna tarjeta, ningún componente pregunta por el modo.

1. **Una interfaz `Colors` con todas las claves.** Es el contrato. Si en el futuro alguien añade un color al tema claro y se olvida del oscuro, TypeScript rompe la compilación. Ningún token puede ser opcional.
2. **`makeColors(scheme): Colors` y `makeModuleThemes(scheme): Record<ModuleId, ModuleTheme>`.** Dos funciones puras en `tokens.ts` / `theme.ts`, con dos objetos literales dentro. Nada de `scheme === 'dark' ? a : b` esparcido por el código.
3. **Los valores dependientes del modo que no son colores también son tokens.** `cardBorderWidth` (0 / 1), `shadow.card` (sombra real / opacidad 0), `statusBarStyle`, `keyboardAppearance`. Si un componente necesita saber el modo para decidir algo, **es que falta un token**. Esta es la regla que hace que el sistema funcione.
4. **`ThemeProvider` en la raíz** lee `useColorScheme()` más la preferencia guardada del usuario (`'auto' | 'light' | 'dark'` en AsyncStorage) y expone un único objeto `theme = { colors, modules, shadow, cardBorderWidth, statusBarStyle }`.
5. **Un solo hook: `useTheme()`.** Los componentes hacen `const { colors, shadow } = useTheme()`. Prohibido `useColorScheme()` fuera del proveedor y prohibido `Appearance.getColorScheme()` en cualquier sitio.
6. **Estilos en dos capas.** Lo que no depende del color (medidas, radios, flex, tipografía) se queda en un `StyleSheet.create` estático a nivel de módulo, que no se recalcula nunca. Lo que depende del color se aplica como estilo en línea sobre esa base: `style={[s.card, { backgroundColor: colors.surface, borderWidth: cardBorderWidth }]}`. Es el patrón más barato y evita fabricar hojas de estilo por render.
7. **Prohibido importar `palette` fuera de `tokens.ts`.** Hoy `theme.ts` lo hace, y por eso los colores de módulo no pueden cambiar de tema. `palette` deja de exportarse.
8. **Cero hex literales en componentes.** Hoy `ListRow.tsx` tiene seis (`#1C6B3E`, `#DCF0E4`, `#8A6318`, `#FAEFD6`, `#8F2F1E`, `#F8DFDA`): de noche serían manchas fluorescentes. Van todos a `palette` como `success/warning/danger` + `…Soft`. Conviene una regla de lint (`no-restricted-syntax` sobre literales `/^#[0-9a-fA-F]{3,8}$/`) que lo impida de raíz.
9. **Comprobación de aceptación:** `grep -r "'dark'" apps/mobile/` debe devolver resultados únicamente en `tokens.ts`, `theme.ts` y `ThemeProvider.tsx`. Si aparece en una pantalla, el sistema está mal montado.

---

## 5. Movimiento

Premisa: **movimiento minimalista**. El objetivo no es que se note la animación, es que la interfaz parezca que responde. Si el usuario percibe conscientemente una animación en el uso diario, esa animación sobra.

Tres principios que ordenan toda la sección:

- **El movimiento explica una relación**, nunca adorna. Algo se mueve porque viene de algún sitio o va a algún sitio.
- **Rápido para lo que el usuario provoca, más lento para lo que llega solo.** La respuesta al dedo debe sentirse instantánea (≤ 150 ms); un dato que cambia por sí mismo puede tomarse 300 ms.
- **Ninguna animación por encima de 350 ms**, con la única excepción del esqueleto de carga.

### 5.1 Tokens de duración y curva

| Token | ms | Uso |
|---|---|---|
| `duration.instant` | 90 | Respuesta al dedo (pulsación) |
| `duration.fast` | 140 | Cambio de opacidad, cambio de pestaña |
| `duration.base` | 200 | Cambio de estado, color, interruptor |
| `duration.slow` | 280 | Entrada de tarjeta, hoja modal |
| `duration.screen` | 320 | Transición entre pantallas |
| `duration.data` | 400 | Recorrido de un arco o barra de progreso |

| Token | Bézier | Carácter | Uso |
|---|---|---|---|
| `easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Sale rápido, frena largo | Por defecto para todo cambio de estado |
| `easing.decelerate` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Entra volando, se posa | Aparición de un elemento |
| `easing.accelerate` | `cubic-bezier(0.3, 0, 1, 1)` | Arranca suave, se va | Salida de un elemento |
| `easing.press` | muelle: `damping 18`, `stiffness 320`, `mass 1` | Firme, sin rebote visible | Vuelta de una pulsación |

Nada de `Easing.linear` (se percibe mecánico) y nada de `Easing.bounce` o `elastic` en ningún sitio. El único muelle permitido es `easing.press`, y está calibrado para **no producir sobreimpulso perceptible**.

### 5.2 Transición entre pantallas

| Caso | Movimiento | Duración | Curva |
|---|---|---|---|
| Push (entrar en detalle) | Entrante: `translateX 100% → 0`. Saliente: `translateX 0 → −25%` + `opacity 1 → 0.6` | 320 ms | `standard` |
| Pop (volver) | El inverso, con la saliente sin atenuar | 280 ms | `accelerate` |
| Cambio de pestaña | **Solo fundido** `opacity 0 → 1`, sin desplazamiento | 140 ms | `standard` |
| Hoja modal (abrir) | `translateY 100% → 0` + velo `opacity 0 → 1` | 280 ms | `decelerate` |
| Hoja modal (cerrar) | El inverso | 220 ms | `accelerate` |
| Diálogo | `opacity 0 → 1` + `scale 0.96 → 1` | 200 ms | `standard` |

El desplazamiento parcial de la pantalla saliente (−25 %, no −100 %) es el detalle que hace que la navegación se lea como capas y no como diapositivas.

Las pestañas **no se deslizan horizontalmente**: no son vecinas espaciales, son destinos distintos. Deslizarlas obliga al usuario a construir un mapa mental falso.

### 5.3 Aparición de una tarjeta

| Propiedad | Valor |
|---|---|
| Movimiento | `opacity 0 → 1` + `translateY 8 → 0` |
| Duración | 240 ms |
| Curva | `decelerate` |
| Escalonado | 40 ms entre tarjetas |
| Tope del escalonado | Las **6 primeras**; de la séptima en adelante, todas con el retardo de la sexta |
| Cuándo | **Solo en el primer montaje** de la lista |
| Cuándo no | Al hacer scroll, al volver a la pantalla, al refrescar datos, al re-renderizar |

8 px de desplazamiento, no 20: el gesto debe insinuarse, no ejecutarse. El tope de seis evita que la última tarjeta de una lista larga aparezca dos segundos después que la primera.

Carga: **esqueletos, no ruedecitas.** Bloque `surfaceSunken` con la forma de la tarjeta final, pulso de `opacity 0.5 ↔ 1`, ciclo de 1200 ms, `Easing.inOut(Easing.sin)`. Es la única animación que supera los 350 ms, y lo hace porque es un estado, no una transición. El esqueleto se sustituye por contenido con un fundido de 140 ms, sin desplazamiento (el contenido ya está en su sitio).

### 5.4 Pulsación de un botón

| Fase | Movimiento | Duración | Curva |
|---|---|---|---|
| `onPressIn` | `scale 1 → 0.97` + fondo `brandFill → brandPressed` | 90 ms | `accelerate` |
| `onPressOut` | `scale → 1` | muelle | `easing.press` |
| Botón bloqueado | `opacity → 0.45` | 140 ms | `standard` |
| Paso a cargando | Fundido cruzado texto ↔ indicador | 140 ms | `standard` |

Tarjeta pulsable: `scale 1 → 0.985` (más contenida que un botón, porque el área es mayor) y la sombra baja de `shadow.card` a `shadow.subtle` en los mismos 90 ms. En oscuro, en vez de la sombra se aclara el borde a `borderStrong`.

Fila de lista: **no escala**. Cambia el fondo a `surfaceSunken` en 90 ms. Escalar una fila dentro de una lista deforma a sus vecinas visualmente.

Prohibido bajar la opacidad del botón al pulsarlo (lo que hace hoy `Button.tsx` con `opacity: 0.75`): deja ver el fondo a través del botón y es el tic visual que más abarata una interfaz.

### 5.5 Cambio de estado de un dato

| Caso | Comportamiento | Duración | Curva |
|---|---|---|---|
| Dato numérico, salto ≤ 5 unidades (24°C → 25°C) | Cuenta a través de los valores intermedios | 300 ms | `standard` |
| Dato numérico, salto > 5 unidades o cambio de unidad | **No cuenta**: fundido cruzado en el sitio | 160 ms | `standard` |
| Arco del dial / barra de progreso | El trazo recorre hasta el valor nuevo | 400 ms | `standard` |
| Color asociado al dato (frío → calor) | Interpolación de color | 200 ms | `standard` |
| Punto de estado (verde ↔ gris) | Solo color, sin escala ni parpadeo | 200 ms | `standard` |
| Interruptor | Pulgar + color de pista a la vez | 180 ms | `standard` |
| Aparición de un error bajo un campo | `opacity 0 → 1` + `translateY −4 → 0` | 140 ms | `decelerate` |

Reglas del dato protagonista:

- **El número y su arco arrancan juntos**, aunque terminen en momentos distintos (300 y 400 ms). Escalonar su arranque los desvincula.
- **Optimismo con reversión.** Al tocar `+`, el número sube al instante; si el comando falla, vuelve en 200 ms `standard` y aparece el error. Nunca se deja el número parado esperando a la red.
- **Ningún número parpadea.** Si un dato deja de ser válido, baja a `textMuted` en 200 ms; no se oculta ni destella.

### 5.6 Qué NO se anima

Lista cerrada. Cualquier cosa de aquí es un rechazo en revisión de diseño:

- **Rebote, muelle elástico o sobreimpulso** en tarjetas, listas, hojas o cualquier cosa que no sea `easing.press`.
- **Texto que aparece letra a letra**, se escribe o se desliza palabra a palabra.
- **Iconos de la barra de pestañas** que rotan, saltan o se rellenan con una transición. El icono activo cambia de color en 140 ms y nada más.
- **Parallax al hacer scroll**, cabeceras que colapsan con escala, imágenes que se estiran al tirar hacia abajo.
- **Logos y mascotas.** Nexi, Airi y Broti son ilustraciones fijas. Nada de flotar, parpadear ni saludar.
- **El fondo de pantalla.** Ni degradados en movimiento, ni partículas, ni ondas.
- **Cualquier elemento fuera de la pantalla.** Si una tarjeta está a 900 px de scroll, su dato cambia sin transición.
- **Datos que cambian solos y no ha provocado el usuario**: se actualizan con un fundido de 140 ms como mucho, nunca contando ni con desplazamiento.
- **El cambio de modo claro/oscuro** (§4.6).
- **Re-renders.** Animar en `useEffect` sin una dependencia que sea un cambio real de valor es el origen del 90 % de las animaciones espurias.
- **Cadenas de más de dos pasos.** Si una interacción necesita tres animaciones seguidas, el problema es el flujo, no la animación.
- **`LayoutAnimation` en listas con reciclado.** Produce saltos con `FlatList` y no es cancelable.

**Accesibilidad — obligatorio.** Se lee `AccessibilityInfo.isReduceMotionEnabled()` y se escucha `reduceMotionChanged`. Con movimiento reducido activo: todas las duraciones de desplazamiento y escala pasan a **0 ms**, y se conserva únicamente un fundido de **100 ms**. El esqueleto deja de pulsar y se queda estático. Esto se resuelve en el proveedor de tema devolviendo un objeto `motion` ya recortado: **ninguna pantalla comprueba el ajuste por su cuenta**, igual que con el modo oscuro.

### 5.7 Vibración (haptics)

Requiere `expo-haptics`, que no está en `apps/mobile/package.json`: `npx expo install expo-haptics`.

Principio: **la vibración confirma que algo ha pasado en el mundo real, no que el dedo ha tocado la pantalla.** Encender el aire vibra; abrir una pantalla, no.

**Sí vibra**

| Gesto | Tipo | Nota |
|---|---|---|
| Botón primario que ejecuta una acción real (`Regar ahora`, `Encender`) | `Impact.Medium` | Al soltar, no al pulsar |
| Interruptor de automatización | `Impact.Light` | Una sola, al cambiar el valor |
| Cambio de escena (En casa / Noche / Fuera / Eco) | `Selection` | En Android, `Impact.Light` |
| Cada grado al girar el dial o arrastrar un slider | `Selection` | Con límite de **1 cada 60 ms** |
| Tope del recorrido de un dial (mín./máx.) | `Impact.Medium` | Una sola vez al llegar |
| Confirmación de una operación de red correcta | `Notification.Success` | Cuando responde el servidor, no al pulsar |
| Fallo de un comando o error de validación | `Notification.Error` | |
| Apertura del diálogo de una acción destructiva | `Notification.Warning` | Al abrir el diálogo, no al confirmar |
| Pulsación larga que abre un menú contextual | `Impact.Medium` | Al alcanzar el umbral |
| Lectura correcta de un QR de invitación | `Notification.Success` | |

**No vibra**

- Navegar entre pantallas o entre pestañas.
- Pulsar un chevron, una tarjeta o un enlace que **solo** navega.
- Scroll, llegada al final de una lista, pull-to-refresh (el sistema ya lo hace; duplicarlo se siente roto).
- Aparición de tarjetas, esqueletos de carga, llegada de datos.
- Notificaciones push y actualizaciones que llegan solas.
- Abrir o cerrar un teclado, escribir en un campo.
- Cualquier acción que no tenga efecto sobre el hogar.

**Reglas duras**

- **Nunca dos vibraciones en menos de 120 ms.** Si dos eventos coinciden, gana el más significativo (`Notification` por encima de `Impact`, `Impact` por encima de `Selection`).
- **Nunca vibración sin confirmación visual.** La vibración acompaña, no sustituye.
- **Android:** `selectionAsync` es apenas perceptible en muchos dispositivos; se sustituye por `Impact.Light`. Requiere el permiso `VIBRATE` en el manifiesto.
- **Ajustes → "Vibración"**, interruptor que corta todos los hápticos de la app, por defecto activado. Se respeta además el ajuste del sistema.
- **Se centraliza en un módulo `haptics.ts`** con funciones con nombre semántico (`confirmarAccion()`, `cambiarValor()`, `errorDeComando()`). Ninguna pantalla llama a `expo-haptics` directamente: es la misma regla que con los colores.

---

## 6. Tabla: qué cambia respecto a hoy

| # | Hoy (`tokens.ts` / componentes) | Propuesta | Por qué |
|---|---|---|---|
| 1 | `background: #F5F2EC` (crema saturado) | `canvas: #FAF8F4` | El crema fuerte del flyer es el fondo **del póster**, no el de la pantalla. Dentro del teléfono el fondo es casi blanco. Con `#F5F2EC` las tarjetas blancas apenas destacan (contraste 1.09:1 entre fondo y tarjeta) y todo se ve apagado y amarillento. Con `#FAF8F4` la tarjeta flota y el conjunto se ve limpio sin perder la calidez |
| 2 | `Card` lleva `borderWidth: hairline` + `borderColor` **y además** `shadow.card` | Tarjeta **sin borde**, solo `shadow.card` | Doble delimitación. El borde dibuja un contorno duro que mata el efecto de flotación de la sombra; es el error más visible de la interfaz actual. En los mockups no hay ni un borde en ninguna tarjeta |
| 3 | `radius.lg = 16` para tarjetas | `radius.card = 22` | El mockup está entre 20 y 24. 16 es el radio por defecto "de wireframe"; 22 es lo que hace que la superficie se lea blanda y cara |
| 4 | `shadow.card`: `#000`, opacidad 0.06, radio 12, offset `{0,4}`, `elevation: 2` | `#1C2B24`, 0.07, radio 18, offset `{0,6}`, `elevation: 3` | Sombra negra sobre fondo cálido gris-ea el ambiente. Radio 12 con offset 4 da una sombra corta y dura; la del mockup es amplia y difusa. `elevation: 2` en Android es prácticamente una línea |
| 5 | Un solo nivel de sombra | Tres: `subtle` / `card` / `raised` | Sin niveles no hay profundidad: el dial de Coolio y un chip no pueden flotar igual. La jerarquía espacial es la mitad del "aspecto de lujo" |
| 6 | Tipografía **sin ningún `lineHeight`** | `lineHeight` explícito en los 14 estilos | Es la causa raíz de la falta de jerarquía. Sin interlineado, RN usa el de la fuente y dos textos de tamaños distintos acaban con densidades parecidas. El ritmo vertical se pierde |
| 7 | No existe un estilo para números grandes; el mayor es `display: 32` | `dataHero 56 / dataL 34 / dataM 22`, con `tabular-nums` | Los mockups son literalmente una app de números grandes. Sin `dataHero` no hay forma de parecerse a ellos |
| 8 | 7 estilos tipográficos, sin `letterSpacing` salvo dos | 14 estilos con `letterSpacing` negativo en los grandes | Los tamaños grandes necesitan tracking negativo (−0.4 a −1.6) o se ven sueltos y baratos. Los pequeños necesitan positivo |
| 9 | Margen de pantalla `spacing.lg = 16` | `SCREEN_PADDING_H = 20` | 16 es el mínimo de Material; el mockup respira a 20. No hay token 20 en la escala actual: se añade `xl: 20` y `xl` pasa de 24 a `xxl` |
| 10 | Separación uniforme `gap: spacing.md` entre todo en `Screen` | `CARD_GAP 12` entre tarjetas, `SECTION_GAP 28` entre secciones | Con separación uniforme no se distingue "otra tarjeta" de "otro tema". El agrupamiento es lo que hace legible la portada |
| 11 | `Card` con `padding: spacing.lg = 16` | `CARD_PADDING = 18` (`14` en rejilla de 2 columnas) | Con radio 22, un padding de 16 deja el contenido pegado a la curva de la esquina |
| 12 | `surfaceAlt = green100`, usado como fondo neutro | `surfaceSunken = #F2EFE9` (neutro) y `surfaceAccent = #E4EDE8` (verde) separados | Hoy todo fondo "secundario" sale verdoso, incluidos los badges neutros e inputs. Mezcla neutro con marca |
| 13 | `inkMuted #6E7D76` y `inkFaint #9AA6A0` sin regla de uso | `textSecondary #5C6B63` (6.4:1) / `textMuted #7A8880` solo ≥15 pt / `textFaint #A6B0AA` solo decorativo | Hoy los subtítulos usan un gris que en 13 pt no llega a AA. Quedan tres grises con regla explícita |
| 14 | `ink #14201B` | `text #101C17` | Un punto más oscuro y más alineado con el verde-negro del wordmark. Marca mejor el contraste contra `textSecondary` |
| 15 | Sin iconos: `_layout.tsx` dice "sin iconos todavía" | `lucide-react-native` + componente `<Icon>` | Una barra de pestañas con solo texto es el segundo motivo de que la app no parezca terminada |
| 16 | `theme.ts` con 3 campos (`primary`, `accent`, `soft`), sin regla de aplicación y sin uso real | 6 campos + la regla del 10 % + lista de prohibiciones | `accent` hoy no significa nada (en Coolio es azul marino, en Plantico es azul agua: dos cosas distintas). Sin regla, cada pantalla lo aplicará a su manera |
| 17 | `Button`: solo `borderRadius: pill`, sin estado pulsado propio (`opacity: 0.75`) | Primario con `brandPressed #10382A` y `scale 0.98`; mantener `pill` | Bajar la opacidad del botón deja ver el fondo y se ve barato. Un cambio de color es lo que hacen las apps caras |
| 18 | `Badge` usado también para estado de dispositivo | `StatusDot` (punto 8 pt + `captionStrong`) para estado; `Badge` solo para roles y caducidades | En los mockups el estado (`Todo bien`, `Encendido`) es siempre un punto, nunca una etiqueta rellena |
| 19 | `TextField` con `minHeight: 48`, fondo `surface` blanco | `minHeight: 52`, fondo `surfaceSunken`, borde solo al enfocar | Un input blanco sobre tarjeta blanca solo se distingue por el borde. Hundido se lee como campo sin necesitar contorno |
| 20 | `ListRow` con `paddingVertical: md` y altura variable | `ROW_HEIGHT 56` / `ROW_HEIGHT_COMPACT 48` fijos + divisor de 1 px a partir de `x = CARD_PADDING` | Filas de altura variable rompen el ritmo vertical. El divisor sangrado es el detalle que distingue una lista cuidada |
| 21 | `colors` es un objeto constante y no existe modo oscuro | `makeColors(scheme)` + `makeModuleThemes(scheme)` + `ThemeProvider` + `useTheme()` (§4.7) | El modo oscuro es requisito completo. Sin esta estructura hay que tocar todos los componentes, y el modo acaba filtrándose a las pantallas |
| 22 | 6 hex a mano en `ListRow.tsx` (`tonos`) | Todos a `palette` | Colores fuera del sistema; en oscuro serían inservibles |
| 23 | `Screen` con `paddingBottom: xxxl = 48` | `SCROLL_BOTTOM = 96` | Con barra de pestañas y safe area, 48 deja la última tarjeta medio tapada |
| 24 | El borde de tarjeta es un valor fijo | Token `cardBorderWidth`: `0` en claro, `1` en oscuro | En claro el borde sobra (ya separa la sombra); en oscuro es lo único que separa. Debe ser un token, no un `if` en el componente |
| 25 | Un único bloque `shadow.card` | `shadow` depende del tema: sombra real en claro, `shadowOpacity: 0` + `elevation: 0` en oscuro, con la profundidad en la luminancia de superficie (§4.4) | La sombra es invisible sobre fondo oscuro. Si no se neutraliza por token, cada componente acaba preguntando en qué modo está |
| 26 | Los colores de módulo son únicos y se rompen de noche | Variante oscura por módulo: Coolio `#58AECB`, Plantico `#5FB88C` / agua `#6FB8D6`, con `onPrimary` en tinta oscura (§4.3) | El verde de Plantico da 1.86:1 sobre fondo oscuro (invisible) y el cyan de Coolio deslumbra. Hay que bajar croma y subir luminancia |
| 27 | Sin sistema de movimiento: `Button` solo baja la opacidad al pulsar | Tokens `duration` (6) y `easing` (4), pulsación con `scale 0.97` + `brandPressed` (§5.4) | Bajar la opacidad deja ver el fondo a través del botón: es el tic que más abarata una interfaz. Y sin tokens de duración cada pantalla inventará la suya |
| 28 | Sin respuesta háptica | `expo-haptics` centralizado en `haptics.ts` con nombres semánticos (§5.7) | Sin vibración, confirmar una acción sobre el hogar (encender el aire, regar) no se siente real. Centralizarlo evita que se disperse y se abuse |
| 29 | Sin soporte de movimiento reducido | El proveedor devuelve un objeto `motion` ya recortado a 0 ms de desplazamiento y 100 ms de fundido | Accesibilidad. Y misma regla que el tema: la pantalla no consulta el ajuste |

---

## 7. Anatomía de una tarjeta

Medidas sobre un ancho de pantalla de 393 pt. Todo valor sale de un token.

### 7.1 Tarjeta de dispositivo (la unidad básica de la portada)

```
◀── 20 ──▶┌──────────────────────────────────────────┐◀── 20 ──▶
          │  ↑ 18                                    │
          │ ┌────────┐                          ╮    │
          │ │        │ 44×44, radio 14          │ 44 │   ← fila de cabecera
          │ │  icono │ fondo: module.soft       │    │
          │ └────────┘ icono 22, sw 1.75        ╯    │
          │  ↑ 12                                    │
          │  Plantico                  ← cardTitle   │
          │  ↑ 4                                     │
          │  ● Todo bien               ← StatusDot   │
          │  ↑ 12                                    │
          │  ─────────────────────────  divider 1px  │
          │  ↑ 12                                    │
          │  HUMEDAD          ← label 11/14, +0.6    │
          │  ↑ 2                                     │
          │  68%              ← dataM 22/26, 700     │
          │  ↓ 18                                    │
          └──────────────────────────────────────────┘
```

| Propiedad | Valor |
|---|---|
| Ancho | `393 − 2×20 = 353` (o `(353 − 12) / 2 = 170.5` en rejilla de 2) |
| `backgroundColor` | `colors.surface` `#FFFFFF` |
| `borderRadius` | `radius.card` = **22** |
| `borderWidth` | **0** — sin borde |
| `padding` | `CARD_PADDING` = 18 (14 en rejilla) |
| `gap` interno | 12 |
| Sombra | `shadow.card` |
| Separación con la siguiente | `CARD_GAP` = 12 |
| Azulejo de icono | 44×44, `borderRadius: radius.md` (14), fondo `module.soft`, icono 22 `strokeWidth 1.75` en `module.primary` |
| Chevron derecho | Lucide `ChevronRight`, 20, `strokeWidth 1.75`, `colors.textFaint`, anclado arriba a la derecha |
| Punto de estado | 8×8, `borderRadius: pill`, `gap 6` con el texto (`captionStrong`) |
| Divisor interno | 1 px `colors.divider`, ancho completo del contenido (no sangrado dentro de una tarjeta) |
| Estado pulsado | `opacity 1` + `scale 0.985` + sombra a `shadow.subtle`, 120 ms |
| Área pulsable | Toda la tarjeta; mínimo 44 pt de alto |

### 7.2 Tarjeta de dato protagonista (dial de Coolio)

| Propiedad | Valor |
|---|---|
| `borderRadius` | `radius.sheet` = 28 |
| `padding` | 24 arriba/abajo, 18 lados |
| Sombra | `shadow.raised` |
| Arco | Diámetro 200, grosor de trazo 12, extremos redondeados, ángulo 270°, pista `colors.surfaceSunken`, relleno con `module.gradient` |
| Número | `dataHero` 56/60, 700, −1.6, `tabular-nums`, centrado óptico (`includeFontPadding: false`) |
| Unidad | `dataHeroUnit` 24/28, 600, `textSecondary`, `marginLeft: 2` |
| Pie | `caption` 13/18, `textSecondary`, 2 px bajo el número |
| Botones − / + | 48×48, `radius.pill`, fondo `surfaceSunken`, icono 22 `strokeWidth 1.75`, separados 24 del arco |
| Interruptor de encendido | 44×44, `radius.pill`, fondo `brandInk` cuando está activo, `surfaceSunken` cuando no |

### 7.3 Cabecera de sección

| Elemento | Valor |
|---|---|
| Título | `section` 18/24, 600, `text` |
| Acción derecha | `captionStrong` 13/18, `colors.brand` + `ChevronRight` 14 `strokeWidth 2` |
| Altura de la fila | 24 |
| Espacio hasta la primera tarjeta | 12 |
| Espacio desde el bloque anterior | `SECTION_GAP` = 28 |
| Margen lateral | Alineada exactamente con el borde de las tarjetas: 20 |

---

## 8. Los 5 errores visuales más graves de la interfaz actual

Ordenados por impacto sobre la percepción de calidad.

### 1. La tarjeta lleva borde y sombra a la vez, con radio corto

`Card.tsx` combina `borderWidth: StyleSheet.hairlineWidth` + `borderColor: colors.border` con `shadow.card`. Son dos formas contradictorias de separar la tarjeta del fondo: el borde traza un contorno duro que cancela visualmente la sombra, y el resultado es la "tarjeta plana" de la que se queja el propietario. Sumado a `radius.lg = 16`, la tarjeta se lee como un recuadro de wireframe.
**Arreglo:** quitar el borde por completo, subir el radio a 22, subir el padding a 18 y usar la sombra nueva (radio 18, offset `{0,6}`, `elevation: 3`, tinte `#1C2B24`). Es el cambio con mejor relación esfuerzo/resultado de toda la lista: se toca un archivo y cambia la percepción de toda la app.

### 2. Ningún estilo tipográfico tiene interlineado

Los 7 estilos de `typography` definen tamaño y peso, y nada más. Sin `lineHeight`, React Native aplica el de la fuente, que es aproximadamente proporcional al tamaño: un título de 24 y un cuerpo de 16 acaban con densidades de mancha parecidas, y la jerarquía que debería venir del ritmo vertical desaparece. Es exactamente el síntoma de "tipografía sin jerarquía". Encima, `title: 24` y `display: 32` están demasiado cerca para ser dos niveles distintos.
**Arreglo:** la escala de 14 estilos de §3.6, con `lineHeight` y `letterSpacing` explícitos en todos.

### 3. No existe el dato protagonista

Los tres mockups se sostienen sobre un número enorme: `24°C`, `68%`, `75%`. En la app el texto más grande disponible es `display: 32`, que es un tamaño de titular, no de dato. Sin él, una pantalla de Coolio es una lista de campos y no un termostato. Además, ningún estilo pide `tabular-nums`, así que cualquier número que cambie en vivo bailará de ancho.
**Arreglo:** `dataHero` / `dataL` / `dataM` con cifras tabulares, `includeFontPadding: false` y un solo `dataHero` por pantalla.

### 4. El fondo crema apaga la interfaz y anula la profundidad

`background: #F5F2EC` es el crema del póster, no el de la pantalla. Contra tarjetas blancas da un contraste de 1.09:1: la tarjeta casi no se distingue del fondo, así que la sombra tiene que hacer todo el trabajo y no puede. El conjunto se ve amarillento y sin aire. En los mockups el fondo dentro del teléfono es casi blanco y son las tarjetas las que aportan el blanco puro.
**Arreglo:** `canvas: #FAF8F4`, y reservar los cremas más saturados para hojas ilustradas y estados vacíos.

### 5. Cero iconos y cero acento de módulo aplicado

`(tabs)/_layout.tsx` declara cinco pestañas solo con texto ("sin iconos todavía"), y `theme.ts` define colores por módulo que ninguna pantalla consume. El resultado es una interfaz monocroma y sin señales de navegación: nada distingue Coolio de Plantico salvo el texto, y una barra de pestañas de puro texto se lee como un prototipo. Además, el campo `accent` de `theme.ts` significa cosas distintas en cada módulo (azul marino en Coolio, azul agua en Plantico), así que no es un token, es un cajón de sastre.
**Arreglo:** `lucide-react-native` con el componente `<Icon>` y la tabla de grosores de §3.7, más la regla del acento del 10 % de §3.8 con los seis campos por módulo bien definidos.

---

## 9. Orden de ejecución recomendado

Para quien lo convierta en código, de mayor a menor impacto por hora invertida:

1. `tokens.ts` completo: `palette`, `colors`, `spacing` + constantes de layout, `radius`, `shadow` (3 niveles), `typography` (14 estilos).
2. `Card.tsx`: quitar borde, radio 22, padding 18, `shadow.card`, estado pulsado con escala.
3. `Screen.tsx`: `SCREEN_PADDING_H 20`, `SECTION_GAP`, `SCROLL_BOTTOM 96`.
4. Instalar `lucide-react-native` y crear `<Icon>`; poner iconos en la barra de pestañas.
5. Componentes nuevos: `StatusDot`, `IconTile`, `SectionHeader`, `DataHero`, `StatTile`, `SceneChip`.
6. `theme.ts` con los 6 campos y aplicar la regla del acento en las tarjetas de módulo.
7. `ListRow`, `TextField`, `Button` según la tabla de §6.
8. **Modo oscuro completo (§4):** interfaz `Colors`, `makeColors` / `makeModuleThemes`, `ThemeProvider` + `useTheme()`, tokens `cardBorderWidth` / `shadow` / `statusBarStyle`, erradicar los hex sueltos de `ListRow.tsx` y añadir la regla de lint. Comprobación: `grep -r "'dark'" apps/mobile/` solo debe dar resultados en tres ficheros.
9. **Movimiento (§5):** tokens `duration` y `easing`, pulsación de botón y tarjeta, entrada escalonada de tarjetas, esqueletos de carga, transiciones de navegación, y el recorte por movimiento reducido en el proveedor.
10. **Vibración (§5.7):** `npx expo install expo-haptics`, módulo `haptics.ts` con nombres semánticos y el interruptor en Ajustes.
11. Animación del dato protagonista (cuenta, arco, reversión optimista): va la última porque depende de que `DataHero` y el dial ya existan.


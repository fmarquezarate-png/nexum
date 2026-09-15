# Nexum — Lenguaje visual

> Documento de dirección de arte. Define **qué valores** debe tener la interfaz.
> Está escrito para que quien lo convierta en código no tenga que preguntar nada:
> todo valor es un número o un hex. Fuente de verdad: los mockups de teléfono que
> aparecen dentro de los flyers de Nexum, Coolio y Plantico.

Versión 1.0 · Referencias: `brand/completos/`, `brand/iconos/`, `brand/mascotas/`
Afecta a: `apps/mobile/ui/tokens.ts`, `apps/mobile/ui/theme.ts` y todos los componentes de `apps/mobile/ui/`.

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

### 3.9 Preparación del modo oscuro

No se diseña ahora. Solo se deja el terreno listo, y esto sí es trabajo de tokens:

1. **`colors` deja de ser un objeto constante** y pasa a ser `makeColors(scheme: 'light' | 'dark'): Colors`, con una interfaz `Colors` que fija las claves. El tipo garantiza que el día del modo oscuro no falte ninguna.
2. **Un `ThemeProvider` y un hook `useColors()`**. Los componentes dejan de hacer `import { colors }` y pasan a `const c = useColors()`. Consecuencia práctica: los `StyleSheet.create` que dependan de color se convierten en funciones memoizadas o se aplican como estilo en línea sobre una base estática.
3. **Prohibido importar `palette` fuera de `tokens.ts`.** Hoy `theme.ts` lo hace y por eso los colores de módulo no podrán cambiar de tema. Los temas de módulo también pasan a `makeModuleThemes(scheme)`.
4. **Erradicar los hex sueltos.** En `ListRow.tsx` hay seis colores escritos a mano en `tonos` (`#1C6B3E`, `#DCF0E4`, `#8A6318`, `#FAEFD6`, `#8F2F1E`, `#F8DFDA`). En modo oscuro quedarían fluorescentes. Van a `palette` como `success/warning/danger` + `…Soft` + `…Ink`.
5. **Las sombras no sirven en oscuro.** Sobre fondo oscuro una sombra no se ve. El token de profundidad se generaliza a `elevation(level)`, que en claro devuelve sombra y en oscuro devuelve un color de superficie más claro: `surface` `#181F1B` para nivel 1, `#1F2724` para nivel 2, `#262F2B` para nivel 3, más un borde `#2C3531` de 1 px.
6. **Valores de arranque para oscuro** (sin afinar, solo para que la interfaz no explote el día que se active): `canvas #0D1311`, `surface #181F1B`, `surfaceSunken #131A17`, `text #EAEFEC`, `textSecondary #A6B3AC`, `textMuted #7D8A83`, `divider #2C3531`, `brand #47A37D` (el `#1E5B45` no tiene contraste suficiente sobre fondo oscuro), `brandSoft #16302668`.
7. **`StatusBar`** pasa a `style="auto"` y el `SafeAreaView` toma su color de `canvas`, nunca de un literal.

---

## 4. Tabla: qué cambia respecto a hoy

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
| 21 | `colors` es un objeto constante | `makeColors(scheme)` + `useColors()` | Sin esto, el modo oscuro obliga a tocar todos los componentes |
| 22 | 6 hex a mano en `ListRow.tsx` (`tonos`) | Todos a `palette` | Colores fuera del sistema; en oscuro serían inservibles |
| 23 | `Screen` con `paddingBottom: xxxl = 48` | `SCROLL_BOTTOM = 96` | Con barra de pestañas y safe area, 48 deja la última tarjeta medio tapada |

---

## 5. Anatomía de una tarjeta

Medidas sobre un ancho de pantalla de 393 pt. Todo valor sale de un token.

### 5.1 Tarjeta de dispositivo (la unidad básica de la portada)

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

### 5.2 Tarjeta de dato protagonista (dial de Coolio)

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

### 5.3 Cabecera de sección

| Elemento | Valor |
|---|---|
| Título | `section` 18/24, 600, `text` |
| Acción derecha | `captionStrong` 13/18, `colors.brand` + `ChevronRight` 14 `strokeWidth 2` |
| Altura de la fila | 24 |
| Espacio hasta la primera tarjeta | 12 |
| Espacio desde el bloque anterior | `SECTION_GAP` = 28 |
| Margen lateral | Alineada exactamente con el borde de las tarjetas: 20 |

---

## 6. Los 5 errores visuales más graves de la interfaz actual

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

## 7. Orden de ejecución recomendado

Para quien lo convierta en código, de mayor a menor impacto por hora invertida:

1. `tokens.ts` completo: `palette`, `colors`, `spacing` + constantes de layout, `radius`, `shadow` (3 niveles), `typography` (14 estilos).
2. `Card.tsx`: quitar borde, radio 22, padding 18, `shadow.card`, estado pulsado con escala.
3. `Screen.tsx`: `SCREEN_PADDING_H 20`, `SECTION_GAP`, `SCROLL_BOTTOM 96`.
4. Instalar `lucide-react-native` y crear `<Icon>`; poner iconos en la barra de pestañas.
5. Componentes nuevos: `StatusDot`, `IconTile`, `SectionHeader`, `DataHero`, `StatTile`, `SceneChip`.
6. `theme.ts` con los 6 campos y aplicar la regla del acento en las tarjetas de módulo.
7. `ListRow`, `TextField`, `Button` según la tabla de §4.
8. Preparación del modo oscuro (§3.9): `makeColors` + `useColors` + erradicar hex sueltos.

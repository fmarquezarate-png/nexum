# Nexum, Coolio y Plantico — arquitectura de apps

> Documento de producto. Decide **qué es cada app, qué vive en cada una y cómo se
> pasa de una a otra**. Está escrito para que quien lo implemente no tenga que
> preguntar nada: cada pantalla, cada archivo y cada duración están dichos.
>
> Fuente de verdad: los tres flyers (`brand/originales/`, maquetas de iPhone de
> 393 pt) y, muy en concreto, **las barras de pestañas de los mockups de
> teléfono**, que son distintas en Nexum y en Coolio. Esa diferencia es el
> documento entero.

Versión 1.0 · Afecta a: `apps/mobile/app/`, `apps/mobile/modules/`, `apps/mobile/ui/`
Se apoya en: `docs/architecture.md`, `docs/adding-a-module.md`,
`docs/diseno/01-lenguaje-visual.md`, `docs/diseno/02-experiencia-de-uso.md`

---

## 0. La decisión, en una frase

**Coolio y Plantico no son pantallas de Nexum: son mundos. Entrar en uno
sustituye la barra de pestañas de Nexum por la suya, y se sale por la misma
puerta por la que se entró.**

---

## 1. El error de concepto que se corrige

Hoy la app es **una sola aplicación con cinco pestañas** en la que "Coolio" y
"Plantico" son etiquetas de color. El síntoma que lo delató: **Airi, la mascota
de Coolio, aparecía en la pestaña de Estadísticas de Nexum** sin que el usuario
hubiera entrado nunca en Coolio, ni tuviera un solo aire acondicionado.

Eso no es un fallo de una pantalla. Es la consecuencia lógica de una estructura
en la que Nexum y Coolio comparten el mismo espacio: si todo está en el mismo
sitio, cualquier cosa puede salir en cualquier parte.

Lo que el producto quiere ser:

> Nexum es **la casa**: la cuenta, quién eres, dónde vives, qué habitaciones
> tiene, quién más entra y qué aparatos hay. Coolio y Plantico son **los
> oficios**: el clima y el riego, cada uno con su forma de trabajar, su
> vocabulario y su cara.

La analogía del `docs/architecture.md` ya lo decía —el centro comercial y las
tiendas— pero la app no la había construido. Este documento la construye.

### Las tres barras de pestañas, medidas sobre los mockups

| App | Pestañas del mockup | Cabecera |
|---|---|---|
| **Nexum** | Inicio · Dispositivos · Automatizaciones · Estadísticas · Ajustes | Logo Nexum a la izquierda, avatar a la derecha |
| **Coolio** | Equipos · Programas · Estadísticas · Ajustes | Logotipo Coolio centrado, engranaje a la derecha |
| **Plantico** | Plantas · Historial · Ajustes | Flecha ‹ a la izquierda |

Tres barras distintas, con distinto número de pestañas y distinto vocabulario
("Dispositivos" en Nexum, "Equipos" en Coolio, "Plantas" en Plantico). **No son
tres versiones de la misma barra: son tres apps.** Una sola barra no puede
servir a las tres sin mentir.

---

## 2. Modelo de navegación

### 2.1 La decisión y por qué

**Entrar en Coolio conmuta de mundo: se cambia la barra de pestañas entera.**
Coolio no es una pantalla apilada dentro de Nexum, ni una sexta pestaña.

Tres opciones se consideraron:

| Opción | Qué sería | Por qué no |
|---|---|---|
| **A · Coolio como pestaña** | Una sexta pestaña "Coolio" en la barra de Nexum | La barra crecería con cada módulo. A los cuatro módulos es ilegible. Y contradice el mockup de Coolio, que tiene barra propia |
| **B · Coolio como pantalla apilada** | Una pantalla normal con flecha atrás, dentro del mundo Nexum | Coolio necesita **cuatro secciones** (equipos, programas, estadísticas, ajustes). Meterlas en una pantalla apilada obliga a inventar una navegación interna distinta de la del resto de la app |
| **C · Coolio como mundo** ✅ | Barra de pestañas propia, que sustituye a la de Nexum | Es lo que dicen los mockups. Escala a diez módulos sin tocar nada. Y es el único modelo en el que "dónde estoy" se responde mirando la pantalla, sin pensar |

**El argumento que decide:** el propietario no es programador, y el modelo tiene
que ser obvio **sin explicaciones**. La barra de pestañas es el elemento más
estable y más mirado de una app de móvil. Si cambia, cambia el sitio. Es la
misma señal que usan el teléfono y el navegador dentro de un sistema operativo,
y no hace falta que nadie te la explique nunca.

Con el modelo de mundos, la pregunta "¿por qué me sale la mascota de Coolio?"
deja de poder formularse: **Airi vive dentro del mundo Coolio y no tiene forma
de salir de él.** El error de concepto se arregla en la estructura, no a base de
condicionales en las pantallas.

### 2.2 Cómo se vuelve a Nexum

Tres salidas, las tres siempre disponibles, sin excepción:

1. **La puerta.** Arriba a la izquierda de **todas** las pantallas raíz del
   mundo (las que cuelgan de su barra de pestañas) hay una zona pulsable de
   44×44 pt con: chevron `‹` (20 pt, `strokeWidth` 1.75, color `textSecondary`)
   + azulejo de 24 pt con el icono de Nexum (`brand/iconos/nexum-icono.png`, sin
   teñir) + la palabra **Nexum** en `caption`, color `textSecondary`.
   Se lee "‹ 🏠 Nexum". No dice "Volver" ni "Atrás": dice **a dónde vas**, que
   es la única información útil.
2. **El gesto del sistema.** Deslizar desde el borde izquierdo. Funciona en
   todas las pestañas del mundo, no solo en la primera.
3. **El botón físico de Android.** Desde cualquier pestaña del mundo devuelve a
   Nexum, no cierra la app.

> Los mockups de Coolio no dibujan esta puerta (el de Plantico sí dibuja una
> flecha ‹). Los mockups nunca dibujan la navegación de vuelta; eso no es
> permiso para omitirla. **La puerta es obligatoria en las cuatro pestañas de
> Coolio**, y no se sustituye por "pulsa atrás dos veces".

**Lo que no se hace:** una pestaña "Nexum" dentro de la barra de Coolio. Una
barra de pestañas enumera secciones de un mismo sitio; meter ahí la salida
mezcla dos jerarquías y enseña que Nexum es "una parte de Coolio", que es
justo lo contrario de lo que queremos decir.

### 2.3 Mapa de navegación completo

```
ARRANQUE
  sin sesión ─────────────────────────► Bienvenida / Iniciar sesión
  con sesión, 0 casas ────────────────► Asistente de alta
  con sesión, ≥1 casa ────────────────► MUNDO NEXUM

═══ MUNDO NEXUM ══════════════ barra verde Nexum, 5 pestañas ═══════════
  Inicio            portada: saludo · clima · escenas · Mis dispositivos ·
                    Automatizaciones · Apps integradas · Y más por venir
  Dispositivos      inventario del hogar por habitación (mirar, no tocar)
  Automatizaciones  escenas y reglas que cruzan módulos
  Estadísticas      la casa: consumo, clima, comparación entre apps
  Ajustes           Tu cuenta · Tus casas · La app

  Apiladas encima del mundo Nexum (flecha ‹, gesto de deslizar):
    Perfil
    Mis casas ──► Detalle de casa ──► Habitación
                                  ──► Miembro (hoja)
                                  ──► Código de invitado / QR (hoja)
    Canjear un código (hoja)
    Añadir un dispositivo ──► elige app ──► entra al alta DENTRO de esa app
    Ficha de un módulo que aún no existe  (Plantico, hoy)
    Asistente de alta (a pantalla completa, con salida)

  Puertas de salida hacia otro mundo (desde Inicio, Dispositivos,
  Automatizaciones, Estadísticas y Apps integradas):
        ──────────────────────────────────────────────┐
                                                      ▼
═══ MUNDO COOLIO ═════════════ barra Coolio, 4 pestañas ════════════════
  ‹ Nexum                                     [logotipo Coolio]    ⚙
  Equipos           selector de casa · un aire por tarjeta · dial y mandos
  Programas         horarios y reglas SOLO de clima
  Estadísticas      horas de uso, temperatura, ahorro — SOLO de clima
  Ajustes           ajustes de Coolio (no los de la cuenta)

  Apiladas dentro del mundo Coolio:
    Equipo ──► Ajustes del equipo ──► Marca del mando / Resincronizar
    Añadir un equipo (asistente de emparejado del ESP32)
    Programa nuevo / editar programa (hoja)

  Salida:  ‹ Nexum  ·  deslizar desde el borde  ·  atrás de Android
        ──────────────────────────────────────────────┐
                                                      ▼
═══ MUNDO PLANTICO ══════ barra Plantico, 3 pestañas ══ (cuando exista) ═
  ‹ Nexum                                   [logotipo Plantico]    ⚙
  Plantas · Historial · Ajustes

  HOY, que no existe:  no hay mundo. Tocar Plantico abre una pantalla
  apilada dentro de Nexum ("ficha de módulo"), no un mundo vacío.
```

**Regla de profundidad:** un mundo **nunca** abre otro mundo. Coolio no puede
llevarte a Plantico. Para ir de Coolio a Plantico se pasa por Nexum. Es lo que
mantiene el mapa mental en una sola bifurcación.

**Regla de estado:** al volver a Nexum, Inicio conserva su posición de scroll.
Al reentrar en un mundo, se abre **la pestaña en la que lo dejaste**, durante la
sesión; en un arranque en frío, siempre la primera (Equipos / Plantas).

---

## 3. Reparto de responsabilidades

La pregunta que decide cada fila: **¿lo necesitaría también un módulo de
iluminación?** Si sí, es de Nexum. Si es propio del oficio, es de la sub-app.

| Responsabilidad | Vive en | Por qué |
|---|---|---|
| **Cuenta** (registro, login, contraseña, cerrar sesión, borrar cuenta) | **Nexum** | Hay una identidad, no tres. Un login por módulo sería absurdo |
| **Perfil** (nombre, avatar) | **Nexum** | Eres la misma persona en todos los mundos |
| **Casas** (crear, renombrar, borrar, abandonar) | **Nexum** | Una casa contiene aires *y* plantas. No pertenece a ningún módulo |
| **Casa activa** | **Nexum**, y los mundos la heredan | Se elige en la cabecera de Inicio. Coolio la muestra ("Mi Casa / Casa Ana") y puede cambiarla, pero el cambio es global: al volver a Nexum, sigue cambiada |
| **Habitaciones** | **Nexum** | El Salón es del hogar, no del aire que hay en él |
| **Miembros y roles** | **Nexum** | Un invitado lo es de la casa. Los permisos ya son del núcleo (`can_control_device`), y no se duplican |
| **Códigos de invitado** (emitir, QR, canjear, revocar) | **Nexum** | Canjear un código es *entrar en una casa*. Si un código da acceso solo a un aparato, se emite igual desde Nexum, eligiendo el aparato de la lista |
| **Inventario de dispositivos** (qué hay, en qué habitación, online/offline, renombrar, mover de habitación) | **Nexum** | Es la tabla `devices` del núcleo. Nombre y ubicación son datos del hogar, no del oficio |
| **Alta de un dispositivo** (emparejado) | **Punto de entrada en Nexum, asistente en la sub-app** | "Añadir un dispositivo" está en Nexum y pregunta **qué** añades; a partir de ahí manda el módulo, porque emparejar un ESP32 con emisor IR no se parece en nada a emparejar una bomba de riego |
| **Control del dispositivo** (encender, 24 °C, modo frío, ventilación, "Regar ahora") | **Sub-app**, en exclusiva | Es el oficio. Nexum no sabe qué es "modo seco" y no debe aprenderlo |
| **Configuración del dispositivo** (marca del mando IR, resincronizar, calibrar el sensor de humedad, litros por riego) | **Sub-app** | Solo tiene sentido dentro de su módulo |
| **Escenas** (En casa · Noche · Fuera · Eco) | **Nexum** | Una escena toca el aire *y* el riego *y* las luces a la vez. Es exactamente lo que solo el paraguas puede hacer |
| **Automatizaciones que cruzan módulos** ("si salgo de casa, apaga el aire y retrasa el riego") | **Nexum** | Ningún módulo puede escribir una regla sobre otro sin conocerlo, y conocerse rompe la arquitectura |
| **Programas de un módulo** (horario del aire, calendario de riego) | **Sub-app** | Coolio los llama **Programas**; Plantico, **Historial/calendario**. El vocabulario es del oficio. El motor es del núcleo (`core/automations`); lo que cambia son **las acciones que el módulo ofrece** |
| **Estadísticas de la casa** (consumo total, clima exterior, comparación "el aire gasta X, el riego Y") | **Nexum** | Comparar módulos solo puede hacerlo quien está por encima de todos |
| **Estadísticas de un oficio** (horas de aire encendido por equipo, grados alcanzados, litros regados por planta) | **Sub-app** | Requieren entender el dominio. Coolio ya tiene su pestaña Estadísticas en el mockup |
| **Notificaciones — el fontanero** (token push, permisos del sistema, centro de avisos, interruptor general) | **Nexum** | Hay una sola bandeja. Recibir seis apps de avisos sería el peor resultado posible |
| **Notificaciones — el contenido** (qué avisa, con qué texto, y el interruptor por tipo: "avísame si el depósito baja") | **Sub-app** | El módulo decide qué merece molestar. Nexum entrega |
| **Ajustes de la cuenta, las casas y la app** (idioma, claro/oscuro, vibración, acerca de) | **Nexum** | Globales por definición |
| **Ajustes del módulo** (el engranaje del mockup de Coolio: unidades, comportamiento por defecto, avisos de clima) | **Sub-app** | Y **nunca** lleva "Cerrar sesión" ni "Borrar cuenta": eso solo existe en Ajustes de Nexum. Un mundo no puede echarte de la app |
| **Clima exterior** (22 °C Barcelona) | **Nexum**, y los mundos lo consumen | Es un dato del hogar, no del aire acondicionado. Coolio lo muestra (28 °C exterior en su mockup) pidiéndoselo al núcleo |

### Las dos transversales, resueltas de frente

**Estadísticas.** Aparecen en las dos barras de pestañas, y con razón: son
preguntas distintas.

- **Nexum → Estadísticas** responde *"¿cómo va mi casa?"*: consumo agregado,
  clima de la semana, y una fila por app con su contribución.
- **Coolio → Estadísticas** responde *"¿cómo va mi aire?"*: horas encendido del
  equipo del Salón, temperatura media, comparación entre equipos.

**La regla dura que arregla el fallo de Airi:** Nexum solo muestra la fila de un
módulo **si ese módulo tiene al menos un dispositivo en la casa activa**. Si no
tiene ninguno, la fila **no existe** —no aparece atenuada, ni vacía, ni con un
"próximamente"—. Nexum nunca habla en nombre de un módulo que el usuario no
tiene.

**Automatizaciones.** También en las dos, y también son cosas distintas:

- **Nexum → Automatizaciones**: escenas y reglas que tocan más de un módulo, o
  que se disparan por algo del hogar (ubicación, hora, alguien llega).
- **Coolio → Programas**: horarios del clima y nada más.

Una regla se crea donde vive su ambición. Si solo habla de aires, se crea en
Coolio. En cuanto menciona dos módulos, es de Nexum. Si un usuario crea en
Coolio un programa y luego quiere añadirle una acción de riego, Coolio ofrece
**"Convertir en automatización de Nexum"**, que la mueve y abre la pantalla de
Nexum. El camino inverso no existe: de arriba abajo no se degrada.

---

## 4. La portada de Nexum

Pantalla `app/(nexum)/index.tsx`. Es la cara del producto y la que más veces se
ve. Fondo `canvas`, tarjetas `surface`, sin barra superior (§3.4 del doc 02: el
título vive en el contenido).

### 4.1 La tensión, resuelta

> Si los dispositivos viven en las sub-apps, ¿por qué Nexum enseña "Mis
> dispositivos"?

**Porque "Mis dispositivos" en Nexum no controla nada: informa.** Es el
equivalente doméstico del salpicadero de un coche, que te dice que hay gasolina
sin ser el depósito.

Concretamente, la distinción es ésta y se aplica sin excepciones:

| | Nexum | Sub-app |
|---|---|---|
| Verbo | **Mirar** | **Hacer** |
| Qué enseña | Que existe, dónde está, si va bien | Los mandos |
| Grano | Una tarjeta **por app**, con su resumen | Un aparato, con su dial |
| Al tocar | Cruza al mundo de esa app | Actúa |

En Nexum **no hay un solo control que cambie el estado de un aparato**: ni
interruptor de encendido, ni `+`/`−` de temperatura, ni "Regar ahora". Las dos
únicas cosas que Nexum puede ejecutar son **escenas** y **automatizaciones**,
porque son suyas.

Y el mockup ya lo dice: bajo "Mis dispositivos" no hay "Salón" y "Dormitorio",
hay **"Plantico"** y **"Coolio"**. Nexum lista aplicaciones con su estado, no
aparatos con sus mandos.

### 4.2 Orden de los bloques

Fijo. De arriba abajo, con `layout.sectionGap` entre bloques:

**0 · Cabecera** (no hace scroll con el resto; se queda arriba)
- Izquierda: logotipo Nexum (`brand/completos/nexum-completo.png`, alto 28 pt).
- Derecha: avatar circular de 40 pt. **Al tocar → Perfil** (apilada).
- Sin barra superior del sistema. Sin título "Inicio": lo dice la pestaña.

**1 · Saludo y clima**
- Izquierda, dos líneas:
  - `display`: `¡Hola, {nombre}!` — solo el nombre de pila. Sin nombre:
    `¡Hola!`.
  - Debajo, **el selector de casa activa**, pulsable: nombre de la casa +
    chevron ⌄ de 16 pt, en `body`/`textSecondary`. Abre una hoja con la lista de
    casas y, al final, **"Gestionar mis casas"**.
  - *Nota:* el mockup pone aquí la frase "Tu hogar en armonía.". Se sustituye
    por el selector de casa, porque el doc 02 §4 exige que la casa activa viva
    en la cabecera de Inicio y una frase decorativa no puede ocupar ese sitio.
    Con **una sola casa**, el selector se muestra igual (sin chevron, no
    pulsable): así el usuario aprende dónde está antes de tener dos.
- Derecha: **chip de clima**, tarjeta pequeña con icono de sol/nube, `dataL` con
  la temperatura y `caption` con la ciudad, más un chevron ⌄.
  Al tocar: hoja con la previsión de hoy y los próximos días. Es información del
  hogar, no de Coolio: **el chip nunca lleva cyan**.
  Sin permiso de ubicación o sin datos: el chip **no se dibuja**. No se pone un
  hueco gris.

**2 · Escenas**
- Cuatro azulejos en fila (`En casa · Noche · Fuera · Eco`), icono de 24 pt
  arriba y rótulo `caption` debajo, altura 64 pt, radio `lg`.
- El activo lleva relleno `brandFill` verde Nexum y texto `onBrand`; los demás,
  `surface` con borde `border`.
- Al tocar: se aplica la escena. Vibra `Selection` (§5.7 del doc 01), la escena
  pulsada pasa a activa en 200 ms `standard`, y **aparece un toast**: "Escena
  En casa aplicada". Si falla, revierte en 200 ms y sale el error.
- **Es verde Nexum siempre**, aunque la escena acabe apagando un Coolio. La
  escena es de la casa.
- Sin dispositivos: el bloque **no se dibuja**. Una escena que no hace nada es
  un botón mentiroso.

**3 · Mis dispositivos** — cabecera de sección `section` + enlace "Ver todos →"
- Una tarjeta **por módulo con al menos un dispositivo en la casa activa**,
  en el orden en que se declaran en el manifiesto.
- Contenido de la tarjeta (calcado del mockup):
  - Azulejo de 44 pt, radio `md`, fondo `soft` del módulo, con su logotipo sin
    teñir.
  - Chevron `›` arriba a la derecha.
  - Nombre del módulo en `titleS`.
  - **Punto de estado** + texto corto: "Todo bien" / "Encendido" / "Sin señal".
    El punto lleva el `primary` del módulo cuando el estado es normal, y los
    colores de éxito/aviso/error del sistema cuando hay algo que decir: **el
    estado manda sobre el acento** (§3.8 del doc 01).
  - Hasta **tres líneas** de resumen en `caption`, las que decida el módulo
    ("Humedad: 68%", "Próximo riego: Hoy, 18:00", "Agua restante: 6 riegos").
  - Opcionalmente, **una fila de aparato destacado** con su propio chevron
    ("24°C · Modo: Frío · Salón"), como en la tarjeta de Coolio del mockup.
- **Al tocar la tarjeta:** entra en el mundo de ese módulo, pestaña principal.
- **Al tocar la fila del aparato destacado:** entra en el mundo de ese módulo,
  **directamente en la pantalla de ese aparato**, con la pila preparada para que
  atrás lleve a la lista del módulo y, de ahí, a Nexum.
- **"Ver todos →"**: va a la pestaña **Dispositivos** de Nexum (el inventario
  por habitación). No a un mundo: es la vista del hogar.
- Sin ningún dispositivo en toda la casa: el bloque se sustituye por el estado
  vacío de la app completa (§7.1).

**4 · Automatizaciones** — cabecera `section` + "Ver todas →"
- Hasta **tres** filas: icono en azulejo de 36 pt, nombre en `body`, condición
  en `caption`, interruptor a la derecha.
- El interruptor sí se puede accionar desde aquí: **la automatización es de
  Nexum**, no es controlar un aparato ajeno. Vibra `Impact.Light`.
- El azulejo lleva el color del módulo **solo si la regla afecta a un único
  módulo**; si cruza dos, es verde Nexum.
- Sin automatizaciones: el bloque no se dibuja (el vacío digno vive en su
  pestaña, no en la portada).

**5 · Apps integradas** — cabecera `section` + botón `+` redondo de 32 pt a la
derecha
- **Este bloque se dibuja SIEMPRE**, tenga el usuario lo que tenga. Es el
  catálogo, no una lista de deberes: responde a "¿qué es esta app?".
- Rejilla de dos columnas. Una tarjeta por módulo **disponible**:
  azulejo de 56 pt con su logotipo, nombre en `titleS`, tagline en `caption`
  ("Riego inteligente para tus plantas.", "Controla tu aire acondicionado."),
  chevron `›`.
- Un módulo **disponible pero sin dispositivos** aparece igual, con el tagline
  en lugar del estado. Entrar en él lleva a su mundo, que enseñará su vacío
  (§7.2). Nunca se marca en gris ni se bloquea.
- Un módulo **que todavía no existe** (Plantico, hoy) aparece con su logotipo y
  su tagline y un chip pequeño **"Pronto"** en `surfaceSunken`. Al tocar, abre
  su ficha (§7.3), no un mundo.
- El botón `+`: abre la hoja "Añadir un dispositivo", que lista los módulos
  disponibles y arranca su asistente de alta. Es la misma hoja que el botón de
  la pestaña Dispositivos.

**6 · Y más por venir…** — cabecera `section`, sin enlace
- Rejilla de dos columnas con tarjetas de **altura reducida** (72 pt), fondo
  `surfaceSunken` en vez de `surface`, sin sombra: son ideas, no productos, y
  deben pesar visualmente menos que todo lo de arriba.
- Cuatro fijas, del mockup: Iluminación · Seguridad · Energía · Nuevas ideas.
  Icono en azulejo neutro (nunca color de módulo: **no tienen módulo**), nombre
  en `body`, una línea en `caption`.
- **Al tocar**: las tres primeras abren la misma ficha genérica de §7.3, sin
  fecha y sin promesa. "Nuevas ideas" abre una hoja con un campo de texto y un
  botón "Enviar": *"¿Qué te gustaría controlar desde Nexum?"*. Si el envío no
  está implementado todavía, **"Nuevas ideas" no es pulsable** y no lleva
  chevron. Una tarjeta que no hace nada al tocarla es peor que una tarjeta que
  no se puede tocar.

---

## 5. Estructura de rutas (Expo Router)

### 5.1 El árbol

```
apps/mobile/app/
├── _layout.tsx                    Stack raíz. NÚCLEO. No se toca al añadir módulos
├── index.tsx                      Arranque: decide a dónde va cada uno
│
├── (auth)/                        Sin sesión
│   ├── _layout.tsx
│   ├── sign-in.tsx · sign-up.tsx · forgot-password.tsx
│
├── (nexum)/                       ══ MUNDO NEXUM ══  (hoy se llama (tabs))
│   ├── _layout.tsx                <Tabs> de 5 pestañas, verde Nexum
│   ├── index.tsx                  Portada (§4)
│   ├── dispositivos.tsx           Inventario por habitación
│   ├── automatizaciones.tsx       Escenas y reglas multi-módulo
│   ├── estadisticas.tsx           La casa
│   └── ajustes.tsx                Tu cuenta · Tus casas · La app
│
├── (mundos)/                      ══ CONTENEDOR DE MUNDOS ══
│   ├── _layout.tsx                <Stack headerShown={false}>. NÚCLEO, genérico:
│   │                              no nombra ningún módulo. Define la transición
│   │                              de entrada y salida de mundo (§6)
│   ├── coolio/
│   │   ├── _layout.tsx            <Tabs> de 4 pestañas, con la puerta ‹ Nexum
│   │   ├── index.tsx              Equipos
│   │   ├── programas.tsx
│   │   ├── estadisticas.tsx
│   │   ├── ajustes.tsx
│   │   ├── equipo/[id].tsx        Detalle de un aire (apilada dentro del mundo)
│   │   ├── equipo/[id]/ajustes.tsx
│   │   └── anadir.tsx             Asistente de emparejado del ESP32
│   └── plantico/                  ← AÑADIR PLANTICO ES CREAR ESTA CARPETA
│       ├── _layout.tsx            <Tabs> de 3 pestañas
│       ├── index.tsx              Plantas
│       ├── historial.tsx
│       ├── ajustes.tsx
│       ├── planta/[id].tsx
│       └── anadir.tsx
│
├── modulo/[id].tsx                Ficha de un módulo que aún no existe (§7.3).
│                                  Genérica: se alimenta del manifiesto
├── anadir-dispositivo.tsx         Hoja: "¿Qué quieres añadir?" (elige módulo)
├── onboarding/index.tsx           Asistente de alta
├── perfil.tsx
├── canjear.tsx
└── casas/
    ├── index.tsx · [id].tsx
    ├── [id]/habitacion/[hid].tsx
```

`emparejar.tsx`, hoy en la raíz, **desaparece de ahí**: su contenido se muda a
`(mundos)/coolio/anadir.tsx`. Emparejar un ESP32 con emisor IR es del oficio.

### 5.2 Qué va en cada layout

| Archivo | Qué hace | Qué NO hace |
|---|---|---|
| `app/_layout.tsx` | Providers (tema, sesión, toasts). `<Stack>` con `headerShown:false`. Declara `(auth)`, `(nexum)`, `(mundos)`, y las apiladas del núcleo | **Nunca nombra un módulo.** `(mundos)` es una sola entrada, no una por módulo |
| `app/(nexum)/_layout.tsx` | Las 5 pestañas. `tabBarActiveTintColor: colors.brand`. Iconos Lucide a 23 pt (1.75 / 2.2 activo) | No conoce ningún módulo. Lo que sabe de Coolio le llega por el manifiesto |
| `app/(mundos)/_layout.tsx` | `<Stack screenOptions={{ headerShown:false, animation:'slide_from_right', gestureEnabled:true }}>`. Es el punto único donde se define cómo se entra y se sale de un mundo | No enumera módulos: Expo Router descubre las carpetas hijas solo |
| `app/(mundos)/coolio/_layout.tsx` | Las 4 pestañas de Coolio, su acento, su cabecera (logotipo centrado + ⚙) y **la puerta ‹ Nexum**. Se apoya en `<MundoTabs>` de `ui/`, que ya trae la puerta y la cabecera resueltas | No toca nada del núcleo. No redefine permisos, casas ni sesión |

### 5.3 El manifiesto: el único punto de registro

Expo Router descubre las **rutas** solo, pero la portada de Nexum necesita
**datos** de cada módulo (logotipo, tagline, resumen, si está disponible). Eso
no se puede adivinar de una carpeta.

Se resuelve con **un manifiesto que vive en `modules/`, no en `core/`**, y que
es la única costura del sistema:

```
apps/mobile/modules/
├── registry.ts          ← la lista. Añadir un módulo = añadir UNA línea aquí
├── tipos.ts             ← la forma del manifiesto (ModuleManifest)
├── coolio/
│   ├── index.ts         ← export const manifiesto: ModuleManifest
│   └── …
└── plantico/
    ├── index.ts
    └── …
```

Forma del manifiesto —todo lo que Nexum necesita saber de un módulo, y nada
más—:

| Campo | Tipo | Para qué |
|---|---|---|
| `id` | `ModuleId` | Clave del tema en `ui/theme.ts` |
| `estado` | `'disponible' \| 'proximamente'` | Decide si tocar su tarjeta abre un mundo o la ficha de §7.3 |
| `ruta` | `` `/${string}` `` | `'/coolio'`. La puerta de entrada al mundo |
| `logo` | `ImageSourcePropType` | `brand/iconos/*.png`. **Nunca se tiñe** |
| `mascota` | `ImageSourcePropType \| undefined` | Solo la usa el propio mundo. Nexum la ignora siempre |
| `tagline` | `string` | "Controla tu aire acondicionado." |
| `resumenDeHogar(homeId)` | `Promise<ResumenModulo \| null>` | El contenido de su tarjeta en "Mis dispositivos" |
| `accionesDeAutomatizacion` | `AccionModulo[]` | Lo que el módulo ofrece al motor de reglas de Nexum |
| `seriesDeEstadisticas` | `SerieModulo[]` | Su contribución a las estadísticas de la casa |

`ResumenModulo` = `{ estado: 'ok'|'aviso'|'apagado'|'sinSenal', textoEstado, lineas: string[] (≤3), destacado?: { titulo, ruta } }`.

**La regla que mata el fallo de Airi, escrita como contrato:**

> `resumenDeHogar()` devuelve **`null`** si el módulo no tiene ningún dispositivo
> en esa casa. Cuando devuelve `null`, Nexum no dibuja **nada** de ese módulo:
> ni tarjeta, ni fila de estadísticas, ni acción de automatización, ni mascota,
> ni color. El módulo solo sigue apareciendo en "Apps integradas", que es el
> catálogo.

### 5.4 El coste de añadir Plantico

1. Crear `app/(mundos)/plantico/` con sus pantallas. *(una carpeta)*
2. Crear `modules/plantico/index.ts` con su manifiesto. *(una carpeta)*
3. Añadir `plantico` al array de `modules/registry.ts`. *(una línea)*
4. Añadir su entrada en `ui/theme.ts` — **ya está hecha**.
5. Los pasos 1–4 de `docs/adding-a-module.md` (tipo `module_id`, tablas
   satélite, RLS, contrato).

**Cero cambios en `core/`. Cero cambios en `app/_layout.tsx`. Cero cambios en
`app/(nexum)/`.** Eso es la prueba del examen de `docs/adding-a-module.md`, y
este modelo la aprueba.

La flecha sigue yendo en un solo sentido: `core/` no importa `modules/`. Quien
importa `modules/registry` son las **pantallas** de `app/(nexum)/`, que no son
núcleo de dominio sino presentación, y lo hacen contra un tipo genérico sin
nombrar a nadie. Para dejarlo blindado: **está prohibido escribir la cadena
`'coolio'` o `'plantico'` en cualquier archivo de `core/` o de `app/(nexum)/`.**
Es una regla que se puede comprobar con un `grep` y debe estar en la lista de
revisión.

---

## 6. Identidad de cada mundo

### 6.1 Dónde aparece el color del módulo

La regla del §3.8 del doc 01 sigue vigente: **≤ 10 % del área visible (8 % en
oscuro), y solo en cuatro sitios**. Aplicada a este modelo:

| Superficie | ¿Color de módulo? | Dónde exactamente |
|---|---|---|
| **Mundo Nexum — portada** | Sí, mínimo | Azulejo del logotipo + punto de estado de cada tarjeta. Nada más. El bloque "Mis dispositivos" con dos módulos suma ~4 % de la pantalla |
| **Mundo Nexum — Dispositivos** | Sí, mínimo | Azulejo de 36 pt por fila + punto de estado |
| **Mundo Nexum — Automatizaciones** | Sí, si la regla es de un solo módulo | Azulejo del icono. Regla multi-módulo = verde Nexum |
| **Mundo Nexum — Estadísticas** | Sí | El trazo de la serie de ese módulo en el gráfico, y su punto en la leyenda |
| **Mundo Nexum — barra de pestañas** | **Nunca** | Verde Nexum siempre |
| **Mundo Coolio — cabecera** | Sí | El logotipo Coolio, en su color de marca |
| **Mundo Coolio — dial y dato protagonista** | Sí | El arco del dial (`gradient`), el número en `data`, los chips de modo activos |
| **Mundo Coolio — botón primario** | Sí | "Encender", "Resincronizar", "Regar ahora" |
| **Mundo Coolio — barra de pestañas** | **Solo el elemento activo** | Ver la enmienda de §8 |
| **Fondos de pantalla y de tarjeta** | **Nunca**, en ningún mundo | `canvas` y `surface` |
| **Texto de cuerpo, títulos, secciones** | **Nunca** | |
| **Estados de éxito / aviso / error** | **Nunca** | Ganan al acento siempre |

### 6.2 Dónde aparece la mascota

Extiende el §3.5 del doc 02 sin contradecirlo, y le añade una frontera física:

| Mascota | Aparece | No aparece jamás |
|---|---|---|
| **Nexi** | Solo en el **mundo Nexum**: bienvenida sin sesión, primer paso del asistente, "todavía no tienes ninguna casa", "ya tienes acceso" tras canjear, callejón sin salida | Dentro de ningún mundo de módulo. Nexi no entra en Coolio |
| **Airi** | Solo dentro del **mundo Coolio**: Equipos vacío, aire recién emparejado, aire sin señal desde hace mucho | **En ninguna pantalla del mundo Nexum.** Ni en Estadísticas, ni en Inicio, ni en Dispositivos. Ni aunque el usuario tenga cuatro Coolios |
| **Broti** | Lo mismo, dentro del mundo Plantico. Y, por excepción explícita, en la ficha de "Plantico llegará pronto" (§7.3) | En el mundo Nexum |

**La frontera:** una mascota no cruza la puerta. Si te la encuentras al otro
lado, hay un error de arquitectura, no de una pantalla. Como el manifiesto no
expone `mascota` a ninguna superficie de Nexum, el error deja de poder ocurrir
por accidente.

Y se mantiene: **una sola mascota por pantalla y como máximo una por recorrido**.
Si Airi salió en Equipos vacío, no vuelve a salir en Programas vacío.

### 6.3 Dónde aparece el logotipo

| Logotipo | Sí | No |
|---|---|---|
| **Nexum completo** | Cabecera de la portada, splash, puerta de salida de los mundos (versión icono, 24 pt) | Dentro de un mundo, más allá de la puerta |
| **Coolio / Plantico completo** | Centrado en la cabecera de su mundo, en todas sus pestañas raíz | En el mundo Nexum |
| **Iconos de módulo** (`brand/iconos/`) | Azulejos de 36 / 44 / 56 pt con fondo `soft`, en Nexum y en su mundo. **Sin teñir, nunca** | Como icono de interfaz suelto, ni en la barra de pestañas, ni como marca de agua de fondo |

---

## 7. Transición entre mundos

### 7.1 Entrar en Coolio

Usa **exactamente** el push de §5.2 del doc 01. No se inventa una transición
nueva: si entrar en un mundo se moviera distinto de entrar en una pantalla, el
usuario tendría que aprender dos gramáticas.

| Qué | Movimiento | Duración | Curva |
|---|---|---|---|
| Pantalla de Coolio que entra | `translateX 100% → 0` | 320 ms | `standard` |
| Pantalla de Nexum que sale | `translateX 0 → −25%` + `opacity 1 → 0.6` | 320 ms | `standard` |
| **Las dos barras de pestañas** | **Viajan con su pantalla.** Ninguna animación propia | — | — |

**El detalle que lo hace legible sin explicarlo:** la barra de pestañas es parte
del mundo, no del marco. Se ve **salir la barra verde de cinco pestañas por la
izquierda y entrar la de Coolio de cuatro por la derecha**, en el mismo gesto.
Eso es lo que dice "has cambiado de sitio", y no hace falta ni un cartel ni un
tutorial. Técnicamente: el `<Tabs>` de cada mundo vive dentro de su ruta, así
que el `<Stack>` raíz lo arrastra gratis.

**Lo que no se hace, y es un rechazo en revisión:**
- Pantalla de carga, splash de Coolio o logotipo que se agranda.
- Zoom, escala o desvanecimiento del logotipo del módulo desde la tarjeta.
- Vibración. Navegar no vibra (§5.7 del doc 01).
- Cambio de color del fondo. El `canvas` es el mismo en los dos mundos: la casa
  no cambia, cambia la habitación.

**Contenido durante la entrada:** el mundo se pinta con **esqueletos** con la
forma de sus tarjetas (§5.3 del doc 01), no con una ruedecita. La barra de
pestañas y la cabecera están completas desde el primer fotograma, porque no
dependen de la red. El esqueleto se sustituye por contenido con un fundido de
140 ms.

### 7.2 Volver a Nexum

El pop de §5.2, tal cual: 280 ms, `accelerate`, la pantalla saliente sin
atenuar. Vuelve la barra verde de cinco pestañas.

Nexum vuelve **exactamente como estaba**: misma pestaña, misma posición de
scroll. Lo único que puede haber cambiado es el resumen de la tarjeta del módulo
que acabas de tocar; si cambió, se actualiza con un fundido de 140 ms, **sin
contar números y sin desplazamiento**, porque es un dato que llega solo.

### 7.3 Moverse dentro de un mundo

Sin novedad: cambio de pestaña = **solo fundido**, 140 ms, sin deslizamiento
horizontal. Entrar en un equipo = push de 320 ms. Todo igual que en Nexum.

### 7.4 Movimiento reducido

Con `isReduceMotionEnabled` activo, entrar y salir de un mundo es un **fundido
de 100 ms** y nada más. Lo resuelve el proveedor de tema devolviendo el objeto
`motion` recortado: **ninguna pantalla comprueba el ajuste por su cuenta**.

---

## 8. Estados vacíos: cuando una sub-app no tiene nada

Principio: **un vacío es una invitación, no un parte de obra.** La palabra
"Fase" no aparece en la app, ni "Pendiente", ni "Por implementar".

### 8.1 Nexum sin ningún dispositivo en toda la casa

Portada: cabecera + saludo + clima con normalidad. El bloque de escenas **no se
dibuja**. En lugar de "Mis dispositivos" y "Automatizaciones":

- **Nexi**, ilustración de 120 pt.
- `titleM`: **"Tu casa está lista"**
- `body` / `textSecondary`: **"Añade tu primer dispositivo y empieza a
  controlarlo desde aquí."**
- Botón primario ancho: **"Añadir un dispositivo"** → hoja de elección de app.

Y **debajo, con normalidad, "Apps integradas" y "Y más por venir"**. No se
ocultan: son la respuesta a "¿y esto qué es?", que es justo lo que se pregunta
alguien que todavía no tiene nada.

### 8.2 Coolio existe pero no tienes ningún aire

Entras en el mundo Coolio con toda su identidad: barra de cuatro pestañas,
logotipo en la cabecera, puerta ‹ Nexum. El mundo **no está roto, está vacío**.

| Pestaña | Qué se ve |
|---|---|
| **Equipos** | **Airi**, 120 pt. `titleM`: **"Todavía no hay ningún equipo aquí"**. `body`: **"Conecta tu primer aire acondicionado y contrólalo desde el móvil."** Botón primario en cyan Coolio: **"Añadir un equipo"** → `anadir.tsx` |
| **Programas** | Sin mascota (Airi ya salió en este recorrido). Icono grande de 40 pt / `strokeWidth` 1.5 en `textFaint`. `titleM`: **"Los programas llegan con tu primer equipo"**. `body`: **"Aquí podrás decidir a qué hora se enciende el aire y a qué temperatura."** Sin botón: no hay nada que hacer todavía |
| **Estadísticas** | Igual. **"Aquí verás cuánto usas el aire"** / **"Necesitas al menos un equipo para empezar a medir."** |
| **Ajustes** | **Nunca está vacío.** Unidades, avisos y "Acerca de Coolio" existen sin equipos. Se muestra normal |

Nótese lo que **no** se hace: repetir el botón "Añadir un equipo" en las cuatro
pestañas. Se ofrece una vez, donde corresponde. Un vacío que insiste es una
lista de deberes.

### 8.3 Plantico, que todavía no existe

**Plantico no tiene mundo.** Crear `app/(mundos)/plantico/` con tres pestañas
vacías sería fabricar un edificio sin puertas: cuatro sitios a los que ir donde
no hay nada, y la sensación clarísima de app a medio hacer.

En su lugar, su manifiesto declara `estado: 'proximamente'` y aparece:

- En **"Apps integradas"**, con su logotipo, su nombre, su tagline y un chip
  pequeño **"Pronto"** en `surfaceSunken`/`textSecondary`. **A todo color y sin
  atenuar**: es un producto real que llega, no una opción deshabilitada.
- **No aparece** en "Mis dispositivos", ni en Estadísticas, ni en
  Automatizaciones, ni en el inventario. Nunca, hasta que exista.

Al tocarlo se abre `app/modulo/[id].tsx`, **pantalla apilada dentro del mundo
Nexum** (flecha ‹ arriba, se vuelve deslizando):

- Azulejo de 88 pt con el logotipo de Plantico sobre su `soft`.
- `titleL`: **"Plantico"** · `body`/`textSecondary`: **"Riego inteligente para
  tus plantas."**
- Tres filas con icono y una línea cada una, del flyer: *Sensores de humedad en
  el sustrato* · *Riego automático según el clima* · *Aviso cuando baje el
  depósito*.
- Botón secundario: **"Avisarme cuando llegue"**. Al pulsar, se convierte en
  texto con check: **"Te avisaremos"**, y vibra `Notification.Success`. Se
  guarda como una preferencia de la cuenta. Si el aviso todavía no se puede
  guardar en servidor, **el botón no se pone**: nada de botones decorativos.
- **Broti**, una vez, abajo. Es una excepción consciente al §3.5 del doc 02
  (que solo daba a Broti pantallas de Plantico): aquí el módulo le está
  explicando al usuario algo que no esperaba, que es la condición que la regla
  pide. Queda anotado en §9.
- Sin fechas. Sin "Q2". Sin barra de progreso. Sin "en desarrollo".

La misma pantalla, sin logotipo y sin mascota, sirve para Iluminación,
Seguridad y Energía desde el bloque "Y más por venir".

### 8.4 Estados vacíos de Nexum con módulos instalados

- **Dispositivos** con aparatos: agrupados por habitación. Sin ninguno: el mismo
  vacío de §8.1, sin repetir a Nexi si ya salió en Inicio hace dos pasos.
- **Automatizaciones** sin ninguna: *"Todavía no hay automatizaciones"* /
  *"Haz que tu casa reaccione sola: una temperatura al llegar, el riego cuando
  toque."* Con dispositivos, botón "Crear una automatización"; sin ellos, la
  frase *"Necesitas al menos un dispositivo"* y ningún botón.
- **Estadísticas** sin datos suficientes: *"Aquí verás cómo va tu casa"* /
  *"En cuanto lleve unos días funcionando, aparecerán el consumo y el clima."*
  **Sin mascota**, siempre (§3.5 del doc 02: nunca en Estadísticas).

---

## 9. Choques con los documentos 01 y 02

Todo lo que este documento cambia de lo ya cerrado, dicho en voz alta. Nada de
esto se aplica en silencio.

### 9.1 · Doc 01 §3.8 — "la barra de pestañas siempre es verde Nexum"

**Dice:** *"La barra de pestañas. Siempre verde Nexum, incluso navegando dentro
de un módulo: es la app la que enmarca, no el módulo."*

**Choca porque:** en el modelo de mundos, dentro de Coolio la barra **es de
Coolio**, y el mockup de Coolio la pinta con el elemento activo en cyan.

**Propuesta de enmienda**, a aplicar en el doc 01 y en `ui/theme.ts`:

> La barra de pestañas **del mundo Nexum** es siempre verde Nexum, sin
> excepción. La barra de pestañas **de un mundo de módulo** lleva el acento del
> módulo **únicamente en el icono y el rótulo de la pestaña activa**. El fondo
> de la barra, el borde y las pestañas inactivas siguen siendo neutros
> (`surface`, `divider`, `textFaint`).

**Por qué no rompe la regla del 10 %:** un icono de 23 pt más su rótulo ocupan
≈ 0,6 % de una pantalla de 393×852 pt. El total del mundo Coolio (azulejos,
dial, botón primario, pestaña activa) se mantiene holgadamente por debajo del
10 %.

**Por qué merece la pena:** la barra es la señal más barata y más fiable de "en
qué app estoy". Renunciar a ella obligaría a compensar con algo más ruidoso —una
cabecera de color, un fondo teñido— que sí rompería la regla del acento. La
intención original de §3.8 ("que Nexum no parezca tres apps distintas") se
mantiene: **Nexum sigue enmarcando**, y la prueba es que su barra vuelve intacta
en cuanto sales.

### 9.2 · Doc 02 §3.4 — las tres formas de abrir una pantalla

**Dice:** Pestaña, Apilada y Hoja.

**Choca porque:** hace falta una cuarta.

**Propuesta:** añadir a la tabla de §3.4 la fila:

| Forma | Cuándo se usa | Cómo se vuelve | Título |
|---|---|---|---|
| **Mundo** | Entrar en una sub-app (Coolio, Plantico) | Puerta **‹ Nexum** arriba a la izquierda, gesto de deslizar, atrás de Android | Logotipo de la sub-app, centrado en su cabecera |

### 9.3 · Doc 02 §4 — "Dispositivo → ajustes del dispositivo", apilado sobre las pestañas

**Dice:** en la estructura definitiva, el detalle de un dispositivo es una
pantalla apilada del mundo Nexum.

**Choca porque:** ahora el detalle de un aire vive **dentro del mundo Coolio**
(`(mundos)/coolio/equipo/[id].tsx`).

**Propuesta:** sustituir esa línea de §4 por: *"Dispositivo → se abre dentro del
mundo de su app"*. Lo demás de §4 —las cinco pestañas de Nexum, la casa activa
en la cabecera, las casas fuera de Ajustes, los tres bloques de Ajustes, el
vacío honesto de Inicio— **se mantiene íntegro**. Este documento no toca las
cinco pestañas de Nexum: las rellena.

### 9.4 · Doc 02 §3.5 — Broti solo en Plantico

**Choca porque:** §8.3 permite a Broti aparecer en la ficha de "Plantico llegará
pronto", que técnicamente es una pantalla del mundo Nexum.

**Propuesta:** precisar la regla como *"la mascota de un módulo aparece en su
mundo y en la pantalla que presenta ese módulo, y en ningún otro sitio"*. Sigue
siendo una sola aparición por recorrido.

### 9.5 · Lo que NO cambia

- La regla del acento (≤ 10 % / 8 %) y sus cuatro sitios permitidos.
- Todos los tokens de color, tipografía, espaciado, radios y sombras.
- Todos los tokens de movimiento y la lista cerrada de §5.6 ("qué NO se anima").
- Las reglas de vibración de §5.7.
- Los cuatro estados obligatorios, los cuatro niveles de confirmación y el
  mecanismo único de retroalimentación del doc 02 §3.
- Modo oscuro completo.

---

## 10. Plan de migración

Ordenado para que **la app compile y funcione después de cada paso**. Los pasos
1 a 6 son **imprescindibles**: sin ellos el modelo no se entiende y el error de
concepto sigue ahí. Del 7 en adelante es pulido.

### Imprescindibles

**Paso 1 · Renombrar `(tabs)` a `(nexum)` y sus pantallas al castellano.**
`app/(tabs)/` → `app/(nexum)/`; `devices.tsx` → `dispositivos.tsx`,
`automations.tsx` → `automatizaciones.tsx`, `stats.tsx` → `estadisticas.tsx`,
`settings.tsx` → `ajustes.tsx`.
Actualizar `app/_layout.tsx` (`<Stack.Screen name="(nexum)" />`), el `Redirect`
de `app/index.tsx` y **todos** los `router.push('/(tabs)/…')` —hoy hay al menos
uno en `app/(tabs)/index.tsx`—.
*Sin cambios visibles. Deja el nombre del mundo escrito en el árbol de archivos,
que es donde más se lee.*

**Paso 2 · Crear el manifiesto.**
`modules/tipos.ts` con `ModuleManifest` y `ResumenModulo`; `modules/registry.ts`
con `coolio` (`disponible`) y `plantico` (`proximamente`);
`modules/coolio/index.ts` y `modules/plantico/index.ts` exportando su manifiesto.
`resumenDeHogar` devuelve `null` de momento: todavía no hay dispositivos.
*Sin cambios visibles. Es el andamio de todo lo demás.*

**Paso 3 · Purgar la identidad de módulo de las superficies de Nexum.**
Es **el paso que arregla el fallo reportado**, y va antes de construir nada
nuevo. Quitar toda mascota y todo color de módulo de Inicio, Dispositivos,
Automatizaciones, Estadísticas y Ajustes. El componente `Proximamente` deja de
aceptar mascotas de módulo. Los vacíos de Automatizaciones y Estadísticas pasan
a los textos de §8.4, y la palabra "Fase" desaparece de la app.
Añadir a la revisión: `grep -rn "coolio\|plantico" apps/mobile/core apps/mobile/app/\(nexum\)` **debe salir vacío**.
*Visible: Airi ya no aparece donde no toca.*

**Paso 4 · Levantar el mundo Coolio.**
`app/(mundos)/_layout.tsx` genérico; `app/(mundos)/coolio/_layout.tsx` con sus 4
pestañas y la **puerta ‹ Nexum**; `index.tsx` (Equipos) con el vacío de §8.2;
`programas.tsx`, `estadisticas.tsx`, `ajustes.tsx`. Mudar `app/emparejar.tsx` a
`(mundos)/coolio/anadir.tsx` y `app/devices/[id].tsx` a
`(mundos)/coolio/equipo/[id].tsx`. Añadir a `app/_layout.tsx` la **única** línea
`<Stack.Screen name="(mundos)" />`.
Crear en `ui/` el componente `MundoTabs`, que resuelve puerta, cabecera y acento
para cualquier módulo, para que el layout de Plantico sea copiar seis líneas.
*Visible: la barra cambia al entrar en Coolio. El modelo ya se puede enseñar.*

**Paso 5 · Reconstruir la portada de Nexum.**
Los seis bloques de §4 en su orden: saludo con selector de casa, clima, escenas,
Mis dispositivos (alimentado por `resumenDeHogar`), Automatizaciones, **Apps
integradas** y **Y más por venir**. Las tarjetas de "Apps integradas" entran al
mundo; las de "Y más por venir" a la ficha genérica.
*Visible: la portada del mockup. Es la pantalla que explica el producto entero.*

**Paso 6 · La ficha de módulo que aún no existe.**
`app/modulo/[id].tsx` genérica, alimentada por el manifiesto (§8.3), y
`app/anadir-dispositivo.tsx` (elegir app antes de emparejar).
*Visible: tocar Plantico hace algo digno en vez de nada o de un error.*

### Pulido

**Paso 7 · Transición y memoria de mundo.** Afinar entrada/salida (§7),
conservar la pestaña del mundo durante la sesión y la posición de scroll de
Inicio, y el recorte por movimiento reducido.

**Paso 8 · La enmienda de la barra de pestañas.** Acento del módulo en la
pestaña activa del mundo (§9.1), con su variante de modo oscuro.

**Paso 9 · Enlace directo al aparato destacado.** La fila con chevron dentro de
la tarjeta de módulo, que entra al mundo directamente en ese aparato con la pila
bien preparada.

**Paso 10 · Chip de clima y escenas de verdad.** Clima real del núcleo, escenas
que ejecutan, "Nuevas ideas" con envío.

**Paso 11 · Plantico.** Cuando el hardware exista: una carpeta de rutas, una
carpeta de módulo, una línea en el manifiesto, y `estado: 'disponible'`.
Si en ese momento hace falta tocar `core/` o `app/(nexum)/`, **el fallo está en
el núcleo**, no en Plantico.

---

## 11. La regla que resume el documento

> **Nexum te dice qué tienes. Cada app te deja usarlo. La barra de pestañas te
> dice en cuál de las dos estás, y nadie tiene que explicártelo.**

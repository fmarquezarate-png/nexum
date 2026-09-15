# Experiencia de uso de Nexum

**Auditoría de lo que hay hoy y especificación de cómo debe ser.**

Documento de diseño de producto. No contiene código. Su función es decidir —de
forma cerrada y discutible— qué debe pasar en cada pantalla, en cada estado y
ante cada acción, para que Nexum deje de parecer una maqueta y empiece a
parecer una app.

Estado revisado: fase 1 terminada (cuentas, casas, habitaciones, miembros,
códigos). Fases 2 y 3 sin implementar.

---

## Antes de nada: el diagnóstico en una frase

**Nexum hoy sabe crear cosas y no sabe deshacerlas, ni corregirlas, ni contarte
qué ha pasado.**

Todo lo que se hace en la app es de ida: creas una casa, creas una habitación,
creas un código. No hay vuelta atrás en casi ningún sitio, y cuando la hay está
escondida detrás de un gesto que nadie adivinaría. Cuando algo sale bien, la app
calla. Cuando algo sale mal, muchas veces también calla —o peor: te enseña la
pantalla de "todavía no tienes nada", que es mentira.

Eso no es un problema de funciones que faltan. Es un problema de **confianza**.
Una app en la que no puedes deshacer nada es una app que da miedo tocar, y una
app que da miedo tocar se usa poco y se abandona pronto.

Lo que el propietario describe como *"no está montada como una app de calidad"*
tiene un nombre concreto: **faltan los finales**. Los principios están bien —el
asistente de alta es bueno, el diseño visual es coherente, los textos de error de
los códigos están cuidados—. Lo que falta es todo lo que viene después de crear
algo.

---

# 1 · Los diez problemas más graves de hoy

Ordenados por cuánto molestan a quien usa la app, no por lo difíciles que sean
de arreglar.

### 1. Una casa creada no se puede borrar, ni renombrar, ni abandonar desde su pantalla

Es el caso que señala el propietario y es el más grave porque es **irreversible
y visible**. Si te equivocas escribiendo "Mi cassa", ese error se queda ahí para
siempre, en la lista, cada vez que abres la app.

Lo llamativo: **la capacidad de borrar y renombrar ya está programada** en
`apps/mobile/core/homes/api.ts` (`borrarCasa`, `renombrarCasa`), y los textos de
aviso ya están escritos en `es.json` (`casas.borrarCasa`, `casas.borrarAviso`).
Simplemente no hay ningún botón en ninguna pantalla que las llame. La casa se
construyó y no se le puso la puerta.

Lo mismo pasa con `cambiarRol`: existe, nadie la usa.

### 2. Tocar el nombre de una habitación la borra

En la pantalla de una casa, las habitaciones son filas de lista. Tocar una fila,
en cualquier app del mundo, significa "ábreme esto". Aquí significa **"bórrame
esto"**: sale directamente el diálogo de borrado.

Es la peor clase de error de diseño: el gesto más inocente —el que haces por
curiosidad, para ver qué hay dentro— dispara la acción más destructiva.
Exactamente el mismo problema existe con los miembros (tocar a una persona
propone expulsarla) y con los códigos (tocar un código propone desactivarlo).

La × gris de la derecha, además, no es pulsable por separado: es decorativa.
Parece un botón y no lo es.

### 3. Si se cae la conexión, la app te dice que no tienes casas

En tres sitios distintos el código hace lo mismo: si falla la consulta al
servidor, se comporta como si la respuesta hubiera sido "no hay nada".

- `app/index.tsx`: si falla, te manda al **asistente de alta de casa**. Un
  usuario con tres casas y mal WiFi acaba en la pantalla de "¿Cómo se llama tu
  casa?" como si fuera nuevo.
- `app/(tabs)/devices.tsx` y `app/casas/index.tsx`: si falla, enseñan *"Todavía
  no tienes ninguna casa"*.

Esto es más grave que un error feo: **la app miente**. Alguien puede llegar a
crear una casa duplicada creyendo que perdió la suya.

### 4. Cuando algo sale bien, no pasa absolutamente nada

Guardas tu nombre en el perfil: la pantalla se queda igual. Añades una
habitación: aparece en la lista, sin más. Revocas un código: desaparece el
diálogo. Expulsas a alguien: la lista se recarga.

No hay en toda la app **ni un solo mensaje de confirmación**. La única excepción
es el botón "Copiar" del código, que cambia a "Copiado".

El efecto es que nunca sabes si tu acción llegó a producirse o si simplemente la
app se comió el toque. La gente reacciona a esto pulsando dos veces. Y pulsar
dos veces en una app sin confirmaciones es cómo aparecen las habitaciones
duplicadas.

### 5. Del asistente de alta no se puede salir ni volver atrás

Tres pasos, sin botón de volver y sin botón de cerrar. Si te equivocas con el
nombre de la casa en el paso 1, ya no puedes corregirlo: la casa **se ha creado
en el servidor** al pulsar Continuar, y el paso 2 no ofrece regreso.

Peor: si cierras la app en el paso 2 y la vuelves a abrir, ya tienes una casa,
así que la app te lleva a las pestañas. La casa mal nombrada se quedó. Y como
no se puede renombrar (problema 1), es definitiva.

En el paso 2, si falla la creación de habitaciones, el código **avanza al paso 3
como si nada**. El usuario cree que tiene salón, cocina y dormitorio, y no tiene
ninguno.

### 6. Tres pantallas de cinco enseñan fichas de "Fase 3 · Pendiente de implementar"

Inicio, Automatizaciones y Estadísticas —tres de las cinco pestañas— no
contienen nada más que tarjetas grises con la palabra "Fase 3" y el texto
"Pendiente de implementar".

Como herramienta interna de seguimiento está bien. Como app, es demoledor: el
60 % de lo que ves al abrir Nexum es una lista de deberes pendientes. Y "Fase 3"
no significa nada para quien la usa; es vocabulario de quien la construye.

Especialmente sangrante en **Inicio**, que es lo primero que se ve.

### 7. Los títulos aparecen dos veces

Cuatro pantallas (Mis casas, detalle de casa, Perfil, Tengo un código) escriben
el título en la barra superior **y otra vez** en grande debajo. Se lee "Perfil /
Perfil", "Mis casas / Mis casas".

Es un detalle pequeño y es justo el tipo de detalle que hace que una app parezca
hecha a medias, porque se ve en cada visita.

### 8. La casa activa se elige en un sitio y no se entera nadie más

El selector de casa ("Mi Casa / Casa Ana") vive **solo** dentro de la pestaña
Dispositivos. La pestaña Inicio no sabe qué casa has elegido. Ajustes tampoco.

Nexum es una app multi-casa: en qué casa estás es la pregunta más importante de
toda la app, y hoy es un ajuste local de una sola pestaña.

### 9. Ajustes es un cajón de sastre

Bajo "Ajustes" conviven: tu perfil personal, la lista de tus casas, el canje de
códigos de invitación, dos huecos de fases futuras, el botón de cerrar sesión y
el número de versión.

Son cuatro cosas distintas mezcladas: quién eres, dónde vives, cómo entras en
casa de otro y cómo se comporta la app. Encontrar "gestionar mi casa" en la
pestaña de Ajustes es contraintuitivo: la casa es el contenido principal del
producto, no una preferencia.

### 10. Cerrar sesión no pide confirmación, y borrar una habitación sí

La regla está al revés. Cerrar sesión es un botón rojo que se ejecuta al primer
toque. Borrar una habitación —menos grave, porque hoy no arrastra nada— sí
pregunta.

Y el texto de esa pregunta (*"¿Quieres borrar esta habitación?"*) está escrito
directamente dentro de la pantalla, saltándose la regla del propio proyecto de
que ningún texto visible se escribe a mano. Es el único sitio donde pasa, y es
el síntoma de que las confirmaciones se añadieron a última hora, una a una, sin
una regla común.

---

# 2 · Tabla de huecos funcionales

Lo que un usuario espera poder hacer y hoy no puede.

**Prioridad alta** = sin esto la app no parece terminada.
**Prioridad media** = se nota su ausencia, pero se sobrevive.
**Prioridad baja** = adorno; que no se haga ahora no lo rompe nada.

## Casas

| Falta | Dónde va | Prioridad |
|---|---|---|
| **Borrar una casa** | Detalle de casa → zona inferior "Zona delicada". Solo el propietario | **Alta** |
| **Renombrar una casa** | Detalle de casa → toque en el nombre, o fila "Nombre" en una sección Datos | **Alta** |
| **Salir de una casa** (quien no es propietario) | Detalle de casa → "Zona delicada". Hoy existe escondido: hay que tocarte a ti mismo en la lista de miembros | **Alta** |
| **Transferir la propiedad** antes de irse | Detalle de casa, cuando el propietario intenta salir | Media |
| Cambiar la zona horaria | Detalle de casa → sección Datos | Media |
| Reordenar las casas de la lista | Mis casas | Baja |

## Habitaciones

| Falta | Dónde va | Prioridad |
|---|---|---|
| **Renombrar una habitación** | Detalle de casa → toque en la habitación abre una hoja con Renombrar / Borrar | **Alta** |
| **Separar "abrir" de "borrar"** | La fila abre; el borrado vive dentro | **Alta** |
| Ver qué dispositivos hay en esa habitación antes de borrarla | Hoja de la habitación | Media (alta cuando exista la fase 2) |
| Reordenar habitaciones | Detalle de casa | Baja |

## Miembros y permisos

| Falta | Dónde va | Prioridad |
|---|---|---|
| **Cambiar el rol de un miembro** | Detalle de casa → toque en la persona → hoja con su rol | **Alta** |
| **Separar "ver a la persona" de "expulsarla"** | La fila abre la ficha; expulsar vive dentro | **Alta** |
| Ampliar o quitar la caducidad de un acceso | Ficha de la persona | Media |
| Ver cuándo entró y con qué código | Ficha de la persona | Baja |

## Códigos de invitado

| Falta | Dónde va | Prioridad |
|---|---|---|
| **Compartir con el menú del sistema** (WhatsApp, etc.) | Tarjeta del código creado, junto a Copiar | **Alta** |
| **Recuperar el QR de un código ya creado** | Toque en un código de la lista | **Alta** |
| Limitar el número de usos | Formulario de creación (el backend ya lo admite; la app siempre manda "sin límite") | Media |
| Cerrar la lista de duraciones ofrecidas | Decisión de producto pendiente en el código | Media |
| Ponerle nombre a un código ("Para la señora de la limpieza") | Formulario de creación | Baja |

## Asistente de alta

| Falta | Dónde va | Prioridad |
|---|---|---|
| **Volver al paso anterior** | Flecha arriba a la izquierda, en pasos 2 y 3 | **Alta** |
| **Salir del asistente** | "Lo hago luego", arriba a la derecha | **Alta** |
| **Avisar si la creación de habitaciones falla** | Paso 2 (hoy avanza en silencio) | **Alta** |
| Crear la casa al final y no en el paso 1 | Cambio de comportamiento del asistente | Media |
| Quitar una habitación ya escrita a mano | Paso 2, × en su ficha | Media |

## Cuenta

| Falta | Dónde va | Prioridad |
|---|---|---|
| **Confirmar antes de cerrar sesión** | Ajustes | **Alta** |
| **Cambiar la contraseña** | Perfil | Media |
| **Borrar la cuenta** | Perfil → Zona delicada. Obligatorio para publicar en la App Store | Media |
| Cambiar el correo | Perfil | Baja |
| Foto de perfil | Perfil | Baja |

## Transversal

| Falta | Dónde va | Prioridad |
|---|---|---|
| **Mensaje de confirmación al terminar una acción** | Toda la app | **Alta** |
| **Pantalla de error con "Reintentar"** | Toda la app | **Alta** |
| **Deshacer lo que se acaba de borrar** | Toda la app, donde sea posible | **Alta** |
| **Tirar hacia abajo para recargar** | Todas las listas | Media |
| Aviso visible de "sin conexión" | Barra bajo la cabecera | Media |
| Buscador | Cuando haya suficientes dispositivos | Baja |
| Modo oscuro | Toda la app | Baja |

---

# 3 · Reglas transversales

Estas reglas mandan sobre cualquier pantalla. Si una pantalla las contradice,
la pantalla está mal.

## 3.1 · Los cuatro estados, obligatorios

**Ninguna pantalla que pida datos al servidor se da por terminada hasta que sus
cuatro estados están definidos y construidos.** No es opcional, no es pulido
posterior: es parte de hacer la pantalla.

| Estado | Qué es | Regla |
|---|---|---|
| **Cargando** | Estamos preguntando | Nunca una ruedecita sola en una pantalla en blanco. Se enseña la forma de lo que va a llegar (rectángulos grises del tamaño de las tarjetas). Si tarda menos de medio segundo, no se enseña nada: un parpadeo molesta más que la espera |
| **Vacío** | No hay nada, y es normal | Tres piezas: qué pasa, por qué no es un fallo, y un botón para arreglarlo |
| **Error** | No hay nada porque algo falló | Tres piezas: qué ha pasado en cristiano, botón **Reintentar**, y —si la pantalla tenía datos antes— seguir enseñándolos con un aviso encima |
| **Con datos** | Lo normal | — |

**Vacío y error no se parecen nunca.** Hoy la app los confunde, y esa confusión
es el problema número 3 de la lista. Un error se dibuja con icono de aviso, sin
mascota y con botón de reintentar. Un vacío se dibuja con mascota, en tono
tranquilo y con botón de crear.

**Regla de oro del error:** si la app ya tenía datos en pantalla y la recarga
falla, **los datos viejos se quedan**. Se añade arriba una franja: *"No hemos
podido actualizar. Esto es lo último que sabemos."* Vaciar la pantalla porque
falló una recarga es la peor reacción posible.

## 3.2 · Confirmaciones: una sola regla para toda la app

Cada acción cae en una de estas cuatro categorías. No hay una quinta.

### Nivel 0 — No se pregunta, se puede deshacer

Acciones reversibles sin coste: activar algo, cambiar un rol, renombrar,
reordenar, marcar una habitación en el asistente.

Se ejecutan al instante. Se confirman con un aviso al pie (ver 3.3).

### Nivel 1 — No se pregunta, pero se ofrece deshacer

Borrados de cosas que no arrastran nada detrás: una habitación vacía, un código
de invitado.

Se ejecuta al instante, la fila desaparece, y abajo sale durante **ocho
segundos** un aviso con botón **Deshacer**. Ocho y no cinco: en el móvil se
tarda en reaccionar.

Por qué así y no preguntando: preguntar por cada borrado pequeño convierte la
app en un interrogatorio, y la gente acaba pulsando "Sí" sin leer —que es
exactamente lo que no queremos que hagan cuando llegue una pregunta de verdad.

### Nivel 2 — Se pregunta, con un diálogo

Acciones que afectan a otras personas o cuestan trabajo rehacer: expulsar a un
miembro, salir de una casa, cerrar sesión, borrar una habitación **que tiene
dispositivos dentro**.

Diálogo del sistema, con:
- **Título:** el nombre de aquello que se va a tocar. Nunca "¿Estás seguro?"
- **Cuerpo:** la consecuencia concreta, en una frase, en presente de indicativo
- **Botón destructivo:** el verbo de la acción. Nunca "Aceptar", nunca "Sí"
- **Botón de escape:** "Cancelar", siempre, y siempre el que se toca por defecto

### Nivel 3 — Se pregunta y hay que escribir el nombre

Solo dos acciones en toda la app: **borrar una casa** y **borrar la cuenta**.

Pantalla completa, no diálogo. Lista de lo que se va a perder, con números
reales ("4 habitaciones · 2 dispositivos · 3 meses de historial"). Campo de
texto donde hay que escribir el nombre exacto de la casa. El botón rojo no se
activa hasta que coincide.

Puede parecer excesivo. No lo es: es la única acción de Nexum que destruye datos
de varias personas a la vez y que no tiene vuelta atrás.

### Textos exactos de las confirmaciones

| Acción | Título | Cuerpo | Botón rojo |
|---|---|---|---|
| Borrar casa (nivel 3) | Borrar «{casa}» | Se borrarán sus {n} habitaciones, sus {n} dispositivos y todo su historial. Las {n} personas con acceso lo perderán. Esto no se puede deshacer.<br><br>Escribe **{casa}** para confirmarlo. | Borrar la casa para siempre |
| Salir de una casa | Salir de «{casa}» | Dejarás de ver sus dispositivos. Para volver a entrar necesitarás que te inviten otra vez. | Salir |
| Salir siendo el único propietario | «{casa}» se quedaría sin propietario | Antes de salir, nombra propietario a otra persona. Si no queda nadie, la casa se borra. | — (se ofrece elegir o borrar) |
| Expulsar a alguien | Quitar a {nombre} de «{casa}» | Perderá el acceso a esta casa y a sus dispositivos ahora mismo. Puedes volver a invitarle cuando quieras. | Quitar |
| Borrar habitación con dispositivos | Borrar «{habitación}» | Sus {n} dispositivos se quedarán sin habitación asignada. No se borra ninguno. | Borrar |
| Borrar habitación vacía | *(no se pregunta — nivel 1)* | | |
| Desactivar un código | *(no se pregunta — nivel 1)* | | |
| Cerrar sesión | Cerrar sesión | Tendrás que volver a escribir tu correo y tu contraseña para entrar. Tus casas y tus dispositivos no se tocan. | Cerrar sesión |
| Borrar la cuenta (nivel 3) | Borrar tu cuenta | Se borrarán tus datos y saldrás de todas tus casas. Las casas de las que seas propietario se borrarán con todo lo que contienen. Esto no se puede deshacer.<br><br>Escribe tu correo para confirmarlo. | Borrar mi cuenta |
| Salir del asistente a medias | Dejarlo para luego | Tu casa «{casa}» ya está creada. Puedes terminar de configurarla cuando quieras desde Mi casa. | Dejarlo para luego |

**Nota sobre borrar una casa.** Hoy no hay ninguna comprobación de que quede
gente dentro. La regla es: **si hay otras personas en la casa, el diálogo lo
dice con nombres y apellidos**, no con un número abstracto. "Ana y Carlos
perderán el acceso" pesa lo que tiene que pesar; "3 miembros perderán el acceso"
no pesa nada.

**Qué se puede deshacer y qué no.** Deshacer de verdad (con botón Deshacer):
borrar una habitación vacía, desactivar un código, quitar una habitación del
asistente. Deshacer imposible, y por eso nivel 2 o 3: borrar una casa, borrar la
cuenta, expulsar a alguien (se puede reinvitar, pero no es lo mismo), salir de
una casa.

## 3.3 · Retroalimentación: un solo mecanismo

**Propuesta: el aviso al pie.** Una única pieza para toda la app.

Una franja que sube desde abajo, por encima de las pestañas, con el ancho del
contenido, esquinas redondeadas, fondo oscuro, texto blanco. Aparece, vive
**tres segundos** (ocho si lleva botón Deshacer) y se va sola. Se puede
descartar deslizándola. **Nunca bloquea nada** ni tapa un botón esencial.

Tres tonos, y solo tres:

| Tono | Color | Para qué |
|---|---|---|
| Correcto | Verde de la marca | Algo salió bien |
| Aviso | Ámbar | Algo salió a medias o hay que saber algo |
| Error | Rojo | Algo falló y se puede reintentar |

**Cuándo SÍ se usa:**
- Cuando una acción del usuario termina bien y **la pantalla no lo demuestra
  sola**: guardar el perfil, renombrar algo, cambiar un rol, crear un código
- Cuando una acción falla pero la pantalla sigue siendo usable
- Cuando algo se ha borrado y se puede deshacer
- Cuando llega una novedad que no interrumpe ("Ana ha entrado en tu casa")

**Cuándo NO se usa:**
- Cuando el resultado ya se ve. Añades una habitación y aparece en la lista: eso
  ya es la confirmación. Un aviso encima sobraría y molestaría
- Para errores que impiden seguir: eso es el estado de error de la pantalla
- Para errores de un campo de formulario: eso va bajo el campo, en rojo, donde
  ya está
- Nunca dos avisos seguidos. El nuevo sustituye al anterior, no se apilan
- Nunca para dar la bienvenida, felicitar ni hacer gracia

**Lo que desaparece.** Los `Alert` del sistema dejan de usarse para informar de
nada. Solo quedan para preguntar (nivel 2). Un diálogo modal que solo dice "ha
ido bien" y obliga a pulsar "OK" es el peor patrón de todos: interrumpe para no
decir nada.

## 3.4 · Navegación: cómo se vuelve atrás

Tres formas de abrir una pantalla y una regla para cada una. Hoy están
mezcladas.

| Forma | Cuándo se usa | Cómo se vuelve | Título |
|---|---|---|---|
| **Pestaña** | Los cinco sitios principales | No se vuelve, se cambia de pestaña | Título grande en el contenido. **Sin barra superior** |
| **Apilada** | Bajar un nivel: una casa, una habitación, un dispositivo | Flecha ‹ arriba a la izquierda, y gesto de deslizar | **Solo** en la barra superior. Nunca repetido |
| **Hoja** (sube desde abajo) | Formularios cortos y acciones sobre un elemento: crear código, renombrar, ficha de un miembro | **Cancelar** arriba a la izquierda, acción principal arriba a la derecha | En la propia hoja |

**Regla que elimina el problema 7:** un título se escribe **una vez**. Si la
pantalla tiene barra superior, el título va ahí y no se repite en el contenido.

**El botón principal siempre en el mismo sitio:**
- En una hoja: arriba a la derecha
- En una pantalla apilada con un solo botón de acción: abajo, anclado, ancho
  completo
- En una pantalla de lista: botón flotante redondo abajo a la derecha
- Lo que hoy pasa —un botón "Casa nueva" al final del scroll, que hay que ir a
  buscar— se termina

**Cómo se edita, en toda la app, igual:** tocar una fila **abre** su detalle o
su hoja. Nunca borra, nunca ejecuta nada irreversible. Dentro del detalle está
lo que se puede hacer con esa cosa, con el borrado abajo del todo, separado por
una línea, bajo el título **"Zona delicada"**.

Esto mata de un golpe los problemas 2 y 10.

**Mayúsculas de los títulos:** castellano, no inglés. Solo la primera letra.
"Mis casas", no "Mis Casas". "Códigos de invitado", no "Códigos de Invitado".
Los rótulos de sección pequeños en versalitas (HABITACIONES, MIEMBROS) se
mantienen: son etiquetas, no títulos.

## 3.5 · Las mascotas: cuándo sí y cuándo no

Nexi, Airi y Broti son un activo real de la marca, y hoy se están gastando.
Nexi aparece en: iniciar sesión, crear cuenta, los tres pasos del asistente,
**todas** las listas vacías (es el valor por defecto de la pieza de estado
vacío) y la pantalla de código canjeado. Siete apariciones en un recorrido
corto.

Una mascota que sale siempre deja de significar nada. Deja de ser un personaje y
se convierte en un adorno de fondo, como una marca de agua.

### La regla

**Una mascota aparece cuando la app le pide algo al usuario o le explica algo
que no esperaba. Nunca cuando el usuario está trabajando.**

Y además: **una sola mascota por pantalla, y como máximo una por recorrido.**
Si en el asistente ya salió Nexi en el paso 1, en los pasos 2 y 3 no vuelve a
salir. Su mensaje se queda, el dibujo no.

### Dónde aparece cada una

| Mascota | Dónde | Por qué |
|---|---|---|
| **Nexi** | Bienvenida (sin sesión), **primer** paso del asistente, "todavía no tienes ninguna casa", "ya tienes acceso" tras canjear un código, error sin salida del que no se puede hacer nada | Nexi es la cara de Nexum: acompaña al principio y en los callejones sin salida |
| **Airi** | Dispositivos de clima sin configurar; pantalla de un Coolio recién emparejado; cuando un aire lleva mucho sin dar señal | Airi pertenece a Coolio. Fuera de clima, no aparece |
| **Broti** | Lo mismo, en Plantico, cuando llegue | — |

### Dónde NO aparece ninguna, nunca

- Pantallas con datos: Inicio con dispositivos, listas con contenido
- **Errores que el usuario puede arreglar.** Un fallo de conexión con un
  "Reintentar" es un momento de fricción: una mascota sonriendo ahí resulta
  condescendiente
- **Confirmaciones de borrado.** Jamás
- Formularios, Ajustes, Perfil, Estadísticas
- Detalle de casa, de habitación o de miembro
- Cualquier pantalla donde ya salió una mascota hace dos pasos

Efecto práctico: la pieza de estado vacío deja de traer mascota por defecto. Se
pide expresamente cuando toca.

### Tono de lo que dicen

Nexi habla **poco, en presente y de tú**. Una frase, dos como mucho. No usa
signos de exclamación dobles, ni emojis, ni diminutivos, ni dice "¡Vaya!" ni
"¡Ups!". No se disculpa. No hace chistes.

Mal: *"¡Ups! Parece que algo no ha ido bien 😅 ¡Inténtalo otra vez!"*
Bien: *"No he podido conectar con el servidor."*

---

# 4 · Navegación y arquitectura de información

## Las cinco pestañas: veredicto

**Sí, las cinco pestañas son correctas.** Coinciden con el mockup, coinciden con
lo que la gente espera de una app de hogar y coinciden con la estructura real
del producto. No se tocan.

Pero **dos de ellas están mal llenadas** y una **decisión de reparto está mal
tomada**.

### Lo que hay que cambiar

**1 · La casa activa sube al nivel de la app.**

Hoy el selector vive dentro de Dispositivos. Debe vivir en la **cabecera de
Inicio**: el nombre de la casa activa, con una flecha, que abre una hoja para
cambiar de casa, con un "Gestionar mis casas" al final. La casa elegida manda en
Inicio, Dispositivos, Automatizaciones y Estadísticas a la vez.

Justificación: en una app multi-casa, "¿de qué casa estamos hablando?" es la
pregunta que condiciona todo lo demás. Una pregunta así no puede vivir dentro de
una pestaña.

**2 · Las casas salen de Ajustes.**

Gestionar una casa —sus habitaciones, sus miembros, sus códigos— **es contenido
del producto**, no una preferencia. Se llega a ello desde el selector de casa de
Inicio ("Gestionar mis casas"), y queda además un acceso secundario en Ajustes
para quien lo busque ahí.

**3 · Ajustes se ordena en tres bloques, y solo tres.**

| Bloque | Qué contiene |
|---|---|
| **Tu cuenta** | Nombre, correo, contraseña. Y abajo del todo, en Zona delicada: cerrar sesión y borrar la cuenta |
| **Tus casas** | Lista de casas con tu rol en cada una · Crear una casa · **Tengo un código de invitación** |
| **La app** | Notificaciones (fase 3) · Idioma · Acerca de Nexum · Versión |

"Tengo un código" va en el bloque de casas porque canjear un código **es entrar
en una casa**. Hoy está suelto y no se entiende qué hace ahí.

**4 · Inicio deja de ser una lista de deberes.**

Mientras no haya dispositivos, Inicio enseña el **estado vacío de la app
completa**: Nexi, "Tu casa está lista", y un botón grande de "Añadir mi primer
dispositivo". Un vacío honesto y acogedor, no un listado de fases.

**5 · Automatizaciones y Estadísticas se quedan, vacías pero dignas.**

Cada una con su estado vacío de verdad: qué se podrá hacer aquí, en una frase de
producto —no de plan de trabajo— y por qué todavía no ("necesitas al menos un
dispositivo"). La palabra "Fase" desaparece de la app. Vive en el README, que es
su sitio.

### Estructura definitiva

```
Inicio            ← cabecera con la casa activa. Escenas, dispositivos, avisos
Dispositivos      ← los aparatos de la casa activa, agrupados por habitación
Automatizaciones  ← reglas de la casa activa
Estadísticas      ← consumo y clima de la casa activa
Ajustes           ← Tu cuenta · Tus casas · La app

Fuera de las pestañas, apiladas encima:
  Mis casas → Detalle de casa → Habitación
                              → Miembro
                              → Código (QR)
  Dispositivo → ajustes del dispositivo
  Asistente de alta (a pantalla completa, con salida)
  Canjear código (hoja)
```

---

# 5 · Especificación pantalla por pantalla

Para cada una: qué se ve en los cuatro estados, qué acciones tiene y dónde están.

---

## 5.1 · Arranque

Decide a dónde va cada uno. Hoy es la pantalla con el fallo más peligroso.

| Estado | Qué se ve |
|---|---|
| **Cargando** | El logo de Nexum centrado sobre el fondo crema, quieto. Sin ruedecita durante el primer segundo; a partir de ahí, ruedecita debajo |
| **Vacío** | No existe: o hay sesión o no la hay |
| **Error** | Logo, *"No hemos podido conectar."*, botón **Reintentar** y, debajo, **Cerrar sesión** como salida de emergencia. **Nunca redirige** |
| **Con datos** | Redirige: sin sesión → Bienvenida · con sesión y sin casas → Asistente · con sesión y con casas → Inicio |

**Cambio obligatorio:** hoy, si falla la consulta, asume "no tiene casas" y manda
al asistente. Eso se acaba. Un fallo es un fallo, no un "no hay nada". Si falla,
error con reintentar.

**Salvaguarda:** si en ese arranque ya había una casa activa recordada del uso
anterior, se entra directamente a Inicio con los datos guardados y se recarga de
fondo. Abrir la app sin cobertura debe llevarte a tu casa, no a un muro.

---

## 5.2 · Bienvenida / Iniciar sesión

| Estado | Qué se ve |
|---|---|
| **Cargando** | Solo al enviar: el botón "Entrar" se convierte en ruedecita y se bloquea. Los campos se bloquean también |
| **Vacío** | No aplica |
| **Error** | Bajo el campo correspondiente, en rojo. Si es de red, aviso al pie en tono error con **Reintentar** |
| **Con datos** | Nexi con su bocadillo · "Bienvenido a Nexum" → **cambia** (ver microcopia) · correo · contraseña · Entrar · He olvidado mi contraseña · pie: ¿Todavía no tienes cuenta? Crear cuenta |

**Añadir:** botón de ojo para ver la contraseña. Su ausencia es la primera causa
de fallos de login en móvil y hoy no está.

---

## 5.3 · Crear cuenta

Igual que la anterior. Tres campos: nombre, correo, contraseña.

| Estado | Qué se ve |
|---|---|
| **Cargando** | Botón en ruedecita, campos bloqueados |
| **Error** | Bajo el campo que falla. Si el correo ya existe, el mensaje ofrece **Iniciar sesión** como enlace directo: es lo que esa persona quería hacer |
| **Con datos** | Sin mascota (ya salió en Bienvenida) · nombre · correo · contraseña con medidor de fuerza · Crear cuenta |

**Cambio:** hoy los errores de los tres campos se pintan todos bajo la
contraseña. Cada error va bajo su campo.

---

## 5.4 · Recuperar contraseña

| Estado | Qué se ve |
|---|---|
| **Cargando** | Botón en ruedecita |
| **Error** | Bajo el campo |
| **Enviado** | Tarjeta con marca de verificación: *"Si existe una cuenta con ese correo, ya está enviado. Revisa tu bandeja."* Debajo: **Abrir el correo** y **Volver a enviar** (desactivado 60 segundos, con cuenta atrás) |
| **Con datos** | Título, explicación, campo de correo, Enviar el enlace, Volver |

---

## 5.5 · Asistente de alta

La pantalla que peor se comporta hoy y la primera que ve un usuario nuevo.

**Cambio de fondo: la casa se crea al final, no en el paso 1.** Los tres pasos
recogen datos; al pulsar "Terminar" se crea todo de una vez. Así, volver atrás
es volver atrás de verdad, y salir a medias no deja restos.

**Salida siempre visible:** "Lo hago luego", arriba a la derecha, en los tres
pasos. En los pasos 2 y 3, flecha ‹ arriba a la izquierda.

### Paso 1 — Tu casa

| Estado | Qué se ve |
|---|---|
| **Cargando** | No aplica (nada que pedir al servidor) |
| **Vacío** | Es el estado normal: campo en blanco con sugerencia "Mi casa" |
| **Error** | Solo validación: *"Ponle un nombre a tu casa."* bajo el campo |
| **Con datos** | Barra de progreso 1 de 3 · Nexi con bocadillo · "¿Cómo se llama tu casa?" · campo · Continuar |

### Paso 2 — Habitaciones

| Estado | Qué se ve |
|---|---|
| **Vacío** | Seis fichas sugeridas sin marcar. Continuar activo: saltarse esto es legítimo |
| **Error** | No aplica todavía (no se guarda hasta el final) |
| **Con datos** | Barra 2 de 3 · **sin mascota** · "¿Qué habitaciones tiene?" · fichas · campo "Otra habitación" · las escritas a mano aparecen con × para quitarlas · Continuar · Saltar este paso |

### Paso 3 — Primer dispositivo

| Estado | Qué se ve |
|---|---|
| **Cargando** | Al pulsar cualquiera de los dos botones: "Preparando tu casa…" con la barra completa. Aquí es donde se crea todo |
| **Error** | Se queda en el paso 3 con el motivo en cristiano y **Reintentar**. Los datos escritos no se pierden. Si fallan solo las habitaciones, la casa se crea igual y se avisa: *"Tu casa está lista, pero no hemos podido guardar las habitaciones. Puedes añadirlas desde Mi casa."* Hoy esto se traga en silencio |
| **Con datos** | Barra 3 de 3 · **sin mascota** · "¿Añadimos tu primer dispositivo?" · Añadir ahora · Más tarde |

---

## 5.6 · Inicio

| Estado | Qué se ve |
|---|---|
| **Cargando** | Cabecera real (saludo y casa activa, que ya se saben) + rectángulos grises donde irán escenas y dispositivos |
| **Vacío** | Nexi · *"Tu casa está lista"* · *"Cuando conectes tu primer aparato, aparecerá aquí con su estado."* · **Añadir mi primer dispositivo** |
| **Error** | Cabecera + tarjeta: *"No hemos podido cargar tu casa."* + **Reintentar**. Si había datos de antes, se enseñan con franja *"Sin actualizar desde las 18:32"* |
| **Con datos** | Saludo + selector de casa · clima exterior · escenas · dispositivos por habitación · automatizaciones activas |

Tirar hacia abajo recarga. **Ninguna ficha de "Fase 3".**

---

## 5.7 · Dispositivos

| Estado | Qué se ve |
|---|---|
| **Cargando** | Pastillas del selector como rectángulos grises + dos tarjetas grises |
| **Vacío (sin casas)** | No debería darse: sin casas no se llega aquí. Si pasa: Nexi · "Todavía no tienes ninguna casa" · **Crear una casa** |
| **Vacío (con casa, sin aparatos)** | Nexi · "Todavía no hay dispositivos" · "Cuando conectes tu primer aparato, aparecerá aquí con su estado en vivo." · **Añadir dispositivo** |
| **Error** | *"No hemos podido cargar tus dispositivos."* + **Reintentar**. **Nunca** el estado vacío |
| **Con datos** | Dispositivos agrupados por habitación, con su estado y la hora del último cambio. Los que están sin conexión, en gris y agrupados al final |

**Cambio:** el selector de casa se va a la cabecera de Inicio. Aquí se enseña el
nombre de la casa activa, como rótulo, no como control.

**Cambio:** el botón "Añadir dispositivo" hoy lleva al **asistente de alta de
casa**, que es otra cosa completamente distinta. Debe llevar al emparejamiento
de dispositivo (fase 2). Mientras no exista, que diga honestamente que todavía
no se puede.

---

## 5.8 · Automatizaciones y Estadísticas

| Estado | Qué se ve |
|---|---|
| **Cargando** | Rectángulos grises |
| **Vacío** | Sin mascota. Icono, una frase de qué se hará aquí y por qué aún no: *"Las automatizaciones necesitan al menos un dispositivo conectado."* + **Añadir dispositivo** |
| **Error** | Mensaje + **Reintentar** |
| **Con datos** | Fase 3 |

La palabra "Fase" no aparece en pantalla.

---

## 5.9 · Ajustes

| Estado | Qué se ve |
|---|---|
| **Cargando** | La sección "Tu cuenta" se dibuja ya (el nombre y el correo están en memoria). Las casas, en gris |
| **Vacío** | No aplica: siempre hay cuenta |
| **Error** | Solo el bloque de casas falla: *"No hemos podido cargar tus casas."* + **Reintentar** dentro de ese bloque. El resto de Ajustes funciona |
| **Con datos** | Tres bloques (5.4) |

**Cerrar sesión** deja de ser un botón rojo suelto: pasa a la Zona delicada, al
final de "Tu cuenta", y pide confirmación.

---

## 5.10 · Perfil

| Estado | Qué se ve |
|---|---|
| **Cargando** | No aplica: los datos ya están |
| **Vacío** | No aplica |
| **Error** | Aviso al pie en tono error: *"No hemos podido guardar el cambio."* con **Reintentar**. Lo escrito no se pierde |
| **Con datos** | Nombre visible (editable) · Correo (bloqueado, con explicación) · Cambiar contraseña · Zona delicada: Borrar mi cuenta |

**El cambio más importante:** hoy guardar no confirma nada. A partir de ahora,
aviso al pie en verde: *"Nombre guardado."* Y el botón Guardar solo se activa si
hay algo cambiado.

---

## 5.11 · Mis casas

| Estado | Qué se ve |
|---|---|
| **Cargando** | Tres filas grises |
| **Vacío** | Nexi · "Todavía no tienes ninguna casa" · "Una casa agrupa tus habitaciones y tus aparatos. Es lo primero que hay que crear." · **Crear una casa** |
| **Error** | *"No hemos podido cargar tus casas."* + **Reintentar**. **Nunca** el estado vacío |
| **Con datos** | Lista: nombre, número de habitaciones y dispositivos, etiqueta de rol. Botón flotante **+** abajo a la derecha |

**Cambios:**
- Crear una casa abre una **hoja**, no un formulario que aparece dentro de la
  lista. Hoy conviven dos formas de crear una casa —el asistente y este
  formulario en línea— que se comportan distinto
- Deslizar una fila hacia la izquierda ofrece **Renombrar** (y, si eres
  propietario, **Borrar**). Tocar la fila **abre** la casa
- Si falla la creación, hoy **no se enseña nada**. A partir de ahora, error bajo
  el campo

---

## 5.12 · Detalle de una casa

La pantalla más importante de la fase 1 y la que más cosas le faltan.

**Estructura nueva, de arriba abajo:**

```
[barra superior: nombre de la casa · ‹ volver]

DATOS
  Nombre           Mi casa            ›     ← renombrar (solo admin)
  Zona horaria     Europe/Madrid      ›
  Creada           12 de marzo

HABITACIONES                          + Añadir
  Salón            2 dispositivos     ›     ← abre la habitación
  Cocina           sin dispositivos   ›
  (vacío: "Esta casa todavía no tiene habitaciones." + Añadir la primera)

MIEMBROS                              + Invitar
  Fran · Tú        Propietario        ›     ← abre su ficha
  Ana              Miembro · caduca el 3 de octubre  ›
  (nunca vacío: siempre estás tú)

CÓDIGOS DE INVITADO                   + Crear      (solo admin)
  NEXUM-4F7K2A     Invitado · caduca mañana   [Activo]  ›
  (vacío: "Todavía no has creado ningún código." + Crear uno)
  (si no eres admin, esta sección no existe — no se enseña un cartel
   diciendo que no puedes)

──────────────────────────────────
ZONA DELICADA
  Salir de esta casa                        ← si no eres el propietario
  Borrar esta casa                          ← solo el propietario
```

| Estado | Qué se ve |
|---|---|
| **Cargando** | Nombre de la casa ya en la barra (viene de la lista) + secciones en gris |
| **Vacío** | Por sección, como se indica arriba |
| **Error** | *"No hemos podido cargar esta casa."* + **Reintentar**. Si solo falla una sección, el error se queda dentro de esa sección |
| **Con datos** | Lo de arriba |

**Todo lo que cambia:**
- Aparecen **Renombrar**, **Borrar esta casa** y **Salir de esta casa**: los tres
  huecos que el propietario señala. Los dos primeros ya están programados por
  dentro y sin botón
- Tocar una habitación **la abre**; el borrado vive dentro. Hoy tocarla la borra
- Tocar a un miembro **abre su ficha**; expulsar vive dentro. Hoy tocarlo lo
  expulsa
- Tocar un código **enseña su QR otra vez**; desactivar vive dentro. Hoy tocarlo
  lo desactiva
- El cartel *"Solo los propietarios y administradores pueden gestionar
  miembros."* desaparece. Está además en el sitio equivocado: sale donde deberían
  ir los códigos, no los miembros. **Regla general: lo que no puedes hacer no se
  enseña bloqueado, no se enseña**
- Crear un código pasa a ser una **hoja**, no un formulario que crece dentro de
  la página empujando todo hacia abajo

---

## 5.13 · Habitación (nueva)

Hoja que sube desde abajo.

| Estado | Qué se ve |
|---|---|
| **Cargando** | Nombre arriba (ya se sabe) + lista de dispositivos en gris |
| **Vacío** | "Esta habitación todavía no tiene dispositivos." + **Añadir uno** |
| **Error** | Mensaje + **Reintentar** |
| **Con datos** | Nombre editable · lista de dispositivos · Zona delicada: **Borrar la habitación** |

Borrar una habitación vacía: nivel 1, con Deshacer. Con dispositivos dentro:
nivel 2, con diálogo.

---

## 5.14 · Ficha de un miembro (nueva)

Hoja.

| Estado | Qué se ve |
|---|---|
| **Cargando** | Nombre y rol ya se saben; el resto en gris |
| **Vacío** | No aplica |
| **Error** | Aviso al pie |
| **Con datos** | Nombre · rol (selector: Administrador / Miembro / Invitado, con una línea explicando qué puede hacer cada uno) · desde cuándo · cuándo caduca · Zona delicada: **Quitar de la casa**, o **Salir de esta casa** si eres tú |

Aquí vive `cambiarRol`, que está programada y no tiene botón.

El propietario no puede cambiarse el rol a sí mismo ni quitarse: para eso está
"Transferir la propiedad".

---

## 5.15 · Código creado (QR)

| Estado | Qué se ve |
|---|---|
| **Cargando** | "Creando el código…" |
| **Vacío** | No aplica |
| **Error** | El motivo concreto (ya están bien escritos) + **Reintentar** |
| **Con datos** | QR grande · el código en texto grande y copiable · cuándo caduca · qué podrá hacer quien lo use · **Compartir** (menú del sistema) · **Copiar** · Cerrar |

**Cambio:** hoy solo se puede copiar. Compartir por WhatsApp es como se manda
esto en la vida real, y no está.

**Cambio:** este QR se puede volver a ver tocando el código en la lista. Hoy, si
cierras la tarjeta, el QR se pierde para siempre.

---

## 5.16 · Canjear un código

| Estado | Qué se ve |
|---|---|
| **Cargando** | Botón en ruedecita |
| **Vacío** | Estado normal: campo vacío |
| **Error** | Bajo el campo, con el motivo exacto. Ya funciona bien y es lo mejor de la app hoy |
| **Éxito** | Nexi · "Ya tienes acceso a «{casa}»" · qué puedes hacer · cuándo caduca · **Ir a la casa** |

**Cambio:** el mensaje de éxito no dice en qué casa has entrado. Es el dato más
importante de esa pantalla.

**Añadir:** escanear el QR con la cámara. Hoy hay que teclear un código que la
app genera como QR. Es el círculo sin cerrar más evidente de la fase 1.

---

# 6 · Microcopia

Revisión de `apps/mobile/lib/i18n/es.json`.

Lo que está bien: los mensajes de rechazo de códigos (cada motivo con su texto,
sin genéricos), las explicaciones del asistente y el tono general. Se conserva.

Tono definitivo: **castellano de España, de tú, en presente.** Frases cortas. La
app **no se disculpa** ("lo sentimos", "ups", "vaya") y **no se felicita**
("¡genial!", "¡perfecto!"). No usa "por favor" ni "debe". Dice qué pasa y qué
hacer.

## 6.1 · Textos que hay que cambiar

| Clave | Hoy | Propuesto | Por qué |
|---|---|---|---|
| `auth.bienvenida` | Bienvenido a Nexum | **Tu hogar, en una sola app** | "Bienvenido" excluye a la mitad de los usuarios. Y una bienvenida genérica no dice nada |
| `errores.unknown` | Algo no ha ido bien y no sé decirte qué. | **No hemos podido completarlo. Inténtalo otra vez.** | Que la app admita no saber qué pasa desconcierta. Y se solapa con `generico` |
| `errores.generico` | Algo no ha ido bien. Inténtalo otra vez. | **No hemos podido completarlo. Inténtalo otra vez.** | Se unifican los dos en uno |
| `onboarding.errorCrearDetalle` | No se ha podido crear la casa: {{detalle}} | **No hemos podido crear tu casa. Inténtalo otra vez.** (y el detalle técnico, a un desplegable "Ver detalle") | El detalle crudo es texto de programador. Útil de depurar, inútil de leer |
| `onboarding.errorCrear` | No se ha podido crear la casa. Inténtalo otra vez. | *(se fusiona con el anterior)* | Dos claves para lo mismo |
| `home.subtitle` | Tu hogar en armonía. | *(se elimina de la pantalla)* | Es un lema de folleto. Bajo el saludo, cada día, es relleno. Su sitio es la web |
| `codigos.canjearBoton` | Entrar | **Canjear el código** | "Entrar" suena a iniciar sesión |
| `codigos.canjeOk` | ¡Listo! Ya tienes acceso. | **Ya tienes acceso a «{{casa}}»** | Falta el dato importante: a qué casa |
| `codigos.crear` | Crear un código | Botón de la sección: **Invitar a alguien**<br>Botón del formulario: **Crear el código** | Hoy el mismo texto abre el formulario y lo envía |
| `codigos.revocar` | Desactivar | **Desactivar el código** | Sin objeto, en un diálogo, no se sabe qué se desactiva |
| `codigos.duracion` | ¿Cuánto tiempo será válido? | **¿Cuánto durará el acceso?** | Lo que caduca es el acceso, no el papel |
| `codigos.queRol` | ¿Qué podrá hacer? | **¿Qué podrá hacer en tu casa?** | Concreta el alcance |
| `miembros.expulsar` | Quitar de la casa | **Quitar a {{nombre}} de esta casa** | El diálogo tiene que nombrar a la persona |
| `miembros.soloAdmin` | Solo los propietarios y administradores pueden gestionar miembros. | *(se elimina)* | Lo que no puedes hacer, no se enseña. Y encima está en la sección equivocada |
| `dispositivos.anadir` | Añadir dispositivo | **Añadir mi primer dispositivo** (en el vacío) / **Añadir dispositivo** (en la lista) | En el vacío, "mi primer" marca que es el comienzo de algo |
| `auth.salir` | Cerrar sesión | Se mantiene, pero pasa a la Zona delicada y pide confirmación | — |
| `ajustes.casas` | Casas | **Tus casas** | Coherente con "Tu cuenta" |
| `ajustes.tengoCodigo` | Tengo un código de invitación | **Entrar en la casa de otra persona** | Describe la intención, no el objeto |
| `casas.nueva` | Casa nueva | **Crear una casa** | Coherente con `casas.crear`, que ya dice eso. Hoy hay dos textos para el mismo acto |
| `casas.borrarAviso` | Se borrarán también sus habitaciones, sus dispositivos y su historial. No se puede deshacer. | **Se borrarán sus {{habitaciones}} habitaciones, sus {{dispositivos}} dispositivos y todo su historial. {{personas}} perderán el acceso. Esto no se puede deshacer.** | Con números y nombres reales pesa. En abstracto, no. *(La clave existe y no se usa en ningún sitio)* |
| `onboarding.dispositivoNexi` | Ya está tu casa lista. Cuando tengas un aparato a mano, lo damos de alta. | **Tu casa ya está lista. Cuando tengas un aparato a mano, lo damos de alta.** | Orden natural en castellano |
| `auth.nexiBienvenida` | ¡Hola! Soy Nexi. Entra y preparamos tu hogar en un momento. | **Soy Nexi. Entra y preparamos tu casa en un momento.** | Sobra la exclamación; "hogar" es de folleto, la app dice "casa" en todas partes |
| `auth.nexiRegistro` | ¡Encantado! Con tu cuenta lista, montamos tu casa en tres pasos. | *(se elimina: en Crear cuenta ya no hay mascota)* | Una mascota por recorrido |
| `app.tagline` | Tu hogar, más simple. | Se mantiene, **solo** en la pantalla de bienvenida | Es el lema de marca, no un subtítulo reutilizable |

## 6.2 · Textos escritos a mano dentro de las pantallas

El proyecto tiene una regla explícita: *"ningún texto visible se escribe
directamente en una pantalla"*. Se incumple en tres sitios:

| Dónde | Texto | Clave nueva |
|---|---|---|
| `app/casas/[id].tsx` | `'¿Quieres borrar esta habitación?'` | `casas.borrarHabitacionAviso` |
| `app/perfil.tsx` | `'El correo no se puede cambiar desde aquí.'` | `ajustes.correoAyuda` |
| `ui/Placeholder.tsx` | `'Pendiente de implementar.'` | *(la pieza entera desaparece de la app)* |

## 6.3 · Textos que faltan

| Clave | Texto |
|---|---|
| `estados.errorCargar` | No hemos podido cargar esto. |
| `estados.sinConexion` | Sin conexión. Esto es lo último que sabemos. |
| `estados.sinActualizar` | Sin actualizar desde {{hora}} |
| `acciones.deshacer` | Deshacer |
| `acciones.renombrar` | Renombrar |
| `acciones.compartir` | Compartir |
| `acciones.invitar` | Invitar a alguien |
| `zonaDelicada.titulo` | Zona delicada |
| `avisos.perfilGuardado` | Nombre guardado. |
| `avisos.casaRenombrada` | Ahora se llama «{{nombre}}». |
| `avisos.casaBorrada` | Casa borrada. |
| `avisos.habitacionBorrada` | Habitación borrada. |
| `avisos.codigoDesactivado` | Código desactivado. |
| `avisos.miembroQuitado` | {{nombre}} ya no tiene acceso. |
| `avisos.rolCambiado` | {{nombre}} ahora es {{rol}}. |
| `avisos.salisteDeCasa` | Has salido de «{{casa}}». |
| `casas.confirmarNombre` | Escribe **{{nombre}}** para confirmarlo. |
| `casas.borrarBoton` | Borrar la casa para siempre |
| `casas.transferir` | Transferir la propiedad |
| `casas.ultimoPropietario` | Antes de salir, nombra propietario a otra persona. |
| `auth.verPassword` | Ver la contraseña |
| `auth.correoYaExiste` | Ya existe una cuenta con este correo. ¿Quieres iniciar sesión? |

## 6.4 · Claves que sobran

Escritas y sin usar en ninguna pantalla. O se usan al implementar la fase que
las necesita, o se borran para que el archivo no mienta sobre lo que hay hecho:

`casas.selector` · `codigos.titulo` · `codigos.compartir` · `codigos.usos` ·
`ajustes.acercaDe` · `home.myDevices` · `home.seeAll` · `home.automations` ·
`scenes.*` · `dispositivos.sinHabitacion` · `app.cargando` ·
`acciones.reintentar` *(se usará ya)* · todo el bloque `device.*` y `coolio.*`
*(legítimo: son de la fase 2)*

---

# 7 · Qué es imprescindible y qué es adorno

Para que la app **parezca de calidad**, hay que hacer esto y nada más. Lo demás
puede esperar.

## Imprescindible — sin esto no parece una app terminada

1. **Borrar, renombrar y salir de una casa.** Es el problema que se ha señalado,
   la mitad ya está programada y sin botón
2. **Tocar una fila abre, nunca borra.** Habitaciones, miembros y códigos.
   Corrige el fallo de interacción más peligroso que hay
3. **Un fallo de red nunca se dibuja como "no tienes nada".** Elimina la mentira
   de la app
4. **El aviso al pie**, con sus tres tonos y su Deshacer. Es una sola pieza y
   resuelve el silencio absoluto de hoy
5. **Salir del asistente y volver atrás dentro de él**
6. **Fuera las tarjetas de "Fase 3 · Pendiente de implementar"**, sustituidas por
   estados vacíos honestos
7. **Confirmar antes de cerrar sesión**; la regla de niveles aplicada a todo
8. **Un título, una vez.** Eliminar los cuatro títulos duplicados
9. **Cambiar el rol de un miembro.** También programado y sin botón
10. **Compartir un código con el menú del sistema**, y poder volver a ver su QR

Estos diez arreglan los diez problemas de la primera sección. Ninguno inventa
funciones nuevas: cierran lo que ya está empezado.

## Importante, pero después

- La casa activa en la cabecera de Inicio, mandando en todas las pestañas
- Reordenar Ajustes en tres bloques
- Pantallas de habitación y de ficha de miembro
- Escanear el QR con la cámara al canjear
- Tirar hacia abajo para recargar, en todas las listas
- Cambiar y borrar la contraseña y la cuenta
- Estados de carga con rectángulos grises en vez de ruedecitas

## Adorno — que no se haga ahora no rompe nada

- Modo oscuro
- Foto de perfil
- Reordenar casas y habitaciones
- Ponerle nombre a un código
- Ver el historial de accesos de cada persona
- Animaciones y transiciones
- Buscador
- Widgets, atajos, notificaciones enriquecidas

---

# 8 · La regla que resume todo el documento

**Todo lo que la app te deja crear, te tiene que dejar corregirlo y
deshacerlo. Y cada vez que haces algo, la app te dice qué ha pasado.**

Si una pantalla nueva incumple eso, la pantalla no está terminada, por bonita
que sea.

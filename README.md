<div align="center">

# Nexum

**Tu hogar, más simple.**

Una sola app para todos los dispositivos de casa.

</div>

---

## Qué es esto

Nexum es una app de gestión del hogar que funciona como **paraguas de módulos**.
Cada módulo controla una categoría de aparatos, tiene su propia cara y su propia
lógica, pero todos comparten cuenta, casas, habitaciones, permisos,
notificaciones y automatizaciones.

| Módulo | Categoría | Estado |
|---|---|---|
| **Coolio** | Climatización (splits de A/A por infrarrojos) | En construcción |
| **Plantico** | Riego de plantas de interior | Fase 2 — estructura preparada, sin implementar |
| Iluminación, Seguridad, Energía | — | Futuro |

El hardware es propio: placas ESP32, una por aparato controlado.

---

## Esta guía asume que no sabes programar

Y eso está bien. Se explica **qué instalar, en qué orden, qué deberías ver en
pantalla si todo fue bien y qué señal indica que algo falló**.

Si en algún punto la pantalla no se parece a lo descrito, **para ahí**. Seguir
adelante con un paso a medias es lo que convierte un problema pequeño en una
tarde perdida.

---

## Antes de empezar: cinco palabras

| Palabra | Qué significa |
|---|---|
| **Terminal** | La ventana negra donde se escriben órdenes. En Mac se llama *Terminal*; en Windows, *PowerShell* |
| **Repositorio** | Esta carpeta de archivos, con su historial de cambios |
| **Dependencias** | Código de otros que este proyecto necesita. Se descargan solas |
| **Variable de entorno** | Un dato de configuración (una clave, una dirección) que no se escribe dentro del código porque es secreto |
| **Backend** | La parte que vive en Internet: la base de datos y la lógica. Aquí, Supabase |

---

## Puesta en marcha

### Paso 1 — Instalar Node.js

Node.js es el motor que ejecuta todo esto.

1. Ve a **https://nodejs.org** y descarga la versión **LTS** (la de la izquierda).
2. Instálala dándole a "Siguiente" a todo.
3. Abre la terminal y escribe:

```bash
node --version
```

**Bien:** sale algo como `v22.11.0`. Cualquier número **20 o superior** vale.
**Mal:** sale `command not found`. La instalación no terminó o hay que cerrar y
volver a abrir la terminal.

---

### Paso 2 — Descargar el proyecto e instalar sus dependencias

```bash
git clone https://github.com/fmarquezarate-png/nexum.git
cd nexum
npm install
```

Tarda entre uno y tres minutos y escupe muchísimo texto. Es normal.

**Bien:** al final aparece algo como `added 1043 packages in 1m`.
**Mal:** aparecen líneas que empiezan por `npm ERR!`. Lee la primera; casi
siempre es que Node es demasiado antiguo.

> Los avisos que empiezan por `npm WARN` **no son errores**. Se ignoran.

---

### Paso 3 — Crear el proyecto en Supabase

Supabase es la base de datos en Internet. Plan gratuito de sobra para esto.

1. Entra en **https://supabase.com** y crea una cuenta.
2. **New project**. Ponle de nombre `nexum`.
3. Región: **West EU (Ireland)** o **Central EU (Frankfurt)**, las más cercanas.
4. Te pide una contraseña para la base de datos. **Guárdala en un sitio seguro**:
   no se puede recuperar.
5. Espera unos dos minutos mientras se crea.

---

### Paso 4 — Copiar las dos claves

En Supabase: tu proyecto → **Project Settings** → **API**. Hay dos datos que
necesitas:

| Dato | Aspecto |
|---|---|
| **Project URL** | `https://abcdefghij.supabase.co` |
| **anon public** | Un texto larguísimo que empieza por `eyJ...` |

> Verás también una clave llamada **service_role**. **Esa no se toca ahora.**
> Salta todas las protecciones de seguridad y solo puede vivir en un servidor,
> nunca dentro de la app del móvil. Más abajo se explica cuándo se usa.

Ahora, en la terminal, dentro de la carpeta `nexum`:

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Eso crea el archivo `apps/mobile/.env`. Ábrelo con cualquier editor de texto y
pega tus dos datos entre las comillas:

```
EXPO_PUBLIC_SUPABASE_URL="https://abcdefghij.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
```

Guarda y cierra.

> **Este archivo nunca se sube a GitHub.** Ya está bloqueado para que no pueda
> subirse por accidente.

---

### Paso 5 — Crear las tablas en la base de datos

```bash
npx supabase login
```

Se abre el navegador y das permiso. Luego:

```bash
npx supabase link --project-ref TU_REF
npx supabase db push
```

`TU_REF` es el código que aparece en la dirección de tu proyecto en Supabase:
`https://supabase.com/dashboard/project/` → **`abcdefghij`**

**Bien:** lista las migraciones aplicadas, sin rojo. Comprueba en Supabase →
**Table Editor** que aparecen `homes`, `devices`, `coolio_state`, `commands`…
**Mal:** cualquier línea roja. La más común es `relation already exists`: las
tablas ya estaban creadas.

---

### Paso 6 — Arrancar la app

```bash
npm run app
```

Aparece un **código QR** en la terminal.

**En tu móvil:** instala la app **Expo Go** (App Store o Google Play) y escanea
el QR. En iPhone se escanea con la cámara normal; en Android, desde dentro de
Expo Go.

**Bien:** en el móvil se abre Nexum con las cinco pestañas abajo — Inicio,
Dispositivos, Automatizaciones, Estadísticas, Ajustes — y tarjetas grises que
dicen qué falta por hacer en cada fase. **Eso es exactamente lo que debe verse
ahora mismo**: la estructura está montada, la lógica llega en las fases
siguientes.

**Mal:**

| Lo que ves | Qué pasa |
|---|---|
| Pantalla roja: "Faltan las claves de Supabase" | El paso 4 quedó a medias. Revisa el `.env` y **reinicia** el servidor |
| El móvil no encuentra el servidor | Móvil y ordenador tienen que estar en el **mismo WiFi** |
| Errores de versiones al arrancar | Ejecuta `npm run fix-versions --workspace apps/mobile` |

Para parar el servidor: `Ctrl + C` en la terminal.

---

## Qué hay en cada carpeta

```
nexum/
├── apps/mobile/          La app del móvil (iOS y Android, mismo código)
│   ├── app/              Las pantallas y su navegación
│   ├── core/             Lo COMÚN: cuentas, casas, permisos, dispositivos
│   ├── modules/          Lo PROPIO de cada módulo: coolio/, plantico/
│   ├── ui/               Colores, espaciados y piezas visuales compartidas
│   └── lib/              Conexión con Supabase, utilidades, textos
│
├── services/mqtt-bridge/ Servicio encendido 24/7 que escucha a los aparatos
│
├── supabase/             La base de datos
│   ├── migrations/       El esquema, en archivos SQL numerados
│   └── functions/        Los trocitos de backend
│
├── packages/
│   ├── contracts/        ⭐ FUENTE DE VERDAD del contrato con los aparatos
│   └── shared-types/     Tipos compartidos entre app y backend
│
├── firmware/             Contrato para el agente de firmware (aquí no se programa)
│
└── docs/                 La documentación de verdad
```

### Lo más importante de entender

**`core/` es el centro comercial. `modules/` son las tiendas.**

Todo lo que necesitarían también Plantico, Iluminación o Seguridad —cuentas,
casas, habitaciones, permisos, notificaciones— vive en `core/`. Lo que solo le
importa a un módulo, vive en su carpeta.

La prueba de que esto está bien hecho: **añadir Plantico debe consistir en
añadir carpetas y tablas, nunca en refactorizar el núcleo.**

---

## Documentación

Léelos en este orden:

| Documento | Qué explica |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | Cómo encajan las piezas y por qué. **Empieza por aquí** |
| [`docs/data-model.md`](docs/data-model.md) | Las tablas y por qué están así |
| [`docs/permissions.md`](docs/permissions.md) | Quién puede qué, y por qué la seguridad vive en la base de datos |
| [`docs/provisioning.md`](docs/provisioning.md) | Cómo se empareja un aparato nuevo |
| [`docs/adding-a-module.md`](docs/adding-a-module.md) | Cómo añadir Plantico sin romper nada |
| [`packages/contracts/`](packages/contracts/) | El contrato con los dispositivos |

---

## Estado del proyecto

| Fase | Qué incluye | Estado |
|---|---|---|
| **0 · Esqueleto** | Monorepo, esquema con RLS, contratos, app navegando | ✅ Hecho |
| **1 · Núcleo** | Registro, login, casas, habitaciones, miembros, códigos QR | ⬜ Siguiente |
| **2 · Coolio** | Emparejado real, comandos con auditoría, telemetría en vivo | ⬜ |
| **3 · Automatizaciones** | Horarios, umbrales, notificaciones, estadísticas | ⬜ |
| **4 · Plantico** | Riego. La prueba de que el núcleo está bien hecho | ⬜ |

**Lo que hay ahora:** toda la estructura, el esquema completo de la base de
datos con las reglas de seguridad activas, los contratos cerrados y la app
arrancando con sus cinco pestañas. Las pantallas están maquetadas con tarjetas
que indican qué falta y en qué fase llega. Las Edge Functions y el servicio
`mqtt-bridge` son esqueletos que devuelven "no implementado" a propósito.

---

## Dos reglas que no se rompen

**1. Ningún secreto entra en el repositorio.** Ni claves, ni contraseñas, ni
tokens. Los archivos `.env.example` listan qué hace falta, con el valor vacío y
la explicación de dónde sale cada cosa.

**2. El contrato manda sobre el código.** Si un topic MQTT o un campo de un
mensaje no está en `packages/contracts/`, no existe. Cualquier cambio se hace
ahí primero y luego se propaga a la app, al backend y al firmware.

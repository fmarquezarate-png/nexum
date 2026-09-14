# Despliegue web (Vercel)

La app se publica como **versión web** en Vercel. Cada push a `main` genera un
despliegue nuevo automáticamente.

Toda la configuración está en `vercel.json`, en la raíz del repositorio. Vercel
la lee de ahí y **manda sobre lo que haya en el panel web**: si algún día hay
que cambiar cómo se construye, se cambia el archivo y se sube.

Lo único que vive en el panel de Vercel son las **variables de entorno**
(`EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`), porque en el
repositorio no entra ninguna clave.

## Qué hace cada parte de `vercel.json`

### `rewrites` — y por qué la expresión es tan rara

```
"source": "/((?!_expo/|assets/|.*\\.).*)"
```

La app es una **SPA**: una sola página que cambia de pantalla sin recargar. El
servidor solo tiene un archivo real, `index.html`; rutas como `/casas` o
`/canjear` no existen como archivo. Por eso hace falta decirle a Vercel que a
esas rutas les sirva `index.html`, o recargar estando en `/casas` daría un 404.

**Pero la regla no puede tragárselo todo.** La versión anterior era
`"/(.*)"`, y provocó un fallo desagradable:

1. El navegador guarda `index.html`, que apunta a `entry-AAAA.js`.
2. Se publica una versión nueva. Ahora el archivo se llama `entry-BBBB.js`.
3. El navegador, con su copia vieja, pide `entry-AAAA.js`, que ya no existe.
4. Con la regla antigua, el servidor respondía `index.html`.
5. El navegador recibía **HTML donde esperaba JavaScript** → **pantalla en
   blanco**, sin ningún mensaje de error.

Un 404 habría sido evidente en dos minutos. Devolver HTML no falla: envenena.

Por eso la expresión excluye tres cosas, que deben dar 404 si no existen:

| Se excluye | Qué es |
|---|---|
| `_expo/` | El código compilado de la app |
| `assets/` | Imágenes: iconos, mascotas |
| `.*\.` | Cualquier ruta con extensión (`.js`, `.png`, `.ico`, `.json`) |

Las rutas de la app nunca llevan punto, así que la distinción es limpia.

### `headers` — para que no vuelva a pasar

| Qué | Cuánto se guarda | Por qué |
|---|---|---|
| `/_expo/static/*` | Un año, inmutable | Llevan un código único en el nombre: si cambia el contenido, cambia el nombre. Guardarlos para siempre no tiene riesgo |
| `/` y `/index.html` | Nunca | Es el archivo que dice **qué código cargar**. Si el navegador se queda con uno viejo, pide un archivo que ya no existe |

Esa es la raíz del problema: se cachea la página, no el código.

## Cuidado con "Instant Rollback"

En la pantalla **Overview** del proyecto, junto al botón **Visit**, hay un botón
**Instant Rollback**. Devuelve producción a una versión anterior.

Tiene un efecto que no es evidente: **después de un rollback, Vercel deja de
asignar producción automáticamente**. Los despliegues siguientes se construyen
bien, aparecen en verde como `Ready`... y no llegan nunca a la dirección
pública. Parece que los cambios no se publican, cuando en realidad sí se
publicaron pero nadie los promovió.

Si pasa, en Overview sale un aviso amarillo. Hay que hacer dos cosas:

1. Pulsar **`re-enable auto-assigning custom domains`** en el aviso.
2. En **Deployments**, en el despliegue de arriba: `···` → **Promote to Production**.

## Comprobar qué versión está publicada de verdad

Sin entrar en el panel:

1. Abrir la dirección de la app
2. Ver el código fuente de la página (Ctrl+U)
3. Buscar la línea `<script src="/_expo/static/js/web/entry-XXXX.js">`

Ese `XXXX` identifica la versión. Si no cambia después de publicar algo, es que
lo que ves no es lo último.

## Protección de acceso

En **Settings → Deployment Protection**, la opción **Vercel Authentication**
exige tener sesión de Vercel para abrir la app. Con ella activada, la app no se
puede abrir desde el móvil ni compartir con nadie: sale un muro de acceso.

Debe estar **desactivada**. No baja la seguridad del sistema: quien abra la
dirección solo ve la pantalla de inicio de sesión, y sin cuenta no ve ni un dato
(lo impiden las políticas RLS de la base de datos, no la app).

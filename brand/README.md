# brand/ — logos e identidad visual

## Para qué es esta carpeta

Aquí van los **archivos originales** de los logos. De ellos se generan después
todos los tamaños que necesitan iOS, Android y la web.

## Cómo subir los logos (sin terminal)

1. Entra a **https://github.com/fmarquezarate-png/nexum**
2. Abre la carpeta **`brand`** y luego **`originales`**
3. Botón **Add file** (arriba a la derecha) → **Upload files**
4. Arrastra los archivos
5. Abajo, botón verde **Commit changes**

## Qué archivos hacen falta

Lo ideal es **un archivo por logo**, cuadrado, en PNG con fondo transparente y
**1024 × 1024 px como mínimo**:

| Nombre del archivo | Qué es |
|---|---|
| `nexum-icono.png` | Solo el símbolo: la casa con la hoja dentro |
| `coolio-icono.png` | Solo el símbolo: las tres ondas |
| `plantico-icono.png` | Solo el símbolo: la gota sobre las hojas |
| `nexum-completo.png` | Símbolo + la palabra "Nexum" + el lema |
| `coolio-completo.png` | Símbolo + "Coolio" + el lema |
| `plantico-completo.png` | Símbolo + "Plantico" + el lema |

**Si no los tienes separados**, sube lo que tengas —aunque sea la imagen con los
tres juntos— con el nombre `logos-originales.png`. Se recortan después.

### Por qué 1024 × 1024 como mínimo

De ese archivo salen todos los tamaños: el icono de la app en el móvil, el de
la tienda, el favicon del navegador, la pantalla de carga. Agrandar una imagen
pequeña la deja borrosa y no tiene arreglo; encoger una grande sale perfecto.

### Por qué el símbolo aparte del logo completo

Son dos usos distintos y no se pueden sustituir:

- **El símbolo solo** va en el icono de la app: ahí se ve a 60 píxeles y un
  texto no se leería.
- **El logo completo** va en la pantalla de bienvenida y en la cabecera, donde
  sí hay sitio para la palabra y el lema.

## Qué se generará a partir de ellos

| Destino | Tamaño |
|---|---|
| Icono de iOS y Android | 1024 × 1024 |
| Icono adaptativo de Android | 1024 × 1024, con margen de seguridad |
| Favicon del navegador | 48 × 48 |
| Pantalla de carga (splash) | logo completo sobre fondo crema `#F5F2EC` |

Los colores de la marca ya están recogidos como código en
`apps/mobile/ui/tokens.ts`, tomados de estos logos.

---

## Lo que ya está generado

A partir de `originales/`, extraído automáticamente detectando los bloques por
el canal de transparencia (no a ojo):

### `iconos/` — solo el símbolo, 1024 × 1024, opacos

| Archivo | Fondo |
|---|---|
| `nexum-icono.png` | crema `#F2EFE6` |
| `coolio-icono.png` | azul claro `#DFEFFA` |
| `plantico-icono.png` | crema `#F4F1EA` |

Van **sin transparencia** a propósito: el icono de una app de iOS no puede
llevar canal alfa, la App Store lo rechaza.

### `completos/` — símbolo + palabra + lema

A resolución nativa, con transparencia. Para cabeceras y pantallas de bienvenida.

### `apps/mobile/assets/` — lo que consume la app

| Archivo | Tamaño | Dónde se ve |
|---|---|---|
| `icon.png` | 1024 × 1024 | Icono en iOS y Android |
| `adaptive-icon.png` | 1024 × 1024 | Icono adaptativo de Android |
| `favicon.png` | 48 × 48 | Pestaña del navegador |
| `splash.png` | 2048 × 2048 | Pantalla de carga |

**Sobre el icono adaptativo de Android:** Android recorta el 33 % exterior del
icono para poder darle forma de círculo, cuadrado o gota según el móvil. Por eso
el símbolo va reducido al 66 % central, sobre fondo transparente, y el color de
relleno se declara aparte en `app.json`. Si se pusiera el símbolo a tamaño
completo, en muchos móviles saldría cortado.

## Limitación conocida del material actual

Los símbolos venían a **440 × 440 px** dentro de la imagen original, y se han
ampliado a 1024 para cumplir el mínimo de las tiendas. En el móvil se ven bien
(ahí el icono se muestra a 60-180 px), pero **en la ficha de la App Store, que
lo muestra grande, se notarán algo blandos**.

No es urgente y no bloquea nada. Antes de publicar en las tiendas conviene
conseguir los símbolos a 1024 px reales, o redibujarlos como vector. Mientras
tanto, lo que hay sirve perfectamente.

---

## Las mascotas

Una por marca. Están en `originales/mascotas-originales.png`.

| Mascota | Marca | Qué es | Su frase |
|---|---|---|---|
| **Nexi** | Nexum | Robotito blanco con un brote en la cabeza | *"Siempre contigo. Un hogar más simple."* |
| **Airi** | Coolio | Nubecita con un remolino de aire | *"Tu clima, donde estés."* |
| **Broti** | Plantico | Brote con hojas | *"Plantas felices, personas más felices."* |

### Para qué se van a usar

No son decoración suelta: resuelven los momentos en los que una pantalla vacía
resulta fría o confusa.

| Dónde | Quién aparece |
|---|---|
| Asistente de alta de casa | **Nexi**, guiando cada paso |
| "Todavía no tienes dispositivos" | **Nexi** |
| Pantalla de un aire sin configurar | **Airi** |
| Plantico, cuando llegue | **Broti** |
| Errores con los que no se puede hacer nada | **Nexi** |

### Qué falta para poder usarlas

**La imagen actual no sirve para meterla en la app.** Las tres mascotas están
sobre una foto de una habitación, con sombras y plantas de fondo. Recortarlas
automáticamente saldría mal: son blancas sobre una mesa blanca, así que ningún
recorte por color las separa bien.

Hace falta **un archivo por mascota, con fondo transparente**, PNG, mínimo
1024 px de alto. Se suben a `originales/` con estos nombres:

- `nexi.png`
- `airi.png`
- `broti.png`

Mientras no estén, la app funciona igual: los huecos donde irían quedan con el
texto, sin el dibujo.

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
